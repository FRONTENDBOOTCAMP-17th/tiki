"use client";

import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function AlertModal({
  open,
  onClose,
  title,
  children,
}: AlertModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
          <div className="text-sm leading-relaxed text-gray-600">{children}</div>
        </div>
        <Button fullWidth onClick={onClose}>
          닫기
        </Button>
      </div>
    </Modal>
  );
}
