import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail } from "./api-response";

// API 라우트 공통 인증 가드.
// 비로그인이면 401 응답을 error 로 돌려주고, 로그인이면 user + supabase 를 함께 준다.
// 사용: const ctx = await requireUserApi(); if ("error" in ctx) return ctx.error;
export async function requireUserApi() {
  const user = await getCurrentUser();
  if (!user) return { error: fail("unauthorized", 401) } as const;
  return { user, supabase: await createClient() } as const;
}
