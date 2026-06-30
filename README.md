<div align="center">
  <img src="./public/tiki-character-readme.svg" alt="TiKi 캐릭터 로고" width="170" />

  <h1>TiKi</h1>

  <p>
    소규모 공연 기획자, 프리랜서 강사, 로컬 이벤트 주최자 등<br />
    대형 플랫폼 입점이 어려운 판매자를 위한 예약형 티켓 오픈마켓 플랫폼입니다.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [팀원 소개](#팀원-소개)
- [주요 기능](#주요-기능)
- [페이지 구성](#페이지-구성)
- [실행 방법](#실행-방법)
- [파일 구조](#파일-구조)
- [관련 문서](#관련-문서)
- [트러블 슈팅](#트러블-슈팅)
- [Git 컨벤션](#git-컨벤션)

---

## 프로젝트 소개

`TiKi`는 소규모 공연 기획자, 프리랜서 강사, 로컬 이벤트 주최자 등 대형 플랫폼 입점이 어려운 다양한 판매자가 일정 기반 상품(공연, 클래스, 전시, 팬미팅 등)을 직접 등록하고 판매할 수 있는 예약형 오픈마켓 플랫폼입니다.

판매자는 티켓(상품)을 등록하고 날짜/시간 슬롯을 구성할 수 있으며, 구매자는 원하는 일정과 좌석을 선택해 예매합니다. 예매 완료 후에는 QR 티켓이 발급되고, 관람 이후에는 라이브러리에 기록이 남아 티켓팅 이후의 경험까지 이어집니다.

또한 친구 기능을 통해 예매한 티켓을 다른 사용자에게 공유할 수 있으며, 받은 티켓은 마이페이지에서 확인하고 입장 티켓으로 사용할 수 있습니다.

```text
티켓(상품) 등록
  -> 날짜/시간 슬롯 선택
  -> 예매(주문)
  -> QR 발급
  -> 친구에게 티켓 공유
  -> 입장
  -> 라이브러리 기록
```

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | `TiKi` |
| 프로젝트 기간 | `2026.05.28 ~ 2026.07.08` |
| 발표일 | `2026.07.08` |
| 개발 방식 | `Next.js + TypeScript + Supabase` |
| 주요 도메인 | `티켓 예매`, `좌석 선택`, `판매자 이벤트 관리`, `관리자 운영` |

## 팀원 소개

| 이름 | 역할 | 작성 페이지 / 기능 |
| --- | --- | --- |
| 강재훈 | Team Leader | 작성 예정 |
| 김연수 | Team Member | 작성 예정 |
| 방효진 | Team Member | 작성 예정 |
| 이선우 | Team Member | 작성 예정 |

## 주요 기능

| 구분 | 기능 |
| --- | --- |
| 홈 | 히어로 슬라이더, 티켓 오픈 섹션, 예매 랭킹, 추천 이벤트, 베스트 리뷰, 카테고리별 이벤트 목록 |
| 이벤트 탐색 | 검색, 카테고리별 조회, 랭킹 조회, 최근 검색어 |
| 이벤트 상세 | 공연 정보 조회, 상세 이미지 조회, 카카오 지도 기반 장소 확인, 회차 선택, 좌석/등급 선택, 리뷰 조회 및 작성 |
| 예매 / 결제 | 좌석 배치도 기반 좌석 선택, 등급/수량 기반 예매, PortOne V2 결제 연동, 결제 검증, 주문 및 재고 복구 |
| 친구 / 티켓 공유 | 친구 요청, 친구 목록 조회, 예매 티켓 공유, 받은 티켓 / 보낸 티켓 조회, 공유 티켓 수락·거절 |
| 마이페이지 | 예매 내역 조회, 공연 라이브러리, 친구 관리, 프로필 수정, 1:1 문의 |
| 판매자 페이지 | 판매자 대시보드, 이벤트 등록 / 수정, 좌석 배치도 관리, 예매 관리, 리뷰 관리, 정산 관리, 스토어 정보 관리 |
| 관리자 페이지 | 회원 관리, 이벤트 관리, 카테고리 관리, 문의 답변, 공지/알림 관리 |

## 페이지 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 |
| `/search` | 검색 |
| `/category` | 카테고리 |
| `/category/[slug]` | 카테고리별 이벤트 목록 |
| `/ranking` | 랭킹 |
| `/[eventId]` | 이벤트 상세 |
| `/payment/[orderId]` | 결제 |
| `/login` | 로그인 |
| `/join` | 회원가입 |
| `/mypage/reservations` | 예매 내역 |
| `/mypage/library` | 공연 라이브러리 |
| `/mypage/friends` | 친구 관리 |
| `/mypage/profile` | 프로필 |
| `/mypage/settings` | 설정 |
| `/mypage/inquiries` | 1:1 문의 |
| `/seller` | 판매자 대시보드 |
| `/seller/registration` | 이벤트 등록 |
| `/seller/list` | 판매자 이벤트 목록 |
| `/seller/events/[id]` | 판매자 이벤트 상세 |
| `/seller/events/[id]/edit` | 이벤트 수정 |
| `/seller/events/[id]/seat-layout` | 좌석 배치도 편집 |
| `/seller/ticketManagement` | 예매 관리 |
| `/seller/reviews` | 리뷰 관리 |
| `/seller/settlement` | 정산 |
| `/seller/storeInfo` | 스토어 정보 |
| `/admin` | 관리자 대시보드 |
| `/admin/categories` | 카테고리 관리 |
| `/admin/events` | 이벤트 관리 |
| `/admin/members` | 회원 관리 |
| `/admin/inquiries` | 문의 관리 |
| `/admin/notifications` | 공지/알림 관리 |

## 실행 방법

```bash
npm install
npm run dev
```

빌드와 린트:

```bash
npm run build
npm run lint
```

환경 변수는 `.env.example`을 복사해 `.env.local`에 작성합니다.

```bash
cp .env.example .env.local
```

## 파일 구조

```text
tiki/
|-- README.md
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- public
|   |-- tiki.svg
|   `-- ...
|-- docs
|   `-- ...
|-- review
|   |-- e2e
|   |-- unit
|   `-- *.md
|-- supabase
|   `-- migrations
|-- src
|   |-- app
|   |   |-- _components
|   |   |   `-- home
|   |   |-- [eventId]
|   |   |   |-- _components
|   |   |   `-- page.tsx
|   |   |-- admin
|   |   |   |-- categories
|   |   |   |-- events
|   |   |   |-- inquiries
|   |   |   |-- members
|   |   |   |-- notifications
|   |   |   |-- layout.tsx
|   |   |   `-- page.tsx
|   |   |-- api
|   |   |   |-- auth
|   |   |   |-- categories
|   |   |   |-- events
|   |   |   |-- orders
|   |   |   |-- payments
|   |   |   `-- seller
|   |   |-- auth
|   |   |-- category
|   |   |   |-- _components
|   |   |   |-- [slug]
|   |   |   `-- page.tsx
|   |   |-- join
|   |   |-- login
|   |   |-- mypage
|   |   |   |-- friends
|   |   |   |-- inquiries
|   |   |   |-- library
|   |   |   |-- profile
|   |   |   |-- reservations
|   |   |   |-- settings
|   |   |   `-- layout.tsx
|   |   |-- open
|   |   |-- payment
|   |   |   `-- [orderId]
|   |   |-- privacy
|   |   |-- ranking
|   |   |-- search
|   |   |-- seller
|   |   |   |-- _components
|   |   |   |-- _lib
|   |   |   |-- events
|   |   |   |-- list
|   |   |   |-- registration
|   |   |   |-- reviews
|   |   |   |-- settlement
|   |   |   |-- storeInfo
|   |   |   |-- ticketManagement
|   |   |   |-- layout.tsx
|   |   |   `-- page.tsx
|   |   |-- support
|   |   |-- terms
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components
|   |   |-- Search
|   |   |-- event
|   |   |-- icons
|   |   |-- modal
|   |   |-- mypage
|   |   |-- policies
|   |   |-- reviews
|   |   |-- sidebar
|   |   `-- ...
|   |-- hooks
|   |-- lib
|   |   |-- api
|   |   |-- auth
|   |   |-- event
|   |   |-- image
|   |   |-- mypage
|   |   |-- portone
|   |   |-- reviews
|   |   |-- seat
|   |   `-- supabase
|   |-- types
|   `-- proxy.ts
```

## 관련 문서

| 문서 | 내용 |
| --- | --- |
| [홈 화면 리팩토링/개선 작업](./docs/home-refactor.md) | 홈 화면 구조 개선 및 성능/안정성 정리 |
| [결제 기능 개발 문서](./docs/payment-feature.md) | PortOne 결제 연동과 검증 흐름 |
| [좌석 선택/배치도 기능 개발 계획](./docs/seat-selection-feature-plan.md) | 좌석 선택 기능 설계 |
| [좌석 선택/배치도 기능 구현 정리](./docs/seat-selection-implementation-summary.md) | 좌석 기능 실제 구현 내역 |
| [결제 취소 주문 트러블슈팅](./docs/troubleshooting-payment-cancel-leak.md) | 결제 취소 시 주문 누락/재고 복구 문제 해결 |
| [프론트엔드 테스트 가이드](./review/202606300919-프론트엔드-테스트-가이드.md) | 단위 테스트 및 E2E 테스트 가이드 |
| [SEO 가이드](./review/seo-가이드.md) | SEO 점검 및 개선 가이드 |
| [E2E 시나리오](./review/e2e/scenarios.md) | 역할별 E2E 테스트 시나리오 |

## 트러블 슈팅

| 문제 | 원인 | 해결 방식 | 리뷰 |
| --- | --- | --- | --- |
| 검색 페이지 500 에러 | 외부 이미지 도메인이 Next 이미지 설정에 등록되지 않음 | `next.config.ts`에 `picsum.photos` remote pattern을 추가해 이미지 렌더링 오류 해결 | 8차 리뷰 `202606180954-리뷰.md` |
| 이벤트 상세에서 공연장 위치 확인이 어려움 | 텍스트 주소만 제공되어 사용자가 위치를 바로 파악하기 어려움 | 카카오맵을 연동하고 상세 레이아웃 폭을 조정해 장소 정보를 시각적으로 확인 가능하게 개선 | 14차 리뷰 `202606290959-리뷰.md` |
| 이벤트 상세 포스터 확인성이 낮음 | 포스터가 고정 크기로만 노출되어 이미지 확인이 어려움 | 포스터 돋보기 확대 기능 추가 | 14차 리뷰 `202606290959-리뷰.md` |
| 예매 박스에서 날짜/좌석 상태 판단이 어려움 | 가까운 회차 기본 선택, 지난 날짜 비활성화, 등급별 잔여석 표시가 부족함 | 가까운 날짜 기본 선택, 이전 날짜 비활성화, 등급별 매진/잔여좌석 표시 추가 | 14차 리뷰 `202606290959-리뷰.md` |
| 판매자 스토어 정보 API 인증/수정 범위 관리 필요 | 스토어 정보 수정 시 사용자 인증과 수정 가능한 필드 제한이 필요함 | 로그인 사용자 확인 후 허용된 필드만 부분 업데이트하도록 정리 | 8차 리뷰 `202606180954-리뷰.md` |
| 판매자 페이지 UI 일관성 부족 | 빈 상태, 정보 필드, 상태 배지가 화면마다 다르게 구현됨 | `EmptyState`, `InfoField` 공통 컴포넌트 분리 및 판매자 화면 디자인 통일 | 14차 리뷰 `202606290959-리뷰.md` |
| 이벤트 이미지 업로드 관리 어려움 | 대표 이미지와 상세 이미지 처리 흐름이 분리되지 않고 클라이언트 부담이 큼 | WebP 변환, 대표/상세 이미지 분리, 서버 액션 기반 업로드 흐름으로 개선 | X |
| 예매 취소 시 재고 복구 로직 중복 | 취소 처리와 재고 복구가 화면/액션별로 흩어짐 | `cancel_order` RPC를 사용해 주문 취소와 재고 복구 흐름 일원화 | X |
| 티켓 공유 모달 동작 오류 | 친구 목록 조회와 공유 요청 흐름이 제대로 연결되지 않음 | 친구 목록 Supabase 연동 및 티켓 공유 server action 연결 | X |
| 홈이 service role 키에 의존해 루트가 500이 될 수 있음 | 공개 페이지에서 service role 클라이언트를 import 시점에 생성 | admin 클라이언트를 lazy 생성으로 변경하고, 랭킹 집계는 anon RPC로 전환 | 11차 리뷰 `202606230929-리뷰.md`, 12차 리뷰 `202606241000-리뷰.md` |
| 결제 취소 후 미결제 주문이 예매 목록에 남음 | 결제창 취소 시 `orders.status='ordered'` 상태가 유지됨 | 결제 실패/취소 시 주문 취소 처리, 예매 목록은 `paid/cancelled`만 조회, TTL 정리 배치 추가 | 14차 리뷰 `202606290959-리뷰.md` |

## Git 컨벤션

| 타입 | 설명 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `style` | 스타일 수정 |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `chore` | 설정 및 기타 작업 |

예시:

```bash
feat: 좌석 선택 모달 추가
fix: 결제 취소 시 주문 상태 복구
docs: README 프로젝트 소개 정리
```
