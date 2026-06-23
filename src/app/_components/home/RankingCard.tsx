import Link from "next/link";
import { formatShortDate, formatPriceFrom } from "@/lib/format";
import type { EventCardItem } from "@/types/domain/event";
import ThumbnailImage from "./ThumbnailImage";

export interface RankingCardItem extends EventCardItem {
  /** 예매 랭킹에서만 쓰는 순위 배지. 없으면(카테고리 목록 등) 표시하지 않는다. */
  rank?: number;
}

// 세로형 포스터 카드. 예매 랭킹 + 카테고리별 목록에서 공통으로 쓴다. 클릭하면 상세 페이지로 이동한다.
export default function RankingCard({ item }: { item: RankingCardItem }) {
  return (
    <Link
      href={`/${item.eventId}`}
      className="group flex w-36 shrink-0 flex-col gap-2 transition-transform active:scale-95 md:w-44"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl shadow-sm transition-shadow group-hover:shadow-lg">
        <div className="size-full transition-transform duration-300 group-hover:scale-105">
          <ThumbnailImage
            src={item.thumbnail}
            alt={item.title}
            sizes="200px"
            className="object-cover"
          />
        </div>
        {item.rank != null && (
          <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
            {item.rank}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-700">
          {item.title}
        </h4>
        <p className="text-xs text-gray-500">
          {formatShortDate(item.startDate)}
        </p>
        {item.venueName && (
          <p className="truncate text-xs text-gray-400">{item.venueName}</p>
        )}
        {item.minPrice != null && (
          <p className="text-xs font-medium text-primary-700">
            {formatPriceFrom(item.minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
