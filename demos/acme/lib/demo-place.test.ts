import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAP, padHole, placePointer, placePopover, POINTER_SIZE } from './demo-place.ts';

function box(pos: { left: number; top: number }, w: number, h: number) {
  return { left: pos.left, top: pos.top, right: pos.left + w, bottom: pos.top + h };
}

function overlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

describe('placePopover', () => {
  it('puts the card left of a bottom-right chip, not on top of it', () => {
    const viewport = { w: 1280, h: 800 };
    const padded = padHole({ top: 740, left: 1124, width: 140, height: 44 });
    const pop = placePopover(padded, 340, 220, viewport);
    const card = box(pop, 340, 220);
    assert.equal(overlap(card, padded), false);
    assert.ok(card.right <= padded.left + 0.5, 'card sits to the left of the hole');
    assert.ok(pop.left >= 16);
    assert.ok(pop.top >= 16);
    assert.ok(pop.left + 340 <= viewport.w - 16);
    assert.ok(pop.top + 220 <= viewport.h - 16);
  });

  it('puts the card below a wide centered heading', () => {
    const viewport = { w: 1280, h: 800 };
    const padded = padHole({ top: 72, left: 272, width: 736, height: 72 });
    const pop = placePopover(padded, 340, 220, viewport);
    const card = box(pop, 340, 220);
    assert.equal(overlap(card, padded), false);
    assert.ok(pop.top >= padded.bottom + GAP - 0.5);
    assert.ok(pop.left >= 16);
  });

  it('flips above when the target is too low for a below placement', () => {
    const viewport = { w: 900, h: 700 };
    const padded = padHole({ top: 520, left: 40, width: 280, height: 48 });
    const pop = placePopover(padded, 340, 240, viewport);
    const card = box(pop, 340, 240);
    assert.equal(overlap(card, padded), false);
    assert.ok(pop.top + 240 <= padded.top + 0.5 || card.right <= padded.left || card.left >= padded.right);
    assert.ok(pop.top >= 16);
    assert.ok(pop.top + 240 <= viewport.h - 16);
  });

  it('clamps to a 16px inset', () => {
    const viewport = { w: 400, h: 640 };
    const padded = padHole({ top: 12, left: 8, width: 120, height: 40 });
    const pop = placePopover(padded, 340, 200, viewport);
    assert.ok(pop.left >= 16);
    assert.ok(pop.top >= 16);
  });
});

describe('placePointer', () => {
  it('points at a bottom-right chip without covering the chip or the card', () => {
    const viewport = { w: 1280, h: 800 };
    const padded = padHole({ top: 740, left: 1124, width: 140, height: 44 });
    const pop = placePopover(padded, 340, 220, viewport);
    const pointer = placePointer(padded, pop, 340, 220, viewport);
    const arrow = box(pointer, POINTER_SIZE, POINTER_SIZE);
    assert.equal(overlap(arrow, padded), false);
    assert.equal(overlap(arrow, box(pop, 340, 220)), false);
    assert.ok(['right', 'left', 'down', 'up'].includes(pointer.dir));
  });
});
