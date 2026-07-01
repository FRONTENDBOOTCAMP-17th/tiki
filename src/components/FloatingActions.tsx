"use client";

import {
  ArrowDown,
  ArrowUp,
  Moon,
  Plus,
  Share2,
  Sun,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import useToast from "@/hooks/useToast";
import { cn } from "@/lib/cn";

const THEME_STORAGE_KEY = "tiki-theme";
const THEME_CHANGE_EVENT = "tiki-theme-change";

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

function getThemeSnapshot() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

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
        "flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/95 text-gray-800 shadow-lg shadow-primary-200/50 backdrop-blur transition hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100 dark:shadow-black/30 dark:hover:bg-gray-800",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function FloatingActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);
  const isScrolledDown = useSyncExternalStore(
    subscribeScroll,
    getScrollSnapshot,
    () => false,
  );
  const toast = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    notifyThemeChange();
  }, []);

  if (shouldHideFloatingActions(pathname)) return null;

  function toggleTheme() {
    const nextIsDark = !isDark;

    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
    notifyThemeChange();
    setOpen(false);
  }

  async function handleShare() {
    const shareData = {
      title: document.title || "TIKI",
      text: "TIKI에서 공연과 이벤트를 둘러보세요.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setOpen(false);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      toast.success("현재 페이지 링크를 복사했어요.");
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("공유에 실패했어요. 다시 시도해 주세요.");
    }
  }

  function toggleScrollPosition() {
    if (isScrolledDown) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOpen(false);
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
    setOpen(false);
  }

  return (
    <div
      className={cn(
        "fixed right-4 bottom-24 z-40 flex flex-col items-center gap-2",
        "sm:right-6 md:bottom-8",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
        aria-hidden={!open}
      >
        <FloatingButton label="현재 페이지 공유" onClick={handleShare}>
          <Share2 size={19} aria-hidden />
        </FloatingButton>
        <FloatingButton
          label={isDark ? "라이트모드로 보기" : "다크모드로 보기"}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
        </FloatingButton>
        <FloatingButton
          label={isScrolledDown ? "맨 위로 이동" : "맨 아래로 이동"}
          onClick={toggleScrollPosition}
        >
          {isScrolledDown ? (
            <ArrowUp size={20} aria-hidden />
          ) : (
            <ArrowDown size={20} aria-hidden />
          )}
        </FloatingButton>
      </div>
      <FloatingButton
        label={open ? "플로팅 메뉴 닫기" : "플로팅 메뉴 열기"}
        onClick={() => setOpen((current) => !current)}
        className="bg-primary-700 text-white hover:bg-primary-800 hover:text-white dark:border-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700"
      >
        {open ? <X size={20} aria-hidden /> : <Plus size={22} aria-hidden />}
      </FloatingButton>
    </div>
  );
}
