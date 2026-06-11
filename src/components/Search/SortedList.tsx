"use client"; // sorted(클라이언트 정렬 상태)를 읽으므로 클라이언트 컴포넌트

import { useSortContext } from "@/components/Search/SortContext";

// ── 결과 나열하기 ──
// 지금은 sorted만 연결함. 스타일은 나중에 이 안만 채우면 됨.
export default function SortedList() {
  const { sorted } = useSortContext(); // 정렬된 결과뿐

  return (
    <ul className="flex flex-col gap-1">
      {sorted.map(
        (
          item, // 정렬 순서대로 렌더
        ) => (
          <li key={item.name}>
            {item.name} — {item.date}
          </li>
        ),
      )}
    </ul>
  );
}
