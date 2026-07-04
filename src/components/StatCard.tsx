import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { statIconVariants } from "./StatCard.styles";

interface StatCardProps extends VariantProps<typeof statIconVariants> {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone,
  className,
}: StatCardProps) {
  const cardClassName = cn(
    "flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors dark:border-surface-3 dark:bg-surface-1",
    href && "hover:border-primary-300 hover:shadow-sm dark:hover:border-gray-500",
    className,
  );

  const content = (
    <>
      <div className={statIconVariants({ tone })}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate text-lg font-bold text-gray-900 dark:text-gray-50">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
