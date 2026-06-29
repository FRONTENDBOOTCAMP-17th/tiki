"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DraftSeat {
  id: string;
  label: string;
  x: number; // 캔버스 가로 기준 % (0~100)
  y: number; // 캔버스 세로 기준 % (0~100)
  gradeId: string | null;
}

export interface DraftStage {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

// 무대 블록. 위치만 드래그로 옮길 수 있고 크기는 숫자 입력으로 조절한다(드래그 리사이즈는 스코프 외).
function StageBlock({ stage }: { stage: DraftStage }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "stage",
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md bg-gray-700 text-xs font-medium text-white active:cursor-grabbing",
        isDragging && "opacity-70",
      )}
      style={{
        left: `${stage.x}%`,
        top: `${stage.y}%`,
        width: `${stage.width}%`,
        height: `${stage.height}%`,
      }}
    >
      무대
    </div>
  );
}

// 좌석 1개. 드래그로 자유 이동, 클릭으로 선택.
function SeatDot({
  seat,
  selected,
  color,
  onClick,
}: {
  seat: DraftSeat;
  selected: boolean;
  color: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: seat.id,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={onClick}
      title={seat.label}
      className={cn(
        "absolute size-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border transition-transform",
        selected ? "scale-125 border-primary-700 ring-2 ring-primary-400" : "border-gray-400",
        isDragging && "opacity-70",
      )}
      style={{ left: `${seat.x}%`, top: `${seat.y}%`, backgroundColor: color }}
    />
  );
}

export default function SeatLayoutBuilder({
  initialStage,
  initialSeats,
}: {
  initialStage: DraftStage;
  initialSeats: DraftSeat[];
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<DraftStage>(initialStage);
  const [seats, setSeats] = useState<DraftSeat[]>(initialSeats);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function handleDragEnd(event: DragEndEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    const dxPercent = (event.delta.x / width) * 100;
    const dyPercent = (event.delta.y / height) * 100;

    if (event.active.id === "stage") {
      setStage((prev) => ({
        ...prev,
        x: clampPercent(prev.x + dxPercent),
        y: clampPercent(prev.y + dyPercent),
      }));
      return;
    }

    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === event.active.id
          ? {
              ...seat,
              x: clampPercent(seat.x + dxPercent),
              y: clampPercent(seat.y + dyPercent),
            }
          : seat,
      ),
    );
  }

  function addSeat() {
    const label = `S${seats.length + 1}`;
    setSeats((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, x: 50, y: 50, gradeId: null },
    ]);
  }

  function toggleSelect(seatId: string, shiftKey: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(shiftKey ? prev : []);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          무대와 좌석을 드래그해서 배치하세요. Shift+클릭으로 좌석을 여러 개 선택할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={addSeat}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} />
          좌석 추가
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div
          ref={canvasRef}
          className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        >
          <StageBlock stage={stage} />
          {seats.map((seat) => (
            <SeatDot
              key={seat.id}
              seat={seat}
              selected={selectedIds.has(seat.id)}
              color={seat.gradeId ? "#a855f7" : "#ffffff"}
              onClick={(e) => toggleSelect(seat.id, e.shiftKey)}
            />
          ))}
        </div>
      </DndContext>

      <p className="text-xs text-gray-400">좌석 {seats.length}개 · 선택됨 {selectedIds.size}개</p>
    </div>
  );
}
