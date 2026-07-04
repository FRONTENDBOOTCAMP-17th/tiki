import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RankingItem } from "@/lib/event/ranking";

// 순위 배지 색
function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-linear-to-br from-accent-500 to-primary-600 text-white";
  if (rank <= 3) return "bg-primary-200 text-primary-800";
  return "bg-gray-100 text-gray-500";
}

// "2026-01-20" → "1월 20일"
function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

interface RankingListProps {
  items: RankingItem[];
  title?: string;          // 섹션 제목 (기본 "인기 랭킹")
  showBookingCount?: boolean; // 예매 수 표시 여부 (기본 false)
  columns?: 1 | 2;         // 데스크탑 열 수 (기본 1)
}

export default function RankingList({
  items,
  title = "인기 랭킹",
  showBookingCount = false,
  columns = 1,
}: RankingListProps) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      {title && (
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-50">
          <span className="inline-block h-5 w-1.5 rounded-full bg-accent-500" />
          {title}
        </h2>
      )}
      <ul
        className={cn(
          "flex flex-col gap-2.5",
          columns === 2 && "lg:grid lg:grid-cols-2 lg:gap-3",
        )}
      >
        {items.map((item, index) => {
          const rank = index + 1;
          return (
            <li key={item.eventId}>
              <Link
                href={`/${item.eventId}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 transition-shadow hover:shadow-md dark:border-surface-3 dark:bg-surface-1 dark:hover:bg-surface-2"
              >
                {/* 순위 배지 */}
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    rankBadgeClass(rank),
                  )}
                >
                  {rank}
                </span>

                {/* 포스터 썸네일 */}
                <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-primary-200 to-accent-200">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>

                {/* 텍스트 정보 */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.startDate)}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.venueName}</span>
                  </span>
                  {item.minPrice != null && (
                    <p className="mt-0.5 text-xs font-semibold text-primary-700">
                      {item.minPrice.toLocaleString("ko-KR")}원~
                    </p>
                  )}
                  {showBookingCount && item.bookingCount > 0 && (
                    <p className="text-xs text-accent-600">
                      예매 {item.bookingCount.toLocaleString()}건
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
