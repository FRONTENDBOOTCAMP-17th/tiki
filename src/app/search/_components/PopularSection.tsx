import { fetchRanking } from "@/lib/event/ranking";
import PopularList, { type PopularEvent } from "./PopularList";

const POPULAR_LIMIT = 5; // 인기공연 TOP5
const POPULAR_DAYS = 7; // 이번주(최근 7일) 예매 수 기준

// 서버 컴포넌트: 랭킹을 서버에서 직접 조회해 스트리밍한다.
export default async function PopularSection() {
  const items = await fetchRanking({ limit: POPULAR_LIMIT, days: POPULAR_DAYS });

  const events: PopularEvent[] = items.map((it) => ({
    id: it.eventId,
    title: it.title,
    date: it.startDate,
    location: it.venueName,
    image: it.thumbnail ?? undefined,
    minPrice: it.minPrice ?? null,
  }));

  return <PopularList events={events} />;
}
