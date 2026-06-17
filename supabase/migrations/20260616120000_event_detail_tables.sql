-- 이벤트 상세페이지용 테이블 추가 (auth 무관 파트)
-- event 컬럼 보강 + slot(회차).
-- review(관람 후기) / bookmark(찜) 은 auth.uid() 기반 권한이 필요해
--   auth/보안 담당 파트에서 별도 마이그레이션으로 생성한다.
-- seller 도 별도 담당자 작업이라 제외 (event.seller_id FK 추후 추가).
--
-- 가정: event.event_id 는 uuid.

-- 1) event 컬럼 보강 (상세 화면 전용 필드, 기존 행 보호 위해 전부 nullable)
alter table public.event
  add column if not exists description          text,
  add column if not exists venue_detail_address text,
  add column if not exists duration             integer,   -- 공연 시간(분)
  add column if not exists intermission         integer;   -- 인터미션(분)

-- 2) slot : 회차 (좌석/등급 없이 회차 선택까지만)
create table if not exists public.slot (
  slot_id    uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.event (event_id) on delete cascade,
  date       date not null,
  start_time time not null,
  end_time   time not null,
  is_closed  boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists slot_event_id_idx
  on public.slot (event_id, date, start_time);

-- RLS : slot 은 event 와 동일하게 공개 읽기만 (auth 무관)
alter table public.slot enable row level security;

drop policy if exists "public read slots" on public.slot;
create policy "public read slots"
  on public.slot for select
  to anon, authenticated
  using (true);
