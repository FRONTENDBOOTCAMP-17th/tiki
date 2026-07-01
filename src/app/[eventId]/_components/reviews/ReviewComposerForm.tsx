"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Select from "@/components/Select";
import { cn } from "@/lib/cn";
import type { WritableReviewSlot } from "@/lib/event/queries";
import { createReviewAction } from "@/lib/reviews/actions";
import {
  REVIEW_MEMO_MAX_LENGTH,
  REVIEW_MEMO_MIN_LENGTH,
  REVIEW_RATING_LABEL,
} from "@/lib/reviews/validation";
import RatingInput from "./RatingInput";

interface Props {
  eventId: string;
  slots: WritableReviewSlot[];
}

export default function ReviewComposerForm({ eventId, slots }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");

  const selected = slots.find((slot) => slot.orderId === orderId);
  const memoLength = memo.trim().length;
  const memoValid = memoLength >= REVIEW_MEMO_MIN_LENGTH;
  const canSubmit = !!selected && rating > 0 && memoValid && !isPending;

  function handleSubmit() {
    if (!canSubmit || !selected) return;

    startTransition(async () => {
      setMessage("");
      const result = await createReviewAction({
        eventId,
        orderId: selected.orderId,
        rating,
        memo,
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setOrderId("");
      setRating(0);
      setMemo("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            관람한 회차
          </label>
          <Select
            value={orderId}
            onChange={(value) => {
              setOrderId(value);
              setRating(0);
              setMessage("");
            }}
            placeholder="회차 선택"
            options={slots.map((slot) => ({
              value: slot.orderId,
              label: slot.slotLabel,
            }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            별점
          </span>
          <div className="flex h-10 items-center gap-2">
            <RatingInput
              value={rating}
              onChange={setRating}
              disabled={!selected}
              onDisabledSelect={() => {
                setMessage("관람한 회차를 먼저 선택해 주세요.");
              }}
            />
            <span className="min-w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
              {rating > 0 ? REVIEW_RATING_LABEL[rating] : "선택"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            후기
          </label>
          <span className="text-xs text-gray-400">
            {memo.length}/{REVIEW_MEMO_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={memo}
          onChange={(event) => {
            setMemo(event.target.value);
            setMessage("");
          }}
          maxLength={REVIEW_MEMO_MAX_LENGTH}
          rows={3}
          placeholder="관람 후기를 적어 주세요."
          className="min-h-24 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-relaxed text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 dark:border-[#3c4043] dark:bg-[#303134] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-[#303134] dark:focus:ring-[#3c4043]"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "min-h-4 text-xs text-gray-400",
              (message || (memo.length > 0 && !memoValid)) && "text-danger-500",
            )}
          >
            {message ||
              (memo.length > 0 && !memoValid
                ? `최소 ${REVIEW_MEMO_MIN_LENGTH}자 이상 입력해 주세요.`
                : "")}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-primary-100 text-primary-300 disabled:opacity-100 enabled:bg-primary-700 enabled:text-white enabled:hover:bg-primary-800 sm:w-auto sm:min-w-28"
            disabled={!canSubmit}
            loading={isPending}
            onClick={handleSubmit}
          >
            작성하기
          </Button>
        </div>
      </div>
    </div>
  );
}
