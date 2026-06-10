/**
 * Filter — 정렬 기준 버튼 (예: 날짜순 / 이름순)
 *
 * label에 이름 넣기
 * active로 활성화 해주기
 * direction으로 화살표 방향과 오름차순,내림차순 설정하기
 *
 */

import { ChevronUp, ChevronDown } from "lucide-react";

// 부모가 넘겨줘야 하는 값들 — Filter는 받아서 "표시만" 한다 (상태 없음)
type FilterProps = {
  label: string; // 버튼에 보일 글자 (예: "날짜순")
  active: boolean; // 지금 선택된 필터인지 → true면 핑크로 강조
  direction: "asc" | "desc"; // 화살표 방향: "asc"=▲오름차순 / "desc"=▼내림차순
  onClick: () => void; // 클릭 시 부모에게 알릴 함수 (정렬 처리는 부모가 함)
};

export default function Filter({
  label,
  active, // 사용자가 클릭할 경우 active가 활성화 되고 강조됨
  direction,
  onClick,
}: FilterProps) {
  return (
    <button
      type="button" // 기본값(submit) 방지 — form 안에서도 제출 안 되게
      onClick={onClick} // 클릭 시 부모가 넘긴 함수 실행
      className={`flex w-fit items-center font-bold gap-2 cursor-pointer border rounded-4xl px-5 py-2 ${
        active
          ? "border-accent-500 bg-search-background-pink text-accent-800" // 선택됨
          : "border-gray-300 text-gray-600" // 안 선택됨
      }`}
    >
      <span>{label}</span> {/* 버튼 글자 */}
      {/* 방향(direction)에 따라 화살표 방향 교체 */}
      {direction === "asc" ? (
        <ChevronUp className="w-5 h-5" aria-label="오름차순" /> // 오름차순 정렬
      ) : (
        <ChevronDown className="w-5 h-5" aria-label="내림차순" /> // 내림차순 정렬
      )}
    </button>
  );
}
