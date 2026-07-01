import { Suspense } from "react";
import SearchClient from "./SearchClient";
import PopularSection from "./_components/PopularSection";
import { PopularSkeleton } from "./_components/PopularList";

export const metadata = { title: "검색 | TiKi" };

// 검색 UI(입력창·최근검색어)는 즉시 렌더하고, 인기공연 랭킹은 서버에서
// 스트리밍(Suspense) — 클라이언트 마운트 후 fetch하던 워터폴 제거.
export default function SearchPage() {
  return (
    <SearchClient
      popularSlot={
        <Suspense fallback={<PopularSkeleton />}>
          <PopularSection />
        </Suspense>
      }
    />
  );
}
