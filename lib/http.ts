import { NextResponse } from 'next/server';
import { z } from 'zod';
import { HttpError } from './admin-session';

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  pass: z.string().min(1).max(200),
});

export const copyPatchSchema = z.object({
  key: z.string().trim().min(1).max(80),
  value: z.string().max(4000),
});

export function jsonError(err: unknown): NextResponse<{ error: string }> {
  if (err instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : 'Unexpected error';
  console.error('[api]', err);
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await req.json());
}
