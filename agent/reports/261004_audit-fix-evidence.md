# Evidence for the lockfile-only `npm audit fix` (4 October 2026)

> **Status (added when this report was committed):** Jordan approved the lockfile-only fix; it was applied and merged as #40. The options below are the choices as they stood before that.

**Nothing in the repository was changed.** This adds evidence to the recommendation already in `agent/reports/261004_dependency-audit.md` ("a separate small task: apply the lockfile-only fix; run `verify.sh --build` and the screenshot comparison"). That report decided which of the 36 findings matter and which can be fixed; **read it for those questions**. This one answers a different question: *if we ran the fix, what would happen to the built site and to the install?* I ran the real fix twice, each time in a throwaway git worktree of the default branch (commit `caa156a`, thrown away afterwards), and built and compared the result. Rule 8 applies to any dependency change, so the decision is Jordan's.

## What the fix does (it matches the earlier report)

- **`package.json` is unchanged.** Only `package-lock.json` changes: **5,332 lines added, 6,344 removed** (both runs identical). npm said: 21 packages added, 25 removed, 190 changed, of 1,087 audited. (The earlier report saw 21 / 28 / 192 on an earlier commit, before the ESLint packages were added; the advisory database and registry also change from day to day, so a later run can give a different lockfile.)
- **36 findings become 19** (4 low, 3 moderate, 25 high, 4 critical become 2 low, 1 moderate, 14 high, 2 critical). A second run changes nothing. 17 packages stop being flagged, including 2 of the 4 critical ones: `@nuxt/devtools` (development only) and `tar` (the earlier report puts it among the packages never loaded in a full build). `devalue` is also fixed; the earlier report lists it among the packages that ship in the site's code.
- **`nuxt` moves 3.21.6 to 3.21.11** (a patch release). The earlier report says `nuxt`'s own 9 advisories are fixed by this; `nuxt` stays on the list only because it depends on `node-forge`, which has no patched release.
- **The 19 that remain** are, per the earlier report: 5 that need the Content 3 migration (`@nuxt/content`, `@nuxtjs/mdc`, `unhead`, `@unhead/vue`, `@vueuse/head`), and 14 with **no patched release at all** (the `node-forge` chain and the `braces` chain). The two remaining critical findings are `@nuxt/content` and `@nuxtjs/mdc`; **GHSA-cj6r-rrr9-fg82** (the markdown-author injection) is still present. `npm audit fix --force` is not the answer: per the earlier report it moves `@nuxt/content` to 3.x and downgrades the Tailwind module, and still leaves 18 high findings.

## What I tested that the earlier report did not

I built the fixed copy and compared it with an unmodified build of the same commit.

| Check | Result |
|---|---|
| Install of the fixed lockfile under **Node 20.20.2 and npm 10.8.2** (what CI uses; the lockfile was written by npm 11.12.1) | `npm ci` exit 0 (warnings only: the Node 22 engine warning for `rollup-plugin-visualizer`, now version 7.1.1, and some deprecation notices) |
| Full `npm run build:search` under Node 20.20.2 / npm 10.8.2 | exit 0, 624 files in the built site, same as before |
| Visible text | identical on 121 of 121 pages (first run, built under Node 26) |
| Computed style of every element (`scripts/style-compare.mjs`, 390 and 1280px, Chromium) | 39,927 elements, **0 differ**, in both the Node 26 run and the Node 20 run |
| Link check | 0 unresolved (123 files; 4,457 references against 4,204 before) |
| `./scripts/verify.sh` under Node 20, ESLint | 0 FAIL, 2 WARN (the usual two); ESLint 0 problems |

**The built pages are not identical in their markup.** Every page now carries about 2 more `<link rel="prefetch" as="script">` hints (247 across the 121 pages; they tell the browser to fetch script files it may need next), and the link to each page's data file changes its query string from `/contact/_payload.json?<id>` to `/contact/_payload.json?_b=<id>` (same file, a different cache-buster format). That accounts for the 253 extra link references. I believe this comes from the Nuxt patch release, but 190 packages changed and I did not isolate `nuxt` on its own. Visitors see nothing different in the checks above; the browser does a little more background loading.

## What I did not test

- **The real Netlify build** (its Node 20 resolves to its own latest 20.x and it has its own npm).
- `npm run visual:compare` (screenshots) on the fixed copy.
- A click-through of the search dialog, the cyberseminar player and the member lookup, and whether anything depends on the old `_payload.json?<id>` format.
- The 190 changed packages one by one. **Nobody can read this lockfile change** (about 11,700 lines): the checks that matter are CI's `npm ci` and `verify.sh --build`, the Netlify deploy preview, and opening the pages by hand.
- Whether the upgraded packages declare `engines` that Node 20 cannot meet: the clean Node 20 install and build above worked, and only the visualizer warning appeared.
- `npm run dev` (it fails on this machine with `spawn EBADF`).

## Options

1. **Do nothing.** The earlier report says most of the 36 do not reach the built site.
2. **Apply the lockfile-only fix as its own small PR** (the earlier report's recommendation). 36 becomes 19, and the checks above passed. Generate the lockfile once and commit it; do not re-run later and expect the same file. A yes is needed first (rule 8). Before it merges: CI green, the Netlify deploy preview builds and a few pages open by hand, then the screenshot comparison.
3. **Plan the Content 3 migration** for the 5 findings it would clear. That is a different, much larger task (it changes how every page reads its content); the other 14 findings have no fix even then.
