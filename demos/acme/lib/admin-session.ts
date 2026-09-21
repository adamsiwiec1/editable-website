import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from './admin-cookie';

export { ADMIN_COOKIE };

type AdminSession = {
  email: string;
  at: number;
};

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function expectedEmail(): string {
  return (process.env.ADMIN_EMAIL ?? 'admin@example.com').trim().toLowerCase();
}

function expectedPass(): string {
  return process.env.ADMIN_PASS ?? 'edit-demo';
}

function encodeSession(session: AdminSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64url');
}

function decodeSession(raw: string): AdminSession | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString()) as Partial<AdminSession>;
    if (!parsed.email || typeof parsed.email !== 'string') return null;
    return { email: parsed.email, at: typeof parsed.at === 'number' ? parsed.at : 0 };
  } catch {
    return null;
  }
}

export async function signInAdmin(email: string, pass: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  if (normalized !== expectedEmail() || pass !== expectedPass()) {
    throw new HttpError('Could not sign in.', 401);
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encodeSession({ email: normalized, at: Date.now() }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  return normalized;
}

export async function signOutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function requireAdmin(): Promise<string> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) throw new HttpError('Sign in required', 401);
  const session = decodeSession(raw);
  if (!session || session.email !== expectedEmail()) {
    throw new HttpError('Sign in required', 401);
  }
  return session.email;
}

export async function peekAdmin(): Promise<string | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
