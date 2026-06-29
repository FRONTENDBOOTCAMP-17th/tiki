"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import useToast from "@/hooks/useToast";
import SeatLayoutBuilder, {
  type DraftSeat,
  type DraftStage,
  type SeatGradeOption,
} from "@/app/seller/_components/SeatLayoutBuilder";

export default function SeatLayoutPageClient({
  eventId,
  grades,
  initialStage,
  initialSeats,
  maxSeats,
  locked,
}: {
  eventId: string;
  grades: SeatGradeOption[];
  initialStage: DraftStage;
  initialSeats: DraftSeat[];
  maxSeats: number;
  locked: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  // 빌더 내부 state를 매번 리렌더하지 않고도 저장 시점의 최신 값을 읽기 위한 스냅샷
  const latest = useRef<{ stage: DraftStage; seats: DraftSeat[] }>({
    stage: initialStage,
    seats: initialSeats,
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/seller/event/${eventId}/seat-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: latest.current.stage,
          seats: latest.current.seats.map((s) => ({
            label: s.label,
            x: s.x,
            y: s.y,
            gradeId: s.gradeId,
            groupName: s.groupName,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "좌석 배치도 저장에 실패했습니다.");
      }
      toast.success("좌석 배치도를 저장했습니다.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (locked) {
    return (
      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        이미 판매되었거나 홀드 중인 좌석이 있어 배치도를 수정할 수 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SeatLayoutBuilder
        grades={grades}
        initialStage={initialStage}
        initialSeats={initialSeats}
        maxSeats={maxSeats}
        onChange={(stage, seats) => {
          latest.current = { stage, seats };
        }}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          배치도 저장
        </Button>
      </div>
    </div>
  );
}
