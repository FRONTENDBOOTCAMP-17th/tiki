"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import Dialog from "@/components/modal/Dialog";
import { deleteFriend } from "@/app/action";

export default function DeleteFriendButton({
  friendId,
  name,
}: {
  friendId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFriend(friendId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setOpen(false);
    });
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
        confirmText={pending ? "삭제 중..." : "삭제"}
        confirmVariant="danger"
        cancelText="취소"
        cancelVariant="outline"
        onConfirm={handleDelete}
      />
    </>
  );
}
