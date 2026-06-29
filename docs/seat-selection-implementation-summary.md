# 좌석 선택/배치도 기능 구현 정리

브랜치: `lee/feat/reservation` · 작업 기간: 2026-06-29 ~ 2026-06-30
사전 설계는 [seat-selection-feature-plan.md](seat-selection-feature-plan.md) 참고. 이 문서는 **실제로 구현/수정된 내용**을 정리한다.

## 1. 전체 개요

기존엔 등급(일반석/VIP석) + 수량만으로 예매하던 구조였는데, 판매자가 좌석을 자유롭게 배치하고 구매자가 좌석을 직접 클릭해서 예매하는 기능을 추가했다. 그 과정에서 발견된 결제/예매 흐름의 기존 버그도 같이 고쳤다.

- **판매자**: 무대/좌석을 드래그로 자유 배치하는 빌더, 프리셋(사각형/원형/부채꼴) 생성, 좌석 그룹·등급 관리, 등급 자동배정
- **구매자**: 날짜→회차→좌석선택 순서가 강제되는 예매 흐름, 좌석 선택 모달, 다른 사용자의 실시간 선택 표시
- **버그 수정**: 결제 취소 시 예매목록에 남는 문제, 이벤트 등록 400 에러 원인 노출, 예매 건수가 결제 대기/취소 주문까지 합산되던 문제, 회원가입 컨펌 시 서버 트리거 컬럼명 오류, 좌석 라벨 중복/형식, 무한 렌더 루프(범위 밖이라 최종 반영은 보류)

## 2. DB 스키마 변경

### 2-1. `supabase/migrations/20260629120000_seat_layout.sql`
- `seat_layout`: 이벤트당 1개, 무대 위치/크기(`stage_x/y/width/height`, % 단위)
- `seat`: 좌석 좌표(`pos_x/pos_y`, %)와 라벨, `grade_id`(등급 FK)
- `order_seat`: **잡혔거나 팔린 좌석만 행이 존재하는 sparse 테이블**. `(seat_id, slot_id)` 복합 PK가 동시성 충돌 방지 역할을 겸함 — 이미 누가 잡은 좌석에 INSERT하면 PK 충돌로 자동 실패
- RLS: `seat_layout`/`seat`는 공개 읽기 + 판매자(`event.seller_id`)만 쓰기. `order_seat`은 직접 쓰기 정책 없음(RPC를 통해서만 변경)

### 2-2. `supabase/migrations/20260629120100_seat_order_rpcs.sql`
- `place_seat_order(p_event_id, p_slot_id, p_grade_id, p_seat_ids, p_total_price)`: 좌석 단위 예매. `ticket_grade.quantity` 차감 후 `order_seat`에 좌석들을 한 번에 INSERT — 이미 잡힌 좌석이 섞여 있으면 PK 충돌로 `SEAT_TAKEN` 예외
- `cancel_order` 확장: 취소 시 `order_seat`에서 해당 주문의 좌석 행도 같이 삭제(해제)
- `cancel_stale_orders` 확장: TTL 만료로 취소되는 주문의 좌석도 같이 해제

### 2-3. `supabase/migrations/20260629140000_seat_group_name.sql`
- `seat.group_name` 컬럼 추가 — 등급과 별개로 좌석을 자유 텍스트 구역으로 묶기 위함

> **적용 필요**: 이 환경엔 `supabase/config.toml`(project link)이 없어서 `supabase db push`로 자동 적용이 안 됨. **3개 마이그레이션 모두 Supabase 대시보드 SQL Editor에서 순서대로 직접 실행해야 함.** (이미 안내했고, 적용 확인됨 — `seat.group_name` 컬럼 누락으로 500 에러 났던 사례 있었음)

## 3. 백엔드/API 변경

| 파일 | 내용 |
|---|---|
| `src/app/api/payments/confirm/route.ts` | 결제 성공 시 `order_seat.status`를 `held`→`sold`로 전환 (안 하면 TTL 배치가 결제완료 좌석을 풀어버림) |
| `src/app/api/orders/seats/route.ts` (신규) | 좌석 기반 주문 생성. `place_seat_order` RPC 호출, `SEAT_TAKEN`→409 매핑 |
| `src/app/api/seller/event/[id]/seat-layout/route.ts` (신규) | 좌석 배치도 저장. 이미 판매/홀드된 좌석이 있으면 좌표 변경 차단, 등급별 좌석 수 합계를 넘는 저장 차단(서버 측 재검증) |
| `src/app/api/seller/event/route.ts` | 이벤트 생성 시 기본 좌석 배치도 자동 생성 로직 추가 (`generateDefaultLayout` 호출) |
| `src/lib/seat/defaultLayout.ts` (신규) | 등급 좌석 수 합계만큼 정사각형에 가까운 그리드를 만들고, 등급 순서대로(가격 낮은 순) 채우는 순수 함수 |
| `src/lib/event/queries.ts` | `getSeatLayout(eventId)` 추가 — 배치도 없으면 `null` 반환(기존 수량 기반 예매로 폴백) |

