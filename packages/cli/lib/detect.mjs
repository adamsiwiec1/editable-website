import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_FILES = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.cjs'];
const SVELTE_FILES = ['svelte.config.js', 'svelte.config.mjs', 'svelte.config.ts'];
const VITE_FILES = ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'];

function readPkg(dir) {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function names(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function depsOf(pkg) {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

export const FRAMEWORKS = ['html', 'react', 'next', 'svelte', 'angular'];

export function detectFramework(dir) {
  const listing = names(dir);
  const pkg = readPkg(dir);
  const deps = depsOf(pkg);

  if (NEXT_FILES.some((name) => listing.includes(name)) || deps.next) return 'next';
  if (SVELTE_FILES.some((name) => listing.includes(name)) || deps['@sveltejs/kit']) return 'svelte';
  if (listing.includes('angular.json') || deps['@angular/core']) return 'angular';

  const vite = VITE_FILES.some((name) => listing.includes(name));
  if (vite && deps.svelte) return 'svelte';
  if ((vite && deps.react) || deps.react) return 'react';
  if (listing.includes('index.html') || listing.includes('index.htm')) return 'html';
  return null;
}

export function findEntry(dir, framework) {
  const candidates = {
    next: [
      'app/layout.tsx',
      'app/layout.jsx',
      'src/app/layout.tsx',
      'src/app/layout.jsx',
      'pages/_app.tsx',
      'pages/_app.jsx',
    ],
    react: ['src/App.tsx', 'src/App.jsx', 'src/main.tsx', 'src/main.jsx', 'App.tsx', 'App.jsx'],
    svelte: ['src/App.svelte', 'src/routes/+layout.svelte', 'src/routes/+page.svelte'],
    angular: ['src/app/app.component.html', 'src/app/app.html'],
    html: ['index.html', 'src/index.html', 'public/index.html'],
  };
  for (const rel of candidates[framework] ?? candidates.html) {
    if (existsSync(join(dir, rel))) return rel;
  }
  return null;
}
