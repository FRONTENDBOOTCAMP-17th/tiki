// "use client" 없음 → 서버 컴포넌트. 나중에 여기서 서버 데이터 패치 가능

import Filter from "@/components/Search/Filter"; // 정렬 버튼 (client)
import SortedList from "@/components/Search/SortedList"; // 결과 리스트 (client, UI는 나중에)
import { SortProvider } from "@/components/Search/SortContext"; // 정렬 상태 공급자 (client)
import type { SortItem } from "@/components/Search/filterSort"; // 타입만 (서버 번들에 안 들어감)

// 예시 데이터(정적). 실제로는 이 자리를 서버 fetch 결과로 교체하면 됨
const ITEMS: SortItem[] = [
  { name: "바나나", date: "2026-01-15" },
  { name: "사과", date: "2026-03-02" },
  { name: "체리", date: "2026-02-20" },
];

export default function FilterExamplePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <SortProvider items={ITEMS}>
        {" "}
        {/* items를 client 경계로 전달 → 정렬 상태 공급 */}
        <Filter /> {/* 버튼 구현 */}
        <SortedList /> {/* 결과 구현 -> 나중에 UI 변경해주면 됨*/}
      </SortProvider>
    </div>
  );
}
