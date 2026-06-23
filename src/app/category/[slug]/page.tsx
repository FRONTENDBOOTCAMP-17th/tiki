import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PosterSlider from "./PosterSlider";
import EventList from "./EventList";
import { isAuthenticated } from "@/lib/auth";
import { fetchCategoryEvents } from "@/lib/api/categories";
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

  // 해당 카테고리의 공개 공연을 DB에서 조회 (슬라이더/리스트가 공유)
  const [events, loggedIn] = await Promise.all([
    fetchCategoryEvents(category.slug),
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
            {/* 상단: "{카테고리} 공개순" + 세로 포스터 무한 슬라이드 */}
            <PosterSlider items={events} title={`${category.name} 공개순`} />
            {/* 하단: 같은 데이터를 "인기순" 리스트로 나열 */}
            <EventList events={events} />
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
