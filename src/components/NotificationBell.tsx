"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus, Ticket, Megaphone, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { acceptFriendRequest, rejectFriendRequest } from "@/app/action";

interface NotificationItem {
  notification_id: string;
  type: string;
  title: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  ref_id: string | null;
}

const TYPE_ICON = {
  friend: UserPlus,
  friend_request: UserPlus,
  order: Ticket,
  ad: Megaphone,
} as const;

const TYPE_STYLE = {
  friend: "bg-secondary-100 text-secondary-700",
  friend_request: "bg-secondary-100 text-secondary-700",
  order: "bg-primary-100 text-primary-700",
  ad: "bg-accent-100 text-accent-700",
} as const;

function iconFor(type: string) {
  return TYPE_ICON[type as keyof typeof TYPE_ICON] ?? Bell;
}

function styleFor(type: string) {
  return (
    TYPE_STYLE[type as keyof typeof TYPE_STYLE] ?? "bg-gray-100 text-gray-500"
  );
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return time; // 오늘: "오전 ㅇㅇ:ㅇㅇ"

  const sameYear = date.getFullYear() === now.getFullYear();
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: sameYear ? undefined : "numeric",
    month: "long",
    day: "numeric",
  });
  return `${dateStr} ${time}`; // "ㅇㅇ월 ㅇㅇ일 오전/오후 ㅇㅇ:ㅇㅇ"
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("notification")
      .select("notification_id, type, title, link, is_read, created_at, ref_id")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setItems((data as NotificationItem[] | null) ?? []));
  }, []);

  const unreadCount = items.filter((item) => !item.is_read).length;

  async function openPanel() {
    setOpen(true);
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    const supabase = createClient();
    await supabase
      .from("notification")
      .update({ is_read: true })
      .eq("is_read", false);
  }

  async function handleAccept(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await acceptFriendRequest(item.ref_id);
    if (result?.error) {
      alert(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
  }

  async function handleReject(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await rejectFriendRequest(item.ref_id);
    if (result?.error) {
      alert(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
  }

  async function handleDelete(item: NotificationItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("notification")
      .delete()
      .eq("notification_id", item.notification_id);
    if (error) {
      alert("삭제에 실패했습니다");
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="알림"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="relative flex items-center transition-colors hover:text-white"
      >
        <Bell size={24} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-xl">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="font-bold text-gray-900">알림</p>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                새로운 알림이 없습니다
              </p>
            ) : (
              <ul className="max-h-96 divide-y divide-gray-50 overflow-auto">
                {items.map((item) => {
                  const Icon = iconFor(item.type);
                  const row = (
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${styleFor(item.type)}`}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatTime(item.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        aria-label="알림 삭제"
                        className="shrink-0 rounded-md p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );

                  return (
                    <li key={item.notification_id}>
                      {item.type === "friend_request" && item.ref_id ? (
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${styleFor(item.type)}`}
                            >
                              <Icon size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800">
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {formatTime(item.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2 pl-12">
                            <button
                              type="button"
                              onClick={() => handleAccept(item)}
                              className="flex-1 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              수락
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(item)}
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      ) : item.link ? (
                        <Link href={item.link} onClick={() => setOpen(false)}>
                          {row}
                        </Link>
                      ) : (
                        row
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
