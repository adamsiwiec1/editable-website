# Demos

Same editor, four hosts. **These pages do not call an API.** Edits stay in your browser so a public demo cannot be overwritten.

Owners open a hidden URL (`/desk-x7k2`) — not a checkbox or a header Sign in. Any valid email and password. No real session.

| Demo | Hook-in | Run |
| --- | --- | --- |
| [vanilla](vanilla) | IIFE + `data-copy` + `mount()` | `npm run demo:html` → http://localhost:4010 |
| [react](react) | `mount()` in `useEffect` | `npm run demo:react` → http://localhost:4011 |
| [next](next) | Server HTML + client `mount()` + your session → `isAdmin` | `npm run demo:next` → http://localhost:4012 |
| [svelte](svelte) | `mount()` in `$effect` | `npm run demo:svelte` → http://localhost:4013 |

Serve only the demo folder. Never `npx serve .` from the git root.

## Add it to your site

1. `npm i editable-website` — [npm](https://www.npmjs.com/package/editable-website)
2. Mark copy, call `mount()` (each demo shows that host’s snippet)
3. Persist with the example API **you** run:

```bash
git clone https://github.com/adamsiwiec1/editable-website.git
cd editable-website/examples/express
npm i
npm start
```

That server writes `data/copy.json`. Point `endpoints.copy` at `http://localhost:4020/api/copy`. Gate PUT with your login before production.

[GitHub](https://github.com/adamsiwiec1/editable-website)
