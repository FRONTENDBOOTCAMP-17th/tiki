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

// 비공개(판매자 미공개 초안)만 제외. 일시정지(관리자 예매 중단)는 노출.
const VISIBLE_STATUSES = ["공개", "일시정지"];

/**
 * status가 공개/일시정지 + start_date > today 인 공연을 시작일 오름차순으로 반환한다.
 * - 페이지 단위 ISR(revalidate)로 캐싱 — createClient()가 cookies()를 쓰므로 unstable_cache 불가
 */
export async function fetchUpcoming(options?: {
  slug?: string;
  limit?: number;
}): Promise<UpcomingItem[]> {
  const slug  = options?.slug  ?? "";
  const limit = options?.limit ?? 20;
  const today = new Date().toISOString().split("T")[0];

  const supabase = await createClient();

  let query = supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_name, ticket_grade ( price )" +
        (slug ? ", category:category_id!inner ( slug )" : ""),
    )
    .in("status", VISIBLE_STATUSES)
    .is("deleted_at", null) // 관리자가 삭제한 게시물 제외
    .gt("start_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (slug) query = query.eq("category.slug", slug);

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
