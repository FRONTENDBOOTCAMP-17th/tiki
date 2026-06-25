-- 친구 기능: friend 테이블 + RLS + RPC + notification.ref_id 컬럼
-- (요청 → 알림 → 수락/거절 → 목록 → 삭제)

-- ============================================================
-- notification.ref_id (친구 요청 알림이 어떤 friend 행을 가리키는지)
-- ============================================================
alter table public.notification add column if not exists ref_id uuid;

-- ============================================================
-- friend 테이블
-- ============================================================
create table if not exists public.friend (
  friend_id    uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  addressee_id uuid not null references public.users(id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friend enable row level security;

create policy "friend select own"
  on public.friend for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friend insert own"
  on public.friend for insert to authenticated
  with check (auth.uid() = requester_id);

create policy "friend update addressee"
  on public.friend for update to authenticated
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id);

create policy "friend delete own"
  on public.friend for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ============================================================
-- notification 본인 알림 삭제 정책 (알림 X 버튼)
-- ============================================================
create policy "notification delete own"
  on public.notification for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- RPC: 이메일로 유저 찾기 (RLS 우회, id·name만)
-- ============================================================
create or replace function public.find_user_by_email(p_email text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select id, name
  from public.users
  where email = lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.find_user_by_email(text) from public;
grant execute on function public.find_user_by_email(text) to authenticated;

-- ============================================================
-- RPC: 친구 요청 보내기 (검증 + friend insert + 알림)
-- ============================================================
create or replace function public.send_friend_request(p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
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
  where email = lower(trim(p_email)) limit 1;

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
$$;

revoke all on function public.send_friend_request(text) from public;
grant execute on function public.send_friend_request(text) to authenticated;

-- ============================================================
-- RPC: 친구 요청 수락 (status accepted + 알림 정리 + 요청자 알림)
-- ============================================================
create or replace function public.accept_friend_request(p_friend_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_requester uuid;
  v_my_name text;
begin
  if v_me is null then
    return json_build_object('error', '로그인이 필요합니다');
  end if;

  update public.friend
  set status = 'accepted'
  where friend_id = p_friend_id
    and addressee_id = v_me
    and status = 'pending'
  returning requester_id into v_requester;

  delete from public.notification
  where ref_id = p_friend_id and type = 'friend_request' and user_id = v_me;

  if v_requester is not null then
    select name into v_my_name from public.users where id = v_me;
    insert into public.notification (user_id, type, title, link, ref_id)
    values (
      v_requester,
      'friend',
      coalesce(v_my_name, '회원') || '님이 친구 요청을 수락했습니다',
      '/mypage/friends',
      p_friend_id
    );
  end if;

  return json_build_object('success', true);
end;
$$;

revoke all on function public.accept_friend_request(uuid) from public;
grant execute on function public.accept_friend_request(uuid) to authenticated;

-- ============================================================
-- RPC: 친구 요청 거절 (friend 삭제 + 알림 정리, 요청자 알림 없음)
-- ============================================================
create or replace function public.reject_friend_request(p_friend_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    return json_build_object('error', '로그인이 필요합니다');
  end if;

  delete from public.friend
  where friend_id = p_friend_id
    and addressee_id = v_me
    and status = 'pending';

  delete from public.notification
  where ref_id = p_friend_id and type = 'friend_request' and user_id = v_me;

  return json_build_object('success', true);
end;
$$;

revoke all on function public.reject_friend_request(uuid) from public;
grant execute on function public.reject_friend_request(uuid) to authenticated;

-- ============================================================
-- RPC: 내 친구 목록 (상대 정보 + 함께 간 공연 수)
-- ============================================================
create or replace function public.get_my_friends()
returns table (
  friend_id   uuid,
  user_id     uuid,
  name        text,
  email       text,
  avatar_url  text,
  meet_count  bigint
)
language sql
security definer
set search_path = public
as $$
  select
    f.friend_id,
    u.id as user_id,
    u.name,
    u.email,
    u.avatar_url,
    (
      select count(distinct o1.event_id)
      from public.orders o1
      join public.orders o2 on o1.event_id = o2.event_id
      where o1.user_id = auth.uid()
        and o2.user_id = u.id
        and o1.status = 'paid'
        and o2.status = 'paid'
    ) as meet_count
  from public.friend f
  join public.users u
    on u.id = case
      when f.requester_id = auth.uid() then f.addressee_id
      else f.requester_id
    end
  where f.status = 'accepted'
    and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  order by u.name;
$$;

revoke all on function public.get_my_friends() from public;
grant execute on function public.get_my_friends() to authenticated;
