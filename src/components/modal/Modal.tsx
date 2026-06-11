"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "center" | "sheet";
  className?: string;
}

function Modal({
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
          "flex max-h-[85vh] w-full flex-col overflow-hidden bg-white shadow-xl",
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

function ModalHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-6 pt-6 text-lg font-bold text-mirage">{children}</h2>
  );
}

function ModalBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 px-6 pb-6">{children}</div>;
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
