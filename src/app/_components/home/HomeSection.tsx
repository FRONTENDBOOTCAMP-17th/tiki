import Link from "next/link";
import type { ReactNode } from "react";

interface HomeSectionProps {
  title: string;
  moreHref?: string;
  children: ReactNode;
}

// 홈 화면 섹션들(예매 랭킹/티켓 오픈/카테고리별)이 공통으로 쓰는 제목 + 본문 래퍼.
export default function HomeSection({ title, moreHref, children }: HomeSectionProps) {
  return (
    <section className="px-4 py-6 md:px-8 lg:px-16">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="text-sm text-gray-400 transition-colors hover:text-primary-700"
          >
            더보기
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
