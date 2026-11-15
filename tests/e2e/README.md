# Smoke test: every built page

`smoke.spec.ts` opens every `*.html` file in `.output/public` in Chromium, at 390px and 1280px wide, and fails a page on:

- an uncaught error (`pageerror`) or any `console.error`;
- any console message about hydration (Vue's "Hydration completed but contains mismatches.", and the detailed warnings);
- no `<main>`, or a `<main>` with no text;
- a `<title>` containing "Nuxt".

```bash
npm run build:search
npm run test:e2e                                                      # all pages, both widths (about 80 s on the Mac); CI runs this
npx playwright test -c tests/e2e/playwright.config.ts                 # the same, written out
npx playwright test -c tests/e2e/playwright.config.ts -g '/community/jobs/$' --project 1280   # one page, one width
```

It serves the build on port 4101 (`scripts/serve-static.mjs` with `PORT=4101`), so it can run while the visual
comparison holds 4100. It takes no screenshots, so it should run on Linux too; `.github/workflows/verify.yml` runs it on every pull request after `verify.sh --build` (added 14 November 2026; the first Linux run is that PR's own CI run). The visual config at the root
(`playwright.config.ts`, `tests/visual/`) and this one do not pick up each other's tests.

What it does not count, and why (all in `smoke.spec.ts`):

- Requests to other hosts, and to the three paths that exist only on Netlify (`/api/gage/`, `/api/geo`,
  `/flooding-gages.json`), are blocked, so a run does not depend on the network. Chromium's "Failed to load resource" for
  those, and only those, is ignored. A missing file of our own still fails. One cost: the home page's gage card never
  gets its data here, so its client code beyond the "no reading" state is not exercised. (`/flooding-gages.json` is
  blocked even when `scripts/flooding-gages.mjs` has written it into the build.)
- Redirect stubs (a `<meta http-equiv="refresh">` page, the 15 under `/highlights/`) are not opened: the test checks
  that the target is a built page, which has its own test.
- `404.html` and `200.html` are Nuxt's fallback shells. Each is opened at an address that does not exist, the way
  Netlify serves `404.html`; Nuxt's own "Page not found" log line and the 404 status of that address are ignored.

## Known failures

`known-failures.txt` lists pages that fail today, one line each: `path | 390, 1280 or both | reason`. A listed page
is expected to fail (`test.fail`); when it starts passing, the test fails ("Expected to fail, but passed") until the
line is removed, and a line naming a page that is not built fails too. So the list can only shrink. Do not add a
line to make a new failure pass: fix the page, or ask Jordan. A line naming a redirect stub or a page already named
also fails. Limit: a listed page that fails for a further reason still counts as the expected failure (for the two
shells, that hides anything else that goes wrong on the 404 page until the error page is fixed).

## Production builds and hydration mismatches

Tested 14 November 2026 with deliberate mismatches: a production build logs one generic
`console.error("Hydration completed but contains mismatches.")` for a text or node mismatch, with no detail, and
nothing at all for a mismatch in an attribute such as `style` (footgun 13). Vue only checks attributes in production
when `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` is on; with it on, the style mismatch was reported. The site does not
turn it on (that is a `nuxt.config.ts` change, rule 8). So this smoke test cannot catch a footgun-13 failure (a wrong
attribute left by hydration); the visual comparison and a person looking still have to.

Also out of its reach: anything after the page goes network-idle, and anything that only happens on scroll or click.
