// 공연별 스캔
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CheckinScanner from "@/components/checkin/CheckinScanner";

export const metadata = {
  title: "입장 검증",
};

export default async function StaffCheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_my_staff_events");
  const assigned = (data ?? []).find(
    (e) => e.event_id === eventId && e.status === "accepted",
  );

  if (!assigned) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-bold text-gray-900 dark:text-gray-50">
          배정되지 않은 공연입니다
        </p>
        <Link
          href="/staff"
          className="mt-2 text-sm font-medium text-primary-600 hover:underline"
        >
          스태프 홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/staff"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft size={15} />
        담당 공연 목록
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {assigned.title}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          관람객의 QR 티켓을 스캔해 입장을 처리하세요
        </p>
      </div>
      <CheckinScanner />
    </div>
  );
}
