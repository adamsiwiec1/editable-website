import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyInventorySlot, DEFAULT_INVENTORY, featuredVehicles, parseInventory } from './inventory.ts';

describe('inventory', () => {
  it('keeps three featured slots from the catalog', () => {
    const state = parseInventory({ featured: ['civic', 'missing', 'f150'], catalog: DEFAULT_INVENTORY.catalog });
    assert.equal(state.featured.length, 3);
    assert.equal(state.featured[0], 'civic');
    assert.equal(featuredVehicles(state).length, 3);
  });

  it('swaps a slot', () => {
    const next = applyInventorySlot(DEFAULT_INVENTORY, 0, 'camry');
    assert.equal(next.featured[0], 'camry');
    assert.equal(next.featured[1], 'highlander');
  });
});
