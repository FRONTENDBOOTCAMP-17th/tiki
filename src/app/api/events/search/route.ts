import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";

// EVENT-03 이벤트 검색 (통합 필터)
// GET /api/events/search?keyword=...&sort=recent
// 응답: { success, message, data: { items } }
//
// 현재 DB(event/category)로 가능한 범위만 구현:
//  - keyword: title / venue_name 부분일치(ilike)
//  - category(표시명): category 테이블 조인
//  - minPrice: ticket_grades 미구현 → null (추후 최저가 계산으로 대체)
//  - 페이지네이션: 추후 구현 예정

// 조인 결과는 to-one 이라 객체지만, 방어적으로 배열도 허용
type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string | null;
  start_date: string;
  end_date: string;
  venue_address: string | null;
  category: { category_name: string } | { category_name: string }[] | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const sort = searchParams.get("sort") ?? "recent";

  // PostgREST or()/ilike 필터를 깨뜨리는 특수문자 제거 (%,(),쉼표 등)
  const safe = keyword.replace(/[%(),]/g, " ").trim();

  // 키워드 없으면 빈 결과 (검색 화면 기본 상태)
  if (!safe) {
    return success({ items: [] });
  }

  const supabase = await createClient();

  let query = supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_address, category:category_id ( category_name )",
    )
    .or(`title.ilike.%${safe}%,venue_name.ilike.%${safe}%`);

  // sort: recent(최신 등록순) | 그 외(공연 임박순)
  query =
    sort === "recent"
      ? query.order("created_at", { ascending: false })
      : query.order("start_date", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return fail(error.message, 500);
  }

  const items = ((data ?? []) as EventRow[]).map((e) => {
    const cat = Array.isArray(e.category) ? e.category[0] : e.category;
    return {
      eventId: e.event_id,
      title: e.title,
      thumbnail: e.thumbnail,
      category: cat?.category_name ?? null,
      minPrice: null, // ticket_grades 미구현
      startDate: e.start_date,
      endDate: e.end_date,
      venue: { address: e.venue_address },
    };
  });

  return success({ items });
}
