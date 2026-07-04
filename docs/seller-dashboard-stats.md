# 판매자 대시보드 통계 RPC (`bang/feat/final-sprint`)

> 배경: 대시보드가 `event`/`orders`/`ticket_grade`를 각각 조회해 클라이언트에서 합산하고 있었습니다. 이벤트가 늘수록 가져오는 행과 계산이 함께 늘어나는 구조라, 한 번의 집계 쿼리(RPC)로 옮겼습니다.

## 1. 변경 파일

| 경로 | 내용 |
|---|---|
| `supabase/migrations/20260704150000_get_seller_dashboard_stats.sql` | 통계 집계 함수 |
| `src/app/seller/_lib/stats.ts` | `getSellerDashboardStats(supabase, sellerId)` 추가 (RPC 호출 + 반환 타입) |
| `src/app/seller/(dashboard)/page.tsx` | 여러 쿼리 + 수동 집계를 RPC 한 번으로 교체 |

`seller/list` 페이지가 아직 사용하는 순수 함수(`sumOrdersByEvent` 등)는 그대로 두고, 대시보드에서 쓰던 집계 로직만 정리했습니다.

## 2. RPC 설계

`get_seller_dashboard_stats(p_seller_id uuid) returns json`

- `security definer` + `set search_path = public` — 기존 RPC들(`place_order`, `cancel_order` 등)과 동일한 방식을 따랐습니다.
- 함수 첫머리에서 `auth.uid()`와 요청한 판매자가 일치하는지 확인하고, 아니면 예외를 던집니다. 본인 통계만 조회할 수 있습니다.
- 실행 권한은 `authenticated`에만 부여했습니다.
- 반환은 `json` 하나로 총매출·총예매수량·공개 이벤트 수·잔여 좌석과 이벤트별 매출/주문 배열을 함께 내려줍니다.

이벤트 배열은 집계(`json_agg`) 안에서 `created_at` 기준으로 정렬합니다. 정렬을 집계 바깥에 두면 순서가 보장되지 않아, "최근 이벤트" 목록이 흔들릴 수 있기 때문입니다.

## 3. 호출 측

`stats.ts`에 반환 타입(`SellerDashboardStats`)을 정의하고, 대시보드 페이지는 이 함수 하나만 호출합니다. 페이지가 기대하는 인터페이스는 그대로 유지해, 화면 코드 변경을 최소화했습니다.

## 4. 배포 메모

이 저장소는 로컬과 배포가 같은 Supabase를 공유합니다. 이 함수는 추가만 하는 변경이고 배포된 기존 코드는 호출하지 않으므로, 원격 DB에 먼저 반영해도 기존 동작에 영향이 없습니다. 마이그레이션 파일도 함께 커밋되어 있어, 팀 배포 시 자연스럽게 반영됩니다.

## 5. 앞으로

- 통계 항목을 추가할 때는 SQL과 `stats.ts`의 반환 타입을 함께 맞추면 됩니다.
