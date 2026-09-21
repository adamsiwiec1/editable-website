'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { POINTER_ROTATE, POP_WIDTH, padHole, placePointer, placePopover } from '@/lib/demo-place';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveAnchor(el: HTMLElement | null): HTMLElement | null {
  if (!el?.isConnected) return null;
  const inner = el.shadowRoot?.querySelector<HTMLElement>('button, [part="button"]');
  const target = inner ?? el;
  return target.isConnected ? target : null;
}

function queryAnchor(selector?: string): HTMLElement | null {
  if (!selector || typeof document === 'undefined') return null;
  return resolveAnchor(document.querySelector<HTMLElement>(selector));
}

export interface FeatureDemoProps {
  open: boolean;
  /** Element to spotlight. When null, the card is centred as a plain modal. */
  anchorEl: HTMLElement | null;
  /** Selector used when `anchorEl` is stale or not yet set — avoids a center hold. */
  anchorSelector?: string;
  title: string;
  body: string;
  afterBody?: ReactNode;
  stepLabel?: string;
  primaryLabel: string;
  onPrimary: () => void;
  /** Real navigation — use this when the primary action is “go to a page”. */
  primaryHref?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
  onClose?: () => void;
  /** Changes when the tour step changes — longer move, content fade. */
  placementKey?: string;
  /** Step wants a centered card, not an anchor. */
  preferCenter?: boolean;
  /** New anchor is not ready yet — hold the card, dim the page, do not snap to center. */
  waitingForAnchor?: boolean;
  /** Little text or control under the primary action (e.g. lazy-fill). */
  belowPrimary?: ReactNode;
  /** Bounce arrow pointing at the spotlight (edit-chip). */
  showPointer?: boolean;
}

