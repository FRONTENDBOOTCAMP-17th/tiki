# 이선우(zzz664) 리뷰 미해결 항목 수정 기록

> 브랜치: `lee/fix/all`  
> 작업 일자: 2026-07-01  
> 대상 리뷰 문서: TiKi 리뷰 미해결 항목 통합 정리 (2026-06-30 기준)  
> 관련 커밋 범위: `ebd376c` ~ `a34ffd2`

이 문서는 zzz664 담당 항목 중 이번 브랜치에서 처리한 항목의 **증상 → 원인 → 수정 내용 → 검증 방법**을 정리한 것입니다.

---

## 처리 항목 목록

| # | 등급 | 항목 | 상태 | 커밋 |
|---|------|------|------|------|
| #2 | 필수 | 좌석 점유 TTL 불일치 | ✅ 완료 | `ebd376c` |
| #7 | 제안 | 좌석 수 서버 상한 없음 | ✅ 완료 | `ebd376c` |
| #26 | 사소 | 좌석 label 중복 사전체크(500 → 400) | ✅ 완료 | `ebd376c` |
| #27 | 사소 | payments/confirm orders update 반환값 미확인 | ✅ 완료 | `30c7a2d` |
| #8 | 제안 | 회원가입 signUp 에러 원문 노출 | ✅ 완료 | `0244064` |
| #28 | 사소 | 주문 상태값 하드코딩 → ORDER_STATUS 상수 | ✅ 완료 | `3e2527f` |
| #29 | 사소 | troubleshooting 문서 공개 레포 노출 | ✅ 완료 | `8b48571` |
| #30 | 사소 | find-id/find-password 404 링크 | ✅ 완료 | `a34ffd2` |

---

## 항목별 상세

### #2 좌석 점유 TTL 불일치 (커밋 `ebd376c`)

#### 증상
좌석 배치도가 있는 이벤트에서 좌석을 선택(hold)하면 15분 안에 해제된다고 안내하지만,
실제로는 최대 30분이 지나야 cron이 풀어주는 UX 혼선이 발생.

#### 원인
- `order_seat` 테이블에 `held_until = now() + 15분`으로 만료 시각을 기록함.
- `cancel_stale_orders` cron 함수는 `orders.created_at < now() - 30분` 기준으로 만료를 판단.
- `held_until` 컬럼이 실제 해제 판단에 전혀 사용되지 않아, 두 숫자(15분 안내 vs 30분 실해제)가 어긋남.

#### 수정 내용 (`supabase/migrations/20260630000003_fix_cancel_stale_orders_ttl.sql`)

`cancel_stale_orders` 함수를 두 경로로 분리:

```sql
where o.status = 'ordered'
  and (
    -- 좌석 기반 주문: order_seat.held_until 만료 기준
    exists (
      select 1 from order_seat os
      where os.order_id = o.order_id
        and os.held_until < now()
    )
    or
    -- 수량 기반 주문: order_seat 없이 created_at 기준(기존 동작 유지)
    (
      not exists (select 1 from order_seat os where os.order_id = o.order_id)
      and o.created_at < now() - (p_ttl_minutes || ' minutes')::interval
    )
  )
```

좌석 기반 주문은 `held_until < now()`가 되면 즉시 cron에서 정리되므로 15분 안내와 실제 해제 시각이 일치.

#### 검증
- `held_until`을 과거 시각으로 직접 UPDATE 후 cron을 수동 호출(`select public.cancel_stale_orders()`):
  해당 주문이 `cancelled`로 바뀌고 `ticket_grade.quantity`가 복구되면 성공.
- `held_until`이 미래인 좌석 주문은 cron이 건드리지 않음을 확인.

---

### #7 좌석 수 서버 상한 없음 (커밋 `ebd376c`)

#### 증상
API 직접 호출로 `seatIds`를 무제한으로 보내면 한 등급 전체 좌석을 독점 가능.

#### 원인
`/api/orders/seats/route.ts`가 빈 배열 체크만 하고 상한 검증이 없었음.

#### 수정 내용 (`src/app/api/orders/seats/route.ts`)

