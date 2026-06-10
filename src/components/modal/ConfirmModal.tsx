"use client";

import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "확인",
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            className="border-gray-300 text-gray-700"
            onClick={onClose}
          >
            취소
          </Button>
          <Button fullWidth onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
