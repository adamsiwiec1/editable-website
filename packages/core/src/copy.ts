export type CopyMap = Record<string, string>;

export type PageContent = {
  copy: CopyMap;
};

export function cleanOverride(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parseCopyPayload(value: unknown): CopyMap {
  if (!value || typeof value !== 'object') return {};
  const row = value as Record<string, unknown>;
  const raw = row.copy && typeof row.copy === 'object' ? (row.copy as Record<string, unknown>) : row;
  const copy: CopyMap = {};
  for (const [key, next] of Object.entries(raw)) {
    const cleaned = cleanOverride(next);
    if (cleaned) copy[key] = cleaned;
  }
  return copy;
}

export function mergeCopy(overrides: CopyMap, key: string, original: string): string {
  return cleanOverride(overrides[key]) ?? original;
}

export function applyCopyPatch(copy: CopyMap, key: string, value: string): CopyMap {
  const next: CopyMap = { ...copy };
  const cleaned = value.trim();
  if (cleaned) next[key] = cleaned;
  else delete next[key];
  return next;
}

export function copyPutBody(key: string, value: string): { key: string; value: string } {
  return { key: key.trim(), value };
}
