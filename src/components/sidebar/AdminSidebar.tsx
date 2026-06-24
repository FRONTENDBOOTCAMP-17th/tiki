"use client";

import { LayoutGrid, LogOut, Tags, CalendarDays, UserCog } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { SidebarItem } from "./types";
import { logout } from "@/app/action";

const ADMIN_MENU: SidebarItem[] = [
  { label: "대시보드", href: "/admin", icon: LayoutGrid },
  { label: "이벤트 관리", href: "/admin/events", icon: CalendarDays },
  { label: "회원 관리", href: "/admin/members", icon: UserCog },
  { label: "카테고리 관리", href: "/admin/categories", icon: Tags},
];

export default function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col justify-between rounded-2xl bg-white p-4">
      <div>
        <h2 className="mb-4 px-3 text-lg font-bold text-primary-800">관리자님, 환영합니다</h2>
        <nav className="flex flex-col gap-1">
          {ADMIN_MENU.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      {/* 하단 프로필 + 로그아웃 (이 사이드바 안에서 직접 작성) */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">관리자</p>
            <p className="text-xs text-gray-400">admin@tiki.com</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}