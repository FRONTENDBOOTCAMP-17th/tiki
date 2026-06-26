"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Ticket, UserCheck, Star } from "lucide-react";
import ReceivedQrModal from "./ReceivedQrModal";

export interface ReceivedTicket {
  share_id: string;
  order_id: string;
  event_id: string;
  event_title: string | null;
  venue_name: string | null;
  venue_address: string | null;
  slot_date: string | null;
  slot_time: string | null;
  grade_name: string | null;
  sharer_name: string | null;
  quantity: number;
  is_ended: boolean;
  created_at: string;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${DAYS[d.getDay()]})`;
}

export default function ReceivedTicketCard({
  ticket: t,
}: {
  ticket: ReceivedTicket;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const place = [t.venue_address, t.venue_name].filter(Boolean).join(" ");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">{t.event_title}</h3>
          <span className="shrink-0 rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-700">
            받은 티켓
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          {formatDate(t.slot_date)}
        </span>
        {t.slot_time && (
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="shrink-0 text-gray-400" />
            {t.slot_time.slice(0, 5)}
          </span>
        )}
        {place && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            {place}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="flex flex-col gap-0.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Ticket size={13} />
            {t.grade_name} · {t.quantity}매
          </span>
          <span className="flex items-center gap-1">
            <UserCheck size={13} />
            {t.sharer_name}님이 공유
          </span>
        </div>
        <div className="flex items-center gap-2">
          {t.is_ended && (
            <Link
              href={`/${t.event_id}#reviews`}
              className="flex items-center gap-1.5 rounded-lg border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
            >
              <Star size={15} />
              리뷰 쓰기
            </Link>
          )}
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            입장하기
          </button>
        </div>
      </div>

      <ReceivedQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        ticket={t}
      />
    </div>
  );
}
