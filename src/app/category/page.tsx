import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { Trophy, Clock, Building2, type LucideIcon } from "lucide-react";
import { categories } from "./_categories";

// 카테고리와 별개로 직접 노출하는 바로가기 메뉴
const quickLinks: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "랭킹", href: "/ranking", Icon: Trophy },
  { label: "오픈예정", href: "/open", Icon: Clock },
  { label: "공연장", href: "/venues", Icon: Building2 },
];

export default function CategoryPage() {
  return (
    <>
      <Header showCategory={false} />
      <main className="flex-1 bg-white pb-20 min-[744px]:pb-0">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <ul className="grid grid-cols-2 gap-x-2 gap-y-5">
            {categories.map(({ slug, name, Icon }) => (
              <li key={slug}>
                <Link
                  href={`/category/${slug}`}
                  className="flex items-center gap-3 py-1"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {quickLinks.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary-200 py-4 text-gray-700"
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Navigation />
    </>
  );
}
