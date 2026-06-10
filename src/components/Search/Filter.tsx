/**
 * Filter — 정렬 기준 버튼 (예: 날짜순 / 이름순)
 *
 * 상태를 스스로 갖지 않는 controlled 컴포넌트다.
 * "어떤 필터가 선택됐나 / 방향이 뭔가"는 부모가 관리하고,
 * 이 컴포넌트는 props로 받아 표시만 하고 클릭은 onClick으로 알린다.
 *
 * Props
 * - label:     버튼에 표시할 텍스트
 * - active:    이 버튼이 현재 선택됐는지 (true면 핑크 강조)
 * - direction: 화살표 방향. "asc"=위(▲) / "desc"=아래(▼)
 * - onClick:   클릭 시 부모에게 알리는 핸들러
 *
 * 사용 예
 *   <Filter
 *     label="날짜순"
 *     active={sortKey === "date"}
 *     direction={directions.date}
 *     onClick={() => handleSort("date")}
 *   />
 *
 * 주의
 * - onClick(함수 prop)을 받으므로 클라이언트 경계("use client") 안에서만 쓸 수 있다.
 *   부모가 client면 이 파일엔 "use client"를 따로 붙일 필요 없다.
 * - 방향은 필터마다 따로 넘겨라. 하나를 공유하면 다른 버튼 화살표가 같이 움직인다.
 */
import { ChevronUp, ChevronDown } from "lucide-react";

type FilterProps = {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

export default function Filter({
  label,
  active,
  direction,
  onClick,
}: FilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-fit items-center font-bold gap-2 cursor-pointer border rounded-4xl px-5 py-2 ${
        active
          ? "border-accent-500 bg-search-background-pink text-accent-800"
          : "border-gray-300 text-gray-600"
      }`}
    >
      <span>{label}</span>
      {direction === "asc" ? (
        <ChevronUp className="w-5 h-5" aria-label="오름차순" />
      ) : (
        <ChevronDown className="w-5 h-5" aria-label="내림차순" />
      )}
    </button>
  );
}
