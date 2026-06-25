import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ReservationCard, {
  type Reservation,
} from "@/components/mypage/ReservationCard";
import ReceivedTicketCard, {
  type ReceivedTicket,
} from "@/components/mypage/ReceivedTicketCard";

const FILTERS = [
  { label: "전체", value: "all" },
  { label: "예매 확정", value: "confirmed" },
  { label: "예매 취소", value: "cancelled" },
  { label: "받은 티켓", value: "shared" },
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(date: string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day} (${DAYS[d.getDay()]})`;
}

function formatShort(date: string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function FilterTabs({ filter }: { filter: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = filter === f.value;
        const href =
          f.value === "all"
            ? "/mypage/reservations"
            : `/mypage/reservations?filter=${f.value}`;
        return (
          <Link
            key={f.value}
            href={href}
            className={
              active
                ? "rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            }
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();

  // 받은 티켓 탭
  if (filter === "shared") {
    const { data: received } = await supabase.rpc("get_my_received_tickets");
    const tickets = (received as ReceivedTicket[] | null) ?? [];

    return (
      <div className="flex flex-col gap-6">
        <FilterTabs filter={filter} />
        {tickets.length === 0 ? (
          <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            받은 티켓이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((t) => (
              <ReceivedTicketCard key={t.share_id} ticket={t} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 내 주문 (장바구니 cart 제외 → paid + cancelled)
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_id, quantity, status, total_price, created_at, event_id, slot_id, ticket_grade_id",
    )
    .eq("user_id", user.id)
    .neq("status", "cart")
    .order("created_at", { ascending: false });

  const eventIds = [...new Set((orders ?? []).map((o) => o.event_id))];
  const slotIds = [
    ...new Set(
      (orders ?? []).map((o) => o.slot_id).filter(Boolean) as string[],
    ),
  ];
  const gradeIds = [
    ...new Set(
      (orders ?? []).map((o) => o.ticket_grade_id).filter(Boolean) as string[],
    ),
  ];

  const [{ data: events }, { data: slots }, { data: grades }] =
    await Promise.all([
      eventIds.length
        ? supabase
            .from("event")
            .select("event_id, title, venue_name, venue_address")
            .in("event_id", eventIds)
        : Promise.resolve({ data: [] as any[] }),
      slotIds.length
        ? supabase
            .from("slot")
            .select("slot_id, date, start_time")
            .in("slot_id", slotIds)
        : Promise.resolve({ data: [] as any[] }),
      gradeIds.length
        ? supabase
            .from("ticket_grade")
            .select("grade_id, grade_name")
            .in("grade_id", gradeIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

  const eventMap = new Map((events ?? []).map((e) => [e.event_id, e]));
  const slotMap = new Map((slots ?? []).map((s) => [s.slot_id, s]));
  const gradeMap = new Map((grades ?? []).map((g) => [g.grade_id, g]));

  const reservations: Reservation[] = (orders ?? []).map((o) => {
    const ev = eventMap.get(o.event_id);
    const sl = o.slot_id ? slotMap.get(o.slot_id) : null;
    const gr = o.ticket_grade_id ? gradeMap.get(o.ticket_grade_id) : null;
    const place = [ev?.venue_address, ev?.venue_name].filter(Boolean).join(" ");
    const cancelled = o.status === "cancelled";

    return {
      id: o.order_id,
      eventId: o.event_id,
      title: ev?.title ?? "",
      status: cancelled ? "cancelled" : "confirmed",
      statusLabel: cancelled ? "예매 취소" : "예매 확정",
      seat: gr?.grade_name ?? "",
      count: o.quantity,
      bookedAt: o.created_at ? formatShort(o.created_at) : "",
      date: sl?.date ? formatDate(sl.date) : "",
      time: sl?.start_time ? sl.start_time.slice(0, 5) : "",
      place,
      orderNo: o.order_id.slice(0, 8).toUpperCase(),
      price: o.total_price,
    };
  });

  const list =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <FilterTabs filter={filter} />
      {list.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          예매 내역이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
