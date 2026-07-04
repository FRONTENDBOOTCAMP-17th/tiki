"use client";

import { useState, useTransition } from "react";
import {
  Banknote,
  ChevronDown,
  Wallet,
  Receipt,
  Pencil,
  Send,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import {
  isBooked,
  serviceFee,
  monthsInRange,
  SERVICE_FEE_RATE,
} from "../../_lib/stats";
import type {
  BankAccount,
  MonthSummary,
  SettlementOrder,
  SettlementRequest,
} from "../types";
import { requestSettlement } from "../actions";
import SettlementCharts from "./SettlementCharts";

interface Props {
  orders: SettlementOrder[];
  bank: BankAccount | null;
  requests: SettlementRequest[];
}

function summarize(orders: SettlementOrder[]): Omit<MonthSummary, "month"> {
  const valid = orders.filter((order) => isBooked(order.status));
  const gross = valid.reduce((sum, o) => sum + o.amount, 0);
  const fee = serviceFee(gross);
  return {
    count: valid.reduce((sum, o) => sum + o.quantity, 0),
    gross,
    fee,
    net: gross - fee,
  };
}

export default function SettlementView({ orders, bank, requests }: Props) {
  const months = [...new Set(orders.map((o) => o.month).filter(Boolean))].sort(
    (a, b) => b.localeCompare(a),
  );

  const [selected, setSelected] = useState(months[0] ?? "");
  const [isPending, startTransition] = useTransition();

  function handleRequest() {
    startTransition(async () => {
      const result = await requestSettlement();
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(`${result.count}개월치 정산을 신청했습니다`);
      }
    });
  }

  // 월 → 정산 상태 (승인이 신청보다 우선)
  const monthStatus = new Map<string, "approved" | "requested">();
  for (const req of requests) {
    for (const month of monthsInRange(req.period_start, req.period_end)) {
      if (req.status === "approved") {
        monthStatus.set(month, "approved");
      } else if (monthStatus.get(month) !== "approved") {
        monthStatus.set(month, "requested");
      }
    }
  }

  const monthlyHistory: MonthSummary[] = months.map((month) => ({
    month,
    ...summarize(orders.filter((o) => o.month === month)),
  }));

  const current = orders.filter((o) => o.month === selected);
  const summary = summarize(current);

  const eventMap = new Map<
    string,
    { id: string; title: string; gross: number; count: number }
  >();
  for (const order of current) {
    if (!isBooked(order.status)) continue;
    const entry = eventMap.get(order.event_id) ?? {
      id: order.event_id,
      title: order.event_title,
      gross: 0,
      count: 0,
    };
    entry.gross += order.amount;
    entry.count += order.quantity;
    eventMap.set(order.event_id, entry);
  }
  const byEvent = [...eventMap.values()].sort((a, b) => b.gross - a.gross);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const formatMonth = (month: string) => month.replace("-", ". ");

  // 차트 데이터: 선 그래프는 월 오름차순, 막대 그래프는 선택월 이벤트 상위 8개
  const monthlyChart = [...monthlyHistory].reverse().map((row) => ({
    label: row.month.slice(2).replace("-", "."), // "26.07"
    gross: row.gross,
    net: row.net,
  }));
  const eventChart = byEvent.slice(0, 8).map((event) => ({
    title: event.title,
    gross: event.gross,
  }));

  function monthStatusBadge(month: string) {
    const status = monthStatus.get(month);
    if (status === "approved") {
      return { label: "정산완료", className: "bg-green-50 text-green-700" };
    }
    if (status === "requested") {
      return { label: "승인대기", className: "bg-blue-50 text-blue-600" };
    }
    if (month >= thisMonth) {
      return { label: "정산예정", className: "bg-amber-50 text-amber-600" };
    }
    return { label: "미신청", className: "bg-gray-100 text-gray-500" };
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">매출 · 정산</h1>
        </div>
        {months.length > 0 && (
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 outline-none focus:border-primary-500 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-100"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month.replace("-", "년 ")}월
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Banknote}
          label="총 결제액"
          value={`${summary.gross.toLocaleString()}원`}
          tone="secondary"
        />
        <StatCard
          icon={Receipt}
          label={`수수료 (${SERVICE_FEE_RATE * 100}%)`}
          value={`${summary.fee.toLocaleString()}원`}
          tone="neutral"
        />
        <StatCard
          icon={Wallet}
          label="정산 예정액"
          value={`${summary.net.toLocaleString()}원`}
          tone="accent"
        />
      </div>

      <SettlementCharts monthly={monthlyChart} byEvent={eventChart} />

      <div className="grid gap-6 min-[1360px]:grid-cols-[minmax(640px,1.4fr)_minmax(300px,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">월별 정산 내역</h2>
            <Button
              size="sm"
              variant="primary"
              onClick={handleRequest}
              loading={isPending}
              disabled={isPending}
            >
              <Send size={14} />
              정산 신청
            </Button>
          </div>
          {monthlyHistory.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="rounded-2xl border border-gray-100 dark:border-surface-3">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-surface-2 dark:text-gray-400">
                    <th className="w-24 px-4 py-3 font-medium">정산월</th>
                    <th className="hidden w-20 px-4 py-3 text-right font-medium xl:table-cell">
                      건수
                    </th>
                    <th className="px-4 py-3 text-right font-medium">결제액</th>
                    <th className="px-4 py-3 text-right font-medium">정산액</th>
                    <th className="hidden w-24 px-4 py-3 font-medium min-[1180px]:table-cell">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-surface-3">
                  {monthlyHistory.map((row) => (
                    <tr
                      key={row.month}
                      onClick={() => setSelected(row.month)}
                      className={`cursor-pointer transition-colors ${
                        row.month === selected
                          ? "bg-primary-100/60 dark:bg-surface-4"
                          : "hover:bg-gray-50 dark:hover:bg-surface-2"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                        {formatMonth(row.month)}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-gray-600 dark:text-gray-300 xl:table-cell">
                        {row.count.toLocaleString()}건
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {row.gross.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-50">
                        {row.net.toLocaleString()}원
                      </td>
                      <td className="hidden px-4 py-3 min-[1180px]:table-cell">
                        {(() => {
                          const badge = monthStatusBadge(row.month);
                          return (
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-50">정산 계좌</h2>
              <Link href="/seller/storeInfo">
                <Button size="sm" variant="outlinePrimary">
                  <Pencil size={14} />
                  변경
                </Button>
              </Link>
            </div>
            {bank?.bank_account_number ? (
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-surface-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {bank.bank_name} {bank.bank_account_number}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  예금주 {bank.bank_holder_name}
                </p>
              </div>
            ) : (
              <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-400 dark:bg-surface-2 dark:text-gray-500">
                등록된 정산 계좌가 없습니다
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-50">이벤트별 매출</h2>
              {selected && (
                <span className="text-xs text-gray-400">
                  {formatMonth(selected)} 기준
                </span>
              )}
            </div>
            {byEvent.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="space-y-1">
                {byEvent.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/seller/ticketManagement?eventId=${event.id}`}
                      className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400">{event.count}건</p>
                      </div>
                      <span className="shrink-0 pl-3 font-semibold text-gray-900 dark:text-gray-50">
                        {event.gross.toLocaleString()}원
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
      아직 정산 내역이 없습니다
    </div>
  );
}
