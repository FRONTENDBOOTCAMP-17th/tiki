"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Ticket,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import Button from "@/components/Button";
import Dialog from "@/components/modal/Dialog";
import Toggle from "@/components/Toggle";
import EventStatusBadge from "@/app/seller/_components/EventStatusBadge";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: 1 | -1) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: dir * container.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  const time = event.start_time ? event.start_time.slice(0, 5) : "-";
  const nextStatus = event.status === "공개" ? "비공개" : "공개";
  const capacity = stats.totalOrders + stats.remainingSeats;
  const occupancy =
    capacity > 0 ? Math.round((stats.totalOrders / capacity) * 100) : 0;

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

  async function onDeleteConfirm() {
    if (deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/seller/event/${event.event_id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        body?.message === "event_has_orders"
          ? "예매 내역이 있어 삭제할 수 없습니다"
          : "삭제에 실패했습니다";
      toast.error(message);
      setDeleting(false);
      setDeleteOpen(false);
      return;
    }
    toast.success("게시물을 삭제했습니다");
    // 삭제된 이벤트는 본인 목록에서도 사라지므로 목록으로 이동
    router.push("/seller/list");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{event.title}</h1>
          <EventStatusBadge status={event.status} />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seller/ticketManagement">
            <Button size="sm" variant="outlinePrimary">
              <Ticket className="h-4 w-4" />
              예매 관리
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outlinePrimary"
            onClick={() => router.push(`/seller/events/${event.event_id}/seat-layout`)}
          >
            <LayoutGrid className="h-4 w-4" />
            좌석 배치도
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/seller/events/${event.event_id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            수정
          </Button>
          <Button
            size="sm"
            variant="outlineDanger"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="relative h-60 overflow-hidden rounded-2xl bg-gray-100 dark:bg-surface-2">
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
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
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

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">예매율</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {occupancy}% · {stats.totalOrders}/{capacity}석
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-surface-3">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300">
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
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">이미지</h2>
          <div className="relative">
            <div
              ref={scrollRef}
              className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth"
            >
              {images.map((img) => (
                <div
                  key={img.image_id}
                  className="relative h-40 w-64 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-2"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollByDir(-1)}
                  aria-label="이전 이미지"
                  className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow ring-1 ring-gray-200 hover:bg-white dark:bg-surface-1/90 dark:text-gray-100 dark:ring-surface-3 dark:hover:bg-surface-4"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByDir(1)}
                  aria-label="다음 이미지"
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow ring-1 ring-gray-200 hover:bg-white dark:bg-surface-1/90 dark:text-gray-100 dark:ring-surface-3 dark:hover:bg-surface-4"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {event.description && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-50">소개</h2>
          <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
            {event.description}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">회차</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 회차가 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-surface-3">
            {slots.map((s) => (
              <div
                key={s.slot_id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-gray-50">{s.date}</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {s.start_time?.slice(0, 5)} ~ {s.end_time?.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">티켓 등급</h2>
        {grades.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 등급이 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-surface-3">
            {grades.map((g) => (
              <div
                key={g.grade_id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {g.grade_name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
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

      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="게시물 삭제"
        confirmText={deleting ? "삭제 중..." : "삭제"}
        confirmVariant="danger"
        cancelText="취소"
        onConfirm={onDeleteConfirm}
        confirmDisabled={deleting}
      >
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">{event.title}</span> 공연을
            삭제하시겠습니까?
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            삭제하면 목록에서 사라지고 구매자에게 노출되지 않습니다. 예매 내역이 있는
            공연은 삭제할 수 없습니다.
          </p>
        </div>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{value}</p>
    </div>
  );
}
