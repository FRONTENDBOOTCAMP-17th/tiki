import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InquiryForm from "./InquiryForm";

export const metadata = { title: "1:1 문의 | TiKi" };

const CATEGORY_LABEL: Record<string, string> = {
  reservation: "예매/취소",
  payment: "결제/환불",
  ticket: "티켓",
  account: "계정",
  etc: "기타",
};

type InquiryRow = {
  inquiry_id: string;
  category: string;
  title: string;
  status: "pending" | "answered";
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function InquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("inquiry")
    .select("inquiry_id, category, title, status, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const inquiries = (data ?? []) as InquiryRow[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          1:1 문의
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          궁금한 점을 남겨주시면 순차적으로 답변드립니다. 답변은 이 페이지에서
          확인할 수 있습니다.
        </p>
      </header>

      {/* 작성 폼 */}
      <InquiryForm />

      {/* 목록 */}
      <section className="mt-8">
        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-sm text-gray-400">
              아직 등록한 문의가 없습니다.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {inquiries.map((it) => (
              <li key={it.inquiry_id}>
                <Link
                  href={`/mypage/inquiries/${it.inquiry_id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-violet-50/50"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
                        {CATEGORY_LABEL[it.category] ?? "기타"}
                      </span>
                      <StatusBadge status={it.status} />
                    </div>
                    <p className="truncate font-medium text-gray-900">
                      {it.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDate(it.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: "pending" | "answered" }) {
  if (status === "answered") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
        답변 완료
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      답변 대기
    </span>
  );
}
