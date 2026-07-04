# 테스트 기반 구축 (`bang/feat/final-sprint`)

> 목적: 프로젝트에 없던 테스트를 최소 기반으로 마련합니다. 발표 전 안정성 확보가 우선이라, 넓은 커버리지보다 잘 깨지는 순수 로직과 공개 동선을 먼저 다뤘습니다.

## 1. 추가한 것

| 분류 | 경로 | 내용 |
|---|---|---|
| 단위 | `vitest.config.ts` | node 환경, `@` alias를 tsconfig와 동일하게 매핑 |
| 단위 | `tests/unit/*.test.ts` | `src/lib` 순수 함수 테스트 |
| E2E | `playwright.config.ts` | `npm run dev`를 띄워 공개 페이지 확인 (`.env.local` 필요) |
| E2E | `tests/e2e/public-routes.spec.ts` | 로그인 없이 접근하는 동선 검증 |
| CI | `.github/workflows/ci.yml` | build 앞에 `npm test` 스텝 추가 |

`package.json`에 `"test": "vitest run"`, `"test:e2e": "playwright test"`를 추가했습니다.

## 2. 단위 테스트

컴포넌트 테스트용 패키지는 도입하지 않고, 이미 순수 함수로 분리되어 있는 `src/lib`의 함수들만 대상으로 했습니다. 테스트를 위해 기존 코드를 바꾸지 않는다는 원칙을 지켰습니다.

- `src/lib/format.ts` — 날짜/가격 포맷
- `src/lib/date.ts` — KST 변환
- `src/lib/reviews/validation.ts` — 리뷰 입력 검증
- `src/lib/api/api-response.ts` — success/fail 응답 형태
- 회원가입 에러 매핑

각 함수의 정상 입력 / 경계값 / 잘못된 입력을 중심으로 총 19개 케이스를 작성했습니다. 케이스 수를 늘리기보다, 수정 중 깨지기 쉬운 지점을 덮는 데 집중했습니다.

## 3. E2E

로그인이 필요 없는 공개 동선만 담아, 별도 시크릿 없이도 돌아가는 범위로 한정했습니다.

- `/` 홈 200 + 주요 섹션 렌더
- `/category`, `/search`, `/ranking` 200
- `/terms` 등 안내 페이지 200
- UUID 형식이 아닌 `/not-a-uuid` 진입 시 404 (500이 아님) — 잘못된 경로에서도 이벤트 상세가 안전하게 처리되는지 지키는 회귀 방지 케이스입니다.
- 비로그인으로 `/seller` 진입 시 `/login`으로 리다이렉트
- 홈의 첫 이벤트를 따라가 상세 HTML의 `og:title`이 이벤트명으로 들어가는지 (ID 하드코딩 없이 링크를 따라감)

## 4. CI

`ci.yml`의 build 스텝 앞에 단위 테스트(`npm test`)만 넣었습니다. E2E는 실제 서버와 Supabase 시크릿이 필요해 CI에는 포함하지 않고, 로컬에서 `npm run test:e2e`로 실행합니다.

## 5. 실행법

```bash
npm test              # 단위 (빠름)
npx vitest            # watch 모드
npm run test:e2e      # E2E (.env.local 필요, dev 서버 자동 기동)
npx playwright test --ui   # 브라우저로 확인
```

## 6. 앞으로

- 컴포넌트/상호작용 단위 테스트가 필요해지면 `@testing-library/react` 도입부터 별도로 논의하면 좋겠습니다.
- E2E는 현재 공개 동선까지입니다. 로그인 이후 판매자/결제 흐름은 시드 데이터를 갖춘 뒤 확장할 수 있습니다.
