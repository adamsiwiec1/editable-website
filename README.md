# editable-website

Next.js starter for an **in-place editable marketing website**. Sign in, click the pencil, and edit page copy on the canvas. A local JSON store holds overrides — swap that file for any CMS or API when you drop the pattern into a real site.

The demo is a dummy **Acme Motors** car dealership. It is not a live product and it does not talk to a hosted auth or database.

## What you get

- Dummy cookie login (`admin@example.com` / `edit-demo`)
- `EditModeProvider` + `EditableText` (contentEditable + pencil)
- Floating edit dock when signed in
- `GET` / `PUT` `/api/copy` with a `CopyStore` interface
- TypeScript throughout (App Router, route handlers, `proxy.ts`)

## Run it

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in at `/login`, tap **Edit**, then click any outlined sentence.

```bash
npm run typecheck
npm run build
```

## Drop it into another marketing site

Copy these folders and files:

- `components/cms/`
- `lib/copy.ts`, `lib/copy-store.ts`, `lib/admin-session.ts`, `lib/admin-cookie.ts`, `lib/http.ts`
- `app/api/login`, `app/api/logout`, `app/api/copy`
- `proxy.ts` (or the login redirect)

Wrap the site in `EditModeProvider`, replace hardcoded strings with `<EditableText k="hero.title" />`, and add keys to `DEFAULT_COPY` in `lib/copy.ts`.

To persist somewhere else, replace `jsonCopyStore` in `lib/copy-store.ts`. The UI does not change.

## Dummy login

| Env | Default |
| --- | --- |
| `ADMIN_EMAIL` | `admin@example.com` |
| `ADMIN_PASS` | `edit-demo` |

This is a local httpOnly cookie, not Supabase or a hosted IdP.

## License

MIT. See [LICENSE](LICENSE).