```ts
const MAX_SEATS_PER_ORDER = 8;

if (seatIds.length > MAX_SEATS_PER_ORDER) {
  return fail(`한 번에 최대 ${MAX_SEATS_PER_ORDER}석까지 선택할 수 있습니다.`, 400);
}
```

클라이언트가 이미 4석 제한 UI를 갖고 있지만, API 직접 호출 우회를 막기 위해 서버에서도 8석으로 상한 적용.

#### 검증
`seatIds: [...9개 이상 UUID...]`으로 POST 요청 → 400 응답 확인.

---

### #26 좌석 label 중복 사전체크 500 → 400 (커밋 `ebd376c`)

#### 증상
같은 라벨을 가진 좌석이 포함된 배치도를 저장하려 하면 DB unique 제약 위반으로 500이 발생.

#### 원인
`/api/seller/event/[id]/seat-layout/route.ts`에서 DB INSERT 전에 중복 라벨을 사전 검증하지 않았음.
Supabase INSERT 에러는 `insertError`로 잡히지만 `seat_save_failed 500`으로 반환되어 클라이언트가 원인을 알 수 없음.

#### 수정 내용

```ts
const labelSet = new Set<string>();
for (const s of seats) {
  if (labelSet.has(s.label)) return fail("duplicate_seat_label", 400);
  labelSet.add(s.label);
}
```

DB 호출 전 O(n) 순회로 중복을 사전 체크해 400(명시적 에러 코드)으로 즉시 반환.

---

### #27 payments/confirm orders update 반환값 미확인 (커밋 `30c7a2d`)

#### 증상
결제 확인 API에서 `orders` 테이블 UPDATE가 0행 영향(예: 이미 다른 경로로 상태 변경됨)이어도
성공 흐름으로 진행되어 결제 완료 처리가 이뤄진 것처럼 응답할 수 있었음.

#### 원인
기존 코드에서 `.update({ status })` 후 반환값을 확인하지 않았음:

```ts
// 수정 전
await admin.from("orders").update({ status: isPaid ? "paid" : "failed" }).eq("order_id", orderId);
```

#### 수정 내용 (`src/app/api/payments/confirm/route.ts`)

```ts
const { data: updatedOrder, error: updateError } = await admin
  .from("orders")
  .update({ status: isPaid ? ORDER_STATUS.PAID : ORDER_STATUS.FAILED })
  .eq("order_id", orderId)
  .select("order_id")
  .single();

if (updateError || !updatedOrder) {
  return fail("주문 상태를 업데이트할 수 없습니다.", 500);
}
```

`.select("order_id").single()`을 체이닝해 영향 행이 없으면 error가 발생하도록 변경.

---

### #8 회원가입 signUp 에러 원문 노출 (커밋 `0244064`)

#### 증상
회원가입 시 Supabase signUp 에러가 발생하면 Supabase 내부 메시지(`"User already registered"` 등)가
클라이언트에 그대로 노출되어 계정 존재 여부 추론이 가능하고 영문 메시지가 UX를 해침.

#### 원인

```ts
// 수정 전
if (error) {
  return fail(error.message); // Supabase 원문 그대로 반환
}
```

#### 수정 내용 (`src/app/api/auth/join/route.ts`)

```ts
if (error) {
  console.error("[AUTH-JOIN] signUp error:", error.message); // 원문은 서버 로그만
  if (
    error.message.includes("User already registered") ||
    error.message.includes("already been registered")
  ) {
    return fail("email_already_exists", 409);
  }
  return fail("signup_failed", 500);
}
```

- 이미 가입된 이메일: `email_already_exists` (409) — 클라이언트에서 "이미 사용 중인 이메일입니다" 등으로 번역 가능.
- 그 외 알 수 없는 오류: `signup_failed` (500).
- Supabase 원문은 `console.error`로만 서버 로그에 기록.

#### 검증
이미 가입된 이메일로 POST `/api/auth/join` → 응답 바디 `{ message: "email_already_exists" }`, HTTP 409 확인.
네트워크 패널에서 Supabase 메시지가 노출되지 않음을 확인.

---

### #28 주문 상태값 하드코딩 → ORDER_STATUS 상수 (커밋 `3e2527f`)

