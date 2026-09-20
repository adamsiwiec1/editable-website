# Example copy API

A small Express host the editor can talk to. It is not part of the npm package. Run it on **your** machine — the public demos do not connect to it.

```bash
git clone https://github.com/adamsiwiec1/editable-website.git
cd editable-website/examples/express
npm i
npm start
```

Then in your site:

```ts
await mount({
  isAdmin: true, // you decide this from your login
  endpoints: { copy: 'http://localhost:4020/api/copy' },
});
```

## What it does

| Method | Body | File |
| --- | --- | --- |
| `GET /api/copy` | — | reads `data/copy.json` → `{ copy: { "hero.title": "…" } }` |
| `PUT /api/copy` | `{ "key": "hero.title", "value": "Sold." }` | writes that file, returns the same `{ copy }` object |

PUT is open here so you can try it locally. Before production, check the owner is signed in, then swap the JSON file for your database if you want. The handler ends with `triggerCi()` — a no-op you can fill in to kick GitHub Actions, GCP Cloud Build, or AWS CodePipeline after a save.

The package never sees your login. It only calls these two routes.
