-- get_shared_quantity
-- 특정 주문(order)에 대해 현재 유저가 이미 공유한 티켓 수량을 반환.
-- rejected(거절) 상태는 잠금 계산에서 제외 → pending·accepted만 합산.
-- ShareTicketModal에서 남은 공유 가능 수량 계산 및 "이미 모두 공유" 처리에 사용.

create or replace function public.get_shared_quantity(p_order_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  select coalesce(sum(quantity), 0)::int
  from public.ticket_share
  where order_id = p_order_id
    and sharer_id = auth.uid()
    and status <> 'rejected';
$$;

revoke all on function public.get_shared_quantity(uuid) from public;
grant execute on function public.get_shared_quantity(uuid) to authenticated;
