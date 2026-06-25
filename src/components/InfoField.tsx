import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// 라벨 + 값 한 쌍 (영수증/상세 모달의 회색 카드)
export default function InfoField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={cn("truncate font-medium text-gray-900", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
