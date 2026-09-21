import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/login-form';
import { HIDDEN_LOGIN_PATH } from '@/lib/hidden-login-path';

export const metadata: Metadata = {
  title: 'Lot desk',
  robots: { index: false, follow: false },
};

export default function HiddenLoginPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5 py-16">
      <div
        data-demo="login-card"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-7 shadow-2xl shadow-black/40"
      >
        <p className="text-[0.65rem] tracking-[0.28em] text-amber-300 uppercase">Hidden login</p>
        <p className="mt-2 font-mono text-xs text-zinc-500">{HIDDEN_LOGIN_PATH}</p>
        <h1 className="mt-3 font-display text-3xl text-zinc-50">Access hidden login</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This URL is not in the nav. Any valid email and password works. This demo does not create a
          real session — you return to the lot and Edit the site appears.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-5 text-xs text-zinc-500">
          <Link href="/" className="text-amber-200 hover:text-white">
            ← Back to the lot
          </Link>
        </p>
      </div>
    </div>
  );
}
