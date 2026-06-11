"use client"; // 이 파일의 Provider/훅은 클라이언트에서 동작한다

import { createContext, useContext, type ReactNode } from "react"; // context 도구
import {
  useSort, // 정렬 상태/결과 로직 (재사용)
  type SortItem, // 정렬 대상 데이터 형태
  type SortKey, // "date" | "name"
  type Direction, // "asc" | "desc"
} from "@/components/Search/filterSort";

type SortContextValue = {
  sortKey: SortKey; // 날짜순인지 이름순인지
  direction: Direction; // 현재 방향
  sorted: SortItem[]; // 정렬
  changeSort: (key: SortKey) => void; // 버튼 클릭 시 호출
};

const SortContext = createContext<SortContextValue | null>(null);

// items를 받아 useSort를 호출하고, 그 값을 자식 전체에 공급하는 Provider
export function SortProvider({
  items, // 서버에서 받은 데이터
  children, // Filter, SortedList 등
}: {
  items: SortItem[];
  children: ReactNode;
}) {
  const value = useSort(items); // items로 정렬 상태 생성 (클라이언트)
  return <SortContext.Provider value={value}>{children}</SortContext.Provider>; // 자식에게 공급
}

export function useSortContext() {
  const ctx = useContext(SortContext);
  if (!ctx)
    throw new Error("useSortContext는 <SortProvider> 안에서만 쓸 수 있습니다"); // 가드
  return ctx; // { sortKey, direction, sorted, changeSort }
}
