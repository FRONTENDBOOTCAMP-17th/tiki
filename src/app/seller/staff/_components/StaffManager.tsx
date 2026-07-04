"use client";
import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteStaff, removeStaff } from "@/lib/staff/actions";

interface EventOption {
  event_id: string;
  title: string;
}

interface StaffRow {
  staff_id: string;
  event_id: string;
  event_title: string;
  staff_name: string;
  staff_email: string;
  status: string;
  created_at: string;
}

const INVITE_MESSAGES: Record<string, string> = {
  ok: "초대를 보냈습니다.",
  user_not_found: "해당 이메일로 가입된 회원이 없습니다.",
  already_exists: "이미 초대했거나 배정된 스태프입니다.",
  self_invite: "본인은 초대할 수 없습니다.",
  invalid_role: "판매자·관리자 계정은 스태프로 초대할 수 없습니다.",
  forbidden: "권한이 없습니다.",
  error: "초대에 실패했습니다. 다시 시도해 주세요.",
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "수락 대기",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  accepted: {
    label: "배정됨",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  },
  rejected: {
    label: "거절됨",
    className: "bg-gray-100 text-gray-500 dark:bg-[#2c2d30] dark:text-gray-400",
  },
};

export default function StaffManager({
  events,
  staffList,
}: {
  events: EventOption[];
  staffList: StaffRow[];
}) {
  const [eventId, setEventId] = useState(events[0]?.event_id ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleInvite = () => {
    if (!eventId || !email.trim()) return;
    startTransition(async () => {
      setMessage(null);
      const res = await inviteStaff(eventId, email.trim());
      setMessage({
        ok: res.code === "ok",
        text: INVITE_MESSAGES[res.code] ?? INVITE_MESSAGES.error,
      });
      if (res.code === "ok") setEmail("");
    });
  };

  const handleRemove = (staffId: string, name: string) => {
    if (!window.confirm(`${name}님의 배정을 해제할까요?`)) return;
    startTransition(async () => {
      const res = await removeStaff(staffId);
      if (res.code !== "ok") {
        setMessage({ ok: false, text: "해제에 실패했습니다." });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 초대 폼 */}
      <div className="rounded-xl border border-gray-200 p-4 dark:border-[#3c4043]">
        <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          스태프 초대
        </p>
        <div className="flex flex-wrap gap-2">
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none dark:border-[#3c4043] dark:bg-[#242528] dark:text-gray-50"
          >
            {events.length === 0 ? (
              <option value="">등록된 공연이 없습니다</option>
            ) : (
              events.map((e) => (
                <option key={e.event_id} value={e.event_id}>
                  {e.title}
                </option>
              ))
            )}
          </select>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="초대할 회원 이메일"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none dark:border-[#3c4043] dark:bg-[#242528] dark:text-gray-50"
          />
          <button
            type="button"
            disabled={isPending || !eventId || !email.trim()}
            onClick={handleInvite}
            className="flex items-center gap-1.5 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"
          >
            <UserPlus size={15} />
            초대
          </button>
        </div>
        {message && (
          <p
            className={`mt-2 text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* 스태프 목록 */}
      <div className="rounded-xl border border-gray-200 dark:border-[#3c4043]">
        <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-[#3c4043] dark:text-gray-50">
          스태프 현황
        </p>
        {staffList.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            초대한 스태프가 없습니다
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-[#3c4043]">
            {staffList.map((s) => {
              const badge = STATUS_BADGES[s.status] ?? STATUS_BADGES.pending;
              return (
                <li
                  key={s.staff_id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                      {s.staff_name}
                      <span className="ml-2 text-xs text-gray-400">
                        {s.staff_email}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {s.event_title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRemove(s.staff_id, s.staff_name)}
                      className="rounded p-1 text-gray-400 transition hover:text-red-600 disabled:opacity-50"
                      aria-label="배정 해제"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
