import { getSupabaseAdmin } from "@/lib/supabase/admin";
import MemberTable from "./_components/MemberTable";

interface SearchParams {
  search?: string;
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search } = await searchParams;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("users")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
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

  // 소셜 로그인 프로바이더
  const providerMap = new Map<string, string>();
  for (const u of authData?.users ?? []) {
    const provider = u.identities?.[0]?.provider ?? "email";
    providerMap.set(u.id, provider);
  }

  // 참여 파티(결제 완료 주문 수)
  const orderCountMap = new Map<string, number>();
  for (const o of orderRows ?? []) {
    orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
  }

  const enriched = (users ?? []).map((u, index) => ({
    ...u,
    index: index + 1,
    banned: bannedIds.has(u.id),
    provider: providerMap.get(u.id) ?? "email",
    partyCount: orderCountMap.get(u.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
      <MemberTable members={enriched} currentSearch={search ?? ""} />
    </div>
  );
}
