"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInquiry } from "./actions";

const CATEGORY_OPTIONS = [
  { value: "reservation", label: "예매/취소" },
  { value: "payment", label: "결제/환불" },
  { value: "ticket", label: "티켓" },
  { value: "account", label: "계정" },
  { value: "etc", label: "기타" },
];

type Props = {
  userName: string | null;
  userEmail: string | null;
};

export default function InquiryForm({ userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createInquiry(formData);
      if (result.ok) {
        toast.success("문의가 등록되었습니다.");
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
      >
        문의하기
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        {(userName || userEmail) && (
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="mb-1 text-xs font-medium text-gray-500">
              문의자 정보
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
              {userName && <span className="font-medium">{userName}</span>}
              {userEmail && <span className="text-gray-500">{userEmail}</span>}
            </div>
          </div>
        )}

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
            defaultValue="etc"
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
            placeholder="문의 제목을 입력해 주세요"
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
            placeholder="문의하실 내용을 자세히 작성해 주세요"
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
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
            {isPending ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </form>
  );
}
