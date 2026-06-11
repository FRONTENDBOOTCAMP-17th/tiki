"use client";

import type { ReactNode } from "react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  cancelText?: string;
  showCancel?: boolean;
  position?: "center" | "sheet";
  className?: string;
}

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmText = "확인",
  onConfirm,
  confirmDisabled,
  cancelText = "취소",
  showCancel = true,
  position = "center",
  className,
}: DialogProps) {
  return (
    <Modal open={open} onClose={onClose} position={position} className={className}>
      {title && <Modal.Header>{title}</Modal.Header>}

      <Modal.Body>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {children}
      </Modal.Body>

      <Modal.Footer>
        {showCancel && (
          <Button variant="outlinePrimary" fullWidth onClick={onClose}>
            {cancelText}
          </Button>
        )}
        <Button fullWidth disabled={confirmDisabled} onClick={onConfirm ?? onClose}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
