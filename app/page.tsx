import { CopyText } from '@/components/cms/copy-text';
import { LotInventory } from '@/components/store/lot-inventory';
import { peekAdmin } from '@/lib/admin-session';
import { inventoryStore } from '@/lib/inventory-store';

export default async function HomePage() {
  const [admin, inventory] = await Promise.all([peekAdmin(), inventoryStore.get()]);
  return (
    <>
      <section className="border-b border-amber-400/20 bg-amber-400/8">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <CopyText
            k="banner.eyebrow"
            as="p"
            className="text-[0.65rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <div data-demo="tour-copy">
            <CopyText k="banner.title" as="h1" className="mt-2 font-display text-3xl text-zinc-50 sm:text-4xl" />
          </div>
          <CopyText
            k="banner.body"
            as="p"
            className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-300"
            multiline
          />
          <CopyText k="banner.hint" as="p" className="mt-4 text-sm text-amber-200/80" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <CopyText
            k="hero.eyebrow"
            as="p"
            className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <CopyText k="hero.title" as="h2" className="mt-3 font-display text-5xl leading-none text-zinc-50 sm:text-6xl" />
          <CopyText
            k="hero.lede"
            as="p"
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300"
            multiline
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#inventory"
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
            >
              <CopyText k="hero.cta" />
            </a>
            <a
              href="#hours"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-100 hover:border-amber-300/60"
            >
              <CopyText k="hero.secondary" />
            </a>
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
          <p className="text-[0.65rem] tracking-[0.24em] text-zinc-500 uppercase">Dummy dealership</p>
          <p className="mt-2 font-display text-2xl text-zinc-50">Acme Motors</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Fake inventory for a real pattern: mark strings with{' '}
            <code className="text-amber-200">data-copy</code>, install <code className="text-amber-200">editable-website</code>,
            sign in, and edit them on the page.
          </p>
        </aside>
      </section>

      <section id="inventory" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <CopyText
            k="lot.eyebrow"
            as="p"
            className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <CopyText k="lot.title" as="h2" className="mt-3 font-display text-4xl text-zinc-50" />
          <CopyText k="lot.lede" as="p" className="mt-3 max-w-2xl text-zinc-400" multiline />
          <LotInventory isAdmin={Boolean(admin)} initial={inventory} />
        </div>
      </section>

      <section id="hours" className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <CopyText
              k="hours.eyebrow"
              as="p"
              className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
            />
            <CopyText k="hours.title" as="h2" className="mt-3 font-display text-4xl text-zinc-50" />
            <ul className="mt-6 space-y-2 text-zinc-300">
              <CopyText k="hours.weekdays" as="li" />
              <CopyText k="hours.saturday" as="li" />
              <CopyText k="hours.sunday" as="li" />
            </ul>
            <CopyText k="hours.address" as="p" className="mt-6 text-zinc-400" />
            <p className="mt-6">
              <a
                href="https://maps.google.com/?q=1400+Route+9+Acme+NJ"
                className="text-amber-200 hover:text-white"
              >
                <CopyText k="hours.cta" />
              </a>
            </p>
          </div>
          <div id="visit" className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-7">
            <CopyText k="visit.title" as="h2" className="font-display text-3xl text-zinc-50" />
            <CopyText k="visit.body" as="p" className="mt-4 leading-relaxed text-zinc-300" multiline />
            <p className="mt-6">
              <a
                href="tel:+15555550199"
                className="inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
              >
                <CopyText k="visit.cta" />
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
