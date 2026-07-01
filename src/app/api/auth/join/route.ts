import { fail, success } from '@/lib/api/api-response';
import { createClient } from '@/lib/supabase/server';
import { JoinRequest } from '@/types/api/auth';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body: JoinRequest = await req.json();

  if (!body.email) {
    return fail('empty_email');
  }
  if (!body.name) {
    return fail('empty_name');
  }
  if (!body.password) {
    return fail('empty_password');
  }
  if (!body.phone) {
    return fail('empty_phone');
  }
  if (!body.role) {
    return fail('empty_role');
  }
  if (body.role === 'seller') {
    if (!body.organizerName) {
      return fail('empty_organizerName');
    }
    if (!body.storeName) {
      return fail('empty_storeName');
    }
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!passwordRegex.test(body.password)) {
    return fail('invalid_password');
  }

  const {
    email,
    password,
    organizerName: organizer_name,
    storeName: store_name,
    ...rest
  } = body;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { ...rest, organizer_name, store_name },
    },
  });

  if (error) {
    console.error("[AUTH-JOIN] signUp error:", error.message);
    if (
      error.message.includes("User already registered") ||
      error.message.includes("already been registered")
    ) {
      return fail("email_already_exists", 409);
    }
    return fail("signup_failed", 500);
  }

  return success(null, 'verification_email_sent');
}
