import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { getHeaderProfile } from "@/lib/auth";
import { fetchUpcoming } from "@/lib/event/upcoming";
import { fetchCategories } from "@/lib/api/categories";
import UpcomingTabs from "./UpcomingTabs";

export const metadata = { title: "오픈 예정 | TiKi" };
export const revalidate = 1800; // 30분마다 재생성 (오픈예정은 변경 빈도 더 높음)

export default async function OpenPage() {
  const [initialItems, profile, categories] = await Promise.all([
    fetchUpcoming({ limit: 20 }),
    getHeaderProfile(),
    fetchCategories(),
  ]);
  const loggedIn = !!profile;

  return (
    <>
      <Header loggedIn={loggedIn} profile={profile} />
      <main className="flex-1 bg-white pb-20 dark:bg-surface-0 min-[744px]:pb-0">
        <UpcomingTabs
          initialItems={initialItems}
          generatedAt={new Date().toISOString()}
          categories={categories}
        />
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
