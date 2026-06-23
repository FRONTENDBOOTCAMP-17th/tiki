import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { fetchRanking } from "@/lib/event/ranking";
import RankingTabs from "./RankingTabs";

export const metadata = { title: "랭킹 | TiKi" };

export default async function RankingPage() {
  const [initialItems, loggedIn] = await Promise.all([
    fetchRanking({ limit: 10 }),
    isAuthenticated(),
  ]);

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <RankingTabs initialItems={initialItems} />
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
