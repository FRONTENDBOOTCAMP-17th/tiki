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
  "예매 일시중지": "비공개",
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
    .select("event_id, title, status, category_id, seller_id, start_date, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (matchedCategory) {
    query = query.eq("category_id", matchedCategory.category_id);
  }
  if (status && status !== "all") {
    const dbStatus = DISPLAY_TO_DB[status] ?? status;
    query = query.eq("status", dbStatus);
  }

  const { data: events } = await query;

  // 이벤트별 결제 완료 주문 수
  const eventIds = (events ?? []).map((e) => e.event_id);
  const { data: orderRows } =
    eventIds.length > 0
      ? await supabase
          .from("orders")
          .select("event_id")
          .in("event_id", eventIds)
          .eq("status", "paid")
      : { data: [] };

  const orderCountMap = new Map<string, number>();
  for (const o of orderRows ?? []) {
    orderCountMap.set(o.event_id, (orderCountMap.get(o.event_id) ?? 0) + 1);
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
