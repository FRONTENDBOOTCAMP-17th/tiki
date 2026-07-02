-- cancel_order: 예매 취소 시 공유 티켓 무효화 + 받은 사람 회수 알림
-- 기존: order를 cancelled로 바꾸고 재고 복구 + review/order_seat 삭제만 수행.
--       이미 공유한 ticket_share 행은 그대로 살아있어, 받은 사람 화면에서
--       get_my_received_tickets(o.status='paid' 조건)로 조용히 사라지기만 했음.
-- 추가: 취소된 order의 살아있는 공유(pending/accepted)를 'cancelled'로 바꾸고,
--       받은 사람에게 회수 안내 알림 발송. pending 상태로 남은 수락/거절 알림은 제거.
--       링크는 받은 티켓 탭(?filter=shared)으로 연결.

create or replace function public.cancel_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_grade uuid;
  v_qty int;
  v_canceller_name text;
  v_title text;
  v_share record;
begin
  if v_uid is null then
    return false;
  end if;

  update orders o
     set status = 'cancelled'
   where o.order_id = p_order_id
     and o.status <> 'cancelled'
     and (
       o.user_id = v_uid
       or exists (
         select 1 from event e
         where e.event_id = o.event_id and e.seller_id = v_uid::text
       )
     )
  returning o.ticket_grade_id, o.quantity into v_grade, v_qty;

  if not found then
    return false;
  end if;

  delete from review where order_id = p_order_id;
  delete from order_seat where order_id = p_order_id;

  if v_grade is not null then
    update ticket_grade set quantity = quantity + v_qty where grade_id = v_grade;
  end if;

  -- 공유 무효화 + 받은 사람 알림 (살아있는 공유: pending / accepted)
  select name into v_canceller_name from public.users where id = v_uid;
  select e.title into v_title
  from public.orders o
  join public.event e on e.event_id = o.event_id
  where o.order_id = p_order_id;

  for v_share in
    select share_id, shared_with
    from public.ticket_share
    where order_id = p_order_id
      and status in ('pending', 'accepted')
  loop
    update public.ticket_share
    set status = 'cancelled'
    where share_id = v_share.share_id;

    -- 받은 사람에게 남아있는 수락/거절 대기 알림 제거
    delete from public.notification
    where ref_id = v_share.share_id and type = 'ticket_share' and user_id = v_share.shared_with;

    -- 회수 안내 알림
    insert into public.notification (user_id, type, title, link, ref_id)
    values (
      v_share.shared_with, 'order',
      coalesce(v_canceller_name, '회원') || '님이 예매를 취소하여 공유받은 '
        || coalesce(v_title, '공연') || ' 티켓이 회수되었습니다',
      '/mypage/reservations?filter=shared', v_share.share_id
    );
  end loop;

  return true;
end;
$function$;
