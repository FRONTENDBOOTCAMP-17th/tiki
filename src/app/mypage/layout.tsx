import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import MyPageSidebar from "@/components/sidebar/MyPageSidebar";
import MobileDrawer from "@/components/mypage/MobileDrawer";
import { requireUser, isAuthenticated } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("users")
    .select("name, email, role, avatar_url")
    .eq("id", user.id)
    .single();

  const profile = {
    name: account?.name ?? "",
    email: account?.email ?? "",
    role: account?.role ?? "buyer",
    avatarUrl: account?.avatar_url ?? null,
  };

  if (!account) {
    throw new Error("User not found");
  }

  const loggedIn = await isAuthenticated();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        loggedIn={loggedIn}
        profile={profile}
        showCategory={false}
        mobileMenu={
          <MobileDrawer>
            <MyPageSidebar {...profile} />
          </MobileDrawer>
        }
      />

      <div className="flex-1 bg-gray-50 dark:bg-[#202124]">
        <div className="mx-auto max-w-screen-xl p-4 md:p-6">
          <div className="flex gap-6">
            {/* 데스크탑(lg+): 세로 사이드바 */}
            <div className="hidden w-64 shrink-0 lg:block">
              <MyPageSidebar {...profile} />
            </div>
            <main className="min-w-0 flex-1 pb-20 min-[744px]:pb-0">
              {children}
            </main>
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
