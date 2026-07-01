import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ReviewBodyProps {
  children: ReactNode;
  className?: string;
}

export default function ReviewBody({ children, className }: ReviewBodyProps) {
  return (
    <p
      className={cn(
        "whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300",
        className,
      )}
    >
      {children}
    </p>
  );
}
