import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { AUTH_ROUTES, PROTECTED_ROUTES } from './lib/auth/routes';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
