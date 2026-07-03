import Link from "next/link";
import type { CategoryRow } from "@/lib/api/categories";
import { getCategoryIcon } from "@/app/category/_categories";

export default function HomeSectionLink({
  categories,
}: {
  categories: CategoryRow[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="px-4 pb-8 md:px-8 lg:px-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug);

          return (
            <Link
              key={category.category_id}
              href={`/category/${category.slug}`}
              className="group flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:border-gray-500 dark:hover:bg-[#303134]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-white group-hover:text-primary-700 dark:bg-[#34363a] dark:text-gray-300 dark:group-hover:bg-[#2a2b2f] dark:group-hover:text-white">
                <Icon className="size-4" strokeWidth={1.5} />
              </span>
              <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                {category.category_name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
