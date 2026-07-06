-- BUG-2: send_friend_request 이메일 매칭 대소문자 정규화
-- invite_event_staff와 동일하게 저장값·입력값 양쪽 lower() 비교로 통일
-- 변경: where email = lower(trim(p_email)) → where lower(email) = lower(trim(p_email))

create or replace function public.send_friend_request(p_email text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_me uuid := auth.uid();
  v_target uuid;
  v_my_name text;
  v_exists int;
  v_friend_id uuid;
begin
  if v_me is null then
    return json_build_object('error', '로그인이 필요합니다');
  end if;

  select id into v_target from public.users
  where lower(email) = lower(trim(p_email)) limit 1;

  if v_target is null then
    return json_build_object('error', '가입되지 않은 이메일입니다');
  end if;

  if v_target = v_me then
    return json_build_object('error', '본인에게는 요청할 수 없습니다');
  end if;

  select count(*) into v_exists from public.friend
  where (requester_id = v_me and addressee_id = v_target)
     or (requester_id = v_target and addressee_id = v_me);

  if v_exists > 0 then
    return json_build_object('error', '이미 친구이거나 요청 중입니다');
  end if;

  insert into public.friend (requester_id, addressee_id, status)
  values (v_me, v_target, 'pending')
  returning friend_id into v_friend_id;

  select name into v_my_name from public.users where id = v_me;

  insert into public.notification (user_id, type, title, link, ref_id)
  values (
    v_target,
    'friend_request',
    coalesce(v_my_name, '회원') || '님이 친구 요청을 보냈습니다',
    '/mypage/friends',
    v_friend_id
  );

  return json_build_object('success', true);
end;
$function$;
