-- 결제 위젯 이탈(탭 강제 종료 등 콜백 없이 끝나는 경우) 시
-- 'ordered' 상태로 영원히 남는 주문을 주기적으로 자동 취소하는 배치.
-- pg_cron으로 cancel_stale_orders()를 주기 실행하고, cron 자체 실행 로그도 주기적으로 비운다.

create extension if not exists pg_cron;

-- ============================================================
-- TTL 지난 'ordered' 주문을 일괄 취소 + 재고 복구
-- (같은 ticket_grade를 가진 여러 주문이 동시에 만료되어도 정확히 합산 복구되도록
--  grade_id 기준으로 그룹화한 뒤 한 번에 더해준다)
-- ============================================================
create or replace function public.cancel_stale_orders(p_ttl_minutes int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  with stale as (
    update orders o
       set status = 'cancelled'
     where o.status = 'ordered'
       and o.created_at < now() - (p_ttl_minutes || ' minutes')::interval
    returning o.ticket_grade_id, o.quantity
  ),
  to_restock as (
    select ticket_grade_id, sum(quantity) as qty
    from stale
    group by ticket_grade_id
  ),
  restocked as (
    update ticket_grade tg
       set quantity = tg.quantity + r.qty
      from to_restock r
     where tg.grade_id = r.ticket_grade_id
    returning 1
  )
  select count(*) into v_count from stale;

  return v_count;
end;
$$;

-- ============================================================
-- 10분마다: 30분 넘게 결제 미완료(ordered)인 주문 자동 취소
-- ============================================================
select cron.schedule(
  'cleanup-stale-orders',
  '*/10 * * * *',
  $$ select public.cancel_stale_orders(30); $$
);

-- ============================================================
-- 매일 04:00(UTC): pg_cron 자체 실행 로그(cron.job_run_details) 7일 지난 것 삭제
-- 정리하지 않으면 무료 플랜 DB 용량(500MB)을 잠식할 수 있음
-- ============================================================
select cron.schedule(
  'cleanup-cron-job-logs',
  '0 4 * * *',
  $$ delete from cron.job_run_details where end_time < now() - interval '7 days'; $$
);
