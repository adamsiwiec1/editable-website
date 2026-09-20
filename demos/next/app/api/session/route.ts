import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin';

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => ({}))) as { admin?: boolean };
  const res = NextResponse.json({ ok: true, admin: Boolean(body.admin) });
  if (body.admin) {
    res.cookies.set(ADMIN_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' });
  } else {
    res.cookies.delete(ADMIN_COOKIE);
  }
  return res;
}
