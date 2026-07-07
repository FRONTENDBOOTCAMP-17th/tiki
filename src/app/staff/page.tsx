// 스태프 홈: 초대 + 배정 공연 목록
import Link from "next/link";
import { Calendar, ChevronRight, MapPin, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InviteActions from "./_components/InviteActions";

export const metadata = {
  title: "스태프 홈",
};

interface StaffEvent {
  staff_id: string;
  event_id: string;
  title: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  thumbnail: string;
  status: string;
  seller_name: string;
}

export default async function StaffHomePage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_staff_events");
  const events = (data ?? []) as StaffEvent[];

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
              id={`invite-${e.staff_id}`}
              className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50 p-4 target:ring-2 target:ring-amber-400 dark:border-amber-900 dark:bg-amber-950/40"
            >
              <p className="font-bold text-gray-900 dark:text-gray-50">
                {e.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {e.seller_name}님의 스태프 초대
              </p>
              <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-600 dark:bg-black/20 dark:text-gray-400">
                수락하면{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-500">
                  스태프로 전환
                </span>
                되어 이 공연의 입장 검증을 할 수 있어요. 기존 예매·구매 기능은
                그대로 사용할 수 있습니다.
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
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-[#3c4043]">
            <ScanLine className="text-gray-300" size={32} />
            <p className="font-medium text-gray-900 dark:text-gray-50">
              아직 배정된 공연이 없습니다
            </p>
            <p className="text-sm text-gray-500">
              판매자에게 스태프 초대를 받으면 여기에 담당 공연이 표시돼요.
              {pending.length > 0 && " 위의 받은 초대를 먼저 수락해 주세요."}
            </p>
          </div>
        ) : (
          accepted.map((e) => (
            <Link
              key={e.staff_id}
              href={`/checkin/${e.event_id}`}
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
