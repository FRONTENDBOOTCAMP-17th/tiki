# TiKi 리뷰 전용 E2E 시나리오

대상: TiKi (티켓 예약 오픈마켓) — Next.js 16 + Turbopack, Tailwind v4, cva, Supabase
실행: `cd review/e2e && npx playwright test tests/tiki-daily.spec.ts --reporter=line`
baseURL: http://localhost:3102 (webServer 가 `PORT=3102 npm run dev` 자동 기동)

> 현재 단계: 대부분 디자인 시스템 / 컴포넌트 카탈로그 단계.
> 실제 라우트는 `/`, `/home`(인증 가드), `/login`, `/auth/callback`, `/example/*` 데모로 제한적.
> 이메일 로그인 테스트 계정 없음 — OAuth 기반 인증이라 자동화 로그인은 제외, 공개/데모 페이지 위주 검증.

## 시나리오 표

| ID | 시나리오 | 대상 | 기대 | 비고 |
|----|----------|------|------|------|
| T1 | 홈/메인 렌더 | `/` (desktop 1280 + mobile 390) | 200, "임시 홈~" 표시 | 아직 임시 플레이스홀더 |
| T2 | 인증 가드 | `/home` (비로그인) | `/login`으로 리다이렉트 | 서버 컴포넌트 getUser 가드 |
| T3 | 로그인 렌더 | `/login` | OAuth 버튼 3종(Google/Kakao/Facebook) | 임시 로그인 버튼은 없음 |
| T4a | 모달 동작 | `/example/modal` | "확인 모달 열기" 클릭 → 모달 표시 | Dialog 컴포넌트 |
| T4b | 토스트 동작 + 색 | `/example/toast` | 정보 토스트 트리거, 파란 계열(#E2EEFB) 배경 | `]]` 버그 수정 재확인 |
| T4c | 네비게이션 렌더 | `/example/navigation` | 200 렌더 | |
| T5 | 필터 데모 렌더 | `/example/filter` | 200 렌더 | |

## 발견 (2026-06-16)

- **[필수] `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`에 `https://` 스킴 누락**
  값이 `nbpiaphpxsnqurlsnrnz.supabase.co` (스킴 없음).
  proxy(미들웨어)의 `createServerClient`가 `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL` throw →
  **모든 페이지(공개/데모 포함)가 미들웨어 단계에서 막혀** dev 서버가 정상 응답 못 함.
  matcher 가 거의 전 경로를 잡기 때문에 영향 범위가 큼.
  리뷰 중에는 로컬에서만 `https://`를 임시로 붙여 서버를 띄워 캡처했고, **원본 `.env.local`은 그대로 복원**함.
  (학생 repo 값은 손대지 않음. 각자 `.env.local` 값에 `https://` 추가 필요.)

- **[확인됨/수정 완료] Toast `]]` 대괄호 버그 수정됨.**
  `Toast.styles.ts`의 cva 배열 닫는 대괄호 정상. info 토스트 실측 배경 = `rgb(226, 238, 251)` = `#E2EEFB` (파란 계열).
  색 깨짐/투명 없음. 변형별 색(성공 초록/에러 빨강/경고 베이지/정보 파랑) 모두 렌더 확인.

- **[확인됨/수정 완료] proxy 미들웨어 전용 supabase client 분리됨.**
  `src/lib/supabase/middleware.ts`의 `createMiddlewareClient`를 `proxy.ts`가 사용. 구조 정리 양호.

- **[제안] Toast 다중 표시 시 스택 겹침.**
  토스트 여러 개를 연속 트리거하면 위치가 겹쳐 텍스트가 포개져 보임(T4b-toast-open 캡처).
  세로 스택(간격/오프셋) 처리 검토 권장.

- **[참고] T2/T3 캡처 동일.** `/home`이 비로그인 시 `/login`으로 리다이렉트되어 두 캡처가 같은 로그인 카드 화면.
  인증 가드 정상 동작의 증거.

## 7차 추가 (2026-06-17)
| T6 | /search 렌더(데스크톱·모바일) | `/search` | 200, 검색 페이지 | **fail 500 — picsum 이미지 호스트 미등록(next/image), EventCard.tsx:35 / page.tsx:228** |
| T7 | /api/events/search | API | 200 + items 배열 | pass(200, items:[] total:0 — 시드 데이터 없음) |

발견: 검색 API는 정상, 검색 페이지만 next/image 외부호스트(picsum.photos) next.config 미등록으로 500. tsc 0 클린.

## 8차 추가 (2026-06-18) — 도메인 화면 대거 진입, 사용자→판매자 순서

| ID | 시나리오 | 대상 | 기대 | 결과 |
|----|----------|------|------|------|
| T8 | 이벤트 상세(신규) | `/eventDetail/1` | 200 렌더 | pass (200, mock 폴백 — /api/events/[id] 미존재) |
| T9 | 회원가입 폼(신규) | `/join` | 200 폼 | pass |
| T10 | 로그인 폼 | `/login` | OAuth 3종 | pass |
| T11 | 마이페이지 인증가드(신규) | `/mypage` | 비로그인→/login | **fail — /mypage/profile 그대로 렌더(가드 없음)** |
| T12 | 회원가입 API 검증(신규) | `POST /api/auth/join` 빈본문 | 400 fail | pass(400 empty_email) |
| T20 | 판매자 스토어정보(신규) | `/seller/storeInfo` | 200 | pass(비로그인 빈 폼, getUser는 부르나 redirect 안 함) |
| T21 | 판매자 대시보드 | `/seller/dashboard` | 200 | pass(현재 스텁 `<div></div>`) |

발견(8차):
- **[해결] 7차 /search 500 → 200**: next.config images.remotePatterns에 picsum.photos 등록됨(T6 pass).
- **[필수] 마이페이지 인증 가드 부재**: mypage/layout.tsx에 getUser 가드 없음 + Header loggedIn 하드코딩. 비로그인 /mypage/* 접근(플레이스홀더라 데이터유출은 아님). home은 가드 있음→일관성 결여. layout에서 getUser→redirect 처방.
- **[신규 엔드포인트]** eventDetail(강재훈, mock 폴백·fetch 경합방어 좋음), join/login(이선우, 검증 또렷, error.message 원문노출 이월), mypage(김연수, 탈퇴 확인모달), seller store API(방효진, getUser 401+필드 화이트리스트 부분업데이트 — 좋음, 입력 형식검증 없음).
- tsc 0 클린, CI(build+tsc) 존재(칭찬). [제안] CI push 트리거+lint 이월.
- 한계: service role 키 없음·이메일 확인 필요 → 로그인 후 화면은 다음 회차.
