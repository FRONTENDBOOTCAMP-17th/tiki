-- 정산 반려 기능
-- 관리자가 정산 신청을 반려(status='rejected')하고 사유를 남길 수 있게 한다.
-- 반려된 신청은 기간 중복 방지 unique 인덱스에서 제외해 판매자가 같은
-- 기간을 다시 신청할 수 있도록 한다.

alter table public.settlement_request
  add column if not exists reject_reason text;

alter table public.settlement_request
  drop constraint if exists settlement_request_status_check;

alter table public.settlement_request
  add constraint settlement_request_status_check
  check (status = any (array['requested', 'approved', 'rejected']));

drop index if exists idx_settlement_request_seller_period_unique;

-- 반려(rejected)된 행은 재신청을 막지 않도록 부분 유니크 인덱스로 교체
create unique index if not exists idx_settlement_request_seller_period_unique
  on public.settlement_request(seller_id, period_start, period_end)
  where status <> 'rejected';
