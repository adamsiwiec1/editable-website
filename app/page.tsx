import { EditableText } from '@/components/cms/editable-text';

const CARS = [
  { name: 'car1.name', meta: 'car1.meta', price: 'car1.price', blurb: 'car1.blurb' },
  { name: 'car2.name', meta: 'car2.meta', price: 'car2.price', blurb: 'car2.blurb' },
  { name: 'car3.name', meta: 'car3.meta', price: 'car3.price', blurb: 'car3.blurb' },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="border-b border-amber-400/20 bg-amber-400/8">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <EditableText
            k="banner.eyebrow"
            as="p"
            className="text-[0.65rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <div data-demo="tour-copy">
            <EditableText k="banner.title" as="h1" className="mt-2 font-display text-3xl text-zinc-50 sm:text-4xl" />
          </div>
          <EditableText
            k="banner.body"
            as="p"
            className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-300"
            multiline
          />
          <EditableText k="banner.hint" as="p" className="mt-4 text-sm text-amber-200/80" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <EditableText
            k="hero.eyebrow"
            as="p"
            className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <EditableText k="hero.title" as="h2" className="mt-3 font-display text-5xl leading-none text-zinc-50 sm:text-6xl" />
          <EditableText
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
              <EditableText k="hero.cta" />
            </a>
            <a
              href="#hours"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-100 hover:border-amber-300/60"
            >
              <EditableText k="hero.secondary" />
            </a>
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
          <p className="text-[0.65rem] tracking-[0.24em] text-zinc-500 uppercase">Dummy dealership</p>
          <p className="mt-2 font-display text-2xl text-zinc-50">Acme Motors</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Fake inventory for a real pattern: wrap marketing strings in{' '}
            <code className="text-amber-200">EditableText</code>, sign in, and edit them on the page.
          </p>
        </aside>
      </section>

      <section id="inventory" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <EditableText
            k="lot.eyebrow"
            as="p"
            className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
          />
          <EditableText k="lot.title" as="h2" className="mt-3 font-display text-4xl text-zinc-50" />
          <EditableText k="lot.lede" as="p" className="mt-3 max-w-2xl text-zinc-400" multiline />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CARS.map((car) => (
              <article key={car.name} className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
                <EditableText k={car.name} as="h3" className="font-display text-2xl text-zinc-50" />
                <EditableText k={car.meta} as="p" className="mt-1 text-sm text-zinc-500" />
                <EditableText k={car.price} as="p" className="mt-4 text-2xl text-amber-300" />
                <EditableText k={car.blurb} as="p" className="mt-3 text-sm leading-relaxed text-zinc-400" multiline />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hours" className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <EditableText
              k="hours.eyebrow"
              as="p"
              className="text-[0.7rem] tracking-[0.28em] text-amber-300 uppercase"
            />
            <EditableText k="hours.title" as="h2" className="mt-3 font-display text-4xl text-zinc-50" />
            <ul className="mt-6 space-y-2 text-zinc-300">
              <EditableText k="hours.weekdays" as="li" />
              <EditableText k="hours.saturday" as="li" />
              <EditableText k="hours.sunday" as="li" />
            </ul>
            <EditableText k="hours.address" as="p" className="mt-6 text-zinc-400" />
            <p className="mt-6">
              <a
                href="https://maps.google.com/?q=1400+Route+9+Acme+NJ"
                className="text-amber-200 hover:text-white"
              >
                <EditableText k="hours.cta" />
              </a>
            </p>
          </div>
          <div id="visit" className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-7">
            <EditableText k="visit.title" as="h2" className="font-display text-3xl text-zinc-50" />
            <EditableText k="visit.body" as="p" className="mt-4 leading-relaxed text-zinc-300" multiline />
            <p className="mt-6">
              <a
                href="tel:+15555550199"
                className="inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
              >
                <EditableText k="visit.cta" />
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
