import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'ew-demo-admin';

export async function peekAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === '1';
}
