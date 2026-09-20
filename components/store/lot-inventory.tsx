'use client';

import { useEffect, useState } from 'react';
import { CHANGE_EVENT, getState } from 'editable-website';
import { featuredVehicles, type InventoryState, type Vehicle } from '@/lib/inventory';

export function LotInventory({
  isAdmin,
  initial,
}: {
  isAdmin: boolean;
  initial: InventoryState;
}) {
  const [inventory, setInventory] = useState(initial);
  const [editing, setIsEditing] = useState(false);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const cars = featuredVehicles(inventory);

  useEffect(() => {
    const sync = () => setIsEditing(Boolean(getState()?.editing));
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  const onPick = async (slot: number, id: string) => {
    if (id === inventory.featured[slot]) return;
    setBusySlot(slot);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, id }),
      });
      const body = (await res.json().catch(() => ({}))) as InventoryState & { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Could not update inventory');
      setInventory(body);
    } finally {
      setBusySlot(null);
    }
  };

  return (
    <div data-demo="inventory" className="mt-10 grid gap-5 md:grid-cols-3">
      {cars.map((car, slot) => (
        <VehicleCard
          key={`${slot}-${car.id}`}
          car={car}
          slot={slot}
          catalog={inventory.catalog}
          canPick={isAdmin && editing}
          busy={busySlot === slot}
          onPick={onPick}
        />
      ))}
    </div>
  );
}

function VehicleCard({
  car,
  slot,
  catalog,
  canPick,
  busy,
  onPick,
}: {
  car: Vehicle;
  slot: number;
  catalog: Vehicle[];
  canPick: boolean;
  busy: boolean;
  onPick: (slot: number, id: string) => void;
}) {
  return (
    <article
      data-demo={slot === 0 ? 'inventory-slot' : undefined}
      className="rounded-xl border border-white/10 bg-zinc-950/40 p-5"
    >
      {canPick && (
        <label className="mb-3 block">
          <span className="text-[0.65rem] tracking-[0.18em] text-amber-300/80 uppercase">On the lot</span>
          <select
            data-demo={slot === 0 ? 'inventory-pick' : undefined}
            value={car.id}
            disabled={busy}
            onChange={(event) => onPick(slot, event.target.value)}
            className="mt-1 w-full rounded-md border border-amber-400/40 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-amber-300"
          >
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <h3 className="font-display text-2xl text-zinc-50">{car.name}</h3>
      <p className="mt-1 text-sm text-zinc-500">{car.meta}</p>
      <p className="mt-4 text-2xl text-amber-300">{car.price}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{car.blurb}</p>
    </article>
  );
}
