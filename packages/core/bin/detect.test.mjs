import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { detectFramework } from './lib/detect.mjs';
import { scanProject } from './lib/scan.mjs';

test('detects Next from next.config', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ew-cli-'));
  writeFileSync(join(dir, 'next.config.ts'), 'export default {};\n');
  writeFileSync(join(dir, 'package.json'), '{"name":"x"}\n');
  assert.equal(detectFramework(dir), 'next');
});

test('scan marks static copy and skips interpolations and images', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ew-cli-'));
  writeFileSync(
    join(dir, 'index.html'),
    `<h1>The lot is open.</h1>
<p>{name}</p>
<img src="/car.jpg" alt="car" />
<p data-copy="hero.lede">Already marked</p>
`,
  );
  const { editable, skipped } = scanProject(dir, 'site');
  assert.equal(editable.length, 1);
  assert.equal(editable[0].key, 'site.page.title');
  assert.ok(skipped.some((item) => item.reason === 'interpolation'));
  assert.ok(skipped.some((item) => item.reason === 'image'));
});
