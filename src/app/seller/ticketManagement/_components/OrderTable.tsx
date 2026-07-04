"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Dialog from "@/components/modal/Dialog";
import Select from "@/components/Select";
import InfoField from "@/components/InfoField";
import PageHeader from "@/app/seller/_components/PageHeader";
import useToast from "@/hooks/useToast";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { isBooked, isCancelled, orderStatusLabel } from "../../_lib/stats";
import { cancelOrder } from "../actions";
import type { EventOption, OrderRow } from "../types";

interface Props {
  orders: OrderRow[];
  events: EventOption[];
  filters: { eventId: string; status: string };
  pagination: { page: number; totalPages: number; totalCount: number };
  stats: { totalQuantity: number; totalRevenue: number; totalCount: number };
}

type SortKey = "created" | "event" | "buyer" | "price" | "status";
type SortDirection = "asc" | "desc";

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: ORDER_STATUS.ORDERED, label: "결제대기" },
  { value: ORDER_STATUS.PAID, label: "예매" },
  { value: ORDER_STATUS.CANCELLED, label: "취소" },
  { value: ORDER_STATUS.FAILED, label: "실패" },
];

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
      className={`flex w-full items-center gap-1.5 font-medium transition-colors hover:text-gray-800 dark:hover:text-gray-100 ${
        align === "right" ? "justify-end" : "justify-start"
      } ${active ? "text-primary-700 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
    >
      <span>{label}</span>
      <Icon className={`h-3.5 w-3.5 ${active ? "" : "opacity-40"}`} />
    </button>
  );
}

export default function OrderTable({
  orders,
  events,
  filters,
  pagination,
  stats,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderRow | null>(null);
  const [cancelledOrderIds, setCancelledOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [cancelling, setCancelling] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const toast = useToast();

  // 페이지 이동·필터 변경으로 목록이 바뀌면 선택을 초기화한다.
  const orderIdsKey = orders.map((order) => order.order_id).join(",");
  const [prevOrderIdsKey, setPrevOrderIdsKey] = useState(orderIdsKey);
  if (prevOrderIdsKey !== orderIdsKey) {
    setPrevOrderIdsKey(orderIdsKey);
    setSelectedIds(new Set());
  }

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

  // 이벤트/상태 필터·페이지네이션은 searchParams로 관리한다. 키워드 검색은 현재 페이지 안에서만 걸린다.
  function buildHref(next: {
    eventId?: string;
    status?: string;
    page?: number;
  }) {
    const eventId = next.eventId ?? filters.eventId;
    const status = next.status ?? filters.status;
    const params = new URLSearchParams();
    if (eventId && eventId !== "all") params.set("eventId", eventId);
    if (status && status !== "all") params.set("status", status);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/seller/ticketManagement?${qs}` : "/seller/ticketManagement";
  }

  // 선택한 행이 있으면 그 주문만, 없으면 현재 필터 전체를 내보낸다.
  const exportHref = (() => {
    const params = new URLSearchParams();
    if (selectedIds.size > 0) {
      params.set("ids", [...selectedIds].join(","));
    } else {
      if (filters.eventId !== "all") params.set("eventId", filters.eventId);
      if (filters.status !== "all") params.set("status", filters.status);
    }
    const qs = params.toString();
    return qs
      ? `/api/seller/orders/export?${qs}`
      : "/api/seller/orders/export";
  })();

  const filtered = useMemo(() => {
    const lowered = keyword.trim().toLowerCase();
    if (!lowered) return rows;
    return rows.filter(
      (order) =>
        order.event_title.toLowerCase().includes(lowered) ||
        order.buyer_name.toLowerCase().includes(lowered) ||
        order.buyer_email.toLowerCase().includes(lowered),
    );
  }, [rows, keyword]);

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

  const { page, totalPages, totalCount } = pagination;

  const allVisibleSelected =
    sorted.length > 0 && sorted.every((order) => selectedIds.has(order.order_id));

  function toggleOne(orderId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        sorted.forEach((order) => next.delete(order.order_id));
      } else {
        sorted.forEach((order) => next.add(order.order_id));
      }
      return next;
    });
  }

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
        description={`전체 ${totalCount.toLocaleString()}건 · ${page}/${totalPages} 페이지`}
        actions={
          <a
            href={exportHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
          >
            <Download size={16} />
            {selectedIds.size > 0
              ? `선택 ${selectedIds.size}건 내보내기`
              : "CSV 내보내기"}
          </a>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Ticket}
          label="예매 수량"
          value={`${stats.totalQuantity.toLocaleString()}매`}
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="결제액"
          value={`${stats.totalRevenue.toLocaleString()}원`}
          tone="accent"
        />
        <StatCard
          icon={Ticket}
          label="총 주문 건수"
          value={`${totalCount.toLocaleString()}건`}
          tone="primary"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={filters.status}
          onChange={(value) => router.push(buildHref({ status: value }))}
          options={STATUS_OPTIONS}
          className="w-40"
        />
        <Select
          value={filters.eventId}
          onChange={(value) => router.push(buildHref({ eventId: value }))}
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
            placeholder="이 페이지에서 검색"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-primary-500 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-surface-3 dark:bg-surface-1">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 dark:border-surface-3 dark:bg-surface-2">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="전체 선택"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary-600"
                />
              </th>
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
          <tbody className="divide-y divide-gray-50 dark:divide-surface-3">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  조건에 맞는 예매 내역이 없습니다
                </td>
              </tr>
            ) : (
              sorted.map((order) => (
                <tr
                  key={order.order_id}
                  onClick={() => setReceipt(order)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-2"
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label="주문 선택"
                      checked={selectedIds.has(order.order_id)}
                      onChange={() => toggleOne(order.order_id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary-600"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="truncate px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                    {order.event_title}
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                      {order.buyer_name}
                    </p>
                    <p className="hidden truncate text-xs text-gray-400 dark:text-gray-500 xl:block">
                      {order.buyer_email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-50">
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
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-surface-4 dark:hover:text-gray-100"
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
                          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-surface-3 dark:bg-surface-1">
                            <button
                              type="button"
                              onClick={() => copyEmail(order.buyer_email)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-2"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <PageLink href={buildHref({ page: page - 1 })} disabled={page <= 1}>
            <ChevronLeft size={16} />
            이전
          </PageLink>
          <span className="px-2 text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <PageLink
            href={buildHref({ page: page + 1 })}
            disabled={page >= totalPages}
          >
            다음
            <ChevronRight size={16} />
          </PageLink>
        </div>
      )}

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

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium dark:border-surface-3";
  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed text-gray-300 dark:text-gray-600`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${className} text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-2`}
    >
      {children}
    </Link>
  );
}
