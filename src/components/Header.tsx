"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithRef } from "react";
import { Search, Ticket, BookOpen, Users, CircleUser } from "lucide-react";
import { cn } from "@/lib/cn";
import Button from "@/components/Button";
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
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 lg:gap-4 lg:px-8 lg:py-4">
        <Logo />

        <SearchBarLink className="hidden min-[744px]:flex" />

        <Link
          href="/search"
          aria-label="검색"
          className="ml-auto text-gray-600 min-[744px]:hidden"
        >
          <Search className="h-6 w-6" />
        </Link>

        <div className="hidden shrink-0 items-center gap-4 text-gray-600 min-[744px]:flex">
          {loggedIn ? (
            <>
              <NotificationBell />
              <Link
                href="/mypage"
                aria-label="마이"
                className="transition-colors hover:text-white"
              >
                <CircleUser size={22} strokeWidth={1.5} />
              </Link>
              <Link
                href="/mypage/reservations"
                aria-label="예매내역"
                className="transition-colors hover:text-white"
              >
                <Ticket size={22} strokeWidth={1.5} />
              </Link>
              <Link
                href="/mypage/library"
                aria-label="라이브러리"
                className="transition-colors hover:text-white"
              >
                <BookOpen size={22} strokeWidth={1.5} />
              </Link>
              <Link
                href="/mypage/friends"
                aria-label="친구 관리"
                className="transition-colors hover:text-white"
              >
                <Users size={22} strokeWidth={1.5} />
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
        <div className="border-b border-whisper bg-white">
          <nav className="scrollbar-hide mx-auto flex h-11 max-w-7xl items-center gap-5 overflow-x-auto px-4 lg:px-8">
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
