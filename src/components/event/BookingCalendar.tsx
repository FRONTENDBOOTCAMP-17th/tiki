"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface BookingCalendarProps {
  month: Date; // 표시 중인 달 (1일 기준)
  selectedDate?: string | null; // "YYYY-MM-DD"
  rangeStart?: string | null;
  rangeEnd?: string | null;
  markedDates?: Set<string>;
  availableDates: Set<string>; // 회차가 있는 날짜
  minDate?: string;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: string) => void;
  hideNav?: boolean;
}

function toISODate(year: number, monthIndex: number, day: number) {
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function BookingCalendar({
  month,
  selectedDate,
  rangeStart,
  rangeEnd,
  markedDates,
  availableDates,
  minDate,
  onMonthChange,
  onSelectDate,
  hideNav,
}: BookingCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // 앞쪽 빈칸 + 날짜 셀
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    year: "numeric",
  }).format(month);
  const currentMonthStart = toISODate(year, monthIndex, 1);
  const minMonthStart = minDate ? minDate.slice(0, 7) + "-01" : null;
  const canGoPrev = !minMonthStart || currentMonthStart > minMonthStart;

  return (
    <div className="flex w-full flex-col gap-2">
      {/* 헤더 : 월 이동 */}
      {hideNav ? (
        <div className="px-1 py-0.5 text-center text-sm font-semibold text-gray-900">
          {monthLabel}
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="이전 달"
            disabled={!canGoPrev}
            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
            className="flex size-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {monthLabel}
          </span>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
            className="flex size-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 요일 */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-sm">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;

          const iso = toISODate(year, monthIndex, day);
          const hasSlot = availableDates.has(iso);
          const beforeMinDate = !!minDate && iso < minDate;
          const selectable = hasSlot && !beforeMinDate;
          const marked = !!markedDates && markedDates.has(iso);
          const isEndpoint =
            selectedDate === iso || rangeStart === iso || rangeEnd === iso;
          const inRange =
            !!rangeStart &&
            !!rangeEnd &&
            iso > rangeStart &&
            iso < rangeEnd;

          return (
            <button
              key={iso}
              type="button"
              disabled={!selectable}
              onClick={() => onSelectDate(iso)}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full",
                marked && "bg-danger-500 font-semibold text-white",
                !marked && isEndpoint && "bg-primary-700 font-semibold text-white",
                !marked && !isEndpoint && inRange && "bg-primary-100 text-primary-700",
                !marked &&
                  !isEndpoint &&
                  !inRange &&
                  selectable &&
                  "text-gray-900 hover:bg-primary-100",
                !selectable && "text-gray-300",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
