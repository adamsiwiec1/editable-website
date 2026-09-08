'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [pass, setPass] = useState('edit-demo');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? 'Could not sign in');
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2.5 text-zinc-50 outline-none focus:border-amber-400"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="pass" className="text-sm text-zinc-300">
          Password
        </label>
        <input
          id="pass"
          type="password"
          required
          autoComplete="current-password"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          className="w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2.5 text-zinc-50 outline-none focus:border-amber-400"
        />
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300 disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Enter the lot office'}
      </button>
    </form>
  );
}
