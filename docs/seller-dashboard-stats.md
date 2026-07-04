# 판매자 대시보드 통계 RPC (`bang/feat/final-sprint`)

> 배경: 대시보드가 `event`/`orders`/`ticket_grade`를 각각 조회해 TS에서 합산하고 있었다. 이벤트가 늘수록 클라이언트로 끌어오는 행과 계산이 같이 늘어나는 구조라, 한 번의 집계 쿼리(RPC)로 옮겼다.

## 1. 변경 파일

| 경로 | 내용 |
|---|---|
| `supabase/migrations/20260704150000_get_seller_dashboard_stats.sql` | 통계 집계 함수 |
| `src/app/seller/_lib/stats.ts` | `getSellerDashboardStats(supabase, sellerId)` 추가 (RPC 호출 + 타입) |
| `src/app/seller/(dashboard)/page.tsx` | 3개 쿼리 + 수동 집계 → RPC 한 번 호출로 교체 |

`sumOrdersByEvent`/`sumCapacityByEvent` 같은 기존 순수 함수는 `seller/list` 페이지가 아직 쓰고 있어서 **삭제하지 않았다.** 대시보드에서 쓰던 집계만 걷어냈다.

## 2. RPC 설계

`get_seller_dashboard_stats(p_seller_id uuid) returns json`

- `security definer` + `set search_path = public` — 기존 RPC들(`place_order`, `cancel_order` 등)과 같은 방식
- 함수 첫머리에서 `auth.uid() = p_seller_id`를 확인하고 아니면 `UNAUTHORIZED` 예외 — 본인 통계만 조회
- `authenticated`에만 `execute` 권한
- 반환은 `json` 하나로: 총매출·총예매수량·공개 이벤트 수·잔여 좌석 + 이벤트별 매출/주문 배열

이벤트 배열은 `json_agg(... order by created_at desc)`로 정렬을 **집계 안에서** 보장했다. CTE에 `order by`만 걸고 밖에서 `json_agg`하면 순서가 보장되지 않아, "최근 이벤트" 목록이 틀어질 수 있기 때문이다.

## 3. 겪은 함정 — `seller_id`가 uuid가 아니라 text

`event.seller_id` 컬럼이 `uuid`가 아니라 **`text`** 였다. 처음엔 `where seller_id = p_seller_id`(uuid)로 비교했다가 `operator does not exist: text = uuid`로 함수 전체가 실패했고, 대시보드가 통째로 500이 났다.

- supabase-js의 `.eq("seller_id", user.id)`는 PostgREST가 알아서 문자열로 맞춰줘서 안 터졌지만, 순수 SQL에서는 타입이 안 맞았다.
- `where seller_id = p_seller_id::text`로 캐스팅해서 해결. (`46fc9ff`)

## 4. 배포 주의

이 저장소는 로컬·배포가 같은 Supabase를 공유한다. 함수는 **추가만 하는 변경이고 배포된 구 코드가 호출하지 않아** 지금 원격 DB에 올려도 위험이 없어서 적용해둔 상태다. (마이그레이션 파일도 커밋되어 있으니 팀 배포 시 자동으로 함께 올라간다.)

## 5. 한계 / 후속

- 반환 타입은 `stats.ts`에 손으로 정의하고 `data as SellerDashboardStats`로 단언한다. `database.ts`의 함수 타입은 `Returns: Json`이라, RPC 스키마가 바뀌면 이 인터페이스를 같이 손봐야 한다.
- 통계 항목이 늘면 SQL과 TS 타입 두 곳을 함께 수정해야 한다.
