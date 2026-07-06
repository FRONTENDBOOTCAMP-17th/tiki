"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  User,
  CalendarCheck,
  Library,
  Users,
  Settings,
  Store,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/action";
import SidebarMenuItem from "@/components/sidebar/SidebarMenuItem";
import type { SidebarItem } from "@/components/sidebar/types";
import type { HeaderProfile } from "@/lib/auth";

const MENU: SidebarItem[] = [
  { label: "프로필", href: "/mypage/profile", icon: User },
  { label: "예매 내역", href: "/mypage/reservations", icon: CalendarCheck },
  { label: "라이브러리", href: "/mypage/library", icon: Library },
  { label: "친구 관리", href: "/mypage/friends", icon: Users },
  { label: "설정", href: "/mypage/settings", icon: Settings },
];

// 헤더 우측 프로필 아바타 + 계정 드롭다운.
// 사용자 정보는 서버에서 조회해 props로 받는다(클라이언트 재조회 없음).
export default function ProfileMenu({ profile }: { profile: HeaderProfile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 라우트가 바뀌면 드롭다운을 닫는다.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // 열린 동안: Esc로 닫기, 첫 항목으로 포커스 이동, 닫히면 트리거로 포커스 복원.
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    const first = menuRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  // Tab이 드롭다운 밖으로 나가지 않도록 처음/끝에서 순환시킨다(포커스 트랩).
  function handleTrapTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;

    const items = menuRef.current?.querySelectorAll<HTMLElement>("a, button");
    if (!items || items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const initial = profile.name.trim().charAt(0).toUpperCase() || "?";
  // 판매자는 판매자 페이지, 관리자는 관리자 페이지만 노출할 수 있게 수정
  const isSeller = profile.role === "seller";
  const isAdmin = profile.role === "admin";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="내 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative size-9 overflow-hidden rounded-full bg-linear-to-br from-primary-400 to-secondary-400 ring-2 ring-white/60 transition hover:scale-105 hover:ring-white"
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="프로필"
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-sm font-semibold text-white">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            aria-label="내 메뉴"
            onKeyDown={handleTrapTab}
            className="absolute right-0 z-[70] mt-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 text-left shadow-xl dark:border-surface-3 dark:bg-surface-1"
          >
            {profile.name && (
              <p className="truncate px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
                {profile.name}님
              </p>
            )}

            <nav className="flex flex-col gap-0.5">
              {MENU.map((item) => (
                <SidebarMenuItem key={item.href} {...item} />
              ))}

              {(isSeller || isAdmin) && (
                <div className="my-1 border-t border-gray-100 dark:border-surface-3" />
              )}
              {isSeller && (
                <SidebarMenuItem
                  label="판매자 페이지"
                  href="/seller"
                  icon={Store}
                />
              )}
              {isAdmin && (
                <SidebarMenuItem
                  label="관리자 페이지"
                  href="/admin"
                  icon={ShieldCheck}
                />
              )}
            </nav>

            <div className="my-1 border-t border-gray-100 dark:border-surface-3" />
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-500 transition-colors hover:bg-gray-50 hover:text-danger-600 dark:hover:bg-surface-2"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
