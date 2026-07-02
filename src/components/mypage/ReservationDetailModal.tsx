"use client";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import type { Reservation } from "./ReservationCard";

export default function ReservationDetailModal({
  open,
  onClose,
  reservation: r,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
}) {
  const isCancelled = r.status === "cancelled";

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>예매 상세</Modal.Header>
      <Modal.Body>
        <div
          className={`flex flex-col gap-1.5 rounded-xl p-4 ${
            isCancelled ? "bg-danger-100" : "bg-primary-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{r.title}</p>
            <span
              className={`rounded-full bg-white px-2 py-0.5 text-xs font-medium ${
                isCancelled ? "text-danger-600" : "text-primary-700"
              }`}
            >
              {r.statusLabel}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} className="shrink-0 text-gray-400" />
            {r.date}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock size={14} className="shrink-0 text-gray-400" />
            {r.time}
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

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">예매번호</p>
            <p className="font-medium text-gray-900">{r.orderNo}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">예매일</p>
            <p className="font-medium text-gray-900">{r.bookedAt}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">결제 금액</p>
            <p className="font-medium text-gray-900">
              {r.price.toLocaleString()}원
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">상태</p>
            <p
              className={`font-medium ${
                isCancelled ? "text-danger-600" : "text-primary-700"
              }`}
            >
              {r.statusLabel}
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
