"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// 이전 화면으로 돌아가는 버튼 (라벨 커스텀 가능)
export default function BackButton({ label = "돌아가기" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group -ml-1 flex cursor-pointer items-center gap-1 py-2 text-sm text-gray-500 transition-colors hover:text-primary-700"
    >
      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
