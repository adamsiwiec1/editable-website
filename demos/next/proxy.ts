import { NextResponse, type NextRequest } from 'next/server';

export function proxy(_req: NextRequest): NextResponse {
  return NextResponse.next();
}
