/**
 *
 * recentSearchList에서 UI를 구현한 다음 RecentSearchList에서  import하여 최근 검색어 삭제 관련 기능까지 한번에 사용할 수 있도록 함
 * 그러니 실제로 사용할 때는 RecentSearch 대신 RecentSearchList를 import하여 사용해야 함
 *
 */
import { X } from "lucide-react";

type RecentSearchProps = {
  keyword: string;
  onRemove: () => void;
};

export default function RecentSearch({ keyword, onRemove }: RecentSearchProps) {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-4xl border border-gray-300 bg-gray-200 px-4 py-1.5 text-sm font-bold text-gray-700 lg:gap-2 lg:px-5 lg:py-2 lg:text-base dark:border-surface-3 dark:bg-surface-2 dark:text-gray-100">
      <span className="whitespace-nowrap">{keyword}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${keyword} 검색어 삭제`}
        className="cursor-pointer text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
      >
        <X className="h-4 w-4 lg:h-5 lg:w-5" />
      </button>
    </div>
  );
}
