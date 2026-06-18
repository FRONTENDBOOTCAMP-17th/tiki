"use client";

import type { ComponentProps, ReactNode } from "react";
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
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  cancelText?: string;
  cancelVariant?: ComponentProps<typeof Button>["variant"];
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
  confirmVariant, // undefined면 Button 기본 primary
  cancelText = "취소",
  cancelVariant = "outlinePrimary",
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
          <Button variant={cancelVariant} fullWidth onClick={onClose}>
            {cancelText}
          </Button>
        )}
        <Button
          fullWidth
          variant={confirmVariant}
          disabled={confirmDisabled}
          onClick={onConfirm ?? onClose}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
