"use client";

import {
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// 안띄울 path 지정해둔건데 필요하다고 판단되는 화면 있으면 수정하셔도 됩니다
const HIDDEN_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/example",
  "/join",
  "/login",
  "/payment",
  "/seller",
];

const HIDDEN_PATHS = ["/privacy", "/terms"];

function getScrollSnapshot() {
  if (typeof window === "undefined") return false;
  return window.scrollY > 100;
}

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);

  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function shouldHideFloatingActions(pathname: string) {
  return (
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function FloatingButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/95 text-gray-800 shadow-lg shadow-primary-200/50 backdrop-blur transition hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-surface-3 dark:bg-surface-1/95 dark:text-gray-100 dark:shadow-black/20 dark:hover:bg-surface-4",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function FloatingActions() {
  const pathname = usePathname();
  const isScrolledDown = useSyncExternalStore(
    subscribeScroll,
    getScrollSnapshot,
    () => false,
  );

  if (shouldHideFloatingActions(pathname)) return null;

  function toggleScrollPosition() {
    if (isScrolledDown) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div
      className={cn(
        "fixed right-4 bottom-24 z-40 flex flex-col items-center gap-2",
        "sm:right-6 md:bottom-8",
      )}
    >
      <FloatingButton
        label={isScrolledDown ? "맨 위로 이동" : "맨 아래로 이동"}
        onClick={toggleScrollPosition}
        className="border-gray-950 bg-gray-950 text-white hover:bg-black hover:text-white dark:border-white dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:hover:text-gray-950"
      >
        {isScrolledDown ? (
          <ArrowUp size={20} aria-hidden />
        ) : (
          <ArrowDown size={20} aria-hidden />
        )}
      </FloatingButton>
    </div>
  );
}
