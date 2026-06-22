"use client";

import { useRef, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
}

export default function EventEditForm({
  event,
  categories,
  initialThumbnail,
  initialDetails,
  initialSlots,
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

      const slots = initialSlots.map((slot) => {
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
              회차 시작 시간만 수정할 수 있어요. 종료 시간은 자동 계산돼요.
            </p>
            <div className="max-h-96 space-y-3 overflow-auto pr-1">
              {Object.entries(slotsByDate).map(([date, slots]) => (
                <div
                  key={date}
                  className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0"
                >
                  <span className="w-20 shrink-0 pt-2 text-sm font-medium text-gray-700">
                    {formatDateLabel(date)}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    {slots.map((slot) => {
                      const start = times[slot.slot_id];
                      return (
                        <div
                          key={slot.slot_id}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="time"
                            value={start}
                            onChange={(e) =>
                              setTimes((prev) => ({
                                ...prev,
                                [slot.slot_id]: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          {start && run > 0 && (
                            <span className="text-xs text-gray-400">
                              ~{toTime(toMin(start) + run)}
                            </span>
                          )}
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
