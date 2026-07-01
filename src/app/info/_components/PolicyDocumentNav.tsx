import Link from "next/link";
import { cn } from "@/lib/cn";

const DOCUMENTS = [
  { href: "/info/terms", label: "서비스 이용약관" },
  { href: "/info/privacy", label: "개인정보 처리방침" },
];

// 정책 문서 네비게이션(이용약관·개인정보 처리방침만 묶어 이동 가능하게 추가)
export default function PolicyDocumentNav({ activeHref }: { activeHref: string }) {
  return (
    <nav
      aria-label="정책 문서"
      className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#3c4043] dark:bg-[#303134]"
    >
      <p className="px-2 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        정책 문서
      </p>
      <div className="flex flex-col gap-1 sm:flex-row">
        {DOCUMENTS.map((item) => {
          const active = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-gray-950 shadow-sm dark:bg-[#242528] dark:text-gray-50"
                  : "text-gray-600 hover:bg-white hover:text-gray-950 dark:text-gray-400 dark:hover:bg-[#242528] dark:hover:text-gray-100",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
