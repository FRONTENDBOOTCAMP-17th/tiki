import { getSupabaseAdmin } from "@/lib/supabase/admin";
import MemberTable from "./_components/MemberTable";

interface SearchParams {
  search?: string;
  role?: string;
  status?: string;
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, role, status } = await searchParams;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("users")
    .select("id, email, name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  const { data: users } = await query;

  const userIds = (users ?? []).map((u) => u.id);

  const [{ data: authData }, { data: orderRows }] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    userIds.length > 0
      ? supabase.from("orders").select("user_id").in("user_id", userIds).eq("status", "paid")
      : Promise.resolve({ data: [] }),
  ]);

  // 밴 상태
  const bannedIds = new Set(
    (authData?.users ?? [])
      .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
      .map((u) => u.id),
  );

  // 참여 파티(결제 완료 주문 수)
  const orderCountMap = new Map<string, number>();
  for (const o of orderRows ?? []) {
    orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
  }

  // banned 여부는 auth 쪽 데이터라 DB 쿼리로 못 거르므로 여기서 후처리한다.
  let enriched = (users ?? []).map((u) => ({
    ...u,
    banned: bannedIds.has(u.id),
    partyCount: orderCountMap.get(u.id) ?? 0,
  }));
  if (status === "active") enriched = enriched.filter((u) => !u.banned);
  if (status === "banned") enriched = enriched.filter((u) => u.banned);

  const indexed = enriched.map((u, index) => ({ ...u, index: index + 1 }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
      <MemberTable
        members={indexed}
        currentSearch={search ?? ""}
        currentRole={role ?? "all"}
        currentStatus={status ?? "all"}
      />
    </div>
  );
}
