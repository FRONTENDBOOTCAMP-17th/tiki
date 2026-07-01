# 좌석 선택 / 좌석 배치도 기능 개발 계획

작성일: 2026-06-29 · 발표일: 2026-07-08 (D-9)

## 1. 목표

- **판매자**: 이벤트 등록/수정 시 무대와 좌석의 위치를 **자유롭게 드래그로 배치**할 수 있다 (정해진 행/열 격자에 갇히지 않고, 실제 공연장 도면처럼 무대 위치·좌석 군집의 모양과 위치를 직접 조절).
- **구매자**: 등급/수량만 고르던 것에서 더 나아가, 그 배치도 위에서 **실제 좌석을 직접 클릭해서 선택**할 수 있다.
- 이 문서는 작성자(기획)가 아니라 **다른 팀원이 구현을 맡는다는 전제**로 작성한다. 구현자가 바로 착수할 수 있도록 스키마/컴포넌트/상호작용을 구체적으로 명시하고, 9일 일정에서 막혔을 때 무엇을 먼저 줄여야 하는지도 명시한다.

## 2. 현재 구조 (조사 결과 요약)

- `event` / `slot`(회차) / `ticket_grade`(등급) / `orders` 4개 테이블로 구성. **좌석 관련 컬럼/테이블 없음.**
- `ticket_grade.quantity`는 **이벤트 단위**로 존재 — 모든 회차가 같은 등급 잔여수량을 공유함 (회차별 좌석 상태 구분이 원래 안 되는 구조).
- `place_order` / `cancel_order` RPC(`supabase/migrations/20260624120100_order_stock_rpcs.sql`)가 이미 "재고 차감 → 부족하면 실패" 패턴을 `UPDATE ... WHERE quantity >= n` 형태의 원자적 락으로 처리하고 있음 — 좌석 단위 동시성 처리도 이 패턴을 그대로 확장하면 된다.
- 판매자 등록 폼(`EventCreateForm.tsx`)은 5단계 구조이고, "Step 3: 좌석 및 가격"에서 등급명/가격/수량만 입력함. 여기에 배치도 단계를 끼워 넣기 좋은 지점이 이미 있음.
- 구매자 쪽 `BookingPanel.tsx`는 날짜→회차→등급→수량 순서의 단계형 UI. 등급 선택 후 수량 스테퍼 부분을 좌석 그리드로 교체하면 된다.
- `@dnd-kit`은 이미 의존성에 있지만 실제로는 `admin/categories`의 **1차원 리스트 정렬**(`useSortable`)에만 쓰임. 이번 기능은 리스트 정렬이 아니라 "절대 좌표를 자유롭게 옮기는" 동작이라 `useSortable`이 아니라 한 단계 아래의 `@dnd-kit/core`의 `useDraggable` + `DndContext`를 직접 써야 한다 (참고할 기존 코드가 없으므로 dnd-kit 공식 문서의 "Draggable" 예제부터 보는 게 빠름). **신규 패키지 설치는 필요 없음.**

## 3. 핵심 설계 결정

### 3-1. "좌석 모양(geometry)"과 "좌석 판매상태(status)"를 분리한다

좌석의 위치/등급 매핑은 이벤트당 한 번 만들고 모든 회차가 공유하지만, **판매 여부는 회차별로 독립**이어야 한다 (금요일 공연이 매진돼도 토요일 좌석은 남아있어야 함). 그래서:

- `seat` 테이블: 좌석의 좌표/등급 (이벤트 단위, 배치도 저장 시 한 번 생성)
- `order_seat` 테이블: 실제로 **잡혔거나 팔린 좌석만** 회차별로 행이 생기는 sparse 테이블 (아래 3-1-1 참고)

#### 3-1-1. 판매상태 테이블을 "전부 미리 생성"이 아니라 "잡힌 것만" 기록하는 방식으로

처음엔 `(seat_id, slot_id)` 모든 조합을 `available` 상태로 미리 다 깔아두는 `seat_status` 테이블을 생각했는데, 이건 불필요한 낭비다 — 좌석 2,000석 × 회차 10개면 2만 행을 미리 만들어야 하고, 좌석/회차가 추가될 때마다 동기화 로직(`sync_seat_status_for_event`)을 계속 챙겨야 한다.

