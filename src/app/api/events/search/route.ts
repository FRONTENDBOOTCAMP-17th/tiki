import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";

// EVENT-03 이벤트 검색 (통합 필터) + 페이지네이션
// GET /api/events/search?keyword=...&sortKey=date|name&direction=asc|desc&page=1&limit=12
// 응답: { success, message, data: { items, total, page, limit } }
//
//  - 정렬: 서버에서 처리. sortKey=date→start_date, name→title
//  - minPrice: ticket_grades 미구현

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 50;
const PUBLISHED_STATUS = "공개"; // 비공개(테스트 포함) 공연은 검색 결과에서 제외

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
  const sortKey = searchParams.get("sortKey") === "name" ? "name" : "date"; // 정렬(이름순,날짜순)
  const ascending = searchParams.get("direction") === "asc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT),
  );

  // 특수문자 제거 (%,(),쉼표 등)
  const safe = keyword.replace(/[%(),]/g, " ").trim();

  // 키워드 없으면 빈 결과 (검색 화면 기본 상태)
  if (!safe) {
    return success({ items: [], total: 0, page, limit });
  }

  const supabase = await createClient();
  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const sortColumn = sortKey === "name" ? "title" : "start_date";

  const { data, error, count } = await supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_address, category:category_id ( category_name )",
      { count: "exact" }, // 개수 카운트
    )
    .eq("status", PUBLISHED_STATUS) // 공개 공연만 노출
    .or(`title.ilike.%${safe}%,venue_name.ilike.%${safe}%`)
    .order(sortColumn, { ascending })
    // 같은 날짜나 제목이어도 고유키로 2차 정렬
    .order("event_id", { ascending: true })
    .range(from, to);

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
      minPrice: null, // 검색 결과에 띄울 가격은 미정
      startDate: e.start_date,
      endDate: e.end_date,
      venue: { address: e.venue_address },
    };
  });

  return success({ items, total: count ?? items.length, page, limit });
}
