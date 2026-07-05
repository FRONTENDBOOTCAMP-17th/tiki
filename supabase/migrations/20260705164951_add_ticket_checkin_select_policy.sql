-- BUG-1 프론트 지원: 본인 주문의 체크인 이력 조회 허용
-- (쓰기는 기존대로 SECURITY DEFINER RPC(checkin_ticket) 전용 유지)
create policy "select_own_order_checkins"
on public.ticket_checkin
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.order_id = ticket_checkin.order_id
      and o.user_id = auth.uid()
  )
  or exists (
    select 1 from public.ticket_share ts
    where ts.share_id = ticket_checkin.subject_id
      and ticket_checkin.subject_type = 'share'
      and ts.shared_with = auth.uid()
  )
);
