"use client";

import { LayoutGrid, Plus, Ticket, Receipt, Store, LogOut, CalendarDays } from "lucide-react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { SidebarItem } from "./types";

const SELLER_MENU: SidebarItem[] = [
  { label: "대시보드", href: "/seller", icon: LayoutGrid },
  { label: "이벤트 관리", href: "/seller/events", icon: CalendarDays, badge: 8 },
  { label: "새 이벤트 등록", href: "/seller/events/new", icon: Plus },
  { label: "예매 관리", href: "/seller/orders", icon: Ticket, badge: 2 },
];

const SELLER_SETTINGS: SidebarItem[] = [
  { label: "매출 · 정산", href: "/seller/revenue", icon: Receipt },
  { label: "스토어 정보", href: "/seller/store", icon: Store },
];

export default function SellerSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col justify-between rounded-2xl bg-white p-4">
      <div>
        {/* 섹션 1: 판매자 메뉴 */}
        <p className="px-3 pt-1 pb-1 text-xs font-semibold text-gray-400">판매자 메뉴</p>
        <nav className="flex flex-col gap-1">
          {SELLER_MENU.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>

        {/* 섹션 2: 정산 · 설정 */}
        <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400">정산 · 설정</p>
        <nav className="flex flex-col gap-1">
          {SELLER_SETTINGS.map((item) => (
            <SidebarMenuItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      {/* 하단 프로필 + 로그아웃 */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-400 text-sm font-semibold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">판매자명</p>
            <p className="text-xs text-gray-400">seller@tiki.com</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}