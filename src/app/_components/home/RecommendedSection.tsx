import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import HomeSection from "./HomeSection";
import ThumbnailImage from "./ThumbnailImage";
import type { HomeEventCardItem } from "./types";

export default function RecommendedSection({
  events,
}: {
  events: HomeEventCardItem[];
}) {
  if (events.length === 0) return null;

  const [featured, ...rest] = events;

  return (
    <HomeSection title="TIKI 추천 공연" className="bg-white dark:bg-[#202124]">
      <div className="grid gap-4 lg:grid-cols-[minmax(17rem,0.95fr)_minmax(0,1.15fr)]">
        <Link
          href={`/${featured.eventId}`}
          className="group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-sm sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4 sm:p-4 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:border-gray-500"
        >
          <div className="relative aspect-3/4 w-24 overflow-hidden rounded-lg bg-primary-100 sm:w-32 dark:bg-[#34363a]">
            <ThumbnailImage
              src={featured.thumbnail}
              alt={featured.title}
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col items-start justify-center text-left">
            <p className="text-xs font-semibold text-primary-700 dark:text-gray-200">
              티키 PICK
            </p>
            <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-950 sm:text-lg dark:text-gray-50">
              {featured.title}
            </h3>
            <div className="mt-2 flex min-w-0 flex-col gap-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0" />
                {formatShortDate(featured.startDate)}
              </span>
              {featured.venueName && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{featured.venueName}</span>
                </span>
              )}
            </div>
          </div>
        </Link>

        <ul className="grid gap-3 sm:grid-cols-2">
          {rest.map((event) => (
            <li key={event.eventId}>
              <Link
                href={`/${event.eventId}`}
                className="group flex h-full gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-primary-300 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:border-gray-500"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-primary-100 dark:bg-[#34363a]">
                  <ThumbnailImage
                    src={event.thumbnail}
                    alt={event.title}
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-50">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatShortDate(event.startDate)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomeSection>
  );
}
