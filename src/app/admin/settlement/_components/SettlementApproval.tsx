"use client";

import { useState, useTransition } from "react";
import { Check, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button";
import { approveSettlement } from "../actions";

interface SettlementRow {
  settlement_id: string;
  seller_id: string;
  seller_name: string;
  period_start: string;
  period_end: string;
  gross: number;
  fee: number;
  net: number;
  status: string;
  requested_at: string;
  approved_at: string | null;
}

function periodLabel(start: string, end: string) {
  const fmt = (month: string) => month.replace("-", ".");
  return start === end ? fmt(start) : `${fmt(start)} ~ ${fmt(end)}`;
}

export default function SettlementApproval({
  initialRequests,
}: {
  initialRequests: SettlementRow[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleApprove(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await approveSettlement(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("정산을 승인했습니다");
        setRequests((prev) =>
          prev.map((r) =>
            r.settlement_id === id
              ? {
                  ...r,
                  status: "approved",
                  approved_at: new Date().toISOString(),
                }
              : r,
          ),
        );
      }
      setPendingId(null);
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 dark:border-[#3c4043] dark:bg-[#2a2b2f]">
        정산 신청 내역이 없습니다
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "requested").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        승인 대기{" "}
        <span className="font-semibold text-primary-700 dark:text-primary-400">
          {pendingCount}
        </span>
        건
      </p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#3c4043]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-[#242528] dark:text-gray-400">
              <th className="px-4 py-3 font-medium">판매자</th>
              <th className="px-4 py-3 font-medium">정산 기간</th>
              <th className="px-4 py-3 text-right font-medium">결제액</th>
              <th className="px-4 py-3 text-right font-medium">정산액</th>
              <th className="px-4 py-3 text-center font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr
                key={r.settlement_id}
                className="border-t border-gray-100 bg-white dark:border-[#3c4043] dark:bg-[#2a2b2f]"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                  {r.seller_name}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {periodLabel(r.period_start, r.period_end)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                  {r.gross.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-50">
                  {r.net.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-center">
                  {r.status === "approved" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      <CircleCheck size={13} />
                      승인완료
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(r.settlement_id)}
                      loading={pendingId === r.settlement_id}
                      disabled={pendingId === r.settlement_id}
                    >
                      <Check size={14} />
                      승인
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
