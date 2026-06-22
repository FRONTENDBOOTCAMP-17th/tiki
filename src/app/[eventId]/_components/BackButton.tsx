"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// "목록으로" — router.back() 만을 위한 클라이언트 섬
export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group -ml-1 my-2 flex cursor-pointer items-center gap-1 py-2 text-sm text-gray-500 transition-colors hover:text-primary-700"
    >
      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      목록으로
    </button>
  );
}
