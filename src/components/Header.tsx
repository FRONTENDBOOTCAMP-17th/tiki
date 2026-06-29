"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithRef, type ReactNode } from "react";
import {
  Search,
  Ticket,
  BookOpen,
  Users,
  CircleUser,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryItem } from "./Header.styles";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { SearchBarLink } from "@/components/SearchBar";

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
  /** 모바일 우측에 노출할 메뉴(예: 마이페이지 햄버거 드로어). 넘긴 페이지에서만 표시된다. */
  mobileMenu?: ReactNode;
}

export default function Header({
  loggedIn = false,
  showCategory = true,
  current,
  mobileMenu,
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
      <div className="mx-auto flex max-w-360 items-center gap-3 px-6 py-3 lg:gap-4 lg:px-8 lg:py-4">
        {/* 검색바 시작 위치를 검색화면 헤더와 맞추기 위한 고정폭 슬롯 (로고는 왼쪽으로 당김) */}
        <div className="flex w-17 shrink-0 items-center">
          <span className="min-[744px]:-ml-2">
            <Logo className="h-7 w-auto md:h-8" />
          </span>
        </div>

        <SearchBarLink className="hidden border-0 min-[744px]:flex" />

        <Link
          href="/search"
          aria-label="검색"
          className="ml-auto text-white transition-colors hover:text-primary-600 min-[744px]:hidden"
        >
          <Search className="h-6 w-6" />
        </Link>

        <div className="ml-4 hidden shrink-0 items-center gap-4 text-white min-[744px]:flex lg:ml-6">
          {loggedIn ? (
            <>
              <NotificationBell
                size={24}
                strokeWidth={2.25}
                className="hover:text-primary-600"
              />
              <Link
                href="/mypage"
                aria-label="마이"
                className="transition-colors hover:text-primary-600"
              >
                <CircleUser size={24} strokeWidth={2.25} />
              </Link>
              <Link
                href="/mypage/reservations"
                aria-label="예매내역"
                className="transition-colors hover:text-primary-600"
              >
                <Ticket size={24} strokeWidth={2.25} />
              </Link>
              <Link
                href="/mypage/library"
                aria-label="라이브러리"
                className="transition-colors hover:text-primary-600"
              >
                <BookOpen size={24} strokeWidth={2.25} />
              </Link>
              <Link
                href="/mypage/friends"
                aria-label="친구 관리"
                className="transition-colors hover:text-primary-600"
              >
                <Users size={24} strokeWidth={2.25} />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              aria-label="로그인"
              className="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-primary-600"
            >
              <LogIn size={24} strokeWidth={2.25} />
              <span className="text-[11px] font-semibold leading-none">로그인</span>
            </Link>
          )}
        </div>

        {mobileMenu && (
          <div className="text-white lg:hidden">{mobileMenu}</div>
        )}
      </div>

      {showCategory && (
        <div className="bg-white">
          <nav className="scrollbar-hide mx-auto flex h-11 max-w-360 items-center gap-5 overflow-x-auto px-7 lg:px-8">
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
        </div>
      )}
    </header>
  );
}
