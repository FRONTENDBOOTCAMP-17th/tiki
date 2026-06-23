import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCategories } from "@/lib/api/categories";
import type { EventCardItem } from "@/types/domain/event";
import HeroSlider from "./_components/home/HeroSlider";
import RankingSection from "./_components/home/RankingSection";
import TicketOpenSection from "./_components/home/TicketOpenSection";
import HorizontalCardSection from "./_components/home/HorizontalCardSection";

const PUBLISHED_STATUS = "공개";
const EVENT_POOL_LIMIT = 20; // 랭킹/티켓오픈/히어로 섹션이 고를 후보 풀 크기
const HERO_SLIDE_SIZE = 5;
const RANKING_SIZE = 5;
const TICKET_OPEN_SIZE = 3;
const CATEGORY_SECTION_LIMIT = 6; // 홈에 노출할 카테고리 섹션 수
const CATEGORY_EVENT_LIMIT = 8; // 카테고리 섹션 하나당 보여줄 이벤트 수

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string;
  start_date: string;
  venue_name: string;
};

type CategoryEventRow = EventRow & { category_id: string };

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
): EventCardItem {
  return {
    eventId: event.event_id,
    title: event.title,
    startDate: event.start_date,
    thumbnail: event.thumbnail,
    venueName: event.venue_name,
    minPrice: minPriceByEvent.get(event.event_id) ?? null,
  };
}

export default async function Home() {
  const supabase = await createClient();

  // 서로 의존성이 없는 조회(로그인 여부/이벤트 풀/카테고리)는 직렬로 기다리지 않고
  // 한 번에 병렬로 보내야 첫 응답까지의 시간(FCP/LCP)이 늘어지지 않는다.
  const [loggedIn, { data: eventRows, error: eventError }, categories] =
    await Promise.all([
      isAuthenticated(),
      supabase
        .from("event")
        .select("event_id, title, thumbnail, start_date, venue_name")
        .eq("status", PUBLISHED_STATUS)
        .order("created_at", { ascending: false })
        .limit(EVENT_POOL_LIMIT),
      fetchCategories().catch((error) => {
        console.error("[HOME] fetchCategories failed:", error);
        return [];
      }),
    ]);
  if (eventError) console.error("[HOME] event pool query failed:", eventError);

  const pool = eventRows ?? [];
  const topCategories = categories.slice(0, CATEGORY_SECTION_LIMIT);
  const categoryIds = topCategories.map((c) => c.category_id);

  // 카테고리 섹션은 "최근 등록 20개" 풀에 안 든 이벤트도 보여줘야 하므로 별도로 조회한다.
  const { data: categoryEventRows, error: categoryEventError } = categoryIds.length
    ? await supabase
        .from("event")
        .select("event_id, title, thumbnail, start_date, venue_name, category_id")
        .eq("status", PUBLISHED_STATUS)
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
  const newlyOpened = pool
    .slice(0, TICKET_OPEN_SIZE)
    .map((event) => toCardItem(event, minPriceByEvent));

  // category_id별로 묶고, 카테고리 한 섹션당 보여줄 개수만큼만 자른다.
  const eventsByCategory = new Map<string, EventCardItem[]>();
  for (const event of categoryEventRows ?? []) {
    const list = eventsByCategory.get(event.category_id) ?? [];
    if (list.length < CATEGORY_EVENT_LIMIT) {
      list.push(toCardItem(event, minPriceByEvent));
    }
    eventsByCategory.set(event.category_id, list);
  }

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <div className="mx-auto w-full max-w-7xl">
          <HeroSlider slides={heroSlides} />
          <RankingSection events={ranking} />
          <TicketOpenSection events={newlyOpened} />
          {topCategories.map((category) => (
            <HorizontalCardSection
              key={category.category_id}
              title={category.category_name}
              moreHref={`/category/${category.slug}`}
              events={eventsByCategory.get(category.category_id) ?? []}
            />
          ))}
        </div>
      </main>
      <div className="hidden lg:contents">
        <Footer />
      </div>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
