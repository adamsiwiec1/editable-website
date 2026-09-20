import { promises as fs } from 'node:fs';
import path from 'node:path';
import { applyInventorySlot, DEFAULT_INVENTORY, parseInventory, type InventoryState } from './inventory';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'inventory.json');
const PREVIEW_FILE = path.join('/tmp', 'editable-website-inventory.json');

function memoryBag(): { content: InventoryState | null } {
  const bag = globalThis as { __editableWebsiteInventory?: { content: InventoryState | null } };
  if (!bag.__editableWebsiteInventory) {
    bag.__editableWebsiteInventory = { content: null };
  }
  return bag.__editableWebsiteInventory;
}

async function readJsonFile(file: string): Promise<InventoryState | null> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return parseInventory(JSON.parse(raw) as unknown);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw err;
  }
}

async function writeJsonFile(file: string, next: InventoryState): Promise<boolean> {
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

export const inventoryStore = {
  async get(): Promise<InventoryState> {
    const mem = memoryBag();
    if (mem.content) return { ...mem.content, featured: [...mem.content.featured], catalog: mem.content.catalog };

    const preview = process.env.VERCEL ? await readJsonFile(PREVIEW_FILE) : null;
    if (preview) {
      mem.content = preview;
      return preview;
    }

    const local = await readJsonFile(LOCAL_FILE);
    const next = local ?? { ...DEFAULT_INVENTORY };
    mem.content = next;
    return next;
  },

  async saveSlot(slot: number, id: string): Promise<InventoryState> {
    const current = await this.get();
    const next = applyInventorySlot(current, slot, id);
    memoryBag().content = next;
    if (process.env.VERCEL) {
      await writeJsonFile(PREVIEW_FILE, next);
      return next;
    }
    const wrote = await writeJsonFile(LOCAL_FILE, next);
    if (!wrote) await writeJsonFile(PREVIEW_FILE, next);
    return next;
  },
};
