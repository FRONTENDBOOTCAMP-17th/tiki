"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Modal from "@/components/modal/Modal";
import Dialog from "@/components/modal/Dialog";
import SortFilter, { type SortDirection } from "@/components/SortFilter";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/app/seller/_components/PageHeader";
import ReviewBody from "@/components/reviews/ReviewBody";
import ReviewRating from "@/components/reviews/ReviewRating";
import useToast from "@/hooks/useToast";
import { formatDotDate } from "@/lib/format";
import { requestReviewDeletion } from "../actions";

export interface SellerReview {
  reviewId: string;
  eventId: string;
  eventTitle: string;
  eventThumbnail: string | null;
  author: string;
  rating: number;
  memo: string;
  createdAt: string;
  deleteRequest: { reason: string; requestedAt: string } | null;
}

const REASON_OPTIONS = [
  { value: "욕설/비방", label: "욕설/비방" },
  { value: "허위 사실", label: "허위 사실" },
  { value: "광고/스팸", label: "광고/스팸" },
  { value: "개인정보 노출", label: "개인정보 노출" },
  { value: "부적절한 내용", label: "부적절한 내용" },
  { value: "기타", label: "기타 (직접 입력)" },
];

type SellerReviewSortKey = "created" | "rating";

const REVIEW_SORT_OPTIONS = [
  { key: "created", label: "작성일" },
  { key: "rating", label: "평점" },
] satisfies { key: SellerReviewSortKey; label: string }[];

interface Props {
  reviews: SellerReview[];
  events: { id: string; title: string }[];
}

