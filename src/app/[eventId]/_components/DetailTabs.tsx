"use client";

import { Children, ReactNode, useState } from "react";
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
