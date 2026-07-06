-- BUG-4: share_ticket 수량 검증 TOCTOU 방지
-- 주문 행을 for update로 잠가 동일 주문에 대한 동시 공유 요청을 직렬화
-- 변경: v_order_qty 조회 select에 for update 추가 (나머지 로직 동일)

create or replace function public.share_ticket(p_order_id uuid, p_shared_with uuid, p_quantity integer)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_me uuid := auth.uid();
  v_order_qty int; v_already int; v_is_friend int;
  v_my_name text; v_title text; v_share_id uuid;
begin
  if v_me is null then return json_build_object('error','로그인이 필요합니다'); end if;
  if p_quantity < 1 then return json_build_object('error','공유 수량이 올바르지 않습니다'); end if;

  select quantity into v_order_qty from public.orders
  where order_id = p_order_id and user_id = v_me and status = 'paid'
  for update;
  if v_order_qty is null then return json_build_object('error','공유할 수 없는 예매입니다'); end if;

  select count(*) into v_is_friend from public.friend
  where status = 'accepted'
    and ((requester_id = v_me and addressee_id = p_shared_with)
      or (requester_id = p_shared_with and addressee_id = v_me));
  if v_is_friend = 0 then return json_build_object('error','친구에게만 공유할 수 있습니다'); end if;

  select coalesce(sum(quantity),0) into v_already from public.ticket_share
  where order_id = p_order_id and sharer_id = v_me and status in ('pending','accepted');

  if v_already + p_quantity > v_order_qty - 1 then
    return json_build_object('error','공유 가능한 티켓 수를 초과했습니다 (최소 1매는 본인 보유)');
  end if;

  insert into public.ticket_share (order_id, sharer_id, shared_with, quantity, status)
  values (p_order_id, v_me, p_shared_with, p_quantity, 'pending')
  returning share_id into v_share_id;

  select name into v_my_name from public.users where id = v_me;
  select e.title into v_title from public.orders o
  join public.event e on e.event_id = o.event_id where o.order_id = p_order_id;

  insert into public.notification (user_id, type, title, link, ref_id)
  values (p_shared_with, 'ticket_share',
    coalesce(v_my_name,'회원') || '님이 ' || coalesce(v_title,'공연') || ' 티켓을 공유했습니다',
    '/mypage/reservations?filter=shared', v_share_id);

  return json_build_object('success', true);
end; $function$;
