"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, Pencil } from "lucide-react";
import Button from "@/components/Button";
import useToast from "@/hooks/useToast";
import type { EventListItem } from "../types";

interface Props {
  event: EventListItem;
  href: string;
}

export default function EventCard({ event, href }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const time = event.start_time ? event.start_time.slice(0, 5) : "-";
  const isPublic = event.status === "공개";
  const nextStatus = isPublic ? "비공개" : "공개";

  async function toggleStatus() {
    setBusy(true);
    try {
      const res = await fetch(`/api/seller/event/${event.event_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${nextStatus}로 전환했어요`);
      router.refresh();
    } catch {
      toast.error("상태 전환에 실패했어요");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:border-gray-500">
      <div className="flex gap-5">
        <Link
          href={href}
          className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100"
        >
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              이미지 없음
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <Link href={href} className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 hover:text-primary-700 dark:text-gray-50 dark:hover:text-gray-200">
                {event.title}
              </h3>
            </Link>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={toggleStatus}
              disabled={busy}
              className="flex shrink-0 items-center gap-2 disabled:opacity-50"
            >
              <span className="text-xs font-medium text-gray-500">
                {isPublic ? "공개" : "비공개"}
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  isPublic ? "bg-primary-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isPublic ? "translate-x-4" : ""
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              {event.venue_name}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {event.start_date} ~ {event.end_date}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              {time}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#303134]">
            <div>
              <p className="text-xs text-gray-500">예매</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {event.totalOrders.toLocaleString()}건
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">잔여</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {event.remainingSeats.toLocaleString()}석
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">매출</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {event.totalRevenue.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-[#3c4043]">
        <Link href={`${href}/edit`}>
          <Button size="sm" variant="outlinePrimary">
            <Pencil size={14} />
            수정
          </Button>
        </Link>
        <Link href={href}>
          <Button size="sm">상세 보기</Button>
        </Link>
      </div>
    </div>
  );
}
