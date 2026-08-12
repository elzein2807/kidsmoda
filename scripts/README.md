# Checks

Both scripts drive a real browser against a dev server on `localhost:3000`.

Playwright is **not** an install-time dependency — it would pull ~150 MB of
browsers into every CI run and every deploy for two developer scripts. Install
it when you want to run them:

```bash
npm install --no-save playwright
npx playwright install chromium
```

Then, with `npm run dev` running in another terminal:

```bash
npm run e2e   # the whole purchase path: PDP → bag → checkout → confirmation → admin
npm run qa    # horizontal overflow at five widths, landmarks, names, focus, reduced motion
```

If you already have a Chromium on disk, point at it instead of downloading one:

```bash
CHROMIUM_PATH=/path/to/chromium npm run qa
```

## What they cover

`e2e.mjs` places a real order through `/api/orders` and then asserts it appears
in Admin → Orders, so it exercises the server-side pricing path as well as the UI.

`qa.mjs` guards the failures that are easy to reintroduce: a section that
overflows on a 390px screen, a link with no accessible name, a missing focus
ring, or content left invisible under `prefers-reduced-motion`.
