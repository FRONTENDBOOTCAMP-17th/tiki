import LibraryCalendar from "@/components/mypage/library/LibraryCalendar";
import type { LibraryEvent } from "@/lib/mypage/library";

// TODO: Supabase 연동 시 server에서 fetch
const mockEvents: LibraryEvent[] = [
  { date: 7, category: "concert" },
  { date: 11, category: "exhibition" },
  { date: 18, category: "musical" },
  { date: 25, category: "class" },
];

export default function LibraryPage() {
  const now = new Date();

  return (
    <section>
      <h1 className="text-2xl font-bold">라이브러리</h1>
      <hr className="mt-4 mb-8 border-gray-200" />
      <LibraryCalendar
        year={now.getFullYear()}
        month={now.getMonth()}
        events={mockEvents}
      />
    </section>
  );
}