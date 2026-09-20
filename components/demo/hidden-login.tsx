'use client';

import { useState, type FormEvent } from 'react';
import { isValidDemoEmail, setDemoOwner } from '@/lib/demo-owner';

export function HiddenLoginForm({
  hideSubmit = false,
  onSuccess,
}: {
  hideSubmit?: boolean;
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDemoEmail(email) || !pass.trim()) {
      setError('Enter a valid email and a password.');
      return;
    }
    setError(null);
    setDemoOwner(true);
    onSuccess?.();
  };

  return (
    <form
      data-demo="hidden-login-form"
      className="space-y-3"
      onSubmit={onSubmit}
    >
      <div className="space-y-1.5">
        <label htmlFor="hidden-login-email" className="text-sm text-zinc-300">
          Email
        </label>
        <input
          id="hidden-login-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2.5 text-zinc-50 outline-none focus:border-amber-400"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="hidden-login-pass" className="text-sm text-zinc-300">
          Password
        </label>
        <input
          id="hidden-login-pass"
          type="password"
          required
          autoComplete="current-password"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          className="w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2.5 text-zinc-50 outline-none focus:border-amber-400"
        />
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {!hideSubmit && (
        <button
          type="submit"
          className="w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
        >
          Sign in
        </button>
      )}
    </form>
  );
}
