"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface CategorySection {
  id: string;
  label: string;
}

// 섹션 칩 네비 — 클릭 시 해당 섹션으로 스크롤, 스크롤 위치에 따라 활성 칩 표시.
export default function CategorySectionNav({
  sections,
}: {
  sections: CategorySection[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      // 화면 상단~중앙에 걸친 섹션을 활성으로 본다.
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-[#3c4043] dark:bg-[#242528]/95">
      <div className="scrollbar-hide mx-auto flex max-w-7xl justify-center gap-6 overflow-x-auto px-4 md:px-8 lg:px-16">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              "relative shrink-0 cursor-pointer border-b-2 py-3.5 text-sm font-medium transition-colors",
              active === id
                ? "border-primary-600 text-primary-700 dark:border-gray-100 dark:text-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
