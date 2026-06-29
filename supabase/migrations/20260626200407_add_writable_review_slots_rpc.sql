-- 리뷰 작성 가능한 회차(주문) 조회: 직접 예매 + 공유받아 수락한 티켓 (공연 종료 & 미작성)
create or replace function public.get_writable_review_slots(p_event_id uuid)
 returns table(order_id uuid, slot_date date, slot_start_time text)
 language sql security definer set search_path to 'public'
as $$
  with eligible as (
    select o.order_id, o.slot_id, o.created_at
    from public.orders o
    where o.user_id = auth.uid() and o.event_id = p_event_id and o.status = 'paid'
    union
    select o.order_id, o.slot_id, o.created_at
    from public.ticket_share ts
    join public.orders o on o.order_id = ts.order_id
    where ts.shared_with = auth.uid()
      and ts.status = 'accepted'
      and o.event_id = p_event_id
      and o.status = 'paid'
  )
  select el.order_id, s.date, s.start_time::text
  from eligible el
  join public.slot s on s.slot_id = el.slot_id
  where ((s.date + s.end_time) at time zone 'Asia/Seoul') <= now()
    and not exists (
      select 1 from public.review r
      where r.order_id = el.order_id and r.user_id = auth.uid()
    )
  order by el.created_at desc;
$$;
