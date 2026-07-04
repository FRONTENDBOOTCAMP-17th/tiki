import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isBooked } from "../_lib/stats";
import OrderTable from "./_components/OrderTable";
import type { OrderRow } from "./types";

const PAGE_SIZE = 20;

// 필터로 넘어올 수 있는 상태 값 (cart는 노출하지 않음)
const FILTER_STATUSES = ["ordered", "paid", "cancelled", "failed"];

export default async function TicketManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; eventId?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const statusFilter =
    sp.status && FILTER_STATUSES.includes(sp.status) ? sp.status : "all";
  const user = await requireUser();
  const supabase = await createClient();

  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title")
    .eq("seller_id", user.id);

  const events = eventRows ?? [];
  const eventIds = events.map((event) => event.event_id);
  const eventOptions = events.map((e) => ({ id: e.event_id, title: e.title }));

  const emptyTable = (
    <OrderTable
      orders={[]}
      events={eventOptions}
      filters={{ eventId: sp.eventId ?? "all", status: statusFilter }}
      pagination={{ page: 1, totalPages: 1, totalCount: 0 }}
      stats={{ totalQuantity: 0, totalRevenue: 0, totalCount: 0 }}
    />
  );

  if (eventIds.length === 0) return emptyTable;

  // 판매자 소유 이벤트로 스코핑. 특정 이벤트 필터는 소유 목록 안에 있을 때만 적용.
  const scopedEventIds =
    sp.eventId && eventIds.includes(sp.eventId) ? [sp.eventId] : eventIds;

  // 목록(현재 페이지)과 통계용 집계를 각각 조회한다. 집계는 합계에 필요한 3개 컬럼만.
  let pageQuery = supabase
    .from("orders")
    .select(
      "order_id, event_id, slot_id, ticket_grade_id, user_id, quantity, total_price, status, created_at",
      { count: "exact" },
    )
    .in("event_id", scopedEventIds)
    .neq("status", "cart");
  let aggQuery = supabase
    .from("orders")
    .select("quantity, total_price, status")
    .in("event_id", scopedEventIds)
    .neq("status", "cart");
  if (statusFilter !== "all") {
    pageQuery = pageQuery.eq("status", statusFilter);
    aggQuery = aggQuery.eq("status", statusFilter);
  }

  const from = (page - 1) * PAGE_SIZE;
  const [{ data: orderRows, count }, { data: aggRows }] = await Promise.all([
    pageQuery.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1),
    aggQuery,
  ]);

  const orders = orderRows ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // 통계 카드는 필터 전체(페이지 무관) 기준으로 집계한다.
  const booked = (aggRows ?? []).filter((o) => isBooked(o.status));
  const totalQuantity = booked.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = booked.reduce((sum, o) => sum + o.total_price, 0);

  const buyerIds = [...new Set(orders.map((order) => order.user_id))];
  const slotIds = [
    ...new Set(orders.map((o) => o.slot_id).filter((id): id is string => !!id)),
  ];
  const gradeIds = [
    ...new Set(
      orders.map((o) => o.ticket_grade_id).filter((id): id is string => !!id),
    ),
  ];

  const [{ data: buyerRows }, { data: slotRows }, { data: gradeRows }] =
    await Promise.all([
      buyerIds.length
        ? supabase
            .from("users")
            .select("id, name, email, phone")
            .in("id", buyerIds)
        : Promise.resolve({ data: [] }),
      slotIds.length
        ? supabase
            .from("slot")
            .select("slot_id, date, start_time")
            .in("slot_id", slotIds)
        : Promise.resolve({ data: [] }),
      gradeIds.length
        ? supabase
            .from("ticket_grade")
            .select("grade_id, grade_name")
            .in("grade_id", gradeIds)
        : Promise.resolve({ data: [] }),
    ]);

  const eventTitleMap = new Map(events.map((e) => [e.event_id, e.title]));
  const slotMap = new Map(
    (slotRows ?? []).map((s) => [
      s.slot_id,
      `${s.date} ${s.start_time?.slice(0, 5) ?? ""}`.trim(),
    ]),
  );
  const gradeMap = new Map(
    (gradeRows ?? []).map((g) => [g.grade_id, g.grade_name]),
  );
  const buyerMap = new Map((buyerRows ?? []).map((b) => [b.id, b]));

  const rows: OrderRow[] = orders.map((order) => ({
    order_id: order.order_id,
    event_id: order.event_id,
    event_title: eventTitleMap.get(order.event_id) ?? "알 수 없음",
    buyer_name: buyerMap.get(order.user_id)?.name ?? "구매자",
    buyer_email: buyerMap.get(order.user_id)?.email ?? "-",
    buyer_phone: buyerMap.get(order.user_id)?.phone ?? "-",
    grade_name: order.ticket_grade_id
      ? (gradeMap.get(order.ticket_grade_id) ?? "-")
      : "-",
    slot_label: order.slot_id ? (slotMap.get(order.slot_id) ?? "-") : "-",
    quantity: order.quantity,
    total_price: order.total_price,
    status: order.status,
    created_at: order.created_at ?? "",
  }));

  return (
    <OrderTable
      orders={rows}
      events={eventOptions}
      filters={{ eventId: sp.eventId ?? "all", status: statusFilter }}
      pagination={{ page, totalPages, totalCount }}
      stats={{ totalQuantity, totalRevenue, totalCount }}
    />
  );
}
