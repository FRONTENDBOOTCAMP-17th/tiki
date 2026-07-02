"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@/components/modal/Dialog";
import useToast from "@/hooks/useToast";
import { revokeTicketShare } from "@/app/action";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-warning-100 text-warning-700" },
  accepted: { label: "수락됨", cls: "bg-primary-100 text-primary-700" },
  rejected: { label: "거절됨", cls: "bg-danger-100 text-danger-600" },
  cancelled: { label: "회수됨", cls: "bg-gray-100 text-gray-500" },
};

export interface SentTicket {
  share_id: string;
  event_title: string | null;
  slot_date: string | null;
  slot_time: string | null;
  shared_with_name: string | null;
  quantity: number;
  status: string;
  created_at: string;
}

function formatShareDate(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function SentTicketCard({ ticket }: { ticket: SentTicket }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const status = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.pending;
  const canRevoke = ticket.status === "pending" || ticket.status === "accepted";

  const handleRevoke = async () => {
    setPending(true);
    const result = await revokeTicketShare(ticket.share_id);
    setPending(false);
    setConfirmOpen(false);
    if (result?.error) {
      error(result.error);
      return;
    }
    success("공유를 회수했습니다");
    router.refresh();
  };

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="size-14 shrink-0 rounded-lg bg-gradient-to-br from-accent-200 to-primary-200" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900">{ticket.event_title}</p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}
          >
            {status.label}
          </span>
        </div>
        {ticket.slot_date && (
          <p className="mt-1 text-sm text-gray-500">
            {formatShareDate(ticket.slot_date)}
            {ticket.slot_time ? ` ${ticket.slot_time.slice(0, 5)}` : ""}
          </p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">
          공유 대상: {ticket.shared_with_name} · {ticket.quantity}매
        </p>
        <p className="text-xs text-gray-400">
          공유일: {formatShareDate(ticket.created_at)}
        </p>

        {canRevoke && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-2 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50"
          >
            공유 회수
          </button>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="공유 회수"
        description={`${ticket.shared_with_name}님에게 공유한 티켓을 회수하시겠어요? 상대방의 티켓이 사라지며 되돌릴 수 없습니다.`}
        confirmText={pending ? "회수 중..." : "공유 회수"}
        confirmVariant="danger"
        cancelText="닫기"
        cancelVariant="outline"
        onConfirm={handleRevoke}
      />
    </div>
  );
}
