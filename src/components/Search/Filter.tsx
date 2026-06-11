/**
 * Filter — 정렬 버튼들(칩) 컴포넌트
 *
 * 결과 목록은 그리지 않고 정렬 상태(sortKey/direction)와 클릭 핸들러(onSort)를
 * 받아 SORT_OPTIONS를 map으로 렌더링 상태/정렬 로직은 useSort에 있다.
 *
 * 사용 예 (page.tsx):
 *   const { sortKey, direction, sorted, changeSort } = useSort(items);
 *   <Filter sortKey={sortKey} direction={direction} onSort={changeSort} />
 *   // 결과(sorted)는 페이지에서 직접 그린다
 */

import { ChevronUp, ChevronDown } from "lucide-react";
import {
  SORT_OPTIONS,
  type Direction,
  type SortKey,
} from "@/components/Search/filterSort";

// ── 정렬 버튼  ──
function FilterButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: Direction;
  onClick: () => void;
}) {
  const isAsc = direction === "asc";
  const Chevron = isAsc ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onClick} //
      className={`flex w-fit items-center font-bold gap-2 cursor-pointer border rounded-4xl px-5 py-2 ${
        active
          ? "border-accent-500 bg-search-background-pink text-accent-800" // 선택됨
          : "border-gray-300 text-gray-600" // 안 선택됨
      }`}
    >
      <span>{label}</span>
      <Chevron
        className={`w-5 h-5 ${active ? "" : "opacity-30"}`}
        aria-label={isAsc ? "오름차순" : "내림차순"}
      />
    </button>
  );
}

type FilterProps = {
  sortKey: SortKey;
  direction: Direction;
  onSort: (key: SortKey) => void;
};

export default function Filter({ sortKey, direction, onSort }: FilterProps) {
  return (
    <div className="flex gap-2">
      {SORT_OPTIONS.map(({ key, label }) => (
        <FilterButton
          key={key}
          label={label}
          active={sortKey === key}
          direction={sortKey === key ? direction : "desc"} // 비활성은 기본(아래)
          onClick={() => onSort(key)}
        />
      ))}
    </div>
  );
}
