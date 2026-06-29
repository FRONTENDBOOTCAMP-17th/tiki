"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/action";
import SidebarMenuItem from "@/components/sidebar/SidebarMenuItem";
import type { SidebarItem } from "@/components/sidebar/types";

const MENU: SidebarItem[] = [
  { label: "프로필", href: "/mypage/profile", icon: User },
  { label: "예매 내역", href: "/mypage/reservations", icon: CalendarCheck },
  { label: "라이브러리", href: "/mypage/library", icon: Library },
  { label: "친구 관리", href: "/mypage/friends", icon: Users },
  { label: "설정", href: "/mypage/settings", icon: Settings },
];

interface Profile {
  name: string;
  avatarUrl: string | null;
  role: string;
}

// 헤더 우측 프로필 아바타 + 계정 드롭다운. 본인 프로필은 클라이언트에서 조회한다.
export default function ProfileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    avatarUrl: null,
    role: "buyer",
  });

  // 라우트가 바뀌면 드롭다운을 닫는다.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const supabase = createClient();
    let ignore = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("name, avatar_url, role")
        .eq("id", user.id)
        .single();
      if (!ignore && data) {
        setProfile({
          name: data.name ?? "",
          avatarUrl: data.avatar_url ?? null,
          role: data.role ?? "buyer",
        });
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const initial = profile.name.trim().charAt(0).toUpperCase() || "?";
  const isStaff = profile.role === "seller" || profile.role === "admin";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="내 메뉴"
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
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 text-left shadow-xl">
            {profile.name && (
              <p className="truncate px-3 py-2 text-sm font-semibold text-gray-900">
                {profile.name}님
              </p>
            )}

            <nav className="flex flex-col gap-0.5">
              {MENU.map((item) => (
                <SidebarMenuItem key={item.href} {...item} />
              ))}

              {isStaff && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <SidebarMenuItem
                    label="판매자 페이지"
                    href="/seller"
                    icon={Store}
                  />
                  {profile.role === "admin" && (
                    <SidebarMenuItem
                      label="관리자 페이지"
                      href="/admin"
                      icon={ShieldCheck}
                    />
                  )}
                </>
              )}
            </nav>

            <div className="my-1 border-t border-gray-100" />
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-500 transition-colors hover:bg-gray-50 hover:text-danger-600"
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
