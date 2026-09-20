'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { mount, unmount } from 'editable-website';
import { useDemoTour } from '@/components/demo/site-tour';
import { mountOptions } from '@/lib/browser-host';
import { useDemoOwner } from '@/lib/demo-owner';

export function EditableHost({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const demoOwner = useDemoOwner();
  const { active, start, continueFromInvite } = useDemoTour();
  const effectiveAdmin = isAdmin || demoOwner;

  useEffect(() => {
    if (isAdmin) {
      void mount({ isAdmin: true, endpoints: { copy: '/api/copy' } });
    } else if (demoOwner) {
      void mount(mountOptions({ isAdmin: true }));
    } else {
      void mount({ isAdmin: false, endpoints: { copy: '/api/copy' } });
    }
    return () => unmount();
  }, [isAdmin, demoOwner, pathname]);

  if (effectiveAdmin) return <editable-chip data-demo="edit-chip" />;
  if (pathname !== '/') return null;

  return (
    <button
      type="button"
      data-demo="try-demo"
      onClick={() => (active ? continueFromInvite() : start())}
      className="fixed right-4 bottom-4 z-[45] inline-flex min-h-11 items-center justify-center rounded-full border border-amber-400/40 bg-zinc-950/90 px-4 text-sm text-amber-200 shadow-2xl shadow-black/50 backdrop-blur-xl hover:border-amber-300 hover:text-white"
    >
      Try the demo →
    </button>
  );
}
