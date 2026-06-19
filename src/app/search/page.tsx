"use client";

import { ChevronLeft, Search, Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import RecentSearchList from "@/components/Search/RecentSearchList";
import EventCard from "@/components/Search/EventCard";
import Filter from "@/components/Search/Filter";
import SortedList from "@/components/Search/SortedList";
import {
  type SortItem,
  type SortKey,
  type Direction,
} from "@/components/Search/filterSort";
import Navigation from "@/components/Navigation";

const LIMIT = 25; // 한 번에 불러올 개수

// 서버 응답 item → 카드/리스트가 쓰는 SortItem 형태로 변환
function toSortItems(items: unknown[]): SortItem[] {
  return (
    items as Array<{
      eventId: string;
      title: string;
      startDate: string;
      venue?: { address?: string };
      thumbnail?: string;
    }>
  ).map((it) => ({
    id: it.eventId,
    name: it.title,
    date: it.startDate,
    location: it.venue?.address,
    image: it.thumbnail,
  }));
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [direction, setDirection] = useState<Direction>("desc");

  const [results, setResults] = useState<SortItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // 응답 중첩 방지
  const [loadedKey, setLoadedKey] = useState("");

  const trimmed = searchQuery.trim();
  const requestKey = `${trimmed}|${sortKey}|${direction}`;
  const loadingRef = useRef(false);

  // 정렬 버튼 클릭
  const changeSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
      }
    },
    [sortKey],
  );

  // 한 페이지 요청
  const fetchPage = useCallback(
    async (pageNum: number) => {
      const params = new URLSearchParams({
        keyword: trimmed,
        sortKey,
        direction,
        page: String(pageNum),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/events/search?${params}`);
      const json = await res.json();
      return json?.data ?? { items: [], total: 0 };
    },
    [trimmed, sortKey, direction],
  );

  // 1) 검색어/정렬 변경 (1페이지부터 다시 로드)
  useEffect(() => {
    if (!trimmed) return;

    let ignore = false;
    const timer = setTimeout(async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        const data = await fetchPage(1);
        if (ignore) return;
        setResults(toSortItems(data.items));
        setTotal(data.total ?? 0);
        setPage(1);
        setLoadedKey(requestKey);
      } catch {
        if (!ignore) {
          setResults([]);
          setTotal(0);
          setPage(1);
          setLoadedKey(requestKey);
        }
      } finally {
        loadingRef.current = false;
        if (!ignore) setLoading(false);
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [trimmed, requestKey, fetchPage]);

  // 2) 페이지 이어붙이기 (무한스크롤에서 호출)
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const next = page + 1;
    try {
      const data = await fetchPage(next);
      setResults((prev) => [...prev, ...toSortItems(data.items)]);
      setTotal(data.total ?? total);
      setPage(next);
    } catch {
      // 추가 로딩 실패시 무시
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page, total, fetchPage]);

  // 3) 스크롤 감지(sentinel)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isCurrent = loadedKey === requestKey; // 결과가 현재 요청과 일치하는지
  const hasMore = isCurrent && results.length < total;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }, // 바닥 200px 전에 미리 로드
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // 첫 페이지 로딩중인지 — 검색중 표시
  const isInitialLoading = trimmed !== "" && !isCurrent;

  // 검색어 없을 때 예시코드
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

  return (
    <div className="lg:min-h-screen lg:bg-gray-50">
      {/* 검색 상단 헤더 */}
      <header className="bg-white lg:sticky lg:top-0 lg:z-40 lg:border-b lg:border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 lg:mx-auto lg:max-w-6xl lg:gap-4 lg:px-8 lg:py-4">
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
          <Menu className="w-7 h-7 shrink-0 cursor-pointer text-gray-700 lg:hidden" />
        </div>
      </header>

      <main className="lg:mx-auto lg:max-w-6xl lg:px-8 lg:py-8">
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
                      id: event.id,
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
          <>
            <div className="flex flex-col gap-3 px-4 pt-3 pb-2 lg:px-0 lg:pt-0">
              <span className="text-base font-medium text-gray-800 lg:text-lg lg:font-semibold">
                검색결과
              </span>
              <Filter
                sortKey={sortKey}
                direction={direction}
                onChange={changeSort}
              />
            </div>
            {isInitialLoading ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                검색 중...
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                &lsquo;{trimmed}&rsquo;에 대한 검색결과가 없습니다.
              </p>
            ) : (
              <>
                <SortedList items={results} />
                {/* 무한스크롤 감시 지점: 화면에 들어오면 다음 페이지 로드 */}
                {hasMore && (
                  <div ref={sentinelRef} aria-hidden className="h-10" />
                )}
                {loading && (
                  <p className="px-4 py-4 text-center text-sm text-gray-400">
                    불러오는 중...
                  </p>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Navigation />
    </div>
  );
}
