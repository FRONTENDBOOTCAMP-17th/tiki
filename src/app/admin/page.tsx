import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Users, CalendarDays, ShoppingCart, Tags } from "lucide-react";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdmin();

  const [
    { data: userRoles, count: totalUsers },
    { data: events },
    { data: orders },
    { count: totalCategories },
  ] = await Promise.all([
    supabase.from("users").select("role", { count: "exact" }),
    supabase.from("event").select("status, title, event_id, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total_price, status, created_at"),
    supabase.from("category").select("*", { count: "exact", head: true }),
  ]);

  const buyerCount = (userRoles ?? []).filter((u) => u.role === "buyer").length;
  const sellerCount = (userRoles ?? []).filter((u) => u.role === "seller").length;

  const paidOrders = (orders ?? []).filter((o) => o.status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthOrders = (orders ?? []).filter(
    (o) => o.created_at && o.created_at >= monthStart,
  );

  const publishedCount = (events ?? []).filter((e) => e.status === "공개").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          대시보드
        </h1>
        <p className="text-sm text-gray-500">
          {now.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="전체 회원"
          value={`${(totalUsers ?? 0).toLocaleString()}명`}
          tone="primary"
          href="/admin/members"
        />
        <StatCard
          icon={CalendarDays}
          label="공개 이벤트"
          value={`${publishedCount}개`}
          tone="secondary"
          href="/admin/events"
        />
        <StatCard
          icon={ShoppingCart}
          label="이번 달 주문"
          value={`${monthOrders.length.toLocaleString()}건`}
          tone="accent"
        />
        <StatCard
          icon={Tags}
          label="카테고리"
          value={`${(totalCategories ?? 0).toLocaleString()}개`}
          tone="neutral"
          href="/admin/categories"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
          <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-50">
            회원 현황
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#303134]">
              <span className="text-sm text-gray-600">총 회원 수</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {(totalUsers ?? 0).toLocaleString()}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#303134]">
              <span className="text-sm text-gray-600">구매자</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {buyerCount}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#303134]">
              <span className="text-sm text-gray-600">판매자</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {sellerCount}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#303134]">
              <span className="text-sm text-gray-600">누적 매출</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {totalRevenue.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">
              최근 등록 이벤트
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-medium text-primary-600 hover:underline dark:text-gray-300"
            >
              전체 보기
            </Link>
          </div>
          {(events ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">등록된 이벤트가 없습니다</p>
          ) : (
            <ul className="space-y-1">
              {(events ?? []).map((event) => (
                <li key={event.event_id}>
                  <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#303134]">
                    <span className="truncate text-sm text-gray-800 dark:text-gray-200">
                      {event.title}
                    </span>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        event.status === "공개"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">
          빠른 이동
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/admin/members"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-[#3c4043] dark:hover:border-gray-500 dark:hover:bg-[#34363a]"
          >
            <Users size={20} className="text-primary-500 dark:text-gray-100" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              회원 관리
            </span>
          </Link>
          <Link
            href="/admin/events"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-[#3c4043] dark:hover:border-gray-500 dark:hover:bg-[#34363a]"
          >
            <CalendarDays size={20} className="text-primary-500 dark:text-gray-100" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              이벤트 모니터링
            </span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-[#3c4043] dark:hover:border-gray-500 dark:hover:bg-[#34363a]"
          >
            <Tags size={20} className="text-primary-500 dark:text-gray-100" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              카테고리 관리
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
