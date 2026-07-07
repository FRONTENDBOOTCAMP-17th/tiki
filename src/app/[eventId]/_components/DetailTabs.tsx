"use client";

import {
  Children,
  ReactNode,
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setActiveIndex(next);
    requestAnimationFrame(() => {
      document.getElementById(`detail-tab-${tabs[next].id}`)?.focus();
    });
  }

  function handleTabKeyDown(
    e: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(tabs.length - 1);
        break;
    }
  }

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
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-surface-3 dark:bg-transparent min-[744px]:dark:bg-surface-0/95">
        <div className="flex h-12 min-w-0 overflow-x-auto" role="tablist">
          {tabs.map((tab, index) => {
            const active = activeIndex === index;

            return (
              <button
                key={tab.id}
                id={`detail-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={cn(
                  "relative flex min-w-24 flex-1 shrink-0 items-center justify-center gap-1 px-3 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                  active && "text-primary-700 dark:text-gray-50",
                )}
                aria-selected={active}
                aria-controls={`detail-panel-${tab.id}`}
                role="tab"
                tabIndex={active ? 0 : -1}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-300">
                    {tab.badge}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-transparent transition-colors",
                    active && "bg-primary-600 dark:bg-white",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`detail-panel-${tabs[activeIndex]?.id ?? "content"}`}
        className="min-w-0 pt-6"
        role="tabpanel"
        aria-labelledby={`detail-tab-${tabs[activeIndex]?.id ?? "content"}`}
      >
        {panels[activeIndex]}
      </div>
    </div>
  );
}
