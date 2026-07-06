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

  -- [BUG-1 가드 ①] 공연 종료 후 취소 차단
  if exists (
    select 1
    from orders o
    join slot s on s.slot_id = o.slot_id
    where o.order_id = p_order_id
      and ((s.date + s.end_time) at time zone 'Asia/Seoul') <= now()
  ) then
    return false;
  end if;

  -- [BUG-1 가드 ②] 체크인 이력(본인분/공유분) 있으면 취소 차단
  if exists (
    select 1 from ticket_checkin where order_id = p_order_id
  ) then
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

    delete from public.notification
    where ref_id = v_share.share_id and type = 'ticket_share' and user_id = v_share.shared_with;

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