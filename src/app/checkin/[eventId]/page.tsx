// 공용 QR 검증 - 스캔 화면 (모바일 중심). 셀러/배정 스태프 공용
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CheckinScanner from "@/components/checkin/CheckinScanner";

export const metadata = { title: "입장 검증" };

export default async function CheckinScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  // 셀러 본인 공연 or 배정 스태프만 접근
  const { data: allowed } = await supabase.rpc("can_checkin_event", {
    p_event_id: eventId,
  });
  if (!allowed) notFound();

  const { data: event } = await supabase
    .from("event")
    .select("title, venue_name")
    .eq("event_id", eventId)
    .maybeSingle();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
      <Link
        href="/checkin"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft size={15} />
        공연 목록
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {event?.title ?? "입장 검증"}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          관람객의 QR 티켓을 스캔하거나 8자리 코드를 입력해 입장을 처리하세요
        </p>
      </div>
      <CheckinScanner />
    </div>
  );
}
