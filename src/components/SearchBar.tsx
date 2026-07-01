"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export const SEARCH_PLACEHOLDER = "공연, 아티스트, 장소를 검색해보세요";

// 헤더/검색화면 공통 서치바 셸 (디자인 단일 소스)
const shell =
  "items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-primary-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:focus-within:bg-[#303134] dark:focus-within:ring-[#3c4043]";

// 트리거: 클릭하면 검색화면(/search)으로 이동 (헤더용)
export function SearchBarLink({
  href = "/search",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 text-gray-400 hover:border-gray-300 hover:bg-white",
        "dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-[#303134]",
        shell,
        className,
      )}
    >
      <Search className="h-5 w-5 shrink-0" />
      <span className="truncate text-base">{SEARCH_PLACEHOLDER}</span>
    </Link>
  );
}

// 입력: 실제 검색 입력 (검색화면용)
export function SearchBarInput({
  value,
  onChange,
  onClear,
  onSubmit,
  autoFocus,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1", shell, className)}>
      <Search className="h-5 w-5 shrink-0 text-gray-400" />
      <input
        type="text"
        placeholder={SEARCH_PLACEHOLDER}
        className="flex-1 border-none bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50 dark:placeholder:text-gray-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        autoFocus={autoFocus}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="검색어 지우기"
          className="shrink-0 cursor-pointer rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-[#3c4043] dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
