"use client";

import { User, Library, Users, Settings, LogOut, CalendarCheck } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { SidebarItem } from "./types";

const MY_MENU: SidebarItem[] = [
  { label: "프로필", href: "/mypage", icon: User },
  { label: "예매 내역", href: "/mypage/orders", icon: CalendarCheck },
  { label: "라이브러리", href: "/mypage/library", icon: Library },
  { label: "친구 관리", href: "/mypage/friends", icon: Users },
  { label: "설정", href: "/mypage/settings", icon: Settings },
];

export default function MyPageSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col rounded-2xl bg-white p-4">
      {/* 상단 큰 프로필 카드 (직접 작성) */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-300 to-blue-300" />
        <p className="text-lg font-bold text-gray-900">멋사님</p>
        <p className="text-sm text-gray-400">moetsa@gmail.com</p>
        <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-medium text-purple-600">
          구매자
        </span>
      </div>

      {/* "나의 활동" 섹션 (헤더도 직접 작성) */}
      <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400">나의 활동</p>
      <nav className="flex flex-col gap-1">
        {MY_MENU.map((item) => (
          <SidebarMenuItem key={item.href} {...item} />
        ))}
      </nav>

      {/* 로그아웃 (구매자 : 빨간색) */}
      <button className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600">
        <LogOut size={18} />
        로그아웃
      </button>
    </aside>
  );
}