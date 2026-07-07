"use client";

import { useState, useTransition } from "react";
import { Check, CircleCheck, X, CircleX } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button";
import Dialog from "@/components/modal/Dialog";
import { approveSettlement, rejectSettlement } from "../actions";

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
  reject_reason: string | null;
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
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
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

  function handleReject() {
    const id = rejectTarget;
    if (!id || !rejectReason.trim()) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await rejectSettlement(id, rejectReason);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("정산을 반려했습니다");
        setRequests((prev) =>
          prev.map((r) =>
            r.settlement_id === id
              ? { ...r, status: "rejected", reject_reason: rejectReason.trim() }
              : r,
          ),
        );
        setRejectTarget(null);
        setRejectReason("");
      }
      setPendingId(null);
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 dark:border-surface-3 dark:bg-surface-1">
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-surface-header dark:text-gray-400">
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
                className="border-t border-gray-100 bg-white dark:border-surface-3 dark:bg-surface-1"
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CircleCheck size={13} />
                      승인완료
                    </span>
                  ) : r.status === "rejected" ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-1 text-xs font-medium text-danger-700 dark:bg-danger-500/10 dark:text-danger-400"
                      title={r.reject_reason ?? undefined}
                    >
                      <CircleX size={13} />
                      반려됨
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
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
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setRejectTarget(r.settlement_id);
                          setRejectReason("");
                        }}
                        disabled={pendingId === r.settlement_id}
                      >
                        <X size={14} />
                        반려
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="정산 반려"
        confirmText={pendingId === rejectTarget ? "반려 중..." : "반려하기"}
        confirmVariant="danger"
        cancelText="취소"
        onConfirm={handleReject}
        confirmDisabled={!rejectReason.trim() || pendingId === rejectTarget}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            반려 사유를 입력해주세요. 판매자는 이 사유를 확인하고 다시 신청할 수 있습니다.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="예: 계좌 정보가 확인되지 않습니다"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-surface-3 dark:bg-surface-2 dark:text-gray-100"
          />
        </div>
      </Dialog>
    </div>
  );
}
