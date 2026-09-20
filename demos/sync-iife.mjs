import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const from = resolve(root, 'packages/core/dist/editable-website.js');
const to = resolve(root, 'demos/vanilla/editable-website.js');
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
