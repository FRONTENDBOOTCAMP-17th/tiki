export type LibraryCategory = "concert" | "exhibition" | "musical" | "class";

export interface LibraryEvent {
  date: number; // 해당 월의 일(day)
  category: LibraryCategory;
}

export const CATEGORY_META: Record<
  LibraryCategory,
  { label: string; gradient: string }
> = {
  concert: { label: "콘서트", gradient: "from-pink-300 to-purple-300" },
  exhibition: { label: "전시", gradient: "from-sky-300 to-indigo-300" },
  musical: { label: "뮤지컬", gradient: "from-pink-200 to-rose-300" },
  class: { label: "클래스", gradient: "from-violet-300 to-pink-300" },
};

// 1일 앞 빈칸(선행 요일) + 날짜 셀
export function getMonthCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}