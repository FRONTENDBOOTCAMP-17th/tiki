import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  Ticket,
  Armchair,
  ArrowRight,
  Plus,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import PageHeader from "../_components/PageHeader";
import {
  sumCapacityByEvent,
  sumOrdersByEvent,
  isBooked,
} from "../_lib/stats";
import type { EventRow } from "./types";

export default async function SellerDashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: eventRows } = await supabase
    .from("event")
    .select(
      "event_id, title, status, thumbnail, start_date, end_date, venue_name",
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const events = (eventRows ?? []) as EventRow[];
  const eventIds = events.map((event) => event.event_id);

  const [{ data: orderRows }, { data: gradeRows }] = await Promise.all([
    eventIds.length
      ? supabase
          .from("orders")
          .select("event_id, quantity, total_price, status")
          .in("event_id", eventIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase
          .from("ticket_grade")
          .select("event_id, quantity")
          .in("event_id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const orders = (orderRows ?? []).filter((order) => isBooked(order.status));
  const orderStats = sumOrdersByEvent(orders);
  const capacityMap = sumCapacityByEvent(gradeRows ?? []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalOrders = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalCapacity = [...capacityMap.values()].reduce((a, b) => a + b, 0);
  const remainingSeats = Math.max(0, totalCapacity - totalOrders);
  const publicEvents = events.filter((e) => e.status === "공개");
  const publicCount = publicEvents.length;

  const performance = events
    .map((event) => ({
      ...event,
      revenue: orderStats.get(event.event_id)?.totalRevenue ?? 0,
      orders: orderStats.get(event.event_id)?.totalOrders ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topRevenue = performance[0]?.revenue ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <PageHeader
        title="대시보드"
        actions={
          <Link href="/seller/registration">
            <Button>
              <Plus size={16} />
              새 이벤트 등록
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="총 매출"
          value={`${totalRevenue.toLocaleString()}원`}
          tone="accent"
          href="/seller/settlement"
        />
        <StatCard
          icon={Ticket}
          label="총 예매"
          value={`${totalOrders.toLocaleString()}건`}
          tone="secondary"
          href="/seller/ticketManagement"
        />
        <StatCard
          icon={CalendarDays}
          label="진행 중 이벤트"
          value={`${publicCount}개`}
          tone="primary"
          href="/seller/list"
        />
        <StatCard
          icon={Armchair}
          label="잔여 좌석"
          value={`${remainingSeats.toLocaleString()}석`}
          tone="neutral"
          href="/seller/list"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">이벤트별 매출</h2>
            <Link href="/seller/settlement">
              <Button size="sm" variant="outlinePrimary">
                정산 보기
              </Button>
            </Link>
          </div>

          {performance.length === 0 ? (
            <EmptyHint />
          ) : (
            <ul className="space-y-3">
              {performance.slice(0, 5).map((event) => (
                <li key={event.event_id}>
                  <Link
                    href={`/seller/events/${event.event_id}`}
                    className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-surface-2"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                        {event.title}
                      </span>
                      <span className="shrink-0 font-semibold text-gray-900 dark:text-gray-50">
                        {event.revenue.toLocaleString()}원
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-surface-3">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{
                          width: `${topRevenue ? (event.revenue / topRevenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">최근 이벤트</h2>
            <Link href="/seller/list">
              <Button size="sm" variant="outlinePrimary">
                전체 보기
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {publicEvents.length === 0 ? (
            <EmptyHint />
          ) : (
            <ul className="space-y-1">
              {publicEvents.slice(0, 4).map((event) => (
                <li key={event.event_id}>
                  <Link
                    href={`/seller/events/${event.event_id}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                        {event.title}
                      </p>
                      <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                        {event.venue_name} · {event.start_date}
                      </p>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-gray-300 dark:text-gray-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
      아직 데이터가 없습니다
    </div>
  );
}
