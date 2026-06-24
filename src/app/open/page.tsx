import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { fetchUpcoming } from "@/lib/event/upcoming";
import UpcomingTabs from "./UpcomingTabs";

export const metadata = { title: "오픈 예정 | TiKi" };
export const revalidate = 1800; // 30분마다 재생성 (오픈예정은 변경 빈도 더 높음)

export default async function OpenPage() {
  const [initialItems, loggedIn] = await Promise.all([
    fetchUpcoming({ limit: 20 }),
    isAuthenticated(),
  ]);

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <UpcomingTabs initialItems={initialItems} generatedAt={new Date().toISOString()} />
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
