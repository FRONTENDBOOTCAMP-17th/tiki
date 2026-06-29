"use client";

import { useRef, useState } from "react";
import { DndContext, useDraggable, type DragEndEvent } from "@dnd-kit/core";
import { Plus, Trash2 } from "lucide-react";
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

export interface SeatGradeOption {
  gradeId: string;
  name: string;
}

// 등급마다 고정 색을 순서대로 배정 (등급 자체에 색 컬럼이 없으므로 인덱스 기반으로 매핑)
const GRADE_COLORS = ["#a855f7", "#f97316", "#06b6d4", "#22c55e", "#ef4444", "#eab308"];

function colorForGrade(gradeId: string | null, grades: SeatGradeOption[]) {
  if (!gradeId) return "#ffffff";
  const index = grades.findIndex((g) => g.gradeId === gradeId);
  return index === -1 ? "#9ca3af" : GRADE_COLORS[index % GRADE_COLORS.length];
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

// 좌석 1개. 드래그로 자유 이동, 클릭(Shift+클릭은 다중)으로 선택.
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

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function SeatLayoutBuilder({
  grades,
  initialStage,
  initialSeats,
}: {
  grades: SeatGradeOption[];
  initialStage: DraftStage;
  initialSeats: DraftSeat[];
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<DraftStage>(initialStage);
  const [seats, setSeats] = useState<DraftSeat[]>(initialSeats);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rowCount, setRowCount] = useState(10);
  const [labelPrefix, setLabelPrefix] = useState("A");
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  function toCanvasPercent(e: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clampPercent(((e.clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((e.clientY - rect.top) / rect.height) * 100),
    };
  }

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

  // 좌석을 한 줄로 N개 생성 (좌석 수백 개를 하나씩 만들지 않게 하는 핵심 도구)
  function addRow() {
    if (rowCount < 1) return;
    const margin = 10;
    const usable = 100 - margin * 2;
    const newSeats: DraftSeat[] = Array.from({ length: rowCount }, (_, i) => ({
      id: crypto.randomUUID(),
      label: `${labelPrefix}${i + 1}`,
      x: rowCount === 1 ? 50 : margin + (usable * i) / (rowCount - 1),
      y: 50,
      gradeId: null,
    }));
    setSeats((prev) => [...prev, ...newSeats]);
  }

  function toggleSelect(seatId: string, shiftKey: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(shiftKey ? prev : []);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }

  function assignGrade(gradeId: string) {
    setSeats((prev) =>
      prev.map((seat) => (selectedIds.has(seat.id) ? { ...seat, gradeId } : seat)),
    );
  }

  function deleteSelected() {
    setSeats((prev) => prev.filter((seat) => !selectedIds.has(seat.id)));
    setSelectedIds(new Set());
  }

  // 드래그 영역 선택: 캔버스의 빈 배경(좌석/무대가 아닌 부분)에서 누른 경우에만 시작
  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== canvasRef.current) return;
    const point = toCanvasPercent(e);
    setSelectionBox({ startX: point.x, startY: point.y, endX: point.x, endY: point.y });
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectionBox) return;
    const point = toCanvasPercent(e);
    setSelectionBox((prev) => (prev ? { ...prev, endX: point.x, endY: point.y } : prev));
  }

  function handleCanvasMouseUp() {
    if (!selectionBox) return;
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    const inBox = seats.filter(
      (seat) => seat.x >= minX && seat.x <= maxX && seat.y >= minY && seat.y <= maxY,
    );
    setSelectedIds(new Set(inBox.map((seat) => seat.id)));
    setSelectionBox(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          줄 라벨 접두사
          <input
            value={labelPrefix}
            onChange={(e) => setLabelPrefix(e.target.value)}
            className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          좌석 수
          <input
            type="number"
            min={1}
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value))}
            className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} />
          줄 추가
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-40"
        >
          <Trash2 size={14} />
          선택 삭제
        </button>
      </div>

      {grades.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">선택한 좌석에 등급 지정:</span>
          {grades.map((grade, i) => (
            <button
              key={grade.gradeId}
              type="button"
              onClick={() => assignGrade(grade.gradeId)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 disabled:opacity-40"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: GRADE_COLORS[i % GRADE_COLORS.length] }}
              />
              {grade.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        무대와 좌석을 드래그해서 배치하세요. Shift+클릭으로 다중 선택, 빈 배경을 드래그하면 영역
        선택도 가능합니다.
      </p>

      <DndContext onDragEnd={handleDragEnd}>
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        >
          <StageBlock stage={stage} />
          {seats.map((seat) => (
            <SeatDot
              key={seat.id}
              seat={seat}
              selected={selectedIds.has(seat.id)}
              color={colorForGrade(seat.gradeId, grades)}
              onClick={(e) => toggleSelect(seat.id, e.shiftKey)}
            />
          ))}
          {selectionBox && (
            <div
              className="absolute border border-primary-500 bg-primary-400/20"
              style={{
                left: `${Math.min(selectionBox.startX, selectionBox.endX)}%`,
                top: `${Math.min(selectionBox.startY, selectionBox.endY)}%`,
                width: `${Math.abs(selectionBox.endX - selectionBox.startX)}%`,
                height: `${Math.abs(selectionBox.endY - selectionBox.startY)}%`,
              }}
            />
          )}
        </div>
      </DndContext>

      <p className="text-xs text-gray-400">
        좌석 {seats.length}개 · 선택됨 {selectedIds.size}개
      </p>
    </div>
  );
}
