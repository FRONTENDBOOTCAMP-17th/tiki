import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 이메일 인증/소셜 로그인 완료 시점에 public.users 동기화.
      // 트리거 대신 앱 코드에서 처리해 가입 흐름이 DB 로직에 막히지 않게 한다.
      await syncPublicUser(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

async function syncPublicUser(user: AuthUser) {
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";

  const name =
    (meta.name as string | undefined) ??
    (meta.full_name as string | undefined) ??
    email.split("@")[0];

  try {
    const admin = getSupabaseAdmin();
    await admin.from("users").upsert(
      {
        id: user.id,
        email,
        name,
        phone: (meta.phone as string | undefined) ?? null,
        role: (meta.role as string | undefined) ?? "buyer",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  } catch (e) {
    // 동기화 실패가 로그인 자체를 막지 않도록 흡수한다.
    console.error("[auth/callback] public.users 동기화 실패:", e);
  }
}
