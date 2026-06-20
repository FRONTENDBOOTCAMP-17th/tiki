import LibraryCalendar from "@/components/mypage/library/LibraryCalendar";
import MonthNavigator from "@/components/mypage/library/MonthNavigator";
import type { LibraryEvent } from "@/lib/mypage/library";

// TODO: Supabase 연동 시 server에서 fetch
const mockEvents: LibraryEvent[] = [
  { date: 7, category: "concert" },
  { date: 11, category: "exhibition" },
  { date: 18, category: "musical" },
  { date: 25, category: "class" },
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
