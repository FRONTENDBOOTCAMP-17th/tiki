import { cn } from "@/lib/cn";

// 목록/결과가 없을 때 쓰는 공통 빈 상태 박스
export default function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400",
        className,
      )}
    >
      {message}
    </p>
  );
}
