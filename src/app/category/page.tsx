import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { Trophy, Clock, type LucideIcon } from "lucide-react";
import HomeSection from "@/app/_components/home/HomeSection";
import { cn } from "@/lib/cn";
import { fetchCategories } from "@/lib/api/categories";
import { isAuthenticated } from "@/lib/auth";
import { getCategoryIcon, getCategoryColor } from "./_categories";
import BackButton from "./_components/BackButton";

// 카테고리와 별개로 직접 노출하는 바로가기 메뉴
const quickLinks: {
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}[] = [
  {
    label: "랭킹",
    description: "지금 가장 인기 있는 공연",
    href: "/ranking",
    Icon: Trophy,
  },
  {
    label: "오픈 예정",
    description: "곧 예매가 열리는 공연",
    href: "/open",
    Icon: Clock,
  },
];

export default async function CategoryPage() {
  // DB에서 활성 카테고리를 display_order 순으로 불러온다.
  const [categories, loggedIn] = await Promise.all([
    fetchCategories(),
    isAuthenticated(),
  ]);

  return (
    <>
      <Header loggedIn={loggedIn} showCategory={false} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="px-4 pt-4 md:px-8 lg:px-16">
            <BackButton />
          </div>

          <header className="px-4 pt-2 pb-2 text-center md:px-8 lg:px-16">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
              카테고리
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              관심 있는 장르를 골라보세요
            </p>
          </header>

          <section className="px-4 py-6 md:px-8 lg:px-16">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug);

                return (
                  <li key={category.category_id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-8 transition-colors hover:border-primary-300 hover:bg-primary-50"
                    >
                      <span
                        className={cn(
                          "flex size-14 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                          getCategoryColor(category.slug),
                        )}
                      >
                        <Icon
                          className="size-7"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm font-medium text-gray-800 lg:text-base">
                        {category.category_name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <HomeSection title="바로가기">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickLinks.map(({ label, description, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Icon
                      className="size-6"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{label}</span>
                    <span className="text-sm text-gray-500">{description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </HomeSection>
        </div>
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
