"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import useToast from "@/hooks/useToast";

export interface DraftSeat {
  id: string;
  label: string;
  x: number; // 캔버스 가로 기준 % (0~100)
  y: number; // 캔버스 세로 기준 % (0~100)
  gradeId: string | null;
  groupName: string | null; // 등급과 별개인 구역/그룹 이름 (자유 텍스트)
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
  quantity: number; // 이 등급의 좌석 수(가격 낮은 순으로 전달됨) — 좌석 자동배정에 사용
}

// 등급마다 고정 색을 순서대로 배정 (등급 자체에 색 컬럼이 없으므로 인덱스 기반으로 매핑)
const GRADE_COLORS = ["#a855f7", "#f97316", "#06b6d4", "#22c55e", "#ef4444", "#eab308"];
const controlClass =
  "border-gray-200 bg-white text-gray-900 dark:border-[#3c4043] dark:bg-[#303134] dark:text-gray-100";
const controlHoverClass =
  "hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#34363a] dark:hover:text-gray-100";

function colorForGrade(gradeId: string | null, grades: SeatGradeOption[]) {
  if (!gradeId) return "#ffffff";
  const index = grades.findIndex((g) => g.gradeId === gradeId);
  return index === -1 ? "#9ca3af" : GRADE_COLORS[index % GRADE_COLORS.length];
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

type PresetShape = "square" | "rectangle" | "circle" | "fan";

// 프리셋별로 입력칸(A, B, C)의 의미가 달라서 라벨을 매핑해둔다. 안 쓰는 칸은 null.
const PRESET_FIELD_LABELS: Record<PresetShape, [string, string | null, string | null]> = {
  square: ["한 변 좌석 수", null, null],
  rectangle: ["행 수", "열 수", null],
  circle: ["좌석 수", "반지름(%)", null],
  fan: ["행 수", "행당 좌석 수", "벌어지는 각도(°)"],
};

// square/rectangle은 가로·세로 간격, fan은 시작 반지름·줄 간격으로 같은 입력칸(presetGapX/Y)을 재사용한다.
const GAP_FIELD_LABELS: Record<"square" | "rectangle" | "fan", [string, string]> = {
  square: ["가로 간격(%)", "세로 간격(%)"],
  rectangle: ["가로 간격(%)", "세로 간격(%)"],
  fan: ["시작 반지름(%)", "줄 간격(%)"],
};

// 무대 블록. 위치만 드래그로 옮길 수 있고 크기는 숫자 입력으로 조절한다(드래그 리사이즈는 스코프 외).
// dragOffsetPx: 드래그 중일 때 부모가 내려주는 실시간 픽셀 이동량 (커서를 계속 따라오게 함)
function StageBlock({
  stage,
  dragOffsetPx,
}: {
  stage: DraftStage;
  dragOffsetPx: { x: number; y: number } | null;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "stage",
  });
  const dx = dragOffsetPx?.x ?? 0;
  const dy = dragOffsetPx?.y ?? 0;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute flex cursor-grab touch-none items-center justify-center rounded-md bg-gray-700 text-xs font-medium text-white active:cursor-grabbing",
        isDragging && "opacity-70",
      )}
      style={{
        left: `${stage.x}%`,
        top: `${stage.y}%`,
        width: `${stage.width}%`,
        height: `${stage.height}%`,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
      }}
    >
      무대
    </div>
  );
}

