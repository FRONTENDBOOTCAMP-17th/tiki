"use client";

import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { EventListItem } from "../types";

interface Props {
  event: EventListItem;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: Props) {
  const time = event.start_time ? event.start_time.slice(0, 5) : "-";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm"
    >
      <div className="flex gap-5">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
              no image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {event.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                event.status === "공개"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {event.status}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-500">
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

          <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
            <div>
              <p className="text-xs text-gray-500">예매</p>
              <p className="text-sm font-semibold text-gray-900">
                {event.totalOrders.toLocaleString()}건
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">잔여</p>
              <p className="text-sm font-semibold text-gray-900">
                {event.remainingSeats.toLocaleString()}석
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">매출</p>
              <p className="text-sm font-semibold text-gray-900">
                {event.totalRevenue.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
