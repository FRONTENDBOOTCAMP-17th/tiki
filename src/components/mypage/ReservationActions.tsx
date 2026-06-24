"use client";
import { useState } from "react";
import Link from "next/link";
import { QrCode, Share2 } from "lucide-react";
import type { Reservation } from "./ReservationCard";
import QrTicketModal from "./QrTicketModal";
import ShareTicketModal from "./ShareTicketModal";
import CancelledDetailModal from "./CancelledDetailModal";
import { cancelReservation } from "@/app/action";

export default function ReservationActions({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [modal, setModal] = useState<"none" | "qr" | "share" | "detail">(
    "none",
  );
  const [pending, setPending] = useState(false);

  const handleCancel = async () => {
    if (!confirm("예매를 취소하시겠어요?")) return;
    setPending(true);
    const result = await cancelReservation(reservation.id);
    setPending(false);
    if (result?.error) alert(result.error);
  };

  if (reservation.status === "cancelled") {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal("detail")}
            className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex-none"
          >
            상세보기
          </button>
          <Link
            href={`/${reservation.eventId}`}
            className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 lg:flex-none"
          >
            재예매
          </Link>
        </div>

        <CancelledDetailModal
          open={modal === "detail"}
          onClose={() => setModal("none")}
          reservation={reservation}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setModal("qr")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex-none"
        >
          <QrCode size={16} />
          QR 티켓 보기
        </button>
        {reservation.count > 1 && (
          <button
            type="button"
            onClick={() => setModal("share")}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            <Share2 size={16} />
            <span className="hidden lg:inline">친구 </span>공유
          </button>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="shrink-0 rounded-lg border border-danger-200 px-3 py-2 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-50"
        >
          취소<span className="hidden lg:inline"> 신청</span>
        </button>
      </div>

      <QrTicketModal
        open={modal === "qr"}
        onClose={() => setModal("none")}
        reservation={reservation}
      />
      <ShareTicketModal
        open={modal === "share"}
        onClose={() => setModal("none")}
        reservation={reservation}
      />
    </>
  );
}
