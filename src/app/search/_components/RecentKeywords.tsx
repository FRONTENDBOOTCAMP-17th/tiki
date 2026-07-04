"use client";

import { Clock, X } from "lucide-react";

// 최근 검색어 섹션. 칩 본문을 누르면 그 키워드로 검색(onSelect),
// X를 누르면 개별 삭제(onRemove), 우측 "전체 삭제"는 onClear.
export default function RecentKeywords({
  keywords,
  onSelect,
  onRemove,
  onClear,
}: {
  keywords: string[];
  onSelect: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 px-4 py-4 lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-5 lg:shadow-sm lg:dark:border-surface-3 lg:dark:bg-surface-1">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
          <Clock className="h-5 w-5 text-primary-700 dark:text-gray-200" />
          최근 검색어
        </h2>
        {keywords.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-100"
          >
            전체 삭제
          </button>
        )}
      </div>

      {keywords.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          최근 검색어가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className="flex items-center gap-1 rounded-full border border-primary-200 bg-primary-100 py-1.5 pl-4 pr-2 text-sm text-primary-900 transition-colors hover:bg-primary-200 dark:border-surface-3 dark:bg-surface-2 dark:text-gray-100 dark:hover:bg-surface-4"
            >
              <button
                type="button"
                onClick={() => onSelect(keyword)}
                className="cursor-pointer whitespace-nowrap font-medium"
              >
                {keyword}
              </button>
              <button
                type="button"
                onClick={() => onRemove(keyword)}
                aria-label={`${keyword} 검색어 삭제`}
                className="cursor-pointer rounded-full p-0.5 text-primary-400 transition-colors hover:bg-primary-300 hover:text-primary-800 dark:text-gray-400 dark:hover:bg-surface-3 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
