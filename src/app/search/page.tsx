"use client";

import { ChevronLeft, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import RecentSearchList from "@/components/Search/RecentSearchList";
import EventCard from "@/components/Search/EventCard";
import Filter from "@/components/Search/Filter";
import { SortProvider } from "@/components/Search/SortContext";
import SortedList from "@/components/Search/SortedList";
import type { SortItem } from "@/components/Search/filterSort";
import Navigation from "@/components/Navigation";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SortItem[]>([]);
  const [loading, setLoading] = useState(false);
  // 빠르게 타이핑 할 경우 응답 덮어쓰기 방지
  const [searchedKeyword, setSearchedKeyword] = useState("");

  // 검색어 변경시 0.3초 대기하고 작동
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    let ignore = false; // 늦게 도착한 이전 응답 무시
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/events/search?keyword=${encodeURIComponent(q)}`,
        );
        const json = await res.json();
        if (ignore) return;
        const items: SortItem[] = (json?.data?.items ?? []).map(
          (it: {
            title: string;
            startDate: string;
            venue?: { address?: string };
            thumbnail?: string;
          }) => ({
            name: it.title,
            date: it.startDate,
            location: it.venue?.address,
            image: it.thumbnail,
          }),
        );
        setResults(items);
        setSearchedKeyword(q);
      } catch {
        if (!ignore) {
          setResults([]);
          setSearchedKeyword(q);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

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

  // 응답 대기 중이면 "검색중"이라 표시
  const trimmedQuery = searchQuery.trim();
  const isSearching = loading || searchedKeyword !== trimmedQuery;

  return (
    <div className="lg:min-h-screen lg:bg-gray-50">
      {/* 검색 상단 헤더 */}
      <header className="bg-white lg:sticky lg:top-0 lg:z-40 lg:border-b lg:border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 lg:mx-auto lg:max-w-5xl xl:max-w-7xl lg:gap-4 lg:px-8 lg:py-4">
          <ChevronLeft className="w-7 h-7 shrink-0 cursor-pointer text-gray-700" />
          <div className="flex items-center flex-1 border border-gray-200 rounded-full px-4 py-2 gap-2 bg-white lg:py-2.5">
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
      </header>

      <main className="lg:mx-auto lg:max-w-5xl xl:max-w-7xl lg:px-8 lg:py-8">
        {searchQuery.length === 0 ? (
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-8">
            {/* 최근 검색어 리스트 */}
            <div className="flex flex-col px-5 py-2 gap-3 lg:px-5 lg:py-5 lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:shadow-sm">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold ">최근 검색어</div>
                <button className="font-semibold text-base">전체 삭제</button>
              </div>
              <RecentSearchList
                initialKeywords={["티셔츠", "청바지", "운동화"]}
              />
            </div>

            {/* 인기 공연 리스트 */}
            <div className=" flex flex-col p-5 gap-2 lg:p-0 lg:gap-4">
              <div className="font-bold lg:text-xl">이번주 인기공연 TOP5</div>
              <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
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
          </div>
        ) : (
          <SortProvider items={results}>
            <div className="flex flex-col gap-3 px-4 pt-3 pb-2 lg:px-0 lg:pt-0">
              <span className="text-base font-medium text-gray-800 lg:text-lg lg:font-semibold">
                검색결과
              </span>
              <Filter />
            </div>
            {isSearching ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                검색 중...
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                &lsquo;{trimmedQuery}&rsquo;에 대한 검색결과가 없습니다.
              </p>
            ) : (
              <SortedList />
            )}
          </SortProvider>
        )}
      </main>
      <Navigation />
    </div>
  );
}
