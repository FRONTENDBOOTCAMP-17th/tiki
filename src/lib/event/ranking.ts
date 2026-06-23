import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
 * - orders는 RLS 우회를 위해 service role 클라이언트로 조회
 */
export async function fetchRanking(options?: {
  slug?: string;  // category slug
  limit?: number; // 기본 10
  days?: number;  // 집계 기간(일), 기본 30
}): Promise<RankingItem[]> {
  const limit = options?.limit ?? 10;
  const days = options?.days ?? 30;
  const today = new Date().toISOString().split("T")[0];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const supabase = await createClient();

  // 1) 공개 & 종료되지 않은 이벤트 조회 (카테고리 필터 옵션)
  let query = supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_name, created_at, ticket_grade ( price )" +
        (options?.slug
          ? ", category:category_id!inner ( slug )"
          : ""),
    )
    .eq("status", PUBLISHED_STATUS)
    .gte("end_date", today); // 종료 공연 제외

  if (options?.slug) {
    query = query.eq("category.slug", options.slug);
  }

  const { data: eventRows, error } = await query;
  if (error) throw error;

  const events = (eventRows ?? []) as unknown as EventRow[];
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.event_id);

  // 2) 최근 N일 주문을 service role로 집계 (RLS 우회)
  const { data: orderRows } = await supabaseAdmin
    .from("orders")
    .select("event_id, quantity")
    .in("event_id", eventIds)
    .gte("created_at", since);

  // 3) event_id별 예매 수량 합산
  const countMap = new Map<string, number>();
  for (const order of orderRows ?? []) {
    countMap.set(
      order.event_id,
      (countMap.get(order.event_id) ?? 0) + order.quantity,
    );
  }

  // sort 동률 처리용 — map 이후엔 created_at이 없으므로 미리 룩업 맵을 만든다
  const createdAtMap = new Map(events.map((e) => [e.event_id, e.created_at]));

  // 4) 예매 수량 내림차순, 동률이면 최근 등록순으로 정렬 후 상위 N개 반환
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
