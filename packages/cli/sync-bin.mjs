import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, '..', 'core', 'bin');

mkdirSync(dest, { recursive: true });
cpSync(join(here, 'bin.mjs'), join(dest, 'cli.mjs'));
cpSync(join(here, 'lib'), join(dest, 'lib'), { recursive: true });
console.log('copied CLI into packages/core/bin');
