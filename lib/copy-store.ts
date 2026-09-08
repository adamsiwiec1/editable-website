import { promises as fs } from 'node:fs';
import path from 'node:path';
import { EMPTY_PAGE_CONTENT, parsePageContent, type CopyKey, type PageContent } from './copy';

export type CopyStore = {
  get: () => Promise<PageContent>;
  save: (patch: { key: CopyKey; value: string }) => Promise<PageContent>;
};

const FILE = path.join(process.cwd(), 'data', 'page-copy.json');

async function readFileStore(): Promise<PageContent> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return parsePageContent(JSON.parse(raw) as unknown);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { ...EMPTY_PAGE_CONTENT };
    throw err;
  }
}

async function writeFileStore(next: PageContent): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

export const jsonCopyStore: CopyStore = {
  async get() {
    return readFileStore();
  },
  async save(patch) {
    const current = await readFileStore();
    const next: PageContent = { copy: { ...current.copy } };
    const cleaned = patch.value.trim();
    if (cleaned) next.copy[patch.key] = cleaned;
    else delete next.copy[patch.key];
    await writeFileStore(next);
    return next;
  },
};

/** Swap this export for an API or CMS implementation. The UI does not change. */
export const copyStore: CopyStore = jsonCopyStore;
