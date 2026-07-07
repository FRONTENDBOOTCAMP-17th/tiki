// 데스크톱에서 QR 검증 화면 접근 시 모바일 권장 안내 (dismiss 가능)
"use client";
import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";

export default function DesktopNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 포인터가 정밀(마우스)하고 뷰포트가 넓으면 데스크톱으로 간주
    const isDesktop =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer: fine)").matches;
    if (isDesktop) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-surface-elevated">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/40">
          <Smartphone className="text-primary-600" size={28} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-50">
          모바일에서 사용해 주세요
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          입장 검증은 카메라로 QR을 스캔하는 화면이라 모바일에서 가장 원활해요.
          데스크톱에서는 8자리 코드 직접 입력만 사용하시는 걸 권장합니다.
        </p>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="mt-5 w-full rounded-xl bg-primary-700 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
        >
          계속 진행
        </button>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="닫기"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X size={20} />
      </button>
    </div>
  );
}
