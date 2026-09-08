import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-7 shadow-2xl shadow-black/40">
        <p className="text-[0.65rem] tracking-[0.28em] text-amber-300 uppercase">Dummy login</p>
        <h1 className="mt-3 font-display text-3xl text-zinc-50">Lot office</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This is a local cookie session, not a live auth provider. Use the demo inbox and password, then tap
          Edit on the lot to change copy.
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
