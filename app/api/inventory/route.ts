import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { inventoryStore } from '@/lib/inventory-store';
import { inventoryPatchSchema, jsonError, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await inventoryStore.get());
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    const body = await readJson(req, inventoryPatchSchema);
    return NextResponse.json(await inventoryStore.saveSlot(body.slot, body.id));
  } catch (err) {
    return jsonError(err);
  }
}
