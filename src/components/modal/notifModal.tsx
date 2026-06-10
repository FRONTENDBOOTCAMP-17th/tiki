"use client";

import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  linkUrl: string;
  createdAt: string;
  isRead: boolean;
}

interface NotifModalProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotifModal({
  open,
  onClose,
  notifications,
}: NotifModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-lg font-bold text-gray-900">알림</h2>
        <ul className="flex flex-col gap-2">
          {notifications.map((noti) => (
            <li key={noti.id}>
              <Link
                href={noti.linkUrl}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="size-9 shrink-0 rounded-md bg-gray-200" />
                <p className="flex-1 text-sm text-gray-800">{noti.message}</p>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(noti.createdAt)}
                </span>
                {!noti.isRead && (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary-600" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
