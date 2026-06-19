import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import HeroBanner from "./_components/home/HeroBanner";
import RankingSection from "./_components/home/RankingSection";
import TicketOpenSection from "./_components/home/TicketOpenSection";

const PUBLISHED_STATUS = "공개";
const EVENT_POOL_LIMIT = 20; // 랭킹/티켓오픈 섹션이 고를 후보 풀 크기
const RANKING_SIZE = 5;
const TICKET_OPEN_SIZE = 3;

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string;
  start_date: string;
  venue_name: string;
};

export default async function Home() {
  const loggedIn = await isAuthenticated();
  const supabase = await createClient();

  // 공개된 공연을 최근 등록순으로 가져와 랭킹/티켓오픈 섹션의 후보 풀로 쓴다.
  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title, thumbnail, start_date, venue_name")
    .eq("status", PUBLISHED_STATUS)
    .order("created_at", { ascending: false })
    .limit(EVENT_POOL_LIMIT);

  const pool = (eventRows ?? []) as EventRow[];
  const eventIds = pool.map((event) => event.event_id);

  // orders는 본인 주문만 보이는 RLS가 걸려 있어, 비로그인 사용자도 보는
  // "전체 예매 랭킹" 집계는 service role 클라이언트로 조회한다.
  // (사용자 식별 정보 없이 event_id별 수량만 합산해서 쓰므로 안전하다.)
  const [{ data: orderRows }, { data: gradeRows }] = eventIds.length
    ? await Promise.all([
        supabaseAdmin
          .from("orders")
          .select("event_id, quantity")
          .in("event_id", eventIds),
        supabase
          .from("ticket_grade")
          .select("event_id, price")
          .in("event_id", eventIds),
      ])
    : [{ data: [] }, { data: [] }];

  // event_id별 누적 예매 수량 (집계용 DB 뷰가 없어 애플리케이션 레벨에서 합산)
  const bookingCountByEvent = new Map<string, number>();
  for (const order of orderRows ?? []) {
    bookingCountByEvent.set(
      order.event_id,
      (bookingCountByEvent.get(order.event_id) ?? 0) + order.quantity,
    );
  }

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
    .map((event) => ({
      eventId: event.event_id,
      title: event.title,
      startDate: event.start_date,
      venueName: event.venue_name,
      thumbnail: event.thumbnail,
    }));

  // 이미 최근 등록순으로 가져왔으니, 앞에서 N개만 잘라내면 "신규 오픈" 목록이 된다.
  const newlyOpened = pool.slice(0, TICKET_OPEN_SIZE).map((event) => ({
    eventId: event.event_id,
    title: event.title,
    startDate: event.start_date,
    venueName: event.venue_name,
    thumbnail: event.thumbnail,
    minPrice: minPriceByEvent.get(event.event_id) ?? null,
  }));

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <HeroBanner />
        <RankingSection events={ranking} />
        <TicketOpenSection events={newlyOpened} />
      </main>
      <div className="hidden lg:contents">
        <Footer />
      </div>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
