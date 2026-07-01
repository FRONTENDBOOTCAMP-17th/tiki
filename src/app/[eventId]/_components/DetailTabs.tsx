"use client";

import { Children, ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface DetailTab {
  id: string;
  label: string;
  badge?: string;
}

interface DetailTabsProps {
  tabs: DetailTab[];
  children: ReactNode;
}

// 해시 → 탭 매핑 (#reviews 는 구매평 탭)
const HASH_TO_TAB_ID: Record<string, string> = {
  reviews: "event-reviews",
};

// URL 해시로부터 초기 활성 탭 인덱스를 구한다 (없으면 0)
function getInitialIndex(tabs: DetailTab[]) {
  if (typeof window === "undefined") return 0;
  const hash = window.location.hash.replace("#", "");
  if (!hash) return 0;
  const targetId = HASH_TO_TAB_ID[hash] ?? hash;
  const index = tabs.findIndex((t) => t.id === targetId);
  return index === -1 ? 0 : index;
}

export default function DetailTabs({ tabs, children }: DetailTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() => getInitialIndex(tabs));
  const panels = Children.toArray(children);

  // 해시로 진입한 경우 해당 영역으로 스크롤 (활성 탭 계산은 초기값에서 이미 처리됨)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const targetId = HASH_TO_TAB_ID[hash] ?? hash;
    if (tabs.findIndex((t) => t.id === targetId) === -1) return;

    requestAnimationFrame(() => {
      document
        .getElementById("reviews")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [tabs]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="sticky top-0 z-20 border-y border-gray-100 bg-white/95 backdrop-blur dark:border-[#3c4043] dark:bg-[#242528]/95">
        <div className="flex h-12 min-w-0 overflow-x-auto" role="tablist">
          {tabs.map((tab, index) => {
            const active = activeIndex === index;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative flex min-w-24 flex-1 shrink-0 items-center justify-center gap-1 px-3 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900",
                  active && "text-primary-700 dark:text-white",
                )}
                aria-selected={active}
                role="tab"
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-300">
                    {tab.badge}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-transparent transition-colors",
                    active && "bg-primary-600 dark:bg-white",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 pt-6" role="tabpanel">
        {panels[activeIndex]}
      </div>
    </div>
  );
}
