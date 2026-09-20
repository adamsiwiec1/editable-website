import type { CopyMap, MountOptions } from 'editable-website';

const COPY_STORAGE = 'editable-website:demo-copy';

export function readLocalCopy(): CopyMap {
  try {
    return JSON.parse(localStorage.getItem(COPY_STORAGE) || '{}') as CopyMap;
  } catch {
    return {};
  }
}

export function writeLocalCopy(copy: CopyMap): { copy: CopyMap } {
  localStorage.setItem(COPY_STORAGE, JSON.stringify(copy));
  return { copy };
}

export function mountOptions({ isAdmin }: { isAdmin: boolean }): MountOptions {
  return {
    isAdmin,
    fetchCopy: async () => ({ copy: readLocalCopy() }),
    saveCopy: async (key, value) => {
      const copy = readLocalCopy();
      const next = value.trim();
      if (next) copy[key] = next;
      else delete copy[key];
      return writeLocalCopy(copy);
    },
  };
}
