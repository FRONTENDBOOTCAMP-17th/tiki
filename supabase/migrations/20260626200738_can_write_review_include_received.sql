-- 리뷰 작성 권한(RLS에서 사용): 직접 예매 + 공유받아 수락한 티켓도 허용
create or replace function public.can_write_review(p_user_id uuid, p_event_id uuid, p_order_id uuid)
 returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (
    -- ① 직접 예매
    select 1 from public.orders o
    join public.slot s on s.slot_id = o.slot_id
    where o.user_id = p_user_id and o.event_id = p_event_id and o.order_id = p_order_id
      and o.status = 'paid'
      and ((s.date + s.end_time) at time zone 'Asia/Seoul') <= now()
  )
  or exists (
    -- ② 공유받아 수락
    select 1 from public.ticket_share ts
    join public.orders o on o.order_id = ts.order_id
    join public.slot s on s.slot_id = o.slot_id
    where ts.shared_with = p_user_id and ts.order_id = p_order_id
      and ts.status = 'accepted'
      and o.event_id = p_event_id and o.status = 'paid'
      and ((s.date + s.end_time) at time zone 'Asia/Seoul') <= now()
  );
$$;
