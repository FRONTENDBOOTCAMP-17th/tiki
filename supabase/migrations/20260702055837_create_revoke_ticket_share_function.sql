-- revoke_ticket_share: 보낸 사람이 능동적으로 공유 회수
-- 공유자(sharer)가 자신이 보낸 공유를 회수. pending(미응답)/accepted(수락됨) 둘 다 회수 가능.
-- 동작: 해당 공유를 'cancelled'로 변경 + 받은 사람에게 회수 알림.
--       원주문(order)은 살아있으므로 get_shared_quantity가 cancelled를 제외하여
--       남은 공유 가능 수량이 자동 복구됨 (별도 재고/수량 처리 불필요).
--       rejected/이미 cancelled된 공유는 status 조건으로 자동 차단.

create or replace function public.revoke_ticket_share(p_share_id uuid)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_me uuid := auth.uid();
  v_shared_with uuid;
  v_my_name text;
  v_title text;
begin
  if v_me is null then return json_build_object('error','로그인이 필요합니다'); end if;

  -- 본인이 보낸 살아있는 공유(pending/accepted)만 회수 가능
  update public.ticket_share
  set status = 'cancelled'
  where share_id = p_share_id
    and sharer_id = v_me
    and status in ('pending', 'accepted')
  returning shared_with into v_shared_with;

  if v_shared_with is null then
    return json_build_object('error','회수할 수 없는 공유입니다');
  end if;

  -- 받은 사람에게 남아있는 수락/거절 대기 알림 제거
  delete from public.notification
  where ref_id = p_share_id and type = 'ticket_share' and user_id = v_shared_with;

  -- 회수 안내 알림
  select name into v_my_name from public.users where id = v_me;
  select e.title into v_title
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  where ts.share_id = p_share_id;

  insert into public.notification (user_id, type, title, link, ref_id)
  values (
    v_shared_with, 'order',
    coalesce(v_my_name, '회원') || '님이 공유했던 '
      || coalesce(v_title, '공연') || ' 티켓을 회수했습니다',
    '/mypage/reservations?filter=shared', p_share_id
  );

  return json_build_object('success', true);
end;
$function$;

revoke all on function public.revoke_ticket_share(uuid) from public;
grant execute on function public.revoke_ticket_share(uuid) to authenticated;
