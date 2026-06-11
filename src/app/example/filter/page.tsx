/**
 * Filter + useSort 사용 예시
 *
 * - 컴포넌트는 "버튼(Filter)"과 "로직(useSort)" 둘뿐.
 * - 정렬된 결과(sorted)를 보여주는 건 컴포넌트가 아니라 여기(page)에서 한다.
 *
 * useSort 훅을 직접 쓰므로 이 예시 페이지는 클라이언트 컴포넌트다.
 * (실제 서비스에선 이 부분을 작은 client 래퍼로 감싸 page를 서버로 둘 수 있음)
 */
"use client";

import Filter from "@/components/Search/Filter";
import { useSort, type SortItem } from "@/components/Search/filterSort";

// ============= 예시 데이터 =============
const ITEMS: SortItem[] = [
  { name: "바나나", date: "2026-01-15" },
  { name: "사과", date: "2026-03-02" },
  { name: "체리", date: "2026-02-20" },
];

export default function FilterExamplePage() {
  const { sortKey, direction, sorted, changeSort } = useSort(ITEMS);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* 1) 버튼: 정렬 상태와 핸들러만 넘긴다 */}
      <Filter sortKey={sortKey} direction={direction} onSort={changeSort} />

      {/* 2) 결과: 컴포넌트가 아니라 사용처에서 직접 그린다 */}
      <ul className="flex flex-col gap-1">
        {sorted.map((item) => (
          <li key={item.name}>
            {item.name} — {item.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
