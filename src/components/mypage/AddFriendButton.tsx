"use client";
import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import Modal from "@/components/modal/Modal";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { sendFriendRequest } from "@/app/action";

export default function AddFriendButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setError("이메일을 입력해주세요");
      return;
    }
    setError("");
    setDone("");
    startTransition(async () => {
      const result = await sendFriendRequest(email);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDone("친구 요청을 보냈습니다");
    });
  };

  const close = () => {
    setOpen(false);
    setError("");
    setDone("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2 text-sm font-medium text-primary-900 transition hover:opacity-90"
      >
        <UserPlus size={16} />
        친구 추가
      </button>

      <Modal open={open} onClose={close}>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <Modal.Header>친구 추가</Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-500">
              친구의 TiKi 계정 이메일을 입력하여 친구 요청을 보내세요.
            </p>
            <Input
              label="이메일"
              name="email"
              type="email"
              placeholder="friend@example.com"
              error={error}
            />
            {done && <p className="text-sm text-primary-600">{done}</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline" fullWidth onClick={close}>
              닫기
            </Button>
            <Button type="submit" fullWidth disabled={pending}>
              {pending ? "전송 중..." : "요청 보내기"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
