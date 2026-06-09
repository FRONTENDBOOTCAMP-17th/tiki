"use client"; // usePathname 훅 사용 → 클라이언트 컴포넌트

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarItem } from "./types";

export default function SidebarMenuItem({ label, href, icon: Icon, badge }: SidebarItem) {
  const pathname = usePathname(); // 지금 보고 있는 URL
  const isActive = pathname === href; // 현재 경로와 일치하면 = 활성

  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-purple-100 font-semibold text-purple-700" // 활성: 연보라 배경
          : "text-gray-700 hover:bg-gray-50" // 비활성
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </span>
      {/* badge가 1 이상일 때만 렌더 (0과 undefined는 안 뜸) */}
      {!!badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-medium text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}