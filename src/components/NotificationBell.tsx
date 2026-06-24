"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus, Ticket, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  notification_id: string;
  type: string;
  title: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON = {
  friend: UserPlus,
  order: Ticket,
  ad: Megaphone,
} as const;

const TYPE_STYLE = {
  friend: "bg-secondary-100 text-secondary-700",
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
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("notification")
      .select("notification_id, type, title, link, is_read, created_at")
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
                    </div>
                  );

                  return (
                    <li key={item.notification_id}>
                      {item.link ? (
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
