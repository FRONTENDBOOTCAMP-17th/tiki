import {
  CATEGORY_META,
  getMonthCells,
  type LibraryEvent,
} from "@/lib/mypage/library";

interface LibraryCalendarProps {
  year: number;
  month: number; // 0-based
  events?: LibraryEvent[];
}

export default function LibraryCalendar({
  year,
  month,
  events = [],
}: LibraryCalendarProps) {
  const cells = getMonthCells(year, month);
  const eventMap = new Map(events.map((e) => [e.date, e]));

  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-3">
      {cells.map((date, i) => {
        if (date === null) return <div key={`empty-${i}`} aria-hidden />;

        const event = eventMap.get(date);
        const meta = event ? CATEGORY_META[event.category] : null;

        return (
          <div
            key={date}
            className={`flex min-h-24 flex-col rounded-2xl p-2 sm:min-h-32 sm:p-3 ${
              meta ? `bg-gradient-to-b ${meta.gradient}` : "bg-purple-50"
            }`}
          >
            <span
              className={`text-xs font-medium sm:text-sm ${
                meta ? "text-white" : "text-gray-400"
              }`}
            >
              {date}
            </span>
            {meta && (
              <span className="mt-auto self-center rounded-md bg-black/15 px-2 py-0.5 text-[10px] text-white sm:text-xs">
                {meta.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}