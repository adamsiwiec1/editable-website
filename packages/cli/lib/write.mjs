import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { findEntry } from './detect.mjs';

function patchFile(root, rel, marks) {
  const full = join(root, rel);
  let source = readFileSync(full, 'utf8');
  const ordered = [...marks].sort((a, b) => b.openEnd - a.openEnd);
  for (const mark of ordered) {
    const before = source.slice(0, mark.openEnd);
    const after = source.slice(mark.openEnd);
    const extra = mark.multiline ? ' data-copy-multiline' : '';
    source = `${before} data-copy="${mark.key}"${extra}${after}`;
  }
  writeFileSync(full, source);
}

function hostSnippet(framework, persist) {
  const copyLine =
    persist === 'local'
      ? `fetchCopy: async () => ({ copy: JSON.parse(localStorage.getItem('editable-website:copy') || '{}') }),
    saveCopy: async (key, value) => {
      const copy = JSON.parse(localStorage.getItem('editable-website:copy') || '{}');
      if (value.trim()) copy[key] = value.trim();
      else delete copy[key];
      localStorage.setItem('editable-website:copy', JSON.stringify(copy));
      return { copy };
    },`
      : `endpoints: { copy: '/api/copy' },`;

  if (framework === 'html') {
    return `<editable-chip></editable-chip>
<script type="module">
  import { mount } from 'editable-website';
  // You own auth. Pass isAdmin from your session.
  await mount({
    isAdmin: true,
    ${copyLine}
  });
</script>
`;
  }

  if (framework === 'svelte') {
    return `import { mount, unmount } from 'editable-website';

$effect(() => {
  void mount({
    isAdmin, // from your session, not the package
    ${copyLine}
  });
  return () => unmount();
});
`;
  }

  const client = framework === 'next' ? `'use client';\n` : '';
  return `${client}import { useEffect } from 'react';
import { mount, unmount } from 'editable-website';

export function EditableHost({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    void mount({
      isAdmin, // from your session, not the package
      ${copyLine}
    });
    return () => unmount();
  }, [isAdmin]);

  return isAdmin ? <editable-chip></editable-chip> : null;
}
`;
}

function hostPath(framework) {
  if (framework === 'html') return 'editable-website-host.html';
  if (framework === 'svelte') return 'src/editable-website-host.svelte.txt';
  if (framework === 'next') return 'components/editable-website-host.tsx';
  return 'src/editable-website-host.tsx';
}

const EXPRESS_COMMENT = `
// Optional copy API: clone examples/express from editable-website and run it locally.
// Gate PUT with your login. After a successful save, call triggerCi() if you want
// GitHub Actions, GCP Cloud Build, or AWS CodePipeline to rebuild a static host.
`;

function ensureChip(root, framework) {
  const entry = findEntry(root, framework);
  if (!entry) return null;
  const full = join(root, entry);
  let source = readFileSync(full, 'utf8');
  if (source.includes('editable-chip') || source.includes('EditableHost')) return entry;
  if (framework === 'html') {
    if (source.includes('</body>')) {
      source = source.replace('</body>', '  <editable-chip></editable-chip>\n</body>');
      writeFileSync(full, source);
      return entry;
    }
  }
  if (framework === 'next' && source.includes('{children}')) {
    const importLine = `import { EditableHost } from '@/components/editable-website-host';\n`;
    if (!source.includes('editable-website-host')) {
      source = importLine + source;
      source = source.replace('{children}', '{children}\n        <EditableHost isAdmin={false} />');
      writeFileSync(full, source);
      return entry;
    }
  }
  return null;
}

export function applyBootstrap({ root, framework, marks, persist, expressComments }) {
  const written = [];
  const byFile = new Map();
  for (const mark of marks) {
    const list = byFile.get(mark.file) ?? [];
    list.push(mark);
    byFile.set(mark.file, list);
  }
  for (const [file, list] of byFile) {
    patchFile(root, file, list);
    written.push(file);
  }

  const rel = hostPath(framework);
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  const snippet = `${expressComments ? EXPRESS_COMMENT : ''}${hostSnippet(framework, persist)}`;
  writeFileSync(full, snippet);
  written.push(rel);

  const entry = ensureChip(root, framework);
  if (entry) written.push(entry);

  return { written, host: rel, entry };
}
