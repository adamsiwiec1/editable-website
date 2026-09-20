'use client';

import { useEffect, useState } from 'react';

export const DEMO_OWNER_KEY = 'editable-demo:owner';
export const DEMO_OWNER_EVENT = 'editable-website:demo-owner';

export function isValidDemoEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isDemoOwner(): boolean {
  try {
    return sessionStorage.getItem(DEMO_OWNER_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDemoOwner(next: boolean): void {
  try {
    if (next) sessionStorage.setItem(DEMO_OWNER_KEY, '1');
    else sessionStorage.removeItem(DEMO_OWNER_KEY);
  } catch {
    // private mode
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_OWNER_EVENT, { detail: { owner: next } }));
  }
}

export function useDemoOwner(): boolean {
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    const sync = () => setOwner(isDemoOwner());
    sync();
    window.addEventListener(DEMO_OWNER_EVENT, sync);
    return () => window.removeEventListener(DEMO_OWNER_EVENT, sync);
  }, []);

  return owner;
}
