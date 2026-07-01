"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import ThumbnailImage from "@/app/_components/home/ThumbnailImage";
import type { HomeEventCardItem } from "@/app/_components/home/types";

const PAGE_SIZE = 12;

function formatDateRange(startDate: string, endDate?: string) {
  if (!endDate || endDate === startDate) return formatShortDate(startDate);
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

// 전체 공연 세로 포스터 카드 그리드 (12개 단위 페이지네이션).
export default function CategoryEventGrid({
  events,
}: {
  events: HomeEventCardItem[];
}) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  if (events.length === 0) return null;

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageEvents = events.slice(start, start + PAGE_SIZE);

  function goTo(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-20">
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {pageEvents.map((event) => (
          <li key={event.eventId}>
            <Link
              href={`/${event.eventId}`}
              className="group flex flex-col gap-2 transition-transform active:scale-95"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
                <div className="relative size-full transition-transform duration-300 group-hover:scale-105">
                  <ThumbnailImage
                    src={event.thumbnail}
                    alt={event.title}
                    sizes="(min-width: 1024px) 240px, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="truncate text-[15px] font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-gray-50 dark:group-hover:text-gray-200">
                  {event.title}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                {event.venueName && (
                  <p className="flex min-w-0 items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{event.venueName}</span>
                  </p>
                )}
                {event.minPrice != null && (
                  <p className="text-xs font-semibold text-primary-700">
                    {event.minPrice.toLocaleString("ko-KR")}원~
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="이전 페이지"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="flex items-center text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="size-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "text-sm transition-colors",
                p === page
                  ? "font-semibold text-primary-700 underline decoration-primary-600 decoration-2 underline-offset-8"
                  : "font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
              )}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            aria-label="다음 페이지"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="flex items-center text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight className="size-5" />
          </button>
        </nav>
      )}
    </div>
  );
}
