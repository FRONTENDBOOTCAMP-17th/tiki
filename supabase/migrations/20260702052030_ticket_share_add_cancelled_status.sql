-- ticket_share.status에 'cancelled' 추가
-- 기존: pending / accepted / rejected
-- 문제: 받은 사람이 직접 거절한 것(rejected)과, 공유자의 예매 취소로 무효화된 것을 구분 못 함.
-- 추가: 'cancelled' = 공유자 예매 취소 또는 공유자의 능동적 회수로 무효화된 상태.
--       받은 사람에게 "공연/티켓이 회수되었습니다" 안내를 주기 위한 구분.

alter table public.ticket_share drop constraint ticket_share_status_check;

alter table public.ticket_share add constraint ticket_share_status_check
  check (status = any (array['pending'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text]));
