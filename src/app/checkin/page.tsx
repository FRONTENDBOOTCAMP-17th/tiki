// 공용 QR 검증 - 공연 선택 (셀러 본인 공연 + 배정 스태프 공연)
import Link from "next/link";
import { ScanLine, TicketCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "입장 검증" };

interface CheckinEvent {
  event_id: string;
  title: string;
  venue_name: string | null;
  thumbnail: string | null;
  my_role: "seller" | "staff";
}

export default async function CheckinSelectPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_checkin_events");
  const events = (data ?? []) as CheckinEvent[];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <div className="flex items-center gap-2">
        <ScanLine className="text-primary-600" size={22} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          입장 검증
        </h1>
      </div>
      <p className="-mt-2 text-sm text-gray-500">검증할 공연을 선택하세요</p>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-surface-3">
          <TicketCheck className="text-gray-300" size={32} />
          <p className="font-medium text-gray-900 dark:text-gray-50">
            검증 가능한 공연이 없습니다
          </p>
          <p className="text-sm text-gray-500">
            판매자로 등록한 공연이나 배정받은 스태프 공연이 여기 표시됩니다
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {events.map((e) => (
            <li key={e.event_id}>
              <Link
                href={`/checkin/${e.event_id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-surface-3 dark:hover:bg-surface-elevated"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {e.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{e.venue_name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-surface-header dark:text-gray-300">
                  {e.my_role === "seller" ? "판매자" : "스태프"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
