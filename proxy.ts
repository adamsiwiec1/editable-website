import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-cookie';

export function proxy(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  if (url.pathname === '/login' && req.cookies.get(ADMIN_COOKIE)?.value) {
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
