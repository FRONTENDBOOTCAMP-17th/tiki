# 트러블슈팅: 결제 취소 시 미결제 주문이 예매목록에 남는 문제

> 관련 파일: `src/app/payment/[orderId]/_components/PaymentForm.tsx`, `src/app/mypage/reservations/page.tsx`, `src/app/action.ts`, `src/app/api/orders/route.ts`, `src/app/api/payments/confirm/route.ts`, `supabase/migrations/20260624120100_order_stock_rpcs.sql`

## 1. 증상

- 결제창(포트원 위젯)에 진입한 뒤 결제를 완료하지 않고 취소하면, 해당 티켓이 **내 예매목록에 "예매 확정"으로 표시**됨.
- 위 티켓을 공유하려고 하면 "예매되지 않은 티켓이라 공유가 불가능하다"는 에러가 발생함.

## 2. 결제 흐름 요약

```
[이벤트 상세] 좌석/등급 선택
  -> POST /api/orders  →  place_order RPC 실행 → orders 테이블에 status='ordered' 로 즉시 INSERT
                          (결제창을 열기도 전에 주문 레코드가 먼저 생성됨)
  -> /payment/[orderId] 이동, 결제하기 클릭
  -> PortOne.requestPayment(...)
       ├─ 성공 → POST /api/payments/confirm → 포트원 조회 후 status='paid' 갱신
       ├─ 실패/취소(데스크탑, response.code 존재) → (수정 전) 아무 처리 없이 토스트만 표시
       └─ 실패/취소(모바일 리다이렉트, ?code=... 복귀) → (수정 전) 아무 처리 없이 토스트만 표시
```

## 3. 원인 분석

### 3-1. 결제 취소 시 주문 상태를 되돌리는 코드가 없었음

`PaymentForm.tsx`의 두 분기 모두, 결제가 실패/취소로 끝나면 토스트만 띄우고 끝났다.

```ts
// 데스크탑 팝업
if (response?.code) {
  toast.error(response.message || "결제에 실패했습니다.");
  setSubmitting(false);
  return; // ← status 갱신 없음
}
```

```ts
// 모바일 리다이렉트
if (redirectErrorCode) {
  toast.error(searchParams.get("message") || "결제가 취소되었습니다.");
  return; // ← status 갱신 없음
}
```

`/api/payments/confirm`은 결제가 **성공했을 때만** 호출되므로, 사용자가 결제창에서 취소하면 `place_order`가 만들어 둔 `status='ordered'` 레코드가 그대로 영구히 남는다. 포트원 웹훅(`Transaction.Cancelled`)도 PG사 트랜잭션이 실제로 생성된 경우에만 오므로, 위젯 단계에서 취소한 경우는 커버되지 않는다.

### 3-2. 예매목록 조회가 미결제(`ordered`) 상태를 걸러내지 않음

```ts
// src/app/mypage/reservations/page.tsx (수정 전)
// 내 주문 (장바구니 cart 제외 → paid + cancelled)
.neq("status", "cart")   // 주석 의도와 다르게 cart만 제외, ordered/failed도 그대로 통과
```

그리고 화면 표시 로직은 `status`가 `cancelled`가 아니면 전부 `"confirmed"`(예매 확정)로 매핑했다:

```ts
const cancelled = o.status === "cancelled";
status: cancelled ? "cancelled" : "confirmed",
```

즉 `ordered`(결제 미완료) 상태가 그대로 "예매 확정"으로 보였던 것 — 사용자가 본 버그의 직접적인 원인.

### 3-3. 공유 기능은 `status='paid'`만 허용

```sql
-- supabase/migrations/20260624120011_ticket_share.sql
where order_id = p_order_id and user_id = v_me and status = 'paid';
```

`ordered` 상태인 주문은 이 조건을 만족하지 못해 "예매되지 않은 티켓" 에러가 발생한다. (이 자체는 올바른 동작이며, 근본 문제는 3-1/3-2였다.)

## 4. 수정 내용

기존에 이미 `cancel_order` RPC(`supabase/migrations/20260624120100_order_stock_rpcs.sql`)와 이를 감싸는 서버 액션 `cancelReservation`(`src/app/action.ts`)이 판매자 취소 기능에서 쓰이고 있었다. 이 RPC는 주문을 `status='cancelled'`로 바꾸고 차감했던 재고(`ticket_grade.quantity`)도 복구해준다. 동일한 액션을 결제 취소/실패 시점에도 호출하도록 연결했다.

### 4-1. `PaymentForm.tsx` — 결제 취소/실패 시 주문 취소 처리 추가

```ts
import { cancelReservation } from "@/app/action";

// 데스크탑 팝업
if (response?.code) {
  await cancelReservation(orderId);
  toast.error(response.message || "결제에 실패했습니다.");
  setSubmitting(false);
  return;
}

// 모바일 리다이렉트
if (redirectErrorCode) {
  cancelReservation(orderId);
  toast.error(searchParams.get("message") || "결제가 취소되었습니다.");
  return;
}
```

