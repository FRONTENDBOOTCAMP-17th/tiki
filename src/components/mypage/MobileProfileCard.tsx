"use client";
import { usePathname } from "next/navigation";

// 예매 내역·라이브러리: 가로 컴팩트 / 설정: 숨김 / 나머지: 세로 기본
const COMPACT_ROUTES = ["/mypage/reservations", "/mypage/library"];
const HIDDEN_ROUTES = ["/mypage/settings"];

export default function MobileProfileCard() {
  const pathname = usePathname();

  // 설정 페이지에선 표시 안 함
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const compact = COMPACT_ROUTES.some((r) => pathname.startsWith(r));

  if (compact) {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:hidden">
        <div className="size-14 shrink-0 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">티키님</p>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              구매자
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">tiki@gmail.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:hidden">
      <div className="size-16 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
      <p className="text-lg font-bold text-gray-900">티키님</p>
      <p className="text-sm text-gray-400">tiki@gmail.com</p>
      <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-700">
        구매자
      </span>
    </div>
  );
}
