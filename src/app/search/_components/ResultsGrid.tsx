import type { SortItem } from "@/components/Search/filterSort";
import ResultCard from "./ResultCard";

// 검색결과/스켈레톤이 공유하는 반응형 그리드 (모바일 2열 → 태블릿 3열 → 데스크탑 4열)
const GRID =
  "grid grid-cols-2 gap-x-3 gap-y-5 min-[744px]:grid-cols-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-6";

// 검색결과 카드 그리드
export function ResultsGrid({ items }: { items: SortItem[] }) {
  return (
    <ul className={GRID}>
      {items.map((item, i) => (
        <ResultCard key={`${item.id ?? item.name}-${i}`} item={item} />
      ))}
    </ul>
  );
}

// 첫 검색 로딩 중 표시할 스켈레톤 카드 그리드
export function ResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={GRID} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="aspect-3/4 w-full rounded-2xl bg-gray-100" />
          <div className="mt-2.5 h-3.5 w-3/4 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
        </li>
      ))}
    </ul>
  );
}
