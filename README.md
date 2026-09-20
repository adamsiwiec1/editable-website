# editable-website

In-place editor for marketing copy — mark sentences, edit on the page, save through **your** API.

**npm:** [`editable-website`](https://www.npmjs.com/package/editable-website)

[GitHub](https://github.com/adamsiwiec1/editable-website)

---

## Clearest path (do this)

1. **Install the editor**
   ```bash
   npm i editable-website
   ```
2. **Mark copy and mount** (see [packages/core/README.md](packages/core/README.md))
3. **Persist yourself** with the Express example — JSON file, local only:
   ```bash
   git clone https://github.com/adamsiwiec1/editable-website.git
   cd editable-website/examples/express
   npm i
   npm start
   ```
   Then point `endpoints.copy` at `http://localhost:4020/api/copy`.

Public demos **do not** connect to that API. They keep edits in the browser so the hosted site cannot be overwritten by visitors.

Owners open a hidden URL (`/desk-x7k2`) — not a checkbox or a header Sign in. Any valid email and password. No real session.

---

## Live demos

| Host | URL |
| --- | --- |
| Acme reference app | https://editable-website-five.vercel.app |
| HTML | https://editable-website-demo-html.vercel.app |
| React | https://editable-website-demo-react.vercel.app |
| Next.js | https://editable-website-demo-next.vercel.app |
| Svelte | https://editable-website-demo-svelte.vercel.app |

---

## Repo layout

| Path | What it is |
| --- | --- |
| [packages/core](packages/core) | npm package (`editable-website`) |
| [demos](demos) | HTML / React / Next / Svelte hosts (browser-only saves) |
| [examples/express](examples/express) | Tiny Express `GET`/`PUT /api/copy` → `data/copy.json` |
| Root Next app | Acme Motors reference site using the same package |

## Run locally

```bash
npm install
npm run build -w editable-website
```

| What | Command | URL |
| --- | --- | --- |
| Acme reference app | `npm run dev` | http://localhost:3010 |
| HTML / vanilla | `npm run demo:html` | http://localhost:4010 |
| React | `npm run demo:react` | http://localhost:4011 |
| Next.js | `npm run demo:next` | http://localhost:4012 |
| Svelte | `npm run demo:svelte` | http://localhost:4013 |
| Express copy API | `npm run example:api` | http://localhost:4020/api/copy |

Acme also needs env defaults:

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3010](http://localhost:3010). Hidden owner desk: [http://localhost:3010/desk-x7k2](http://localhost:3010/desk-x7k2).

## License

MIT. See [LICENSE](LICENSE).
