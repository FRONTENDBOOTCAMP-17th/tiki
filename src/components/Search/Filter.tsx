"use client"; // onClick 핸들러가 있으므로 클라이언트 컴포넌트

import { ChevronUp, ChevronDown } from "lucide-react"; // 방향 표시 아이콘
import {
  SORT_OPTIONS,
  type Direction,
  type SortKey,
} from "@/components/Search/filterSort"; // 정렬 옵션(단일 소스)

// ── 정렬 버튼 1개  ──
function FilterButton({
  label, // 버튼 글자
  active, // 현재 선택된 기준인지
  direction, // 화살표 방향
  onClick, // 클릭 핸들러
}: {
  label: string;
  active: boolean;
  direction: Direction;
  onClick: () => void;
}) {
  const isAsc = direction === "asc"; // 오름차순 여부
  const Chevron = isAsc ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onClick} // 받은 핸들러 그대로 연결
      className={`flex w-fit cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent-500 bg-search-background-pink text-accent-800 dark:border-gray-500 dark:bg-[#303134] dark:text-gray-100"
          : "border-gray-200 bg-white text-gray-500 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-400 dark:hover:bg-[#303134]"
      }`}
    >
      <span>{label}</span>
      <Chevron
        className={`h-5 w-5 ${active ? "" : "opacity-30"}`}
        aria-label={isAsc ? "오름차순" : "내림차순"}
      />
    </button>
  );
}

// ── 정렬 버튼 묶음 ──
// sortKey/direction/onChange만 넘기면 재사용된다.
export default function Filter({
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
      {SORT_OPTIONS.map(
        (
          { key, label }, // 옵션 배열을 map으로 렌더 (반복 제거)
        ) => (
          <FilterButton
            key={key}
            label={label}
            active={sortKey === key} // 현재 기준이면 활성
            direction={sortKey === key ? direction : "desc"}
            onClick={() => onChange(key)} // 부모가 넘긴 핸들러 연결
          />
        ),
      )}
    </div>
  );
}
