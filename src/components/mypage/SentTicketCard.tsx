const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  accepted: { label: "수락됨", cls: "bg-primary-100 text-primary-700" },
  rejected: { label: "거절됨", cls: "bg-danger-100 text-danger-600" },
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
  const status = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.pending;

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
      </div>
    </div>
  );
}
