'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { resolveCopyKey, type CopyKey, type PageContent, type PageCopyOverrides } from '@/lib/copy';

type EditModeContextValue = {
  isAdmin: boolean;
  editing: boolean;
  setEditing: (next: boolean) => void;
  text: (key: CopyKey) => string;
  save: (key: CopyKey, value: string) => Promise<void>;
  saveError: string | null;
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({
  isAdmin,
  initial,
  children,
}: {
  isAdmin: boolean;
  initial: PageContent;
  children: ReactNode;
}) {
  const [editing, setEditingState] = useState(false);
  const [overrides, setOverrides] = useState<PageCopyOverrides>(initial.copy);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setEditing = useCallback((next: boolean) => {
    setEditingState(next);
    if (!next) setSaveError(null);
  }, []);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setEditing(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, setEditing]);

  const text = useCallback((key: CopyKey) => resolveCopyKey(overrides, key), [overrides]);

  const save = useCallback(
    async (key: CopyKey, value: string) => {
      const prev = overrides;
      const optimistic: PageCopyOverrides = { ...overrides };
      const trimmed = value.trim();
      if (trimmed) optimistic[key] = trimmed;
      else delete optimistic[key];
      setOverrides(optimistic);
      setSaveError(null);
      try {
        const res = await fetch('/api/copy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
        const body = (await res.json().catch(() => ({}))) as PageContent & { error?: string };
        if (!res.ok) throw new Error(body.error ?? 'Could not save');
        setOverrides(body.copy ?? optimistic);
      } catch (err) {
        setOverrides(prev);
        setSaveError(err instanceof Error ? err.message : 'Could not save');
        throw err;
      }
    },
    [overrides],
  );

  const value = useMemo<EditModeContextValue>(
    () => ({ isAdmin, editing, setEditing, text, save, saveError }),
    [isAdmin, editing, setEditing, text, save, saveError],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error('useEditMode must be used within EditModeProvider');
  return ctx;
}

export function useOptionalEditMode(): EditModeContextValue | null {
  return useContext(EditModeContext);
}
