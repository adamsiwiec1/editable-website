'use client';

import { Pencil } from 'lucide-react';
import { useOptionalEditMode } from './edit-mode-provider';

export function EditModeChip() {
  const cms = useOptionalEditMode();
  if (!cms?.isAdmin) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[45]">
      <div className="relative">
        <button
          type="button"
          data-demo="edit-chip"
          onClick={() => cms.setEditing(!cms.editing)}
          aria-pressed={cms.editing}
          aria-label={cms.editing ? 'Exit edit mode' : 'Edit the site'}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3.5 text-sm shadow-2xl shadow-black/50 backdrop-blur-xl transition-colors ${
            cms.editing
              ? 'border-amber-400 bg-amber-400 text-zinc-950 hover:bg-amber-300'
              : 'border-amber-400/40 bg-zinc-950/90 text-amber-200 hover:border-amber-300 hover:text-white'
          }`}
        >
          <Pencil className="size-3.5" aria-hidden />
          <span className="pr-0.5">{cms.editing ? 'Done' : 'Edit the site'}</span>
        </button>
        {cms.saveError && (
          <p
            role="status"
            className="absolute right-0 bottom-full mb-2 max-w-[14rem] rounded-md border border-white/10 bg-zinc-950/95 px-3 py-2 text-xs text-rose-300 shadow-xl"
          >
            {cms.saveError}
          </p>
        )}
      </div>
    </div>
  );
}
