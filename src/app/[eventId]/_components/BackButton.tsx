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
      className="flex items-center gap-1 px-4 py-3 text-sm text-gray-600"
    >
      <ChevronLeft className="h-4 w-4" />
      목록으로
    </button>
  );
}