// 좌석 1개(사각형). 드래그로 자유 이동, 클릭(Shift+클릭은 다중)으로 선택.
// 라벨(접두사+번호)을 항상 좌석 아래에 작게 표시한다.
// dragOffsetPx: 이 좌석이 드래그 중(또는 같이 선택되어 따라가는 중)일 때의 실시간 픽셀 이동량
function SeatDot({
  seat,
  selected,
  color,
  dragOffsetPx,
  onClick,
}: {
  seat: DraftSeat;
  selected: boolean;
  color: string;
  dragOffsetPx: { x: number; y: number } | null;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: seat.id,
  });
  const dx = dragOffsetPx?.x ?? 0;
  const dy = dragOffsetPx?.y ?? 0;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${seat.x}%`,
        top: `${seat.y}%`,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
      }}
    >
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        onClick={onClick}
        title={seat.label}
        className={cn(
          "size-4 touch-none rounded-sm border transition-transform",
          selected ? "scale-125 border-primary-700 ring-2 ring-primary-400" : "border-gray-400",
          isDragging && "opacity-70",
        )}
        style={{ backgroundColor: color }}
      />
      <span className="mt-0.5 text-[8px] leading-none whitespace-nowrap text-gray-600 select-none">
        {seat.label}
      </span>
    </div>
  );
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// 드래그 중인 대상(들)과 현재까지의 실시간 픽셀 이동량.
// 다중 선택 상태에서 그중 하나를 드래그하면 선택된 전체가 같은 양만큼 같이 움직여야 하므로
// "누가 움직이는 중인지" 목록(ids)을 따로 들고 있다가 전부에게 같은 offset을 내려준다.
interface DragState {
  ids: string[];
  x: number;
  y: number;
}

export default function SeatLayoutBuilder({
  grades,
  initialStage,
  initialSeats,
  maxSeats,
  onChange,
}: {
  grades: SeatGradeOption[];
  initialStage: DraftStage;
  initialSeats: DraftSeat[];
  maxSeats: number; // 등급별 좌석 수(VIP+일반 등) 합계. 이 개수를 넘는 좌석은 만들 수 없다.
  // 저장 버튼이 있는 부모(페이지)가 최신 배치 상태를 들고 있을 수 있도록 변경마다 알려준다.
  onChange?: (stage: DraftStage, seats: DraftSeat[]) => void;
}) {
  const toast = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<DraftStage>(initialStage);
  const [seats, setSeats] = useState<DraftSeat[]>(initialSeats);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rowCount, setRowCount] = useState(10);
  const [rowGapX, setRowGapX] = useState(6);
  const [labelPrefix, setLabelPrefix] = useState("A");
  const [presetShape, setPresetShape] = useState<PresetShape>("rectangle");
  const [presetA, setPresetA] = useState(5);
  const [presetB, setPresetB] = useState(5);
  const [presetC, setPresetC] = useState(120);
  const [presetGapX, setPresetGapX] = useState(8);
  const [presetGapY, setPresetGapY] = useState(12);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [bulkLabelPrefix, setBulkLabelPrefix] = useState("A");
  const [bulkLabelStart, setBulkLabelStart] = useState(1);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [rotateAngle, setRotateAngle] = useState(15);

  const groups = Array.from(
    new Set(seats.map((seat) => seat.groupName).filter((name): name is string => !!name)),
  ).sort();

  const selectedSeat =
    selectedIds.size === 1 ? seats.find((seat) => selectedIds.has(seat.id)) ?? null : null;

  useEffect(() => {
    onChange?.(stage, seats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, seats]);

  function toCanvasPercent(e: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clampPercent(((e.clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((e.clientY - rect.top) / rect.height) * 100),
    };
  }

  // 드래그 시작: 잡은 게 다중 선택된 좌석 중 하나면 선택된 전체를 같이 옮길 대상으로 지정한다.
  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    if (activeId === "stage") {
      setDragState({ ids: ["stage"], x: 0, y: 0 });
      return;
    }
    const ids = selectedIds.has(activeId) && selectedIds.size > 1
      ? [...selectedIds]
      : [activeId];
    setDragState({ ids, x: 0, y: 0 });
  }

  // 드래그 중: 실시간 픽셀 이동량을 갱신해서 좌석이 커서를 계속 따라오게 한다.
  function handleDragMove(event: DragMoveEvent) {
    setDragState((prev) => (prev ? { ...prev, x: event.delta.x, y: event.delta.y } : prev));
  }

  function handleDragEnd(event: DragEndEvent) {
    const canvas = canvasRef.current;
    setDragState(null);
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

    const activeId = String(event.active.id);
    const movedIds = new Set(
      selectedIds.has(activeId) && selectedIds.size > 1 ? selectedIds : [activeId],
    );

    setSeats((prev) =>
      prev.map((seat) =>
        movedIds.has(seat.id)
          ? {
              ...seat,
              x: clampPercent(seat.x + dxPercent),
              y: clampPercent(seat.y + dyPercent),
            }
          : seat,
      ),
    );
  }

  // 등급별 좌석 수(VIP+일반 등) 합계를 넘는 좌석은 만들 수 없다. 남은 자리 수를 돌려준다.
  function remainingCapacity() {
    return maxSeats - seats.length;
  }

  // 격자/원형/부채꼴처럼 모양이 정해진 프리셋은 일부만 만들면 모양이 깨지므로,
  // 남은 자리보다 많이 요청하면 아예 만들지 않고 경고만 띄운다.
  function blockIfOverCapacity(requested: number) {
    const remaining = remainingCapacity();
    if (requested > remaining) {
      toast.error(`좌석은 최대 ${maxSeats}개까지 만들 수 있어요 (남은 자리 ${Math.max(remaining, 0)}개)`);
      return true;
    }
    return false;
  }

  // "라벨+번호" 형식(예: A1, A2...)으로 겹치지 않는 라벨을 count개 만들어준다.
  // 이미 있는 좌석의 라벨(다른 줄/프리셋으로 만든 것 포함)과 절대 겹치지 않도록
  // 번호를 1부터 훑으면서 비어있는 것만 골라 쓴다.
  function generateLabels(prefix: string, count: number) {
    const used = new Set(seats.map((s) => s.label));
    const labels: string[] = [];
    let n = 1;
    while (labels.length < count) {
      const label = `${prefix}${n}`;
      if (!used.has(label)) {
        labels.push(label);
        used.add(label);
      }
      n++;
    }
    return labels;
  }

  // 새로 만드는 좌석 count개에 등급을 자동 배정한다. grades는 가격 낮은 순으로 들어오므로
  // 기본적으로 가장 싼 등급(보통 일반석)부터 그 등급의 quantity만큼 채우고,
  // 다 차면 다음 등급(보통 VIP석)으로 자동 넘어간다.
  function assignDefaultGrades(count: number) {
    const usedByGrade = new Map<string, number>();
    for (const seat of seats) {
      if (!seat.gradeId) continue;
      usedByGrade.set(seat.gradeId, (usedByGrade.get(seat.gradeId) ?? 0) + 1);
    }

    const result: (string | null)[] = [];
    let gradeIndex = 0;
    for (let i = 0; i < count; i++) {
      while (
        gradeIndex < grades.length &&
        (usedByGrade.get(grades[gradeIndex].gradeId) ?? 0) >= grades[gradeIndex].quantity
      ) {
        gradeIndex++;
      }
      const grade = grades[gradeIndex];
      if (!grade) {
        result.push(null);
        continue;
      }
      result.push(grade.gradeId);
      usedByGrade.set(grade.gradeId, (usedByGrade.get(grade.gradeId) ?? 0) + 1);
    }
    return result;
  }

  // 좌석을 한 줄로 N개 생성 (좌석 수백 개를 하나씩 만들지 않게 하는 핵심 도구)
  // rowGapX: 좌석 사이 가로 간격(%). 시작점(x=10)부터 간격만큼씩 옆으로 배치한다.
  // 줄은 1차원이라 일부만 만들어도 모양이 안 깨지므로, 남은 자리만큼만 잘라서 만든다.
  function addRow() {
    if (rowCount < 1) return;
    const count = Math.min(rowCount, remainingCapacity());
    if (count <= 0) {
      toast.error(`좌석은 최대 ${maxSeats}개까지 만들 수 있어요. 더 이상 추가할 수 없습니다.`);
      return;
    }
    if (count < rowCount) {
      toast.error(`남은 자리가 ${count}개뿐이라 ${count}개만 생성했어요.`);
    }
    const startX = 10;
    const labels = generateLabels(labelPrefix, count);
    const defaultGrades = assignDefaultGrades(count);
    const newSeats: DraftSeat[] = labels.map((label, i) => ({
      id: crypto.randomUUID(),
      label,
      x: clampPercent(startX + rowGapX * i),
      y: 50,
      gradeId: defaultGrades[i],
      groupName: null,
    }));
    setSeats((prev) => [...prev, ...newSeats]);
  }

  // 캔버스가 4:3 비율이라 x% 한 칸과 y% 한 칸의 실제 픽셀 크기가 다르다.
  // 원형/부채꼴 배치에서 동그랗게 보이도록 y쪽 반지름에 이 비율을 보정해준다.
  const CANVAS_ASPECT = 4 / 3;

  // 행×열 격자로 좌석 일괄 생성 (정사각형 프리셋은 행=열로 호출)
  // gapX/gapY: 좌석 사이 가로/세로 간격(%). 시작점(10, 25)부터 간격만큼씩 늘어선다.
  function addRectanglePreset(rows: number, cols: number, gapX: number, gapY: number) {
    if (rows < 1 || cols < 1) return;
    if (blockIfOverCapacity(rows * cols)) return;
    const startX = 10;
    const startY = 25;
    const labels = generateLabels(labelPrefix, rows * cols);
    const defaultGrades = assignDefaultGrades(rows * cols);
    const newSeats: DraftSeat[] = [];
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newSeats.push({
          id: crypto.randomUUID(),
          label: labels[i],
          x: clampPercent(startX + gapX * c),
          y: clampPercent(startY + gapY * r),
          gradeId: defaultGrades[i],
          groupName: null,
        });
        i++;
      }
    }
    setSeats((prev) => [...prev, ...newSeats]);
  }

  // 좌석을 원형으로 균등 배치 (예: 원탁/아레나형 좌석)
  function addCirclePreset(count: number, radiusPercent: number) {
    if (count < 1 || radiusPercent <= 0) return;
    if (blockIfOverCapacity(count)) return;
    const centerX = 50;
    const centerY = 55;
    const labels = generateLabels(labelPrefix, count);
    const defaultGrades = assignDefaultGrades(count);
    const newSeats: DraftSeat[] = labels.map((label, i) => {
      const angle = (2 * Math.PI * i) / count;
      return {
        id: crypto.randomUUID(),
        label,
        x: clampPercent(centerX + radiusPercent * Math.cos(angle)),
        y: clampPercent(centerY + radiusPercent * CANVAS_ASPECT * Math.sin(angle)),
        gradeId: defaultGrades[i],
        groupName: null,
      };
    });
    setSeats((prev) => [...prev, ...newSeats]);
  }

  // 무대를 기준점으로 부채꼴(공연장형)로 펼쳐지는 좌석 배치. 행이 늘어날수록 반지름이 커진다.
  // spreadDeg: 좌석들이 양쪽으로 벌어지는 전체 각도 (180에 가까울수록 무대를 넓게 감싸는 모양)
  // startRadius: 무대에서 첫 줄까지 떨어진 거리, radiusStep: 줄 사이 간격(반지름 증가량)
  function addFanPreset(
    rows: number,
    seatsPerRow: number,
    spreadDeg: number,
    startRadius: number,
    radiusStep: number,
  ) {
    if (rows < 1 || seatsPerRow < 1 || spreadDeg <= 0) return;
    if (blockIfOverCapacity(rows * seatsPerRow)) return;
    const centerX = 50;
    const centerY = clampPercent(stage.y + stage.height / 2 + 5);
    const labels = generateLabels(labelPrefix, rows * seatsPerRow);
    const defaultGrades = assignDefaultGrades(rows * seatsPerRow);
    const newSeats: DraftSeat[] = [];
    let i = 0;
    for (let r = 0; r < rows; r++) {
      const radius = startRadius + r * radiusStep;
      for (let c = 0; c < seatsPerRow; c++) {
        const angleDeg =
          seatsPerRow === 1 ? 0 : -spreadDeg / 2 + (spreadDeg * c) / (seatsPerRow - 1);
        const angleRad = (angleDeg * Math.PI) / 180;
        newSeats.push({
          id: crypto.randomUUID(),
          label: labels[i],
          x: clampPercent(centerX + radius * Math.sin(angleRad)),
          y: clampPercent(centerY + radius * Math.cos(angleRad) * CANVAS_ASPECT),
          gradeId: defaultGrades[i],
          groupName: null,
        });
        i++;
      }
    }
    setSeats((prev) => [...prev, ...newSeats]);
  }

  function addPreset() {
    if (presetShape === "square") addRectanglePreset(presetA, presetA, presetGapX, presetGapY);
    else if (presetShape === "rectangle")
      addRectanglePreset(presetA, presetB, presetGapX, presetGapY);
    else if (presetShape === "circle") addCirclePreset(presetA, presetB);
    else addFanPreset(presetA, presetB, presetC, presetGapX, presetGapY);
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

  function renameSeat(seatId: string, label: string) {
    setSeats((prev) => prev.map((seat) => (seat.id === seatId ? { ...seat, label } : seat)));
  }

  // 선택된 여러 좌석을 화면 위치 순서(위→아래, 좌→우)대로 "접두사+번호"로 다시 번호 매김
  function renameSelectedBulk() {
    const ordered = seats
      .filter((seat) => selectedIds.has(seat.id))
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const nextLabelById = new Map(
      ordered.map((seat, i) => [seat.id, `${bulkLabelPrefix}${bulkLabelStart + i}`]),
    );
    setSeats((prev) =>
      prev.map((seat) =>
        nextLabelById.has(seat.id) ? { ...seat, label: nextLabelById.get(seat.id)! } : seat,
      ),
    );
  }

  // 등급과 별개로 좌석을 자유 텍스트 그룹(구역)으로 묶는다. 그룹 목록은 별도 테이블 없이
  // seats에 쓰인 group_name distinct 값으로 도출한다.
  function assignGroup(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSeats((prev) =>
      prev.map((seat) => (selectedIds.has(seat.id) ? { ...seat, groupName: trimmed } : seat)),
    );
  }

  function ungroupSelected() {
    setSeats((prev) =>
      prev.map((seat) => (selectedIds.has(seat.id) ? { ...seat, groupName: null } : seat)),
    );
  }

  function selectGroup(name: string) {
    setSelectedIds(new Set(seats.filter((seat) => seat.groupName === name).map((seat) => seat.id)));
  }

  function renameGroup(oldName: string, newNameRaw: string) {
    const newName = newNameRaw.trim();
    if (!newName || newName === oldName) return;
    setSeats((prev) =>
      prev.map((seat) => (seat.groupName === oldName ? { ...seat, groupName: newName } : seat)),
    );
  }

  function ungroupAll(name: string) {
    setSeats((prev) =>
      prev.map((seat) => (seat.groupName === name ? { ...seat, groupName: null } : seat)),
    );
  }

  // 그룹의 중심점을 기준으로 좌석 전체를 angleDeg만큼 회전.
  // 캔버스가 4:3이라 x%/y%의 실제 픽셀 비율이 다르므로, y를 CANVAS_ASPECT로 나눠 정규화한 뒤
  // 회전하고 다시 곱해서 되돌린다(그래야 타원이 아니라 진짜 회전처럼 보임).
  function rotateGroup(groupName: string, angleDeg: number) {
    const members = seats.filter((seat) => seat.groupName === groupName);
    if (members.length === 0) return;
    const cx = members.reduce((sum, seat) => sum + seat.x, 0) / members.length;
    const cyPrime =
      members.reduce((sum, seat) => sum + seat.y / CANVAS_ASPECT, 0) / members.length;
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const nextById = new Map(
      members.map((seat) => {
        const dx = seat.x - cx;
        const dyPrime = seat.y / CANVAS_ASPECT - cyPrime;
        const rx = dx * cos - dyPrime * sin;
        const ryPrime = dx * sin + dyPrime * cos;
        return [
          seat.id,
          { x: clampPercent(cx + rx), y: clampPercent((cyPrime + ryPrime) * CANVAS_ASPECT) },
        ] as const;
      }),
    );

    setSeats((prev) =>
      prev.map((seat) => {
        const next = nextById.get(seat.id);
        return next ? { ...seat, x: next.x, y: next.y } : seat;
      }),
    );
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
            className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          좌석 수
          <input
            type="number"
            min={1}
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value))}
            className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          가로 간격(%)
          <input
            type="number"
            min={1}
            value={rowGapX}
            onChange={(e) => setRowGapX(Number(e.target.value))}
            className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
        </label>
        <button
          type="button"
          onClick={addRow}
          disabled={remainingCapacity() <= 0}
          className={cn("flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40", controlClass, controlHoverClass)}
        >
          <Plus size={14} />
          줄 추가
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-40 dark:border-[#3c4043] dark:hover:bg-danger-950/30"
        >
          <Trash2 size={14} />
          선택 삭제
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-2 dark:bg-[#303134]">
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          배치 프리셋
          <select
            value={presetShape}
            onChange={(e) => setPresetShape(e.target.value as PresetShape)}
            className={cn("rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          >
            <option value="square">정사각형</option>
            <option value="rectangle">직사각형</option>
            <option value="circle">원형</option>
            <option value="fan">부채꼴(공연장형)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          {PRESET_FIELD_LABELS[presetShape][0]}
          <input
            type="number"
            min={1}
            value={presetA}
            onChange={(e) => setPresetA(Number(e.target.value))}
            className={cn("w-24 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
        </label>
        {PRESET_FIELD_LABELS[presetShape][1] && (
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            {PRESET_FIELD_LABELS[presetShape][1]}
            <input
              type="number"
              min={1}
              value={presetB}
              onChange={(e) => setPresetB(Number(e.target.value))}
              className={cn("w-24 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
            />
          </label>
        )}
        {PRESET_FIELD_LABELS[presetShape][2] && (
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            {PRESET_FIELD_LABELS[presetShape][2]}
            <input
              type="number"
              min={1}
              max={359}
              value={presetC}
              onChange={(e) => setPresetC(Number(e.target.value))}
              className={cn("w-24 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
            />
          </label>
        )}
        {presetShape !== "circle" && (
          <>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              {GAP_FIELD_LABELS[presetShape][0]}
              <input
                type="number"
                min={1}
                value={presetGapX}
                onChange={(e) => setPresetGapX(Number(e.target.value))}
                className={cn("w-24 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              {GAP_FIELD_LABELS[presetShape][1]}
              <input
                type="number"
                min={1}
                value={presetGapY}
                onChange={(e) => setPresetGapY(Number(e.target.value))}
                className={cn("w-24 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
              />
            </label>
          </>
        )}
        <button
          type="button"
          onClick={addPreset}
          disabled={remainingCapacity() <= 0}
          className={cn("flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40", controlClass, controlHoverClass)}
        >
          <Plus size={14} />
          프리셋 추가
        </button>
      </div>

      {selectedSeat && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          선택한 좌석 라벨
          <input
            value={selectedSeat.label}
            onChange={(e) => renameSeat(selectedSeat.id, e.target.value)}
            className={cn("w-32 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
        </label>
      )}

      {selectedIds.size > 1 && (
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-sm text-gray-600">선택한 {selectedIds.size}개 좌석 라벨 일괄 변경</span>
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            접두사
            <input
              value={bulkLabelPrefix}
              onChange={(e) => setBulkLabelPrefix(e.target.value)}
              className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            시작 번호
            <input
              type="number"
              min={1}
              value={bulkLabelStart}
              onChange={(e) => setBulkLabelStart(Number(e.target.value))}
              className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
            />
          </label>
          <button
            type="button"
            onClick={renameSelectedBulk}
            className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium", controlClass, controlHoverClass)}
          >
            일괄 변경
          </button>
        </div>
      )}

      {grades.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">선택한 좌석에 등급 지정:</span>
          {grades.map((grade, i) => (
            <button
              key={grade.gradeId}
              type="button"
              onClick={() => assignGrade(grade.gradeId)}
              disabled={selectedIds.size === 0}
              className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 disabled:opacity-40", controlClass, controlHoverClass)}
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

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          선택 좌석 그룹명
          <input
            list="seat-group-names"
            value={groupNameInput}
            onChange={(e) => setGroupNameInput(e.target.value)}
            placeholder="예: 1층 A블록"
            className={cn("w-36 rounded-lg border px-2 py-1.5 text-sm", controlClass)}
          />
          <datalist id="seat-group-names">
            {groups.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <button
          type="button"
          onClick={() => assignGroup(groupNameInput)}
          disabled={selectedIds.size === 0 || !groupNameInput.trim()}
          className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40", controlClass, controlHoverClass)}
        >
          선택 좌석 그룹 지정
        </button>
        <button
          type="button"
          onClick={ungroupSelected}
          disabled={selectedIds.size === 0}
          className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40", controlClass, controlHoverClass)}
        >
          선택 좌석 그룹 해제
        </button>
      </div>

      {groups.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-[#3c4043]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">그룹 인스펙터</p>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              회전 각도(°)
              <input
                type="number"
                value={rotateAngle}
                onChange={(e) => setRotateAngle(Number(e.target.value))}
                className={cn("w-16 rounded border px-1.5 py-1 text-sm", controlClass)}
              />
            </label>
          </div>
          <ul className="flex flex-col gap-1.5">
            {groups.map((name) => {
              const count = seats.filter((seat) => seat.groupName === name).length;
              return (
                <li
                  key={name}
                  className="flex flex-wrap items-center gap-2 rounded-md bg-gray-50 px-2 py-1.5 text-sm dark:bg-[#303134]"
                >
                  <input
                    key={name}
                    defaultValue={name}
                    onBlur={(e) => renameGroup(name, e.target.value)}
                    className={cn("w-28 rounded border px-1.5 py-1 text-sm", controlClass)}
                  />
                  <span className="text-xs text-gray-400">{count}석</span>
                  <button
                    type="button"
                    onClick={() => selectGroup(name)}
                    className={cn("rounded border px-2 py-1 text-xs", controlClass, controlHoverClass)}
                  >
                    선택
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateGroup(name, -rotateAngle)}
                    title="반시계 방향으로 회전"
                    className={cn("rounded border px-2 py-1 text-xs", controlClass, controlHoverClass)}
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateGroup(name, rotateAngle)}
                    title="시계 방향으로 회전"
                    className={cn("rounded border px-2 py-1 text-xs", controlClass, controlHoverClass)}
                  >
                    ↻
                  </button>
                  <button
                    type="button"
                    onClick={() => ungroupAll(name)}
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-danger-600 hover:bg-danger-50 dark:border-[#3c4043] dark:hover:bg-danger-950/30"
                  >
                    그룹 해제
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-sm text-gray-500">
        무대와 좌석을 드래그해서 배치하세요. Shift+클릭으로 다중 선택, 빈 배경을 드래그하면 영역
        선택도 가능합니다.
      </p>

      <DndContext
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragState(null)}
      >
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#3c4043] dark:bg-[#303134]"
        >
          <StageBlock
            stage={stage}
            dragOffsetPx={dragState?.ids.includes("stage") ? dragState : null}
          />
          {seats.map((seat) => (
            <SeatDot
              key={seat.id}
              seat={seat}
              selected={selectedIds.has(seat.id)}
              color={colorForGrade(seat.gradeId, grades)}
              dragOffsetPx={dragState?.ids.includes(seat.id) ? dragState : null}
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

      <p className={cn("text-xs", seats.length >= maxSeats ? "font-medium text-danger-600" : "text-gray-400")}>
        좌석 {seats.length} / 최대 {maxSeats}개 · 선택됨{" "}
        {selectedIds.size === 0
          ? "0개"
          : `${selectedIds.size}개 (${seats
              .filter((seat) => selectedIds.has(seat.id))
              .map((seat) => seat.label)
              .join(", ")})`}
      </p>
    </div>
  );
}
