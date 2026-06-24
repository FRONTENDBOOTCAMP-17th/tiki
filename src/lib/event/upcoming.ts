import "server-only";
import { createClient } from "@/lib/supabase/server";

export type UpcomingItem = {
  eventId: string;
  title: string;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  venueName: string;
  minPrice: number | null;
};

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  ticket_grade: { price: number }[] | null;
};

const PUBLISHED_STATUS = "공개";

/**
 * status='공개' + start_date > today 인 공연을 시작일 오름차순으로 반환한다.
 * slug 지정 시 해당 카테고리만, 생략 시 전체 대상.
 */
export async function fetchUpcoming(options?: {
  slug?: string;
  limit?: number;
}): Promise<UpcomingItem[]> {
  const limit = options?.limit ?? 20;
  const today = new Date().toISOString().split("T")[0];

  const supabase = await createClient();

  let query = supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_name, ticket_grade ( price )" +
        (options?.slug ? ", category:category_id!inner ( slug )" : ""),
    )
    .eq("status", PUBLISHED_STATUS)
    .gt("start_date", today)          // 오늘 이후 시작하는 공연만
    .order("start_date", { ascending: true }) // 가장 빨리 열리는 순
    .limit(limit);

  if (options?.slug) {
    query = query.eq("category.slug", options.slug);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as EventRow[]).map((e) => {
    const prices = (e.ticket_grade ?? []).map((g) => g.price);
    return {
      eventId: e.event_id,
      title: e.title,
      thumbnail: e.thumbnail,
      startDate: e.start_date,
      endDate: e.end_date,
      venueName: e.venue_name,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
    };
  });
}
