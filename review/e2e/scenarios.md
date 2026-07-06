# TiKi 리뷰 전용 E2E 시나리오

대상: TiKi (티켓 예약 오픈마켓) — Next.js 16 + Turbopack, Tailwind v4, cva, Supabase
실행: `cd review/e2e && PORT=3201 npx playwright test tests/tiki-daily.spec.ts --reporter=line`
baseURL: `PORT` 환경변수로 지정(기본 3102, 9차 리뷰는 3201). webServer 가 `PORT=<포트> npm run dev` 자동 기동(이미 떠 있으면 재사용).

> 로그인: OAuth(Google/Kakao/Facebook) 외에 **`/join` 이메일 회원가입으로 역할(구매자/판매자) 선택**이 가능하다.
> 따라서 테스트 계정을 service-role(Admin API)로 만들어 **구매자·판매자 두 역할로 각각 로그인**해 검증한다.
> (판매자 버튼은 데스크톱 뷰포트에서만 노출 — 모바일은 구매자 가입만. `src/components/RoleForm.tsx:55`)

## 역할 모델 (2026-06-25 확인)

- 역할은 `users.role` 단일 컬럼. 값: `buyer` / `seller` (DB는 `string`이라 admin도 들어갈 수 있으나 가입 경로 없음).
- **판매자**: 가입 시 본인이 선택 → `users.role='seller'` + `seller_profiles`(organizer_name·store_name) 행. 별도 승인 절차 없음. 판매자 데이터는 `seller_id = user.id`로 연결.
- **관리자**: `login/action.ts:70`이 `role==='admin'`이면 `/admin`으로 보내지만 **`/admin` 이하가 빈 파일(미구현)**. 관리자 시나리오는 보류(스텁 도달만 확인).
- 역할 계정 시드: service-role로 buyer/seller 계정 생성(email_confirm) + seller는 `users.role='seller'`·`seller_profiles` 세팅. → `test-account.md`에 기록.

## 역할별 시나리오 (2026-06-25 재구성 — "쓰는 순서대로")

### [구매자]
| ID | 시나리오 | 단계 → 기대 |
| -- | -------- | ----------- |
| TB1 | 비로그인 탐색→상세 | `/` → `/search`·`/ranking`·`/category/[slug]`·`/open` → 이벤트 카드 → `/[eventId]` 상세(회차·등급·리뷰). 로그인 없이 열람, 예매는 로그인 유도 |
| TB2 | 구매자 가입 | `/join` "구매자" 선택 → 이메일/이름/전화/비번 → 제출 → verification_email_sent (또는 Admin API confirm 계정 사용) |
| TB3 | 로그인→예매→결제 | `/login` buyer 로그인(→`/`) → `/[eventId]`에서 회차·등급·수량 → 예매(`POST /api/orders`, status=ordered, 수수료5%) → `/payment/[orderId]`(본인 주문만 접근) |
| TB4 | 마이페이지 예약확인 | `/mypage`(→`/mypage/profile`) → `/mypage/reservations`에 TB3 예매건 노출 → library·settings 순회 |
| TB5 | 비로그인 보호라우트 가드 | 로그아웃 상태 `/mypage/reservations`·`/seller` 직접 접근 → `/login` 리다이렉트 기대 (proxy.ts 미들웨어 동작 실측 — `PROTECTED_ROUTES`에 `/mypage` 누락 의심) |

### [판매자]
| ID | 시나리오 | 단계 → 기대 |
| -- | -------- | ----------- |
| TS1 | 판매자 가입(데스크톱) | `/join`(1280) "판매자" 선택 → 단체명·스토어명 입력 → 가입. 모바일(390)에선 판매자 버튼 미노출 확인 |
| TS2 | 로그인→판매자 대시보드 | `/login` seller 로그인 → `/seller`(role=seller만 통과, 아니면 "판매자만 접근") → 통계 카드. 모바일이면 "데스크탑에서 이용" 안내 |
| TS3 | 이벤트 등록 | `/seller/registration` → 카테고리·제목·장소·회차(slot)·등급(가격/수량) → 저장(`POST /api/seller/event`, status="비공개") → `/seller/list`에 노출(본인 seller_id) |
| TS4 | 이벤트 상세/수정 | `/seller/events/[id]` → `/seller/events/[id]/edit` 수정·저장(본인 것만) |
| TS5 | 주문·티켓 관리 (사용자→판매자 연결) | `/seller/ticketManagement` → TB3에서 구매자가 산 주문이 판매자 화면에 반영되는지 |
| TS6 | 정산·스토어정보 | `/seller/settlement` → `/seller/storeInfo` 사업자10자리·계좌10~16자리 검증 입력 → `/seller/reviews` |
| TS7 | [보안] buyer가 판매자 API 직접 호출 | buyer 세션 쿠키로 `POST /api/seller/event` 호출 → role 검사 부재라 통과되는지 실측(통과 시 `[필수]` 인가 누락) |

