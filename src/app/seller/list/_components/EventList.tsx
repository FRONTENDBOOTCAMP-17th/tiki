"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, CalendarDays, Ticket, Banknote } from "lucide-react";

import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import PageHeader from "@/app/seller/_components/PageHeader";
import EventCard from "./EventCard";

import type { EventListItem } from "../types";

export default function EventList({ events }: { events: EventListItem[] }) {
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
    <div className="mx-auto max-w-7xl space-y-8 py-8">
      <PageHeader
        title="이벤트 관리"
        actions={
          <Link href="/seller/registration">
            <Button>
              <Plus size={16} />새 이벤트 등록
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="총 이벤트"
          value={`${events.length}개`}
          tone="primary"
        />
        <StatCard
          icon={Ticket}
          label="총 예매"
          value={`${totalOrders.toLocaleString()}건`}
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="총 매출"
          value={`${totalRevenue.toLocaleString()}원`}
          tone="accent"
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
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
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
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-100 dark:placeholder:text-gray-500 sm:w-72"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            이벤트가 없습니다
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.event_id}
              event={event}
              href={`/seller/events/${event.event_id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
