'use client';

import { useRouter } from 'next/navigation';
import { DEFAULT_COPY } from '@/lib/copy';
import { setDemoOwner } from '@/lib/demo-owner';

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-zinc-400 hover:text-white"
      onClick={async () => {
        setDemoOwner(false);
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
    >
      <span data-copy="chrome.sign_out">{DEFAULT_COPY['chrome.sign_out']}</span>
    </button>
  );
}
