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

export default function DetailTabs({ tabs, children }: DetailTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panels = Children.toArray(children);

  // URL 해시(#reviews 등)에 맞는 탭 자동 활성화 + 스크롤
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    // 해시 → 탭 매핑 (#reviews 는 구매평 탭)
    const hashToTabId: Record<string, string> = {
      reviews: "event-reviews",
    };
    const targetId = hashToTabId[hash] ?? hash;
    const index = tabs.findIndex((t) => t.id === targetId);
    if (index === -1) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- window.location.hash는 마운트 시 1회만 읽는 브라우저 API 동기화
    setActiveIndex(index);
    // 탭 전환 후 해당 영역으로 스크롤 (렌더 한 프레임 뒤)
    requestAnimationFrame(() => {
      document
        .getElementById("reviews")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    // 최초 진입 시 한 번만 확인하면 되는 동작이라 의도적으로 deps를 비워둔다.
    // tabs는 부모(서버 컴포넌트)가 매 렌더마다 새 배열 리터럴로 내려주므로,
    // 의존성에 넣으면 router.refresh() 등으로 부모가 리렌더될 때마다 이 effect가
    // 다시 돌면서 setActiveIndex를 반복 호출해 무한 업데이트로 이어질 수 있다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="sticky top-0 z-20 border-y border-gray-100 bg-white/95 backdrop-blur">
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
                  active && "text-primary-700",
                )}
                aria-selected={active}
                role="tab"
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs font-medium text-gray-400">
                    {tab.badge}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-transparent transition-colors",
                    active && "bg-primary-600",
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
