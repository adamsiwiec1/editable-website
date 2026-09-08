import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  featureDemoStorageId,
  isFeatureDemoForcedOff,
  isFeatureDemoForcedOn,
  isLocalHost,
  shouldShowFeatureDemo,
} from './feature-demo-storage.ts';

describe('featureDemoStorage', () => {
  it('treats localhost and 127.0.0.1 as local', () => {
    assert.equal(isLocalHost('localhost'), true);
    assert.equal(isLocalHost('127.0.0.1'), true);
    assert.equal(isLocalHost('example.com'), false);
  });

  it('hides when ?featureDemo=0', () => {
    assert.equal(isFeatureDemoForcedOff('?featureDemo=0'), true);
    assert.equal(isFeatureDemoForcedOff('?tab=1'), false);
  });

  it('respects the feature flag', () => {
    assert.equal(shouldShowFeatureDemo('palette', { enabled: false }), false);
    assert.equal(shouldShowFeatureDemo('palette', { enabled: true, alwaysShow: true }), true);
  });

  it('session dismiss and ?featureDemo=0 beat alwaysShow', () => {
    const memory: Record<string, string> = {};
    const session = {
      getItem: (key: string) => memory[key] ?? null,
      setItem: (key: string, value: string) => {
        memory[key] = value;
      },
      removeItem: (key: string) => {
        delete memory[key];
      },
    };
    assert.equal(
      shouldShowFeatureDemo('site-tour', { enabled: true, alwaysShow: true }, '?featureDemo=0', session),
      false,
    );
    assert.equal(shouldShowFeatureDemo('site-tour', { enabled: true, alwaysShow: true }, '?tab=1', session), false);
  });

  it('?featureDemo=1 forces the tour on', () => {
    assert.equal(isFeatureDemoForcedOn('?featureDemo=1'), true);
    assert.equal(isFeatureDemoForcedOn('?featureDemo=0'), false);
    assert.equal(shouldShowFeatureDemo('site-tour', { enabled: true }, '?featureDemo=1'), true);
  });

  it('keys storage per user', () => {
    assert.equal(featureDemoStorageId('site-tour', 'uid-1'), 'site-tour:uid-1');
    assert.equal(featureDemoStorageId('site-tour'), 'site-tour');
  });
});
