import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InquiryActions from "./InquiryActions";

export const metadata = { title: "문의 상세 | TiKi" };

const CATEGORY_LABEL: Record<string, string> = {
  reservation: "예매/취소",
  payment: "결제/환불",
  ticket: "티켓",
  account: "계정",
  etc: "기타",
};

type InquiryDetail = {
  inquiry_id: string;
  category: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  answer: string | null;
  answered_at: string | null;
  created_at: string;
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

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inquiry")
    .select(
      "inquiry_id, category, title, content, status, answer, answered_at, created_at",
    )
    .eq("inquiry_id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const inquiry = data as InquiryDetail;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <Link
        href="/mypage/inquiries"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            d="M12 16l-4-4 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        문의 목록
      </Link>

      <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary-200 px-2 py-0.5 text-xs font-medium text-primary-800">
            {CATEGORY_LABEL[inquiry.category] ?? "기타"}
          </span>
          {inquiry.status === "answered" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
              답변 완료
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              답변 대기
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900">{inquiry.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          {formatDateTime(inquiry.created_at)}
        </p>

        <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {inquiry.content}
        </div>
      </article>

      {/* 답변 대기 상태일 때만 수정/삭제 가능 */}
      {inquiry.status === "pending" && (
        <InquiryActions
          inquiryId={inquiry.inquiry_id}
          category={inquiry.category}
          title={inquiry.title}
          content={inquiry.content}
        />
      )}

      <section className="mt-4">
        {inquiry.status === "answered" && inquiry.answer ? (
          <div className="rounded-2xl border border-primary-300 bg-primary-100 p-6 sm:p-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-800">
                TiKi 답변
              </span>
              {inquiry.answered_at && (
                <span className="text-xs text-gray-400">
                  {formatDateTime(inquiry.answered_at)}
                </span>
              )}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {inquiry.answer}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-400">
              아직 답변이 등록되지 않았습니다. 순차적으로 답변드리겠습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
