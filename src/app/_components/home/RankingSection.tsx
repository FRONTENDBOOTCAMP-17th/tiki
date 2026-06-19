import RankingCard, { type RankingCardItem } from "./RankingCard";

export type RankingEventItem = Omit<RankingCardItem, "rank">;

// 예매 랭킹: 누적 예매 수량이 높은 순으로 정렬된 이벤트를 세로형 카드로 가로 나열한다.
// 모바일은 가로 스크롤, 태블릿/웹은 한 행에 펼쳐서 보여준다.
export default function RankingSection({
  events,
}: {
  events: RankingEventItem[];
}) {
  if (events.length === 0) return null;

  return (
    <section className="px-4 py-6 md:px-8 lg:px-0">
      <h2 className="mb-3 text-lg font-bold text-gray-900 md:text-xl">
        예매 랭킹
      </h2>
      <ul className="scrollbar-thin flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
        {events.map((event, index) => (
          <li key={event.eventId}>
            <RankingCard item={{ ...event, rank: index + 1 }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
