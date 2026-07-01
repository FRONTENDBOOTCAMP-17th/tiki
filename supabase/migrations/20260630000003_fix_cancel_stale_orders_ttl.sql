-- cancel_stale_orders TTL 불일치 수정
-- 문제: 좌석 기반 주문은 held_until = now() + 15분으로 홀드를 기록하는데,
--       cancel_stale_orders는 created_at 기준 30분으로 만료를 판단해
--       held_until이 지났어도 좌석이 최대 30분까지 안 풀리는 UX 혼선 발생.
-- 수정: 좌석 기반 주문(order_seat 레코드 존재)은 held_until < now() 기준으로,
--       수량 기반 주문(order_seat 없음)은 기존 created_at 기준으로 분리 처리.

create or replace function public.cancel_stale_orders(p_ttl_minutes int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  with stale as (
    update orders o
       set status = 'cancelled'
     where o.status = 'ordered'
       and (
         -- 좌석 기반 주문: order_seat.held_until 만료 기준
         exists (
           select 1 from order_seat os
           where os.order_id = o.order_id
             and os.held_until < now()
         )
         or
         -- 수량 기반 주문: order_seat 없이 created_at 기준
         (
           not exists (select 1 from order_seat os where os.order_id = o.order_id)
           and o.created_at < now() - (p_ttl_minutes || ' minutes')::interval
         )
       )
    returning o.order_id, o.ticket_grade_id, o.quantity
  ),
  to_restock as (
    select ticket_grade_id, sum(quantity) as qty
    from stale
    where ticket_grade_id is not null
    group by ticket_grade_id
  ),
  restocked as (
    update ticket_grade tg
       set quantity = tg.quantity + r.qty
      from to_restock r
     where tg.grade_id = r.ticket_grade_id
    returning 1
  ),
  released_seats as (
    delete from order_seat
     where order_id in (select order_id from stale)
    returning 1
  )
  select count(*) into v_count from stale;

  return v_count;
end;
$$;
