import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";

export async function GET() {
  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  const { data, error } = await supabase
    .from("event")
    .select("event_id, status, created_at")
    .eq("seller_id", user.id)
    .is("deleted_at", null); // 관리자가 삭제한 게시물 제외

  if (error) return fail(error.message);

  return success({
    total: data.length,
    public: data.filter((e) => e.status === "공개").length,
    private: data.filter((e) => e.status === "비공개").length,
  });
}
