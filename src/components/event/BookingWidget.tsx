"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { todayKST } from "@/lib/date";
import Modal from "@/components/modal/Modal";
import { Slot, Grade } from "@/types/domain/event";
import type { SeatLayoutForBooking } from "@/lib/event/queries";
import BookingPanel, { BookingSelection } from "./BookingPanel";
import useToast from "@/hooks/useToast";

interface BookingWidgetProps {
  eventId: string;
  slots: Slot[];
  grades: Grade[];
  seatLayout?: SeatLayoutForBooking | null;
  soldOut?: boolean;
  suspended?: boolean; // 관리자 예매 일시중지
  loggedIn?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "로그인이 필요합니다.",
  "event not found": "공연 정보를 찾을 수 없습니다.",
  "event not available": "현재 예매가 불가한 공연입니다.",
  "not enough tickets": "잔여 좌석이 부족합니다.",
  "slot is closed": "마감된 회차입니다.",
  "slot not found": "회차 정보를 찾을 수 없습니다.",
};

function toKoreanError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  return ERROR_MESSAGES[msg] ?? msg ?? "예매 처리에 실패했습니다.";
}

// 예매 불가 상태(예매 종료/회차 없음/판매 중지): 예매 박스 형태는 유지하고 버튼만 비활성
function UnavailableBox({ label }: { label: string }) {
  return (
    <>
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
          <h2 className="text-lg font-bold text-mirage dark:text-gray-50">
            예매하기
          </h2>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-md bg-gray-100 py-3 text-sm font-medium text-gray-400 dark:bg-[#303134] dark:text-gray-500"
          >
            {label}
          </button>
        </div>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 dark:border-[#3c4043] dark:bg-[#242528] lg:hidden">
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-md bg-gray-200 py-3 text-sm font-medium text-gray-500 dark:bg-[#303134] dark:text-gray-500"
        >
          {label}
        </button>
      </div>
    </>
  );
}

export default function BookingWidget({
  eventId,
  soldOut = false,
  suspended = false,
  loggedIn = false,
  ...panelProps
}: BookingWidgetProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const today = todayKST();
  const hasBookableSlot = panelProps.slots.some(
    (slot) => !slot.isClosed && slot.date >= today,
  );
  // 매진(등급 잔여 0)은 배너로 막지 않고, 패널에서 등급별로 "매진" 표시한다.
  // 예매 종료(soldOut)거나 남은 회차가 아예 없을 때만 안내로 대체.
  const unavailable = soldOut || !hasBookableSlot;

  // 주문 생성 후 결제 페이지로 이동.
  // 좌석을 골랐으면(seatIds 존재) 좌석 단위 RPC를 쓰는 /api/orders/seats로,
  // 아니면 기존 수량 기반 /api/orders로 분기.
  // 서버 컴포넌트에서 함수를 props 로 내릴 수 없어 예매 로직을 위젯이 직접 소유한다.
  async function createOrder(selection: BookingSelection) {
    const useSeatOrder = !!selection.seatIds && selection.seatIds.length > 0;
    const res = await fetch(useSeatOrder ? "/api/orders/seats" : "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        slotId: selection.slotId,
        ticketGradeId: selection.gradeId,
        quantity: selection.quantity,
        seatIds: selection.seatIds,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "예매 처리에 실패했습니다.");
    }
    return json.data as { orderId: string };
  }

  function redirectToLogin() {
    router.push(`/login?next=${encodeURIComponent(`/${eventId}`)}`);
  }

  async function handleBookNow(selection: BookingSelection) {
    if (!loggedIn) {
      redirectToLogin();
      return;
    }
    try {
      const { orderId } = await createOrder(selection);
      router.push(`/payment/${orderId}`);
    } catch (error) {
      toast.error(toKoreanError(error));
    }
  }

  if (suspended) {
    return <UnavailableBox label="판매 일시 중지" />;
  }

  // 예매 종료 / 남은 회차 없음 → 버튼만 비활성
  if (unavailable) {
    return (
      <UnavailableBox label={soldOut ? "예매 종료" : "예매 가능한 회차 없음"} />
    );
  }

  return (
    <>
      {/* 데스크탑: 우측 sticky 패널.
          max-h 에서 10rem 은 상단 헤더(로고/카테고리)+목록버튼 높이만큼 빼서
          스크롤 0 위치에서도 패널 바닥(합계+버튼)이 화면 안에 들어오게 함. */}
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
          <BookingPanel {...panelProps} onBookNow={handleBookNow} />
        </div>
      </aside>

      {/* 모바일/태블릿 : 하단에 살짝 보이는 트리거 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 dark:border-[#3c4043] dark:bg-[#242528] lg:hidden">
        <button
          type="button"
          onClick={() => (loggedIn ? setOpen(true) : redirectToLogin())}
          className="flex w-full items-center justify-center gap-1 rounded-md bg-primary-700 py-3 font-medium text-white"
        >
          <ChevronUp className="h-4 w-4" />
          예매하기
        </button>
      </div>

      {/* 모바일/태블릿 : 위로 슬라이드되는 시트 (데스크탑과 구성 동일) */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        position="sheet"
        className="max-h-[95vh] animate-slide-in-from-bottom"
      >
        {/* Modal.Body 대신 BookingPanel 을 직접 → 시트 높이를 채워 푸터 버튼 고정 */}
        <BookingPanel {...panelProps} onBookNow={handleBookNow} />
      </Modal>
    </>
  );
}
