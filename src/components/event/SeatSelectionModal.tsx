"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
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
  // 다른 사람이 지금 이 모달에서 같이 선택 중인 좌석 (DB에 확정된 건 아니고 실시간 표시용)
  const [othersHeldSeatIds, setOthersHeldSeatIds] = useState<Set<string>>(new Set());
  const clientIdRef = useRef(crypto.randomUUID());
  const channelRef = useRef<RealtimeChannel | null>(null);
  // clientId -> {seatIds, 마지막으로 소식 들은 시각}. Presence의 sync/leave 이벤트가
  // 안 터지는 경우가 있어서(Supabase Realtime 쪽 이슈), 자동 leave 감지에 의존하지 않고
  // 직접 메시지(hold/release)를 주고받고, 일정 시간 소식이 없으면 스스로 정리한다.
  const othersRef = useRef<Map<string, { seatIds: string[]; lastSeenAt: number }>>(new Map());

  const HEARTBEAT_MS = 4000;
  const STALE_MS = 10000;

  function recomputeOthersHeld() {
    const now = Date.now();
    const ids = new Set<string>();
    for (const [clientId, entry] of othersRef.current) {
      if (now - entry.lastSeenAt > STALE_MS) {
        othersRef.current.delete(clientId);
        continue;
      }
      entry.seatIds.forEach((id) => ids.add(id));
    }
    setOthersHeldSeatIds(ids);
  }

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

  // 같은 회차의 좌석 모달을 보고 있는 다른 사용자들과 "지금 고르고 있는 좌석"을
  // Broadcast로 실시간 공유한다. 좌석을 고르거나 뺄 때 hold 메시지를 보내고,
  // 모달을 닫을 때 release 메시지를 명시적으로 보내서 즉시 풀어준다.
  // (연결이 끊겨 release를 못 보낸 경우를 대비해 하트비트 + 만료 청소도 같이 돈다)
  useEffect(() => {
    if (!open) return;
    othersRef.current.clear();
    // 이전 세션에서 남은 "다른 사용자가 선택 중" 표시를 즉시 비움(모달 재오픈/회차 변경 시)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open/slotId 전환 시 1회 초기화
    setOthersHeldSeatIds(new Set());

    const clientId = clientIdRef.current;
    const supabase = createClient();
    const channel = supabase.channel(`seat-hold-${slotId}`);

    channel.on("broadcast", { event: "hold" }, ({ payload }) => {
      const { clientId: fromId, seatIds } = payload as {
        clientId: string;
        seatIds: string[];
      };
      if (fromId === clientId) return;
      othersRef.current.set(fromId, { seatIds, lastSeenAt: Date.now() });
      recomputeOthersHeld();
    });
    channel.on("broadcast", { event: "release" }, ({ payload }) => {
      const { clientId: fromId } = payload as { clientId: string };
      othersRef.current.delete(fromId);
      recomputeOthersHeld();
    });

    channel.subscribe();
    channelRef.current = channel;

    const sweep = setInterval(recomputeOthersHeld, 3000);

    return () => {
      clearInterval(sweep);
      channel.send({
        type: "broadcast",
        event: "release",
        payload: { clientId },
      });
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [slotId, open]);

  // 내가 좌석을 고르거나 뺄 때마다, 그리고 주기적으로(하트비트) 다른 사람들에게 알려준다.
  useEffect(() => {
    if (!open) return;
    const send = () =>
      channelRef.current?.send({
        type: "broadcast",
        event: "hold",
        payload: { clientId: clientIdRef.current, seatIds: [...selectedSeatIds] },
      });
    send();
    const heartbeat = setInterval(send, HEARTBEAT_MS);
    return () => clearInterval(heartbeat);
  }, [open, selectedSeatIds]);

  function handleSeatClick(seat: { seatId: string; gradeId: string | null }) {
    if (!seat.gradeId || occupiedSeatIds.has(seat.seatId)) return;
    if (othersHeldSeatIds.has(seat.seatId)) return; // 다른 사용자가 지금 보고 있는 좌석
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
                    ? "border-primary-500 bg-primary-100 text-primary-900 dark:border-gray-500 dark:bg-[#303134] dark:text-gray-50"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#3c4043] dark:text-gray-300 dark:hover:bg-[#303134]",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {g.name} · {g.price.toLocaleString()}원
              </button>
            );
          })}
        </div>

        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#3c4043] dark:bg-[#303134]">
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
            const isHeldByOthers = othersHeldSeatIds.has(seat.seatId);
            const selected = selectedSeatIds.has(seat.seatId);
            const disabled = !inGrade || isOccupied || isHeldByOthers || !seat.gradeId;

            return (
              <button
                key={seat.seatId}
                type="button"
                title={
                  isHeldByOthers ? `${seat.label} (다른 사용자가 선택 중)` : seat.label
                }
                disabled={disabled}
                onClick={() => handleSeatClick(seat)}
                className={cn(
                  "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border transition-transform",
                  !inGrade && "border-gray-200 bg-gray-100 opacity-30",
                  inGrade && isOccupied && "border-gray-300 bg-gray-300",
                  inGrade &&
                    !isOccupied &&
                    isHeldByOthers &&
                    "border-dashed border-amber-400 bg-amber-100",
                  inGrade &&
                    !isOccupied &&
                    !isHeldByOthers &&
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

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-primary-400 bg-white" />
            선택가능
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-primary-700 bg-primary-500" />
            선택됨
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-dashed border-amber-400 bg-amber-100" />
            다른 사용자가 선택 중
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border border-gray-300 bg-gray-300" />
            판매됨
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          {selectedLabels.length === 0
            ? "좌석을 선택해주세요."
            : `선택한 좌석: ${selectedLabels.join(", ")} (${selectedLabels.length}석)`}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" fullWidth onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" fullWidth onClick={onClose}>
          선택 완료
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
