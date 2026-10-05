# Is the site ready to move from Node 20 to Node 22? (4 October 2026)

> **Status (added when this report was committed):** Jordan decided not to change CI or Netlify yet; Node stays at 20.

Evidence only. **Nothing was changed**: moving Netlify and CI to Node 22 edits `netlify.toml` (`NODE_VERSION = "20"`, line 6) and `.github/workflows/verify.yml` (`node-version: 20`, line 23). `netlify.toml` is a rule-8 file; the workflow is not named in rule 8, but I would ask first all the same. This report is the evidence for that decision.

## Why look

- Node 20 is, as far as I know, scheduled to reach end of life at the end of April 2026 (the Node release schedule, nodejs.org/en/about/previous-releases). I could not check that from here; please treat it as a pointer, not a source.
- CI's `npm ci` printed `npm warn EBADENGINE` for `rollup-plugin-visualizer@7.0.1`, which declares `engines: >=22` (`package-lock.json`). `npm ls` shows it comes from Nuxt's own tree (`nuxt` > `@nuxt/nitro-server` > `nitropack`). The warning is in the CI logs of PR #31 and PR #38 (CI ran Node 20.20.2 and npm 10.8.2 there).
- ESLint 10.12.0 declares `engines: ^20.19.0 || ^22.13.0 || >=24`. Node 20.20.2 and Node 22.23.3 both meet it. (`setup-node` with `node-version: 20` takes the newest 20.x, so 20.20.2 is a point in time, not a pin.)

## What I ran (4 October 2026, on one Mac, commit `caa156a` of the default branch, Node 20.20.2 and 22.23.3 started side by side)

1. A full `npm run build:search` under **Node 22.23.3** and another under **Node 20.20.2**. Both exited successfully. Both print the same two Nuxt Content warnings about JSON arrays, the same robots.txt "blocking indexing" notice, and the same line `[nuxt-site-config] ERROR The @nuxtjs/sitemap module requires a site.url to be set`. That ERROR line is printed and the build still finishes with success; it is also in my earlier local builds (local logs, not in the repo), so it is not new and not caused by the Node version.
2. A comparison of the two builds:
   - **File lists:** 624 files each. 146 file names differ on each side; they are hashed names of the JavaScript and CSS bundles (the hash changes between builds).
   - **Visible text:** identical on all 121 pages.
   - **Computed style of every element** (`scripts/style-compare.mjs`, 121 pages at 390 and 1280px, in Chromium): **39,927 elements, 0 differ.** Note this compares two builds of the same code; builds of identical code are not byte-identical here (known), so it shows no sign of a difference, not proof of none.
   - **Search index** (Pagefind): 15 files and 107 fragments on both sides.
3. A **clean `npm ci` under Node 22.23.3** in a fresh checkout of that commit: succeeded (723 packages installed). I read only the tail of its output, so I did not confirm that the engine warning is absent.
4. `./scripts/verify.sh` in that fresh checkout under Node 22: **0 FAIL, 2 WARN** (the content validator's known failures and the `throw createError` check, the same two as under Node 20). ESLint ran: no problems.

## What this does not show

- **Netlify's real build.** I cannot see Netlify. It resolves `"22"` to its own latest 22.x (there is no `.nvmrc` or `.node-version` in the repo), which must still be 22.13 or later for ESLint, and it has its own npm version. A dashboard value for `NODE_VERSION` would be overridden by `netlify.toml`, but I cannot see the dashboard. The deploy preview of the PR that changes `NODE_VERSION` is the real test; its log header shows the Node and npm versions actually used.
- **npm version.** Both of my Node runs used npm 11.12.1 (the npm on my machine's path), not the npm that ships with Node (10.8.2 with Node 20.20.2 in CI). `npm ci` can behave differently across npm majors. I did not test npm 10.
- **Pagefind on Linux.** My builds used the macOS binary (`@pagefind/darwin-arm64`, pagefind 1.5.2). CI and Netlify use a Linux binary, which these runs did not exercise.
- **CI on Linux under Node 22.** `verify.sh --build` on ubuntu-latest with Node 22 is untested; only a PR that changes `verify.yml` tests it.
- **`npm run visual:compare` under Node 22** was not run (the screenshots come from the browser, not Node; Playwright's own Node requirement was not checked). `npm run dev` (it fails on this machine with `spawn EBADF`) was not retested.
- Anything that runs only at runtime: the site is static, so I do not expect any.

## If Jordan says yes

One small PR: `NODE_VERSION = "22"` in `netlify.toml` and `node-version: 22` in `.github/workflows/verify.yml` (the comment "same as netlify.toml" stays true), nothing else. Check: CI passes on Linux, the Netlify deploy preview builds and shows the same pages, and its build log shows Node 22.x with no engine warnings. Rolling back is the same two lines (if a deploy has already gone out, that is a separate Netlify action).
