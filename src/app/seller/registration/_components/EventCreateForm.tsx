"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import Button from "@/components/Button";
import BookingCalendar from "@/components/event/BookingCalendar";
import AddressSearch from "@/components/AddressSearch";
import useToast from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import { toMin, toTime, datesBetween, monthDates } from "@/app/seller/events/date";
import SectionCard from "./SectionCard";
import LabelBox from "./LabelBox";
import type { CategoryOption } from "@/app/seller/events/types";

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500";

const fileClass =
  "text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700";

export default function EventCreateForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 공연시간/인터미션은 모든 회차 동일하게 설저하도록 해두었습니다
  const [duration, setDuration] = useState("");
  const [intermission, setIntermission] = useState("");
  const run = (Number(duration) || 0) + (Number(intermission) || 0);

  const [startMonth, setStartMonth] = useState(thisMonth);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endMonth, setEndMonth] = useState(thisMonth);
  const [endDate, setEndDate] = useState<string | null>(null);

  // 금지일 = 회차 등록 밴할 날(x)
  const [banMonth, setBanMonth] = useState(thisMonth);
  const [banned, setBanned] = useState<string[]>([]);

  // 회차 시작시간들 스테이트 시간
  const [times, setTimes] = useState<string[]>([""]);

  // 주소랑 이미지 스테이트입니다
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);

  // 시작 + 공연 + 인터미션 = 종료시간 계산으로 해두었습니다
  const endOf = (start: string) => (start ? toTime(toMin(start) + run) : "");

  const rangeDates =
    startDate && endDate && startDate <= endDate
      ? new Set(datesBetween(startDate, endDate))
      : new Set<string>();

  // 금지일
  const toggleBan = (date: string) =>
    setBanned((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );

  const changeTime = (i: number, value: string) =>
    setTimes((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  const addTime = () => setTimes((prev) => [...prev, ""]);
  const removeTime = (i: number) =>
    setTimes((prev) => prev.filter((_, idx) => idx !== i));

  const pickImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };
  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  async function onSubmit(formData: FormData) {
    if (!startDate || !endDate || startDate > endDate) {
      toast.error("시작일과 종료일을 확인하세요");
      return;
    }
    const list = times.filter(Boolean);
    if (list.length === 0) {
      toast.error("회차 시간을 입력하세요");
      return;
    }

    // 회차끼리 겹치면 안 됨
    const sorted = [...list].sort();
    for (let i = 1; i < sorted.length; i++) {
      if (toMin(sorted[i]) < toMin(sorted[i - 1]) + run) {
        toast.error("회차 시간이 겹쳐요");
        return;
      }
    }

    // 금지일 빼고 날짜마다 회차 깔기
    const dates = datesBetween(startDate, endDate).filter(
      (d) => !banned.includes(d),
    );
    const slots = [];
    for (const date of dates) {
      for (const t of list) {
        slots.push({ date, startTime: t, endTime: endOf(t) });
      }
    }

    setUploading(true);
    try {
      const supabase = createClient();

      // 사진 스토리지에 올리고 url 받기 - supabase 연동 upload()
      const urls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { data } = await supabase.storage
          .from("event-images")
          .upload(path, file);
        if (data) {
          urls.push(
            supabase.storage.from("event-images").getPublicUrl(data.path).data
              .publicUrl,
          );
        }
      }

      const res = await fetch("/api/seller/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          categoryId: formData.get("categoryId"),
          description: formData.get("description"),
          duration,
          intermission,
          venueName: formData.get("venueName"),
          venueAddress: formData.get("venueAddress"),
          venueDetailAddress: formData.get("venueDetailAddress"),
          thumbnail: urls[0] ?? null,
          images: urls.slice(1),
          slots,
          grades: [
            {
              name: "일반석",
              price: formData.get("generalPrice"),
              quantity: formData.get("generalQty"),
            },
            {
              name: "VIP석",
              price: formData.get("vipPrice"),
              quantity: formData.get("vipQty"),
            },
          ],
        }),
      });
      if (!res.ok) {
        toast.error("등록에 실패했습니다");
        return;
      }
      toast.success("등록 완료! 이벤트 관리에서 공개로 전환하세요");
      router.push("/seller/list");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">새 이벤트 등록</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <SectionCard
            step={1}
            title="기본 정보"
            desc="이벤트의 기본 정보를 입력하세요"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="공연명 *">
                <input
                  name="title"
                  className={inputClass}
                  placeholder="미드나잇 라이브 2026"
                />
              </LabelBox>
              <LabelBox label="카테고리">
                <select name="categoryId" className={inputClass}>
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
                  className={`${inputClass} min-h-28`}
                  placeholder="공연 소개를 입력하세요"
                />
              </LabelBox>
            </div>
          </SectionCard>

          <SectionCard
            step={2}
            title="공연 일정"
            desc="공연 일정 및 회차를 선택해주세요. (종료시간은 자동 계산돼요)"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">시작일</p>
                <BookingCalendar
                  month={startMonth}
                  selectedDate={startDate}
                  availableDates={monthDates(startMonth)}
                  onMonthChange={setStartMonth}
                  onSelectDate={setStartDate}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">종료일</p>
                <BookingCalendar
                  month={endMonth}
                  selectedDate={endDate}
                  availableDates={monthDates(endMonth)}
                  onMonthChange={setEndMonth}
                  onSelectDate={setEndDate}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                금지일 (회차 제외할 날짜, 여러 개)
              </p>
              {rangeDates.size === 0 ? (
                <p className="text-sm text-gray-400">
                  시작일·종료일을 먼저 골라주세요
                </p>
              ) : (
                <>
                  <BookingCalendar
                    month={banMonth}
                    selectedDate={null}
                    availableDates={rangeDates}
                    onMonthChange={setBanMonth}
                    onSelectDate={toggleBan}
                  />
                  {banned.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {banned.map((d) => (
                        <span
                          key={d}
                          className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600"
                        >
                          {d}
                          <button type="button" onClick={() => toggleBan(d)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-700">
                공연 시간 / 인터미션 (분)
              </p>
              <div className="flex gap-3">
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`${inputClass} w-32`}
                  placeholder="공연 60"
                />
                <input
                  value={intermission}
                  onChange={(e) => setIntermission(e.target.value)}
                  className={`${inputClass} w-32`}
                  placeholder="인터미션 20"
                />
              </div>

              <p className="mt-2 text-sm font-medium text-gray-700">회차 시간</p>
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-gray-500">{i + 1}회차</span>
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => changeTime(i, e.target.value)}
                    className={inputClass}
                  />
                  {t && run > 0 && (
                    <span className="text-sm text-gray-400">~ {endOf(t)}</span>
                  )}
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outlinePrimary" onClick={addTime}>
                <Plus size={16} />
                회차 추가
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            step={3}
            title="좌석 및 가격"
            desc="일반석 / VIP석의 가격과 좌석 수를 입력해주세요."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="일반석 가격">
                <input
                  name="generalPrice"
                  className={inputClass}
                  placeholder="44000"
                />
              </LabelBox>
              <LabelBox label="일반석 좌석 수">
                <input
                  name="generalQty"
                  className={inputClass}
                  placeholder="150"
                />
              </LabelBox>
              <LabelBox label="VIP석 가격">
                <input
                  name="vipPrice"
                  className={inputClass}
                  placeholder="88000"
                />
              </LabelBox>
              <LabelBox label="VIP석 좌석 수">
                <input name="vipQty" className={inputClass} placeholder="50" />
              </LabelBox>
            </div>
          </SectionCard>

          <SectionCard
            step={4}
            title="공연 장소"
            desc="공연이 열리는 장소를 입력해주세요."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="공연 장소명 *">
                <input
                  name="venueName"
                  className={inputClass}
                  placeholder="올림픽홀"
                />
              </LabelBox>
              <LabelBox label="기본 주소 *">
                <AddressSearch
                  name="venueAddress"
                  value={address}
                  onChange={setAddress}
                />
              </LabelBox>
              <LabelBox label="상세 주소">
                <input
                  name="venueDetailAddress"
                  className={inputClass}
                  placeholder="B1"
                />
              </LabelBox>
            </div>
          </SectionCard>

          <SectionCard
            step={5}
            title="이미지"
            desc="첫 번째 사진이 대표 이미지가 돼요."
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => pickImages(e.target.files)}
              className={fileClass}
            />
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-primary-700 px-1.5 py-0.5 text-[10px] text-white">
                        대표
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-10">
          <Button type="submit" fullWidth loading={uploading}>
            등록하기
          </Button>
          <Button
            type="button"
            variant="outlinePrimary"
            fullWidth
            onClick={() => router.push("/seller/list")}
          >
            취소
          </Button>
          {/* notice 내용 생각해서 추가 예정입니다 */}
        </aside>
      </div>
    </form>
  );
}
