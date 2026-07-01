"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UpcomingItem } from "@/lib/event/upcoming";
import type { CategoryRow } from "@/lib/api/categories";
import { revalidateOpen } from "./actions";

function calcDDay(startDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-DAY";
  return `D-${diff}`;
}

function formatStartDate(dateStr: string) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

// "2026-06-24T14:30:00.000Z" → "6월 24일 23:30 기준" (로컬 시간)
function formatGeneratedAt(iso: string) {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hh}:${mm} 기준`;
}

function UpcomingCard({ item }: { item: UpcomingItem }) {
  const dday = calcDDay(item.startDate);

  return (
    <li>
      <Link
        href={`/${item.eventId}`}
        className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 transition-shadow hover:shadow-md dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:hover:bg-[#303134]"
      >
        <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-100 py-2.5 text-center">
          <span className="text-xs font-bold text-primary-700">{dday}</span>
        </span>
        <div className="relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded-lg bg-linear-to-br from-primary-200 to-accent-200">
          {item.thumbnail && (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
            {item.title}
          </h3>
          <p className="text-xs font-medium text-accent-600">
            {formatStartDate(item.startDate)}
          </p>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.venueName}</span>
          </span>
          {item.minPrice != null && (
            <p className="mt-0.5 text-xs font-semibold text-primary-700">
              {item.minPrice.toLocaleString("ko-KR")}원~
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

export default function UpcomingTabs({
  initialItems,
  generatedAt,
  categories,
}: {
  initialItems: UpcomingItem[];
  generatedAt: string;
  categories: CategoryRow[];
}) {
  const TABS = [
    { slug: null, name: "전체" },
    ...categories.map(({ slug, category_name }) => ({ slug, name: category_name })),
  ];
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  function handleTab(slug: string | null) {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    startTransition(async () => {
      const params = new URLSearchParams({ limit: "20" });
      if (slug) params.set("slug", slug);
      const res = await fetch(`/api/events/upcoming?${params}`);
      const json = await res.json();
      setItems(json?.data?.items ?? []);
    });
  }

  function handleRefresh() {
    startRefresh(async () => {
      await revalidateOpen();
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:max-w-4xl lg:px-8">
      {/* 페이지 헤더 */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-gray-50 md:text-3xl">
          오픈 예정
        </h1>
        <p className="mt-2 text-sm text-gray-500">곧 예매가 열리는 공연</p>
      </header>

      {/* 탭 바 */}
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:mx-0 lg:px-0">
        {TABS.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug ?? "all"}
              type="button"
              onClick={() => handleTab(tab.slug)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-primary-300 hover:text-primary-700 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-100"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 기준 시각 + 리프레시 버튼 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">{formatGeneratedAt(generatedAt)}</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-40 dark:border-[#3c4043] dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "업데이트 중..." : "새로고침"}
        </button>
      </div>

      {/* 리스트 */}
      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        {items.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            오픈 예정인 공연이 없어요.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-400">
              총{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {items.length}개
              </span>
              의
              공연이 오픈 예정이에요.
            </p>
            <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3">
              {items.map((item) => (
                <UpcomingCard key={item.eventId} item={item} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
