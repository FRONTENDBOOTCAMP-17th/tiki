"use client";

import { ReactNode } from "react";

interface ScrollLinkProps {
  targetId: string;
  className?: string;
  children: ReactNode;
}

// 특정 섹션으로 부드럽게 스크롤하는 버튼 — 메타 목록 항목용 클라이언트 섬
export default function ScrollLink({
  targetId,
  className,
  children,
}: ScrollLinkProps) {
  return (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className={className}
    >
      {children}
    </button>
  );
}
