"use client";

import { ChevronLeft, Search, Menu } from "lucide-react";
import { useState } from "react";
import RecentSearchList from "@/components/Search/RecentSearchList";
import EventCard from "@/components/Search/EventCard";
import Filter from "@/components/Search/Filter";
import { SortProvider } from "@/components/Search/SortContext";
import SortedList from "@/components/Search/SortedList";
import Navigation from "@/components/Navigation";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularEvents = [
    {
      id: 1,
      title: "뮤지컬 '레미제라블'",
      date: "2026-01-20",
      location: "서울 마포구 홍대 라이브홀",
    },
    {
      id: 2,
      title: "콘서트 'BTS 월드 투어'",
      date: "2026-01-22",
      location: "서울 송파구 올림픽공원",
    },
    {
      id: 3,
      title: "연극 '햄릿'",
      date: "2026-01-25",
      location: "서울 종로구 예술의전당",
    },
    {
      id: 4,
      title: "발레 '백조의 호수'",
      date: "2026-01-28",
      location: "서울 서초구 국립극장",
    },
    {
      id: 5,
      title: "오페라 '카르멘'",
      date: "2026-01-30",
      location: "서울 중구 세종문화회관",
    },
  ];

  const sortItems = popularEvents.map((e) => ({
    name: e.title,
    date: e.date,
    location: e.location,
  }));

  return (
    <>
      {/* 검색 상단 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <ChevronLeft className="w-7 h-7 shrink-0 cursor-pointer text-gray-700" />
        <div className="flex items-center flex-1 border border-gray-200 rounded-full px-4 py-2 gap-2 bg-white">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="flex-1 border-none outline-none bg-transparent text-base text-gray-900 placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
        <Menu className="w-7 h-7 shrink-0 cursor-pointer text-gray-700" />
      </div>
      {searchQuery.length === 0 ? (
        <>
          {/* 최근 검색어 리스트 */}
          <div className="flex flex-col px-5 py-2 gap-3 ">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold ">최근 검색어</div>
              <button className="font-semibold text-base">전체 삭제</button>
            </div>
            <RecentSearchList
              initialKeywords={["티셔츠", "청바지", "운동화"]}
            />
          </div>

          {/* 인기 공연 리스트 */}
          <div className=" flex flex-col p-5 gap-2">
            <div className="font-bold">이번주 인기공연 TOP5</div>
            <ul className="flex flex-col gap-3 ">
              {popularEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  rank={index + 1}
                  item={{
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    image: `https://picsum.photos/seed/${event.id}/200/300`,
                  }}
                />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <SortProvider items={sortItems}>
          <div className="flex flex-col gap-3 px-4 pt-3 pb-2">
            <span className="text-base font-medium text-gray-800">
              검색결과
            </span>
            <Filter />
          </div>
          <SortedList />
        </SortProvider>
      )}
      <Navigation />
    </>
  );
}
