"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { hideEvent, publishEvent } from "../actions";

interface Event {
  event_id: string;
  title: string;
  status: string;
  seller_id: string;
  storeName: string;
  orderCount: number;
  created_at: string;
  start_date: string;
  end_date: string;
}

interface EventTableProps {
  events: Event[];
  currentStatus: string;
  statusCounts: Record<string, number>;
}

export default function EventTable({ events, currentStatus, statusCounts }: EventTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const allCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const statuses = ["all", ...Object.keys(statusCounts)];

  function applyFilter(s: string) {
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleToggle(eventId: string, currentStatus: string) {
    setActionTarget(eventId);
    startTransition(async () => {
      const result =
        currentStatus === "공개"
          ? await hideEvent(eventId)
          : await publishEvent(eventId);
      if (result.error) alert(result.error);
      setActionTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => applyFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              currentStatus === s
                ? "bg-primary-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? `전체 (${allCount})` : `${s} (${statusCounts[s] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">이벤트명</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">판매자</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">예매 수</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">공연 기간</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">등록일</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    이벤트가 없습니다
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.event_id} className="hover:bg-gray-50">
                    <td className="max-w-[240px] px-4 py-3">
                      <p className="truncate font-medium text-gray-900">{event.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.storeName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.status === "공개"
                            ? "bg-green-100 text-green-700"
                            : event.status === "비공개"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.orderCount}건</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {event.start_date} ~ {event.end_date}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(event.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggle(event.event_id, event.status)}
                        disabled={isPending && actionTarget === event.event_id}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                          event.status === "공개"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {isPending && actionTarget === event.event_id
                          ? "처리 중..."
                          : event.status === "공개"
                            ? "비공개 처리"
                            : "공개 처리"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          총 {events.length}개
        </div>
      </div>
    </div>
  );
}
