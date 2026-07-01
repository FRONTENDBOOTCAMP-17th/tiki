"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { answerInquiry, deleteAnswer } from "../actions";

type Props = {
  inquiryId: string;
  status: "pending" | "answered";
  existingAnswer: string | null;
  answeredAt: string | null;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAnswerForm({
  inquiryId,
  status,
  existingAnswer,
  answeredAt,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await answerInquiry(inquiryId, formData);
      if (result.ok) {
        toast.success("답변이 등록되었습니다.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAnswer(inquiryId);
      if (result.ok) {
        toast.success("답변이 삭제되었습니다.");
        setConfirmDelete(false);
        router.refresh();
      } else {
        toast.error(result.error);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 sm:p-8"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary-700">
          관리자 답변
        </span>
        {status === "answered" && answeredAt && (
          <span className="text-xs text-gray-400">
            {formatDateTime(answeredAt)} 등록
          </span>
        )}
      </div>

      <textarea
        name="answer"
        rows={6}
        maxLength={2000}
        defaultValue={existingAnswer ?? ""}
        placeholder="답변 내용을 입력해 주세요"
        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />

      <div className="mt-3 flex items-center justify-between">
        {/* 삭제 (답변 완료 상태에서만) */}
        <div>
          {status === "answered" &&
            (confirmDelete ? (
              <div className="flex items-center gap-2 rounded-xl bg-danger-100 px-3 py-1.5">
                <span className="text-sm text-danger-700">
                  답변을 삭제할까요?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-lg bg-danger-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-danger-600 disabled:opacity-50"
                >
                  {isPending ? "삭제 중..." : "삭제"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isPending}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                className="rounded-xl border border-danger-300 px-5 py-2.5 text-sm font-medium text-danger-500 transition-colors hover:bg-danger-100 disabled:opacity-50"
              >
                답변 삭제
              </button>
            ))}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800 disabled:opacity-50"
        >
          {isPending
            ? "등록 중..."
            : status === "answered"
              ? "답변 수정"
              : "답변 등록"}
        </button>
      </div>
    </form>
  );
}
