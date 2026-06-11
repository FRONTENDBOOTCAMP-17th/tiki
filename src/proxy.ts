import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from './lib/supabase.server';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = await createClient();

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
