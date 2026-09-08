'use client';

import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';
import { useDemoTour } from './site-tour';

export function HeaderActions({ isAdmin }: { isAdmin: boolean }) {
  const { active, revealOwnerSignIn, start, continueFromInvite } = useDemoTour();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      {revealOwnerSignIn && (
        <Link
          href="/login"
          data-demo="owner-sign-in"
          className="demo-appear rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-100 hover:border-amber-300 hover:text-white"
        >
          Sign in
        </Link>
      )}
      {isAdmin && <SignOutButton />}
      <button
        type="button"
        data-demo="try-demo"
        onClick={() => (active ? continueFromInvite() : start())}
        className="rounded-full border border-amber-400/40 px-3 py-1.5 text-sm text-amber-200 hover:border-amber-300 hover:text-white"
      >
        Try the demo →
      </button>
    </div>
  );
}
