"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, Share2, Star } from "lucide-react";
import useToast from "@/hooks/useToast";
import type { Reservation } from "./ReservationCard";
import QrTicketModal from "./QrTicketModal";
import ShareTicketModal from "./ShareTicketModal";
import ReservationDetailModal from "./ReservationDetailModal";
import Dialog from "@/components/modal/Dialog";
import { cancelReservation } from "@/app/action";

export default function ReservationActions({
  reservation,
}: {
  reservation: Reservation;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [modal, setModal] = useState<
    "none" | "qr" | "share" | "detail" | "cancel"
  >("none");
  const [pending, setPending] = useState(false);

  const handleCancel = async () => {
    setPending(true);
    const result = await cancelReservation(reservation.id);
    setPending(false);
    setModal("none");
    if (result?.error) {
      error(result.error);
      return;
    }
    success("예매가 취소되었습니다");
    router.refresh(); // 서버 컴포넌트 재검증 → 카드 상태 즉시 갱신
  };

  // ① 예매 취소 → 상세보기 + 재예매
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
            className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2 text-sm font-medium text-primary-900 transition hover:opacity-90 lg:flex-none"
          >
            재예매
          </Link>
        </div>

        <ReservationDetailModal
          open={modal === "detail"}
          onClose={() => setModal("none")}
          reservation={reservation}
        />
      </>
    );
  }

  // ② 공연 끝난 예매확정 → 상세보기 + 리뷰 쓰기
  if (reservation.isEnded) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal("detail")}
            className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex-none"
          >
            상세 보기
          </button>
          <Link
            href={`/${reservation.eventId}#reviews`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2 text-sm font-medium text-primary-900 transition hover:opacity-90 lg:flex-none"
          >
            <Star size={16} />
            리뷰 쓰기
          </Link>
        </div>

        <ReservationDetailModal
          open={modal === "detail"}
          onClose={() => setModal("none")}
          reservation={reservation}
        />
      </>
    );
  }

  // ③ 예매확정 + 공연 전 → QR / 공유 / 취소
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
          onClick={() => setModal("cancel")}
          className="shrink-0 rounded-lg border border-danger-200 px-3 py-2 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
        >
          예매 취소<span className="hidden lg:inline"> 하기</span>
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
      <Dialog
        open={modal === "cancel"}
        onClose={() => setModal("none")}
        title="예매 취소"
        description="예매를 취소하시겠어요? 취소 후에는 되돌릴 수 없습니다."
        confirmText={pending ? "취소 중..." : "예매 취소"}
        confirmVariant="danger"
        cancelText="닫기"
        cancelVariant="outline"
        onConfirm={handleCancel}
      />
    </>
  );
}
