"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, Ticket, Banknote } from "lucide-react";

import Button from "@/components/Button";
import EventCard from "./EventCard";

import type { EventListItem } from "../types";

export default function EventList({ events }: { events: EventListItem[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState<"전체" | "공개" | "비공개">("전체");

  const totalOrders = events.reduce((sum, e) => sum + e.totalOrders, 0);
  const totalRevenue = events.reduce((sum, e) => sum + e.totalRevenue, 0);

  const tabs = [
    { label: "전체", count: events.length },
    { label: "공개", count: events.filter((e) => e.status === "공개").length },
    {
      label: "비공개",
      count: events.filter((e) => e.status === "비공개").length,
    },
  ] as const;

  const filtered = events.filter((e) => {
    const matchKeyword =
      e.title.toLowerCase().includes(keyword.toLowerCase()) ||
      e.venue_name.toLowerCase().includes(keyword.toLowerCase());
    const matchTab = tab === "전체" || e.status === tab;
    return matchKeyword && matchTab;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>

        <Link href="/seller/registration">
          <Button>
            <Plus size={16} />새 이벤트 등록
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ListHeadCard
          icon={CalendarDays}
          label="총 이벤트"
          value={`${events.length}개`}
          color="bg-primary-100 text-primary-700"
        />
        <ListHeadCard
          icon={Ticket}
          label="총 예매"
          value={`${totalOrders.toLocaleString()}건`}
          color="bg-blue-100 text-blue-600"
        />
        <ListHeadCard
          icon={Banknote}
          label="총 매출"
          value={`${totalRevenue.toLocaleString()}원`}
          color="bg-green-100 text-green-600"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.label)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab === t.label
                  ? "bg-primary-700 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.label} <span className="text-xs">{t.count}</span>
            </button>
          ))}
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이벤트명 / 장소 검색"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 sm:w-72"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            이벤트가 없습니다
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.event_id}
              event={event}
              onClick={() => router.push(`/seller/events/${event.event_id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ListHeadCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