### [관리자] — 보류
| TA1 | admin 스텁 도달 | `/admin` 및 `/admin/{category,member,dashboard,event}` → 현재 빈 파일(미라우팅)·가드 없음 확인. 정식 시나리오는 기능 구현 후 |

## 발견 (2026-06-25) — 역할별 라이브 E2E (공개 동선 + 가드)

dev 3201. `tests/tiki-role.spec.ts`(신규). 캡처 `review/images/2026-06-25/tiki-*`. **8/8 pass(공개 범위).**

- **[필수][신규·인프라] 역할 계정 시드 불가 — service_role 권한 회수 + Admin 생성 500.**
  실측: `GoTrue /auth/v1/admin/users`로 계정 생성 시 **HTTP 500**(auth→public.users 트리거 실패 추정). service_role 키로 `GET/PATCH /rest/v1/users` 시 **42501 permission denied**("GRANT SELECT, UPDATE ON public.users TO service_role" 힌트). `seller_profiles`도 동일. → **로그인 후 구매자/판매자 여정을 자동화로 실측할 수 없음**(이메일 확인 가입만 가능). 더 중요한 건, service-role을 쓰는 서버 코드가 있다면 같은 이유로 깨진다는 점 — 콘솔에서 service_role 그랜트 복구 필요.
- **[칭찬/해결] 역할 가드 정상.** 비로그인 `/mypage/profile` → `/login`, `/seller`·`/seller/registration`·`/seller/settlement` 모두 → `/login` 리다이렉트. 9차 [필수] "마이페이지 가드 부재"가 **해결**됨(미들웨어/레이아웃 가드).
- **[칭찬] 공개 구매자 동선 정상.** 홈·`/search`·`/ranking`·`/open`·이벤트 상세(`/[eventId]`) 모두 200(kanto와 달리 익명 목록 정상). 단 `/api/events/search` items 0(시드 없음)이라 상세는 mock 폴백.
- **[참고] 회원가입은 4스텝(약관→…) 플로우.** 판매자 역할 버튼이 데스크톱 전용인지(RoleForm.tsx:55)는 약관 다음 스텝이라 이번 캡처로는 미확정 — 폼 진행 자동화로 다음 회차 확인.

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

## 9차 추가 (2026-06-19) — 백엔드 연결·판매자 이벤트 관리·미들웨어 가드

| ID | 시나리오 | 대상 | 기대 | 결과 |
|----|----------|------|------|------|
| T8 | 이벤트 상세 | `/eventDetail/1` | 200 렌더 | pass (200, 상세 API 연결됐으나 시드 없어 mock 폴백 — slots/grades 여전히 mock) |
| T11 | 마이페이지 가드 | `/mypage` | 비로그인→/login | **fail — `/mypage/profile` 그대로 200(가드 여전히 없음)** |
| T20~T22 | 판매자 가드 | `/seller/*` 전체 | 비로그인→/login | **pass — 미들웨어(proxy.ts)가 `/seller` 전부 `/login`으로 막음(신규 해결)** |
| T23 | 친구 관리(신규) | `/mypage/friends` | (가드 대상) | 200 — 비로그인 접근됨(가드 없음, 더미 데이터) |
| T24 | 설정(약관/탈퇴/비번) | `/mypage/settings` | 200 | pass — 약관·개인정보 모달 연결, 탈퇴 2단계, 비번변경 모달(서버액션 TODO) |
| T25 | 라이브러리·예매내역(신규 라우트) | `/mypage/library`, `/mypage/reservations` | 200 | pass(렌더, 가드 없음) |
| T26 | 이벤트 상세 API 에러 노출 | `GET /api/events/1`(비-uuid) | 4xx + 일반 메시지 | **fail — HTTP 500 + 원문 `invalid input syntax for type uuid: "1"` 노출** (valid-uuid는 404 event_not_found 정상) |
| T27 | 주문 API 인증 가드 | `POST /api/orders`(비로그인) | 401 | pass(401 unauthorized) |

