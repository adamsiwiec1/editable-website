'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { DEFAULT_COPY, type CopyKey } from '@/lib/copy';
import { cn } from '@/lib/utils';
import { useOptionalEditMode } from './edit-mode-provider';

type EditableTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'li';

export function EditableText({
  k,
  as: Tag = 'span',
  className,
  multiline = false,
}: {
  k: CopyKey;
  as?: EditableTag;
  className?: string;
  multiline?: boolean;
}) {
  const cms = useOptionalEditMode();
  const value = cms ? cms.text(k) : DEFAULT_COPY[k];
  const editing = Boolean(cms?.isAdmin && cms.editing);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (draft === null) return;
    const id = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
    return () => cancelAnimationFrame(id);
  }, [draft]);

  if (!editing || !cms) {
    return <Tag className={className}>{value}</Tag>;
  }

  const live = draft ?? value;
  const inline = Tag === 'span';

  const commit = async () => {
    const next = (ref.current?.innerText ?? live).replace(/\u00a0/g, ' ');
    setDraft(null);
    if (next.trim() === value.trim()) return;
    setBusy(true);
    try {
      await cms.save(k, next);
    } catch {
      // Provider keeps the previous string and surfaces saveError.
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setDraft(null);
      return;
    }
    if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void commit();
    }
  };

  return (
    <Tag
      className={cn(
        'group/edit relative',
        inline && 'inline-block max-w-full align-baseline',
        'pr-11',
        draft === null && 'rounded-sm outline outline-1 outline-offset-2 outline-amber-400/40',
        draft !== null && 'z-[2]',
        busy && 'opacity-70',
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <span
        ref={ref}
        role="textbox"
        aria-label={`Edit ${k}`}
        aria-multiline={multiline}
        contentEditable={draft !== null}
        suppressContentEditableWarning
        tabIndex={draft !== null ? 0 : -1}
        className={cn(
          'outline-none',
          multiline && 'whitespace-pre-wrap',
          draft === null && 'cursor-pointer',
          draft !== null && 'rounded-sm bg-amber-400/10 ring-1 ring-amber-400/60',
        )}
        onClick={() => {
          if (draft === null) setDraft(live);
        }}
        onBlur={() => {
          if (draft !== null) void commit();
        }}
        onKeyDown={onKeyDown}
      >
        {live}
      </span>
      {draft === null && (
        <span
          aria-label={`Edit ${k}`}
          tabIndex={0}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDraft(live);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            setDraft(live);
          }}
          className="absolute top-0 right-0 z-[1] inline-flex size-11 items-center justify-center text-amber-300 opacity-100 transition-opacity md:opacity-0 md:group-hover/edit:opacity-100 md:focus-visible:opacity-100"
        >
          <span className="grid size-7 place-items-center rounded-full border border-amber-400/40 bg-zinc-950/90 shadow-md shadow-black/40 backdrop-blur-md">
            <Pencil className="size-3" aria-hidden />
          </span>
        </span>
      )}
    </Tag>
  );
}
