"use client";

import { ChevronLeft, Search, MapPin, Menu } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import RecentSearchList from "@/components/Search/RecentSearchList";
import { SortProvider } from "@/components/Search/SortContext";
import SortedList from "@/components/Search/SortedList";
import Navigation from "@/components/Navigation";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularEvents = [
    { id: 1, title: "뮤지컬 '레미제라블'", date: "2026-01-20" },
    { id: 2, title: "콘서트 'BTS 월드 투어'", date: "2026-01-22" },
    { id: 3, title: "연극 '햄릿'", date: "2026-01-25" },
    { id: 4, title: "발레 '백조의 호수'", date: "2026-01-28" },
    { id: 5, title: "오페라 '카르멘'", date: "2026-01-30" },
  ];

  const sortItems = popularEvents.map((e) => ({ name: e.title, date: e.date }));

  return (
    <>
      {/* 검색 상단 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <ChevronLeft className="w-8 h-8 shrink-0 cursor-pointer" />
        <div className="flex items-center flex-1 border rounded-full px-5 py-2 gap-1">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="flex-1 border-none outline-none bg-transparent text-lg lg:text-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
        <Menu className="w-8 h-8 shrink-0 cursor-pointer" />
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
          <div>
            <div>이번주 인기공연 TOP5</div>
            <ul>
              {popularEvents.map((event, index) => (
                <li key={event.id}>
                  <div>{index + 1}</div>
                  <Image
                    src={`https://picsum.photos/seed/${event.id}/200/300`}
                    alt={event.title}
                    width={200}
                    height={300}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <h4>{event.title}</h4>
                  <p>{event.date}</p>
                  <MapPin className="w-4 h-4" />
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* 검색 결과 */}
          <SortProvider items={sortItems}>
            <SortedList />
          </SortProvider>
        </>
      )}
      ㅓ
      <Navigation />
    </>
  );
}