## 4. 판매자: 좌석 배치도 빌더

`src/app/seller/_components/SeatLayoutBuilder.tsx` (961줄, 이번 작업에서 가장 큰 파일) + `src/app/seller/events/[id]/seat-layout/` 페이지/클라이언트.

구현된 기능, 시간순으로:

1. **캔버스 골격**: `@dnd-kit/core`의 `useDraggable`로 무대(`StageBlock`)/좌석(`SeatDot`)을 자유 드래그. 좌표는 캔버스 % 기준
2. **줄 추가 / 다중선택 / 등급지정**: N개 좌석을 한 번에 생성, 빈 배경 드래그로 영역 선택, 선택 좌석에 등급 일괄 지정(등급별 고정 색상)
3. **저장 API 연동**: `/api/seller/event/[id]/seat-layout` POST, 이미 판매된 회차가 있으면 잠금
4. **좌석 모양/라벨**: 원형 dot → 사각형, 좌석 라벨(접두사+번호) 항상 표시
5. **드래그 보정**: `onDragStart`/`onDragMove`로 실시간 픽셀 이동량을 추적해 드래그 중 커서를 즉시 따라가게 함(기존엔 드롭 순간에만 위치 갱신). 다중 선택된 좌석 중 하나를 끌면 선택된 전체가 같이 이동
6. **배치 프리셋**: 정사각형/직사각형/원형/부채꼴(공연장형) 4종. 부채꼴은 무대를 기준점으로 행이 늘어날수록 반지름이 커지는 방식
7. **좌석 라벨 편집**: 1개 선택 시 직접 텍스트 수정, 여러 개 선택 시 접두사+시작번호로 화면 위치 순서대로 일괄 재번호
8. **좌석 그룹(구역)**: 등급과 별개로 자유 텍스트 그룹명 지정, 그룹 인스펙터(그룹별 좌석 수/이름변경/그룹단위 선택/그룹해제), **그룹 회전**(중심점 기준 회전, 캔버스 4:3 비율 보정 포함)
9. **간격 설정**: "줄 추가"엔 가로 간격, 직사각형/정사각형 프리셋엔 가로+세로 간격, 부채꼴엔 시작 반지름+줄 간격(같은 입력칸을 라벨만 바꿔 재사용)
10. **좌석 총개수 제한**: 등급별 좌석 수(VIP+일반) 합계를 넘는 좌석 생성 차단. 줄 추가는 남은 자리만큼만 잘라서 생성, 프리셋은 모양이 깨지니 통째로 차단. 서버 API에도 동일 검증
11. **라벨 형식 통일**: 모든 프리셋이 "접두사+숫자"(예: A1, A2) 형식으로 통일, 기존 좌석과 안 겹치게 번호 자동 스킵
12. **등급 자동배정**: 좌석 추가 시 가격 낮은 등급(보통 일반석)부터 그 등급 quantity만큼 자동 배정, 다 차면 다음 등급(VIP석)으로 자동 전환
13. **이벤트 생성 시 기본 배치도 자동 생성**: 위 11/12와 동일한 규칙으로 이벤트 생성 직후 서버에서 한 번 만들어줌(판매자가 직접 배치 안 해도 기본 형태가 있음)

## 5. 구매자: 예매 흐름

`src/components/event/BookingPanel.tsx`, `BookingWidget.tsx`, `SeatSelectionModal.tsx`(신규).

1. **좌석 선택 UI 1차 버전**: `SeatPicker`(읽기전용 캔버스)를 BookingPanel에 인라인 삽입 — 이후 모달 방식으로 교체되며 삭제됨
2. **주문 분기**: `BookingWidget`이 `seatIds` 존재 여부로 `/api/orders`(수량 기반) vs `/api/orders/seats`(좌석 기반) 호출 분기
3. **결제 페이지에 좌석 라벨 표시**: `order_seat`↔`seat` 조인으로 좌석 라벨 조회, "좌석 A1, A2" 형태로 노출
4. **예매 단계 강제**: 날짜→회차→등급/좌석 순서로, 회차를 선택해야 다음 단계가 보이게 변경
5. **좌석 선택을 모달로 분리** (`SeatSelectionModal`): 좌석 배치도가 있는 이벤트는 인라인 캔버스 대신 "좌석 선택하기" 버튼으로 모달을 띄움. 모달 안에서 등급 탭 + 좌석 캔버스를 같이 처리:
   - 등급을 안 고르고 좌석을 바로 클릭하면 그 좌석의 등급이 자동 선택
   - 다른 등급으로 바꾸면 선택된 좌석은 초기화(한 주문은 등급 하나만 가능)
   - 모달을 닫으면 패널에 선택한 좌석 라벨이 요약되어 보임
   - "취소"/"선택 완료" 버튼으로 명시적으로 닫기 가능
   - "바로 예매" 버튼은 좌석이 1석 이상 선택돼야 활성화
