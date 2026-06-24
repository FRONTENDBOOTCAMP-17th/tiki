"use client"; // context→props 브리지에서 훅을 쓰므로 클라이언트

import Filter from "@/components/Search/Filter"; // 정렬 버튼 (제어 컴포넌트)
import SortedList from "@/components/Search/SortedList"; // 결과 리스트 (제어 컴포넌트)
import { SortProvider, useSortContext } from "@/components/Search/SortContext"; // 클라 정렬 상태 공급자
import type { SortItem } from "@/components/Search/filterSort";

// 예시 데이터
const ITEMS: SortItem[] = [
  { name: "바나나", date: "2026-01-15" },
  { name: "사과", date: "2026-03-02" },
  { name: "체리", date: "2026-02-20" },
];

// context의 정렬 상태를 props로 변환해 제어 컴포넌트에 넘기는 브리지
function FilterDemo() {
  const { sortKey, direction, sorted, changeSort } = useSortContext();
  return (
    <>
      <Filter sortKey={sortKey} direction={direction} onChange={changeSort} />
      <SortedList items={sorted} />
    </>
  );
}

export default function FilterExamplePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <SortProvider items={ITEMS}>
        <FilterDemo />
      </SortProvider>
    </div>
  );
}
