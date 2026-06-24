"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import RankingList from "@/components/RankingList";
import type { RankingItem } from "@/lib/event/ranking";
import { categories } from "@/app/category/_categories";
import { revalidateRanking } from "./actions";

const TABS = [
  { slug: null, name: "전체" },
  ...categories.map(({ slug, name }) => ({ slug, name })),
];

// "2026-06-24T14:30:00.000Z" → "6월 24일 23:30 기준" (로컬 시간)
function formatGeneratedAt(iso: string) {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hh}:${mm} 기준`;
}

export default function RankingTabs({
  initialItems,
  generatedAt,
}: {
  initialItems: RankingItem[];
  generatedAt: string;
}) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  function handleTab(slug: string | null) {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    startTransition(async () => {
      const params = new URLSearchParams({ limit: "10" });
      if (slug) params.set("slug", slug);
      const res = await fetch(`/api/events/ranking?${params}`);
      const json = await res.json();
      setItems(json?.data?.items ?? []);
    });
  }

  function handleRefresh() {
    startRefresh(async () => {
      await revalidateRanking(); // ISR 캐시 무효화
      router.refresh();          // 서버 컴포넌트 재렌더 → 새 데이터
    });
  }

  const activeTab = TABS.find((t) => t.slug === activeSlug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:max-w-4xl lg:px-8">
      {/* 탭 바 */}
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:mx-0 lg:px-0">
        {TABS.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug ?? "all"}
              type="button"
              onClick={() => handleTab(tab.slug)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary-500 bg-primary-100 text-primary-800"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 기준 시각 + 리프레시 버튼 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">{formatGeneratedAt(generatedAt)}</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-40"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "업데이트 중..." : "새로고침"}
        </button>
      </div>

      {/* 랭킹 리스트 */}
      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        {items.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            아직 집계된 랭킹이 없어요.
          </p>
        ) : (
          <RankingList
            items={items}
            title={`${activeTab?.name ?? "전체"} 랭킹`}
            showBookingCount
            columns={2}
          />
        )}
      </div>
    </div>
  );
}
