"use client";
import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function MobileDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]); // 페이지 이동 시 자동 닫힘

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="메뉴 열기" className="p-2">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </aside>
    </div>
  );
}