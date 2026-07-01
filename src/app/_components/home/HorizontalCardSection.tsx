"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import HomeSection from "./HomeSection";
import ThumbnailImage from "./ThumbnailImage";
import type { HomeEventCardItem } from "./types";
import { useHomeDragScroll } from "./useHomeDragScroll";

interface HorizontalCardSectionProps {
  title: string;
  moreHref?: string;
  events: HomeEventCardItem[];
  /** 순위 배지를 보여줄지 여부 (예매 랭킹에서만 true) */
  showRank?: boolean;
  className?: string;
}

function formatDateRange(startDate: string, endDate?: string) {
  if (!endDate || endDate === startDate) return formatShortDate(startDate);
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

// 세로형 포스터 카드. 예매 랭킹 + 카테고리별 목록에서 공통으로 쓴다. 클릭하면 상세 페이지로 이동한다.
function PosterCard({
  item,
  rank,
}: {
  item: HomeEventCardItem;
  /** 예매 랭킹에서만 쓰는 순위 배지. 없으면(카테고리 목록 등) 표시하지 않는다. */
  rank?: number;
}) {
  return (
    <Link
      href={`/${item.eventId}`}
      className="group flex w-36 shrink-0 flex-col gap-2 transition-transform active:scale-95 md:w-44"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-[#34363a]">
        <div className="relative size-full transition-transform duration-300 group-hover:scale-105">
          <ThumbnailImage
            src={item.thumbnail}
            alt={item.title}
            sizes="200px"
            className="object-cover"
          />
        </div>
        {rank != null && (
          <span className="absolute bottom-2 left-2 text-4xl font-black leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
            {rank}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="truncate text-[15px] font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-gray-100 dark:group-hover:text-white">
          {item.title}
        </h4>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {formatDateRange(item.startDate, item.endDate)}
        </p>
        {item.venueName && (
          <p className="flex min-w-0 items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{item.venueName}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

// 세로형 포스터 카드를 가로로 나열하는 섹션. 예매 랭킹/카테고리별 목록이 공통으로 쓴다.
// 모바일은 터치 스크롤, 데스크탑은 마우스 드래그로도 넘길 수 있다.
export default function HorizontalCardSection({
  title,
  moreHref,
  events,
  showRank = false,
  className,
}: HorizontalCardSectionProps) {
  const {
    ref: dragRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onClickCapture,
    onDragStart,
  } = useHomeDragScroll<HTMLUListElement>();

  if (events.length === 0) return null;

  return (
    <HomeSection title={title} moreHref={moreHref} className={className}>
      <ul
        ref={dragRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClickCapture={onClickCapture}
        onDragStart={onDragStart}
        className="scrollbar-hide flex cursor-grab gap-3 overflow-x-auto pb-2 select-none md:gap-4"
      >
        {events.map((event, index) => (
          <li key={event.eventId}>
            <PosterCard item={event} rank={showRank ? index + 1 : undefined} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
