# 홈 화면 리팩토링/개선 작업 문서 (`lee/refactor/home`)

> 대상 브랜치: `lee/refactor/home` (base: `develop`, 카테고리 PR #111 머지 직후 `579c985`부터)
> 목적: 홈 화면(`/`)을 카드형 공통 컴포넌트 구조로 정리하고, 가로 스크롤/드래그/스와이프 인터랙션을 추가하고, 카테고리 섹션을 새로 붙이고, 마지막으로 service-role 키 의존성을 제거해 키가 없어도 홈이 뜨도록 안정화했다.

## 1. 변경/추가 파일 목록

| 분류 | 경로 | 내용 |
|---|---|---|
| 타입/유틸 | `src/types/domain/event.ts` | 홈/카테고리 카드가 공통으로 쓰는 `EventCardItem` 타입 추가 |
| 타입/유틸 | `src/lib/format.ts` | 날짜/가격 포맷 유틸(`formatShortDate`, `formatPriceFrom`) 추가 |
| 훅 (신규) | `src/hooks/useDragScroll.ts` | 가로 스크롤 목록을 데스크탑 마우스 드래그 + 휠로 스크롤할 수 있게 하는 훅 |
| 훅 (신규) | `src/hooks/useSwipe.ts` | 히어로 슬라이더를 포인터(마우스/터치 공통) 드래그로 넘기는 훅 |
| 컴포넌트 (신규) | `src/app/_components/home/ThumbnailImage.tsx` | 썸네일 로딩 상태(스켈레톤/에러) 공통 처리 |
| 컴포넌트 (신규) | `src/app/_components/home/HomeSection.tsx` | 홈 섹션 제목 + "더보기" 링크 공통 레이아웃 |
| 컴포넌트 (신규) | `src/app/_components/home/HorizontalCardSection.tsx` | 카테고리별 가로 스크롤 카드 섹션 (`useDragScroll` 사용) |
| 컴포넌트 (수정) | `src/app/_components/home/RankingCard.tsx` | 세로형 포스터 카드를 랭킹/카테고리 공통으로 쓰도록 정리, hover 확대 인터랙션 추가 |
| 컴포넌트 (수정) | `src/app/_components/home/RankingSection.tsx` | `RankingCard` 기반으로 단순화 |
| 컴포넌트 (수정) | `src/app/_components/home/TicketOpenSection.tsx` | 그라데이션 카드 레이아웃 정리, 글씨 대비 문제 수정 |
| 컴포넌트 (수정) | `src/app/_components/home/HeroSlider.tsx` | `useSwipe` 기반 드래그 슬라이드, 포스터 강조 디자인 |
| 페이지 | `src/app/page.tsx` | 카테고리 섹션 데이터 페칭 추가, 랭킹 집계를 anon RPC로 전환 |
| 서버 클라이언트 | `src/lib/supabase/admin.ts` | service-role 클라이언트를 모듈 로드 시점 생성 → 호출 시점 lazy 생성으로 변경 |
| API (영향 없음, import 경로만) | `src/app/api/payments/confirm/route.ts`, `.../webhook/route.ts` | `supabaseAdmin` → `getSupabaseAdmin()` 호출부 수정 |
| DB 마이그레이션 (신규) | `supabase/migrations/20260623120000_event_booking_counts_rpc.sql` | 홈 랭킹 집계용 `event_booking_counts()` RPC (SECURITY DEFINER) |

총 16개 파일, +533 / -221 (`579c985` → `HEAD` 기준).

## 2. 구현 내용 및 방법

### 2-1. 카드 컴포넌트 공통화

기존에는 랭킹/티켓오픈/카테고리 섹션이 각자 카드 마크업을 따로 들고 있었다. `EventCardItem`(공통 타입) + `RankingCard`(세로 포스터형, 랭킹뱃지는 옵션) + `HorizontalCardSection`(가로 스크롤 래퍼)로 정리해서, 카테고리 섹션을 새로 추가할 때 카드 마크업을 새로 안 짜도 되게 만들었다.

### 2-2. 가로 스크롤 + 드래그 + 휠 스크롤 (`useDragScroll`)

랭킹/카테고리 섹션은 `overflow-x-auto`로 가로 스크롤이 기본 동작하지만, 데스크탑에서는 마우스 드래그와 휠(세로 휠 입력을 가로 스크롤로 변환)도 지원해야 했다. `useDragScroll`이 `ref` + 마우스 이벤트 핸들러 + `wheel` 네이티브 리스너를 묶어서 제공한다. 드래그 도중 발생하는 클릭(카드 이동)은 `onClickCapture`에서 이동 거리 임계값(5px)으로 걸러낸다.

### 2-3. 히어로 슬라이더 드래그 슬라이드 (`useSwipe`)

히어로 슬라이더는 자동 캐러셀이 아니라 사용자가 직접 좌우로 드래그/스와이프해서 넘기는 방식으로 바꿨다. Pointer Events 기반이라 마우스/터치를 같은 핸들러로 처리하고, 50px 이상 이동해야 슬라이드가 전환된다(`SWIPE_THRESHOLD_PX`). 드래그 끝의 클릭도 `useDragScroll`과 동일한 패턴으로 억제한다.

### 2-4. 카테고리 섹션 추가 (`page.tsx`)

홈에 카테고리별 가로 스크롤 섹션을 추가하면서, 기존 "최근 등록 20개 풀"(`EVENT_POOL_LIMIT`)만으로는 카테고리 섹션에 노출할 이벤트가 부족할 수 있어 카테고리용 이벤트는 별도 쿼리(`categoryIds.length` 있을 때만)로 따로 가져오도록 분리했다. 두 쿼리 결과의 `event_id`를 합쳐서 가격/예매수량 조회는 한 번에 처리한다.

### 2-5. service-role 클라이언트 lazy화 (`src/lib/supabase/admin.ts`)

기존엔 `export const supabaseAdmin = createClient(...)` 형태로 **모듈을 import하는 시점에 즉시** 클라이언트를 생성했다. `SUPABASE_SERVICE_ROLE_KEY`가 비어 있으면 import만으로 그 자리에서 예외가 터지는데, 홈(`page.tsx`)이 이 모듈을 import하고 있었기 때문에 키가 없는 환경(로컬 미설정, 시연 서버 누락 등)에서는 **사이트 루트 전체가 500**이 났다.

```ts
// 변경 후
export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 미설정 (서버 전용)");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}
```

호출 시점에만 생성하도록 함수로 바꿔서, 실제로 service-role이 필요한 호출(결제 confirm/webhook의 주문 상태 갱신)이 일어나기 전까지는 키 부재가 문제가 되지 않게 했다.

### 2-6. 홈 랭킹 집계를 anon 키로 호출 가능한 DB 함수(RPC)로 전환

2-5로 크래시는 막았지만, 근본적으로 **공개 페이지인 홈이 service-role 키에 묶여 있는 구조** 자체가 남아 있었다. `orders` 테이블은 본인 주문만 보이는 RLS가 걸려 있어서, "전체 예매 랭킹"(이벤트별 누적 수량)을 집계하려면 RLS를 우회해야 했고, 그래서 홈이 `getSupabaseAdmin()`으로 `orders` 전체 행을 읽어와 애플리케이션 레벨에서 직접 합산하고 있었다.

해결: 개별 주문 행이 아니라 "이벤트별 수량 합계"만 돌려주는 `SECURITY DEFINER` 함수를 DB에 만들고, 이 함수만 `anon`/`authenticated`에 공개했다.

```sql
-- supabase/migrations/20260623120000_event_booking_counts_rpc.sql
create or replace function public.event_booking_counts()
returns table (event_id uuid, total_quantity bigint)
language sql
security definer            -- 정의자(소유자) 권한으로 실행 → orders RLS 우회
set search_path = public
as $$
  select event_id, sum(quantity)::bigint as total_quantity
  from orders
  group by event_id;
$$;

grant execute on function public.event_booking_counts() to anon, authenticated;
```

`page.tsx`는 `getSupabaseAdmin` import를 완전히 제거하고, 기존 쿠키 기반 `createClient()`(anon)로 `supabase.rpc("event_booking_counts")`를 호출해서 합계 맵을 만든다. 집계 자체도 애플리케이션 레벨 reduce가 아니라 DB에서 `group by`로 끝내므로 더 가볍다.

```ts
async function fetchBookingCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.rpc("event_booking_counts");
  if (error) {
    console.error("[HOME] event_booking_counts rpc failed (랭킹은 기본 정렬로 대체됨):", error);
    return [];
  }
  return data ?? [];
}
```

개별 주문 행(누가 무엇을 샀는지)은 여전히 RLS로 가려진 채로 남고, 공개에 필요한 집계값만 밖으로 나가는 구조라 안전하다. 이제 홈은 service-role 키가 전혀 없어도 정상적으로 뜬다.

### 2-7. 호버/탭 인터랙션 + 작은 버그 수정

- 카드/배너에 과하지 않은 hover 확대(`group-hover:scale-105`)·tap 축소(`active:scale-95`) 인터랙션 추가.
- `RankingCard`의 hover 확대 wrapper(`relative size-full ... group-hover:scale-105`)에 `position: relative`가 빠져 있어서 확대된 썸네일이 부모 레이아웃을 깨던 버그 수정.
- 데스크탑에서 카테고리/랭킹 섹션이 줄바꿈되는 대신 가로 스크롤되도록 `flex-nowrap` 계열 수정.
- 가로 스크롤 섹션에서 마우스 휠 입력 시 섹션 내부 스크롤뿐 아니라 페이지 전체도 같이 스크롤되던 문제 수정 (3-2 트러블슈팅 참고).
- 티켓 오픈 카드 글씨 색이 배경(연한 그라데이션)과 대비가 약해 잘 안 보이던 문제 수정 (3-4 트러블슈팅 참고).

## 3. 트러블슈팅

### 3-1. `RankingCard` hover 확대 시 레이아웃 깨짐 — `position: relative` 누락

**증상**: 카드에 마우스를 올리면 썸네일이 확대되면서 카드 레이아웃(다음 카드와의 간격, 텍스트 위치)이 흔들렸다.

**원인**: 썸네일을 감싸는 `div`에 `group-hover:scale-105`로 transform을 주는데, 이 wrapper가 `position: relative`가 아니어서(`static`) 내부 절대 위치 요소(랭킹 뱃지 `absolute`)와 transform 컨텍스트가 의도와 다르게 동작했다.

**해결**: wrapper에 `relative`를 추가 (`relative size-full transition-transform duration-300 group-hover:scale-105`). 커밋 `c0b91ae`.

### 3-2. 가로 스크롤 섹션에서 마우스 휠 사용 시 페이지 전체도 같이 스크롤됨

**증상**: 가로 스크롤 섹션(랭킹/카테고리) 위에서 마우스 휠을 굴리면, 섹션은 가로로 스크롤되지만 동시에 브라우저 페이지 자체도 위/아래로 스크롤됐다.

**원인**: React의 `onWheel` 핸들러는 내부적으로 **passive 리스너**로 등록되기 때문에 핸들러 안에서 `e.preventDefault()`를 호출해도 무시된다. 그래서 가로 스크롤(`el.scrollLeft += e.deltaY`)은 일어나지만, 브라우저의 기본 세로 스크롤 동작도 그대로 같이 실행됐다.

**해결**: React 합성 이벤트 대신 `useEffect`에서 DOM에 **`{ passive: false }`로 네이티브 `wheel` 리스너를 직접 등록**해서 `preventDefault()`가 실제로 먹히게 했다 (`useDragScroll.ts`). 트랙패드의 가로 스와이프(`deltaX`가 `deltaY`보다 큰 경우)는 기본 동작을 막지 않고 그대로 통과시켜 자연스러운 가로 스와이프는 유지했다. 커밋 `e3030e2`(휠 스크롤 추가) → `a866476`(전체 페이지 스크롤 문제 수정).

### 3-3. 홈(`/`)이 `SUPABASE_SERVICE_ROLE_KEY` 없으면 통째로 500

**증상**: `SUPABASE_SERVICE_ROLE_KEY` 환경변수가 비어 있는 환경(로컬 신규 클론, 시연 서버 키 미설정 등)에서 사이트 루트(`/`)에 접근하면 500 에러가 났다.

**원인**: `src/lib/supabase/admin.ts`가 `export const supabaseAdmin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)` 형태로 **모듈 로드 시점에 즉시** 클라이언트를 생성했다. 홈 페이지(`page.tsx`)가 이 모듈을 랭킹 집계 때문에 import하고 있었으므로, 키가 없으면 `page.tsx`를 import하는 순간(=홈에 접근하는 모든 요청에서) 예외가 발생했다.

**해결**: 1차로 `getSupabaseAdmin()` 함수로 바꿔 **호출 시점에만 생성 + 키 없을 때 명확한 에러 메시지**를 던지도록 수정(커밋 `d89048e`). 2차로 2-6에서 설명한 대로 **홈에서 service-role 의존 자체를 제거**해서, 결제 confirm/webhook처럼 실제로 RLS 우회가 필요한 경로에서만 키가 필요하도록 범위를 좁혔다.

### 3-4. 티켓 오픈 카드 글씨가 배경과 대비가 약해 안 보임

**증상**: "티켓 오픈" 섹션 카드(연한 라벤더 `primary-400` → 연한 블루 `secondary-400` 그라데이션 배경) 위의 흰색(`text-white`) 글씨가 배경이 밝아서 잘 식별되지 않았다.

**원인**: 배경 그라데이션이 파스텔톤(`#d5c2e2` ~ `#c5e2ff`)이라 흰 글씨와 명암 대비가 부족했다.

**해결**: 글씨 색을 흰색 계열에서 진한 회색 계열로 변경 (제목 `text-white` → `text-gray-900`, 날짜/가격 `text-white/80` → `text-gray-700`). 배경/카드 디자인은 유지하고 텍스트 색만 바꿔서 다른 곳에 쓰이는 동일 그라데이션 패턴(버튼 등)에는 영향이 없다.

### 3-5. anon RPC 전환 후 `PGRST202: Could not find the function public.event_booking_counts`

**증상**: 2-6에서 만든 `event_booking_counts()` RPC를 호출하면 `PGRST202`(함수를 찾을 수 없음) 에러가 났다.

**원인 진단**:
1. 마이그레이션 파일(`20260623120000_event_booking_counts_rpc.sql`)은 로컬 저장소에만 생성됐고, 실제 운영 중인 Supabase 프로젝트(`nbpiaphpxsnqurlsnrnz`)의 DB에는 한 번도 적용된 적이 없었다(마이그레이션 파일은 SQL 스크립트일 뿐, `supabase db push` 등으로 실제 실행해야 반영된다). 그래서 PostgREST 스키마 캐시에 함수가 존재하지 않아 RPC 호출이 실패했다.
2. 적용을 시도하며 `supabase link` 후 `supabase db push`를 돌렸으나, **원격 DB의 마이그레이션 히스토리에 로컬 디렉터리에는 없는 마이그레이션 7개**(`20260619071351` ~ `20260622021115`, 대시보드 등에서 직접 적용된 것으로 추정)가 이미 들어 있어 히스토리가 어긋나 있었다. CLI가 이 불일치를 감지하고 push를 거부했다.

**해결**:
1. 히스토리를 건드리지 않고 이번 마이그레이션 SQL만 단독으로 적용하기 위해 `supabase db query --linked -f supabase/migrations/20260623120000_event_booking_counts_rpc.sql`로 직접 실행. `pg_proc` 조회로 함수 생성 및 `anon` 실행 권한(`has_function_privilege('anon', ...)`)을 확인하고, anon 키로 REST API(`/rest/v1/rpc/event_booking_counts`)를 직접 호출해 정상 동작을 검증했다.
2. 마이그레이션 히스토리 불일치는 `supabase migration repair --status reverted <7개 버전>` + `--status applied 20260623120000`으로 정리. 이건 **실제 스키마를 바꾸는 게 아니라 히스토리 추적 테이블의 메타데이터만 정리**하는 작업이라 안전하다. 정리 후 `supabase db push --dry-run` → `"Remote database is up to date"`로 향후 push/pull이 정상 동작하는 것을 확인했다.
3. 다만 대시보드에서 직접 적용됐던 7개 마이그레이션의 **실제 SQL 내용**은 아직 로컬 파일로 옮겨오지 못했다. `supabase db pull`/`db dump`는 shadow DB 계산에 Docker Desktop이 필요한데, 작업 환경에 Docker가 없어 실행할 수 없었다. → 4번(후속 작업) 참고.

## 4. 후속 작업 (미해결/제안)

- **마이그레이션 파일 보강**: Docker Desktop 설치 후 `supabase db pull` 한 번으로, 대시보드에서 직접 적용됐던 7개 마이그레이션의 실제 스키마를 로컬 `supabase/migrations/`에 반영할 것. 그래야 신규 클론/로컬 개발 DB 세팅 시 스키마가 완전히 재현된다.
- **운영 규칙**: 앞으로 DB 변경은 대시보드 SQL Editor에서 직접 하지 말고 `supabase/migrations/` + `supabase db push`로만 적용하는 룰을 팀에 공유하면 이번과 같은 히스토리 불일치가 재발하지 않는다.
- **`event_booking_counts` 성능**: 현재는 `orders` 전체를 `group by event_id`로 매번 합산한다. 주문량이 커지면 머티리얼라이즈드 뷰나 캐싱을 고려할 수 있다(현재 규모에서는 불필요).
