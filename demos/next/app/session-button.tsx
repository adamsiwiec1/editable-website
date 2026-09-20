'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SessionButton({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className={isAdmin ? undefined : 'primary'}
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin: !isAdmin }),
        }).then(() => {
          setBusy(false);
          router.refresh();
        });
      }}
    >
      {isAdmin ? 'Sign out' : 'Sign in as owner'}
    </button>
  );
}
