import type { ReactNode } from "react";
import Link from "next/link";
import SellerSidebar from "@/components/sidebar/SellerSidebar";
import RoleHeader from "@/components/RoleHeader";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (account?.role !== "seller") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-8 text-center dark:bg-[#202124]">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-mirage dark:text-gray-50">
            판매자만 접근 가능한 페이지입니다
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

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("store_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-8 text-center lg:hidden dark:bg-[#202124]">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-mirage dark:text-gray-50">
            데스크탑에서 이용해주세요
          </p>
          <p className="text-sm text-gray-500">
            판매자 페이지는 데스크탑 화면에서만 지원합니다.
          </p>
        </div>
      </div>

      <div className="hidden h-screen min-w-[1024px] flex-col overflow-hidden bg-[#fafafb] transition-colors lg:flex dark:bg-[#202124]">
        <RoleHeader role="seller" />
        <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-6">
          <SellerSidebar
            name={profile?.store_name ?? "판매자"}
            email={user?.email ?? ""}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
