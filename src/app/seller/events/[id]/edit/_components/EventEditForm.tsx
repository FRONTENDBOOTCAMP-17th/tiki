"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import useToast from "@/hooks/useToast";
import SectionCard from "@/app/seller/registration/_components/SectionCard";
import LabelBox from "@/app/seller/registration/_components/LabelBox";
import type { EventDetail, CategoryOption } from "@/app/seller/events/types";

const inputClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500";

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
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
}

export default function EventEditForm({ event, categories }: Props) {
  const router = useRouter();
  const toast = useToast();

  async function onSave(formData: FormData) {
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
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        startTime: formData.get("startTime"),
        duration: formData.get("duration"),
        intermission: formData.get("intermission"),
      }),
    });
    if (!res.ok) {
      toast.error("수정에 실패했습니다");
      return;
    }
    toast.success("수정했습니다");
    router.push("/seller/list");
  }

  return (
    <form action={onSave} className="mx-auto max-w-3xl space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">이벤트 수정</h1>
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

      <SectionCard step={2} title="일정 · 장소">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="시작일"
            name="startDate"
            defaultValue={event.start_date}
          />
          <Field label="종료일" name="endDate" defaultValue={event.end_date} />
          <Field
            label="시작 시간"
            name="startTime"
            defaultValue={event.start_time?.slice(0, 5)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="공연 시간 (분)"
            name="duration"
            defaultValue={event.duration ?? ""}
          />
          <Field
            label="인터미션 (분)"
            name="intermission"
            defaultValue={event.intermission ?? ""}
          />
        </div>

        <div className="mt-4">
          <Field
            label="공연 장소명"
            name="venueName"
            defaultValue={event.venue_name}
          />
        </div>

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

      <div className="flex justify-end gap-3">
        <Button
          size="sm"
          variant="outlinePrimary"
          type="button"
          onClick={() => router.push("/seller/list")}
        >
          취소
        </Button>
        <Button size="sm" type="submit">
          저장
        </Button>
      </div>
    </form>
  );
}
