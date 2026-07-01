"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithRef, type ReactNode } from "react";
import { Search, LogIn } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryItem } from "./Header.styles";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";
import { SearchBarLink } from "@/components/SearchBar";
import type { HeaderProfile } from "@/lib/auth";

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
  /** 로그인 사용자 정보. 서버에서 조회해 내려주면 프로필 메뉴가 재조회 없이 렌더된다. */
  profile?: HeaderProfile | null;
  showCategory?: boolean;
  current?: string;
  /** 모바일 우측에 노출할 메뉴(예: 마이페이지 햄버거 드로어). 넘긴 페이지에서만 표시된다. */
  mobileMenu?: ReactNode;
}

// profile을 넘기지 않은 경우의 안전한 기본값(아바타는 이니셜 "?"로 표시).
const FALLBACK_PROFILE: HeaderProfile = {
  name: "",
  avatarUrl: null,
  role: "buyer",
};

export default function Header({
  loggedIn = false,
  profile,
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
        "w-full bg-linear-to-r from-primary-300 to-secondary-300 transition-colors dark:from-[#242528] dark:to-[#242528]",
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
                size={20}
                strokeWidth={2.25}
                className="size-9 justify-center rounded-full bg-white/20 text-white transition hover:scale-105 hover:bg-white/40"
                activeClassName="scale-105 bg-white/40"
              />
              <ProfileMenu profile={profile ?? FALLBACK_PROFILE} />
            </>
          ) : (
            <Link
              href="/login"
              aria-label="로그인"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-primary-600"
            >
              <LogIn size={20} strokeWidth={2.25} />
              <span className="text-sm font-semibold">로그인</span>
            </Link>
          )}
        </div>

        {mobileMenu && (
          <div className="text-white lg:hidden">{mobileMenu}</div>
        )}
      </div>

      {showCategory && (
        <div className="border-b border-gray-100 bg-white transition-colors dark:border-[#3c4043] dark:bg-[#242528]">
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
