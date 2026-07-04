import { ComponentPropsWithRef } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/cn";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggleButton from "@/components/theme/ThemeToggleButton";

interface RoleHeaderProps extends ComponentPropsWithRef<"header"> {
  role: "seller" | "admin";
}

const roleLabels = {
  seller: "판매자",
  admin: "관리자",
};

export default function RoleHeader({
  role,
  className,
  ...props
}: RoleHeaderProps) {
  return (
    <header
      className={cn(
        "w-full border-b border-gray-200 bg-white transition-colors dark:border-surface-3 dark:bg-surface-header",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-360 items-center gap-3 px-6 py-3 lg:px-8 lg:py-4">
        {/* 로고: 해당 영역 루트(/seller, /admin)로 이동 */}
        <Logo
          href={`/${role}`}
          color="currentColor"
          className="h-8 w-auto text-gray-950 dark:text-white"
        />
        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-surface-4 dark:text-gray-100">
          {roleLabels[role]}
        </span>

        {/* 알림 + 메인(구매자) 홈으로 이동 */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleButton />
          <NotificationBell className="size-9 justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-surface-4 dark:hover:text-white" />
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-surface-3 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-surface-4 dark:hover:text-white"
          >
            <Home size={16} />
            메인으로
          </Link>
        </div>
      </div>
    </header>
  );
}