대신 **실제로 누가 잡은 좌석만** 행으로 존재하는 `order_seat` 테이블을 쓴다: "이 좌석이 비어있나?" = 그 `(seat_id, slot_id)` 행이 **없으면** 비어있는 것. 좌석을 잡을 때는 해당 좌석들의 행을 한 번에 `INSERT`하는데, 이미 누가 잡은 좌석이면 PK 제약 충돌로 INSERT 자체가 실패한다 — 그래서 동시성 충돌 감지를 위해 별도로 `SELECT ... FOR UPDATE`로 잠그고 확인하는 단계가 필요 없다. 취소/TTL 만료 시에는 해당 주문의 `order_seat` 행을 **삭제**하면 그 좌석은 자동으로 다시 비어있는 상태가 된다. 회차나 좌석이 새로 추가돼도 동기화할 게 없다.

### 3-2. 배치도 스코프: 자유 배치 캔버스 (격자에 갇히지 않음)

fabric.js/konva.js 같은 풀 캔버스 드로잉 라이브러리(도형 그리기, 베지어 곡선, 줌/팬 등)까지 가면 학습 곡선이 9일 일정에 비해 너무 크다. 대신 **이미 의존성에 있는 `@dnd-kit/core`의 `useDraggable`**로 "절대 위치(x, y)를 가진 요소를 자유롭게 드래그해서 옮긴다"는 핵심만 구현한다. dnd-kit core는 도형을 그리는 도구가 아니라 "드래그로 옮기는" 상호작용만 제공하므로 도면 에디터치고는 학습 비용이 낮다.

- 좌표는 **캔버스 크기에 대한 비율(0~100%)**로 저장한다 (픽셀 절대값이 아님) → 화면 크기가 달라져도 배치가 깨지지 않음, 구매자 화면에서도 동일 비율로 재현 가능
- **무대(stage)**: 캔버스 위에 직사각형 블록 하나, 드래그로 위치 이동 가능. 크기는 숫자 입력(가로/세로 %)으로 조절 — 드래그 리사이즈는 스코프에서 제외(시간 대비 효과가 작음)
- **좌석**: 개별 점(또는 작은 사각형)으로 표현. 한 번에 하나씩 만드는 게 아니라 **"N개짜리 줄(row) 추가"** 버튼으로 가로로 나열된 좌석 그룹을 한 번에 생성한 뒤, 줄 전체 또는 개별 좌석을 드래그로 미세 조정한다 (좌석 수백 개를 하나씩 드래그하게 만들면 시간 안에 못 끝남 — 반드시 그룹 생성 도구가 있어야 함)
- **정렬 보조(snap-to-grid, 선택)**: 자유 배치이지만 줄이 삐뚤빼뚤해지는 걸 막기 위해 드래그 중 일정 간격(예: 1%)으로 스냅하는 옵션을 기본 켜둔다. 토글로 끌 수 있게 하면 진짜 자유 배치도 가능
- **등급 지정**: 좌석을 클릭(다중 선택은 Shift+클릭 또는 드래그로 사각 영역 선택)한 뒤 등급 버튼을 누르면 선택된 좌석들에 색이 입혀지고 `grade_id`가 일괄 지정됨

이 방식이면 "행렬에 끼워 맞춘 느낌" 없이 실제 공연장처럼 무대를 중심에 두고 좌석 군집을 부채꼴/곡선/구역별로 자유롭게 배치하는 모습을 만들 수 있다. 단, 좌석을 곡선으로 정렬하는 보조 도구(예: 원형 배치 자동 생성)까지는 1차 범위에 넣지 않는다 — 직선 줄을 만든 뒤 사용자가 손으로 휘어서 배치하는 것으로 충분.

### 3-3. 동시성: PK 제약으로 충돌을 막는다 (락을 직접 걸지 않음)

