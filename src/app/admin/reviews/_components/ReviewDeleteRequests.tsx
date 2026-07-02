"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, X, Ban } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button";
import ReviewRating from "@/components/reviews/ReviewRating";
import ReviewBody from "@/components/reviews/ReviewBody";
import { formatDotDate } from "@/lib/format";
import { approveReviewDeletion, rejectReviewDeletion } from "../actions";

// 관리자 리뷰 삭제요청 목록 UI (승인/거절 버튼 + 상태 필터 탭)
export interface AdminReviewRequest {
  requestId: string;
  reviewId: string;
  status: string;
  reason: string;
  requestedAt: string;
  sellerName: string;
  eventTitle: string;
  eventThumbnail: string | null;
  author: string;
  rating: number;
  memo: string;
}

type Pending = { id: string; action: "approve" | "reject" } | null;

// 상단 필터 탭
type Filter = "all" | "pending" | "rejected";
const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "처리 대기" },
  { value: "rejected", label: "거절됨" },
];

export default function ReviewDeleteRequests({
  initialRequests,
}: {
  initialRequests: AdminReviewRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pending, setPending] = useState<Pending>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [, startTransition] = useTransition();

  // 승인 = 리뷰 삭제 → 목록에서 제거
  function handleApprove(id: string) {
    setPending({ id, action: "approve" });
    startTransition(async () => {
      const result = await approveReviewDeletion(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("리뷰를 삭제했습니다");
        setRequests((prev) => prev.filter((r) => r.requestId !== id));
      }
      setPending(null);
    });
  }

  // 거절 = 상태만 rejected로 변경 (목록엔 남김)
  function handleReject(id: string) {
    setPending({ id, action: "reject" });
    startTransition(async () => {
      const result = await rejectReviewDeletion(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("삭제 요청을 거절했습니다");
        setRequests((prev) =>
          prev.map((r) =>
            r.requestId === id ? { ...r, status: "rejected" } : r,
          ),
        );
      }
      setPending(null);
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 dark:border-[#3c4043] dark:bg-[#2a2b2f]">
        리뷰 삭제 요청이 없습니다
      </div>
    );
  }

  const counts: Record<Filter, number> = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };
  const visible =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={
                active
                  ? "rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-300 dark:hover:bg-[#303134]"
              }
            >
              {tab.label} {counts[tab.value]}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 dark:border-[#3c4043] dark:bg-[#2a2b2f]">
          {filter === "rejected"
            ? "거절된 요청이 없습니다"
            : filter === "pending"
              ? "처리 대기 중인 요청이 없습니다"
              : "리뷰 삭제 요청이 없습니다"}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((r) => {
          const isRowPending = pending?.id === r.requestId;
          return (
            <li
              key={r.requestId}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {r.eventThumbnail ? (
                    <Image
                      src={r.eventThumbnail}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-10 shrink-0 rounded-lg bg-gray-100 dark:bg-[#303134]" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                      {r.eventTitle}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      작성자 {r.author} · 요청 판매자 {r.sellerName}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDotDate(r.requestedAt)}
                </span>
              </div>

              <ReviewRating rating={r.rating} className="mt-3" />
              <ReviewBody className="mt-2">{r.memo}</ReviewBody>

              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-[#303134]">
                <p className="text-xs text-gray-400">삭제 요청 사유</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">
                  {r.reason}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                {r.status === "rejected" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-[#303134] dark:text-gray-400">
                    <Ban size={13} />
                    거절됨
                  </span>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(r.requestId)}
                      loading={isRowPending && pending?.action === "reject"}
                      disabled={isRowPending}
                    >
                      <X size={14} />
                      거절
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleApprove(r.requestId)}
                      loading={isRowPending && pending?.action === "approve"}
                      disabled={isRowPending}
                    >
                      <Check size={14} />
                      승인 (리뷰 삭제)
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
          })}
        </ul>
      )}
    </div>
  );
}
