import Image from "next/image";
import Link from "next/link";
import { getMonthCells, type LibraryEvent } from "@/lib/mypage/library";

interface LibraryCalendarProps {
  year: number;
  month: number; // 0-based
  events?: LibraryEvent[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function LibraryCalendar({
  year,
  month,
  events = [],
}: LibraryCalendarProps) {
  const cells = getMonthCells(year, month);
  const eventMap = new Map(events.map((e) => [e.date, e]));

  return (
    <div>
      <div className="grid grid-cols-7 pb-2 text-center text-sm text-gray-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((date, i) => {
          if (date === null)
            return <div key={`empty-${i}`} className="aspect-square" />;

          const event = eventMap.get(date);

          return (
            <div
              key={date}
              className="flex aspect-square flex-col rounded-lg border border-gray-200 p-1 sm:rounded-xl sm:p-2"
            >
              <span className="text-[10px] leading-none text-gray-700 sm:text-sm">
                {date}
              </span>
              {event && (
                <Link
                  href={`/${event.eventId}`}
                  className="relative mt-0.5 flex-1 overflow-hidden rounded sm:mt-1 sm:rounded-md"
                >
                  <Image
                    src={event.imageUrl}
                    alt={event.title ?? "이벤트"}
                    fill
                    sizes="(max-width: 640px) 60px, 120px"
                    className="object-cover"
                  />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
