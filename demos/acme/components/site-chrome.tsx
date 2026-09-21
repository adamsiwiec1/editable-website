import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CopyText } from '@/components/cms/copy-text';
import { HeaderActions } from '@/components/demo/header-actions';

const REPO_URL = 'https://github.com/adamsiwiec1/editable-website';
const PROFILE_URL = 'https://github.com/adamsiwiec1';

export async function SiteChrome({
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
            <CopyText k="chrome.brand" as="p" className="font-display text-xl tracking-wide text-zinc-50" />
            <CopyText k="chrome.tagline" as="p" className="text-[0.7rem] tracking-[0.18em] text-amber-300/80 uppercase" />
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
            <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-zinc-300">
              <a href="#inventory" className="hover:text-white">
                <CopyText k="chrome.nav_inventory" />
              </a>
              <a href="#hours" className="hover:text-white">
                <CopyText k="chrome.nav_hours" />
              </a>
              <a href="#visit" className="hidden sm:inline hover:text-white">
                <CopyText k="chrome.nav_visit" />
              </a>
            </nav>
            <HeaderActions isAdmin={isAdmin} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <CopyText k="footer.blurb" as="p" className="max-w-xl text-sm leading-relaxed text-zinc-400" multiline />
              <CopyText k="footer.note" as="p" className="mt-4 text-xs tracking-wide text-zinc-600 uppercase" />
            </div>
            <div className="flex items-center gap-4">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/40 hover:text-white"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
                GitHub
              </a>
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noreferrer"
                title="@adamsiwiec1"
                className="block rounded-full ring-1 ring-white/20 transition hover:ring-amber-300/70"
              >
                <Image
                  src="https://github.com/adamsiwiec1.png"
                  alt="@adamsiwiec1"
                  width={44}
                  height={44}
                  className="rounded-full"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
