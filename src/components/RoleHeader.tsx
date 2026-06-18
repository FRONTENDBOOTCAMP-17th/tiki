import { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import Logo from "@/components/Logo";

interface RoleHeaderProps extends ComponentPropsWithRef<"header"> {
  role: "seller" | "admin";
}

const roleLabels = {
  seller: "판매자",
  admin: "관리자",
};

export default function RoleHeader({ role, className, ...props }: RoleHeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-linear-to-r from-primary-200 to-secondary-200 shadow-md",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 h-16 px-6">
        <Logo />
        <span className="rounded-full bg-white/60 px-2.5 py-1 text-xs text-gray-600">
          {roleLabels[role]}
        </span>
      </div>
    </header>
  );
}
