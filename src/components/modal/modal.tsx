"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "center" | "sheet";
  className?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  position = "center",
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-50 flex bg-black/40 p-4",
        position === "center"
          ? "items-center justify-center"
          : "items-end justify-center",
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-white shadow-xl",
          position === "center"
            ? "max-w-md rounded-2xl"
            : "max-w-xl rounded-t-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
