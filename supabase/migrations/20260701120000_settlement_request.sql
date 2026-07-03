-- 정산 신청/승인 테이블
-- 판매자가 '정산 신청'을 누르면 아직 정산받지 않은 달~지난달 범위로
-- settlement_request 1행이 생성되고(status='requested'), 관리자가 승인하면
-- status='approved'가 된다. gross/fee/net은 신청 시점의 금액 스냅샷이다.
--
-- 이 파일은 새 테이블 하나와 그 전용 정책만 만들며 기존 객체는 건드리지 않는다.
-- if not exists / drop policy if exists 로 감싸 두 번 실행해도 안전하다(idempotent).

create table if not exists public.settlement_request (
  settlement_id uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.users(id) on delete cascade,
  period_start  text not null,  -- 신청 범위 시작월 (YYYY-MM)
  period_end    text not null,  -- 신청 범위 끝월 (YYYY-MM, = 지난달)
  gross         bigint not null default 0,
  fee           bigint not null default 0,
  net           bigint not null default 0,
  status        text not null default 'requested'
                  check (status = any (array['requested','approved'])),
  requested_at  timestamptz not null default now(),
  approved_at   timestamptz
);

create index if not exists idx_settlement_seller  on public.settlement_request(seller_id);
create index if not exists idx_settlement_status  on public.settlement_request(status);

-- RLS
alter table public.settlement_request enable row level security;

-- 본인(판매자) 정산 신청 조회
drop policy if exists "settlement_select_own" on public.settlement_request;
create policy "settlement_select_own" on public.settlement_request
  for select using (auth.uid() = seller_id);

-- 본인(판매자) 정산 신청 생성
drop policy if exists "settlement_insert_own" on public.settlement_request;
create policy "settlement_insert_own" on public.settlement_request
  for insert with check (auth.uid() = seller_id);

-- 관리자 전체 조회
drop policy if exists "settlement_select_admin" on public.settlement_request;
create policy "settlement_select_admin" on public.settlement_request
  for select using (
    exists (select 1 from public.users u
            where u.id = auth.uid() and u.role = 'admin')
  );

-- 관리자 승인(update)
drop policy if exists "settlement_update_admin" on public.settlement_request;
create policy "settlement_update_admin" on public.settlement_request
  for update using (
    exists (select 1 from public.users u
            where u.id = auth.uid() and u.role = 'admin')
  );
