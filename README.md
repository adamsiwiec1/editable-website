# editable-website

Next.js starter for an **in-place editable marketing website**. The public page looks like a finished site — not a CMS. Owners sign in on a hidden route, tap **Edit the site**, then click any outlined sentence. A local JSON store holds overrides — swap that file for any CMS or API when you drop the pattern into a real site.

The demo is a dummy **Acme Motors** car dealership. It is not a live product and it does not talk to a hosted auth or database.

## Visitor flow

On first load, a short guided demo walks through the product. Returning visitors are left alone; they can restart anytime with **Try the demo →** in the top right.

1. Invite — this is a marketing site founders can edit themselves
2. A sign-in control appears (it is not in the main nav)
3. Hidden `/login` — dummy credentials `admin@example.com` / `edit-demo`
4. Floating **Edit the site** chip
5. Click a sentence and change it
6. Why it exists: stop the engineer ↔ founder copy-review loop

Pencils and outlines show only while edit mode is on. Visitors never see them. `?featureDemo=1` forces the tour; `?featureDemo=0` hides it.

## What you get

- Dummy cookie login (`admin@example.com` / `edit-demo`)
- `EditModeProvider` + `EditableText` (contentEditable, only in edit mode)
- Floating edit chip when signed in
- First-load feature preview (spotlight coach + localStorage “seen” flags)
- `GET` / `PUT` `/api/copy` with a `CopyStore` interface
- TypeScript throughout (App Router, route handlers, `proxy.ts`)

## Run it

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010). Take the demo, or skip it and sign in at `/login`, tap **Edit the site**, then click any outlined sentence.

```bash
npm run typecheck
npm test
npm run build
```

## Drop it into another marketing site

Copy these folders and files:

- `components/cms/`
- `components/demo/` (optional — the walkthrough)
- `lib/copy.ts`, `lib/copy-store.ts`, `lib/admin-session.ts`, `lib/admin-cookie.ts`, `lib/http.ts`, `lib/feature-demo-storage.ts`
- `app/api/login`, `app/api/logout`, `app/api/copy`
- `proxy.ts` (or the login redirect)

Wrap the site in `EditModeProvider` (and `DemoTourProvider` if you want the tour), replace hardcoded strings with `<EditableText k="hero.title" />`, and add keys to `DEFAULT_COPY` in `lib/copy.ts`.

To persist somewhere else, replace `jsonCopyStore` in `lib/copy-store.ts`. The UI does not change.

## Dummy login

| Env | Default |
| --- | --- |
| `ADMIN_EMAIL` | `admin@example.com` |
| `ADMIN_PASS` | `edit-demo` |

This is a local httpOnly cookie, not Supabase or a hosted IdP. `/login` is intentionally hidden from the header nav — share it with owners, not shoppers.

## License

MIT. See [LICENSE](LICENSE).
