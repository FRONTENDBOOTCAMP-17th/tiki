import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAnswerForm from "./AdminAnswerForm";

export const metadata = { title: "문의 상세 | TiKi 관리자" };

const CATEGORY_LABEL: Record<string, string> = {
  reservation: "예매/취소",
  payment: "결제/환불",
  ticket: "티켓",
  account: "계정",
  etc: "기타",
};

type Detail = {
  inquiry_id: string;
  category: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  users: { name: string | null; email: string | null } | null;
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

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inquiry")
    .select(
      "inquiry_id, category, title, content, status, answer, answered_at, created_at, users:user_id (name, email)",
    )
    .eq("inquiry_id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const inquiry = data as unknown as Detail;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/inquiries"
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

      {/* 문의 본문 */}
      <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary-200 px-2 py-0.5 text-xs font-medium text-primary-800">
            {CATEGORY_LABEL[inquiry.category] ?? "기타"}
          </span>
          {inquiry.status === "answered" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
              답변 완료
            </span>
          ) : (
            <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
              답변 대기
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-mirage">{inquiry.title}</h1>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span>{inquiry.users?.name ?? "-"}</span>
          <span>·</span>
          <span>{inquiry.users?.email ?? ""}</span>
          <span>·</span>
          <span>{formatDateTime(inquiry.created_at)}</span>
        </div>

        <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {inquiry.content}
        </div>
      </article>

      {/* 답변 영역 */}
      <div className="mt-4">
        <AdminAnswerForm
          inquiryId={inquiry.inquiry_id}
          status={inquiry.status}
          existingAnswer={inquiry.answer}
          answeredAt={inquiry.answered_at}
        />
      </div>
    </div>
  );
}
