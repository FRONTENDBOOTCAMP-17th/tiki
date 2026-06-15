import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createMiddlewareClient(request, response);

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
