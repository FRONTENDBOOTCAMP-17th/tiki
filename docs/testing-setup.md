# 테스트 (`bang/feat/final-sprint`)

## 도입 전 / 후

| | 전 | 후 |
|---|---|---|
| 단위 | 없음 | vitest 19개 (`tests/unit`) |
| E2E | 없음 | Playwright 6개 (`tests/e2e`) |
| CI | lint + tsc + build | + `npm test`(단위) |

## 실행 방법

```bash
npm test              # 단위 (빠름)
npx vitest            # watch 모드
npm run test:e2e      # E2E (.env.local 필요, dev 서버 자동 기동)
npx playwright test --ui   # 브라우저로 확인
```

E2E는 실제 서버와 Supabase 시크릿이 필요해 CI에는 넣지 않고 로컬에서 실행합니다.

## 무엇을 테스트하나

**단위** — `src/lib`의 순수 함수만 대상. 각 함수의 정상/경계값/잘못된 입력.
- `format.ts`(날짜·가격), `date.ts`(KST 변환), `reviews/validation.ts`(리뷰 검증), `api/api-response.ts`(응답 형태), 회원가입 에러 매핑

**E2E** — 로그인 없이 접근하는 공개 동선.
- `/` 홈 200 + 주요 섹션
- `/category`, `/search`, `/ranking`, `/terms` 200
- UUID 형식이 아닌 `/not-a-uuid` 진입 시 404 (500이 아님)
- 비로그인으로 `/seller` 진입 시 `/login` 리다이렉트
- 이벤트 상세 HTML의 `og:title`이 이벤트명으로 들어가는지
