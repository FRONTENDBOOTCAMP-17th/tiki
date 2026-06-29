"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import type { Grade } from "@/types/domain/event";
import type { SeatLayoutForBooking } from "@/lib/event/queries";

interface SeatSelectionModalProps {
  open: boolean;
  onClose: () => void;
  layout: SeatLayoutForBooking;
  grades: Grade[]; // 좌석이 매핑된 등급만 (탭으로 노출)
  slotId: string;
  selectedGradeId: string | null;
  selectedSeatIds: Set<string>;
  onSelectGrade: (gradeId: string) => void;
  onToggleSeat: (seatId: string) => void;
}

// 좌석 선택 모달: 등급 탭 + 좌석 캔버스를 한 곳에서 처리한다.
// 등급을 먼저 안 고르고 좌석을 바로 클릭하면, 그 좌석의 등급이 자동으로 선택된다.
// 한 주문은 등급 하나만 가능하므로, 다른 등급으로 바꾸면 선택된 좌석은 초기화된다.
export default function SeatSelectionModal({
  open,
  onClose,
  layout,
  grades,
  slotId,
  selectedGradeId,
  selectedSeatIds,
  onSelectGrade,
  onToggleSeat,
}: SeatSelectionModalProps) {
  const [occupiedSeatIds, setOccupiedSeatIds] = useState<Set<string>>(new Set());

  // 모달이 열릴 때마다 좌석 점유 상태를 새로 가져온다 (닫혀있는 동안 다른 사람이 선점했을 수 있음)
  useEffect(() => {
    if (!open) return;
    let active = true;
    const supabase = createClient();
    supabase
      .from("order_seat")
      .select("seat_id")
      .eq("slot_id", slotId)
      .then(({ data }) => {
        if (!active) return;
        setOccupiedSeatIds(new Set((data ?? []).map((row) => row.seat_id)));
      });
    return () => {
      active = false;
    };
  }, [slotId, open]);

  function handleSeatClick(seat: { seatId: string; gradeId: string | null }) {
    if (!seat.gradeId || occupiedSeatIds.has(seat.seatId)) return;
    if (!selectedGradeId) {
      onSelectGrade(seat.gradeId);
      onToggleSeat(seat.seatId);
      return;
    }
    if (seat.gradeId !== selectedGradeId) return; // 다른 등급 좌석은 선택 불가
    onToggleSeat(seat.seatId);
  }

  function handleSelectGradeTab(gradeId: string) {
    if (gradeId !== selectedGradeId) {
      // 등급을 바꾸면 이전에 고른 좌석은 무효이므로 초기화
      [...selectedSeatIds].forEach((seatId) => onToggleSeat(seatId));
    }
    onSelectGrade(gradeId);
  }

  const selectedLabels = layout.seats
    .filter((seat) => selectedSeatIds.has(seat.seatId))
    .map((seat) => seat.label);

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <Modal.Header>좌석 선택</Modal.Header>
      <Modal.Body>
        <div className="flex flex-wrap gap-2">
          {grades.map((g) => {
            const active = selectedGradeId === g.gradeId;
            const disabled = !!selectedGradeId && !active;
            return (
              <button
                key={g.gradeId}
                type="button"
                onClick={() => handleSelectGradeTab(g.gradeId)}
                disabled={disabled}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary-500 bg-primary-100 text-primary-900"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {g.name} · {g.price.toLocaleString()}원
              </button>
            );
          })}
        </div>

        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-gray-700 text-xs font-medium text-white"
            style={{
              left: `${layout.stage.x}%`,
              top: `${layout.stage.y}%`,
              width: `${layout.stage.width}%`,
              height: `${layout.stage.height}%`,
            }}
          >
            무대
          </div>
          {layout.seats.map((seat) => {
            const inGrade = !selectedGradeId || seat.gradeId === selectedGradeId;
            const isOccupied = occupiedSeatIds.has(seat.seatId);
            const selected = selectedSeatIds.has(seat.seatId);
            const disabled = !inGrade || isOccupied || !seat.gradeId;

            return (
              <button
                key={seat.seatId}
                type="button"
                title={seat.label}
                disabled={disabled}
                onClick={() => handleSeatClick(seat)}
                className={cn(
                  "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border transition-transform",
                  !inGrade && "border-gray-200 bg-gray-100 opacity-30",
                  inGrade && isOccupied && "border-gray-300 bg-gray-300",
                  inGrade &&
                    !isOccupied &&
                    !selected &&
                    "border-primary-400 bg-white hover:scale-110",
                  selected &&
                    "scale-125 border-primary-700 bg-primary-500 ring-2 ring-primary-300",
                )}
                style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-primary-400 bg-white" />
            선택가능
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-primary-700 bg-primary-500" />
            선택됨
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-gray-300 bg-gray-300" />
            판매됨
          </span>
        </div>

        <p className="text-sm text-gray-600">
          {selectedLabels.length === 0
            ? "좌석을 선택해주세요."
            : `선택한 좌석: ${selectedLabels.join(", ")} (${selectedLabels.length}석)`}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" fullWidth onClick={onClose}>
          선택 완료
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
