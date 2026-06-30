-- 좌석 배치도: 무대/좌석 좌표(이벤트 단위 공유) + 좌석의 회차별 점유 상태(sparse)
-- 설계 배경: docs/seat-selection-feature-plan.md 참고

-- ============================================================
-- 배치도 메타: 캔버스 기준 무대 위치/크기 (이벤트당 1개)
-- ============================================================
create table public.seat_layout (
  layout_id    uuid primary key default gen_random_uuid(),
  event_id     uuid not null unique references public.event(event_id) on delete cascade,
  stage_x      numeric not null default 50,  -- 캔버스 가로 기준 %, 무대 중심 x
  stage_y      numeric not null default 10,  -- 캔버스 세로 기준 %, 무대 중심 y
  stage_width  numeric not null default 40,  -- 캔버스 가로 기준 %
  stage_height numeric not null default 10,  -- 캔버스 세로 기준 %
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 개별 좌석: 자유 좌표 + 등급 매핑 (이벤트 단위, 모든 회차가 공유)
-- ============================================================
create table public.seat (
  seat_id     uuid primary key default gen_random_uuid(),
  layout_id   uuid not null references public.seat_layout(layout_id) on delete cascade,
  label       text not null,        -- 화면에 보여줄 좌석 번호, 예: 'A1'
  pos_x       numeric not null,     -- 캔버스 가로 기준 % (0~100)
  pos_y       numeric not null,     -- 캔버스 세로 기준 % (0~100)
  grade_id    uuid references public.ticket_grade(grade_id) on delete set null,
  unique (layout_id, label)
);

-- ============================================================
-- 좌석의 회차별 점유 상태: 잡혔거나 팔린 좌석만 행이 존재(sparse)
-- (seat_id, slot_id) 행이 없으면 = 비어있는 좌석. PK 제약이 동시성 충돌 방지 역할도 함
-- ============================================================
create table public.order_seat (
  seat_id     uuid not null references public.seat(seat_id) on delete cascade,
  slot_id     uuid not null references public.slot(slot_id) on delete cascade,
  order_id    uuid not null references public.orders(order_id) on delete cascade,
  status      text not null default 'held', -- held | sold
  held_until  timestamptz,
  primary key (seat_id, slot_id)
);

create index order_seat_order_id_idx on public.order_seat (order_id);

alter table public.seat_layout enable row level security;
alter table public.seat enable row level security;
alter table public.order_seat enable row level security;

-- 공개 읽기 (구매자가 로그인 전에도 배치도/잔여석을 봐야 함)
create policy "public read seat_layout"
  on public.seat_layout for select to anon, authenticated using (true);
create policy "public read seat"
  on public.seat for select to anon, authenticated using (true);
create policy "public read order_seat"
  on public.order_seat for select to anon, authenticated using (true);

-- 판매자만 본인 이벤트 배치도 작성/수정 (event.seller_id 기반, 기존 정책과 동일한 패턴)
create policy "seller manages own seat_layout"
  on public.seat_layout for all to authenticated
  using (exists (
    select 1 from public.event e
    where e.event_id = seat_layout.event_id and e.seller_id = auth.uid()::text
  ));

create policy "seller manages own seat"
  on public.seat for all to authenticated
  using (exists (
    select 1 from public.seat_layout sl
    join public.event e on e.event_id = sl.event_id
    where sl.layout_id = seat.layout_id and e.seller_id = auth.uid()::text
  ));

-- order_seat은 직접 쓰기 정책 없음. 모든 변경은 SECURITY DEFINER RPC(place_seat_order, cancel_order 등)를 통해서만.
