"use client";
import { QRCodeCanvas } from "qrcode.react";
import { Calendar, MapPin, Ticket } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import type { ReceivedTicket } from "./ReceivedTicketCard";

export default function ReceivedQrModal({
  open,
  onClose,
  ticket: t,
}: {
  open: boolean;
  onClose: () => void;
  ticket: ReceivedTicket;
}) {
  const place = [t.venue_address, t.venue_name].filter(Boolean).join(" ");
  // QR에 담을 값 (입장 식별용)
  const qrValue = `TIKI-SHARE-${t.share_id}`;

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>QR 티켓 (받은 티켓)</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-1.5 rounded-xl bg-primary-100 p-4">
          <p className="font-bold text-gray-900">{t.event_title}</p>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} className="shrink-0 text-gray-400" />
            {t.slot_date} {t.slot_time?.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            {place}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Ticket size={14} className="shrink-0 text-gray-400" />
            {t.grade_name} · {t.quantity}매
          </span>
        </div>

        {/* 실제 QR 코드 */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-6">
          <div className="rounded-lg bg-white p-3">
            <QRCodeCanvas value={qrValue} size={160} level="M" />
          </div>
          <p className="text-xs text-gray-400">
            {t.share_id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="rounded-lg bg-secondary-100 px-4 py-3 text-center text-sm text-secondary-700">
          {t.sharer_name}님이 공유한 티켓입니다. 현장에서 스캔하여 입장하세요
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
