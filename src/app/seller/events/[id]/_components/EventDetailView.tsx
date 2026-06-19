"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, MapPin, Pencil } from "lucide-react";
import Button from "@/components/Button";
import Dialog from "@/components/modal/Dialog";
import Toggle from "@/components/Toggle";
import useToast from "@/hooks/useToast";
import type { EventDetail, Grade, Slot } from "@/app/seller/events/types";

interface Props {
  event: EventDetail;
  grades: Grade[];
  images: { image_id: string; url: string }[];
  slots: Slot[];
  stats: { totalOrders: number; remainingSeats: number; totalRevenue: number };
}

export default function EventDetailView({
  event,
  grades,
  images,
  slots,
  stats,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [statusOpen, setStatusOpen] = useState(false);

  const time = event.start_time ? event.start_time.slice(0, 5) : "-";
  const nextStatus = event.status === "공개" ? "비공개" : "공개";

  async function onStatusConfirm() {
    const res = await fetch(`/api/seller/event/${event.event_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setStatusOpen(false);
    if (!res.ok) {
      toast.error("변경에 실패했습니다");
      return;
    }
    toast.success(`${nextStatus}로 전환했습니다`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              event.status === "공개"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {event.status}
          </span>
        </div>

        <Button
          size="sm"
          onClick={() => router.push(`/seller/events/${event.event_id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
          수정
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="relative h-60 overflow-hidden rounded-2xl bg-gray-100">
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              sizes="260px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="예매"
                value={`${stats.totalOrders.toLocaleString()}건`}
              />
              <Stat
                label="잔여"
                value={`${stats.remainingSeats.toLocaleString()}석`}
              />
              <Stat
                label="매출"
                value={`${stats.totalRevenue.toLocaleString()}원`}
              />
            </div>
          </section>

          <section className="space-y-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-gray-400" />
              {event.venue_name} · {event.venue_address}
              {event.venue_detail_address
                ? ` (${event.venue_detail_address})`
                : ""}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-gray-400" />
              {event.start_date} ~ {event.end_date}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-gray-400" />
              {time} · {event.duration ?? "-"}분
              {event.intermission ? ` (인터미션 ${event.intermission}분)` : ""}
            </div>
          </section>
        </div>
      </div>

      <Toggle
        name="status"
        title="공개 설정"
        description="켜면 관객에게 노출됩니다"
        checked={event.status === "공개"}
        onChange={() => setStatusOpen(true)}
      />

      {images.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">이미지</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.image_id}
                className="relative aspect-video overflow-hidden rounded-xl bg-gray-100"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {event.description && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 font-semibold text-gray-900">소개</h2>
          <p className="whitespace-pre-line text-sm text-gray-600">
            {event.description}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">회차</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 회차가 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {slots.map((s) => (
              <div
                key={s.slot_id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-gray-900">{s.date}</span>
                <span className="text-gray-600">
                  {s.start_time?.slice(0, 5)} ~ {s.end_time?.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">티켓 등급</h2>
        {grades.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 등급이 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {grades.map((g) => (
              <div
                key={g.grade_id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {g.grade_name}
                </span>
                <span className="text-sm text-gray-600">
                  {g.price.toLocaleString()}원 · {g.quantity}석
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="공개 설정 변경"
        description={`${nextStatus}로 전환하시겠습니까?`}
        confirmText="전환하기"
        onConfirm={onStatusConfirm}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
