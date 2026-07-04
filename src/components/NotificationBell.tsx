"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, UserPlus, Ticket, Megaphone, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  acceptTicketShare,
  rejectTicketShare,
} from "@/app/action";
import { cn } from "@/lib/cn";
import useToast from "@/hooks/useToast";

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
  ticket_share: Ticket,
  order: Ticket,
  ad: Megaphone,
} as const;

const TYPE_STYLE = {
  friend: "bg-secondary-100 text-secondary-700",
  friend_request: "bg-secondary-100 text-secondary-700",
  ticket_share: "bg-primary-100 text-primary-700",
  order: "bg-primary-100 text-primary-700",
  ad: "bg-accent-100 text-accent-700",
} as const;

const DEFAULT_LINK: Record<string, string> = {
  order: "/mypage/reservations",
  friend: "/mypage/friends",
  friend_request: "/mypage/friends",
  ticket_share: "/mypage/reservations",
};

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

export default function NotificationBell({
  className = "hover:text-white",
  activeClassName,
  size = 22,
  strokeWidth = 1.5,
}: {
  className?: string;
  /** 알림창이 열려 있을 때 추가로 적용할 클래스 (열린 상태 표시용) */
  activeClassName?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      setUserId(user.id);

      // 관리자 계정은 RLS(admin_all)상 모든 알림에 접근 가능하므로,
      // 반드시 본인 user_id로 필터링해야 남의 알림까지 뜨지 않는다.
      const { data } = await supabase
        .from("notification")
        .select(
          "notification_id, type, title, link, is_read, created_at, ref_id",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (active) setItems((data as NotificationItem[] | null) ?? []);
    })();

    return () => {
      active = false;
    };
  }, []);

  const unreadCount = items.filter((item) => !item.is_read).length;

  async function openPanel() {
    setOpen(true);
    if (unreadCount === 0 || !userId) return;
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    const supabase = createClient();
    // user_id 필터가 없으면 관리자는 전체 유저의 알림을 읽음 처리해버린다.
    await supabase
      .from("notification")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }

  async function handleAccept(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await acceptFriendRequest(item.ref_id);
    if (result?.error) {
      error(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
    router.refresh(); // 친구 수락 → 친구 목록 등 서버 컴포넌트 갱신
  }

  async function handleReject(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await rejectFriendRequest(item.ref_id);
    if (result?.error) {
      error(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
    router.refresh();
  }

  async function handleAcceptShare(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await acceptTicketShare(item.ref_id);
    if (result?.error) {
      error(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
    success("티켓을 받았습니다");
    router.refresh(); // 티켓 수락 → 받은 티켓 탭 등 서버 컴포넌트 갱신
  }

  async function handleRejectShare(item: NotificationItem) {
    if (!item.ref_id) return;
    const result = await rejectTicketShare(item.ref_id);
    if (result?.error) {
      error(result.error);
      return;
    }
    setItems((prev) =>
      prev.filter((n) => n.notification_id !== item.notification_id),
    );
    router.refresh();
  }

  async function handleDelete(item: NotificationItem) {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("notification")
      .delete()
      .eq("notification_id", item.notification_id);
    if (deleteError) {
      error("삭제에 실패했습니다");
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
        className={cn(
          "relative flex items-center transition-colors",
          className,
          open && activeClassName,
        )}
      >
        <Bell size={size} strokeWidth={strokeWidth} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-xl dark:border-surface-3 dark:bg-surface-1">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-surface-3">
              <p className="font-bold text-gray-900 dark:text-gray-50">알림</p>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                새로운 알림이 없습니다
              </p>
            ) : (
              <ul className="max-h-96 divide-y divide-gray-50 overflow-auto dark:divide-surface-3">
                {items.map((item) => {
                  const Icon = iconFor(item.type);
                  const isActionable =
                    (item.type === "friend_request" ||
                      item.type === "ticket_share") &&
                    item.ref_id;
                  const row = (
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-2">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${styleFor(item.type)}`}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-100">
                          {item.title}
                        </p>
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
                        className="shrink-0 rounded-md p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-surface-3 dark:hover:text-gray-200"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );

                  const linkHref = item.link || DEFAULT_LINK[item.type];

                  return (
                    <li key={item.notification_id}>
                      {isActionable ? (
                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-2">
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${styleFor(item.type)}`}
                            >
                              <Icon size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800 dark:text-gray-100">
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
                              onClick={() =>
                                item.type === "friend_request"
                                  ? handleAccept(item)
                                  : handleAcceptShare(item)
                              }
                              className="flex-1 rounded-lg bg-linear-to-r from-primary-400 to-secondary-400 px-3 py-1.5 text-xs font-semibold text-primary-900 transition hover:opacity-90"
                            >
                              수락
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                item.type === "friend_request"
                                  ? handleReject(item)
                                  : handleRejectShare(item)
                              }
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-surface-3 dark:text-gray-300 dark:hover:bg-surface-2"
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      ) : linkHref ? (
                        <Link href={linkHref} onClick={() => setOpen(false)}>
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
