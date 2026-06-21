# 결제 기능 개발 문서 (`lee/feat/pay`)

> 대상 브랜치: `lee/feat/pay` (base: `develop`, merge-base `030d261`)
> 목적: 시안에 맞춘 결제 페이지(`/payment/[orderId]`) 구현 + 포트원(PortOne) V2 간편결제(카카오페이/토스페이/네이버페이) 테스트 연동

## 1. 변경/추가 파일 목록

| 분류 | 경로 | 내용 |
|---|---|---|
| 설정 | `.env.example` | 포트원 관련 env 4종 추가 |
| 설정 | `package.json` | `@portone/browser-sdk`, `@portone/server-sdk` 의존성 추가 |
| 서버 클라이언트 | `src/lib/portone/server.ts` | 결제 조회용 서버 전용 `PaymentClient` 싱글턴 |
| 결제 페이지 | `src/app/payment/[orderId]/page.tsx` | 서버 컴포넌트. 주문/이벤트/회차/등급/구매자 프로필 조회 후 폼에 전달 |
| 결제 페이지 | `src/app/payment/[orderId]/_components/PaymentForm.tsx` | 클라이언트 컴포넌트. 예매정보/예매자정보/결제수단/결제금액 UI + `requestPayment` 호출 |
| 결제 페이지 | `src/app/payment/[orderId]/_components/PaymentMethodSelector.tsx` | 카카오페이/토스페이/네이버페이 선택 버튼 그룹 |
| 결제 페이지 | `src/app/payment/[orderId]/_components/easyPayOptions.ts` | 간편결제 provider 목록 상수 |
| API | `src/app/api/payments/confirm/route.ts` | 결제 후 서버에서 금액/상태 재검증, 주문 상태 갱신 |
| API | `src/app/api/payments/webhook/route.ts` | 포트원 웹훅 수신, 서명 검증 후 주문 상태 동기화 |
| API (버그 수정) | `src/app/api/events/[eventId]/slots/route.ts` | 회차 목록 조회 API (이전에 누락되어 있었음) |
| API (버그 수정) | `src/app/api/events/[eventId]/grades/route.ts` | 좌석 등급 목록 조회 API (신규) |
| 기존 페이지 수정 | `src/app/[eventId]/page.tsx` | grades를 mock 대신 실제 API로 조회, "바로 예매" 시 결제 페이지로 이동 |

총 12개 파일, +614 / -3.

## 2. 구현 내용 및 방법

### 2-1. PG 연동 방식 선택

결제 수단으로 카카오페이/토스페이/네이버페이 3개를 노출해야 하는 시안 요구사항에 맞춰, PG 직접 계약 없이 테스트 가능한 **포트원(PortOne) V2**를 택했다. (대안으로 토스페이먼츠 단독 SDK도 검토했으나, 시안처럼 결제수단을 명확히 분리된 버튼으로 노출하기엔 포트원의 `easyPayProvider` 파라미터 방식이 더 자연스러웠다.)

- 클라이언트: `@portone/browser-sdk`의 `PortOne.requestPayment()`
- 서버: `@portone/server-sdk`의 `PaymentClient.getPayment()` (조회/검증), `Webhook.verify()` (웹훅 서명 검증)
- 패키지의 `.d.ts`를 직접 읽어 API 시그니처를 확인했다. 특히 `easyPayProvider`는 최상위 필드가 아니라 `easyPay: { easyPayProvider }`로 중첩되어야 하고, `currency`는 문서 예시와 달리 설치된 버전 기준 `"KRW"`(`"CURRENCY_KRW"` 아님)이 맞다.

### 2-2. paymentId 설계 — 별도 컬럼 없이 `orders.order_id` 재사용

포트원 결제 요청에는 가맹점이 직접 채번하는 `paymentId`가 필요하다. 이를 위해 `orders` 테이블에 컬럼을 추가하는 대신, 이미 존재하는 PK `order_id`(UUID)를 그대로 `paymentId`로 사용했다. 장점:

- 스키마 마이그레이션 불필요
- confirm/webhook 양쪽에서 `paymentId == orders.order_id`로 바로 조회 가능

### 2-3. 결제 플로우

```
[이벤트 상세] 바로 예매
  -> POST /api/orders (status: "ordered" 로 생성)
  -> /payment/[orderId] 이동
[결제 페이지] 결제하기 클릭
  -> PortOne.requestPayment({ paymentId: orderId, easyPay: { easyPayProvider }, redirectUrl, ... })
  -> (데스크탑) Promise resolve로 결과 직접 수신
     (모바일 등) redirectUrl로 ?paymentId=...&code=... 와 함께 복귀
  -> 두 경우 모두 POST /api/payments/confirm 호출
[confirm API]
  -> 본인 주문인지 확인 (cookie 기반 클라이언트, RLS)
  -> portone.getPayment(paymentId)로 실제 결제 상태/금액 조회
  -> status === "PAID" && amount.total === order.total_price 일 때만 주문을 "paid"로 갱신 (admin 클라이언트)
  -> 불일치 시 "failed" 처리
[webhook API] (선택, 보강용)
  -> Webhook.verify로 서명 검증
  -> Transaction.Paid / Failed / Cancelled 이벤트 수신 시 동일하게 주문 상태 동기화
  -> 클라이언트가 confirm을 호출하지 못한 경우(결제 중 브라우저 종료 등)의 안전망
```

