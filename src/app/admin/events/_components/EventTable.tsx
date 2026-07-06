"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, CirclePause, CirclePlay, Trash2, RotateCcw } from "lucide-react";
import type { CategoryRow } from "@/lib/api/categories";
import { hideEvent, publishEvent, deleteEvent, restoreEvent } from "../actions";

interface Event {
  event_id: string;
  index: number;
  title: string;
  status: string;
  categoryName: string;
  start_date: string;
  partyCount: number;
  deleted_at: string | null;
}

interface EventTableProps {
  events: Event[];
  categories: CategoryRow[];
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
}

// DB 상태 → 화면 표시 (프로젝트 테마 컬러 사용)
const DB_TO_DISPLAY: Record<string, { label: string; className: string }> = {
  공개: { label: "승인", className: "bg-emerald-100 text-emerald-700" },
  일시정지: { label: "예매 일시중지", className: "bg-warning-100 text-warning-700" },
  비공개: { label: "비공개", className: "bg-gray-100 text-gray-600" },
};

function getStatusDisplay(dbStatus: string) {
  return (
    DB_TO_DISPLAY[dbStatus] ?? {
      label: dbStatus,
      className: "bg-primary-100 text-primary-700",
    }
  );
}

// 화면 상태 필터 목록
const STATUS_FILTERS = ["전체", "승인", "대기", "신고", "예매 일시중지", "삭제됨"];

// 화면 상태 → URL param
const DISPLAY_TO_PARAM: Record<string, string> = {
  전체: "all",
  승인: "승인",
  대기: "대기",
  신고: "신고",
  "예매 일시중지": "예매 일시중지",
  삭제됨: "삭제됨",
};

export default function EventTable({
  events,
  categories,
  currentSearch,
  currentCategory,
  currentStatus,
}: EventTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      search: currentSearch,
      category: currentCategory,
      status: currentStatus,
      ...overrides,
    };
    if (merged.search) params.set("search", merged.search);
    if (merged.category && merged.category !== "all") params.set("category", merged.category);
    if (merged.status && merged.status !== "all") params.set("status", merged.status);
    return `${pathname}?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search }));
  }

  async function handleHide(eventId: string) {
    setActionTarget(eventId);
    startTransition(async () => {
      const result = await hideEvent(eventId);
      if (result.error) alert(result.error);
      else router.refresh();
      setActionTarget(null);
    });
  }

  async function handlePublish(eventId: string) {
    setActionTarget(eventId);
    startTransition(async () => {
      const result = await publishEvent(eventId);
      if (result.error) alert(result.error);
      else router.refresh();
      setActionTarget(null);
    });
  }

  async function handleDelete(eventId: string) {
    if (!confirm("이벤트를 삭제하시겠습니까? 삭제된 게시물은 '삭제됨' 필터에서 확인·복구할 수 있습니다.")) return;
    setActionTarget(eventId);
    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (result.error) alert(result.error);
      else router.refresh();
      setActionTarget(null);
    });
  }

  async function handleRestore(eventId: string) {
    setActionTarget(eventId);
    startTransition(async () => {
      const result = await restoreEvent(eventId);
      if (result.error) alert(result.error);
      else router.refresh();
      setActionTarget(null);
    });
  }

  const isProcessing = (id: string) => isPending && actionTarget === id;

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="이벤트 제목 또는 카테고리 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </form>

      {/* 장르별 필터 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">장르별 필터</p>
        <div className="flex flex-wrap gap-2">
          {[{ slug: "all", category_name: "전체" }, ...categories].map((cat) => {
            const slug = "slug" in cat ? cat.slug : "all";
            const isActive = currentCategory === slug || (slug === "all" && currentCategory === "all");
            return (
              <button
                key={slug}
                onClick={() => router.push(buildUrl({ category: slug }))}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
                }`}
              >
                {cat.category_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 상태별 필터 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">상태별 필터</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((label) => {
            const param = DISPLAY_TO_PARAM[label];
            const isActive = currentStatus === param || (param === "all" && currentStatus === "all");
            return (
              <button
                key={label}
                onClick={() => router.push(buildUrl({ status: param }))}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-surface-3 dark:bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-surface-3 dark:text-gray-400">
                <th className="w-14 px-5 py-3.5 font-medium">ID</th>
                <th className="px-5 py-3.5 font-medium">제목</th>
                <th className="px-5 py-3.5 font-medium">카테고리</th>
                <th className="px-5 py-3.5 font-medium">시작일</th>
                <th className="px-5 py-3.5 font-medium">파티 수</th>
                <th className="px-5 py-3.5 font-medium">상태</th>
                <th className="px-5 py-3.5 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-surface-3">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    이벤트가 없습니다
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const isDeleted = !!event.deleted_at;
                  const display = isDeleted
                    ? { label: "삭제됨", className: "bg-danger-100 text-danger-700" }
                    : getStatusDisplay(event.status);
                  const isPublic = !isDeleted && event.status === "공개";
                  const isSuspended = !isDeleted && event.status === "일시정지";
                  const processing = isProcessing(event.event_id);

                  return (
                    <tr
                      key={event.event_id}
                      className="hover:bg-gray-50/60 dark:hover:bg-surface-2"
                    >
                      <td className="px-5 py-4 text-gray-400">{event.index}</td>
                      <td className="max-w-60 px-5 py-4">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                          {event.title}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {event.categoryName}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {event.start_date}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {event.partyCount}개
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${display.className}`}>
                          {display.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {isDeleted && (
                            <button
                              onClick={() => handleRestore(event.event_id)}
                              disabled={processing}
                              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40"
                            >
                              <RotateCcw size={14} />
                              복구
                            </button>
                          )}
                          {isPublic && (
                            <button
                              onClick={() => handleHide(event.event_id)}
                              disabled={processing}
                              className="flex items-center gap-1 text-sm font-medium text-warning-600 hover:text-warning-700 disabled:opacity-40"
                            >
                              <CirclePause size={14} />
                              예매 일시정지
                            </button>
                          )}
                          {isSuspended && (
                            <button
                              onClick={() => handlePublish(event.event_id)}
                              disabled={processing}
                              className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                            >
                              <CirclePlay size={14} />
                              일시정지 해제
                            </button>
                          )}
                          {!isDeleted && (
                            <button
                              onClick={() => handleDelete(event.event_id)}
                              disabled={processing}
                              className="flex items-center gap-1 text-sm font-medium text-danger-500 hover:text-danger-600 disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 dark:border-surface-3">
          총 {events.length}개
        </div>
      </div>
    </div>
  );
}
