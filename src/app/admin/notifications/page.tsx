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

  const [{ data: users }, { data: rawNotifs }, { data: eventRows }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .neq("role", "admin")
      .order("created_at", { ascending: false }),
    // 관리자 발송 알림(type='ad'|'promo')만 발송 내역으로 집계.
    // 시스템 알림(friend_request/ticket_share/order)과 구분된다.
    supabase
      .from("notification")
      .select("title, type, created_at")
      .in("type", ["ad", "promo"])
      .order("created_at", { ascending: false })
      .limit(2000),
    // 알림에 게시물 링크를 바로 연결할 수 있도록 이벤트 목록도 함께 불러온다.
    // (삭제된 게시물은 링크 대상에서 제외)
    supabase
      .from("event")
      .select("event_id, title, status")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const members = (users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
  }));

  // 같은 제목+분 단위로 한 번의 발송 건으로 묶어 수신자 수를 센다.
  const batchMap = new Map<string, NotificationHistory>();
  for (const n of rawNotifs ?? []) {
    const minute = n.created_at.slice(0, 16);
    const key = `${n.title}__${minute}`;
    if (batchMap.has(key)) {
      batchMap.get(key)!.recipientCount += 1;
    } else {
      batchMap.set(key, {
        title: n.title,
        type: n.type,
        sentAt: n.created_at,
        recipientCount: 1,
      });
    }
  }
  const history = Array.from(batchMap.values());

  const events = (eventRows ?? []).map((e) => ({
    eventId: e.event_id,
    title: e.title,
    status: e.status,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
      <NotificationManager members={members} history={history} events={events} />
    </div>
  );
}
