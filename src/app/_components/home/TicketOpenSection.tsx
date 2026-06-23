import Link from "next/link";
import { formatShortDate, formatPriceFrom } from "@/lib/format";
import type { EventCardItem } from "@/types/domain/event";
import HomeSection from "./HomeSection";
import ThumbnailImage from "./ThumbnailImage";

// 티켓 오픈: 최근에 새로 등록된 공연을 그라데이션 카드로 강조해서 보여준다.
export default function TicketOpenSection({ events }: { events: EventCardItem[] }) {
  if (events.length === 0) return null;

  return (
    <HomeSection title="티켓 오픈">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {events.map((event) => (
          <li key={event.eventId}>
            <Link
              href={`/${event.eventId}`}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-400 to-secondary-400 p-4 transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/40">
                <ThumbnailImage
                  src={event.thumbnail}
                  alt={event.title}
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate text-sm font-semibold text-white">
                  {event.title}
                </p>
                <p className="text-xs text-white/80">
                  {formatShortDate(event.startDate, "오픈")}
                </p>
                {event.minPrice != null && (
                  <p className="text-xs text-white/80">
                    {formatPriceFrom(event.minPrice, "부터")}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