좌석은 "특정 한 자리"라서 두 사람이 동시에 같은 좌석을 고르면 충돌이 생긴다. `ticket_grade.quantity`처럼 원자적 UPDATE로 직접 잠그는 대신, `order_seat(seat_id, slot_id)`에 **복합 PK**를 걸어두고 INSERT 한 번으로 충돌 여부까지 같이 처리한다 — 이미 잡힌 좌석이 섞여 있으면 INSERT 자체가 실패하므로 별도 락 코드가 필요 없다. 결제 취소/실패/TTL 만료 시 좌석을 다시 비우는 로직(= `order_seat` 행 삭제)은 **기존에 고친 `cancel_order`와 `cancel_stale_orders`(결제 취소 누락 버그 수정 시 추가한 TTL 배치, [troubleshooting-payment-cancel-leak.md](troubleshooting-payment-cancel-leak.md) 참고)에 이어붙인다** — 안 그러면 좌석 단위로 똑같은 "재고 안 풀리는" 버그가 재발한다.

## 4. DB 스키마 (초안)

```sql
-- 좌석 배치도 메타(캔버스 기준 무대 위치/크기) - 이벤트당 1개
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

-- 개별 좌석의 자유 좌표 + 등급 매핑 (이벤트 단위, 모든 회차가 공유)
create table public.seat (
  seat_id     uuid primary key default gen_random_uuid(),
  layout_id   uuid not null references public.seat_layout(layout_id) on delete cascade,
  label       text not null,        -- 사용자에게 보여줄 좌석 번호 표시, 예: 'A1', 'VIP-12' (위치와 무관한 그냥 문자열)
  pos_x       numeric not null,     -- 캔버스 가로 기준 % (0~100)
  pos_y       numeric not null,     -- 캔버스 세로 기준 % (0~100)
  grade_id    uuid references public.ticket_grade(grade_id) on delete set null,
  unique (layout_id, label)
);

-- 실제로 잡혔거나 팔린 좌석만 행이 존재하는 sparse 테이블 (없으면 = 비어있는 좌석)
create table public.order_seat (
  seat_id     uuid not null references public.seat(seat_id) on delete cascade,
  slot_id     uuid not null references public.slot(slot_id) on delete cascade,
  order_id    uuid not null references public.orders(order_id) on delete cascade,
  status      text not null default 'held', -- held | sold
  held_until  timestamptz,
  primary key (seat_id, slot_id)  -- 이 제약이 곧 동시성 충돌 방지 장치
);

alter table public.seat_layout enable row level security;
alter table public.seat enable row level security;
alter table public.order_seat enable row level security;

-- 공개 읽기 (구매자가 로그인 전에도 배치도/잔여석을 봐야 함)
create policy "public read seat_layout" on public.seat_layout for select to anon, authenticated using (true);
create policy "public read seat" on public.seat for select to anon, authenticated using (true);
create policy "public read order_seat" on public.order_seat for select to anon, authenticated using (true);

-- 판매자만 본인 이벤트 배치도 작성/수정 (기존 event.seller_id 패턴 그대로 재사용)
create policy "seller manages own seat_layout" on public.seat_layout for all to authenticated
  using (exists (select 1 from public.event e where e.event_id = seat_layout.event_id and e.seller_id = auth.uid()::text));
create policy "seller manages own seat" on public.seat for all to authenticated
  using (exists (select 1 from public.seat_layout sl join public.event e on e.event_id = sl.event_id
                 where sl.layout_id = seat.layout_id and e.seller_id = auth.uid()::text));

-- order_seat는 직접 쓰기 정책을 주지 않는다. 모든 변경은 SECURITY DEFINER RPC를 통해서만 (place_seat_order, cancel_order 등).
```

좌석/회차가 추가될 때 따로 동기화할 행이 없다 — `order_seat`는 누가 좌석을 잡는 순간에만 행이 생기므로 미리 채워둘 필요 자체가 없다.

## 5. RPC 변경

### 5-1. `place_seat_order` (신규) — 좌석 단위 예매

