"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Modal from "@/components/modal/Modal";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { changePassword } from "@/app/action";

export default function PasswordChangeButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const next = formData.get("newPassword");
    const confirm = formData.get("confirmPassword");
    if (next !== confirm) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }
    const result = await changePassword(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">비밀번호 변경</span>
        <ChevronRight size={18} className="text-gray-400" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <Modal.Header>비밀번호 변경</Modal.Header>
          <Modal.Body>
            <Input
              label="현재 비밀번호"
              name="currentPassword"
              type="password"
            />
            <Input label="새 비밀번호" name="newPassword" type="password" />
            <Input
              label="새 비밀번호 확인"
              name="confirmPassword"
              type="password"
              error={error}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" fullWidth>
              변경
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
