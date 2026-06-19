"use client";
import { Calendar, MapPin, Ticket } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import type { Reservation } from "./ReservationCard";

export default function QrTicketModal({
  open,
  onClose,
  reservation: r,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>QR 티켓</Modal.Header>
      <Modal.Body>
        {/* 공연 정보 */}
        <div className="flex flex-col gap-1.5 rounded-xl bg-primary-100 p-4">
          <p className="font-bold text-gray-900">{r.title}</p>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} className="shrink-0 text-gray-400" />
            {r.date} {r.time}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            {r.place}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Ticket size={14} className="shrink-0 text-gray-400" />
            {r.seat} · {r.count}매
          </span>
        </div>

        {/* QR 코드 (placeholder — 나중에 qrcode 라이브러리로 실제 생성) */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-6">
          <div className="size-40 rounded-lg border-2 border-gray-900" />
          <p className="text-sm text-gray-500">QR 코드</p>
          <p className="text-xs text-gray-400">{r.orderNo}</p>
        </div>

        {/* 안내 */}
        <div className="rounded-lg bg-secondary-100 px-4 py-3 text-center text-sm text-secondary-700">
          현장에서 이 QR 코드를 스캔하여 입장하세요
        </div>

        {/* 예매번호 / 상태 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">예매번호</p>
            <p className="font-medium text-gray-900">{r.orderNo}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">상태</p>
            <p className="font-medium text-primary-600">{r.statusLabel}</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" className="flex-1" onClick={onClose}>
          닫기
        </Button>
        <button
          type="button"
          className="flex-1 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          저장하기
        </button>
      </Modal.Footer>
    </Modal>
  );
}
