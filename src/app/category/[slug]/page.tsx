import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import HeroSlider from "@/app/_components/home/HeroSlider";
import { categories } from "../_categories";
import EventList, { CategoryEventItem } from "./EventList";

// 고정 카테고리라 slug 목록을 미리 정적 생성
export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

// TODO: 카테고리별 공연 API 연동 시 교체 (임시 예시 데이터)
function getMockEvents(slug: string, name: string): CategoryEventItem[] {
  const venues = [
    "서울대공원 주차장광장",
    "올림픽홀",
    "예술의전당",
    "KSPO DOME",
    "블루스퀘어",
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    eventId: `mock-${slug}-${i + 1}`,
    title: `${name} 페스티벌 2026 - ${i + 1}회차`,
    startDate: `2026-07-${String(17 + i).padStart(2, "0")}`,
    venueName: venues[i],
    thumbnail: `https://picsum.photos/seed/tiki-${slug}-${i}/600/800`,
    minPrice: 99000 + i * 11000,
    discountRate: i % 2 === 0 ? 20 : undefined,
  }));
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  // 배너와 리스트가 같은 데이터를 공유
  const events = getMockEvents(category.slug, category.name);

  return (
    <>
      <Header />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <h1 className="sr-only">{category.name}</h1>
        {/* 상단: 자동으로 넘어가는 배너 */}
        <HeroSlider slides={events} />
        {/* 하단: 같은 데이터를 리스트로 나열 */}
        <EventList events={events} />
      </main>
      <Navigation />
    </>
  );
}