#### 증상
`"ordered"`, `"paid"`, `"cancelled"`, `"failed"` 문자열이 여러 파일에 하드코딩되어 있어
오타·불일치 시 런타임에서만 발견되고, 타입 추적도 어려움.

#### 수정 내용

`src/lib/constants/order-status.ts` 신규 생성:

```ts
export const ORDER_STATUS = {
  ORDERED: "ordered",
  PAID: "paid",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

zzz664 담당 파일에 우선 적용:

| 파일 | 변경 |
|------|------|
| `api/orders/route.ts` | `"ordered"` → `ORDER_STATUS.ORDERED` |
| `api/payments/confirm/route.ts` | `"paid"` / `"failed"` → 상수 |
| `api/payments/webhook/route.ts` | `"paid"` / `"failed"` → 상수, 타입도 `OrderStatus`로 교체 |
| `payment/[orderId]/page.tsx` | `"ordered"` → 상수 |

팀 전체 적용은 #6 상태값 enum 표준화(강재훈 주도)와 함께 진행 예정.

---

### #29 troubleshooting 문서 공개 레포 노출 (커밋 `8b48571`)

#### 증상
`docs/troubleshooting-payment-cancel-leak.md`가 공개 GitHub 레포에 커밋되어 있어
결제 흐름의 내부 구현 상세(DB 스키마, RPC 이름, 취약했던 코드 패턴 등)를 누구나 볼 수 있는 상태.

#### 수정 내용
`git rm`으로 파일 제거. 수정이 완료된 버그의 내부 내용이므로 존재할 이유가 없음.
이번 브랜치의 트러블슈팅 기록은 이 문서(`lee-fix-all-review-followup.md`)로 대체.

---

### #30 find-id/find-password 404 링크 비활성화 (커밋 `a34ffd2`)

#### 증상
로그인 페이지(모바일 뷰)의 "아이디 찾기", "비밀번호 찾기" 링크를 클릭하면
해당 페이지(`/find-id`, `/find-password`)가 없어 404(Next.js not found)가 발생.

#### 원인
기능이 구현되지 않은 상태에서 `<Link href="/find-id">` 형태로 링크를 먼저 달아뒀음.

#### 수정 내용 (`src/app/login/page.tsx`)

```tsx
// 수정 전
<Link href='/find-id' className='hover:text-primary-700'>
  아이디 찾기
</Link>

// 수정 후
<span
  className='cursor-not-allowed text-gray-300'
  title='준비 중입니다'
>
  아이디 찾기
</span>
```

- `<Link>` → `<span>`으로 변경해 클릭/이동 불가.
- `cursor-not-allowed`로 시각적으로 비활성 표시.
- `title="준비 중입니다"` 툴팁으로 이유 안내.
- 기능 구현 시 다시 `<Link>`로 교체하면 됨.

---

## 함께 확인된 기수정 항목 (이번 브랜치에서 별도 수정 불필요)

| # | 항목 | 확인 커밋 |
|---|------|-----------|
| #2 좌석 TTL | `ebd376c`에서 수정 완료 | `ebd376c` |
| #4 주문 재고/동시성 | `orders/route.ts`가 `place_order` RPC 사용 (원자적 처리) | — |
| #7 좌석 수 상한 | `MAX_SEATS_PER_ORDER = 8` 이미 적용 | `ebd376c` |
| #26 좌석 label 중복 | 400 반환 이미 적용 | `ebd376c` |
| #27 confirm 반환값 | `.select().single()` 이미 적용 | `30c7a2d` |

---

## 남은 한계 및 후속 과제

1. **ORDER_STATUS 전체 적용**: `admin/`, `seller/`, `mypage/` 등 팀 전체 파일에 상수 적용은 강재훈(#6)과 협의해서 진행.
2. **find-id/find-password 기능 구현**: Supabase Auth의 `resetPasswordForEmail` / 이메일 기반 아이디 찾기 흐름을 향후 구현하면 `<span>`을 다시 `<Link>`로 교체.
3. **회원가입 에러 코드 프론트 연동**: `email_already_exists` / `signup_failed` 코드를 클라이언트(join 폼)에서 한국어 메시지로 매핑하는 작업 확인 필요.
