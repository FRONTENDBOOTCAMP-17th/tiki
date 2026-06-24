import { getSupabaseAdmin } from "@/lib/supabase/admin";
import MemberTable from "./_components/MemberTable";

interface SearchParams {
  role?: string;
  search?: string;
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { role, search } = await searchParams;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("users")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: false });

  if (role && role !== "all") {
    query = query.eq("role", role);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users } = await query;

  // auth에서 밴 상태 가져오기
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const bannedIds = new Set(
    (authData?.users ?? [])
      .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
      .map((u) => u.id),
  );

  const enriched = (users ?? []).map((u) => ({
    ...u,
    banned: bannedIds.has(u.id),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
      <MemberTable
        members={enriched}
        currentRole={role ?? "all"}
        currentSearch={search ?? ""}
      />
    </div>
  );
}
