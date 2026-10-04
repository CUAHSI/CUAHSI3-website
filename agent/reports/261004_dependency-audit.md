# Dependency audit, 4 October 2026

Roadmap task 4b. Read-only: **no upgrade, no `npm audit fix` in the repository, no change to `package.json` or the lockfile.** Every fix test below ran on scratch copies of the two files under `.agent/`. Written on branch `task/dependency-audit`, cut from `main` at `2ae92b5`.

## Short answer

`npm audit` still reports **36 findings** (4 critical, 25 high, 3 moderate, 4 low), the same as on 3 October. They are 36 *packages*, not 36 separate problems: underneath are 70 advisory entries covering **54 distinct advisory IDs**, and **only 21 of the 36 packages carry advisories of their own**; the other 15 are flagged only because they depend on one that does.

- **Reach the visitor's browser: 3 of 36** (`nuxt`, `@nuxt/content`, `devalue`).
- **Run during `nuxt generate` and process our own files: 23 of 36.** Nothing here handles outside input at build time, except possibly markdown (see "What actually matters").
- **Never loaded in a full build and not in the browser bundle: 10 of 36.**
- **Fixable without changing `package.json`: 17 of 36** (a lockfile-only `npm audit fix` in a scratch copy resolved them, and Nuxt stays on 3.x).
- **Need a major bump that leaves Content v2: 5 of 36** (`@nuxt/content` 2 to 3, per npm's own suggestion `@nuxt/content@3.16.1`).
- **No fix exists yet: 14 of 36**, all resting on two packages whose newest published versions are still vulnerable (`node-forge` 1.4.0, `braces` 3.0.3).

The scariest-sounding items are the least relevant here: the critical `@nuxt/devtools` hole is development-mode only and has an in-range fix; the three `@nuxtjs/mdc` advisories (one critical) concern *markdown authored by someone else*; our markdown is written in this repository, though two limits apply (see below): I read only one of the three in full, and I did not trace whether outside text reaches the markdown parser.

## What I did and did not do

- Read: `npm audit --json` (36 findings, 70 advisory entries), `package-lock.json`, the built site in `.output/public`.
- Opened in full (via `gh api /advisories/<id>`, full description and patched versions): **8 advisories**: GHSA-279x-mwfv-vcqv (`@nuxt/devtools`), GHSA-cj6r-rrr9-fg82 (`@nuxtjs/mdc`, the one the roadmap names), GHSA-934w-87qh-qr26 and GHSA-9473-5f9j-94wq (`nuxt`), GHSA-j22f-vq7h-c4qm (`devalue`), GHSA-g5xx-pwrp-g3fv (`unhead`), GHSA-86w9-cpqp-85rv (`node-forge`), GHSA-vfj7-8cjw-p6xm (`braces`). The other 46 of the 54 advisory IDs I know only from their title, severity and affected range as `npm audit` prints them. I have **not** read them, and any statement below about them is from the title.
- Ran a **full production build** (`npm run build:search`) with a module-loading trace, to see which of the 36 packages are ever loaded. "Loaded" is not "used" (a package can be imported and never called), and the trace sees ES-module and `require` resolution but may miss anything loaded by other means; so "not loaded" is strong evidence and "loaded" is weak.
- Did **not** build or test the site with any fixed dependency tree.

## How I decided "does it end up in the built site" (question a)

Three groups, with the evidence for each:

1. **In the visitor's browser (3):** distinctive string literals from the package's own source were found in the built client JavaScript (`.output/public/_nuxt/*.js`, 79 files, 505 KB): `nuxt` (18 matches, for example `[nuxt] [useAsyncData] key must be a string.`), `@nuxt/content` (6, for example `useContent is only accessible when you are using documentDriven`), `devalue` (3, including `Cannot parse an object with a __proto__ property`: the *parse* half ships; the advisories I read are about its *stringify/uneval* half, which runs at build time). Controls: `vue` and `vue-router` match (8 and 16); `rollup`, a build-only tool, matches 0 of 318.
2. **Loaded during the build, output shipped, inputs are our files (23):** the package was loaded during a full build (trace), and its literals are not in the browser bundle (or matches were generic strings: a handful of two-word coincidences such as CSS property names for `svgo`, which I looked at and discarded). This group includes the whole bundler and prerender chain (`vite`, `esbuild`, `nitropack`, `@nuxt/vite-builder`, `postcss`, `tailwindcss`) and `@nuxtjs/mdc`, which turns markdown into the JSON that the site serves from `/api/_content/` (2.1 MB in the build). Several in this group are loaded merely because something imports them (for example `@nuxt/devtools`, `@nuxt/cli`, `listhen`, `node-forge`): I did not show that `nuxt generate` calls them.
3. **Never loaded in a full build, not in the browser (10):** `@unhead/vue`, `@vueuse/head`, `unhead`, `chokidar`, `engine.io-client`, `launch-editor`, `shell-quote`, `socket.io-parser`, `tar`, `ws`. For the three `unhead` packages, there is additional evidence: they are declared by `@nuxt/content` in `package.json` but nothing in its `dist` imports `@vueuse/head`.

The trace matches by **installed path**. For `chokidar` and `ws` another copy of the same package name *is* loaded (chokidar 5.0.0 and `ws` 8.21.0 at the top level), but the flagged copies (chokidar 3.6.0 under `tailwindcss`, `ws` 8.20.1 under `engine.io-client`) are not; likewise a newer `unhead` 2.1.15 is loaded, not the flagged 1.11.20. The three tiers describe a **production build** (`nuxt generate`) only. `launch-editor`, `ws` and `shell-quote` are dev-server tooling that `npm run dev` does load, so "tier 3" does not mean they are unused by a developer.

Sample check (rule 12), three that ship and three that do not: **ship:** `nuxt`, `@nuxt/content`, `devalue` (their matching strings listed above). **do not ship:** `@nuxtjs/mdc` (0 of 49 source literals found in the browser bundle), `tar` (0 of 49, and never loaded), `ws` (0 of 69, never loaded). The test is weak for tiny packages (fewer than about 10 long literals: `braces`, `chokidar`, `fast-glob`, `micromatch`, `shell-quote`, `socket.io-parser`, `unhead`, `@unhead/vue`, `@vueuse/head`, `brace-expansion`); for those I rely on the build trace and the role of the package, and I say so in the table.

## What actually matters here (judgment, not measurement)

The site is static: Netlify serves the files in `.output/public`; there is no Nuxt/Nitro server running for visitors. That removes most of the server-side advisories by construction (route-rule middleware bypass, server-island prop parsing and CPU exhaustion, `devalue` serialising shared memory into a response). It does not remove the ones that need *input we do not control reaching the build or the browser*:

- **`@nuxtjs/mdc` (3 advisories, 1 critical, 2 high)** and **`unhead` (3, not used, see above).** GHSA-cj6r-rrr9-fg82: a markdown *author* can inject a `<base href>` element and load scripts from an outside origin. The installed `@nuxtjs/mdc` is 0.9.5. GHSA-cj6r is fixed in 0.17.2, but `npm audit` flags every version up to 0.22.0 (GHSA-mxm6-v9r6-r94c needs 0.22.1; the newest on npm is 0.23.2), and `unhead` up to 2.1.12 (needs 2.1.13). Our markdown is written in this repository, so exploitation needs a hostile edit to `content/` that passes review. I read only GHSA-cj6r in full; the critical one (GHSA-j82m-pc2v-2484, anchor links in parsed markdown) and GHSA-mxm6-v9r6-r94c (URL sanitiser) are described here only from their `npm audit` titles. The risk grows in Phase 2 when an agent writes content, and wherever outside text reaches markdown (the transcript fetcher `scripts/fetch-transcripts.mjs` writes data from YouTube into `content/cyberseminars/`; I did not trace whether any of it goes through the markdown parser).
- **`nuxt` (9 advisories of its own, 12 entries in npm's list counting the three packages it inherits from).** Two read in full: GHSA-934w-87qh-qr26 (`<NuxtLink>` accepts `javascript:` URLs when a link target is attacker-controlled): all 10 single-line `<NuxtLink :to="...">` bindings to a variable in `pages/` and `components/` (my grep did not see tags split over several lines) take their value from an array written in the source file (I read `pages/about/index.vue` lines 73 to 84 and `pages/contact/index.vue` line 27; for the others I counted literal entries in the arrays but did not read each one); none takes a query parameter or content field. GHSA-9473-5f9j-94wq (remote code execution via server islands): requires `vue.runtimeCompiler: true`, which is off by default and not set in `nuxt.config.ts`; no `.server.vue` component, `NuxtIsland` or `useHeadSafe` use exists in `pages/`, `components/` or `app.vue` (grep). Fix is in range (3.21.10 or newer; installed 3.21.6).
- **`@nuxt/devtools` (critical, GHSA-279x-mwfv-vcqv)**: per the advisory, development mode only, exploitable by anything that can reach the Vite HMR WebSocket of `npm run dev`. It is not a risk to the deployed site. It is a risk to the developer's own machine whenever `npm run dev` is running: the advisory says the WebSocket can be reached by any process on the same host and by a malicious website the developer has open in a browser (a browser can open that WebSocket cross-origin), so it does not need an untrusted network. Updating `@nuxt/devtools` (in range) closes it. Fix is in range (3.3.1).
- **`node-forge` (GHSA-86w9-cpqp-85rv) and `braces` (GHSA-vfj7-8cjw-p6xm)** are signature-forgery and stack-exhaustion bugs in code that only runs during development or while globbing our own file names. `node-forge` and `braces` have **no patched release**: the newest versions on npm today (1.4.0 and 3.0.3) are inside the vulnerable range.
- The rest are denial-of-service or path issues in build tooling (`tar`, `ws`, `postcss`, `vite`, `brace-expansion` and so on), reachable only by someone who can already give the build bad input or reach a dev server.

## Fixes (question b), with the tests I ran

All on scratch copies of `package.json` and `package-lock.json` in `.agent/`; the repository's two files were never modified (`git status` clean at the end).

- **Non-breaking `npm audit fix` (lockfile only):** 36 findings become **19**. The 17 that disappear are `@nuxt/devtools`, `baseline-browser-mapping`, `brace-expansion`, `browserslist`, `devalue`, `engine.io-client`, `esbuild`, `launch-editor`, `nanoid`, `postcss`, `postcss-selector-parser`, `shell-quote`, `socket.io-parser`, `svgo`, `tar`, `vite`, `ws`. It leaves `package.json` untouched, and moves `nuxt` from 3.21.6 to 3.21.11 (still Nuxt 3). The dry run reports 21 packages added, 28 removed and 192 changed in `package-lock.json`: a large change that has to be built and checked by the visual baseline and `verify.sh --build` before it is accepted. A second pass changed nothing.
- **What stays (19):**
  - *Needs Content v3 (5):* `@nuxt/content`, `@nuxtjs/mdc`, `unhead`, `@unhead/vue`, `@vueuse/head`. The newest Content 2.x is 2.13.4 (installed), it pins `@nuxtjs/mdc ^0.9.2` and `@vueuse/head ^2.0.0`, and the patched versions (`@nuxtjs/mdc` 0.22.1 or newer, `unhead` 2.1.13 or newer) are outside those ranges. **This is the one fix that leaves Content v2.**
  - *No fix exists yet, node-forge side (7):* `node-forge`, `listhen`, `nitropack`, `@nuxt/cli`, `@nuxt/nitro-server`, `@nuxt/vite-builder`, `nuxt`.
  - *No fix exists yet, braces side (7):* `braces`, `micromatch`, `chokidar`, `fast-glob`, `globby`, `tailwindcss`, `@nuxtjs/tailwindcss` (`@nuxtjs/tailwindcss` 6.14.0, the newest, depends on `tailwindcss ~3.4.17`).
- **What npm itself claims for the 14 'none' packages, and how I tested it.** For `node-forge` and `braces` no advisory lists a patched version (both advisories have `first_patched_version: null`) and `npm view` on 4 October shows the newest releases are `node-forge` 1.4.0 and `braces` 3.0.3, inside the vulnerable ranges. `npm audit` nevertheless prints a fix for some of the dependants: `fixAvailable: true` for `nuxt`, `@nuxt/cli`, `@nuxt/nitro-server`, `@nuxt/vite-builder`, `nitropack`, `fast-glob` and `globby` (but these stayed flagged after the real non-breaking run, so I treat that as unreliable); a major bump via `@nuxt/content@3.16.1` for `node-forge` and `listhen`; and a major bump via `@nuxtjs/tailwindcss` for `braces`, `chokidar`, `micromatch` and `tailwindcss` (4.0.3 in `audit.json`, 6.1.3 in the forced run: a *downgrade*). The tailwind route leaves **neither** Content v2 nor Nuxt 3 (it only swaps `@nuxtjs/tailwindcss`), and it does not clear the findings. I tested these claims only through the `--force` run below.
- **Do not run `npm audit fix --force`.** In a scratch copy it rewrote `@nuxt/content` from `^2.13.0` to `^3.16.1` (leaves Content v2) and **downgraded** `@nuxtjs/tailwindcss` from `^6.12.0` to `^6.1.3`, and still left 18 high findings, adding new ones (`defu`, `h3`, `@nuxt/postcss8`).
- Nothing in this audit moves the project off Nuxt 3. The only bump that leaves Content v2 is the Content 3 migration; it would be its own task and needs your approval (rule 8).

## Recommendation (for your decision, not done)

1. A separate small task: apply the lockfile-only fix (17 findings gone), run `verify.sh --build` and `npm run visual:compare`, and merge if both pass. No `package.json` change.
2. Leave the other 19 for now and record why: 14 have no patched release, and the 5 Content-v3 ones concern authored markdown, which is the Phase 2 question (Content v3 migration is already an open decision in the roadmap).
3. Re-run this audit when `node-forge` or `braces` publish fixes.

## The 36 findings

Columns: **In the site?** 1 = code in the visitor's browser; 2 = loaded during the build, output shipped; 3 = never loaded in a full build and not in the browser bundle. **Fix:** `in range` = gone after the lockfile-only fix; `Content v3` = needs the major bump; `none (...)` = no patched release of the named package. "own:" lists the advisories the package itself carries; "via" means it is flagged only because of the package(s) named. For `nuxt`, its own advisories are fixed by the in-range update (3.21.11); it stays flagged only through the `node-forge` chain, which is why its Fix column says none.

| # | Package | Sev. | Installed | Advisories (GHSA) or cause | Path from `package.json` | In the site? | Fix |
|---|---|---|---|---|---|---|---|
| 1 | `@nuxt/content` | critical | 2.13.4 | via @nuxtjs/mdc, @vueuse/head, listhen | @nuxt/content | 1 browser | Content v3 |
| 2 | `@nuxt/devtools` | critical | 3.2.4 | own: GHSA-279x-mwfv-vcqv | nuxt > @nuxt/devtools | 2 build | in range |
| 3 | `@nuxtjs/mdc` | critical | 0.9.5 | own: GHSA-cj6r-rrr9-fg82, GHSA-j82m-pc2v-2484, GHSA-mxm6-v9r6-r94c | @nuxt/content > @nuxtjs/mdc | 2 build | Content v3 |
| 4 | `tar` | critical | 7.5.15 | own: GHSA-23hp-3jrh-7fpw, GHSA-8x88-c5mf-7j5w, GHSA-gvwx-54wh-qm9j, GHSA-r292-9mhp-454m, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp | nuxt > @nuxt/nitro-server > nitropack > @vercel/nft > @mapbox/node-pre-gyp > tar | 3 not loaded | in range |
| 5 | `@nuxt/cli` | high | 3.35.2 | via listhen | nuxt > @nuxt/cli | 2 build | none (node-forge) |
| 6 | `@nuxt/nitro-server` | high | 3.21.6 | via nitropack | nuxt > @nuxt/nitro-server | 2 build | none (node-forge) |
| 7 | `@nuxt/vite-builder` | high | 3.21.6 | via nuxt | nuxt > @nuxt/vite-builder | 2 build | none (node-forge) |
| 8 | `@nuxtjs/tailwindcss` | high | 6.14.0 | via tailwindcss | @nuxtjs/tailwindcss | 2 build | none (braces) |
| 9 | `brace-expansion` | high | 1.1.15,2.1.1,5.0.6 | own: GHSA-3jxr-9vmj-r5cp, GHSA-6j4f-fj2g-mc7p, GHSA-mh99-v99m-4gvg, GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7, GHSA-rgw5-rvv9-x895 | nuxt > @nuxt/nitro-server > nitropack > archiver > archiver-utils > glob > minimatch > brace-expansion | 2 build | in range |
| 10 | `braces` | high | 3.0.3 | own: GHSA-vfj7-8cjw-p6xm | @nuxtjs/tailwindcss > tailwindcss > chokidar > braces | 2 build | none (braces) |
| 11 | `browserslist` | high | 4.28.2 | own: GHSA-73wf-gq98-2v4g, GHSA-c83g-rgw3-j3cx | @nuxtjs/tailwindcss > autoprefixer > browserslist | 2 build | in range |
| 12 | `chokidar` | high | 3.6.0 | via braces | @nuxtjs/tailwindcss > tailwindcss > chokidar | 3 not loaded | none (braces) |
| 13 | `devalue` | high | 5.8.1 | own: GHSA-4q55-j62x-fr9h, GHSA-9rgm-9g3h-6x36, GHSA-hx4r-w6wj-j8fg, GHSA-j22f-vq7h-c4qm, GHSA-mcm9-63f2-9j32, GHSA-wf3x-273g-mvxv, GHSA-x5rw-q4pp-hg5g | nuxt > devalue | 1 browser | in range |
| 14 | `engine.io-client` | high | 6.6.5 | via ws | @nuxt/content > socket.io-client > engine.io-client | 3 not loaded | in range |
| 15 | `fast-glob` | high | 3.3.3 | via micromatch | @nuxtjs/tailwindcss > tailwindcss > fast-glob | 2 build | none (braces) |
| 16 | `globby` | high | 16.2.0 | via fast-glob | nuxt > @nuxt/nitro-server > nitropack > globby | 2 build | none (braces) |
| 17 | `listhen` | high | 1.10.0 | via node-forge | @nuxt/content > listhen | 2 build | none (node-forge) |
| 18 | `micromatch` | high | 4.0.8 | via braces | @nuxtjs/tailwindcss > tailwindcss > micromatch | 2 build | none (braces) |
| 19 | `nanoid` | high | 3.3.12 | own: GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8 | @nuxtjs/tailwindcss > postcss > nanoid | 2 build | in range |
| 20 | `nitropack` | high | 2.13.4 | via globby, listhen | nuxt > @nuxt/nitro-server > nitropack | 2 build | none (node-forge) |
| 21 | `node-forge` | high | 1.4.0 | own: GHSA-86w9-cpqp-85rv | @nuxt/content > listhen > node-forge | 2 build | none (node-forge) |
| 22 | `nuxt` | high | 3.21.6 | own: GHSA-48hr-524c-v5w3, GHSA-534h-c3cw-v3h9, GHSA-934w-87qh-qr26, GHSA-9473-5f9j-94wq, GHSA-9pgf-384g-p7mv, GHSA-c9cv-mq2m-ppp3, GHSA-hxcr-hm88-mpq6, GHSA-m3q2-p4fw-w38m, GHSA-mm7m-92g8-7m47 | nuxt | 1 browser | none (node-forge) |
| 23 | `postcss` | high | 8.5.15 | own: GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849 | @nuxtjs/tailwindcss > postcss | 2 build | in range |
| 24 | `shell-quote` | high | 1.8.4 | own: GHSA-395f-4hp3-45gv | nuxt > @nuxt/devtools > launch-editor > shell-quote | 3 not loaded | in range |
| 25 | `socket.io-parser` | high | 4.2.6 | own: GHSA-2m8v-j782-fhvr | @nuxt/content > socket.io-client > socket.io-parser | 3 not loaded | in range |
| 26 | `svgo` | high | 4.0.1 | own: GHSA-2p49-hgcm-8545, GHSA-4vpr-x523-8j87, GHSA-w27v-7q3p-w38r | nuxt > @nuxt/vite-builder > cssnano > cssnano-preset-default > postcss-svgo > svgo | 2 build | in range |
| 27 | `tailwindcss` | high | 3.4.19 | via chokidar, fast-glob, micromatch | @nuxtjs/tailwindcss > tailwindcss | 2 build | none (braces) |
| 28 | `vite` | high | 7.3.3,8.0.14 | own: GHSA-fx2h-pf6j-xcff, GHSA-v6wh-96g9-6wx3 | nuxt > @nuxt/vite-builder > vite | 2 build | in range |
| 29 | `ws` | high | 8.20.1 | own: GHSA-96hv-2xvq-fx4p | @nuxt/content > socket.io-client > engine.io-client > ws | 3 not loaded | in range |
| 30 | `baseline-browser-mapping` | moderate | 2.10.32 | own: GHSA-w5vr-8v7q-w6rv | @nuxtjs/tailwindcss > autoprefixer > browserslist > baseline-browser-mapping | 2 build | in range |
| 31 | `launch-editor` | moderate | 2.14.0 | own: GHSA-v6wh-96g9-6wx3 | nuxt > @nuxt/devtools > launch-editor | 3 not loaded | in range |
| 32 | `unhead` | moderate | 1.11.20 | own: GHSA-5339-hvwr-7582, GHSA-95h2-gj7x-gx9w, GHSA-g5xx-pwrp-g3fv | @nuxt/content > @vueuse/head > @unhead/vue > unhead | 3 not loaded | Content v3 |
| 33 | `@unhead/vue` | low | 1.11.20 | via unhead | @nuxt/content > @vueuse/head > @unhead/vue | 3 not loaded | Content v3 |
| 34 | `@vueuse/head` | low | 2.0.0 | via @unhead/vue | @nuxt/content > @vueuse/head | 3 not loaded | Content v3 |
| 35 | `esbuild` | low | 0.27.7,0.28.0 | own: GHSA-g7r4-m6w7-qqqr | nuxt > @nuxt/vite-builder > vite > esbuild | 2 build | in range |
| 36 | `postcss-selector-parser` | low | 6.1.2,7.1.1 | own: GHSA-w9m9-85wc-3x92 | nuxt > @nuxt/vite-builder > cssnano > cssnano-preset-default > postcss-calc > postcss-selector-parser | 2 build | in range |

## Corrections to what I said earlier

- On 3 October the roadmap and my notes spoke of "36 findings" as if each was an independent problem. They are 36 packages over 54 distinct advisories, 21 of which carry advisories of their own.
- The lockfile's own `dev` flag is useless for deciding what ships: it marks 33 of these 36 as not dev-only, because `nuxt` is also required by packages listed under `dependencies`. I did not use it.

## Not checked

- Whether the lockfile-only fix builds and looks right (not built).
- The 46 advisory IDs I did not open in full, and which of the `nuxt` advisories apply to our configuration beyond the three I checked.
- Whether `@nuxt/content` parses any outside text (YouTube transcripts) as markdown.
- Whether the Netlify build image differs from this machine (Node version and install flags).
- Runtime behaviour in a browser: nothing here was run in a visitor's browser.
