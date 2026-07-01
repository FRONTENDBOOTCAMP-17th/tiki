import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "1:1 문의 관리 | TiKi" };

const CATEGORY_LABEL: Record<string, string> = {
  reservation: "예매/취소",
  payment: "결제/환불",
  ticket: "티켓",
  account: "계정",
  etc: "기타",
};

type Row = {
  inquiry_id: string;
  category: string;
  title: string;
  status: "pending" | "answered";
  created_at: string;
  users: { name: string | null; email: string | null } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("inquiry")
    .select(
      "inquiry_id, category, title, status, created_at, users:user_id (name, email)",
    )
    .order("created_at", { ascending: false });

  if (status === "pending" || status === "answered") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  const inquiries = (data ?? []) as unknown as Row[];

  const filters = [
    { value: undefined, label: "전체" },
    { value: "pending", label: "답변 대기" },
    { value: "answered", label: "답변 완료" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-bold text-mirage">1:1 문의 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          접수된 문의를 확인하고 답변을 등록합니다.
        </p>
      </header>

      {/* 상태 필터 */}
      <div className="mb-4 flex gap-2">
        {filters.map((f) => {
          const active = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={
                f.value
                  ? `/admin/inquiries?status=${f.value}`
                  : "/admin/inquiries"
              }
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-700 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">작성자</th>
              <th className="px-4 py-3 font-medium">접수일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inquiries.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-gray-400"
                >
                  접수된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              inquiries.map((it) => (
                <tr
                  key={it.inquiry_id}
                  className="transition-colors hover:bg-primary-100"
                >
                  <td className="px-4 py-3">
                    {it.status === "answered" ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        답변 완료
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                        답변 대기
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {CATEGORY_LABEL[it.category] ?? "기타"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inquiries/${it.inquiry_id}`}
                      className="font-medium text-mirage hover:underline"
                    >
                      {it.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {it.users?.name ?? "-"}
                    <span className="ml-1 text-xs text-gray-400">
                      {it.users?.email ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {formatDate(it.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
