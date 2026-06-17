import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import MyPageSidebar from "@/components/sidebar/MyPageSidebar";
import MobileDrawer from "@/components/mypage/MobileDrawer";

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header loggedIn showCategory={false} />

      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-screen-xl p-4 md:p-6">
          {/* 모바일+태블릿: 햄버거 */}
          <div className="mb-4 flex justify-end lg:hidden">
            <MobileDrawer>
              <MyPageSidebar />
            </MobileDrawer>
          </div>

          <div className="flex gap-6">
            {/* 데스크탑(lg+): 세로 사이드바 */}
            <div className="hidden w-64 shrink-0 lg:block">
              <MyPageSidebar />
            </div>
            <main className="min-w-0 flex-1 pb-20 min-[744px]:pb-0">{children}</main>
          </div>
        </div>
      </div>

      {/* 푸터: 데스크탑만 (lg+) → 태블릿에 X */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* 하단 탭바: 모바일만 (min-[744px]:hidden은 Navigation에 있음.) */}
      <Navigation className="fixed bottom-0 left-0 z-40" />
    </div>
  );
}