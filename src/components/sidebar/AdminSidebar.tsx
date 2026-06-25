"use client";

import { LayoutGrid, Plus, BarChart2, Folder, Bell, LogOut } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { SidebarItem } from "./types";
import { logout } from "@/app/action";

const ADMIN_MENU: SidebarItem[] = [
  { label: "대시보드", href: "/admin", icon: LayoutGrid },
  { label: "게시물 관리", href: "/admin/events", icon: Plus },
  { label: "회원 관리", href: "/admin/members", icon: BarChart2 },
  { label: "카테고리 관리", href: "/admin/categories", icon: Folder },
  { label: "알림 관리", href: "/admin/notifications", icon: Bell },
];

export default function AdminSidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6">
      <div>
        <h2 className="mb-4 px-3 text-base font-bold text-primary-600">
          관리자님, 환영합니다
        </h2>
        <nav className="flex flex-col gap-1">
          {ADMIN_MENU.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-sm font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">관리자</p>
            <p className="truncate text-xs text-gray-400">admin@tiki.com</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}