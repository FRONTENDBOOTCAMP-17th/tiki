import "server-only";
import { createClient } from "@supabase/supabase-js";

// service role 클라이언트는 RLS를 모두 우회하므로, 정말 필요한 호출 시점에만
// 만들어 쓴다. 모듈 로드 시점에 즉시 생성하면 키가 없을 때 import만 해도 크래시한다.
export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 미설정 (서버 전용)");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}
