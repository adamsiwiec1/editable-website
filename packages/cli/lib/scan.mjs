import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.svelte-kit',
  '.vercel',
  '.output',
]);
const SCAN_EXTS = new Set(['.html', '.htm', '.tsx', '.jsx', '.svelte', '.vue']);
const SCAN_ROOTS = ['app', 'src', 'pages', 'public'];
const TAG_RE = /<(h[1-6]|p|button|a|label|span)\b([^>]*?)>([\s\S]*?)<\/\1>/gi;
const IMAGE_RE = /<(img|Image)\b[^>]*>/g;
const WIDGET_RE = /<(iframe|script|style|svg|video|canvas)\b[^>]*>/gi;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  let listing = [];
  try {
    listing = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of listing) {
    if (name.startsWith('.') && name !== '.') continue;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (SCAN_EXTS.has(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function collectFiles(root) {
  const files = [];
  const hasSrc = SCAN_ROOTS.some((name) => existsSync(join(root, name)));
  if (hasSrc) {
    for (const name of SCAN_ROOTS) walk(join(root, name), files);
  } else {
    walk(root, files);
  }
  const index = join(root, 'index.html');
  if (existsSync(index) && !files.includes(index)) files.push(index);
  return [...new Set(files)].slice(0, 200);
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function slug(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 28) || 'copy'
  );
}

function sectionFromFile(file) {
  const base = basename(file).replace(/\.[^.]+$/, '');
  const cleaned = base.replace(/^(page|index|app|layout|view)$/i, '') || 'page';
  return slug(cleaned);
}

function roleFor(tag) {
  if (tag === 'h1' || tag === 'h2') return 'title';
  if (tag.startsWith('h')) return 'heading';
  if (tag === 'p') return 'body';
  if (tag === 'button') return 'cta';
  if (tag === 'a') return 'link';
  if (tag === 'label') return 'label';
  return 'text';
}

function uniqueKey(used, proposed) {
  if (!used.has(proposed)) {
    used.add(proposed);
    return proposed;
  }
  let n = 2;
  while (used.has(`${proposed}.${n}`)) n += 1;
  const next = `${proposed}.${n}`;
  used.add(next);
  return next;
}

function skipReason(attrs, inner) {
  if (/\bdata-copy\s*=/.test(attrs)) return 'already marked';
  if (/\bcopy-key\s*=/.test(attrs)) return 'already marked';
  const raw = inner.trim();
  if (!raw) return 'empty';
  if (/[{]|{{|{#|@if|v-bind|v-text|v-html/.test(inner)) return 'interpolation';
  if (/<[A-Z][A-Za-z0-9.]*/.test(inner) && !stripTags(inner)) return 'component children';
  const text = stripTags(inner);
  if (!text) return 'no static text';
  if (text.length < 2) return 'too short';
  return null;
}

export function scanProject(root, prefix) {
  const used = new Set();
  const editable = [];
  const skipped = [];

  for (const file of collectFiles(root)) {
    const rel = relative(root, file);
    let source = '';
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    IMAGE_RE.lastIndex = 0;
    for (const match of source.matchAll(IMAGE_RE)) {
      skipped.push({
        file: rel,
        line: lineNumber(source, match.index ?? 0),
        reason: 'image',
        excerpt: match[0].slice(0, 80),
      });
    }

    WIDGET_RE.lastIndex = 0;
    for (const match of source.matchAll(WIDGET_RE)) {
      skipped.push({
        file: rel,
        line: lineNumber(source, match.index ?? 0),
        reason: `${match[1]} widget`,
        excerpt: match[0].slice(0, 80),
      });
    }

    TAG_RE.lastIndex = 0;
    let match;
    while ((match = TAG_RE.exec(source))) {
      const [full, tag, attrs, inner] = match;
      const index = match.index ?? 0;
      const reason = skipReason(attrs, inner);
      const text = stripTags(inner);
      if (reason) {
        if (reason !== 'already marked') {
          skipped.push({
            file: rel,
            line: lineNumber(source, index),
            reason,
            excerpt: (text || full).slice(0, 80),
          });
        }
        continue;
      }
      const section = sectionFromFile(file);
      const key = uniqueKey(used, `${prefix}.${section}.${roleFor(tag)}`);
      const openEnd = index + `<${tag}${attrs}>`.length - 1;
      editable.push({
        file: rel,
        line: lineNumber(source, index),
        tag,
        key,
        text: text.slice(0, 80),
        index,
        openEnd,
        multiline: text.length > 80 || inner.includes('\n'),
      });
    }
  }

  return { editable, skipped };
}
