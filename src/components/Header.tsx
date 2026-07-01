"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithRef, type ReactNode } from "react";
import { Search, LogIn, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryItem } from "./Header.styles";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";
import { SearchBarLink } from "@/components/SearchBar";
import { useTheme } from "@/components/theme/ThemeProvider";
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

function HeaderThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트모드로 보기" : "다크모드로 보기"}
      title={isDark ? "라이트모드로 보기" : "다크모드로 보기"}
      onClick={toggleTheme}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-primary-300 dark:text-gray-100 dark:hover:bg-[#34363a] dark:focus:ring-offset-[#242528] lg:px-3"
    >
      <Icon size={18} strokeWidth={2.15} aria-hidden />
      <span className="hidden lg:inline">{isDark ? "라이트" : "다크"}</span>
    </button>
  );
}

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
        "relative z-50 w-full bg-linear-to-r from-primary-300 to-secondary-300 transition-colors dark:from-[#242528] dark:to-[#242528]",
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

        <div className="ml-1 flex shrink-0 items-center gap-1 rounded-full bg-white/10 p-1 text-white ring-1 ring-white/15 backdrop-blur dark:bg-white/5 dark:ring-white/10 min-[744px]:ml-3 lg:ml-5">
          <HeaderThemeToggle />

          {loggedIn ? (
            <div className="hidden items-center gap-1 min-[744px]:flex">
              <NotificationBell
                size={20}
                strokeWidth={2.25}
                className="size-9 justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white"
                activeClassName="bg-white/15 text-white"
              />
              <ProfileMenu profile={profile ?? FALLBACK_PROFILE} />
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="로그인"
              className="hidden h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-white/90 hover:text-primary-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-white min-[744px]:flex"
            >
              <LogIn size={20} strokeWidth={2.25} />
              <span>로그인</span>
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
