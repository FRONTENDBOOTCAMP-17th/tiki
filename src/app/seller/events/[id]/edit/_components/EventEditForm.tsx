"use client";

import { useRef, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import useToast from "@/hooks/useToast";
import SectionCard from "@/app/seller/registration/_components/SectionCard";
import LabelBox from "@/app/seller/registration/_components/LabelBox";
import EventImageFields, {
  type EventImageFieldsHandle,
} from "@/app/seller/_components/EventImageFields";
import { toMin, toTime } from "@/app/seller/events/date";
import type { EventDetail, CategoryOption } from "@/app/seller/events/types";

export interface SlotRow {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

const inputClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateLabel(date: string) {
  const parsed = new Date(date);
  return `${parsed.getMonth() + 1}/${parsed.getDate()} (${WEEKDAYS[parsed.getDay()]})`;
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name?: string;
  defaultValue?: string | number;
}) {
  return (
    <LabelBox label={label}>
      <input name={name} defaultValue={defaultValue} className={inputClass} />
    </LabelBox>
  );
}

interface Props {
  event: EventDetail;
  categories: CategoryOption[];
  initialThumbnail: string | null;
  initialDetails: string[];
  initialSlots: SlotRow[];
  orderCountBySlot: Record<string, number>;
}

export default function EventEditForm({
  event,
  categories,
  initialThumbnail,
  initialDetails,
  initialSlots,
  orderCountBySlot,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<EventImageFieldsHandle>(null);

  const detailHref = `/seller/events/${event.event_id}`;
  const run = (event.duration ?? 0) + (event.intermission ?? 0);

  const [times, setTimes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialSlots.map((s) => [s.slot_id, s.start_time.slice(0, 5)]),
    ),
  );
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  function toggleRemove(slotId: string) {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  }

  const slotsByDate = initialSlots.reduce<Record<string, SlotRow[]>>(
    (acc, slot) => {
      (acc[slot.date] ??= []).push(slot);
      return acc;
    },
    {},
  );

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const remainingSlots = initialSlots.filter(
      (slot) => !removed.has(slot.slot_id),
    );
    if (initialSlots.length > 0 && remainingSlots.length === 0) {
      toast.error("회차는 최소 한 개 이상이어야 해요");
      return;
    }

    setSaving(true);
    try {
      let thumbnail = "";
      let images: string[] = [];
      try {
        const resolved = await imageRef.current!.resolve();
        thumbnail = resolved.thumbnail;
        images = resolved.images;
      } catch {
        toast.error("이미지 업로드에 실패했어요");
        return;
      }

      const slots = remainingSlots.map((slot) => {
        const start = times[slot.slot_id];
        return {
          slotId: slot.slot_id,
          startTime: start,
          endTime: run > 0 ? toTime(toMin(start) + run) : start,
        };
      });

      const res = await fetch(`/api/seller/event/${event.event_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          categoryId: formData.get("categoryId"),
          description: formData.get("description"),
          venueName: formData.get("venueName"),
          venueAddress: formData.get("venueAddress"),
          venueDetailAddress: formData.get("venueDetailAddress"),
          thumbnail,
          images,
          slots,
          removedSlotIds: [...removed],
        }),
      });
      if (!res.ok) {
        toast.error("수정에 실패했습니다");
        return;
      }
      toast.success("수정했습니다");
      router.push(detailHref);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6 py-6">
      <header className="space-y-2">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={15} />
          이벤트 상세로
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이벤트 수정</h1>
          <p className="mt-1 text-sm text-gray-500">{event.title}</p>
        </div>
      </header>

      <SectionCard step={1} title="기본 정보">
        <Field label="공연명" name="title" defaultValue={event.title} />

        <div className="mt-4">
          <LabelBox label="카테고리">
            <select
              name="categoryId"
              defaultValue={event.category_id}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </LabelBox>
        </div>

        <div className="mt-4">
          <LabelBox label="공연 소개">
            <textarea
              name="description"
              defaultValue={event.description ?? ""}
              className={`${inputClass} min-h-24`}
            />
          </LabelBox>
        </div>
      </SectionCard>

      <SectionCard step={2} title="공연 장소">
        <Field
          label="공연 장소명"
          name="venueName"
          defaultValue={event.venue_name}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="기본 주소"
            name="venueAddress"
            defaultValue={event.venue_address}
          />
          <Field
            label="상세 주소"
            name="venueDetailAddress"
            defaultValue={event.venue_detail_address ?? ""}
          />
        </div>
      </SectionCard>

      <SectionCard step={3} title="회차 시간">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <span>
            공연 기간{" "}
            <span className="font-medium text-gray-700">
              {event.start_date} ~ {event.end_date}
            </span>
          </span>
          <span>
            공연 시간{" "}
            <span className="font-medium text-gray-700">
              {event.duration ?? "-"}분
            </span>
          </span>
          {event.intermission ? (
            <span>
              인터미션{" "}
              <span className="font-medium text-gray-700">
                {event.intermission}분
              </span>
            </span>
          ) : null}
          <span className="text-xs text-gray-400">· 변경 불가</span>
        </div>

        {initialSlots.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 회차가 없습니다</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">
              회차 시작 시간을 바꾸거나 회차를 제거할 수 있어요. 예매가 있는
              회차는 제거할 수 없어요.
            </p>
            <div className="max-h-112 space-y-3 overflow-auto pr-1">
              {Object.entries(slotsByDate).map(([date, slots]) => (
                <div key={date} className="rounded-xl border border-gray-100 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    {formatDateLabel(date)}
                  </p>
                  <div className="space-y-2">
                    {slots.map((slot, index) => {
                      const start = times[slot.slot_id];
                      const orders = orderCountBySlot[slot.slot_id] ?? 0;
                      const isRemoved = removed.has(slot.slot_id);
                      return (
                        <div
                          key={slot.slot_id}
                          className={`flex items-center gap-3 ${isRemoved ? "opacity-50" : ""}`}
                        >
                          <span className="w-12 shrink-0 text-xs text-gray-400">
                            {index + 1}회차
                          </span>
                          <input
                            type="time"
                            value={start}
                            disabled={isRemoved}
                            onChange={(e) =>
                              setTimes((prev) => ({
                                ...prev,
                                [slot.slot_id]: e.target.value,
                              }))
                            }
                            className={`${inputClass} disabled:bg-gray-50 ${isRemoved ? "line-through" : ""}`}
                          />
                          {run > 0 && (
                            <span className="text-xs text-gray-400">
                              ~ {toTime(toMin(start) + run)}
                            </span>
                          )}

                          <div className="ml-auto">
                            {orders > 0 ? (
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                예매 {orders}건
                              </span>
                            ) : isRemoved ? (
                              <button
                                type="button"
                                onClick={() => toggleRemove(slot.slot_id)}
                                className="flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800"
                              >
                                <RotateCcw size={13} />
                                되돌리기
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleRemove(slot.slot_id)}
                                aria-label="회차 제거"
                                className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-danger-100 hover:text-danger-700"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard step={4} title="이미지">
        <EventImageFields
          ref={imageRef}
          initialThumbnail={initialThumbnail}
          initialDetails={initialDetails}
        />
      </SectionCard>

      <div className="sticky bottom-0 flex justify-end gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 backdrop-blur">
        <Button
          variant="outlinePrimary"
          type="button"
          onClick={() => router.push(detailHref)}
        >
          취소
        </Button>
        <Button type="submit" loading={saving}>
          저장하기
        </Button>
      </div>
    </form>
  );
}
