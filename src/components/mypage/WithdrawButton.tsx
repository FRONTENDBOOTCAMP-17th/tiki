"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Dialog from "@/components/modal/Dialog";
import Modal from "@/components/modal/Modal";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { withdraw } from "@/app/action";

export default function WithdrawButton() {
  // none → confirm(의도 확인) → password(비밀번호 재인증)
  const [step, setStep] = useState<"none" | "confirm" | "password">("none");
  const [error, setError] = useState("");

  const handleWithdraw = async (formData: FormData) => {
    const result = await withdraw(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    // 성공 시 server action이 / 로 리다이렉트
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="flex items-center justify-between rounded-xl border border-danger-200 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="font-medium text-danger-600">회원 탈퇴</span>
        <ChevronRight size={18} className="text-danger-600" />
      </button>

      {/* 1단계: 의도 확인 */}
      <Dialog
        open={step === "confirm"}
        onClose={() => setStep("none")}
        title="회원 탈퇴"
        description="정말 탈퇴하시겠어요? 탈퇴 시 일부 정보는 관련 법령에 따라 보관될 수 있습니다."
        confirmText="탈퇴"
        confirmVariant="danger"
        cancelText="취소"
        cancelVariant="outline"
        onConfirm={() => setStep("password")}
      />

      {/* 2단계: 비밀번호 재인증 */}
      <Modal open={step === "password"} onClose={() => setStep("none")}>
        <form action={handleWithdraw} className="flex min-h-0 flex-1 flex-col">
          <Modal.Header>비밀번호 확인</Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-600">
              탈퇴를 완료하려면 비밀번호를 입력해주세요.
            </p>
            <Input
              label="비밀번호"
              name="password"
              type="password"
              error={error}
              className="focus:border-gray-300 focus:ring-gray-200"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setStep("none")}
            >
              취소
            </Button>
            <Button type="submit" variant="danger" fullWidth>
              탈퇴
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
