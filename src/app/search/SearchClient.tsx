"use client";

import { ChevronLeft, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import MobileDrawer from "@/components/mypage/MobileDrawer";
import MyPageSidebar from "@/components/sidebar/MyPageSidebar";
import {
  type Direction,
  type SortItem,
  type SortKey,
} from "@/components/Search/filterSort";
import { SearchBarInput } from "@/components/SearchBar";
import RecentKeywords from "./_components/RecentKeywords";
import SortFilter from "./_components/SortFilter";
import { ResultsGrid, ResultsSkeleton } from "./_components/ResultsGrid";
import { useRecentKeywords } from "@/hooks/useRecentKeywords";

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
      minPrice?: number | null;
    }>
  ).map((it) => ({
    id: it.eventId,
    name: it.title,
    date: it.startDate,
    location: it.venue?.address,
    image: it.thumbnail,
    minPrice: it.minPrice ?? null,
  }));
}

export default function SearchClient({
  popularSlot,
}: {
  popularSlot: ReactNode; // 서버에서 스트리밍되는 인기공연 섹션
}) {
  const router = useRouter();

  // ── 검색 입력/검색 로직 (기존 동작 보존) ───────────────────────────────
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

  // ── 최근 검색어 (localStorage) ────────────────────────────────────────
  const {
    keywords: recentKeywords,
    add: addKeyword,
    remove: removeKeyword,
    clear: clearKeywords,
  } = useRecentKeywords();

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

  // 첫 페이지 로딩중인지 — 스켈레톤 표시
  const isInitialLoading = trimmed !== "" && !isCurrent;

  return (
    <div className="min-h-screen bg-white dark:bg-surface-0 lg:bg-gray-50">
      {/* ── 검색 헤더 (입력 동작 보존, 레이아웃은 리뉴얼) ── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white dark:border-surface-3 dark:bg-surface-header">
        <div className="flex items-center gap-3 px-4 py-3 lg:mx-auto lg:max-w-360 lg:gap-4 lg:px-8 lg:py-4">
          {/* 홈 헤더 로고와 동일 폭 슬롯 → 검색바 시작 위치 정렬 (데스크탑) */}
          <div className="flex shrink-0 items-center min-[744px]:w-17">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="cursor-pointer rounded-full p-1 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-surface-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          <SearchBarInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            onSubmit={() => {
              if (trimmed) addKeyword(trimmed);
            }}
            autoFocus
          />

          {/* 햄버거 → 우측 슬라이드 사이드바(마이페이지). 데스크탑(lg)에선 숨김 */}
          <MobileDrawer>
            <MyPageSidebar />
          </MobileDrawer>
        </div>
      </header>

      <main className="pb-6 lg:mx-auto lg:max-w-7xl lg:px-8 lg:py-8">
        {trimmed.length === 0 ? (
          // ── 검색 전: 최근 검색어 + 인기공연 ──
          <div className="lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-6 lg:pt-2">
            <RecentKeywords
              keywords={recentKeywords}
              onSelect={setSearchQuery}
              onRemove={removeKeyword}
              onClear={clearKeywords}
            />
            {popularSlot}
          </div>
        ) : (
          // ── 검색 결과 ──
          <section className="flex flex-col gap-4 px-4 pt-4 lg:px-0 lg:pt-0">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 lg:text-base">
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  ‘{trimmed}’
                </span>{" "}
                검색결과
                {isCurrent && (
                  <span className="ml-1 font-semibold text-primary-700">
                    {total}건
                  </span>
                )}
              </p>
              <SortFilter
                sortKey={sortKey}
                direction={direction}
                onChange={changeSort}
              />
            </div>

            {isInitialLoading ? (
              <ResultsSkeleton />
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-surface-2">
                  <SearchX className="h-8 w-8 text-gray-300 dark:text-gray-500" />
                </span>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ‘{trimmed}’
                  </span>
                  에 대한 검색결과가 없습니다.
                </p>
              </div>
            ) : (
              <>
                <ResultsGrid items={results} />
                {/* 무한스크롤 감시 지점: 화면에 들어오면 다음 페이지 로드 */}
                {hasMore && (
                  <div ref={sentinelRef} aria-hidden className="h-10" />
                )}
                {loading && (
                  <p className="py-4 text-center text-sm text-gray-400">
                    불러오는 중...
                  </p>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <Navigation />
    </div>
  );
}
