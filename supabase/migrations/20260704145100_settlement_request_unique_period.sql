-- 정산 신청 기간 중복 방지
-- 같은 판매자가 같은 정산 기간을 동시에 여러 번 신청하지 못하게 DB에서 한 번 더 막는다.

create unique index if not exists idx_settlement_request_seller_period_unique
  on public.settlement_request(seller_id, period_start, period_end);
