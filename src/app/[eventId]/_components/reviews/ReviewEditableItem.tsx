"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/Button";
import Dialog from "@/components/modal/Dialog";
import ReviewAuthor from "@/components/reviews/ReviewAuthor";
import ReviewBody from "@/components/reviews/ReviewBody";
import ReviewRating from "@/components/reviews/ReviewRating";
import { cn } from "@/lib/cn";
import { formatDotDate } from "@/lib/format";
import { deleteReviewAction, updateReviewAction } from "@/lib/reviews/actions";
import {
  REVIEW_MEMO_MAX_LENGTH,
  REVIEW_MEMO_MIN_LENGTH,
} from "@/lib/reviews/validation";
import type { Review } from "@/types/domain/event";
import RatingInput from "./RatingInput";
import ReviewLikeButton from "./ReviewLikeButton";

export default function ReviewEditableItem({
  eventId,
  review,
  canLike,
}: {
  eventId: string;
  review: Review;
  canLike: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [memo, setMemo] = useState(review.memo);
  const [message, setMessage] = useState("");

  const memoValid = memo.trim().length >= REVIEW_MEMO_MIN_LENGTH;

  function resetEdit() {
    setEditing(false);
    setRating(review.rating);
    setMemo(review.memo);
    setMessage("");
  }

  function handleSave() {
    if (!memoValid || rating < 1 || submittingRef.current) return;
    submittingRef.current = true;

    startTransition(async () => {
      try {
        const result = await updateReviewAction({
          eventId,
          reviewId: review.reviewId,
          rating,
          memo,
        });

        if (!result.success) {
          setMessage(result.message);
          return;
        }

        setEditing(false);
        router.refresh();
      } finally {
        submittingRef.current = false;
      }
    });
  }

  function handleDelete() {
    if (submittingRef.current) return;
    submittingRef.current = true;

    startTransition(async () => {
      try {
        const result = await deleteReviewAction({
          eventId,
          reviewId: review.reviewId,
        });

        if (!result.success) {
          setDeleteOpen(false);
          toast.error(result.message);
          return;
        }

        setDeleteOpen(false);
        toast.success("후기가 삭제되었습니다");
        router.refresh();
      } finally {
        submittingRef.current = false;
      }
    });
  }

  return (
    <li className="py-5">
      <div className="flex items-start gap-3">
        <ReviewAuthor
          name={review.userName}
          className="items-start gap-3"
          showName={false}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ReviewAuthor name={review.userName} showAvatar={false} />
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                내 후기
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-xs text-gray-400">
                {formatDotDate(review.createdAt)}
              </span>
              {!editing && (
                <>
                  <ReviewLikeButton
                    eventId={eventId}
                    reviewId={review.reviewId}
                    initialLiked={review.likedByMe}
                    initialCount={review.likeCount}
                    disabled={!canLike}
                  />
                  <button
                    type="button"
                    className="text-sm text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
                    onClick={() => setEditing(true)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
                    onClick={() => setDeleteOpen(true)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-3 flex flex-col gap-3">
              <RatingInput value={rating} onChange={setRating} size="sm" />
              <textarea
                value={memo}
                onChange={(event) => {
                  setMemo(event.target.value);
                  setMessage("");
                }}
                maxLength={REVIEW_MEMO_MAX_LENGTH}
                rows={3}
                className="resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={cn(
                    "min-h-4 text-xs text-gray-400",
                    (message || !memoValid) && "text-danger-500",
                  )}
                >
                  {message ||
                    (!memoValid
                      ? `최소 ${REVIEW_MEMO_MIN_LENGTH}자 이상 입력해 주세요.`
                      : `${memo.length}/${REVIEW_MEMO_MAX_LENGTH}`)}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={resetEdit}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!memoValid}
                    loading={isPending}
                    onClick={handleSave}
                  >
                    저장
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ReviewRating rating={review.rating} size="sm" className="mt-1" />
              <ReviewBody className="mt-3">{review.memo}</ReviewBody>
              {message && (
                <p className="mt-2 text-xs text-danger-500">{message}</p>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="후기 삭제"
        description="작성한 후기를 삭제할까요? 삭제 후에는 되돌릴 수 없습니다."
        confirmText={isPending ? "삭제 중..." : "삭제"}
        confirmVariant="danger"
        cancelText="취소"
        cancelVariant="outline"
        onConfirm={handleDelete}
      />
    </li>
  );
}
