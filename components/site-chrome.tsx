import type { ReactNode } from 'react';
import Link from 'next/link';
import { EditableText } from '@/components/cms/editable-text';
import { SignOutButton } from '@/components/sign-out-button';

export function SiteChrome({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="min-w-0">
            <EditableText k="chrome.brand" as="p" className="font-display text-xl tracking-wide text-zinc-50" />
            <EditableText k="chrome.tagline" as="p" className="text-[0.7rem] tracking-[0.18em] text-amber-300/80 uppercase" />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-zinc-300">
            <a href="#inventory" className="hover:text-white">
              <EditableText k="chrome.nav_inventory" />
            </a>
            <a href="#hours" className="hover:text-white">
              <EditableText k="chrome.nav_hours" />
            </a>
            <a href="#visit" className="hidden sm:inline hover:text-white">
              <EditableText k="chrome.nav_visit" />
            </a>
            {isAdmin ? (
              <SignOutButton />
            ) : (
              <Link href="/login" className="rounded-full border border-amber-400/40 px-3 py-1.5 text-amber-200 hover:border-amber-300 hover:text-white">
                <EditableText k="chrome.sign_in" />
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <EditableText k="footer.blurb" as="p" className="max-w-xl text-sm leading-relaxed text-zinc-400" multiline />
          <EditableText k="footer.note" as="p" className="mt-4 text-xs tracking-wide text-zinc-600 uppercase" />
        </div>
      </footer>
    </div>
  );
}
