import { getSupabaseAdmin } from "@/lib/supabase/admin";
import NotificationManager from "./_components/NotificationManager";

export interface NotificationHistory {
  title: string;
  type: string;
  sentAt: string;
  recipientCount: number;
}

export default async function AdminNotificationsPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: users }, { data: rawNotifs }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .neq("role", "admin")
      .order("created_at", { ascending: false }),
    supabase
      .from("notification")
      .select("title, type, created_at, ref_id")
      .or("ref_id.in.(admin_all,admin_buyer,admin_seller,admin_specific),type.in.(admin_all,admin_buyer,admin_seller,admin_specific)")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const members = (users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
  }));

  // 1분 단위로 같은 title+type+link를 하나의 발송 건으로 묶음
  const batchMap = new Map<string, NotificationHistory>();
  for (const n of rawNotifs ?? []) {
    const minute = n.created_at.slice(0, 16);
    const key = `${n.type}__${n.title}__${minute}`;
    if (batchMap.has(key)) {
      batchMap.get(key)!.recipientCount += 1;
    } else {
      batchMap.set(key, {
        title: n.title,
        type: n.ref_id || n.type,
        sentAt: n.created_at,
        recipientCount: 1,
      });
    }
  }
  const history = Array.from(batchMap.values());

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
      <NotificationManager members={members} history={history} />
    </div>
  );
}
