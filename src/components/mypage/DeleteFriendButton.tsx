"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import Dialog from "@/components/modal/Dialog";

export default function DeleteFriendButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // TODO: 친구 삭제 server action
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${name} 삭제`}
        className="shrink-0 rounded-md p-2 text-gray-400 transition hover:bg-gray-50 hover:text-danger-500"
      >
        <Trash2 size={18} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="친구 삭제"
        description={`${name}님을 친구 목록에서 삭제할까요?`}
        confirmText="삭제"
        confirmVariant="danger"
        cancelText="취소"
        cancelVariant="outline"
        onConfirm={handleDelete}
      />
    </>
  );
}
