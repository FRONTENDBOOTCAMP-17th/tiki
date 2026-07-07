// 스태프 홈: 초대 + 배정 공연 목록
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Home, MapPin, ScanLine } from "lucide-react";
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
    <div className="flex flex-col gap-6 lg:gap-8">
      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-surface-3 dark:bg-surface-1 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-surface-3 dark:text-gray-100">
              <ScanLine size={14} />
              입장 검증 스태프
            </span>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
              스태프 홈
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              배정된 공연을 선택해 입장 검증을 시작하세요. 일반 티켓 탐색이
              필요하면 언제든 메인 홈으로 돌아갈 수 있습니다.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-surface-3 dark:bg-surface-2 dark:text-gray-100 dark:hover:bg-surface-3"
          >
            <Home size={17} />
            메인 홈으로
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-surface-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              받은 초대
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {pending.length}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-surface-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              담당 공연
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {accepted.length}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-primary-50 p-4 dark:bg-surface-2 sm:col-span-1">
            <p className="text-xs font-medium text-primary-700 dark:text-gray-300">
              다음 단계
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
              공연 선택 후 QR 검증
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start">
        {/* 받은 초대 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              받은 초대
            </h2>
            {pending.length > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {pending.length}건
              </span>
            )}
          </div>
          {pending.map((e) => (
            <div
              key={e.staff_id}
              id={`invite-${e.staff_id}`}
              className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50 p-4 target:ring-2 target:ring-amber-400 dark:border-amber-900 dark:bg-amber-950/40"
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
          {pending.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center dark:border-surface-3 dark:bg-surface-1">
              <p className="font-medium text-gray-900 dark:text-gray-50">
                새로 받은 초대가 없습니다
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                초대를 받으면 여기에서 수락하거나 거절할 수 있어요.
              </p>
            </div>
          )}
        </section>

        {/* 담당 공연 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            담당 공연
          </h2>
          {accepted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center dark:border-surface-3 dark:bg-surface-1">
              <ScanLine className="text-gray-300" size={32} />
              <p className="font-medium text-gray-900 dark:text-gray-50">
                아직 배정된 공연이 없습니다
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                판매자에게 스태프 초대를 받으면 여기에 담당 공연이 표시돼요.
                {pending.length > 0 && " 왼쪽의 받은 초대를 먼저 수락해 주세요."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {accepted.map((e) => (
                <Link
                  key={e.staff_id}
                  href={`/checkin/${e.event_id}`}
                  className="group flex min-h-36 overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-surface-3 dark:bg-surface-1 dark:hover:bg-surface-2"
                >
                  <div className="relative hidden w-28 shrink-0 overflow-hidden bg-linear-to-br from-primary-100 to-accent-100 sm:block">
                    {e.thumbnail && (
                      <Image
                        src={e.thumbnail}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-bold text-gray-900 dark:text-gray-50">
                        {e.title}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="shrink-0 text-gray-400" />
                        <span className="truncate">
                          {e.start_date} ~ {e.end_date}
                        </span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="shrink-0 text-gray-400" />
                        <span className="truncate">{e.venue_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-surface-3 dark:text-gray-100">
                        <ScanLine size={14} />
                        검증 시작
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600"
                      />
                    </div>
                  </div>
                </Link>
              ))}
              </div>
          )}
        </section>
      </div>
    </div>
  );
}
