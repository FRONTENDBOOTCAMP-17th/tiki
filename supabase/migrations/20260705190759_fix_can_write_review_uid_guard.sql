-- BUG-3: can_write_review 임의 p_user_id 조회 차단
-- SECURITY DEFINER 함수가 PostgREST RPC로 직접 호출될 때 타 유저의
-- 예매/공유 수령 여부를 불리언으로 유추할 수 있던 표면을 제거
-- 시그니처는 유지 (review 테이블 RLS 정책 2개가 3-인자 형태로 의존 중)
-- 변경: 최상단에 p_user_id = auth.uid() 가드 추가 — 타인 UUID 조회는 무조건 false

create or replace function public.can_write_review(p_user_id uuid, p_event_id uuid, p_order_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select p_user_id = auth.uid()
  and (
    exists (
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
    )
  );
$function$;
