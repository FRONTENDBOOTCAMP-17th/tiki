"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import Button from "@/components/Button";
import BookingCalendar from "@/components/event/BookingCalendar";
import AddressSearch from "@/components/AddressSearch";
import useToast from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import {
  toMin,
  toTime,
  datesBetween,
  monthDates,
} from "@/app/seller/events/date";
import Notice from "@/components/Notice";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";
import SectionCard from "./SectionCard";
import LabelBox from "./LabelBox";
import type { CategoryOption } from "@/app/seller/events/types";

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500";

const fileClass =
  "text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700";

type FormErrors = Partial<Record<string, string>>;

function formText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(value: FormDataEntryValue | null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function EventCreateForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const lastOverlapToast = useRef("");

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [duration, setDuration] = useState("");
  const [intermission, setIntermission] = useState("");
  const run = (Number(duration) || 0) + (Number(intermission) || 0);

  const [startMonth, setStartMonth] = useState(thisMonth);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endMonth, setEndMonth] = useState(thisMonth);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [banMonth, setBanMonth] = useState(thisMonth);
  const [banned, setBanned] = useState<string[]>([]);

  const [times, setTimes] = useState<string[]>([""]);

  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const endOf = (start: string) => (start ? toTime(toMin(start) + run) : "");

  const rangeDates =
    startDate && endDate && startDate <= endDate
      ? new Set(datesBetween(startDate, endDate))
      : new Set<string>();

  const toggleBan = (date: string) =>
    setBanned((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );

  const hasTimeOverlap = (list: string[], nextRun = run) => {
    const filled = list.filter(Boolean).sort();
    if (filled.length < 2 || nextRun <= 0) return false;

    for (let i = 1; i < filled.length; i++) {
      if (toMin(filled[i]) < toMin(filled[i - 1]) + nextRun) return true;
    }

    return false;
  };

  const syncTimeError = (list: string[], nextRun = run) => {
    if (hasTimeOverlap(list, nextRun)) {
      const key = `${list.join(",")}-${nextRun}`;
      if (lastOverlapToast.current !== key) {
        toast.error("회차 시간이 겹쳐요");
        lastOverlapToast.current = key;
      }
      setErrors((prev) => ({
        ...prev,
        times: "회차 시간이 서로 겹치지 않게 입력해주세요",
      }));
      return;
    }

    lastOverlapToast.current = "";
    setErrors((prev) => {
      const next = { ...prev };
      delete next.times;
      return next;
    });
  };

  const changeDuration = (value: string) => {
    setDuration(value);
    syncTimeError(times, (Number(value) || 0) + (Number(intermission) || 0));
  };

  const changeIntermission = (value: string) => {
    setIntermission(value);
    syncTimeError(times, (Number(duration) || 0) + (Number(value) || 0));
  };

  const changeTime = (i: number, value: string) => {
    const next = times.map((t, idx) => (idx === i ? value : t));
    setTimes(next);
    syncTimeError(next);
  };

  const addTime = () => {
    if (times.length >= SELLER_EVENT_LIMITS.maxTimesPerDay) {
      toast.error(`하루 회차는 최대 ${SELLER_EVENT_LIMITS.maxTimesPerDay}개까지 등록할 수 있어요`);
      return;
    }
    setTimes((prev) => [...prev, ""]);
  };

  const removeTime = (i: number) => {
    const next = times.filter((_, idx) => idx !== i);
    setTimes(next);
    syncTimeError(next);
  };

  const pickImages = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const oversized = selected.some(
      (file) => file.size > SELLER_EVENT_LIMITS.maxImageSizeMb * 1024 * 1024,
    );

    if (oversized) {
      toast.error(`이미지는 ${SELLER_EVENT_LIMITS.maxImageSizeMb}MB 이하만 등록할 수 있어요`);
      return;
    }

    setImages((prev) => {
      const next = [...prev, ...selected].slice(
        0,
        SELLER_EVENT_LIMITS.maxImagesPerEvent,
      );
      if (prev.length + selected.length > SELLER_EVENT_LIMITS.maxImagesPerEvent) {
        toast.error(`이미지는 최대 ${SELLER_EVENT_LIMITS.maxImagesPerEvent}장까지 등록할 수 있어요`);
      }
      return next;
    });
  };
  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  function validateForm(formData: FormData) {
    const nextErrors: FormErrors = {};
    const title = formText(formData.get("title"));
    const categoryId = formText(formData.get("categoryId"));
    const venueName = formText(formData.get("venueName"));
    const venueAddress = address.trim();
    const durationNum = Number(duration);
    const intermissionNum = Number(intermission || 0);
    const list = times.filter(Boolean);
    const generalPrice = formNumber(formData.get("generalPrice"));
    const generalQty = formNumber(formData.get("generalQty"));
    const vipPriceText = formText(formData.get("vipPrice"));
    const vipQtyText = formText(formData.get("vipQty"));
    const vipPrice = formNumber(formData.get("vipPrice"));
    const vipQty = formNumber(formData.get("vipQty"));

    if (!title) nextErrors.title = "공연명을 입력하세요";
    else if (title.length > SELLER_EVENT_LIMITS.maxTitleLength) {
      nextErrors.title = `${SELLER_EVENT_LIMITS.maxTitleLength}자 이하로 입력하세요`;
    }
    if (!categoryId) nextErrors.categoryId = "카테고리를 선택하세요";
    if (!startDate) nextErrors.startDate = "시작일을 선택하세요";
    if (!endDate) nextErrors.endDate = "종료일을 선택하세요";
    if (startDate && endDate && startDate > endDate) {
      nextErrors.endDate = "종료일은 시작일 이후로 선택하세요";
    }
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      nextErrors.duration = "공연 시간을 입력하세요";
    } else if (
      durationNum < SELLER_EVENT_LIMITS.minDuration ||
      durationNum > SELLER_EVENT_LIMITS.maxDuration
    ) {
      nextErrors.duration = `${SELLER_EVENT_LIMITS.minDuration}~${SELLER_EVENT_LIMITS.maxDuration}분 사이로 입력하세요`;
    }
    if (
      !Number.isFinite(intermissionNum) ||
      intermissionNum < 0 ||
      intermissionNum > SELLER_EVENT_LIMITS.maxIntermission
    ) {
      nextErrors.intermission = `인터미션은 0~${SELLER_EVENT_LIMITS.maxIntermission}분 사이로 입력하세요`;
    }
    if (list.length === 0) nextErrors.times = "회차 시간을 입력하세요";
    if (hasTimeOverlap(times)) {
      nextErrors.times = "회차 시간이 서로 겹치지 않게 입력해주세요";
    }
    if (!generalPrice || generalPrice <= 0) {
      nextErrors.generalPrice = "일반석 가격을 입력하세요";
    }
    if (!generalQty || generalQty <= 0) {
      nextErrors.generalQty = "일반석 좌석 수를 입력하세요";
    }
    if ((vipPriceText || vipQtyText) && (!vipPrice || !vipQty)) {
      nextErrors.vip = "VIP석을 쓰려면 가격과 좌석 수를 모두 입력하세요";
    }
    if (generalQty + vipQty > SELLER_EVENT_LIMITS.maxSeatsPerEvent) {
      nextErrors.seats = `총 좌석은 ${SELLER_EVENT_LIMITS.maxSeatsPerEvent}석 이하로 입력하세요`;
    }
    if (generalPrice > SELLER_EVENT_LIMITS.maxPrice || vipPrice > SELLER_EVENT_LIMITS.maxPrice) {
      nextErrors.price = `${SELLER_EVENT_LIMITS.maxPrice.toLocaleString()}원 이하로 입력하세요`;
    }
    if (!venueName) nextErrors.venueName = "공연 장소명을 입력하세요";
    if (!venueAddress) nextErrors.venueAddress = "기본 주소를 선택하세요";

    if (startDate && endDate && startDate <= endDate) {
      const dates = datesBetween(startDate, endDate).filter(
        (d) => !banned.includes(d),
      );
      if (dates.length === 0) nextErrors.startDate = "회차가 열릴 날짜가 필요해요";
      if (dates.length * list.length > SELLER_EVENT_LIMITS.maxSlotsPerEvent) {
        nextErrors.times = `전체 회차는 최대 ${SELLER_EVENT_LIMITS.maxSlotsPerEvent}개까지 등록할 수 있어요`;
      }
      if (dates.length > SELLER_EVENT_LIMITS.maxDateRangeDays) {
        nextErrors.endDate = `공연 기간은 최대 ${SELLER_EVENT_LIMITS.maxDateRangeDays}일까지 설정할 수 있어요`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(formData: FormData) {
    if (!validateForm(formData)) return;

    if (!startDate || !endDate) return;

    const list = times.filter(Boolean);
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
          <SectionCard step={1} title="기본 정보">
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="공연명 *">
                <input
                  name="title"
                  maxLength={SELLER_EVENT_LIMITS.maxTitleLength}
                  className={inputClass}
                  placeholder="미드나잇 라이브 2026"
                />
                {errors.title && (
                  <p className="text-xs text-danger-700">{errors.title}</p>
                )}
              </LabelBox>
              <LabelBox label="카테고리" error={errors.categoryId}>
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
                  maxLength={SELLER_EVENT_LIMITS.maxDescriptionLength}
                  className={`${inputClass} min-h-28`}
                  placeholder="공연 소개를 입력하세요"
                />
              </LabelBox>
            </div>
          </SectionCard>

          <SectionCard step={2} title="공연 일정">
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
                {errors.startDate && (
                  <p className="mt-2 text-xs text-danger-700">
                    {errors.startDate}
                  </p>
                )}
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
                {errors.endDate && (
                  <p className="mt-2 text-xs text-danger-700">
                    {errors.endDate}
                  </p>
                )}
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
                    onChange={(e) => changeDuration(e.target.value)}
                    className={`${inputClass} w-32`}
                    placeholder="공연 60"
                  />
                  <input
                    value={intermission}
                    onChange={(e) => changeIntermission(e.target.value)}
                    className={`${inputClass} w-32`}
                    placeholder="인터미션 20"
                  />
                </div>
              {(errors.duration || errors.intermission) && (
                <p className="text-xs text-danger-700">
                  {errors.duration ?? errors.intermission}
                </p>
              )}

              <p className="mt-2 text-sm font-medium text-gray-700">
                회차 시간
              </p>
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-gray-500">
                    {i + 1}회차
                  </span>
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
              {errors.times && (
                <p className="text-xs text-danger-700">{errors.times}</p>
              )}
              <Button type="button" variant="outlinePrimary" onClick={addTime}>
                <Plus size={16} />
                회차 추가
              </Button>
            </div>
          </SectionCard>

          <SectionCard step={3} title="좌석 및 가격">
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="일반석 가격" error={errors.generalPrice}>
                <input
                  name="generalPrice"
                  type="number"
                  min={1}
                  max={SELLER_EVENT_LIMITS.maxPrice}
                  className={inputClass}
                  placeholder="44000"
                />
              </LabelBox>
              <LabelBox label="일반석 좌석 수" error={errors.generalQty}>
                <input
                  name="generalQty"
                  type="number"
                  min={1}
                  max={SELLER_EVENT_LIMITS.maxSeatsPerEvent}
                  className={inputClass}
                  placeholder="150"
                />
              </LabelBox>
              <LabelBox label="VIP석 가격">
                <input
                  name="vipPrice"
                  type="number"
                  min={1}
                  max={SELLER_EVENT_LIMITS.maxPrice}
                  className={inputClass}
                  placeholder="88000"
                />
              </LabelBox>
              <LabelBox label="VIP석 좌석 수">
                <input
                  name="vipQty"
                  type="number"
                  min={1}
                  max={SELLER_EVENT_LIMITS.maxSeatsPerEvent}
                  className={inputClass}
                  placeholder="50"
                />
              </LabelBox>
            </div>
            {(errors.vip || errors.seats || errors.price) && (
              <p className="mt-3 text-xs text-danger-700">
                {errors.vip ?? errors.seats ?? errors.price}
              </p>
            )}
          </SectionCard>

          <SectionCard step={4} title="공연 장소">
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelBox label="공연 장소명 *" error={errors.venueName}>
                <input
                  name="venueName"
                  maxLength={SELLER_EVENT_LIMITS.maxVenueNameLength}
                  className={inputClass}
                  placeholder="올림픽홀"
                />
              </LabelBox>
              <LabelBox label="기본 주소 *" error={errors.venueAddress}>
                <AddressSearch
                  name="venueAddress"
                  value={address}
                  onChange={setAddress}
                />
              </LabelBox>
              <LabelBox label="상세 주소">
                <input
                  name="venueDetailAddress"
                  maxLength={SELLER_EVENT_LIMITS.maxVenueDetailLength}
                  className={inputClass}
                  placeholder="B1"
                />
              </LabelBox>
            </div>
          </SectionCard>

          <SectionCard step={5} title="이미지">
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
                    <Image
                      src={imagePreviews[i]}
                      alt={`${file.name} 미리보기`}
                      width={96}
                      height={96}
                      unoptimized
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

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-10">
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
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
          </div>

          <Notice
            title="등록 안내"
            list={[
              "공연명과 장소는 필수 입력 항목이에요.",
              "첫 번째 이미지가 대표 이미지로 쓰여요.",
              "회차 종료 시간은 공연·인터미션을 더해 자동 계산돼요.",
              "등록 직후엔 비공개 상태이며, 이벤트 관리에서 공개로 전환할 수 있어요.",
            ]}
          />
        </aside>
      </div>
    </form>
  );
}
