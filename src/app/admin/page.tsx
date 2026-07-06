import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Users, CalendarDays, ShoppingCart, Tags } from "lucide-react";
import StatCard from "@/components/StatCard";
import { todayKST } from "@/lib/date";
import Link from "next/link";

// 결제 완료(paid) 주문 매출 합계. select+reduce는 1000행 제한에 걸리므로
// range로 페이지를 넘겨가며 전량을 합산한다. (누적 매출 정확도 보장)
async function sumPaidRevenue(
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<number> {
  const pageSize = 1000;
  let from = 0;
  let total = 0;

  for (;;) {
    const { data } = await supabase
      .from("orders")
      .select("total_price")
      .eq("status", "paid")
      .range(from, from + pageSize - 1);

    const page = data ?? [];
    total += page.reduce((sum, o) => sum + o.total_price, 0);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  return total;
}

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdmin();

  // 이번 달 시작(KST 00:00)을 UTC 시각으로 환산. (서버 타임존과 무관하게 KST 기준)
  const [year, month] = todayKST().split("-").map(Number);
  const monthStart = new Date(
    Date.UTC(year, month - 1, 1) - 9 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { data: userRoles, count: totalUsers },
    { data: events },
    totalRevenue,
    { count: totalCategories },
    { count: monthOrderCount },
  ] = await Promise.all([
    supabase.from("users").select("role", { count: "exact" }),
    supabase.from("event").select("status, title, event_id, created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
    sumPaidRevenue(supabase),
    supabase.from("category").select("*", { count: "exact", head: true }),
    // 이번 달 "결제 완료(paid)" 주문만 집계. isBooked 규칙과 동일하게 결제 대기/취소/실패는 제외.
    // DB에서 count로 세어 1000행 제한과 타임존 문제를 함께 해결한다.
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", monthStart),
  ]);

  const buyerCount = (userRoles ?? []).filter((u) => u.role === "buyer").length;
  const sellerCount = (userRoles ?? []).filter((u) => u.role === "seller").length;

  const publishedCount = (events ?? []).filter((e) => e.status === "공개").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          대시보드
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("ko-KR", {
            timeZone: "Asia/Seoul",
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
          value={`${(monthOrderCount ?? 0).toLocaleString()}건`}
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
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1">
          <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-50">
            회원 현황
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-surface-2">
              <span className="text-sm text-gray-600">총 회원 수</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {(totalUsers ?? 0).toLocaleString()}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-surface-2">
              <span className="text-sm text-gray-600">구매자</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {buyerCount}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-surface-2">
              <span className="text-sm text-gray-600">판매자</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {sellerCount}명
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-surface-2">
              <span className="text-sm text-gray-600">누적 매출</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {totalRevenue.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1">
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
                  <Link
                    href={`/${event.event_id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-2"
                  >
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">
          빠른 이동
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/admin/members"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-surface-3 dark:hover:border-gray-500 dark:hover:bg-surface-4"
          >
            <Users size={20} className="text-primary-500 dark:text-gray-100" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              회원 관리
            </span>
          </Link>
          <Link
            href="/admin/events"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-surface-3 dark:hover:border-gray-500 dark:hover:bg-surface-4"
          >
            <CalendarDays size={20} className="text-primary-500 dark:text-gray-100" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              이벤트 모니터링
            </span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-surface-3 dark:hover:border-gray-500 dark:hover:bg-surface-4"
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
