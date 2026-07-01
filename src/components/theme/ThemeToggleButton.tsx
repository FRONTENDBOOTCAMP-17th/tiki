"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggleButton({
  className,
}: {
  className?: string;
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트모드로 보기" : "다크모드로 보기"}
      title={isDark ? "라이트모드로 보기" : "다크모드로 보기"}
      onClick={toggleTheme}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-[#3c4043] dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-[#34363a] dark:hover:text-white dark:focus:ring-offset-[#242528]",
        className,
      )}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
