#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { detectFramework, FRAMEWORKS, findEntry } from './lib/detect.mjs';
import { ask, choose, confirm, createPrompt } from './lib/prompt.mjs';
import { scanProject } from './lib/scan.mjs';
import { applyBootstrap } from './lib/write.mjs';

function parseArgs(argv) {
  const args = { yes: false, dryRun: false, dir: undefined };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--yes' || item === '-y') args.yes = true;
    else if (item === '--dry-run') args.dryRun = true;
    else if (item === '--dir') args.dir = argv[++i];
    else if (item.startsWith('--dir=')) args.dir = item.slice(6);
    else if (!item.startsWith('-')) rest.push(item);
  }
  if (!args.dir && rest[0]) args.dir = rest[0];
  return args;
}

function slug(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24) || 'site'
  );
}

function printList(title, rows, color) {
  const reset = '\x1b[0m';
  console.log(`\n${color}${title}${reset}`);
  if (!rows.length) {
    console.log('  (none)');
    return;
  }
  for (const row of rows) {
    const loc = `${row.file}:${row.line}`;
    if (row.key) console.log(`  ${loc.padEnd(32)} ${row.key.padEnd(28)} ${row.text}`);
    else console.log(`  ${loc.padEnd(32)} ${(row.reason || '').padEnd(20)} ${row.excerpt}`);
  }
}

async function pickMarks(rl, marks, yes) {
  if (yes || !marks.length) return marks;
  const mode = await choose(rl, 'Apply which editable fields?', ['all', 'pick', 'none'], 'all');
  if (mode === 'none') return [];
  if (mode === 'all') return marks;
  const chosen = [];
  for (const mark of marks) {
    const ok = await confirm(rl, `Mark ${mark.key} — “${mark.text}”?`, true);
    if (ok) chosen.push(mark);
  }
  return chosen;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rl = args.yes ? null : createPrompt();

  try {
    const cwd = process.cwd();
    const dirInput = args.dir || (args.yes ? cwd : await ask(rl, 'Project directory', cwd));
    const root = resolve(cwd, dirInput || cwd);

    if (!existsSync(root) || !statSync(root).isDirectory()) {
      console.error(`Directory not found: ${root}`);
      process.exitCode = 1;
      return;
    }

    if (!args.yes) {
      const ok = await confirm(rl, `Use ${root}?`, true);
      if (!ok) {
        console.log('Aborted.');
        return;
      }
    }

    let framework = detectFramework(root);
    if (framework) {
      console.log(`Detected framework: ${framework}`);
    } else {
      console.log('Could not detect a framework.');
      framework = args.yes
        ? 'html'
        : await choose(rl, 'Which host is this?', FRAMEWORKS, 'html');
    }

    const prefixDefault = slug(basename(root));
    const prefix = args.yes ? prefixDefault : await ask(rl, 'Copy key prefix', prefixDefault);
    const persist = args.yes
      ? 'api'
      : await choose(
          rl,
          'Where should saves go? (you own auth either way)',
          ['api', 'local'],
          'api',
        );
    const expressComments = args.yes
      ? true
      : await confirm(rl, 'Drop in Express example / triggerCi comments?', true);

    const { editable, skipped } = scanProject(root, prefix);
    printList('Editable (candidates)', editable, '\x1b[32m');
    printList('Not editable (left alone)', skipped, '\x1b[33m');

    const marks = await pickMarks(rl, editable, args.yes);
    if (args.dryRun) {
      console.log(`\nDry run. Would mark ${marks.length} field(s).`);
      return;
    }

    if (!marks.length && args.yes) {
      console.log('\nNo new static copy to mark. Writing a host snippet anyway.');
    } else if (!marks.length) {
      const stillHost = await confirm(rl, 'Nothing to mark. Still write a mount snippet?', true);
      if (!stillHost) {
        console.log('Done. Nothing written.');
        return;
      }
    }

    const result = applyBootstrap({
      root,
      framework,
      marks,
      persist,
      expressComments,
    });

    console.log('\nWrote:');
    for (const file of [...new Set(result.written)]) console.log(`  ${file}`);
    console.log(`\nHost snippet: ${result.host}`);
    if (result.entry) console.log(`Entry touched: ${result.entry}`);
    else {
      const entry = findEntry(root, framework);
      console.log(
        entry
          ? `Add <editable-chip> / the host component in ${entry}.`
          : 'Add the host snippet to your layout or entry file.',
      );
    }
    console.log(`
Next:
  1. npm i editable-website
  2. Pass isAdmin from your own login
  3. Gate PUT /api/copy before production
  4. Call triggerCi() at the bottom of the save handler if you want GitHub Actions, GCP Cloud Build, or AWS CodePipeline to rebuild
`);
  } finally {
    rl?.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
