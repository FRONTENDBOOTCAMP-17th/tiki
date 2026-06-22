"use client";

import { logout } from "@/app/action";

import {
  User,
  Library,
  Users,
  Settings,
  LogOut,
  CalendarCheck,
} from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { SidebarItem } from "./types";

const MY_MENU: SidebarItem[] = [
  { label: "프로필", href: "/mypage/profile", icon: User },
  { label: "예매 내역", href: "/mypage/reservations", icon: CalendarCheck },
  { label: "라이브러리", href: "/mypage/library", icon: Library },
  { label: "친구 관리", href: "/mypage/friends", icon: Users },
  { label: "설정", href: "/mypage/settings", icon: Settings },
];

const ROLE_LABEL: Record<string, string> = {
  buyer: "구매자",
  seller: "판매자",
};

interface Props {
  name?: string;
  email?: string;
  role?: string;
}

export default function MyPageSidebar({ name = "", email = "", role = "buyer" }: Props) {
  const roleLabel = ROLE_LABEL[role] ?? "구매자";

  return (
    <aside className="flex h-full w-full flex-col rounded-l-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2 pb-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
        <p className="text-lg font-bold text-gray-900">{name}님</p>
        <p className="text-sm text-gray-400">{email}</p>
        <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-800">
          {roleLabel}
        </span>
      </div>

      <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400">
        나의 활동
      </p>
      <nav className="flex flex-col gap-1">
        {MY_MENU.map((item) => (
          <SidebarMenuItem key={item.href} {...item} />
        ))}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-danger-500 hover:text-danger-600"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </form>
    </aside>
  );
}
