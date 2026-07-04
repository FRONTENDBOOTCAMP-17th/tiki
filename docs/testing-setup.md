# 테스트 기반 구축 (`bang/feat/final-sprint`)

> 목적: 프로젝트가 소유한 테스트를 0에서 최소 기반으로 올린다. (`review/` 폴더의 강사용 테스트와는 완전히 별개다.)
> 발표 전 안정성 확보가 목표라, 커버리지를 넓히기보다 잘 깨지는 순수 로직과 공개 동선을 먼저 잡았다.

## 1. 추가한 것

| 분류 | 경로 | 내용 |
|---|---|---|
| 단위 | `vitest.config.ts` | node 환경, `@` alias를 tsconfig와 동일하게 매핑 |
| 단위 | `tests/unit/*.test.ts` | `src/lib` 순수 함수 테스트 |
| E2E | `playwright.config.ts` | `npm run dev`를 띄워 공개 페이지 확인 (`.env.local` 필요) |
| E2E | `tests/e2e/public-routes.spec.ts` | 로그인 불필요한 동선 검증 |
| CI | `.github/workflows/ci.yml` | build 앞에 `npm test` 스텝 추가 |

`package.json`에 `"test": "vitest run"`, `"test:e2e": "playwright test"` 추가.

## 2. 단위 테스트

컴포넌트 테스트용 패키지(`@testing-library` 등)는 일부러 설치하지 않았다. 테스트를 위해 기존 코드를 리팩토링하지 않는다는 원칙 아래, 이미 순수 함수로 떨어져 있는 것들만 골랐다.

- `src/lib/format.ts` — 날짜/가격 포맷
- `src/lib/date.ts` — KST 변환
- `src/lib/reviews/validation.ts` — 리뷰 입력 검증
- `src/lib/api/api-response.ts` — success/fail 응답 셰이프
- 회원가입 에러 매핑

각 함수의 정상 입력 / 경계값 / 잘못된 입력을 위주로 짰다. 총 19개 케이스. 숫자를 늘리는 것보다 "고치다가 깨질 만한 곳"을 덮는 데 집중했다.

## 3. E2E

로그인이 필요 없는 공개 동선만 담았다. 세션/시크릿 없이도 돌아가는 범위로 한정한 것이다.

- `/` 홈 200 + 주요 섹션 렌더
- `/category`, `/search`, `/ranking` 200
- `/terms` 등 안내 페이지 200
- **UUID 형식이 아닌 `/not-a-uuid` 진입 시 404 (500이 아님)** — 최근에 고친 버그의 회귀 방지용. 이벤트 상세가 잘못된 경로에서 터지지 않는지 지킨다.
- 비로그인으로 `/seller` 진입 시 `/login`으로 리다이렉트
- 홈 첫 이벤트를 따라가 상세 HTML의 `og:title`이 이벤트명으로 들어가는지 (ID 하드코딩 없이 링크를 따라감)

## 4. CI

`ci.yml`의 build 스텝 앞에 `npm test`(단위)만 넣었다. E2E는 실제 서버와 Supabase 시크릿이 있어야 돌아가서 CI에 넣지 않았다 — 로컬에서 `npm run test:e2e`로 돌린다.

## 5. 실행법

```bash
npm test              # 단위 (빠름)
npx vitest            # watch 모드
npm run test:e2e      # E2E (.env.local 필요, dev 서버 자동 기동)
npx playwright test --ui   # 브라우저로 보면서
```

## 6. 한계 / 후속

- 컴포넌트/상호작용 단위 테스트는 없다. 필요해지면 `@testing-library/react` 도입부터 별도로 논의.
- E2E는 공개 동선까지만. 로그인 뒤 판매자/결제 흐름은 시크릿·시드 데이터가 필요해 범위에서 뺐다.
- E2E의 og:title 케이스는 홈에 노출된 이벤트가 하나도 없으면 스킵되도록 해뒀다(데이터 의존).
