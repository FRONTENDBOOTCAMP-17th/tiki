-- get_shared_quantity: 집계 대상을 pending/accepted로 한정
-- 기존: status <> 'rejected' (rejected만 제외)
-- 변경: status in ('pending','accepted')
--       cancelled(예매 취소 무효화 또는 능동 회수)된 공유도 집계에서 제외해,
--       회수 후 남은 공유 가능 수량이 정확히 복구되도록 함.

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
    and status in ('pending', 'accepted');
$$;
