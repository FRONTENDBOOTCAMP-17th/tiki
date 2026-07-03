import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "이용 안내",
    template: "%s | 이용 안내 | TiKi",
  },
};

// 안내 페이지 공통 레이아웃(사이드바 제거 후 독립 문서 형태로 수정)
export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ChevronLeft className="size-4" />
        홈으로
      </Link>

      {children}
    </main>
  );
}
