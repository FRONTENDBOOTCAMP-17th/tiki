import LibraryCalendar from "@/components/mypage/library/LibraryCalendar";
import MonthNavigator from "@/components/mypage/library/MonthNavigator";
import type { LibraryEvent } from "@/lib/mypage/library";

// TODO: Supabase 연동 시 server에서 fetch
const mockEvents: LibraryEvent[] = [
  { date: 10, category: "exhibition", eventId: "1", imageUrl: "https://picsum.photos/seed/ex/240" },
  { date: 17, category: "concert",    eventId: "2", imageUrl: "https://picsum.photos/seed/concert/240" },
  { date: 20, category: "class",      eventId: "3", imageUrl: "https://picsum.photos/seed/class/240" },
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const base = month ? new Date(`${month}-01`) : new Date();
  const year = base.getFullYear();
  const m = base.getMonth();

  return (
    <section>
      <MonthNavigator year={year} month={m} />
      <hr className="mt-4 mb-8 border-gray-200" />
      <LibraryCalendar year={year} month={m} events={mockEvents} />
    </section>
  );
}
