import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { isCopyKey } from '@/lib/copy';
import { copyStore } from '@/lib/copy-store';
import { copyPatchSchema, jsonError, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const content = await copyStore.get();
    return NextResponse.json(content);
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    const body = await readJson(req, copyPatchSchema);
    if (!isCopyKey(body.key)) {
      return NextResponse.json({ error: 'Unknown copy key' }, { status: 400 });
    }
    const content = await copyStore.save({ key: body.key, value: body.value });
    return NextResponse.json(content);
  } catch (err) {
    return jsonError(err);
  }
}
