"use client";

import { useState } from "react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";

interface FriendAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  onEmailChange?: (email: string) => void;
  preview?: React.ReactNode;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 복붙용 test@test.com

export default function FriendAddModal({
  open,
  onClose,
  onSubmit,
  onEmailChange,
  preview,
}: FriendAddModalProps) {
  const [email, setEmail] = useState("");
  const valid = emailPattern.test(email);

  const change = (value: string) => {
    setEmail(value);
    onEmailChange?.(value);
  };

  const close = () => {
    change("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close}>
      <div className="flex flex-col gap-5 p-6">
        <h2 className="text-lg font-bold text-gray-900">친구 추가</h2>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="friend-email"
            className="text-sm font-medium text-gray-700"
          >
            친구 이메일
          </label>
          <input
            id="friend-email"
            type="email"
            value={email}
            onChange={(e) => change(e.target.value)}
            placeholder="friend@example.com"
            className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none placeholder:text-gray-400 focus:border-primary-500"
          />
          <p className="text-xs text-gray-400">
            친구의 TiKi 계정 이메일을 입력하세요
          </p>
        </div>

        {preview}

        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            className="border-gray-300 text-gray-700"
            onClick={close}
          >
            취소
          </Button>
          <Button
            fullWidth
            disabled={!valid}
            className="bg-linear-to-r from-primary-500 to-accent-500"
            onClick={() => onSubmit(email)}
          >
            친구 요청
          </Button>
        </div>
      </div>
    </Modal>
  );
}
