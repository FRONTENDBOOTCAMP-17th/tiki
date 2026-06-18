"use client";
import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Dialog from "@/components/modal/Dialog";

export default function InfoLinkButton({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{label}</span>
        <ChevronRight size={18} className="text-gray-400" />
      </button>

      {/* 안내 모달 = 취소 없이 닫기 버튼만 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        showCancel={false}
        confirmText="닫기"
      >
        <div className="max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600">
          {children}
        </div>
      </Dialog>
    </>
  );
}