"use client";

import type { EventCardItem } from "@/types/domain/event";
import { useDragScroll } from "@/hooks/useDragScroll";
import HomeSection from "./HomeSection";
import RankingCard from "./RankingCard";

interface HorizontalCardSectionProps {
  title: string;
  moreHref?: string;
  events: EventCardItem[];
  /** 순위 배지를 보여줄지 여부 (예매 랭킹에서만 true) */
  showRank?: boolean;
}

// 세로형 포스터 카드를 가로로 나열하는 섹션. 예매 랭킹/카테고리별 목록이 공통으로 쓴다.
// 모바일은 터치 스크롤, 데스크탑은 마우스 드래그로도 넘길 수 있다.
export default function HorizontalCardSection({
  title,
  moreHref,
  events,
  showRank = false,
}: HorizontalCardSectionProps) {
  const {
    ref: dragRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onClickCapture,
  } = useDragScroll<HTMLUListElement>();

  if (events.length === 0) return null;

  return (
    <HomeSection title={title} moreHref={moreHref}>
      <ul
        ref={dragRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClickCapture={onClickCapture}
        className="scrollbar-thin flex cursor-grab gap-3 overflow-x-auto pb-2 select-none md:grid md:grid-cols-5 md:cursor-auto md:gap-4 md:overflow-visible md:pb-0"
      >
        {events.map((event, index) => (
          <li key={event.eventId}>
            <RankingCard item={{ ...event, rank: showRank ? index + 1 : undefined }} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
