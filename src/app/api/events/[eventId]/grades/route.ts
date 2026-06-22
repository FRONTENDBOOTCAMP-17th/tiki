import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";
import { GradeListData } from "@/types/api/event";

// 이벤트별 좌석 등급 목록(ticket_grade) — GET /api/events/{eventId}/grades
// anon 읽기 가능

type GradeRow = {
  grade_id: string;
  event_id: string;
  grade_name: string;
  price: number;
  quantity: number;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_grade")
    .select("grade_id, event_id, grade_name, price, quantity")
    .eq("event_id", eventId)
    .order("price", { ascending: false });

  if (error) return fail(error.message, 500);

  const rows = (data ?? []) as GradeRow[];
  const result: GradeListData = {
    grades: rows.map((r) => ({
      gradeId: r.grade_id,
      eventId: r.event_id,
      name: r.grade_name,
      price: r.price,
      quantity: r.quantity,
    })),
  };

  return success(result);
}
