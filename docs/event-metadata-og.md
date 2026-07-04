# 이벤트 상세 메타데이터 · 동적 OG 이미지 (`bang/feat/final-sprint`)

## 전 / 후

- 전: 모든 페이지가 `layout.tsx`의 기본 타이틀을 공유. 링크 공유 시 이벤트별 정보가 없음
- 후: 이벤트 상세에 `generateMetadata` + 동적 OG 카드. 공유하면 이벤트별 제목·설명·미리보기 이미지가 표시됨

## 변경 파일

| 경로 | 내용 |
|---|---|
| `src/app/[eventId]/page.tsx` | `generateMetadata` 추가, `getEventDetail`을 `cache()`로 감쌈 |
| `src/app/[eventId]/opengraph-image.tsx` (신규) | `next/og`로 1200×630 미리보기 카드 생성 |

## 동작 방식

- `generateMetadata`: `getEventDetail`을 `cache()`로 감싸 page 본문과 중복 조회를 막음. 이벤트가 있으면 제목·설명(앞 100자)·openGraph를, 없거나 형식이 안 맞으면 기본 메타데이터를 반환 (예외를 던지지 않음)
- `opengraph-image.tsx`: 파일 컨벤션이라 이 파일 하나가 `og:image`의 단일 소스. 포스터 + 제목 + 공연 기간/장소를 브랜드 컬러 카드로 그리고, 조회 실패 시 로고 카드로 폴백

## 렌더 확인

포스터가 `sharp`로 변환된 webp라, 실제 OG 이미지 라우트를 직접 호출해 확인했습니다. 실존 이벤트(webp 포스터)와 폴백 카드 모두 `200 image/png`로 정상 렌더됩니다(Next 16 기준).

미리보기는 상세 주소 끝에 `/opengraph-image`를 붙여 접속하면 바로 볼 수 있습니다.
