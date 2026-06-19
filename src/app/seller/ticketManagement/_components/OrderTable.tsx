"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ticket, Banknote, Search } from "lucide-react";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import Dialog from "@/components/modal/Dialog";
import { isCancelled, orderStatusLabel } from "../../_lib/stats";
import type { EventOption, OrderRow } from "../types";

interface Props {
  orders: OrderRow[];
  events: EventOption[];
}

function statusStyle(status: string) {
  if (isCancelled(status)) return "bg-danger-100 text-danger-700";
  if (status.includes("대기") || status.toLowerCase().includes("pending"))
    return "bg-amber-50 text-amber-600";
  return "bg-green-50 text-green-700";
}

function formatDateTime(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderTable({ orders, events }: Props) {
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState("all");
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchEvent = eventId === "all" || order.event_id === eventId;
        const matchKeyword =
          order.event_title.toLowerCase().includes(keyword.toLowerCase()) ||
          order.buyer_name.toLowerCase().includes(keyword.toLowerCase());
        return matchEvent && matchKeyword;
      }),
    [orders, eventId, keyword],
  );

  const validOrders = orders.filter((order) => !isCancelled(order.status));
  const totalQuantity = validOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">예매 관리</h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Ticket}
          label="총 예매"
          value={`${totalQuantity.toLocaleString()}건`}
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="총 결제액"
          value={`${totalRevenue.toLocaleString()}원`}
          tone="accent"
        />
        <StatCard
          icon={Ticket}
          label="주문 건수"
          value={`${orders.length.toLocaleString()}건`}
          tone="primary"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary-500"
        >
          <option value="all">전체 이벤트</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이벤트명 / 구매자 검색"
            className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-4 text-sm outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-medium">이벤트</th>
              <th className="px-5 py-3 font-medium">구매자</th>
              <th className="px-5 py-3 font-medium">회차</th>
              <th className="px-5 py-3 font-medium">등급</th>
              <th className="px-5 py-3 text-right font-medium">수량</th>
              <th className="px-5 py-3 text-right font-medium">결제액</th>
              <th className="px-5 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  예매 내역이 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.order_id}
                  onClick={() => setSelected(order)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="max-w-48 truncate px-5 py-3 font-medium text-gray-900">
                    {order.event_title}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {order.buyer_name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {order.slot_label}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {order.grade_name}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {order.quantity}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    {order.total_price.toLocaleString()}원
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title="예매 상세"
        confirmText="닫기"
        showCancel={false}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">
                {selected.event_title}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(selected.status)}`}
              >
                {orderStatusLabel(selected.status)}
              </span>
            </div>

            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              <DetailRow label="주문번호" value={selected.order_id} />
              <DetailRow label="구매자" value={selected.buyer_name} />
              <DetailRow label="회차" value={selected.slot_label} />
              <DetailRow label="등급" value={selected.grade_name} />
              <DetailRow label="수량" value={`${selected.quantity}매`} />
              <DetailRow
                label="결제액"
                value={`${selected.total_price.toLocaleString()}원`}
              />
              <DetailRow
                label="주문일시"
                value={formatDateTime(selected.created_at)}
              />
            </dl>

            <Link href={`/seller/events/${selected.event_id}`}>
              <Button variant="outlinePrimary" fullWidth>
                이벤트 상세 보기
              </Button>
            </Link>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="truncate text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
