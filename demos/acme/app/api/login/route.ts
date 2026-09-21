import { NextResponse } from 'next/server';
import { signInAdmin } from '@/lib/admin-session';
import { jsonError, loginSchema, readJson } from '@/lib/http';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await readJson(req, loginSchema);
    await signInAdmin(body.email, body.pass);
    return NextResponse.json({ ok: true as const });
  } catch (err) {
    return jsonError(err);
  }
}
