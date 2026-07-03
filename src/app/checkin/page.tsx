// 서버 컴포넌트 가드
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CheckinScanner from "./_components/CheckinScanner";

export const metadata = {
  title: "입장 검증",
};

export default async function CheckinPage() {
  const user = await requireUser("/checkin");
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (account?.role !== "seller" && account?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-mirage dark:text-gray-50">
            판매자 · 관리자만 접근 가능한 페이지입니다
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

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        입장 검증
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        관람객의 QR 티켓을 스캔해 입장을 처리합니다
      </p>
      <div className="mt-6">
        <CheckinScanner />
      </div>
    </div>
  );
}
