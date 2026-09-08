'use client';

import { useRouter } from 'next/navigation';
import { DEFAULT_COPY } from '@/lib/copy';
import { useOptionalEditMode } from '@/components/cms/edit-mode-provider';

export function SignOutButton() {
  const router = useRouter();
  const cms = useOptionalEditMode();
  const label = cms?.text('chrome.sign_out') ?? DEFAULT_COPY['chrome.sign_out'];

  return (
    <button
      type="button"
      className="text-zinc-400 hover:text-white"
      onClick={async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
