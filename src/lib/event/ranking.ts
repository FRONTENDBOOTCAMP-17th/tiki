import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type RankingItem = {
  eventId: string;
  title: string;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  venueName: string;
  minPrice: number | null;
  bookingCount: number;
};

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  created_at: string;
  ticket_grade: { price: number }[] | null;
};

const PUBLISHED_STATUS = "공개";

/**
 * 최근 N일 예매 수량 기준 랭킹 상위 이벤트를 반환한다.
 * - slug 지정 시 해당 카테고리만, 생략 시 전체 카테고리 대상
 * - 종료된 공연(end_date < today)은 제외
 * - 페이지 단위 ISR(revalidate)로 캐싱 — createClient()가 cookies()를 쓰므로 unstable_cache 불가
 */
export async function fetchRanking(options?: {
  slug?: string;
  limit?: number;
  days?: number;
}): Promise<RankingItem[]> {
  const slug  = options?.slug  ?? "";
  const limit = options?.limit ?? 10;
  const days  = options?.days  ?? 30;
  const today = new Date().toISOString().split("T")[0];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const supabase = await createClient();

  let query = supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_name, created_at, ticket_grade ( price )" +
        (slug ? ", category:category_id!inner ( slug )" : ""),
    )
    .eq("status", PUBLISHED_STATUS)
    .gte("end_date", today);

  if (slug) query = query.eq("category.slug", slug);

  const { data: eventRows, error } = await query;
  if (error) throw error;

  const events = (eventRows ?? []) as unknown as EventRow[];
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.event_id);

  const { data: orderRows } = await getSupabaseAdmin()
    .from("orders")
    .select("event_id, quantity")
    .in("event_id", eventIds)
    .gte("created_at", since);

  const countMap = new Map<string, number>();
  for (const order of orderRows ?? []) {
    countMap.set(
      order.event_id,
      (countMap.get(order.event_id) ?? 0) + order.quantity,
    );
  }

  const createdAtMap = new Map(events.map((e) => [e.event_id, e.created_at]));

  return events
    .map((e) => {
      const prices = (e.ticket_grade ?? []).map((g) => g.price);
      return {
        eventId: e.event_id,
        title: e.title,
        thumbnail: e.thumbnail,
        startDate: e.start_date,
        endDate: e.end_date,
        venueName: e.venue_name,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        bookingCount: countMap.get(e.event_id) ?? 0,
      };
    })
    .sort((a, b) =>
      b.bookingCount !== a.bookingCount
        ? b.bookingCount - a.bookingCount
        : (createdAtMap.get(b.eventId) ?? "").localeCompare(
            createdAtMap.get(a.eventId) ?? "",
          ),
    )
    .slice(0, limit);
}
