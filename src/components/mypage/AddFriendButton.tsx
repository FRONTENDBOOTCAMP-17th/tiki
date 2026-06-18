"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "@/components/modal/Modal";
import { Input } from "@/components/Input";
import Button from "@/components/Button";

export default function AddFriendButton() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (formData: FormData) => {
    const email = formData.get("email");
    // TODO: 친구 요청 server action (이메일로 TiKi 계정 조회 후 요청)
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:w-auto"
      >
        <UserPlus size={16} />
        친구 추가
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <Modal.Header>친구 추가</Modal.Header>
          <Modal.Body>
            <Input
              label="친구 이메일"
              name="email"
              type="email"
              placeholder="friend@example.com"
              helperText="친구의 TiKi 계정 이메일을 입력하세요"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              친구 요청
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
