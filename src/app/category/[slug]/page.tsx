import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HomeSection from "@/app/_components/home/HomeSection";
import HorizontalCardSection from "@/app/_components/home/HorizontalCardSection";
import type { HomeEventCardItem } from "@/app/_components/home/types";
import CategoryEventGrid from "./CategoryEventGrid";
import CategorySectionNav, {
  type CategorySection,
} from "../_components/CategorySectionNav";
import PosterSlider, { type PosterSlideItem } from "./PosterSlider";
import { getHeaderProfile } from "@/lib/auth";
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

  // 전체 공개 목록 + 최근 30일 예매 수량 기준 인기 랭킹을 병렬 조회
  const [events, ranking, profile] = await Promise.all([
    fetchCategoryEvents(category.slug),
    fetchRanking({ slug: category.slug, limit: 10 }),
    getHeaderProfile(),
  ]);
  const loggedIn = !!profile;

  const rankingCards: HomeEventCardItem[] = ranking.map((item) => ({
    eventId: item.eventId,
    title: item.title,
    startDate: item.startDate,
    endDate: item.endDate,
    thumbnail: item.thumbnail ?? "",
    venueName: item.venueName,
    minPrice: item.minPrice,
  }));

  const eventCards: HomeEventCardItem[] = events.map((event) => ({
    eventId: event.eventId,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    thumbnail: event.thumbnail,
    venueName: event.venueName,
    minPrice: event.minPrice,
  }));

  // 상단 슬라이더 — 썸네일 있는 공연
  const sliderItems: PosterSlideItem[] = eventCards
    .filter((event) => event.thumbnail)
    .slice(0, 12)
    .map((event) => ({
      eventId: event.eventId,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      venueName: event.venueName ?? "",
      thumbnail: event.thumbnail,
    }));

  // 랭킹은 실제 예매 순위 + 부족분을 나머지 공연으로 채운다. 신규는 임시 데이터.
  const rankedIds = new Set(rankingCards.map((e) => e.eventId));
  const rankingFilled = [
    ...rankingCards,
    ...eventCards.filter((e) => !rankedIds.has(e.eventId)),
  ].slice(0, 10);
  const newlyOpened = eventCards.slice(0, 10);

  const navSections: CategorySection[] = [
    rankingFilled.length > 0 && { id: "ranking", label: "랭킹" },
    newlyOpened.length > 0 && { id: "new", label: "신규 오픈" },
    eventCards.length > 0 && { id: "all", label: "전체" },
  ].filter(Boolean) as CategorySection[];

  return (
    <>
      <Header loggedIn={loggedIn} profile={profile} />
      <main className="flex-1 bg-white pb-20 dark:bg-surface-0 min-[744px]:pb-0">
        <PosterSlider items={sliderItems} />

        <div className="mx-auto w-full max-w-7xl px-4 pt-2 md:px-8 lg:px-16">
          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-950 dark:text-gray-50">
            {category.name}
          </h1>
        </div>

        {events.length === 0 ? (
          <p className="px-6 py-24 text-center text-sm text-gray-400">
            아직 등록된 공연이 없어요.
          </p>
        ) : (
          <>
            <CategorySectionNav sections={navSections} />

            <div className="mx-auto w-full max-w-7xl">
              {rankingFilled.length > 0 && (
                <div id="ranking" className="scroll-mt-16">
                  <HorizontalCardSection
                    title="인기 랭킹"
                    events={rankingFilled}
                    showRank
                    className="bg-white dark:bg-surface-0"
                  />
                </div>
              )}

              {newlyOpened.length > 0 && (
                <div id="new" className="scroll-mt-16">
                  <HorizontalCardSection
                    title="신규 오픈"
                    events={newlyOpened}
                    className="bg-white dark:bg-surface-0"
                  />
                </div>
              )}

              <div id="all" className="scroll-mt-16">
                <HomeSection title="전체 공연">
                  <CategoryEventGrid events={eventCards} />
                </HomeSection>
              </div>
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
