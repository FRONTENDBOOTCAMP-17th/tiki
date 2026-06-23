-- 홈 "전체 예매 랭킹" 집계용 RPC
-- orders는 본인 주문만 보이는 RLS가 걸려 있지만, 홈 랭킹에는 event_id별
-- 누적 수량(집계값)만 필요하므로 SECURITY DEFINER 함수로 RLS를 우회해
-- 집계만 anon/authenticated에 공개한다. 개별 주문 행은 여전히 가려진다.

create or replace function public.event_booking_counts()
returns table (event_id uuid, total_quantity bigint)
language sql
security definer
set search_path = public
as $$
  select event_id, sum(quantity)::bigint as total_quantity
  from orders
  group by event_id;
$$;

grant execute on function public.event_booking_counts() to anon, authenticated;
