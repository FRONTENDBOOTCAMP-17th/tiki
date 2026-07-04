import { NextRequest } from "next/server";
import { fail } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";
import { orderStatusLabel } from "@/app/seller/_lib/stats";

const FILTER_STATUSES = ["ordered", "paid", "cancelled", "failed"];

const CSV_HEADER = [
  "주문일시",
  "주문번호",
  "이벤트명",
  "구매자",
  "이메일",
  "연락처",
  "등급",
  "회차",
  "수량",
  "결제액",
  "상태",
];

// 콤마/따옴표/줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 두 번으로 이스케이프.
function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(req: NextRequest) {
  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  const statusFilter =
    status && FILTER_STATUSES.includes(status) ? status : "all";
  const eventIdParam = params.get("eventId");

  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title")
    .eq("seller_id", user.id);
  const events = eventRows ?? [];
  const eventIds = events.map((e) => e.event_id);

  if (eventIds.length === 0) return csvResponse([]);

  const scopedEventIds =
    eventIdParam && eventIds.includes(eventIdParam) ? [eventIdParam] : eventIds;

  let query = supabase
    .from("orders")
    .select(
      "order_id, event_id, slot_id, ticket_grade_id, user_id, quantity, total_price, status, created_at",
    )
    .in("event_id", scopedEventIds)
    .neq("status", "cart")
    .order("created_at", { ascending: false });
  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  const { data: orderRows, error } = await query;
  if (error) return fail("export_failed", 500);
  const orders = orderRows ?? [];

  const buyerIds = [...new Set(orders.map((o) => o.user_id))];
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

  const rows = orders.map((order) => [
    order.created_at
      ? new Date(order.created_at).toLocaleString("ko-KR")
      : "-",
    order.order_id,
    eventTitleMap.get(order.event_id) ?? "알 수 없음",
    buyerMap.get(order.user_id)?.name ?? "구매자",
    buyerMap.get(order.user_id)?.email ?? "-",
    buyerMap.get(order.user_id)?.phone ?? "-",
    order.ticket_grade_id ? (gradeMap.get(order.ticket_grade_id) ?? "-") : "-",
    order.slot_id ? (slotMap.get(order.slot_id) ?? "-") : "-",
    order.quantity,
    order.total_price,
    orderStatusLabel(order.status),
  ]);

  return csvResponse(rows);
}

function csvResponse(rows: unknown[][]) {
  const lines = [CSV_HEADER, ...rows].map((row) =>
    row.map(csvCell).join(","),
  );
  // 한글 엑셀 호환을 위해 UTF-8 BOM 선행.
  const body = "\uFEFF" + lines.join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orders.csv"',
    },
  });
}
