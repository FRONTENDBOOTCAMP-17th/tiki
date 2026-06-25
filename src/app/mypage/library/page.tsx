import LibraryCalendar from "@/components/mypage/library/LibraryCalendar";
import MonthNavigator from "@/components/mypage/library/MonthNavigator";
import type { LibraryEvent, LibraryCategory } from "@/lib/mypage/library";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = ["concert", "exhibition", "musical", "class"];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const base = month ? new Date(`${month}-01`) : new Date();
  const year = base.getFullYear();
  const m = base.getMonth(); // 0-based

  const user = await requireUser();
  const supabase = await createClient();

  // 1) 내 주문 (결제 완료)
  const { data: orders } = await supabase
    .from("orders")
    .select("event_id, slot_id")
    .eq("user_id", user.id)
    .eq("status", "paid");

  const eventIds = [...new Set((orders ?? []).map((o) => o.event_id))];

  // 주문 없으면 빈 달력
  if (eventIds.length === 0) {
    return (
      <section>
        <MonthNavigator year={year} month={m} />
        <hr className="mt-4 mb-8 border-gray-200" />
        <LibraryCalendar year={year} month={m} events={[]} />
      </section>
    );
  }

  const slotIds = [
    ...new Set(
      (orders ?? []).map((o) => o.slot_id).filter(Boolean) as string[],
    ),
  ];

  // 2) event / slot 조회 (FK 없어 수동 조인)
  const [{ data: events }, { data: slots }] = await Promise.all([
    supabase
      .from("event")
      .select("event_id, start_date, category_id, thumbnail, title")
      .in("event_id", eventIds),
    slotIds.length
      ? supabase.from("slot").select("slot_id, date").in("slot_id", slotIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  // 3) category_id → slug
  const categoryIds = [...new Set((events ?? []).map((e) => e.category_id))];
  const { data: categories } = categoryIds.length
    ? await supabase
        .from("category")
        .select("category_id, slug")
        .in("category_id", categoryIds)
    : { data: [] as any[] };

  const eventMap = new Map((events ?? []).map((e) => [e.event_id, e]));
  const slotMap = new Map((slots ?? []).map((s) => [s.slot_id, s]));
  const catMap = new Map(
    (categories ?? []).map((c) => [c.category_id, c.slug]),
  );

  // 4) 해당 월 이벤트만 LibraryEvent로 변환
  const monthKey = `${year}-${String(m + 1).padStart(2, "0")}`; // "2026-06"
  const libraryEvents: LibraryEvent[] = [];

  for (const o of orders ?? []) {
    const ev = eventMap.get(o.event_id);
    if (!ev) continue;

    const sl = o.slot_id ? slotMap.get(o.slot_id) : null;
    const dateStr: string | undefined = sl?.date ?? ev.start_date; // 관람일: slot 우선
    if (!dateStr?.startsWith(monthKey)) continue; // 이번 달만

    const slug = catMap.get(ev.category_id);
    const category = (
      VALID_CATEGORIES.includes(slug ?? "") ? slug : "concert"
    ) as LibraryCategory;

    libraryEvents.push({
      date: Number(dateStr.slice(8, 10)), // "2026-06-17" → 17
      category,
      eventId: ev.event_id,
      imageUrl: ev.thumbnail,
      title: ev.title,
    });
  }

  return (
    <section>
      <MonthNavigator year={year} month={m} />
      <hr className="mt-4 mb-8 border-gray-200" />
      <LibraryCalendar year={year} month={m} events={libraryEvents} />
    </section>
  );
}