핵심 보안 포인트: **클라이언트가 보낸 결제 성공 여부를 그대로 믿지 않고**, 서버가 포트원에 직접 재조회해서 금액까지 대조한 뒷받침이 있어야 `paid`로 바꾼다 (PortOne 공식 가이드가 강조하는 패턴).

### 2-4. RLS 경계 — 일반 클라이언트 vs admin 클라이언트

- 주문 **조회**(본인 소유 확인): 쿠키 기반 `createClient()` 사용 → RLS로 본인 행만 보이는 것을 그대로 활용
- 주문 **상태 갱신**(`paid`/`failed`로 UPDATE): `supabaseAdmin`(service role)로 RLS 우회 → 결제 검증이 서버에서 끝난 신뢰된 쓰기이므로 RLS 정책 유무와 무관하게 항상 성공해야 함

### 2-5. 부수적으로 발견/수정한 버그

테스트 중 "ticket grade not found", "new row violates row-level security policy for table orders" 두 가지가 발견되어 같이 처리했다.

1. **등급/회차 미연동**: `[eventId]/page.tsx`가 `BookingWidget`에 항상 `MOCK_GRADES`(가짜 ID)를 넘기고 있었고, 회차 조회 API(`/api/events/[eventId]/slots`)는 호출은 하지만 라우트 자체가 없어 404 → 조용히 mock으로 폴백되던 상태였다. → `grades`/`slots` 라우트를 추가하고 페이지에서 실제 데이터를 우선 사용하도록 수정.
2. **`orders` INSERT RLS 정책 누락**: `orders` 테이블에 RLS가 켜져 있고 INSERT 정책이 없어 모든 주문 생성이 막혀 있었다. 코드 문제가 아니라 DB 설정 문제라 SQL을 직접 안내했고(아래 4-1), 사용자가 Supabase SQL Editor에서 적용 후 테스트를 통과했다.

## 3. 직접 수행해야 했던 외부 설정 (참고용 기록)

- 포트원 콘솔 가입(무료, 사업자등록 불필요) 후 `storeId` 확인
- 토스페이먼츠(신모듈) **테스트 채널** 추가 → `channelKey` 발급
- V2 API Secret Key 발급
- `.env.local`에 `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`, `PORTONE_API_SECRET`, `PORTONE_WEBHOOK_SECRET` 설정
- `orders` 테이블에 INSERT(및 SELECT) RLS 정책 추가

## 4. 코드 리뷰 / 알려진 문제점

### 4-1. DB 정책 (해결됨, 기록용)

```sql
create policy "Users can insert own orders"
on public.orders for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own orders"
on public.orders for select to authenticated
using (auth.uid() = user_id);
```

### 4-2. 한계 / 후속 작업이 필요한 부분

- **`/mypage/reservations`가 아직 mock 데이터**: 결제 성공 후 리다이렉트되는 화면이라, 실제 결제 결과를 UI에서 바로 확인할 수 없다(Supabase 테이블을 직접 봐야 함). 이 페이지를 실데이터로 연동하는 작업이 별도로 필요하다.
- **웹훅은 로컬에서 미검증**: `ngrok` 같은 터널이 있어야 로컬에서 실제 웹훅 호출을 받아볼 수 있어, 이번 브랜치에서는 코드만 작성하고 실제 수신 테스트는 하지 못했다. 배포 후 콘솔에 웹훅 URL을 등록하고 "웹훅 재전송"으로 별도 검증이 필요하다.
- **결제수단 버튼이 실제 PG 로고가 아님**: 라이선스 문제로 카카오/토스/네이버 공식 로고 대신 색상 배지(`PaymentMethodSelector`)로 대체했다. 디자인 시안과 비교해 다듬을 여지가 있다.
- **취소/환불 플로우 없음**: `portone.cancelPayment` 연동이 없어, 결제 취소가 필요한 경우 포트원 콘솔에서 수동으로 처리해야 한다.
- **입력값 검증 부족**: 결제 페이지의 이름/연락처/이메일 입력에 형식 검증(휴대폰 번호 패턴 등)이 없다. 현재는 단순 텍스트 입력만 받아 `customer` 필드로 그대로 전달한다.
- **테스트 결제 주의사항**: 카카오페이 테스트 채널에서 실 카드 등록 후 결제하면 금액이 자동 취소되지 않는다(포트원 정책). 테스트 시 카드 등록 화면이 나오면 등록하지 않는 식으로 우회해야 하며, 실수로 결제됐다면 콘솔에서 수동 취소가 필요하다.
- **동시성/중복 호출**: `confirm` API는 `order.status === "paid"`면 바로 성공 응답하도록 해서 중복 호출에 대한 멱등성은 확보했지만, 두 요청이 정확히 동시에 들어오는 극단적인 race condition까지는 막지 않는다(실사용 트래픽 규모에선 영향 미미).
- **`getPayment` 실패 시 사용자 안내 부족**: 포트원 API 자체가 일시적으로 실패하면 502를 반환하고 토스트로 에러 메시지만 보여주는데, 재시도 버튼 등 복구 경로가 따로 없다.

## 5. 향후 제안

1. `/mypage/reservations` Supabase 연동 (결제 완료 주문이 실제로 보이도록)
2. 결제 취소/환불 플로우 추가 (`portone.cancelPayment` + 환불 정책 UI)
3. 웹훅 URL을 배포 도메인 기준으로 콘솔에 등록하고 실제 수신 테스트
4. 결제수단 버튼 디자인을 시안에 더 맞게 다듬기 (브랜드 가이드 확인 후 로고 사용 여부 결정)