→ 결제창에서 취소/실패하면 즉시 `orders.status`가 `cancelled`로 바뀌고 재고도 복구된다.

### 4-2. `mypage/reservations/page.tsx` — 조회 조건을 명시적 화이트리스트로 변경 (방어적 수정)

```ts
// 수정 전
.neq("status", "cart")

// 수정 후
.in("status", ["paid", "cancelled"])
```

→ `ordered`/`failed`(결제 미완료·실패) 상태는 어떤 경로로 남아 있더라도 예매목록에 노출되지 않는다. 4-1이 동작하지 않는 예외 상황(예: 결제창을 닫지 않고 브라우저 탭만 강제로 닫는 경우)에 대한 방어선 역할도 한다.

### 4-3. `pg_cron` — TTL 지난 `ordered` 주문 자동 취소 배치 (`supabase/migrations/20260624120300_stale_order_cleanup_cron.sql`)

4-1은 결제 위젯이 취소/실패 콜백을 호출해줄 때만 동작한다. 사용자가 결제창이 떠 있는 상태에서 탭/브라우저를 강제 종료하면 JS 실행 자체가 끊겨 콜백이 오지 않고, 해당 주문은 `ordered` 상태로 DB에 남으면서 차감된 좌석 재고(`ticket_grade.quantity`)도 영구히 묶인다. 4-2 덕분에 화면(예매목록)에는 안 보이지만, 재고가 풀리지 않는 문제는 별개로 남는다.

이를 서버 쪽에서 주기적으로 정리하기 위해 Supabase `pg_cron`을 도입했다.

**배포 환경 검토**: 이 프로젝트는 Vercel Hobby 플랜에 배포되어 있는데, Vercel Cron Jobs는 Hobby 플랜에서 **하루 1회로 빈도가 강제 제한**된다(그보다 짧은 주기는 배포 자체가 실패함). 반면 Supabase `pg_cron`은 무료 플랜에서도 빈도 제한이 없어(자체 SQL 확장이라 호출 횟수가 아니라 DB 리소스로만 제한됨) 더 짧은 주기로 돌릴 수 있어 이쪽을 선택했다.

```sql
-- TTL(기본 30분) 지난 'ordered' 주문을 일괄 취소 + 재고 복구.
-- 같은 ticket_grade를 여러 주문이 동시에 점유하다 만료될 수 있으므로
-- grade_id로 그룹화해 수량을 합산한 뒤 한 번에 복구한다(개별 UPDATE FROM 다중 매칭 시 누락 방지).
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
    select ticket_grade_id, sum(quantity) as qty from stale group by ticket_grade_id
  ),
  restocked as (
    update ticket_grade tg set quantity = tg.quantity + r.qty
      from to_restock r where tg.grade_id = r.ticket_grade_id
    returning 1
  )
  select count(*) into v_count from stale;
  return v_count;
end;
$$;

-- 10분마다 실행
select cron.schedule('cleanup-stale-orders', '*/10 * * * *',
  $$ select public.cancel_stale_orders(30); $$);

-- pg_cron 자신의 실행 로그(cron.job_run_details)도 매일 1회 7일 지난 것 삭제
-- (정리 안 하면 무료 플랜 DB 용량 500MB를 잠식할 수 있음)
select cron.schedule('cleanup-cron-job-logs', '0 4 * * *',
  $$ delete from cron.job_run_details where end_time < now() - interval '7 days'; $$);
```

`cron.schedule`은 동일한 job 이름으로 다시 호출하면 스케줄을 갱신하므로 마이그레이션을 재실행해도 안전하다(idempotent). pg_cron의 스케줄 시각은 UTC 기준이다.

> 적용 시 주의: 이 리포는 로컬에 `supabase/config.toml`(프로젝트 link)이 없어 `supabase db push`로 자동 적용할 수 없다. Supabase 대시보드 SQL Editor에서 이 마이그레이션 SQL을 직접 실행하거나, 별도로 프로젝트를 link한 뒤 CLI로 적용해야 한다.

## 5. 남은 한계

- TTL(30분)과 정리 주기(10분)는 임의로 정한 값이므로, 실제 운영 중 PG사 결제창 체류 시간 데이터를 보고 조정이 필요할 수 있다.
- pg_cron은 Supabase 프로젝트가 7일간 DB 요청이 없으면 자동 일시정지(pause)되는 무료 플랜 정책과는 별개 이슈다. 운영 중인 서비스라면 사용자 트래픽 자체가 DB 요청을 발생시키므로 큰 영향은 없을 것으로 보이나, 트래픽이 끊기는 기간이 길어지면 함께 멈출 수 있다.
