import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { Trophy, Clock, type LucideIcon } from "lucide-react";
import { fetchCategories } from "@/lib/api/categories";
import { isAuthenticated } from "@/lib/auth";
import { getCategoryIcon } from "./_categories";

// 카테고리와 별개로 직접 노출하는 바로가기 메뉴
const quickLinks: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "랭킹", href: "/ranking", Icon: Trophy },
  { label: "오픈 예정", href: "/open", Icon: Clock },
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
        <div className="mx-auto w-full max-w-3xl px-6 py-6 min-[744px]:max-w-5xl lg:max-w-6xl">
          {/* 카테고리: 모바일 2열(5행) → 태블릿/데스크탑 5열(2행) 세로 카드형 */}
          <ul className="grid grid-cols-2 gap-x-2 gap-y-5 min-[744px]:grid-cols-5 min-[744px]:gap-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.slug);

              return (
                <li key={category.category_id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-center gap-3 py-1 transition-colors min-[744px]:flex-col min-[744px]:justify-center min-[744px]:gap-3 min-[744px]:rounded-2xl min-[744px]:border min-[744px]:border-primary-300 min-[744px]:py-7 min-[744px]:text-center min-[744px]:hover:bg-primary-50 lg:gap-4 lg:py-10"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 min-[744px]:size-auto min-[744px]:rounded-none min-[744px]:bg-transparent">
                      <Icon
                        className="size-6 min-[744px]:size-9 lg:size-10"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-sm font-medium text-gray-800 min-[744px]:text-base lg:text-lg">
                      {category.category_name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 바로가기: 모바일 2열 → 태블릿/데스크탑 중앙 정렬 행 */}
          <div className="mt-8 grid grid-cols-2 gap-3 min-[744px]:flex min-[744px]:justify-center">
            {quickLinks.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary-200 py-4 text-primary-900 transition-colors hover:bg-primary-300 min-[744px]:px-8"
              >
                <Icon
                  className="size-5 text-primary-700"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Navigation loggedIn={loggedIn} />
    </>
  );
}
