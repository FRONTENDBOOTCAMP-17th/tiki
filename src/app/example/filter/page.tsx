/**
 * Filter 컴포넌트 사용 예제 (정렬 필터 + 결과 정렬)
 *
 * 진행 방식
 * 1. 상태 끌어올리기(lifting state up)
 *    - 어떤 기준으로 정렬 중인지(sortKey)와 방향(directions)을 "페이지"가 들고 있다.
 *    - Filter 자신은 상태가 없고, 위 값을 props로 받아 표시만 한다(controlled).
 * 2. 방향은 필터별로 따로 기억 (directions = { date, name })
 *    - 하나의 direction을 공유하면 다른 버튼 화살표가 같이 움직여서 따로 저장한다.
 * 3. handleSort 규칙
 *    - 같은 필터 다시 클릭  → 그 필터의 방향만 asc↔desc 토글
 *    - 다른 필터 클릭       → 활성(sortKey)만 바꾸고 각자 방향은 유지
 * 4. 정렬은 현재 활성 필터(sortKey)의 방향(direction)으로 ITEMS를 정렬해 렌더링.
 *
 * 참고: 학습용이라 페이지 전체를 "use client"로 뒀다. 실제 페이지에선
 *       데이터 패칭은 서버 컴포넌트가 하고, 상태+Filter만 작은 client 컴포넌트로
 *       분리하는 게 Next.js 권장 구조다.
 */
"use client";

import { useState } from "react";
import Filter from "@/components/Search/Filter";

type SortKey = "date" | "name";
type Direction = "asc" | "desc";

const ITEMS = [
  { name: "바나나", date: "2026-01-15" },
  { name: "사과", date: "2026-03-02" },
  { name: "체리", date: "2026-02-20" },
];

export default function SearchPage() {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  // 방향을 필터별로 따로 기억 → 한쪽을 바꿔도 다른 쪽 화살표는 그대로
  const [directions, setDirections] = useState<Record<SortKey, Direction>>({
    date: "desc",
    name: "desc",
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // 같은 필터를 다시 누르면 그 필터의 방향만 토글
      setDirections((prev) => ({
        ...prev,
        [key]: prev[key] === "asc" ? "desc" : "asc",
      }));
    } else {
      // 다른 필터 선택 → 활성만 바뀌고 각자 방향은 유지
      setSortKey(key);
    }
  };

  const direction = directions[sortKey];
  const sorted = [...ITEMS].sort((a, b) => {
    const cmp = a[sortKey].localeCompare(b[sortKey]);
    return direction === "asc" ? cmp : -cmp;
  });

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex gap-2">
        <Filter
          label="날짜순"
          active={sortKey === "date"}
          direction={directions.date}
          onClick={() => handleSort("date")}
        />
        <Filter
          label="이름순"
          active={sortKey === "name"}
          direction={directions.name}
          onClick={() => handleSort("name")}
        />
      </div>

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
