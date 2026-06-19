import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/api/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event")
    .select("event_id, status, created_at")
    .eq("seller_id", user.id);

  if (error) return fail(error.message);

  return success({
    total: data.length,
    public: data.filter((e) => e.status === "공개").length,
    private: data.filter((e) => e.status === "비공개").length,
  });
}