const POP_POS_KEY = 'editable-demo:tour:pop';
const MOVE_EASE = 'power3.inOut';
const STEP_DURATION = 0.7;
const TRACK_DURATION = 0.22;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readSavedPop(): { x: number; y: number } | null {
  try {
    const raw = sessionStorage.getItem(POP_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x?: number; y?: number };
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

function writeSavedPop(x: number, y: number) {
  try {
    sessionStorage.setItem(POP_POS_KEY, JSON.stringify({ x, y }));
  } catch {
    // private mode
  }
}

export function clearTourPopPosition() {
  try {
    sessionStorage.removeItem(POP_POS_KEY);
  } catch {
    // private mode
  }
}

function applySpot(
  refs: {
    top: HTMLDivElement | null;
    bottom: HTMLDivElement | null;
    left: HTMLDivElement | null;
    right: HTMLDivElement | null;
    ring: HTMLDivElement | null;
  },
  spot: { top: number; left: number; width: number; height: number; ring: number },
) {
  const { top, left, width, height, ring } = spot;
  const right = left + width;
  const bottom = top + height;
  if (refs.top) refs.top.style.height = `${Math.max(0, top)}px`;
  if (refs.bottom) {
    refs.bottom.style.top = `${bottom}px`;
    refs.bottom.style.bottom = '0px';
  }
  if (refs.left) {
    refs.left.style.top = `${top}px`;
    refs.left.style.width = `${Math.max(0, left)}px`;
    refs.left.style.height = `${Math.max(0, height)}px`;
  }
  if (refs.right) {
    refs.right.style.top = `${top}px`;
    refs.right.style.left = `${right}px`;
    refs.right.style.right = '0px';
    refs.right.style.height = `${Math.max(0, height)}px`;
  }
  if (refs.ring) {
    refs.ring.style.top = `${top}px`;
    refs.ring.style.left = `${left}px`;
    refs.ring.style.width = `${Math.max(0, width)}px`;
    refs.ring.style.height = `${Math.max(0, height)}px`;
    refs.ring.style.opacity = String(ring);
  }
}

/**
 * Spotlight coach mark: dims the page, cuts a hole around the anchor
 * (which stays interactive), and floats an explainer card beside it.
 * Position and hole move with GSAP so steps never snap.
 */
export function FeatureDemo(props: FeatureDemoProps) {
  const {
    open,
    anchorEl,
    anchorSelector,
    title,
    body,
    afterBody,
    stepLabel,
    primaryLabel,
    onPrimary,
    primaryHref,
    secondaryLabel,
    onSecondary,
    tertiaryLabel,
    onTertiary,
    onClose,
    placementKey = title,
    preferCenter = false,
    waitingForAnchor = false,
    belowPrimary,
    showPointer = false,
  } = props;

  const [mounted, setMounted] = useState(false);
  const [hole, setHole] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [popH, setPopH] = useState(220);
  const [cardReadyUi, setCardReadyUi] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const topMaskRef = useRef<HTMLDivElement>(null);
  const bottomMaskRef = useRef<HTMLDivElement>(null);
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const lastPlacementKey = useRef(placementKey);
  const spotRef = useRef({ top: 0, left: 0, width: 0, height: 0, ring: 0 });
  const cardReady = useRef(false);
  const lastDestKey = useRef('');

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      const live = resolveAnchor(anchorEl) ?? queryAnchor(anchorSelector);
      if (live) {
        const r = live.getBoundingClientRect();
        setHole({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setHole(null);
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    let ro: ResizeObserver | undefined;
    const live = resolveAnchor(anchorEl) ?? queryAnchor(anchorSelector);
    if (live) {
      ro = new ResizeObserver(update);
      ro.observe(live);
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro?.disconnect();
    };
  }, [open, anchorEl, anchorSelector, waitingForAnchor]);

  useEffect(() => {
    if (popRef.current) setPopH(popRef.current.offsetHeight);
  }, [open, title, body, afterBody, belowPrimary, hole, viewport, stepLabel]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => primaryRef.current?.focus({ preventScroll: true }));
  }, [open, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') (onClose ?? onTertiary)?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onTertiary]);

  const resolvedAnchor = resolveAnchor(anchorEl) ?? queryAnchor(anchorSelector);
  const liveHole = (() => {
    if (!resolvedAnchor) return hole;
    const r = resolvedAnchor.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) return hole;
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  })();

  const padded = liveHole ? padHole(liveHole) : null;

  const popWidth = Math.min(POP_WIDTH, Math.max(240, viewport.w - 32));
  const placed = preferCenter && viewport.w
    ? {
        left: Math.max(16, (viewport.w - popWidth) / 2),
        top: Math.min(Math.max(16, (viewport.h - popH) / 2), Math.max(16, viewport.h - popH - 16)),
      }
    : padded
      ? placePopover(padded, popWidth, popH, viewport)
      : null;

  const destKey = placed ? `${Math.round(placed.left)},${Math.round(placed.top)}` : '';
  const holeKey =
    padded && !preferCenter
      ? `${Math.round(padded.top)},${Math.round(padded.left)},${Math.round(padded.width)},${Math.round(padded.height)}`
      : 'dim';

  useEffect(() => {
    if (!open) {
      cardReady.current = false;
      lastDestKey.current = '';
      setCardReadyUi(false);
    }
  }, [open]);

  useLayoutEffect(() => {
    const el = popRef.current;
    if (!open || !el) return;

    if (!cardReady.current) {
      const saved = preferCenter ? null : readSavedPop();
      const start = saved ?? (placed ? { x: placed.left, y: placed.top } : null);
      if (!start) return;
      cardReady.current = true;
      lastDestKey.current = placed ? destKey : '';
      gsap.set(el, { x: start.x, y: start.y, force3D: true, autoAlpha: 1 });
      setCardReadyUi(true);
      writeSavedPop(start.x, start.y);
      if (placed && (Math.round(start.x) !== Math.round(placed.left) || Math.round(start.y) !== Math.round(placed.top))) {
        gsap.to(el, {
          x: placed.left,
          y: placed.top,
          duration: prefersReducedMotion() ? 0 : STEP_DURATION,
          ease: MOVE_EASE,
          overwrite: 'auto',
          onComplete: () => writeSavedPop(placed.left, placed.top),
        });
        lastDestKey.current = destKey;
      }
      return;
    }

    if (!placed || destKey === lastDestKey.current) return;
    lastDestKey.current = destKey;
    gsap.to(el, {
      x: placed.left,
      y: placed.top,
      duration: prefersReducedMotion() ? 0 : STEP_DURATION,
      overwrite: 'auto',
      ease: MOVE_EASE,
      onComplete: () => writeSavedPop(placed.left, placed.top),
    });
  }, [open, destKey, preferCenter]);

  useLayoutEffect(() => {
    if (!open || viewport.w === 0) return;
    const reduce = prefersReducedMotion();
    const isNewStep = lastPlacementKey.current !== placementKey;
    lastPlacementKey.current = placementKey;
    const duration = reduce ? 0 : isNewStep ? STEP_DURATION : TRACK_DURATION;
    const maskRefs = {
      top: topMaskRef.current,
      bottom: bottomMaskRef.current,
      left: leftMaskRef.current,
      right: rightMaskRef.current,
      ring: ringRef.current,
    };
    const dimAll = { top: viewport.h, left: 0, width: 0, height: 0, ring: 0 };
    const targetSpot =
      padded && !preferCenter
        ? { top: padded.top, left: padded.left, width: padded.width, height: padded.height, ring: 1 }
        : dimAll;
    const spot = spotRef.current;
    gsap.to(spot, {
      top: targetSpot.top,
      left: targetSpot.left,
      width: targetSpot.width,
      height: targetSpot.height,
      ring: targetSpot.ring,
      duration,
      ease: MOVE_EASE,
      overwrite: 'auto',
      onUpdate: () => {
        if (spot.ring < 0.02) {
          applySpot(maskRefs, dimAll);
          return;
        }
        applySpot(maskRefs, spot);
      },
    });
  }, [open, placementKey, holeKey, preferCenter, viewport.h]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || !open) return undefined;
    const reduce = prefersReducedMotion();
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: reduce ? 0 : 8 },
      { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.32, ease: 'power2.out' },
    );
    return () => {
      tween.kill();
      gsap.set(el, { autoAlpha: 1, y: 0 });
    };
  }, [open, placementKey, title, body]);

  if (!open || !mounted || viewport.w === 0) return null;

  const pointer =
    showPointer && padded && placed && !preferCenter
      ? placePointer(padded, placed, popWidth, popH, viewport)
      : null;

  const mask =
    preferCenter || padded
      ? 'pointer-events-auto bg-zinc-950/55'
      : 'pointer-events-none bg-zinc-950/40';

  return createPortal(
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[80]">
      <div ref={topMaskRef} className={cn('absolute top-0 left-0 w-full', mask)} style={{ height: viewport.h }} />
      <div ref={bottomMaskRef} className={cn('absolute left-0 w-full', mask)} style={{ top: viewport.h, bottom: 0 }} />
      <div ref={leftMaskRef} className={cn('absolute', mask)} style={{ top: 0, left: 0, width: 0, height: 0 }} />
      <div ref={rightMaskRef} className={cn('absolute', mask)} style={{ top: 0, left: viewport.w, right: 0, height: 0 }} />
      <div
        ref={ringRef}
        className="pointer-events-none absolute rounded-xl ring-2 ring-amber-400/80"
        style={{ top: 0, left: 0, width: 0, height: 0, opacity: 0 }}
      />
      {pointer ? (
        <div
          className="demo-pointer"
          data-demo="tour-pointer"
          data-dir={pointer.dir}
          aria-hidden="true"
          style={{
            top: pointer.top,
            left: pointer.left,
            transform: `rotate(${POINTER_ROTATE[pointer.dir]}deg)`,
          }}
        >
          <span className="demo-pointer-nub">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M3 11h12.17l-4.88-4.88L12 4.71 19.29 12 12 19.29l-1.71-1.71L15.17 13H3z"
              />
            </svg>
          </span>
        </div>
      ) : null}

      <div
        ref={popRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="feature-demo-title"
        aria-describedby="feature-demo-body"
        data-testid="feature-demo"
        className="demo-pop pointer-events-auto fixed top-0 left-0 will-change-transform rounded-2xl border border-white/10 bg-zinc-950/95 p-5 text-zinc-100 shadow-2xl shadow-black/60 backdrop-blur-xl"
        style={{
          width: popWidth,
          visibility: cardReadyUi ? 'visible' : 'hidden',
        }}
      >
        <div ref={contentRef}>
          {stepLabel && (
            <p className="mb-1 text-[0.6rem] tracking-[0.24em] text-amber-300/80 uppercase">{stepLabel}</p>
          )}
          <h2 id="feature-demo-title" className="font-display text-lg text-balance text-zinc-50">
            {title}
          </h2>
          <p id="feature-demo-body" className="mt-2 text-sm leading-relaxed text-zinc-400">
            {body}
          </p>
          {afterBody}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-end gap-2">
          {tertiaryLabel && onTertiary && (
            <button
              type="button"
              onClick={onTertiary}
              className="min-h-11 rounded-full px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
            >
              {tertiaryLabel}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="min-h-11 rounded-full border border-white/12 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-amber-300/50"
            >
              {secondaryLabel}
            </button>
          )}
          <div className="flex flex-col items-end">
            {primaryHref ? (
              <a
                ref={primaryRef}
                href={primaryHref}
                onClick={onPrimary}
                data-testid="feature-demo-primary"
                className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-950 no-underline transition-colors hover:bg-amber-300"
              >
                {primaryLabel}
              </a>
            ) : (
              <button
                ref={primaryRef}
                type="button"
                onClick={onPrimary}
                data-testid="feature-demo-primary"
                className="min-h-11 min-w-[5.5rem] rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-300"
              >
                {primaryLabel}
              </button>
            )}
            {belowPrimary}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
