import type { ReactNode } from "react";
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
      <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-mirage">
            판매자만 접근 가능한 페이지입니다
          </p>
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
      <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-8 text-center lg:hidden">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-mirage">
            데스크탑에서 이용해주세요
          </p>
          <p className="text-sm text-gray-500">
            판매자 페이지는 데스크탑 화면에서만 지원합니다.
          </p>
        </div>
      </div>

      <div className="hidden min-h-screen flex-col bg-[#fafafb] lg:flex">
        <RoleHeader role="seller" />
        <div className="flex flex-1 gap-6 p-6">
          <SellerSidebar
            name={profile?.store_name ?? "판매자"}
            email={user?.email ?? ""}
          />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
