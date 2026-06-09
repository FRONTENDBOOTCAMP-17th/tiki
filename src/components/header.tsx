"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import Button from "@/components/Button";
import { categoryItem } from "./Header.styles";
import Logo from "@/components/logo";

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6Z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

const categories = [
  { label: "전체", href: "/category" },
  { label: "콘서트", href: "/category/concert" },
  { label: "팬미팅", href: "/category/fanmeeting" },
  { label: "뮤지컬/연극", href: "/category/musical" },
  { label: "전시", href: "/category/exhibition" },
  { label: "클래스", href: "/category/class" },
  { label: "스포츠", href: "/category/sports" },
  { label: "축제/행사", href: "/category/festival" },
];

interface HeaderProps extends ComponentPropsWithRef<"header"> {
  loggedIn?: boolean;
  showCategory?: boolean;
  current?: string;
}

export default function Header({
  loggedIn = false,
  showCategory = true,
  current,
  className,
  ...props
}: HeaderProps) {
  const pathname = usePathname();
  const path = current ?? pathname;

  return (
    <header
      className={cn(
        "w-full bg-linear-to-r from-primary-300 to-secondary-300",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4 h-16 px-6">
        <Logo />

        <Link
          href="/search"
          className="hidden min-[744px]:flex ml-4 w-full max-w-3xl items-center gap-2 h-10 rounded-full bg-white px-4 text-gray-400"
        >
          <SearchIcon />
          <span className="text-sm">공연, 아티스트, 장소 검색</span>
        </Link>

        <Link
          href="/search"
          aria-label="검색"
          className="ml-auto text-gray-600 min-[744px]:hidden"
        >
          <SearchIcon />
        </Link>

        <div className="hidden min-[744px]:flex shrink-0 ml-auto min-w-46 justify-end items-center gap-4 text-gray-600">
          {loggedIn ? (
            <>
              <Link
                href="/notifications"
                aria-label="알림"
                className="relative transition-colors hover:text-white"
              >
                <BellIcon />
                {/* ~ 알림 개수 (API) */}
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500" />
              </Link>
              <Link
                href="/mypage/wishlist"
                aria-label="찜"
                className="transition-colors hover:text-white"
              >
                <TagIcon />
              </Link>
              <Link
                href="/mypage/orders"
                aria-label="예매내역"
                className="transition-colors hover:text-white"
              >
                <CalendarIcon />
              </Link>
              <Link
                href="/mypage/library"
                aria-label="라이브러리"
                className="transition-colors hover:text-white"
              >
                <LibraryIcon />
              </Link>
              <Link
                href="/mypage"
                aria-label="마이"
                className="transition-colors hover:text-white"
              >
                <UserIcon />
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-400 text-gray-600"
              >
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showCategory && (
        <nav className="flex items-center gap-5 h-11 overflow-x-auto border-b border-whisper bg-white px-6">
          {categories.map((cat) => {
            const active = path === cat.href;

            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={categoryItem({ active })}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
