import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface HomeSectionProps {
  title: string;
  moreHref?: string;
  className?: string;
  children: ReactNode;
}

// 홈 화면 섹션들(예매 랭킹/티켓 오픈/카테고리별)이 공통으로 쓰는 제목 + 본문 래퍼.
export default function HomeSection({
  title,
  moreHref,
  className,
  children,
}: HomeSectionProps) {
  return (
    <section className={cn("px-4 py-7 md:px-8 lg:px-16", className)}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex items-end justify-between gap-4">
          {moreHref ? (
            <Link
              href={moreHref}
              className="group inline-flex items-center gap-1 text-lg font-bold tracking-tight text-gray-950 transition-colors hover:text-primary-700 md:text-xl dark:text-gray-50 dark:hover:text-white"
            >
              {title}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <h2 className="text-lg font-bold tracking-tight text-gray-950 md:text-xl dark:text-gray-50">
              {title}
            </h2>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
