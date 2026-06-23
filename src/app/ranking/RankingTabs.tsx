"use client";

import { useState, useTransition } from "react";
import RankingList from "@/components/RankingList";
import type { RankingItem } from "@/lib/event/ranking";
import { categories } from "@/app/category/_categories";

const TABS = [
  { slug: null, name: "전체" },
  ...categories.map(({ slug, name }) => ({ slug, name })),
];

export default function RankingTabs({
  initialItems,
}: {
  initialItems: RankingItem[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

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