```sql
create or replace function public.place_seat_order(
  p_event_id uuid, p_slot_id uuid, p_grade_id uuid,
  p_seat_ids uuid[], p_total_price int
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;
  if coalesce(array_length(p_seat_ids, 1), 0) = 0 then raise exception 'INVALID_SEATS'; end if;

  insert into orders (event_id, slot_id, ticket_grade_id, quantity, total_price, status, user_id)
  values (p_event_id, p_slot_id, p_grade_id, array_length(p_seat_ids, 1), p_total_price, 'ordered', v_uid)
  returning order_id into v_order_id;

  -- 선택한 좌석들을 한 번에 INSERT. 이미 누가 잡은 좌석이 섞여 있으면
  -- (seat_id, slot_id) PK 충돌로 이 INSERT 전체가 실패하면서 SEAT_TAKEN으로 떨어진다.
  -- 별도 SELECT ... FOR UPDATE 락이 필요 없는 이유.
  begin
    insert into order_seat (seat_id, slot_id, order_id, status, held_until)
    select s, p_slot_id, v_order_id, 'held', now() + interval '15 minutes'
    from unnest(p_seat_ids) as s;
  exception when unique_violation then
    raise exception 'SEAT_TAKEN';
  end;

  return v_order_id;
end;
$$;
```

### 5-2. `cancel_order` 확장

기존 로직 끝에 추가:
```sql
delete from order_seat where order_id = p_order_id;
```

### 5-3. `cancel_stale_orders`(이미 만든 TTL 배치) 확장

기존 로직 끝에 동일하게 좌석 해제(삭제) 추가. TTL 대상 주문은 어차피 `orders.order_id`를 알고 있으므로 같은 패턴 재사용.

> 결제 확정(`/api/payments/confirm`)에서 `isPaid`일 때는 `order_seat.status`를 `held` → `sold`로 바꿔주는 한 줄도 추가해야 함 (현재 `confirm` 라우트가 `orders.status`만 바꾸고 있음 — 누락하면 결제 완료된 좌석이 계속 `held`로 남아 TTL 배치가 삭제해버리는 새 버그가 생김).

## 6. 프론트엔드

### 6-1. 판매자: 배치도 빌더 (`EventCreateForm.tsx`의 "Step 3.5"로 추가)

**캔버스**: 고정 비율(예: 4:3) 박스 하나. 내부 좌표는 전부 `%` 기준이라 `position: absolute; left: ${x}%; top: ${y}%`로 렌더하면 반응형으로 그대로 동작한다.

**구성 요소**
- `StageBlock`: 무대 사각형. `useDraggable`로 캔버스 내에서 이동, 가로/세로 크기는 별도 숫자 입력(%)으로 조절
- `SeatDot`: 좌석 하나. `useDraggable`로 개별 이동 가능. 클릭 시 선택(다중 선택은 Shift+클릭), 선택된 좌석은 등급 색으로 표시
- 캔버스 컨테이너는 `DndContext`로 감싸고, `onDragEnd`에서 `delta.x/delta.y`(px)를 캔버스 크기로 나눠 `%` 변화량으로 환산해 좌표 state를 갱신

**도구**
1. "줄 추가" 버튼: 입력한 개수(N)만큼 좌석을 가로로 일정 간격 나열해 한 번에 생성 (이름은 자동으로 `라벨접두사 + 순번`, 예: `A1~A20`). 좌석 수백 개를 하나씩 만들지 않게 하는 핵심 도구.
2. 드래그 영역 선택(사각 셀렉션 박스, mousedown→mousemove→mouseup): 영역 안의 좌석들을 한 번에 다중 선택
3. 등급 버튼: 선택된 좌석들에 `grade_id` 일괄 지정 + 색 적용
4. 스냅 토글: on이면 드래그 중 1% 단위로 좌표 스냅(줄이 깔끔하게 정렬됨), off면 완전 자유 배치
5. 개별/그룹 삭제

**저장**: 무대 좌표 + 좌석 좌표 배열을 API(`/api/seller/event/seat-layout`)로 전송 → 서버가 `seat_layout` upsert + `seat` 전체 삭제 후 재생성 (이미 판매된 회차가 있으면 수정 차단 — 기존 회차 수정 제한 로직과 동일한 패턴)

### 6-2. 구매자: 좌석 선택 (`BookingPanel.tsx`)

