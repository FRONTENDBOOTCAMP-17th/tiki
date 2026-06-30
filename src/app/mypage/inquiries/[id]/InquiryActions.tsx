"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateInquiry, deleteInquiry } from "../actions";

const CATEGORY_OPTIONS = [
  { value: "reservation", label: "예매/취소" },
  { value: "payment", label: "결제/환불" },
  { value: "ticket", label: "티켓" },
  { value: "account", label: "계정" },
  { value: "etc", label: "기타" },
];

type Props = {
  inquiryId: string;
  category: string;
  title: string;
  content: string;
};

export default function InquiryActions({
  inquiryId,
  category,
  title,
  content,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateInquiry(inquiryId, formData);
      if (result.ok) {
        toast.success("문의가 수정되었습니다.");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInquiry(inquiryId);
      if (result.ok) {
        toast.success("문의가 삭제되었습니다.");
        router.push("/mypage/inquiries");
      } else {
        toast.error(result.error);
        setConfirmDelete(false);
      }
    });
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              문의 유형
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={100}
              defaultValue={title}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              문의 내용
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              maxLength={2000}
              defaultValue={content}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800 disabled:opacity-50"
            >
              {isPending ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={isPending}
        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        수정
      </button>

      {confirmDelete ? (
        <div className="flex items-center gap-2 rounded-xl bg-danger-100 px-3 py-1.5">
          <span className="text-sm text-danger-700">삭제할까요?</span>
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
          삭제
        </button>
      )}
    </div>
  );
}
