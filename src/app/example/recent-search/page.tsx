/**
 * RecentSearch에서 UI를 구현
 * RecentSearchList에서 import해 삭제 기능까지 묶음
 * 이 파일은 예시로 Props에 배열을 주면 됨
 */
import RecentSearchList from "@/components/Search/RecentSearchList";

const INITIAL_KEYWORDS = ["노트북", "기계식 키보드", "무선 마우스", "모니터암"];

export default function RecentSearchExamplePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="font-bold">최근 검색어</h2>
      {/* 배열로 전달 */}
      <RecentSearchList initialKeywords={INITIAL_KEYWORDS} />
    </div>
  );
}
