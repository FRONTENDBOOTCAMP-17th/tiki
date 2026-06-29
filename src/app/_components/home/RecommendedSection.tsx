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
    <HomeSection title="TIKI 추천 공연" className="bg-white">
      <div className="grid gap-4 lg:grid-cols-[minmax(18rem,1.1fr)_minmax(0,1fr)]">
        <Link
          href={`/${featured.eventId}`}
          className="group grid gap-4 rounded-xl border border-gray-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-sm sm:grid-cols-[8rem_minmax(0,1fr)]"
        >
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-primary-100 sm:w-32">
            <ThumbnailImage
              src={featured.thumbnail}
              alt={featured.title}
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-semibold text-primary-700">티키 PICK</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-gray-950">
              {featured.title}
            </h3>
            <div className="mt-3 flex flex-col gap-1 text-sm text-gray-500">
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
                className="group flex h-full gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-primary-300"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-primary-100">
                  <ThumbnailImage
                    src={event.thumbnail}
                    alt={event.title}
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
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
