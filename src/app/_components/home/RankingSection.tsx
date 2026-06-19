import EventCard from "@/components/Search/EventCard";

export interface RankingEventItem {
  eventId: string;
  title: string;
  startDate: string;
  venueName: string;
  thumbnail: string;
}

// 예매 랭킹: 누적 예매 수량이 높은 순으로 정렬된 이벤트를 카드 리스트로 보여준다.
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
      <ul className="flex flex-col gap-2">
        {events.map((event, index) => (
          <EventCard
            key={event.eventId}
            rank={index + 1}
            item={{
              title: event.title,
              date: event.startDate,
              location: event.venueName,
              image: event.thumbnail,
            }}
          />
        ))}
      </ul>
    </section>
  );
}
