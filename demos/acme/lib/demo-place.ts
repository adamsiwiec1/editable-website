/** Coach-mark geometry shared by FeatureDemo (3010). Keep ew-walk.js in sync. */

export const HOLE_PAD = 8;
export const GAP = 14;
export const POP_WIDTH = 340;
export const VIEW_INSET = 16;
export const POINTER_SIZE = 44;
export const POINTER_GAP = 10;

export type PadRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type Viewport = { w: number; h: number };
export type PopPos = { top: number; left: number };
export type PointerDir = 'right' | 'left' | 'down' | 'up';
export type PointerPos = { top: number; left: number; dir: PointerDir };

export const POINTER_ROTATE: Record<PointerDir, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: -90,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function padHole(rect: { top: number; left: number; width: number; height: number }): PadRect {
  return {
    top: rect.top - HOLE_PAD,
    left: rect.left - HOLE_PAD,
    right: rect.left + rect.width + HOLE_PAD,
    bottom: rect.top + rect.height + HOLE_PAD,
    width: rect.width + HOLE_PAD * 2,
    height: rect.height + HOLE_PAD * 2,
  };
}

function overlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Sit beside / below / above the spotlight with a real gap. Never prefer covering
 * the hole. Clamp to a 16px viewport inset. Low corner targets flip to the side.
 */
export function placePopover(
  padded: PadRect,
  popWidth: number,
  popH: number,
  viewport: Viewport,
): PopPos {
  const maxLeft = Math.max(VIEW_INSET, viewport.w - popWidth - VIEW_INSET);
  const maxTop = Math.max(VIEW_INSET, viewport.h - popH - VIEW_INSET);
  const midX = padded.left + padded.width / 2;
  const centeredTarget = padded.width > 260 && Math.abs(midX - viewport.w / 2) < 90;
  const centerLeft = clamp(midX - popWidth / 2, VIEW_INSET, maxLeft);

  if (centeredTarget) {
    if (padded.bottom + GAP + popH <= viewport.h - VIEW_INSET) {
      return { left: centerLeft, top: padded.bottom + GAP };
    }
    if (padded.top - GAP - popH >= VIEW_INSET) {
      return { left: centerLeft, top: padded.top - GAP - popH };
    }
  }

  const rightSide = midX > viewport.w * 0.58;
  const bottomSide = padded.bottom > viewport.h * 0.72;
  const spaceRight = viewport.w - padded.right - VIEW_INSET;
  const spaceLeft = padded.left - VIEW_INSET;
  const spaceBelow = viewport.h - padded.bottom - VIEW_INSET;
  const spaceAbove = padded.top - VIEW_INSET;
  const sideRoom = Math.max(spaceLeft, spaceRight);
  const tall = padded.height > viewport.h * 0.34;

  if (bottomSide && rightSide && spaceLeft >= popWidth + GAP) {
    return {
      left: clamp(padded.left - GAP - popWidth, VIEW_INSET, maxLeft),
      top: clamp(padded.bottom - popH, VIEW_INSET, maxTop),
    };
  }
  if (bottomSide && !rightSide && spaceRight >= popWidth + GAP) {
    return {
      left: padded.right + GAP,
      top: clamp(padded.bottom - popH, VIEW_INSET, maxTop),
    };
  }
  if ((tall || bottomSide) && spaceRight >= popWidth + GAP) {
    return { left: padded.right + GAP, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if ((tall || bottomSide) && spaceLeft >= popWidth + GAP) {
    return { left: padded.left - GAP - popWidth, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (tall && sideRoom < popWidth) {
    return { left: maxLeft, top: clamp(VIEW_INSET, VIEW_INSET, maxTop) };
  }

  const left = clamp(rightSide ? padded.right - popWidth : padded.left, VIEW_INSET, maxLeft);
  if (!bottomSide && spaceBelow >= popH + GAP) {
    return { left, top: padded.bottom + GAP };
  }
  if (spaceAbove >= popH + GAP) {
    return { left, top: padded.top - GAP - popH };
  }
  if (spaceRight >= popWidth + GAP) {
    return { left: padded.right + GAP, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (spaceLeft >= popWidth + GAP) {
    return { left: padded.left - GAP - popWidth, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (spaceBelow >= spaceAbove) {
    return { left, top: clamp(padded.bottom + GAP, VIEW_INSET, maxTop) };
  }
  return { left, top: clamp(padded.top - GAP - popH, VIEW_INSET, maxTop) };
}

/** Sit next to the hole, pointing at it, without covering the hole or the card. */
export function placePointer(
  padded: PadRect,
  pop: PopPos,
  popWidth: number,
  popH: number,
  viewport: Viewport,
): PointerPos {
  const size = POINTER_SIZE;
  const gap = POINTER_GAP;
  const midY = padded.top + padded.height / 2 - size / 2;
  const midX = padded.left + padded.width / 2 - size / 2;
  const popBox = {
    left: pop.left - 4,
    top: pop.top - 4,
    right: pop.left + popWidth + 4,
    bottom: pop.top + popH + 4,
  };
  const hole = { left: padded.left, top: padded.top, right: padded.right, bottom: padded.bottom };

  const candidates: PointerPos[] = [
    { left: padded.left - gap - size, top: midY, dir: 'right' },
    { left: padded.right + gap, top: midY, dir: 'left' },
    { left: midX, top: padded.top - gap - size, dir: 'down' },
    { left: midX, top: padded.bottom + gap, dir: 'up' },
  ];

  for (const candidate of candidates) {
    const box = {
      left: candidate.left,
      top: candidate.top,
      right: candidate.left + size,
      bottom: candidate.top + size,
    };
    const inView =
      box.left >= 8 &&
      box.top >= 8 &&
      box.right <= viewport.w - 8 &&
      box.bottom <= viewport.h - 8;
    if (!inView) continue;
    if (overlap(box, hole) || overlap(box, popBox)) continue;
    return candidate;
  }

  return {
    left: clamp(midX, 8, Math.max(8, viewport.w - size - 8)),
    top: Math.max(8, padded.top - gap - size),
    dir: 'down',
  };
}
