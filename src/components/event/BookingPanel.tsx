"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "@/components/Button";
import { cn } from "@/lib/cn";
import { todayKST } from "@/lib/date";
import { Slot, Grade } from "@/types/domain/event";
import type { SeatLayoutForBooking } from "@/lib/event/queries";
import BookingCalendar from "./BookingCalendar";
import SeatPicker from "./SeatPicker";

const FEE_RATE = 0.05; // 수수료 5%
const LOW_STOCK = 10; // 잔여 좌석 마감임박 기준
const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

export interface BookingSelection {
  slotId: string;
  gradeId: string;
  quantity: number;
  seatIds?: string[]; // 좌석 배치도가 있는 이벤트만 채워짐
}

interface BookingPanelProps {
  slots: Slot[];
  grades: Grade[]; // 이벤트 등급
  seatLayout?: SeatLayoutForBooking | null; // 없으면(null) 기존 수량 기반 예매로 동작
  onBookNow: (selection: BookingSelection) => void;
}

function weekdayOf(date: string) {
  return WEEKDAY_KO[new Date(`${date}T00:00:00`).getDay()];
}

export default function BookingPanel({
  slots,
  grades,
  seatLayout,
  onBookNow,
}: BookingPanelProps) {
  const today = todayKST();

  // 회차 있는 날짜 (마감·지난 날짜 제외)
  const availableDates = useMemo(
    () =>
      new Set(
        slots
          .filter((slot) => !slot.isClosed && slot.date >= today)
          .map((slot) => slot.date),
      ),
    [slots, today],
  );
  const firstDate = useMemo(
    () => [...availableDates].sort()[0],
    [availableDates],
  );

  // 가장 가까운 예매 가능일을 기본 선택
  const [month, setMonth] = useState<Date>(() =>
    firstDate ? new Date(`${firstDate}T00:00:00`) : new Date(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    firstDate ?? null,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

  // 선택 날짜의 회차 (시간순)
  const daySlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, selectedDate],
  );

  const grade = grades.find((g) => g.gradeId === selectedGradeId);

  // 이 등급에 배치도가 있으면(좌석 1개 이상 매핑됨) 수량 입력 대신 좌석 클릭으로 수량이 정해진다.
  const hasSeatMap = !!seatLayout && seatLayout.seats.some((s) => s.gradeId === selectedGradeId);

  const maxQuantity = grade?.quantity ?? 1;
  const safeQuantity = hasSeatMap
    ? selectedSeatIds.size
    : grade
      ? Math.min(quantity, maxQuantity)
      : quantity;
  const subtotal = grade ? grade.price * safeQuantity : 0;
  const fee = Math.round(subtotal * FEE_RATE);
  const total = subtotal + fee;
  const ready = hasSeatMap
    ? !!grade && selectedSlotId !== null && safeQuantity > 0
    : !!grade && selectedSlotId !== null && grade.quantity >= safeQuantity;

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlotId(null); // 날짜 바뀌면 회차 초기화
    setSelectedSeatIds(new Set()); // 회차별로 점유 상태가 다르므로 좌석 선택도 초기화
  }

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
    setSelectedSeatIds(new Set());
  }

  function handleSelectGrade(gradeId: string) {
    setSelectedGradeId(gradeId);
    setQuantity(1);
    setSelectedSeatIds(new Set());
  }

  function toggleSeat(seatId: string) {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }

  function submit(handler: (selection: BookingSelection) => void) {
    if (!selectedSlotId || !selectedGradeId) return;
    handler({
      slotId: selectedSlotId,
      gradeId: selectedGradeId,
      quantity: safeQuantity,
      seatIds: hasSeatMap ? [...selectedSeatIds] : undefined,
    });
  }

  // 헤더 + 스크롤영역 + 고정푸터 : 캘린더가 커도 합계/예매버튼은 항상 보이게.
  // 높이 제한은 부모(데스크탑 카드 / 모바일 시트)가 줌.
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 px-6 pt-4 pb-2 text-lg font-bold text-mirage lg:pt-6">
        예매하기
      </h2>

      {/* 스크롤 영역 : 날짜/회차/등급/수량 */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-4">
        {/* 1. 날짜 및 회차 선택 */}
        <section className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">
            1. 날짜 및 회차 선택
          </p>
          <BookingCalendar
            month={month}
            selectedDate={selectedDate}
            availableDates={availableDates}
            minDate={today}
            onMonthChange={setMonth}
            onSelectDate={handleSelectDate}
          />

          {/* 선택 날짜의 회차 */}
          {selectedDate &&
            (daySlots.length === 0 ? (
              <p className="text-sm text-gray-400">
                해당 날짜에 회차가 없습니다.
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {daySlots.map((s) => {
                  const active = selectedSlotId === s.slotId;
                  return (
                    <button
                      key={s.slotId}
                      type="button"
                      disabled={s.isClosed}
                      onClick={() => handleSelectSlot(s.slotId)}
                      className={cn(
                        "flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2 text-sm",
                        active
                          ? "border-primary-500 bg-primary-100 text-primary-800"
                          : "border-gray-200 text-gray-600",
                        s.isClosed && "opacity-40",
                      )}
                    >
                      <span className="text-xs">{weekdayOf(s.date)}</span>
                      <span className="font-semibold">
                        {Number(s.date.slice(5, 7))}/
                        {Number(s.date.slice(8, 10))}
                      </span>
                      <span className="text-xs">{s.startTime.slice(0, 5)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
        </section>

        {/* 2. 좌석 등급 */}
        <section className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">2. 좌석 등급</p>
          <div className="flex flex-col gap-2">
            {grades.map((g) => {
              const active = selectedGradeId === g.gradeId;
              const soldOut = g.quantity <= 0;
              return (
                <button
                  key={g.gradeId}
                  type="button"
                  disabled={soldOut}
                  onClick={() => handleSelectGrade(g.gradeId)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-primary-500 bg-primary-100 text-primary-900"
                      : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50",
                    soldOut &&
                      "cursor-not-allowed bg-gray-50 text-gray-300 hover:border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{g.name}</span>
                      {soldOut && (
                        <span className="rounded-full bg-danger-100 px-2 py-0.5 text-xs font-medium text-danger-600">
                          매진
                        </span>
                      )}
                    </span>
                    {!soldOut && (
                      <span
                        className={cn(
                          "text-xs",
                          g.quantity <= LOW_STOCK
                            ? "font-medium text-danger-500"
                            : "text-gray-400",
                        )}
                      >
                        잔여 {g.quantity.toLocaleString()}석
                        {g.quantity <= LOW_STOCK && " · 마감임박"}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold">
                    {g.price.toLocaleString()}원
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. 좌석 선택 (배치도가 있는 등급) 또는 수량 (배치도가 없는 기존 방식) */}
        {seatLayout && hasSeatMap && grade && selectedSlotId ? (
          <section className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">
              3. 좌석 선택 ({safeQuantity}석 선택됨)
            </p>
            <SeatPicker
              key={selectedSlotId}
              layout={seatLayout}
              slotId={selectedSlotId}
              gradeId={grade.gradeId}
              selectedSeatIds={selectedSeatIds}
              onToggle={toggleSeat}
            />
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">3. 수량</p>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <span className="text-sm text-gray-600">매수</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="수량 감소"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!grade || safeQuantity <= 1}
                  className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:border-gray-200 disabled:text-gray-300"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold">
                  {safeQuantity}
                </span>
                <button
                  type="button"
                  aria-label="수량 증가"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={!grade || safeQuantity >= maxQuantity}
                  className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:border-gray-200 disabled:text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 고정 푸터 : 합계 + 버튼 (스크롤 없이 항상 보임) */}
      <div className="shrink-0 border-t border-gray-100 px-6 py-3 lg:py-5">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>티켓 금액 ({safeQuantity}매)</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>수수료 (5%)</span>
            <span>{fee.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>합계</span>
            <span className="text-primary-700">{total.toLocaleString()}원</span>
          </div>
        </div>

        <div className="mt-3">
          <Button
            variant="primary"
            fullWidth
            disabled={!ready}
            onClick={() => submit(onBookNow)}
          >
            바로 예매
          </Button>
        </div>
      </div>
    </div>
  );
}
