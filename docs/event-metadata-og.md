# 이벤트 상세 메타데이터 · 동적 OG 이미지 (`bang/feat/final-sprint`)

> 배경: 코드베이스 전체에 `generateMetadata`가 하나도 없어서 모든 페이지가 `layout.tsx`의 기본 타이틀을 공유했다. 이벤트 상세를 카톡/SNS에 공유하면 제목·설명·썸네일이 이벤트별로 뜨도록 붙였다.

## 1. 변경/추가 파일

| 경로 | 내용 |
|---|---|
| `src/app/[eventId]/page.tsx` | `generateMetadata` 추가, `getEventDetail`을 `cache()`로 감쌈 |
| `src/app/[eventId]/opengraph-image.tsx` (신규) | `next/og`로 1200×630 카드 생성 |

## 2. generateMetadata

- `getEventDetail`을 재사용하되, page 본문과 중복 호출되지 않게 React `cache()`로 감쌌다 (`getCachedEventDetail`). 같은 요청 안에서는 한 번만 조회된다
- 이벤트가 있으면 제목·설명(앞 100자)·openGraph를, UUID 형식이 아니거나 없으면 기본 메타데이터를 반환한다. `throw`는 하지 않는다 — `notFound()`는 page가 담당
- 조회가 실패해도 기본 메타데이터로 폴백해서, 메타데이터 때문에 페이지가 터지지 않게 했다

## 3. 동적 OG 이미지

`opengraph-image.tsx`는 파일 컨벤션이라, 존재하는 것만으로 Next가 `og:image`를 자동으로 채운다.

- 포스터 + 제목 + 공연 기간/장소를 브랜드 컬러(`#9B6FC0` / `#332A40` / `#F6F1FA`) 카드로 그린다
- 데이터 조회에 실패하면 로고 + 서비스명만 있는 기본 카드로 폴백

## 4. 겪은 함정 — og:image 중복

`generateMetadata`의 `openGraph.images`에 포스터 URL을 직접 넣고, 동시에 `opengraph-image.tsx`도 두면 `og:image`가 겹친다. 게다가 Next는 **`generateMetadata`가 `images`를 명시하면 파일 기반 이미지를 무시한다** (`hasOwnProperty('images')`로 판단). 즉 직접 만든 브랜드 카드가 안 쓰이고 원본 포스터만 나가고 있었다.

→ `generateMetadata`에서 `images`를 빼고 `opengraph-image.tsx`를 단일 소스로 일원화했다. (`ed1f679`)

## 5. 렌더 확인

포스터가 `sharp`로 변환된 **webp**라 `next/og`(Satori)에서 안 그려질까 걱정했는데, 실제 라우트를 돌려보니 실존 이벤트(webp 포스터)·폴백 카드(SVG 로고) 둘 다 `200 image/png`로 정상 렌더됐다 (Next 16 기준). 문제 없음.

## 6. 한계 / 후속

- OG 카드의 설명 텍스트는 아직 넣지 않았다(제목·기간·장소까지). 필요하면 카드에 요약 한 줄 추가 가능.
- 폴백 카드의 로고 URL은 `NEXT_PUBLIC_SITE_URL` 없으면 배포 도메인으로 하드코딩되어 있다. 도메인이 바뀌면 이 값을 확인해야 한다.
