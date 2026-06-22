"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Banknote,
  Search,
  MoreHorizontal,
  XCircle,
  Copy,
  CalendarX,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Dialog from "@/components/modal/Dialog";
import Select from "@/components/Select";
import PageHeader from "@/app/seller/_components/PageHeader";
import useToast from "@/hooks/useToast";
import { isCancelled, orderStatusLabel } from "../../_lib/stats";
import { cancelOrder } from "../actions";
import type { EventOption, OrderRow } from "../types";

interface Props {
  orders: OrderRow[];
  events: EventOption[];
}

type StatusTab = "전체" | "결제완료" | "취소";

function statusStyle(status: string) {
  if (isCancelled(status)) return "bg-danger-100 text-danger-700";
  if (status.includes("대기") || status.toLowerCase().includes("pending"))
    return "bg-amber-50 text-amber-600";
  return "bg-green-50 text-green-700";
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(dateString: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd
        className={`truncate text-right font-medium text-gray-900 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function OrderTable({ orders, events }: Props) {
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState("all");
  const [statusTab, setStatusTab] = useState<StatusTab>("전체");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const [rows, setRows] = useState(orders);
  const [syncedOrders, setSyncedOrders] = useState(orders);
  if (syncedOrders !== orders) {
    setSyncedOrders(orders);
    setRows(orders);
  }

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [openMenu]);

  const statusTabs = useMemo(() => {
    const paid = rows.filter((o) => !isCancelled(o.status)).length;
    const cancelled = rows.length - paid;
    return [
      { label: "전체" as const, count: rows.length },
      { label: "결제완료" as const, count: paid },
      { label: "취소" as const, count: cancelled },
    ];
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((order) => {
        const matchEvent = eventId === "all" || order.event_id === eventId;
        const lowered = keyword.toLowerCase();
        const matchKeyword =
          order.event_title.toLowerCase().includes(lowered) ||
          order.buyer_name.toLowerCase().includes(lowered) ||
          order.buyer_email.toLowerCase().includes(lowered);
        const matchStatus =
          statusTab === "전체" ||
          (statusTab === "취소"
            ? isCancelled(order.status)
            : !isCancelled(order.status));
        return matchEvent && matchKeyword && matchStatus;
      }),
    [rows, eventId, keyword, statusTab],
  );

  const validOrders = rows.filter((order) => !isCancelled(order.status));
  const totalQuantity = validOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_price, 0);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelTarget.order_id);
      setRows((prev) =>
        prev.map((order) =>
          order.order_id === cancelTarget.order_id
            ? { ...order, status: "cancelled" }
            : order,
        ),
      );
      toast.success("예매를 취소했어요");
      setCancelTarget(null);
      router.refresh();
    } catch {
      toast.error("예매 취소에 실패했어요");
    } finally {
      setCancelling(false);
    }
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("이메일을 복사했어요");
    } catch {
      toast.error("복사에 실패했어요");
    }
    setOpenMenu(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <PageHeader
        title="예매 관리"
        description={`전체 ${rows.length.toLocaleString()}건 · 표시 ${filtered.length.toLocaleString()}건`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Ticket}
          label="유효 예매 수량"
          value={`${totalQuantity.toLocaleString()}매`}
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="유효 결제액"
          value={`${totalRevenue.toLocaleString()}원`}
          tone="accent"
        />
        <StatCard
          icon={Ticket}
          label="총 주문 건수"
          value={`${rows.length.toLocaleString()}건`}
          tone="primary"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusTab(tab.label)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusTab === tab.label
                  ? "bg-primary-700 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-80">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Select
            value={eventId}
            onChange={setEventId}
            options={[
              { value: "all", label: "전체 이벤트" },
              ...events.map((event) => ({
                value: event.id,
                label: event.title,
              })),
            ]}
            className="w-full sm:w-52"
          />

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이벤트 / 구매자 / 이메일 검색"
              className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-4 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-medium">주문일</th>
              <th className="px-5 py-3 font-medium">이벤트</th>
              <th className="px-5 py-3 font-medium">구매자</th>
              <th className="px-5 py-3 font-medium">회차</th>
              <th className="px-5 py-3 font-medium">등급</th>
              <th className="px-5 py-3 text-right font-medium">수량</th>
              <th className="px-5 py-3 text-right font-medium">결제액</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="w-12 px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-gray-400">
                  조건에 맞는 예매 내역이 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.order_id}
                  onClick={() => setReceipt(order)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="max-w-44 truncate px-5 py-3 font-medium text-gray-900">
                    {order.event_title}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {order.buyer_name}
                    </p>
                    <p className="text-xs text-gray-400">{order.buyer_email}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                    {order.slot_label}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.grade_name}</td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {order.quantity}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    {order.total_price.toLocaleString()}원
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex min-w-14 justify-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === order.order_id ? null : order.order_id,
                          )
                        }
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="더보기"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenu === order.order_id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => copyEmail(order.buyer_email)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy size={15} />
                              이메일 복사
                            </button>
                            {!isCancelled(order.status) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(order);
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-700 hover:bg-danger-100"
                              >
                                <XCircle size={15} />
                                예매 취소
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!receipt}
        onClose={() => setReceipt(null)}
        title="예매 영수증"
        confirmText="닫기"
        showCancel={false}
      >
        {receipt && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">
                {receipt.event_title}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(receipt.status)}`}
              >
                {orderStatusLabel(receipt.status)}
              </span>
            </div>

            <dl className="space-y-2 border-y border-dashed border-gray-200 py-4 text-sm">
              <ReceiptRow label="주문번호" value={receipt.order_id} mono />
              <ReceiptRow
                label="주문일시"
                value={formatDateTime(receipt.created_at)}
              />
              <ReceiptRow label="구매자" value={receipt.buyer_name} />
              <ReceiptRow label="이메일" value={receipt.buyer_email} />
              <ReceiptRow label="회차" value={receipt.slot_label} />
              <ReceiptRow label="등급" value={receipt.grade_name} />
              <ReceiptRow label="수량" value={`${receipt.quantity}매`} />
            </dl>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">결제 금액</span>
              <span className="text-lg font-bold text-gray-900">
                {receipt.total_price.toLocaleString()}원
              </span>
            </div>

            {!isCancelled(receipt.status) && (
              <button
                type="button"
                onClick={() => {
                  setCancelTarget(receipt);
                  setReceipt(null);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger-300 py-2.5 text-sm font-medium text-danger-700 hover:bg-danger-100"
              >
                <XCircle size={15} />
                예매 취소
              </button>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="예매를 취소할까요?"
        description={
          cancelTarget
            ? `${cancelTarget.buyer_name}님의 "${cancelTarget.event_title}" 예매 ${cancelTarget.quantity}매를 취소합니다. 되돌릴 수 없어요.`
            : ""
        }
        confirmText={cancelling ? "취소 중..." : "예매 취소"}
        confirmVariant="danger"
        confirmDisabled={cancelling}
        onConfirm={handleCancel}
      >
        {cancelTarget && (
          <div className="flex items-center gap-2 rounded-xl bg-danger-100/60 px-3 py-2.5 text-sm text-danger-700">
            <CalendarX size={16} />
            취소 후에는 구매자에게 별도 환불 안내가 필요할 수 있어요.
          </div>
        )}
      </Dialog>
    </div>
  );
}
