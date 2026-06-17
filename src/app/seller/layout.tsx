import type { ReactNode } from "react";
import SellerSidebar from "@/components/sidebar/SellerSidebar";
import RoleHeader from "@/components/RoleHeader";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-8 text-center md:hidden">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            판매자 페이지는 화면이 큰 기기(태블릿 이상)에서만 지원합니다.
          </p>
        </div>
      </div>

      <div className="hidden min-h-screen flex-col bg-[#fafafb] md:flex">
        <RoleHeader role="seller" />
        <div className="flex flex-1 gap-6 p-6">
          <SellerSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