export default function SellerReviewList({ reviews, events }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [eventId, setEventId] = useState("all");
  const [sortKey, setSortKey] = useState<SellerReviewSortKey>("created");
  const [direction, setDirection] = useState<SortDirection>("desc");

  function handleSort(key: SellerReviewSortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [reasonType, setReasonType] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [viewing, setViewing] = useState<SellerReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const scoped = useMemo(
    () =>
      eventId === "all"
        ? reviews
        : reviews.filter((review) => review.eventId === eventId),
    [eventId, reviews],
  );

  const summary = useMemo(() => {
    const total = scoped.length;
    const scoreCounts = new Map<number, number>();
    let ratingSum = 0;
    let requested = 0;

    for (const review of scoped) {
      ratingSum += review.rating;
      scoreCounts.set(review.rating, (scoreCounts.get(review.rating) ?? 0) + 1);
      if (review.deleteRequest) requested += 1;
    }

    return {
      total,
      requested,
      average: total ? Math.round((ratingSum / total) * 10) / 10 : 0,
      distribution: [5, 4, 3, 2, 1].map((score) => {
        const count = scoreCounts.get(score) ?? 0;
        return {
          score,
          count,
          percent: total ? Math.round((count / total) * 100) : 0,
        };
      }),
    };
  }, [scoped]);

  const sorted = useMemo(() => {
    const multiplier = direction === "asc" ? 1 : -1;

    return scoped
      .map((review, index) => ({ review, index }))
      .sort((a, b) => {
        const result =
          sortKey === "rating"
            ? a.review.rating - b.review.rating
            : +new Date(a.review.createdAt) - +new Date(b.review.createdAt);

        return result === 0 ? a.index - b.index : result * multiplier;
      })
      .map(({ review }) => review);
  }, [scoped, sortKey, direction]);

  const reasonValid =
    reasonType !== "" && (reasonType !== "기타" || reasonText.trim() !== "");

  function resetRequest() {
    setRequestingId(null);
    setReasonType("");
    setReasonText("");
  }

  function submitRequest(reviewId: string) {
    if (!reasonValid || isPending) return;
    const finalReason =
      reasonType === "기타" ? reasonText.trim() : reasonType;
    startTransition(async () => {
      try {
        await requestReviewDeletion(reviewId, finalReason);
        resetRequest();
        toast.success("삭제 요청을 보냈어요");
        router.refresh();
      } catch {
        toast.error("삭제 요청에 실패했어요");
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <PageHeader
        title="리뷰 관리"
        description="내 공연 후기를 확인하고, 부적절한 후기는 관리자에게 삭제 요청할 수 있습니다."
      />

      <div className="grid grid-cols-[220px_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold leading-none text-gray-950 dark:text-gray-50">
              {summary.average.toFixed(1)}
            </span>
            <span className="pb-1 text-sm font-medium text-gray-400">/ 5</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            후기 {summary.total.toLocaleString()}개 · 삭제요청{" "}
            <span className="font-semibold text-primary-700">
              {summary.requested}
            </span>
            건
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {summary.distribution.map((item) => (
            <div
              key={item.score}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm"
            >
              <span className="font-medium text-gray-600 dark:text-gray-300">{item.score}점</span>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-surface-3">
                <div
                  className="h-full rounded-full bg-primary-700"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="text-right text-xs font-medium text-gray-400">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={eventId}
          onChange={(value) => setEventId(value)}
          className="w-52"
          options={[
            { value: "all", label: "전체 공연" },
            ...events.map((e) => ({ value: e.id, label: e.title })),
          ]}
        />

        <SortFilter
          options={REVIEW_SORT_OPTIONS}
          value={sortKey}
          direction={direction}
          onChange={handleSort}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="조건에 맞는 후기가 없습니다." />
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r) => (
            <li
              key={r.reviewId}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1"
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
                    <div className="size-10 shrink-0 rounded-lg bg-gray-100 dark:bg-surface-2" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                      {r.eventTitle}
                    </p>
                    <p className="text-xs text-gray-400">{r.author}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDotDate(r.createdAt)}
                </span>
              </div>

              <ReviewRating rating={r.rating} className="mt-3" />

              <ReviewBody className="mt-2">{r.memo}</ReviewBody>

              {r.deleteRequest ? (
                <button
                  type="button"
                  onClick={() => setViewing(r)}
                  className="mt-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  삭제 요청됨 (관리자 검토 중) · 내용 보기
                </button>
              ) : requestingId === r.reviewId ? (
                <div className="mt-3 flex flex-col gap-2">
                  <Select
                    value={reasonType}
                    onChange={setReasonType}
                    placeholder="삭제 사유 선택"
                    options={REASON_OPTIONS}
                    className="w-60"
                  />
                  {reasonType === "기타" && (
                    <textarea
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      rows={2}
                      placeholder="삭제 요청 사유를 입력하세요."
                      className="resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 dark:border-surface-3 dark:bg-surface-2 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-surface-2 dark:focus:ring-surface-3"
                    />
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={resetRequest}
                    >
                      취소
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={!reasonValid}
                      loading={isPending}
                      onClick={() => setConfirmOpen(true)}
                    >
                      삭제 요청
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outlineDanger"
                  size="sm"
                  className="mt-3 w-fit"
                  onClick={() => {
                    setRequestingId(r.reviewId);
                    setReasonType("");
                    setReasonText("");
                  }}
                >
                  삭제 요청
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="리뷰 삭제를 요청할까요?"
        description="삭제 요청 시 취소할 수 없습니다. 요청하시겠습니까?"
        confirmText="삭제 요청"
        confirmVariant="danger"
        confirmDisabled={isPending}
        onConfirm={() => {
          if (requestingId) submitRequest(requestingId);
          setConfirmOpen(false);
        }}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)}>
        <Modal.Header>삭제 요청 내용</Modal.Header>
        <Modal.Body>
          {viewing?.deleteRequest && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-surface-2">
                <p className="text-xs text-gray-400">대상 후기</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {viewing.eventTitle} · {viewing.author}
                </p>
                <ReviewBody className="mt-1 line-clamp-3 text-gray-600 dark:text-gray-300">
                  {viewing.memo}
                </ReviewBody>
              </div>
              <div>
                <p className="text-xs text-gray-400">요청 사유</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {viewing.deleteRequest.reason}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                요청일 {formatDotDate(viewing.deleteRequest.requestedAt)} · 관리자
                검토 중
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setViewing(null)}
          >
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
