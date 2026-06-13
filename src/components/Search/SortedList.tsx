"use client";

import EventCard from "@/components/Search/EventCard";
import { useSortContext } from "@/components/Search/SortContext";

export default function SortedList() {
  const { sorted } = useSortContext();

  return (
    <ul className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:px-0">
      {sorted.map((item) => (
        // 검색결과는 인기순과 동일한 카드, 단 rank(번호)는 전달하지 않음
        <EventCard
          key={item.name}
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