발견(9차):
- **[부분해결] 8차 [필수] 로그인 가드**: `/seller`는 미들웨어(`proxy.ts` + `PROTECTED_ROUTES=['/seller']`)로 전부 막힘(해결). 그러나 `PROTECTED_ROUTES`에 `/mypage`가 빠져 **마이페이지는 여전히 무방비**(T11/T23/T25). `mypage/layout.tsx`도 `Header loggedIn` 하드코딩 유지.
- **[필수·신규] `/api/events/[eventId]` 원문 DB 에러 노출**: 비-uuid id → 500 + `invalid input syntax for type uuid` 노출. 회원가입 에러 노출과 같은 패턴(원문→일반 메시지+로그).
- **[신규 백엔드 연결]** 이벤트 상세 API(`/api/events/[eventId]`, reviews), 주문(`/api/orders`, 인증·재고·회차 검증), 판매자 이벤트 CRUD(`/api/seller/event`, `[id]`, stats) 추가. tsc 0·build 38라우트 성공.
- 한계: service role 키 없음·시드 없음 → 로그인 후/실데이터 화면은 다음 회차(여전히).

## 19차 추가 (2026-07-06) — 판매자 스태프 관리 + 공연별 체크인 (신규 도메인)

포트 3201(dev). 스펙 `tests/tiki-daily.spec.ts`, 캡처 `review/images/2026-07-06/`.
일반 사용자 여정 → 판매자 여정(스태프 초대) → 스태프 여정(수락→체크인) 순서로 실행.

| ID | 시나리오 | 대상 | 기대 | 결과(2026-07-06) |
|----|----------|------|------|-----------------|
| S01 | 홈(데스크톱) | `/` | 200, 랭킹/추천 렌더 | pass |
| S02 | 홈(모바일 390) | `/` | 200 | pass |
| S03 | 카테고리 + 상세 진입 | `/category` → 카드 클릭 | 200 | pass |
| S04 | 비로그인 스태프 가드(신규) | `/staff` 비로그인 | `/login?next=/staff` 리다이렉트 | **pass** |
| S05 | 판매자 로그인→대시보드 | 로그인(sellertest) | role별 리다이렉트 `/seller` | pass |
| S06 | 예매관리 서버 페이지네이션/CSV(신규) | `/seller/ticketManagement` | 200, 필터/정렬/CSV 버튼 | pass(주문 0건 빈상태) |
| S07 | 스태프 초대(신규) | `/seller/staff`에서 usertest 초대 | "초대를 보냈습니다" | **pass**(재실행 시 "이미 초대" 멱등) |
| S08 | 스태프 로그인→초대 수락(신규) | 로그인(usertest)→/staff 수락 | pending→담당 공연 이동 | **pass** |
| S09 | 배정 공연 체크인(신규) | `/staff/checkin/{배정 eventId}` | 스캐너+수동입력 폴백 렌더 | **pass**(헤드리스라 카메라 불가→수동입력 폴백 정상) |
| S10 | 미배정 공연 체크인 차단(신규·인가) | `/staff/checkin/{미배정 eventId}` | "배정되지 않은 공연입니다" | **pass** |

보안 실측(anon/service-role REST):
- anon `POST /rest/v1/rpc/invite_event_staff` → **401 permission denied**(authenticated에만 grant). pass
- anon `GET /rest/v1/event_staff` → **200 `[]`**(RLS 정책 없음 → 전 행 차단). pass
- `checkin_ticket` RPC: staff는 해당 주문 이벤트에 accepted 배정된 경우만 통과(코드 확인). 페이지 가드와 이중 방어.

발견(19차):
- **스태프 도메인 전체 인가 견고**(김연수/harilog). RLS(정책0)+SECURITY DEFINER RPC로만 접근, 초대는 공연 소유자만, 수락/거절은 본인만, 체크인은 배정된 공연만. **신규 [필수] 없음**.
- [제안] CSV 내보내기(방효진/lllillly) 수식 인젝션 방어 없음(`= + - @` 시작 셀). [제안] `NEXT_PUBLIC_SITE_URL` 끝 슬래시→OAuth 콜백 `//auth/callback` 이중슬래시. [사소] login `data!.role` non-null 단언.
- 이월 [필수] 아님(운영/발표): README 라이브 데모 링크 부재 + Vercel 배포 stale(sitemap 07-01·구 `/support` 경로·`//` — **현재 소스는 정상**, 재배포만 필요) + 팀원표 "작성 예정" 4명.
- 정적: tsc 0(.next 캐시 정리 후)·eslint 0(앱)·build 성공(84라우트)·vitest 6파일 19테스트 pass.
