"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Dialog from "@/components/modal/Dialog";

export default function WithdrawButton() {
  const [open, setOpen] = useState(false);

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 server action 호출 → 로그아웃/리다이렉트
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between rounded-xl border border-danger-200 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="font-medium text-danger-600">회원 탈퇴</span>
        <ChevronRight size={18} className="text-danger-600" />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="회원 탈퇴"
        description="정말 탈퇴하시겠어요? 탈퇴 시 일부 정보는 관련 법령에 따라 보관될 수 있습니다."
        confirmText="탈퇴"
        confirmVariant="danger"
        cancelText="취소"
        cancelVariant="outline"
        onConfirm={handleWithdraw}
      />
    </>
  );
}