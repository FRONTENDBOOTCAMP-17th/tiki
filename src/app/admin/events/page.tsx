import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchCategories } from "@/lib/api/categories";
import EventTable from "./_components/EventTable";

interface SearchParams {
  search?: string;
  category?: string;
  status?: string;
}

// 화면 표시 상태 → DB 상태
const DISPLAY_TO_DB: Record<string, string> = {
  승인: "공개",
  "예매 일시중지": "일시정지",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, category, status } = await searchParams;
  const supabase = getSupabaseAdmin();

  const categories = await fetchCategories();

  // 장르 필터 → category_id 변환
  const matchedCategory = category && category !== "all"
    ? categories.find((c) => c.slug === category)
    : null;

  let query = supabase
    .from("event")
    .select("event_id, title, status, category_id, seller_id, start_date, created_at, deleted_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (matchedCategory) {
    query = query.eq("category_id", matchedCategory.category_id);
  }
  // "삭제됨" 필터는 status 컬럼이 아니라 deleted_at 기준.
  // 그 외 필터에서는 삭제된 게시물을 목록에서 제외한다.
  if (status === "삭제됨") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (status && status !== "all") {
      const dbStatus = DISPLAY_TO_DB[status] ?? status;
      query = query.eq("status", dbStatus);
    }
  }

  const { data: events } = await query;

  // 이벤트별 결제 완료 주문 수(파티 수) + 티켓 판매 수량 합계
  const eventIds = (events ?? []).map((e) => e.event_id);
  const { data: orderRows } =
    eventIds.length > 0
      ? await supabase
          .from("orders")
          .select("event_id, quantity")
          .in("event_id", eventIds)
          .eq("status", "paid")
      : { data: [] };

  const orderCountMap = new Map<string, number>();
  const ticketCountMap = new Map<string, number>();
  for (const o of orderRows ?? []) {
    orderCountMap.set(o.event_id, (orderCountMap.get(o.event_id) ?? 0) + 1);
    ticketCountMap.set(
      o.event_id,
      (ticketCountMap.get(o.event_id) ?? 0) + (o.quantity ?? 0),
    );
  }

  // 카테고리명 매핑
  const categoryNameMap = new Map(
    categories.map((c) => [c.category_id, c.category_name]),
  );

  const enriched = (events ?? []).map((e, index) => ({
    ...e,
    index: index + 1,
    categoryName: categoryNameMap.get(e.category_id) ?? "-",
    partyCount: orderCountMap.get(e.event_id) ?? 0,
    ticketCount: ticketCountMap.get(e.event_id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">게시물 관리</h1>
      <EventTable
        events={enriched}
        categories={categories}
        currentSearch={search ?? ""}
        currentCategory={category ?? "all"}
        currentStatus={status ?? "all"}
      />
    </div>
  );
}
