import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { fetchRanking } from "@/lib/event/ranking";
import { fetchCategories } from "@/lib/api/categories";
import RankingTabs from "./RankingTabs";

export const metadata = { title: "랭킹 | TiKi" };
export const revalidate = 3600; // 1시간마다 재생성 (랭킹은 실시간 불필요)

export default async function RankingPage() {
  const [initialItems, loggedIn, categories] = await Promise.all([
    fetchRanking({ limit: 10 }),
    isAuthenticated(),
    fetchCategories(),
  ]);

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <RankingTabs
          initialItems={initialItems}
          generatedAt={new Date().toISOString()}
          categories={categories}
        />
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
