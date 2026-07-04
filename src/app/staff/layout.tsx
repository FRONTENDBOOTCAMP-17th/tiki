// 스태프 가드, 모바일 퍼스트
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/staff");
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (account?.role !== "staff" && account?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
            스태프 전용 페이지입니다
          </p>
          <p className="text-sm text-gray-500">
            공연 주최자에게 스태프 초대를 요청하세요
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return <div className="mx-auto w-full max-w-md px-4 py-8">{children}</div>;
}
