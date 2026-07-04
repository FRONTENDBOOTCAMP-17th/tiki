// 판매자 스태프 관리
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StaffManager from "./_components/StaffManager";

export const metadata = {
  title: "스태프 관리",
};

export default async function SellerStaffPage() {
  const user = await requireUser("/seller/staff");
  const supabase = await createClient();

  const [{ data: events }, { data: staffList }] = await Promise.all([
    supabase
      .from("event")
      .select("event_id, title")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_event_staff_overview"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        스태프 관리
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        공연별 현장 스태프를 초대하고 관리합니다. 스태프는 배정된 공연의 QR 입장
        검증만 수행할 수 있습니다.
      </p>
      <div className="mt-6">
        <StaffManager events={events ?? []} staffList={staffList ?? []} />
      </div>
    </div>
  );
}
