/**
 * RecentSearch를 import하여 삭제기능을 추가한 RecentSearchList 컴포넌트
 */

"use client";

import { useState } from "react";
import RecentSearch from "@/components/Search/RecentSearch";

type RecentSearchListProps = {
  initialKeywords?: string[];
};

export default function RecentSearchList({
  initialKeywords = [],
}: RecentSearchListProps) {
  {
    /* list(배열)를 Props로 전달 받으면 자동으로 세팅 됨.  */
  }
  const [keywords, setKeywords] = useState(initialKeywords);

  {
    /* 최근 검색어 삭제 해주는 메소드 */
  }
  const handleRemove = (target: string) => {
    setKeywords((prev) => prev.filter((keyword) => keyword !== target));
  };

  {
    /* 검색어가 없는 경우 */
  }
  if (keywords.length === 0) {
    return <p className="text-gray-500">최근 검색어가 없습니다.</p>;
  }

  {
    /* 검색어가 있는 경우 */
  }
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <RecentSearch
          key={keyword}
          keyword={keyword}
          onRemove={() => handleRemove(keyword)}
        />
      ))}
    </div>
  );
}
