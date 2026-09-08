import { promises as fs } from 'node:fs';
import path from 'node:path';
import { EMPTY_PAGE_CONTENT, parsePageContent, type CopyKey, type PageContent } from './copy';

export type CopyStore = {
  get: () => Promise<PageContent>;
  save: (patch: { key: CopyKey; value: string }) => Promise<PageContent>;
};

const LOCAL_FILE = path.join(process.cwd(), 'data', 'page-copy.json');
const PREVIEW_FILE = path.join('/tmp', 'editable-website-page-copy.json');

function memoryBag(): { content: PageContent } {
  const bag = globalThis as { __editableWebsiteCopy?: { content: PageContent } };
  if (!bag.__editableWebsiteCopy) {
    bag.__editableWebsiteCopy = { content: { ...EMPTY_PAGE_CONTENT } };
  }
  return bag.__editableWebsiteCopy;
}

async function readJsonFile(file: string): Promise<PageContent | null> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return parsePageContent(JSON.parse(raw) as unknown);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw err;
  }
}

async function writeJsonFile(file: string, next: PageContent): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') return false;
    throw err;
  }
}

function applyPatch(current: PageContent, patch: { key: CopyKey; value: string }): PageContent {
  const next: PageContent = { copy: { ...current.copy } };
  const cleaned = patch.value.trim();
  if (cleaned) next.copy[patch.key] = cleaned;
  else delete next.copy[patch.key];
  return next;
}

export const jsonCopyStore: CopyStore = {
  async get() {
    const mem = memoryBag();
    if (Object.keys(mem.content.copy).length > 0) return { copy: { ...mem.content.copy } };

    const preview = process.env.VERCEL ? await readJsonFile(PREVIEW_FILE) : null;
    if (preview) return preview;

    const local = await readJsonFile(LOCAL_FILE);
    return local ?? { ...EMPTY_PAGE_CONTENT };
  },
  async save(patch) {
    const current = await this.get();
    const next = applyPatch(current, patch);
    memoryBag().content = { copy: { ...next.copy } };

    if (process.env.VERCEL) {
      await writeJsonFile(PREVIEW_FILE, next);
      return next;
    }

    const wrote = await writeJsonFile(LOCAL_FILE, next);
    if (!wrote) await writeJsonFile(PREVIEW_FILE, next);
    return next;
  },
};

/** Swap this export for an API or CMS implementation. The UI does not change. */
export const copyStore: CopyStore = jsonCopyStore;
