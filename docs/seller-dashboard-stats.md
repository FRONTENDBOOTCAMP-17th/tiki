# 판매자 대시보드 통계 RPC (`bang/feat/final-sprint`)

## 전 / 후

- 전: `event`/`orders`/`ticket_grade`를 각각 조회해 클라이언트에서 합산 (이벤트가 늘수록 가져오는 행과 계산이 함께 증가)
- 후: `get_seller_dashboard_stats` RPC 한 번으로 집계해 반환

## 변경 파일

| 경로 | 내용 |
|---|---|
| `supabase/migrations/20260704150000_get_seller_dashboard_stats.sql` | 통계 집계 함수 |
| `src/app/seller/_lib/stats.ts` | `getSellerDashboardStats(supabase, sellerId)` (RPC 호출 + 반환 타입) |
| `src/app/seller/(dashboard)/page.tsx` | 여러 쿼리 + 수동 집계를 RPC 한 번으로 교체 |

`seller/list`가 아직 쓰는 순수 함수(`sumOrdersByEvent` 등)는 그대로 두고, 대시보드에서 쓰던 집계 로직만 정리했습니다.

## 동작 방식

`get_seller_dashboard_stats(p_seller_id uuid) returns json`

- `security definer` + `set search_path = public` (기존 RPC들과 동일)
- 함수 첫머리에서 `auth.uid()`와 요청 판매자가 일치하는지 확인 → 본인 통계만 조회
- 반환은 `json` 하나로 총매출·총예매수량·공개 이벤트 수·잔여 좌석 + 이벤트별 매출/주문 배열
- 이벤트 배열은 `json_agg` 안에서 `created_at` 기준 정렬 (정렬을 집계 바깥에 두면 순서가 보장되지 않음)

## 배포 메모

로컬과 배포가 같은 Supabase를 공유합니다. 이 함수는 추가만 하는 변경이고 배포된 기존 코드는 호출하지 않으므로, 원격 DB에 먼저 반영해도 기존 동작에 영향이 없습니다.
