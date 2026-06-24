import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string; // 메뉴 이름
  href: string; // 이동 경로
  icon: LucideIcon; // lucide 아이콘 컴포넌트
  badge?: number; // 우측 숫자 (선택)
}