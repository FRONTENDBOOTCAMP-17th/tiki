import Image from "next/image";
import Link from "next/link";

export interface CategoryEventItem {
  eventId: string;
  title: string;
  startDate: string;
  endDate?: string;
  venueName: string;
  thumbnail: string;
  minPrice: number | null;
  discountRate?: number;
  badge?: string;
}

// "2026-07-17" -> "26.07.17"
function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year.slice(2)}.${month}.${day}`;
}

// 카테고리 상세 하단: 배너와 동일한 데이터를 가로형 카드 리스트로 나열한다.
export default function EventList({ events }: { events: CategoryEventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="px-4 py-6 md:px-8 lg:px-16">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 md:text-xl">
        <span className="inline-block h-5 w-1.5 rounded-full bg-accent-500" />
        인기순
      </h2>
      <ul className="grid grid-cols-1 gap-4 min-[744px]:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <li key={event.eventId}>
            <Link
              href={`/${event.eventId}`}
              className="flex gap-4 rounded-xl p-2 transition-colors hover:bg-primary-100"
            >
              <div className="relative aspect-3/4 w-36 shrink-0 overflow-hidden rounded-lg">
                {event.thumbnail ? (
                  <Image
                    src={event.thumbnail}
                    alt={event.title}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-accent-300 to-primary-500" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
                <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                  {event.title}
                </h3>
                <p className="truncate text-sm text-gray-500">
                  {event.venueName}
                </p>
                <p className="text-sm text-gray-400">
                  {formatDate(event.startDate)}
                </p>
                {event.minPrice != null && (
                  <p className="mt-auto text-lg font-bold text-primary-700">
                    {event.discountRate != null && (
                      <span className="mr-1 text-accent-700">
                        {event.discountRate}%
                      </span>
                    )}
                    {event.minPrice.toLocaleString("ko-KR")}원
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
