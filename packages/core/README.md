# editable-website

In-place editor for marketing copy. Mark sentences on your page, tap **Edit the site**, type. Zero runtime dependencies. Works in HTML, React, Next.js, Svelte, Angular, or any DOM host.

**Install:** `npm i editable-website`

[GitHub](https://github.com/adamsiwiec1/editable-website) · [npm](https://www.npmjs.com/package/editable-website)

---

## What you get

| Piece | Who owns it |
| --- | --- |
| Editor UI (`mount`, `editable-chip`, outlines) | this package |
| Login / who is admin | **your** app |
| Saving copy | **your** `GET` / `PUT /api/copy` |

Public demos in this repo **do not** call a write API. Edits stay in the browser so nobody can overwrite the hosted site. To persist for real, you run a small host yourself (Express example below).

---

## 1. Install

```bash
npm i editable-website
```

Optional helper for an existing app:

```bash
npx editable-website
```

---

## 2. Mark copy, then mount

Default text is whatever is already in the HTML. Overrides come from your API.

```html
<h1 data-copy="hero.title">The lot is open.</h1>
<p data-copy="hero.lede" data-copy-multiline>Come walk the asphalt.</p>
<editable-chip></editable-chip>
```

```ts
import { mount } from 'editable-website';

await mount({
  isAdmin: true, // you decide this from your login
  endpoints: { copy: 'http://localhost:4020/api/copy' },
});
```

Outlines show only when `isAdmin` is true **and** edit mode is on. Click a sentence, type, Enter. Escape exits. The floating chip is the only pencil.

In React, `key` is reserved — use `data-copy` (or `<editable-text copy-key="hero.title">`).

---

## 3. Persist with the example Express API (JSON file)

This is the supported try-it path. No SQLite, no hosted write service from us.

```bash
git clone https://github.com/adamsiwiec1/editable-website.git
cd editable-website/examples/express
npm i
npm start
```

That serves `http://localhost:4020/api/copy` and writes `examples/express/data/copy.json`.

| Method | Body | Result |
| --- | --- | --- |
| `GET /api/copy` | — | `{ "copy": { "hero.title": "…" } }` |
| `PUT /api/copy` | `{ "key": "hero.title", "value": "Sold." }` | same `{ copy }` shape, file updated |

Point `endpoints.copy` at that URL while you try it. **Gate PUT with your own login before production.** The package never sees your auth — it only calls these two routes.

You can also pass `fetchCopy` / `saveCopy` instead of `endpoints` if you already have a client.

---

## Framework notes

- **HTML:** load `dist/editable-website.js`, mark with `data-copy`, call `EditableWebsite.mount()`.
- **React:** render marked tags, `mount()` in `useEffect`, `unmount()` on cleanup.
- **Next.js:** server renders marked HTML; a client component calls `mount()` and passes `isAdmin` from your session.
- **Svelte:** same as React, in `$effect` / `onMount`.
- **Angular:** add `CUSTOM_ELEMENTS_SCHEMA` and the same tags.

Demos: [demos/](../../demos) (HTML · React · Next · Svelte). Example API: [examples/express](../../examples/express).

## License

MIT
