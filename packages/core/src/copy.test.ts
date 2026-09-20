import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyCopyPatch, copyPutBody, mergeCopy, parseCopyPayload } from './copy.ts';

describe('copy merge', () => {
  it('uses the override when present', () => {
    assert.equal(mergeCopy({ 'hero.title': 'Sold.' }, 'hero.title', 'The lot is open.'), 'Sold.');
  });

  it('falls back to the original markup text', () => {
    assert.equal(mergeCopy({}, 'hero.title', 'The lot is open.'), 'The lot is open.');
  });

  it('ignores blank overrides', () => {
    assert.equal(mergeCopy({ 'hero.title': '   ' }, 'hero.title', 'The lot is open.'), 'The lot is open.');
  });
});

describe('copy patch', () => {
  it('sets a trimmed value', () => {
    assert.deepEqual(applyCopyPatch({}, 'hero.title', '  Sold.  '), { 'hero.title': 'Sold.' });
  });

  it('deletes a key when the value is empty', () => {
    assert.deepEqual(applyCopyPatch({ 'hero.title': 'Sold.' }, 'hero.title', '  '), {});
  });

  it('shapes a PUT body', () => {
    assert.deepEqual(copyPutBody(' hero.title ', 'Sold.'), { key: 'hero.title', value: 'Sold.' });
  });
});

describe('parseCopyPayload', () => {
  it('reads { copy } maps and ignores blanks', () => {
    assert.deepEqual(parseCopyPayload({ copy: { a: 'One', b: '  ' } }), { a: 'One' });
  });
});
