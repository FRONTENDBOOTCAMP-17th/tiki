import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrderTable from "./_components/OrderTable";
import type { OrderRow } from "./types";

export default async function TicketManagementPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title")
    .eq("seller_id", user.id);

  const events = eventRows ?? [];
  const eventIds = events.map((event) => event.event_id);

  if (eventIds.length === 0) {
    return <OrderTable orders={[]} events={[]} />;
  }

  const [{ data: orderRows }, { data: slotRows }, { data: gradeRows }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "order_id, event_id, slot_id, ticket_grade_id, user_id, quantity, total_price, status, created_at",
        )
        .in("event_id", eventIds)
        .neq("status", "cart")
        .order("created_at", { ascending: false }),
      supabase
        .from("slot")
        .select("slot_id, date, start_time")
        .in("event_id", eventIds),
      supabase
        .from("ticket_grade")
        .select("grade_id, grade_name")
        .in("event_id", eventIds),
    ]);

  const orders = orderRows ?? [];

  const buyerIds = [...new Set(orders.map((order) => order.user_id))];
  const { data: buyerRows } = buyerIds.length
    ? await supabase
        .from("users")
        .select("id, name, email, phone")
        .in("id", buyerIds)
    : { data: [] };

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
      events={events.map((e) => ({ id: e.event_id, title: e.title }))}
    />
  );
}
