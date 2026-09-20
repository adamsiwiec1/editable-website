export type Vehicle = {
  id: string;
  name: string;
  meta: string;
  price: string;
  blurb: string;
};

export type InventoryState = {
  featured: string[];
  catalog: Vehicle[];
};

export const DEFAULT_INVENTORY: InventoryState = {
  featured: ['accord', 'highlander', 'f150'],
  catalog: [
    {
      id: 'accord',
      name: '2019 Honda Accord EX',
      meta: 'Sedan · 48k miles · one owner',
      price: '$18,450',
      blurb: 'Clean CarFax, new tires, and a commute that still feels quiet.',
    },
    {
      id: 'highlander',
      name: '2021 Toyota Highlander LE',
      meta: 'SUV · 36k miles · third row',
      price: '$29,900',
      blurb: 'Car seats, groceries, and a Saturday soccer bag — all in one trip.',
    },
    {
      id: 'f150',
      name: '2018 Ford F-150 XLT',
      meta: 'Truck · 62k miles · 4x4',
      price: '$26,200',
      blurb: 'The weekend hauler. Bed liner already in. Tow package ready.',
    },
    {
      id: 'civic',
      name: '2020 Honda Civic Sport',
      meta: 'Hatch · 31k miles · manual',
      price: '$17,900',
      blurb: 'A city car that still likes an on-ramp. One owner, no stories.',
    },
    {
      id: 'outback',
      name: '2019 Subaru Outback Premium',
      meta: 'Wagon · 54k miles · AWD',
      price: '$21,650',
      blurb: 'Roof rails, winter package, and a dog that already approved the cargo area.',
    },
    {
      id: 'camry',
      name: '2022 Toyota Camry SE',
      meta: 'Sedan · 22k miles · one owner',
      price: '$23,400',
      blurb: 'Still smells like the lot sticker. Highway miles, dealer maintained.',
    },
  ],
};

const SLOT_COUNT = 3;

function asVehicle(value: unknown): Vehicle | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id.trim() : '';
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  if (!id || !name) return null;
  return {
    id,
    name,
    meta: typeof row.meta === 'string' ? row.meta : '',
    price: typeof row.price === 'string' ? row.price : '',
    blurb: typeof row.blurb === 'string' ? row.blurb : '',
  };
}

export function parseInventory(value: unknown): InventoryState {
  const fallback = DEFAULT_INVENTORY;
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const rawCatalog = Array.isArray(row.catalog) ? row.catalog : fallback.catalog;
  const catalog: Vehicle[] = [];
  const seen = new Set<string>();
  for (const item of rawCatalog) {
    const vehicle = asVehicle(item);
    if (!vehicle || seen.has(vehicle.id)) continue;
    seen.add(vehicle.id);
    catalog.push(vehicle);
  }
  if (catalog.length === 0) catalog.push(...fallback.catalog);

  const ids = new Set(catalog.map((item) => item.id));
  const rawFeatured = Array.isArray(row.featured) ? row.featured : fallback.featured;
  const featured = rawFeatured
    .filter((id): id is string => typeof id === 'string' && ids.has(id))
    .slice(0, SLOT_COUNT);
  for (const id of fallback.featured) {
    if (featured.length >= SLOT_COUNT) break;
    if (ids.has(id) && !featured.includes(id)) featured.push(id);
  }
  while (featured.length < SLOT_COUNT) {
    const next = catalog.find((item) => !featured.includes(item.id));
    if (!next) break;
    featured.push(next.id);
  }

  return { featured, catalog };
}

export function vehicleById(state: InventoryState, id: string): Vehicle | undefined {
  return state.catalog.find((item) => item.id === id);
}

export function featuredVehicles(state: InventoryState): Vehicle[] {
  return state.featured
    .map((id) => vehicleById(state, id))
    .filter((item): item is Vehicle => Boolean(item));
}

export function applyInventorySlot(state: InventoryState, slot: number, id: string): InventoryState {
  if (!state.catalog.some((item) => item.id === id)) return state;
  if (slot < 0 || slot >= SLOT_COUNT) return state;
  const featured = [...state.featured];
  featured[slot] = id;
  return { ...state, featured };
}