6. **실시간 선택 표시**: 같은 회차의 모달을 보고 있는 다른 사용자가 지금 고르고 있는 좌석을 점선 노란색으로 표시하고 클릭 차단. 처음엔 Supabase Realtime **Presence**로 구현했으나, Presence의 `sync`/`leave` 리스너가 안 터지는 [알려진 플랫폼 이슈](https://github.com/supabase/realtime/issues/1807)로 해제 동기화가 안 되는 문제가 있어 **명시적 Broadcast 메시지(hold/release) + 4초 하트비트 + 10초 만료 정리**로 교체

## 6. 버그 수정 (기존 코드)

이번 작업 중 발견해서 같이 고친, 좌석 기능과 직접 관련 없는 기존 버그들:

| 버그 | 원인 | 수정 |
|---|---|---|
| 결제 취소(미결제) 티켓이 예매목록에 남고 공유도 막힘 | 결제위젯 취소 시 주문 상태를 되돌리는 코드가 없었음 + 예매목록 쿼리가 `cart`만 제외 | `PaymentForm.tsx`에서 취소/실패 시 `cancelReservation` 호출 + 예매목록 쿼리를 `status in ('paid','cancelled')`로 명시. TTL 배치(`cancel_stale_orders` + pg_cron)도 추가해 탭 강제종료 같은 예외 상황 보강 (별도 문서: [troubleshooting-payment-cancel-leak.md](troubleshooting-payment-cancel-leak.md)) |
| 이벤트 등록 시 400 에러만 뜨고 원인을 알 수 없음 | 폼이 서버가 보낸 `message`를 버리고 항상 같은 문구만 표시 | 진단 후 다시 원복(사용자 요청) — 원인은 좌석 수 최대치(1000개) 초과로 확인됨 |
| 회원가입 이메일 컨펌 시 `unexpected_failure` | DB 트리거 함수(`handle_verified_user`, git에 없음)가 `seller_profiles`에 `user_id` 컬럼으로 INSERT — 실제 컬럼명은 `id` | 사용자가 Supabase 대시보드에서 직접 함수 수정 (이 리포 코드는 변경 없음) |
| 이벤트 관리 페이지 예매 건수가 결제대기 주문까지 즉시 카운트, 취소해도 안 줄어듦 | `orders` 집계 쿼리에 status 필터 없음 | `status='paid'`만 집계하도록 수정 (`seller/events/[id]/page.tsx`) |
| 대시보드/정산/예매관리 통계도 결제대기 주문이 매출에 섞임 | `isBooked()` 헬퍼가 "취소만 아니면 예매"로 판정 | `status==='paid'`만 예매로 엄격화. 상태 라벨도 "취소"/"예매"/"결제대기" 3단계로 분리(`seller/_lib/stats.ts`, `OrderTable.tsx`). 부수효과: 결제대기 주문엔 "예매 취소" 버튼이 더 안 보임(TTL 배치가 자동 정리하므로 의도된 동작) |
| 좌석 라벨이 "A1-1" 행-열 표기로 들쭉날쭉, 프리셋 반복 시 라벨 중복 | 프리셋마다 라벨 형식이 다르고 충돌 검사 없음 | `generateLabels()`로 공용화, 기존 라벨과 안 겹치는 번호만 사용 |

## 7. 타입/도메인

- `src/types/database.ts`: `order_seat`/`seat`/`seat_layout` 테이블 타입 추가, `seat.group_name` 반영
- `src/types/domain/seat.ts` (신규): `SeatLayout`/`Seat`/`SeatOccupancy` 프론트엔드용 camelCase 타입

## 8. 남은 한계 / 후속 과제

- **동시성**: 실제 이중예매 방지는 `order_seat`의 PK 제약(서버/DB 단)이 담당하며 안전함. 모달의 "실시간 선택 표시"는 순수 UX 보조 기능이라 어느 한쪽 동기화가 약간 늦어도 데이터가 깨지지 않음
- **DetailTabs.tsx 무한 렌더 루프**: 좌석 기능과 별개 페이지(`[eventId]` 상세 탭)에서 발견됐으나, 사용자가 "이번 작업 범위(좌석 선택) 밖"이라고 판단해 수정을 되돌림(`a270e62`) — 미해결 상태로 남아있음. `router.refresh()`가 일어나는 동작(리뷰 작성/수정 등) 후 URL에 `#reviews` 해시가 남아있으면 재발 가능
- **마이그레이션 3종 수동 적용 필요**: 위 2절 참고. Supabase MCP가 연결되면 이후엔 직접 적용 가능
- **그룹 기능은 시각적 구분이 없음**: 그룹 인스펙터의 "선택" 버튼으로만 멤버를 확인 가능, 좌석 자체에 그룹별 색상 등 표시는 없음(등급 색상과 겹치지 않게 하려고 보류)
