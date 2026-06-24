import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PosterSlider from "./PosterSlider";
import RankingList from "@/components/RankingList";
import { isAuthenticated } from "@/lib/auth";
import { fetchCategoryEvents } from "@/lib/api/categories";
import { fetchRanking } from "@/lib/event/ranking";
import { categories } from "../_categories";

// 고정 카테고리라 slug 목록을 미리 정적 생성
export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  // 슬라이더용 공개순 목록 + 인기 랭킹을 병렬 조회
  const [events, ranking, loggedIn] = await Promise.all([
    fetchCategoryEvents(category.slug),
    fetchRanking({ slug: category.slug, limit: 10 }),
    isAuthenticated(),
  ]);

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <h1 className="sr-only">{category.name}</h1>

        {events.length === 0 ? (
          <p className="px-6 py-24 text-center text-sm text-gray-400">
            아직 등록된 공연이 없어요.
          </p>
        ) : (
          <>
            {/* 상단: "{카테고리} 공개순" 세로 포스터 무한 슬라이드 */}
            <PosterSlider items={events} title={`${category.name} 공개순`} />
            {/* 하단: 최근 30일 예매 수량 기준 인기 랭킹 */}
            <div className="px-4 py-6 md:px-8 lg:px-16">
              <RankingList
                items={ranking}
                title={`${category.name} 인기 랭킹`}
                columns={2}
              />
            </div>
          </>
        )}
      </main>
      <div className="hidden lg:contents">
        <Footer />
      </div>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
