"use client"; // useSortContext 훅을 쓰므로 클라이언트 컴포넌트

import { ChevronUp, ChevronDown } from "lucide-react"; // 방향 표시 아이콘
import { SORT_OPTIONS, type Direction } from "@/components/Search/filterSort"; // 정렬 옵션(단일 소스)
import { useSortContext } from "@/components/Search/SortContext"; // 정렬 상태를 context에서 가져옴

// ── 정렬 버튼 1개 (프리젠테이셔널 — 상태 없음) ──
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
  const Chevron = isAsc ? ChevronUp : ChevronDown; // 방향에 맞는 아이콘 선택

  return (
    <button
      type="button"
      onClick={onClick} // 받은 핸들러 그대로 연결
      className={`flex w-fit items-center font-medium gap-1.5 cursor-pointer border rounded-full px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent-500 bg-search-background-pink text-accent-800"
          : "border-gray-200 text-gray-500 bg-white"
      }`}
    >
      <span>{label}</span>
      <Chevron
        className={`w-5 h-5 ${active ? "" : "opacity-30"}`} // 비활성은 흐리게
        aria-label={isAsc ? "오름차순" : "내림차순"}
      />
    </button>
  );
}

// ── 정렬 버튼 묶음 ── props 없이 context만 소비한다
export default function Filter() {
  const { sortKey, direction, changeSort } = useSortContext(); // context에서 꺼냄

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
            direction={sortKey === key ? direction : "desc"} // 비활성은 기본(아래)
            onClick={() => changeSort(key)} // 핸들러를 컴포넌트 내부에서 연결
          />
        ),
      )}
    </div>
  );
}
