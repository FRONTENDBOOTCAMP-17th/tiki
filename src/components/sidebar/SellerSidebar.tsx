"use client";

import {
  LayoutGrid,
  Plus,
  Ticket,
  Receipt,
  Store,
  LogOut,
  CalendarDays,
  Star,
} from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import Avatar from "@/components/Avatar";
import type { SidebarItem } from "./types";
import { logout } from "@/app/action";

interface SellerSidebarProps {
  name: string;
  email: string;
}

const SELLER_MENU: SidebarItem[] = [
  { label: "대시보드", href: "/seller", icon: LayoutGrid },
  { label: "이벤트 관리", href: "/seller/list", icon: CalendarDays },
  { label: "새 이벤트 등록", href: "/seller/registration", icon: Plus },
  { label: "예매 관리", href: "/seller/ticketManagement", icon: Ticket },
  { label: "리뷰 관리", href: "/seller/reviews", icon: Star },
];

const SELLER_SETTINGS: SidebarItem[] = [
  { label: "매출 · 정산", href: "/seller/settlement", icon: Receipt },
  { label: "스토어 정보", href: "/seller/storeInfo", icon: Store },
];

export default function SellerSidebar({ name, email }: SellerSidebarProps) {

  return (
    <aside className="flex h-full w-64 flex-col justify-between rounded-2xl bg-white p-4 transition-colors dark:bg-[#242528]">
      <div>
        <p className="px-3 pt-1 pb-1 text-xs font-semibold text-gray-400">
          판매자 메뉴
        </p>
        <nav className="flex flex-col gap-1">
          {SELLER_MENU.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>

        <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400">
          정산 · 설정
        </p>
        <nav className="flex flex-col gap-1">
          {SELLER_SETTINGS.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-100 pt-3 dark:border-[#3c4043]">
        <div className="flex items-center gap-2.5 px-1 py-2">
          <Avatar seed={email || name} className="size-9 text-xs" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-50">
              {name}
            </p>
            <p className="truncate text-[11px] text-gray-400">{email}</p>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
