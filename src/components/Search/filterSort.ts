/**
 * filterSort — 정렬 로직 + 정렬 옵션(날짜/이름)을 한곳에 묶은 파일
 *
 * - SORT_OPTIONS : 어떤 기준으로 정렬할지 + 비교 방법(compare)을 정의한 단일 소스.
 *                  기준을 늘리려면 여기에 한 줄(+ compare)만 추가하면 된다.
 *
 * - useSort      : 현재 정렬 상태(sortKey/direction)와 정렬된 결과(sorted),
 *                  클릭 처리(changeSort)를 캡슐화한 훅. UI는 이 값만 받아 그리면 됨.
 *                  (파일명은 filterSort지만 훅 함수는 "use" 접두사 필수라 useSort)
 */

import { useMemo, useState } from "react";

export type Direction = "asc" | "desc";

// 정렬 대상 데이터 형태
export type SortItem = {
  id?: string; // 이벤트 상세(/[eventId])로 이동할 식별자
  name: string;
  date: string; // ISO 문자열 ("2026-01-15")
  location?: string;
  image?: string;
};

// ── 날짜,이름순 정렬 ── key=식별자, label=버튼 글자, compare=정렬 함수
export const SORT_OPTIONS = [
  {
    key: "date",
    label: "날짜순",
    compare: (a: SortItem, b: SortItem) =>
      +new Date(a.date) - +new Date(b.date),
  },
  {
    key: "name",
    label: "이름순",
    compare: (a: SortItem, b: SortItem) => a.name.localeCompare(b.name),
  },
] as const;

// SORT_OPTIONS의 key에서 타입 자동 도출 → "date" | "name"
export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export function useSort(items: SortItem[]) {
  const [sortKey, setSortKey] = useState<SortKey>(SORT_OPTIONS[0].key);
  const [direction, setDirection] = useState<Direction>("desc");

  // 같은 버튼 클릭시 화살표 방향 전환
  const changeSort = (key: SortKey) =>
    key === sortKey
      ? setDirection((d) => (d === "asc" ? "desc" : "asc"))
      : setSortKey(key);

  // 받아온 items를 현재 기준/방향으로 정렬
  const sorted = useMemo(() => {
    const { compare } = SORT_OPTIONS.find((o) => o.key === sortKey)!;
    const asc = [...items].sort(compare);
    return direction === "asc" ? asc : asc.reverse();
  }, [items, sortKey, direction]);

  return { sortKey, direction, sorted, changeSort };
}
