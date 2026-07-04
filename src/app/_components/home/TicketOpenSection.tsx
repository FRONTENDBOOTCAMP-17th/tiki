import Link from "next/link";
import { formatShortDate, formatPriceFrom } from "@/lib/format";
import HomeSection from "./HomeSection";
import ThumbnailImage from "./ThumbnailImage";
import type { HomeEventCardItem } from "./types";

interface TicketOpenSectionProps {
  todayEvents: HomeEventCardItem[];
  fallbackEvents: HomeEventCardItem[];
}

function getOpenDate(event: HomeEventCardItem) {
  return event.createdAt ? event.createdAt.slice(0, 10) : event.startDate;
}

export default function TicketOpenSection({
  todayEvents,
  fallbackEvents,
}: TicketOpenSectionProps) {
  const events = todayEvents.length > 0 ? todayEvents : fallbackEvents;
  if (events.length === 0) return null;

  const isEmptyToday = todayEvents.length === 0;
  const guideTitle = isEmptyToday ? "최근 오픈 공연" : "오늘 오픈 공연";
  const guideDescription = isEmptyToday
    ? "오늘 오픈한 공연이 아직 없어요."
    : "오늘 새로 열린 공연이에요.";

  return (
    <HomeSection title="티켓 오픈" className="bg-white dark:bg-surface-0">
      <div className="grid gap-4 lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)]">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 dark:border-surface-3 dark:bg-surface-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{guideTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {guideDescription}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <li key={event.eventId}>
              <Link
                href={`/${event.eventId}`}
                className="group flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-surface-3 dark:bg-surface-1 dark:hover:border-gray-500 dark:hover:bg-surface-2"
              >
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-100 dark:bg-surface-4">
                  <ThumbnailImage
                    src={event.thumbnail}
                    alt={event.title}
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-gray-50 dark:group-hover:text-white">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatShortDate(getOpenDate(event), "오픈")}
                  </p>
                  {event.minPrice != null && (
                    <p className="text-xs font-medium text-primary-700 dark:text-gray-100">
                      {formatPriceFrom(event.minPrice, "부터")}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomeSection>
  );
}
