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
              className="flex aspect-square flex-col rounded-xl border border-gray-200 p-2"
            >
              <span className="text-sm text-gray-700">{date}</span>
              {event && (
                <Link
                  href={`/${event.eventId}`}
                  className="relative mt-1 flex-1 overflow-hidden rounded-md"
                >
                  <Image
                    src={event.imageUrl}
                    alt={event.title ?? "이벤트"}
                    fill
                    sizes="120px"
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
