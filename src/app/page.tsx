import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { getHeaderProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCategories } from "@/lib/api/categories";
import HeroSlider from "./_components/home/HeroSlider";
import TicketOpenSection from "./_components/home/TicketOpenSection";
import HorizontalCardSection from "./_components/home/HorizontalCardSection";
import HomeSectionLink from "./_components/home/HomeSectionLink";
import BestReviewSection from "./_components/home/BestReviewSection";
import BestReviewSkeleton from "./_components/home/BestReviewSkeleton";
import RecommendedSection from "./_components/home/RecommendedSection";
import type {
  BestReviewItem,
  HomeEventCardItem,
} from "./_components/home/types";

// 비공개(판매자 미공개 초안)만 제외. 일시정지(관리자 예매 중단)는 노출.
const VISIBLE_STATUSES = ["공개", "일시정지"];
const EVENT_POOL_LIMIT = 36; // 랭킹/티켓오픈/히어로 섹션이 고를 후보 풀 크기
const HERO_SLIDE_SIZE = 5;
const RANKING_SIZE = 10;
const OPEN_FALLBACK_SIZE = 5;
const RECOMMENDED_SIZE = 5;
const REVIEW_POOL_LIMIT = 24;
const BEST_REVIEW_SIZE = 3;
const CATEGORY_SECTION_LIMIT = 6; // 홈에 노출할 카테고리 섹션 수
const FEATURED_CATEGORY_SECTION_LIMIT = 3;
const CATEGORY_EVENT_LIMIT = 8; // 카테고리 섹션 하나당 보여줄 이벤트 수

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  created_at: string;
};

type CategoryEventRow = EventRow & { category_id: string };

type ReviewRow = {
  review_id: string;
  event_id: string;
  user_id: string;
  rating: number;
  memo: string | null;
  created_at: string;
};

// 예매 랭킹 집계용 주문 수량 합계 조회. orders 자체는 본인 주문만 보이는
// RLS가 걸려 있지만, event_id별 합계만 돌려주는 RPC(event_booking_counts)는
// anon 키로도 호출 가능하므로 이걸 쓴다. 조회에 실패해도 랭킹만 기본 정렬로
// 대체될 뿐 홈 화면 자체는 그대로 떠야 하므로 여기서 에러를 삼킨다.
async function fetchBookingCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ event_id: string; total_quantity: number }[]> {
  const { data, error } = await supabase.rpc("event_booking_counts");
  if (error) {
    console.error("[HOME] event_booking_counts rpc failed (랭킹은 기본 정렬로 대체됨):", error);
    return [];
  }
  return data ?? [];
}

// event 테이블 행을 카드에서 쓰는 형태로 변환 (랭킹/티켓오픈/카테고리 섹션 공통)
function toCardItem(
  event: EventRow,
  minPriceByEvent: Map<string, number>,
): HomeEventCardItem {
  return {
    eventId: event.event_id,
    title: event.title,
    startDate: event.start_date,
    endDate: event.end_date,
    createdAt: event.created_at,
    thumbnail: event.thumbnail,
    venueName: event.venue_name,
    minPrice: minPriceByEvent.get(event.event_id) ?? null,
  };
}

function getKstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function maskName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "익명";
  if (trimmed.length === 1) return trimmed;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 1)}`;
}

async function fetchBestReviews(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<BestReviewItem[]> {
  const { data: reviewRows } = await supabase
    .from("review")
    .select("review_id, event_id, user_id, rating, memo, created_at")
    .is("deleted_at", null) // 삭제된 리뷰는 베스트 리뷰에서 제외
    .not("memo", "is", null)
    .order("created_at", { ascending: false })
    .limit(REVIEW_POOL_LIMIT);

  const reviews = ((reviewRows ?? []) as ReviewRow[]).filter((review) =>
    review.memo?.trim(),
  );
  if (reviews.length === 0) return [];

  const eventIds = [...new Set(reviews.map((review) => review.event_id))];
  const userIds = [...new Set(reviews.map((review) => review.user_id))];
  const reviewIds = reviews.map((review) => review.review_id);

  const [
    { data: eventRows },
    { data: userRows },
    { data: likeRows },
  ] = await Promise.all([
    supabase
      .from("event")
      .select("event_id, title, thumbnail, status")
      .is("deleted_at", null) // 삭제된 게시물의 리뷰는 노출하지 않음
      .in("event_id", eventIds),
    supabase.from("users").select("id, name").in("id", userIds),
    supabase.from("review_like").select("review_id").in("review_id", reviewIds),
  ]);

  const eventMap = new Map(
    (eventRows ?? [])
      .filter((event) => VISIBLE_STATUSES.includes(event.status))
      .map((event) => [event.event_id, event]),
  );
  const nameMap = new Map(
    (userRows ?? []).map((user) => [user.id, user.name ?? ""]),
  );
  const likeCountMap = new Map<string, number>();
  for (const like of likeRows ?? []) {
    likeCountMap.set(
      like.review_id,
      (likeCountMap.get(like.review_id) ?? 0) + 1,
    );
  }

  return reviews
    .map((review, index) => ({ review, index }))
    .sort((a, b) => {
      const likeDiff =
        (likeCountMap.get(b.review.review_id) ?? 0) -
        (likeCountMap.get(a.review.review_id) ?? 0);
      if (likeDiff !== 0) return likeDiff;
      const dateDiff =
        +new Date(b.review.created_at) - +new Date(a.review.created_at);
      return dateDiff || a.index - b.index;
    })
    .map(({ review }) => {
      const event = eventMap.get(review.event_id);
      if (!event) return null;

      return {
        reviewId: review.review_id,
        eventId: review.event_id,
        eventTitle: event.title,
        eventThumbnail: event.thumbnail ?? "",
        author: maskName(nameMap.get(review.user_id) ?? ""),
        rating: review.rating,
        memo: review.memo?.trim() ?? "",
        likeCount: likeCountMap.get(review.review_id) ?? 0,
      };
    })
    .filter((review): review is BestReviewItem => !!review)
    .slice(0, BEST_REVIEW_SIZE);
}

// 베스트 리뷰는 나머지 홈 데이터와 의존관계가 없으므로, Promise를 상위에서 await하지
// 않고 이 컴포넌트에 그대로 넘겨 Suspense로 스트리밍한다(다른 섹션 대기 없이 독립 렌더).
async function BestReviewSectionAsync({
  reviewsPromise,
}: {
  reviewsPromise: Promise<BestReviewItem[]>;
}) {
  const reviews = await reviewsPromise;
  return <BestReviewSection reviews={reviews} />;
}

export default async function Home() {
  const supabase = await createClient();

  // 베스트 리뷰는 아래 Promise.all의 나머지 조회와 무관하므로 await하지 않고 바로
  // 실행만 시켜둔다. 결과는 <Suspense>로 감싼 컴포넌트에서 따로 기다린다.
  const bestReviewsPromise = fetchBestReviews(supabase).catch((error) => {
    console.error("[HOME] fetchBestReviews failed:", error);
    return [] as BestReviewItem[];
  });

  // 서로 의존성이 없는 조회(로그인 여부/이벤트 풀/카테고리)는 직렬로 기다리지 않고
  // 한 번에 병렬로 보내야 첫 응답까지의 시간(FCP/LCP)이 늘어지지 않는다.
  const [profile, { data: eventRows, error: eventError }, categories] =
    await Promise.all([
      getHeaderProfile(),
      supabase
        .from("event")
        .select("event_id, title, thumbnail, start_date, end_date, venue_name, created_at")
        .in("status", VISIBLE_STATUSES)
        .is("deleted_at", null) // 관리자가 삭제한 게시물 제외
        .order("created_at", { ascending: false })
        .limit(EVENT_POOL_LIMIT),
      fetchCategories().catch((error) => {
        console.error("[HOME] fetchCategories failed:", error);
        return [];
      }),
    ]);
  if (eventError) console.error("[HOME] event pool query failed:", eventError);

  const loggedIn = !!profile;
  const pool = eventRows ?? [];
  const topCategories = categories.slice(0, CATEGORY_SECTION_LIMIT);
  const featuredCategories = topCategories.slice(0, FEATURED_CATEGORY_SECTION_LIMIT);
  const categoryIds = topCategories.map((c) => c.category_id);

  // 카테고리 섹션은 "최근 등록" 풀에 안 든 이벤트도 보여줘야 하므로 별도로 조회한다.
  const { data: categoryEventRows, error: categoryEventError } = categoryIds.length
    ? await supabase
        .from("event")
        .select("event_id, title, thumbnail, start_date, end_date, venue_name, created_at, category_id")
        .in("status", VISIBLE_STATUSES)
        .is("deleted_at", null) // 관리자가 삭제한 게시물 제외
        .in("category_id", categoryIds)
        .order("created_at", { ascending: false })
    : { data: [] as CategoryEventRow[], error: null };
  if (categoryEventError)
    console.error("[HOME] category event query failed:", categoryEventError);

  // 두 조회 결과를 합쳐서 주문/가격 조회를 한 번에 처리한다.
  const eventIds = [
    ...new Set([
      ...pool.map((e) => e.event_id),
      ...(categoryEventRows ?? []).map((e) => e.event_id),
    ]),
  ];

  // orders는 본인 주문만 보이는 RLS가 걸려 있지만, 비로그인 사용자도 보는
  // "전체 예매 랭킹" 집계는 event_id별 합계만 돌려주는 RPC로 anon 키로도 조회한다.
  const [bookingCountRows, { data: gradeRows, error: gradeError }] = eventIds.length
    ? await Promise.all([
        fetchBookingCounts(supabase),
        supabase
          .from("ticket_grade")
          .select("event_id, price")
          .in("event_id", eventIds),
      ])
    : [[], { data: [], error: null }];
  if (gradeError) console.error("[HOME] ticket_grade query failed:", gradeError);

  // event_id별 누적 예매 수량 (RPC가 이미 DB에서 합산해 돌려준다)
  const bookingCountByEvent = new Map<string, number>(
    bookingCountRows.map((row) => [row.event_id, row.total_quantity]),
  );

  // event_id별 최저 티켓 가격
  const minPriceByEvent = new Map<string, number>();
  for (const grade of gradeRows ?? []) {
    const current = minPriceByEvent.get(grade.event_id);
    if (current == null || grade.price < current) {
      minPriceByEvent.set(grade.event_id, grade.price);
    }
  }

  const ranking = [...pool]
    .sort(
      (a, b) =>
        (bookingCountByEvent.get(b.event_id) ?? 0) -
        (bookingCountByEvent.get(a.event_id) ?? 0),
    )
    .slice(0, RANKING_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  // 히어로 슬라이더는 이미지가 있어야 의미가 있으므로 썸네일이 비어있는 이벤트는 제외한다.
  const heroSlides = pool
    .filter((event) => event.thumbnail)
    .slice(0, HERO_SLIDE_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  // 이미 최근 등록순으로 가져왔으니, 앞에서 N개만 잘라내면 "신규 오픈" 목록이 된다.
  const todayKey = getKstDateKey();
  const todayOpened = pool
    .filter((event) => getKstDateKey(new Date(event.created_at)) === todayKey)
    .slice(0, OPEN_FALLBACK_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  const recentlyOpened = pool
    .filter((event) => getKstDateKey(new Date(event.created_at)) !== todayKey)
    .slice(0, OPEN_FALLBACK_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  const excludedRecommendationIds = new Set([
    ...ranking.map((event) => event.eventId),
    ...heroSlides.map((event) => event.eventId),
    ...todayOpened.map((event) => event.eventId),
  ]);
  const recommended = pool
    .filter((event) => !excludedRecommendationIds.has(event.event_id))
    .slice(0, RECOMMENDED_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  // category_id별로 묶고, 카테고리 한 섹션당 보여줄 개수만큼만 자른다.
  const eventsByCategory = new Map<string, HomeEventCardItem[]>();
  for (const event of categoryEventRows ?? []) {
    const list = eventsByCategory.get(event.category_id) ?? [];
    if (list.length < CATEGORY_EVENT_LIMIT) {
      list.push(toCardItem(event, minPriceByEvent));
    }
    eventsByCategory.set(event.category_id, list);
  }

  return (
    <>
      <Header loggedIn={loggedIn} profile={profile} />
      <main className="flex-1 bg-white pb-4 transition-colors dark:bg-surface-0 min-[744px]:pb-0">
        <div className="bg-linear-to-b from-primary-100 via-secondary-100 to-white transition-colors dark:from-surface-header dark:via-surface-header dark:to-surface-0">
          <HeroSlider slides={heroSlides} />
          <div id="home-content-start" className="scroll-mt-20">
            <HomeSectionLink categories={topCategories} />
          </div>
        </div>
        <div>
          <TicketOpenSection
            todayEvents={todayOpened}
            fallbackEvents={recentlyOpened}
          />
          {/* 예매 랭킹: 누적 예매 수량이 높은 순으로 정렬된 이벤트를 순위 배지와 함께 보여준다. */}
          <HorizontalCardSection
            title="예매 랭킹"
            moreHref="/ranking"
            events={ranking}
            showRank
            className="bg-white dark:bg-surface-0"
          />
          <RecommendedSection events={recommended} />
          {featuredCategories.map((category) => (
            <HorizontalCardSection
              key={category.category_id}
              title={category.category_name}
              moreHref={`/category/${category.slug}`}
              events={eventsByCategory.get(category.category_id) ?? []}
              className="bg-white dark:bg-surface-0"
            />
          ))}
        </div>
        <Suspense fallback={<BestReviewSkeleton />}>
          <BestReviewSectionAsync reviewsPromise={bestReviewsPromise} />
        </Suspense>
        <div
          id="home-page-end"
          className="h-1 scroll-mt-24 bg-white transition-colors dark:bg-surface-0 min-[744px]:h-12"
          aria-hidden
        />
      </main>
      <div className="hidden lg:contents">
        <Footer />
      </div>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
