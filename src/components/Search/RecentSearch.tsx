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
    <div className="flex w-fit items-center font-bold gap-1.5 lg:gap-2 border border-gray-300 bg-gray-200 rounded-4xl px-4 py-1.5 text-sm lg:px-5 lg:py-2 lg:text-base text-gray-700">
      <span className="whitespace-nowrap">{keyword}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${keyword} 검색어 삭제`}
        className="cursor-pointer"
      >
        <X className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>
    </div>
  );
}
