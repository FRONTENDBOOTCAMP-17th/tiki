import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import HeroSlider from "@/app/_components/home/HeroSlider";
import { isAuthenticated } from "@/lib/auth";
import { categories } from "../_categories";
import EventList, { CategoryEventItem } from "./EventList";

// 고정 카테고리라 slug 목록을 미리 정적 생성
export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

// 공연/전시 테마의 예시 포스터 이미지 풀 (Unsplash)
const EXAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=800&fit=crop",
];

// TODO: 카테고리별 공연 API 연동 시 교체 (임시 예시 데이터)
function getMockEvents(slug: string, name: string): CategoryEventItem[] {
  const venues = [
    "서울대공원 주차장광장",
    "올림픽홀",
    "예술의전당",
    "KSPO DOME",
    "블루스퀘어",
  ];

  // 카테고리마다 시작 이미지를 다르게 해서 서로 다른 포스터가 노출되도록
  const offset = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  return Array.from({ length: 5 }, (_, i) => ({
    eventId: `mock-${slug}-${i + 1}`,
    title: `${name} 페스티벌 2026 - ${i + 1}회차`,
    startDate: `2026-07-${String(17 + i).padStart(2, "0")}`,
    venueName: venues[i],
    thumbnail: EXAMPLE_IMAGES[(offset + i) % EXAMPLE_IMAGES.length],
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

  const loggedIn = await isAuthenticated();

  // 배너와 리스트가 같은 데이터를 공유
  const events = getMockEvents(category.slug, category.name);

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <h1 className="sr-only">{category.name}</h1>
        {/* 상단: 자동으로 넘어가는 배너 */}
        <HeroSlider slides={events} />
        {/* 하단: 같은 데이터를 리스트로 나열 */}
        <EventList events={events} />
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
