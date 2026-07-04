// 스태프 홈: 초대 + 배정 공연 목록
import Link from "next/link";
import { Calendar, ChevronRight, MapPin, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InviteActions from "./_components/InviteActions";

export const metadata = {
  title: "스태프 홈",
};

export default async function StaffHomePage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_staff_events");
  const events = data ?? [];

  const pending = events.filter((e) => e.status === "pending");
  const accepted = events.filter((e) => e.status === "accepted");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          스태프 홈
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          배정된 공연을 선택해 입장 검증을 시작하세요
        </p>
      </div>

      {/* 받은 초대 */}
      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">받은 초대</h2>
          {pending.map((e) => (
            <div
              key={e.staff_id}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
            >
              <p className="font-bold text-gray-900 dark:text-gray-50">
                {e.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {e.seller_name}님의 스태프 초대
              </p>
              <InviteActions staffId={e.staff_id} />
            </div>
          ))}
        </section>
      )}

      {/* 담당 공연 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-500">담당 공연</h2>
        {accepted.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-[#3c4043]">
            아직 배정된 공연이 없습니다
          </div>
        ) : (
          accepted.map((e) => (
            <Link
              key={e.staff_id}
              href={`/staff/checkin/${e.event_id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-[#3c4043] dark:hover:bg-[#2c2d30]"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900 dark:text-gray-50">
                  {e.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className="shrink-0 text-gray-400" />
                  {e.start_date} ~ {e.end_date}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} className="shrink-0 text-gray-400" />
                  {e.venue_name}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-primary-600">
                <ScanLine size={18} />
                <ChevronRight size={16} />
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
