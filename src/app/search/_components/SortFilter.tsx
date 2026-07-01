"use client"; // onClick 핸들러가 있으므로 클라이언트 컴포넌트

import { ChevronDown, ChevronUp } from "lucide-react";
import {
  SORT_OPTIONS,
  type Direction,
  type SortKey,
} from "@/components/Search/filterSort"; // 정렬 옵션·타입은 기존 단일 소스를 재사용
import { cn } from "@/lib/cn";

// 검색결과 정렬 칩(날짜순/이름순).
// 선택된 칩만 방향 화살표를 강조하고, 같은 칩을 다시 누르면 부모가 방향을 토글한다.
export default function SortFilter({
  sortKey,
  direction,
  onChange,
}: {
  sortKey: SortKey;
  direction: Direction;
  onChange: (key: SortKey) => void;
}) {
  return (
    <div className="flex gap-2">
      {SORT_OPTIONS.map(({ key, label }) => {
        const active = sortKey === key;
        const isAsc = active && direction === "asc";
        const Chevron = isAsc ? ChevronUp : ChevronDown;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary-500 bg-primary-100 text-primary-800 dark:border-gray-500 dark:bg-[#303134] dark:text-gray-100"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-400 dark:hover:border-gray-500",
            )}
          >
            <span>{label}</span>
            <Chevron
              className={cn(
                "h-4 w-4",
                active ? "text-primary-700 dark:text-gray-100" : "opacity-30",
              )}
              aria-label={isAsc ? "오름차순" : "내림차순"}
            />
          </button>
        );
      })}
    </div>
  );
}
