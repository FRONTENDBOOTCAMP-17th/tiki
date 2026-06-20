import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
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

  return (
    <>
      <Header />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <h1 className="text-lg font-bold text-gray-800">{category.name}</h1>
          {/* TODO: 카테고리별 공연 목록 */}
        </div>
      </main>
      <Navigation />
    </>
  );
}
