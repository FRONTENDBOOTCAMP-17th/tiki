import { getSupabaseAdmin } from "@/lib/supabase/admin";
import SettlementApproval from "./_components/SettlementApproval";

export default async function AdminSettlementPage() {
  const supabase = getSupabaseAdmin();

  // 신청(requested)이 위로 오도록 status 내림차순 정렬 후 최신순
  const { data: requestRows } = await supabase
    .from("settlement_request")
    .select(
      "settlement_id, seller_id, period_start, period_end, gross, fee, net, status, requested_at, approved_at",
    )
    .order("status", { ascending: false })
    .order("requested_at", { ascending: false });

  const requests = requestRows ?? [];

  // 판매자명: 상점명(seller_profiles) 우선, 없으면 users.name/email 로 대체
  const sellerIds = [...new Set(requests.map((r) => r.seller_id))];
  const storeMap = new Map<string, string>();
  const userMap = new Map<string, string>();

  if (sellerIds.length) {
    const { data: profiles } = await supabase
      .from("seller_profiles")
      .select("id, store_name")
      .in("id", sellerIds);
    for (const p of profiles ?? []) {
      if (p.store_name) storeMap.set(p.id, p.store_name);
    }

    const { data: sellers } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", sellerIds);
    for (const u of sellers ?? []) {
      userMap.set(u.id, u.name || u.email);
    }
  }

  const enriched = requests.map((r) => ({
    ...r,
    seller_name:
      storeMap.get(r.seller_id) || userMap.get(r.seller_id) || "알 수 없음",
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          정산 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          판매자의 정산 신청을 검토하고 승인합니다.
        </p>
      </div>
      <SettlementApproval initialRequests={enriched} />
    </div>
  );
}