- 회차 + 등급까지 고른 뒤, 수량 스테퍼 대신 **같은 캔버스를 읽기 전용으로 렌더** (드래그 비활성화, 클릭만 가능)
- 무대 블록을 같은 위치에 그려서 "내가 무대 기준 어디쯈 앉는지" 감을 줌
- 색상: 선택가능(등급색) / 선택됨(강조) / 판매됨·홀드중(회색, disabled)
- 클릭한 좌석 수 = 구매 수량. 결제 페이지로 넘길 때 `seat_ids` 배열을 같이 전달
- 결제 페이지(`PaymentForm.tsx`)에 선택한 좌석 라벨 목록 표시 ("VIP A1, A2")

## 7. 일정 (6/29 ~ 7/8)

전담으로 밀어붙인다는 가정. 팀에서 분업하면 단축 가능 (스키마/RPC 담당, 판매자 UI 담당, 구매자 UI 담당을 나눠서 3-5 단계를 병렬로).

| 날짜 | 작업 |
|---|---|
| 6/29 (오늘) | 스키마 확정 + 마이그레이션 작성 (`seat_layout`, `seat`, `order_seat`, RLS) |
| 6/30 | RPC 구현 (`place_seat_order`, `cancel_order`/`cancel_stale_orders` 확장) + SQL Editor에서 수동 테스트 (동시 INSERT 충돌 시나리오 포함) |
| 7/1 | 판매자 빌더 — 캔버스 기본 골격: `DndContext` + `StageBlock`(드래그 이동) + `SeatDot` 1개 드래그 동작 확인 (좌표 ↔ `%` 환산 로직이 핵심, 여기서 막히면 전체 일정에 영향 크므로 최우선으로 검증) |
| 7/2 | 판매자 빌더 — "줄 추가" 일괄 생성 도구 + 드래그 영역 다중 선택 + 등급 일괄 지정 + 저장 API 연동 |
| 7/3 | 구매자 좌석 선택 UI (읽기 전용 캔버스 렌더 + 클릭 선택 로직) → BookingPanel 통합 |
| 7/4 | 결제 플로우 연결 (`place_seat_order` 호출, 결제페이지에 좌석 라벨 표시), `confirm` 라우트에 `sold` 전환 추가 |
| 7/5 ~ 7/6 (주말, 버퍼) | 통합 테스트, 동시성 테스트(같은 좌석 동시 클릭 시나리오), 드래그 좌표 깨짐(모바일 터치 등) 점검 |
| 7/7 | 발표 시나리오 리허설, edge case 마무리 |
| 7/8 | 발표 |

자유 배치 캔버스는 격자보다 구현 리스크가 명확히 더 크다 — 특히 7/1의 "드래그 좌표 ↔ % 환산"이 막히면 이후 일정 전체가 밀린다. **7/1 안에 이 부분이 안 풀리면 바로 8번 항목의 컷 리스트를 적용**해서 격자 기반으로 축소 판단을 내려야 한다.

## 8. 일정이 빠듯할 때 줄일 수 있는 범위 (우선순위 낮은 것부터)

1. 드래그 리사이즈/스냅 옵션 → 스냅을 항상 켜진 상태로 고정 (자유도는 줄지만 정렬은 깔끔하게 유지)
2. 드래그 영역 다중 선택 → Shift+클릭으로 하나씩 선택해서 등급 지정 (느리지만 동일 기능)
3. **자유 배치 자체가 7/1까지 안 풀리면** → 3-2의 격자 기반 빌더(행×열, 칸 클릭)로 축소. 좌석을 "직접 옮겨서 배치"하는 대신 "격자 칸에 좌석/통로를 지정"하는 방식이 되지만, 구매자 입장에선 여전히 "좌석을 클릭해서 고른다"는 핵심 경험은 동일하게 유지됨
4. 회차별 독립 판매상태(`order_seat.slot_id`) → 이벤트 단위로 좌석 상태를 합쳐서 단순화 (기존 `ticket_grade.quantity` 방식과 동일한 제약으로 회귀)
5. 좌석 보류(held) + TTL 연동 → 보류 없이 즉시 `sold` 처리(취소 시에만 해제). 동시성 안전성은 떨어지지만 데모 시연에는 큰 문제 없음

1~3번은 잘라도 "좌석을 직접 고른다"는 핵심 경험에 지장이 없으므로 먼저 자를 후보. 4~5번은 데이터 정합성 문제로 이어지므로 최후의 수단으로만 고려.
