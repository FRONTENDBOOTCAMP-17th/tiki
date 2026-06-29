"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { SeatLayoutForBooking } from "@/lib/event/queries";

interface SeatPickerProps {
  layout: SeatLayoutForBooking;
  slotId: string;
  gradeId: string; // 현재 선택된 등급 — 이 등급 좌석만 선택 가능
  selectedSeatIds: Set<string>;
  onToggle: (seatId: string) => void;
}

// 구매자용 좌석 선택 캔버스. 판매자 빌더(SeatLayoutBuilder)와 같은 좌표 데이터를
// 읽기 전용으로 그리고, 클릭으로만 선택한다 (드래그 이동 없음).
export default function SeatPicker({
  layout,
  slotId,
  gradeId,
  selectedSeatIds,
  onToggle,
}: SeatPickerProps) {
  const [occupiedSeatIds, setOccupiedSeatIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 좌석 점유 상태는 회차(slot)마다 다르다. 부모가 key={slotId}로 이 컴포넌트를 리마운트해줘서
  // slotId가 바뀔 때마다 loading 초기값(true)부터 다시 시작한다.
  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("order_seat")
      .select("seat_id")
      .eq("slot_id", slotId)
      .then(({ data }) => {
        if (!active) return;
        setOccupiedSeatIds(new Set((data ?? []).map((row) => row.seat_id)));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slotId]);

  return (
    <div className="flex flex-col gap-2">
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
          const inGrade = seat.gradeId === gradeId;
          const isOccupied = occupiedSeatIds.has(seat.seatId);
          const selected = selectedSeatIds.has(seat.seatId);
          const disabled = !inGrade || isOccupied || loading;

          return (
            <button
              key={seat.seatId}
              type="button"
              title={seat.label}
              disabled={disabled}
              onClick={() => onToggle(seat.seatId)}
              className={cn(
                "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-transform",
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
    </div>
  );
}
