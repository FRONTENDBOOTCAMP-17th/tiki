import { getSupabaseAdmin } from "@/lib/supabase/admin";
import EventTable from "./_components/EventTable";

interface SearchParams {
  status?: string;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;
  const supabase = getSupabaseAdmin();

  // 필터 탭용 전체 카운트는 필터 없이 별도 조회
  const { data: allEvents } = await supabase
    .from("event")
    .select("event_id, status");

  const statusCounts = (allEvents ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  let query = supabase
    .from("event")
    .select(
      "event_id, title, status, category_id, seller_id, created_at, start_date, end_date",
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: events } = await query;

  // 이벤트별 결제 완료 주문 수만 집계
  const eventIds = (events ?? []).map((e) => e.event_id);
  const { data: orderCounts } =
    eventIds.length > 0
      ? await supabase
          .from("orders")
          .select("event_id")
          .in("event_id", eventIds)
          .eq("status", "paid")
      : { data: [] };

  const orderCountMap = new Map<string, number>();
  for (const o of orderCounts ?? []) {
    orderCountMap.set(o.event_id, (orderCountMap.get(o.event_id) ?? 0) + 1);
  }

  // 판매자 스토어 이름 조회
  const sellerIds = [...new Set((events ?? []).map((e) => e.seller_id))];
  const { data: sellers } =
    sellerIds.length > 0
      ? await supabase
          .from("seller_profiles")
          .select("id, store_name")
          .in("id", sellerIds)
      : { data: [] };

  const sellerMap = new Map<string, string>();
  for (const s of sellers ?? []) {
    sellerMap.set(s.id, s.store_name);
  }

  const enriched = (events ?? []).map((e) => ({
    ...e,
    orderCount: orderCountMap.get(e.event_id) ?? 0,
    storeName: sellerMap.get(e.seller_id) ?? "-",
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
      <EventTable
        events={enriched}
        currentStatus={status ?? "all"}
        statusCounts={statusCounts}
      />
    </div>
  );
}
