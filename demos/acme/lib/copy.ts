export const DEFAULT_COPY = {
  'chrome.brand': 'Acme Motors',
  'chrome.tagline': 'The lot on Route 9',
  'chrome.nav_inventory': 'Inventory',
  'chrome.nav_hours': 'Hours',
  'chrome.nav_visit': 'Visit the lot',
  'chrome.sign_in': 'Sign in',
  'chrome.sign_out': 'Sign out',

  'banner.eyebrow': 'What this is',
  'banner.title': 'An in-place editable website starter.',
  'banner.body':
    'This dummy Acme Motors lot is the demo. Sign in, tap Edit, then click any outlined sentence and type. Saves go to a local JSON file — swap that file for any CMS or API when you drop this into a real marketing site.',
  'banner.hint': 'Owners use a hidden URL, not a Sign in button — any valid email and password. No real session.',

  'hero.eyebrow': 'Acme Motors · Est. 1968',
  'hero.title': 'The lot is open.',
  'hero.lede':
    'Used sedans, family SUVs, and weekend trucks. No mystery fees on the windshield. Come walk the asphalt, take a key, and drive home the same afternoon.',
  'hero.cta': 'See what’s on the lot',
  'hero.secondary': 'Hours & directions',

  'lot.eyebrow': 'This week’s iron',
  'lot.title': 'Three that are ready to leave today.',
  'lot.lede': 'Prices as marked. Ask for the out-the-door number before you sit down.',

  'hours.eyebrow': 'The lot',
  'hours.title': 'Come by before the lights go out.',
  'hours.weekdays': 'Mon–Fri · 9:00–7:00',
  'hours.saturday': 'Saturday · 9:00–5:00',
  'hours.sunday': 'Sunday · closed',
  'hours.address': '1400 Route 9, Acme, NJ 08807',
  'hours.cta': 'Get directions',

  'visit.title': 'Bring your trade. Leave with keys.',
  'visit.body':
    'We appraise on the spot. If the numbers work, you drive it off the lot today. If they don’t, you leave with a coffee and no hard sell.',
  'visit.cta': 'Call the desk',

  'footer.blurb':
    'Acme Motors is dummy content for the editable-website starter. Replace these keys with your own marketing copy.',
  'footer.note': 'Local JSON persistence. Not a live dealership.',
} as const;

export type CopyKey = keyof typeof DEFAULT_COPY;

export const COPY_KEYS = Object.keys(DEFAULT_COPY) as CopyKey[];

export function isCopyKey(value: string): value is CopyKey {
  return Object.prototype.hasOwnProperty.call(DEFAULT_COPY, value);
}

export type PageCopyOverrides = Partial<Record<CopyKey, string>>;

export type PageContent = {
  copy: PageCopyOverrides;
};

export const EMPTY_PAGE_CONTENT: PageContent = { copy: {} };

function cleanOverride(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parsePageContent(value: unknown): PageContent {
  if (!value || typeof value !== 'object') return { ...EMPTY_PAGE_CONTENT };
  const row = value as Record<string, unknown>;
  const rawCopy = row.copy && typeof row.copy === 'object' ? (row.copy as Record<string, unknown>) : {};
  const copy: PageCopyOverrides = {};
  for (const key of COPY_KEYS) {
    const next = cleanOverride(rawCopy[key]);
    if (next) copy[key] = next;
  }
  return { copy };
}

export function resolveCopyKey(overrides: PageCopyOverrides, key: CopyKey): string {
  return cleanOverride(overrides[key]) ?? DEFAULT_COPY[key];
}
