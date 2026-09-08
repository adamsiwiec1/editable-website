import { NextResponse } from 'next/server';
import { signOutAdmin } from '@/lib/admin-session';

export async function POST(): Promise<NextResponse> {
  await signOutAdmin();
  return NextResponse.json({ ok: true as const });
}
