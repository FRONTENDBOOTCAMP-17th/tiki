import type { EventCardItem } from "@/types/domain/event";
import HorizontalCardSection from "./HorizontalCardSection";

// 예매 랭킹: 누적 예매 수량이 높은 순으로 정렬된 이벤트를 순위 배지와 함께 보여준다.
export default function RankingSection({ events }: { events: EventCardItem[] }) {
  return <HorizontalCardSection title="예매 랭킹" events={events} showRank />;
}
