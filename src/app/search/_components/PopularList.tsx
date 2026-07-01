import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatEventDate, formatPrice } from "./utils";

export type PopularEvent = {
  id: number | string; // 이벤트 상세(/[eventId])로 이동할 식별자
  title: string;
  date: string; // ISO 문자열 ("2026-01-20")
  location?: string;
  image?: string;
  minPrice?: number | null;
};

// 순위 배지 색: 1위는 그라데이션 강조, 2~3위는 옅은 보라, 그 외는 회색.
function rankBadgeClass(rank: number) {
  if (rank === 1)
    return "bg-linear-to-br from-accent-500 to-primary-600 text-white";
  if (rank <= 3) return "bg-primary-200 text-primary-800";
  return "bg-gray-100 text-gray-500";
}

// 인기공연 로딩 스켈레톤 — 서버에서 랭킹이 스트리밍되는 동안 표시.
export function PopularSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="flex flex-col gap-4 px-4 py-4 lg:p-0" aria-hidden>
      <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-gray-50">
        <TrendingUp className="h-5 w-5 text-accent-700" />
        이번주 인기공연 TOP5
      </h2>
      <ul className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <li
            key={i}
            className="flex animate-pulse items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
          >
            <span className="h-7 w-7 shrink-0 rounded-full bg-gray-100 dark:bg-[#3c4043]" />
            <div className="aspect-3/4 w-14 shrink-0 rounded-xl bg-gray-100 dark:bg-[#3c4043]" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="h-3.5 w-3/4 rounded bg-gray-100 dark:bg-[#3c4043]" />
              <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-[#3c4043]" />
              <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-[#3c4043]" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 이번주 인기공연 TOP5 — 순위 배지 + 가로형 카드 목록.
export default function PopularList({ events }: { events: PopularEvent[] }) {
  return (
    <section className="flex flex-col gap-4 px-4 py-4 lg:p-0">
      <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-gray-50">
        <TrendingUp className="h-5 w-5 text-accent-700" />
        이번주 인기공연 TOP5
      </h2>
      <ul className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
        {events.map((event, index) => {
          const rank = index + 1;
          return (
            <li key={event.id}>
              <Link
                href={`/${event.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 transition-shadow hover:shadow-md dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:bg-[#303134]"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    rankBadgeClass(rank),
                  )}
                >
                  {rank}
                </span>
                <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-primary-200 to-accent-200">
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatEventDate(event.date)}
                  </p>
                  {event.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </span>
                  )}
                  {event.minPrice != null && (
                    <p className="mt-0.5 text-xs font-semibold text-primary-700">
                      {formatPrice(event.minPrice)}~
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
