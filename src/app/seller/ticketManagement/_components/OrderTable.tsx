"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Ticket,
  Banknote,
  Search,
  MoreHorizontal,
  XCircle,
  Copy,
  CalendarX,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Dialog from "@/components/modal/Dialog";
import Select from "@/components/Select";
import InfoField from "@/components/InfoField";
import PageHeader from "@/app/seller/_components/PageHeader";
import useToast from "@/hooks/useToast";
import {
  isBooked,
  isCancelled,
  orderStatusLabel,
} from "../../_lib/stats";
import { cancelOrder } from "../actions";
import type { EventOption, OrderRow } from "../types";

interface Props {
  orders: OrderRow[];
  events: EventOption[];
  initialEventId?: string;
}

type StatusTab = "전체" | "예매" | "취소";
type SortKey = "created" | "event" | "buyer" | "price" | "status";
type SortDirection = "asc" | "desc";

const ORDER_SORT_COLUMNS: {
  label: string;
  sortKey: SortKey;
  className: string;
  align?: "left" | "right";
}[] = [
  { label: "주문일", sortKey: "created", className: "w-24 px-4 py-3" },
  { label: "이벤트명", sortKey: "event", className: "px-4 py-3" },
  {
    label: "구매자",
    sortKey: "buyer",
    className: "w-36 px-4 py-3 xl:w-44",
  },
  {
    label: "결제액",
    sortKey: "price",
    className: "w-28 px-4 py-3",
    align: "right",
  },
  { label: "상태", sortKey: "status", className: "w-20 px-4 py-3" },
];

function statusBg(status: string) {
  if (isCancelled(status)) return "bg-danger-100";
  if (status === "paid") return "bg-green-50";
  return "bg-gray-100"; // 결제대기(ordered)
}

function statusText(status: string) {
  if (isCancelled(status)) return "text-danger-600";
  if (status === "paid") return "text-green-700";
  return "text-gray-600"; // 결제대기(ordered)
}

function statusStyle(status: string) {
  return `${statusBg(status)} ${statusText(status)}`;
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

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  align = "left",
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  align?: "left" | "right";
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;
  const Icon = active
    ? direction === "asc"
      ? ChevronUp
      : ChevronDown
    : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex w-full items-center gap-1.5 font-medium transition-colors hover:text-gray-800 ${
        align === "right" ? "justify-end" : "justify-start"
      } ${active ? "text-primary-700" : "text-gray-500"}`}
    >
      <span>{label}</span>
      <Icon className={`h-3.5 w-3.5 ${active ? "" : "opacity-40"}`} />
    </button>
  );
}

export default function OrderTable({
  orders,
  events,
  initialEventId = "all",
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState(
    events.some((event) => event.id === initialEventId)
      ? initialEventId
      : "all",
  );
  const [statusTab, setStatusTab] = useState<StatusTab>("전체");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderRow | null>(null);
  const [cancelledOrderIds, setCancelledOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const rows = useMemo(
    () =>
      orders.map((order) =>
        cancelledOrderIds.has(order.order_id)
          ? { ...order, status: "cancelled" }
          : order,
      ),
    [orders, cancelledOrderIds],
  );

  useEffect(() => {
    if (!openMenu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openMenu]);

  const statusTabs = useMemo(() => {
    const booked = rows.filter((order) => isBooked(order.status)).length;
    const cancelled = rows.filter((order) => isCancelled(order.status)).length;
    return [
      { label: "전체" as const, count: rows.length },
      { label: "예매" as const, count: booked },
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
          (statusTab === "예매" && isBooked(order.status)) ||
          (statusTab === "취소" && isCancelled(order.status));
        return matchEvent && matchKeyword && matchStatus;
      }),
    [rows, eventId, keyword, statusTab],
  );

  const sorted = useMemo(() => {
    const multiplier = direction === "asc" ? 1 : -1;
    return filtered
      .map((order, index) => ({ order, index }))
      .sort((a, b) => {
        let result = 0;

        if (sortKey === "event") {
          result = a.order.event_title.localeCompare(
            b.order.event_title,
            "ko-KR",
          );
        } else if (sortKey === "buyer") {
          result = a.order.buyer_name.localeCompare(
            b.order.buyer_name,
            "ko-KR",
          );
        } else if (sortKey === "price") {
          result = a.order.total_price - b.order.total_price;
        } else if (sortKey === "status") {
          result = orderStatusLabel(a.order.status).localeCompare(
            orderStatusLabel(b.order.status),
            "ko-KR",
          );
        } else {
          result = +new Date(a.order.created_at) - +new Date(b.order.created_at);
        }

        return result === 0 ? a.index - b.index : result * multiplier;
      })
      .map(({ order }) => order);
  }, [filtered, sortKey, direction]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  const validOrders = rows.filter((order) => isBooked(order.status));
  const totalQuantity = validOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_price, 0);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelTarget.order_id);
      setCancelledOrderIds((prev) => {
        const next = new Set(prev);
        next.add(cancelTarget.order_id);
        return next;
      });
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

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Ticket}
          label="예매 수량"
          value={`${totalQuantity.toLocaleString()}매`}
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="결제액"
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
            className="w-52"
          />

          <div className="relative w-72">
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

      <div className="rounded-2xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
              {ORDER_SORT_COLUMNS.map((column) => (
                <th key={column.sortKey} className={column.className}>
                  <SortHeader
                    label={column.label}
                    sortKey={column.sortKey}
                    activeKey={sortKey}
                    direction={direction}
                    align={column.align}
                    onSort={handleSort}
                  />
                </th>
              ))}
              <th className="w-12 px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  조건에 맞는 예매 내역이 없습니다
                </td>
              </tr>
            ) : (
              sorted.map((order) => (
                <tr
                  key={order.order_id}
                  onClick={() => setReceipt(order)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="truncate px-4 py-3 font-medium text-gray-900">
                    {order.event_title}
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-gray-900">
                      {order.buyer_name}
                    </p>
                    <p className="hidden truncate text-xs text-gray-400 xl:block">
                      {order.buyer_email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {order.total_price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex min-w-14 justify-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
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
                            {isBooked(order.status) && (
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
          <div className="flex flex-col gap-4">
            <div className={`flex flex-col gap-1.5 rounded-xl p-4 ${statusBg(receipt.status)}`}>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">
                  {receipt.event_title}
                </p>
                <span
                  className={`rounded-full bg-white px-2 py-0.5 text-xs font-medium ${statusText(receipt.status)}`}
                >
                  {orderStatusLabel(receipt.status)}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar size={14} className="shrink-0 text-gray-400" />
                {receipt.slot_label}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <Ticket size={14} className="shrink-0 text-gray-400" />
                {receipt.grade_name} · {receipt.quantity}매
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoField
                label="주문번호"
                value={receipt.order_id}
                valueClassName="font-mono text-xs"
              />
              <InfoField
                label="주문일시"
                value={formatDateTime(receipt.created_at)}
              />
              <InfoField label="구매자" value={receipt.buyer_name} />
              <InfoField label="이메일" value={receipt.buyer_email} />
              <InfoField
                label="결제 금액"
                value={`${receipt.total_price.toLocaleString()}원`}
              />
              <InfoField
                label="상태"
                value={orderStatusLabel(receipt.status)}
                valueClassName={statusText(receipt.status)}
              />
            </div>

            {isBooked(receipt.status) && (
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
