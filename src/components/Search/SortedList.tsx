import EventCard from "@/components/Search/EventCard";
import type { SortItem } from "@/components/Search/filterSort";

// 정렬/검색 결과 리스트 — 받은 items 를 순서대로 렌더(정렬은 부모/서버 책임)
export default function SortedList({ items }: { items: SortItem[] }) {
  return (
    <ul className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:px-0">
      {items.map((item, i) => (
        // 검색결과는 인기순과 동일한 카드, 단 rank(번호)는 전달하지 않음
        <EventCard
          key={`${item.name}-${i}`}
          item={{
            title: item.name,
            date: item.date,
            location: item.location,
            image: item.image,
          }}
        />
      ))}
    </ul>
  );
}
