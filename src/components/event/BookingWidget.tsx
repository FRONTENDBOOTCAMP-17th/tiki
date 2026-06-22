"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal/Modal";
import { Slot, Grade } from "@/types/domain/event";
import BookingPanel, { BookingSelection } from "./BookingPanel";

interface BookingWidgetProps {
  eventId: string;
  slots: Slot[];
  grades: Grade[];
  soldOut?: boolean; // event.status 마감 시 예매 차단
}

export default function BookingWidget({
  eventId,
  soldOut = false,
  ...panelProps
}: BookingWidgetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 주문 생성(POST /api/orders) 후 결제 페이지로 이동.
  // 서버 컴포넌트에서 함수를 props 로 내릴 수 없어 예매 로직을 위젯이 직접 소유한다.
  async function createOrder(selection: BookingSelection) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        slotId: selection.slotId,
        ticketGradeId: selection.gradeId,
        quantity: selection.quantity,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "예매 처리에 실패했습니다.");
    }
    return json.data as { orderId: string };
  }

  async function handleBookNow(selection: BookingSelection) {
    try {
      const { orderId } = await createOrder(selection);
      router.push(`/payment/${orderId}`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "예매 처리에 실패했습니다.",
      );
    }
  }

  // 마감(매진) 시 예매 UI 대신 안내
  if (soldOut) {
    return (
      <>
        <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <p className="font-bold text-danger-600">매진되었습니다</p>
          </div>
        </aside>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 lg:hidden">
          <div className="w-full rounded-md bg-gray-300 py-3 text-center font-medium text-white">
            매진되었습니다
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 데스크탑: 우측 sticky 패널.
          max-h 에서 10rem 은 상단 헤더(로고/카테고리)+목록버튼 높이만큼 빼서
          스크롤 0 위치에서도 패널 바닥(합계+버튼)이 화면 안에 들어오게 함. */}
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <div className="flex max-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <BookingPanel {...panelProps} onBookNow={handleBookNow} />
        </div>
      </aside>

      {/* 모바일/태블릿 : 하단에 살짝 보이는 트리거 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
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
