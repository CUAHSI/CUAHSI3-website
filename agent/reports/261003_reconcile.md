# Reconcile report, 261003
Commit examined: f4360d7 (main), examined on branch task/reconcile. No code or content changed.

## Summary
4 of 7 checks confirmed; 3 not as described; 0 could not determine.

The findings that matter most:
1. **`SiteSearch` does not exist.** `components/AppHeader.vue:58` renders `<SiteSearch />`, but no `SiteSearch.vue` exists anywhere in the repo (checked with `find` and `git ls-files`). The built homepage contains no search markup. The `build:search` script and the `/pagefind` output exist, but the header search box is missing. This looks like a file lost in transit.
2. **`verify.sh` FAILs on a clean `main`-equivalent tree, and one of its two FAILs is a false alarm.** The apostrophe check flags 231 lines in 21 files, all of the form `style="font:700 22px 'Schibsted Grotesk'..."`. The build succeeds with all of them, so footgun 3 as written in `CLAUDE.md` is broader than the real failure. The other FAIL is real: an inline `grid-template-columns` at `pages/community/news/index.vue:67`.
3. **3 of 4 `impactTag` strips on `/data-platforms` are empty.** `hydroshare` matches 4 research entries; `jupyterhub`, `water-data-services` and `matlab` match 0.

Also: `pages/community/index.vue:15` queries `news` with no `/news/` filter (footgun 1, unguarded). `cuahsi-site/` is a stale duplicate of the site, and 3 stray junk files/dirs are tracked in git.

## Part A

### 1. News filter: confirmed (with one extra finding)
- `pages/community/news/index.vue:15`: `(allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))`. Confirmed.
- `pages/community/news/[slug].vue:11`: `!item.value || !item.value._path?.startsWith('/news/')`, and `.findOne().catch(() => null)` at lines 4-8. Confirmed.
- Homepage `pages/index.vue` queries only `research`, `events`, `cyberseminars` (lines 11, 16, 25). No `queryContent('news')`. Confirmed.
- **Not covered by the check, found anyway:** `pages/community/index.vue:15-20` runs `queryContent('news').where({published:true}).sort({date:-1}).limit(3).find()` with no prefix filter. `verify.sh` also WARNs on this. Whether newsletter issues actually appear in its "latest news" list I could not determine: the built `.output/public/community/index.html` contains no `/community/news/<slug>` links at all, only `/community/newsletter/2026-july` once. I did not look at why.

### 2. Header: confirmed
- `components/AppHeader.vue:3-9`: `navItems` is exactly About, Data & Computing, Learn & Train, Community, Hire CUAHSI.
- Hamburger: `<button class="md:hidden ...">` (about line 70) toggles `mobileOpen`; the panel is `v-if="mobileOpen" class="md:hidden"`. Desktop nav is `hidden md:flex`. Confirmed.
- Separate problem: line 58 uses `<SiteSearch />`, which does not exist (see Summary 1). `cuahsi-site/components/AppHeader.vue:57` has the same reference.

### 3. Filename migration: not as described
Pattern tested: `^[0-9]{6}-[a-z0-9-]+\.md$` on `ls content/<dir>`.

| Collection | Non-matching | Notes |
|---|---|---|
| newsletter | 0 of 7 | |
| events | 0 of 27 | |
| news | 0 of 12 | |
| jobs | 0 of 29 | |
| cyberseminars | 15 of 15 `.md` files | Names are `YYYY-...`. The 16th entry is the `transcripts/` directory (7 `.json` files). |
| research | 28 of 31 | Names are `YYYY-...`. Only 260601-data-publishing-cohort-spring, 260601-open-hydrology-textbook and 260701-hydrolearn-ciroh-hackathon match. |

Cyberseminars and research were not migrated. Content is frozen, so this is reported only.

### 4. impactTag values: not as described
Code: `pages/data-platforms/index.vue:12` does `h.tags?.includes(impactTag)`, an exact, case-sensitive match against the `tags` frontmatter key. The four impactTags (lines 19, 29, 39, 50) are `hydroshare`, `jupyterhub`, `water-data-services`, `matlab`.

Parsed with PyYAML over `content/research/*.md` (31 files; 29 parse, 2 do not, see Part B): 94 distinct tags.

| impactTag | Research entries with it |
|---|---|
| `hydroshare` | 4 of 31 |
| `jupyterhub` | 0 of 31 |
| `water-data-services` | 0 of 31 |
| `matlab` | 0 of 31 |

Related: `HydroShare` (capital H) appears on 8 entries and does not match. So 3 strips render empty, and a fourth shows 4 entries where 12 mention HydroShare in some case.

### 5. Stale route: confirmed
`pages/programs/` does not exist (`ls` error). The only `/programs` strings in `pages/`, `components/`, `composables/`, `app.vue` and `content/` are `/learn-train/programs/...` (`pages/learn-train/index.vue:64`).

### 6. Global CSS: confirmed
- `assets/css/global.css` exists. `nuxt.config.ts` has `css: ['~/assets/css/global.css']`.
- Rules (lines 65-71):
  ```css
  .rgrid { display: grid; grid-template-columns: 1fr; gap: var(--rgap, 18px); }
  @media (min-width: 640px) { .rgrid.rgrid-multi { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px) { .rgrid.rgrid-multi, .rgrid.rgrid-split { grid-template-columns: var(--cols); } }
  ```
  The 900px rule uses the compound selector. Matches `CLAUDE.md`.
- Not in `CLAUDE.md`: legacy `.rg-2/.rg-3/.rg-4/.rg-hero/.rg-featured/.rg-sidebar/.rg-intro` classes (lines 33-48) with `max-width` media queries. They are still used in 9 class attributes (hire-cuahsi 4, member-portal 2, membership 1, contact 1, data-platforms 1).

### 7. Build: not as described
`./scripts/verify.sh --build` exited 1: **2 FAIL, 3 WARN**; the build itself passed (379 routes prerendered, Pagefind indexed 107 pages).

FAIL:
- Apostrophe inside static style attribute: 231 lines in 21 files (largest: pages/index.vue 37, hire-cuahsi 32, about/index 23, learn-train/index 19). Every line I read is a font-family quote. The build is clean, so this check is a false positive as written.
- `grid-template-columns` in a style attribute: `pages/community/news/index.vue:67` (`display:grid;grid-template-columns:1fr 1fr;gap:12px`). Real.

WARN:
- `pages/community/index.vue` queries `news` without the `/news/` filter.
- `findOne()` with no `.catch`: `about/team/index.vue:4`, `about/team/[slug].vue:5`, `community/index.vue:27`, `community/newsletter/[slug].vue:5` and `:18`, `community/events/[slug].vue:5`.
- `throw createError` in a page: `community/newsletter/[slug].vue:8`, `community/events/[slug].vue:8`.

Build output (not verify.sh):
- 3 prerender 404s ("Document not found") from `/about/team/irene-garousi-nejad`, `/about/team/lindsay-platt` and `/about/team/danielle-tijerina-kreuzer`. Those pages are built but their profile content query finds no `.md` (`content/team/` has 8 `.md` files; these three people are only in `full-team.json`).
- `JSON array is not supported` for `content:members:reps.json` and `content:team:full-team.json` (footgun 7, handled in code).
- `@nuxtjs/sitemap` ERROR: no `site.url` set.
- `robots.txt` WARN: blocks indexing and was moved to `_robots.txt` by the module.
- Pagefind: "Did not find a data-pagefind-body element"; it fell back to indexing 107 pages.

## Part B

### Routes
Files under `pages/` (28 tracked `.vue`) map to the expected tree with these differences. I compared file paths to the expected list by eye; I did not diff them with a script.
- Expected, present: every route in the expected tree has a file, including `/highlights` and `/highlights/[slug]` as stubs.
- In the tree but not in the page tree: none.
- In the page tree but missing: none.
- `.DS_Store` files sit under `pages/` and `pages/community/` on disk; none are tracked.
- Note: `pages/learn-train/programs/[slug].vue` exists and `content/programs/README.md` says "No rendering page yet". The README is out of date.

### Components
| File | Bytes | Used by |
|---|---|---|
| AppFooter.vue | 4592 | app.vue |
| AppHeader.vue | 5179 | app.vue |
| CommunityHero.vue | 1941 | **nothing** (0 uses found by `git grep "<CommunityHero"`) |
| StatsBand.vue | 1180 | about/impact/index, data-platforms, index, learn-train/index |
| SiteSearch.vue | n/a | **does not exist**, referenced by AppHeader |

`CommunityHero.vue` exists and is unused. Pages under `/community/*` do not use it.

### queryContent calls
33 calls across 19 files (`git grep -o 'queryContent('`). Prefix collisions are possible only for `news` (matches `/newsletter/`). Other pairs checked by directory names in `content/`: `events`, `research`, `jobs`, `team`, `programs`, `cyberseminars`, `members/reps`, `newsletter`: no other directory name is a prefix of another. `team` and `members/reps` are fine.

| Collision risk | File:line | Filtered? |
|---|---|---|
| `news` | pages/community/news/index.vue:8 | yes (line 15) |
| `news` | pages/community/news/[slug].vue:4 | yes (line 11) |
| `news` | pages/community/index.vue:15 | **no** |

### Inline styles
Total `style="` attributes across `pages/`, `components/`, `app.vue`: **994**, in 31 of 33 files (the two `highlights` stubs have 0). Elements with class `rgrid`: **39**, in 20 files. Per-file counts (style= / rgrid class attributes where rgrid-substring count in brackets):

- Highest: pages/index.vue 91 style / 12 rgrid substrings; pages/community/index.vue 90 / 6; pages/community/campus-visits 70 / 10; pages/community/events/[slug] 63 / 4; pages/about/index 54 / 8; pages/hire-cuahsi 54 / 0.
- `rgrid` substring counts count `rgrid`, `rgrid-multi` and `rgrid-split` separately, so each element counts about twice. Use the 39 for task 4's denominator, not the column sum.
- 0 rgrid and still grids: hire-cuahsi, membership, contact, member-portal, news pages, community/newsletter/index. These use legacy `.rg-*` (9) or none.
- Inline `grid-template-columns` in a `style="..."`: 1 (community/news/index.vue:67).

### `<component :is>`
0 uses (`git grep "<component"` and `:is=`). Footgun 2 has no live instances.

### `v-for` over elements containing `<img>`
My scan looked for `<img` within 6 lines of a `v-for`. One hit: `pages/learn-train/cyberseminars/index.vue:48`, key `s.slug`, one keyed `div` per iteration. Team cards were not flagged by this scan (they may use a different structure or a larger gap); I did not open them, so footgun 4 is not cleared for `pages/about/team/index.vue`.

### Content
| Collection | Files | Notes |
|---|---|---|
| board | 2 | 1 `.md` with frontmatter + README.md |
| community | 5 | 4 profiles + README.md |
| cyberseminars | 22 | 15 `.md` + 7 transcript `.json` |
| events | 27 | |
| jobs | 29 | |
| members | 1 | `reps.json` |
| news | 12 | |
| newsletter | 7 | |
| programs | 5 | 4 + README.md |
| research | 31 | |
| team | 9 | 8 `.md` + `full-team.json` |

Frontmatter keys in use (parsed with PyYAML; README.md files and unparseable files excluded from denominators where noted):
- **events (27):** title/slug/type/audience/start/timezone/location/description/tags/newsletter_source/published 27; end 23; registration 15; featured 13.
- **jobs (29):** title/slug/organization/location/type/posted/deadline/url/tags/published 29; source 23.
- **news (12):** title/slug/date/excerpt/tags/published 12; source_url 6; author 1.
- **newsletter (7):** title/date/slug/summary/topics/people_mentioned/programs_mentioned/mailchimp_id/mailchimp_url/published 7.
- **cyberseminars (15):** title/slug/series/series_slug/date/youtube_id/speakers/speaker_orgs/tags/published/description 15; has_transcript 12.
- **research (29 parse of 31):** title/slug/date/year/category/tags/published/excerpt 29; funding 27; partners 26; people_mentioned 26.
- **programs (4 + README):** title/slug/audience/tags/published 4; abbreviation, status, frequency, season, contact, partners, funding, excerpt 3; type, description, next_date, location, apply_url, featured 1.
- **team (8 `.md`):** name/slug/role/department/published 8; bio 6.
- **board / community:** 1 and 4 profiles respectively with name, slug, role, institution, title, bio, published (+ elected / type).

**Two research files fail strict YAML** (`2025-datacite-migration.md`, `2025-hydrocare-ndistem.md`): unquoted `: ` inside the `excerpt` at line 12. PyYAML rejects them. The site still builds pages for both (`/about/impact/datacite-doi-migration-2025/` and `/about/impact/hydrocare-ndistem-2025/` exist, and the first has the right `<title>`). I did not determine what Nuxt Content stored for their excerpt/meta description (the built datacite page has no `<meta name="description">`).

Not compared against `agent/content-model.md` in this pass: I did not open it. The documented-versus-used comparison for task 2 is **not done**. Task 2 needs it.

### Tooling
- ESLint: none (no config file, not in `package.json`). Prettier: none. Test runner: none. Playwright/Vitest config: none.
- CI: no `.github/workflows/` (only `pull_request_template.md`).
- `content.config.ts`: absent. `netlify.toml`: present (`npm run generate`, Node 20, noindex header, one redirect `/archive`). `.gitignore` has `.agent/`.
- Versions: Nuxt 3.21.6, Nitro 2.13.4, Vite 7.3.3, Vue 3.5.35, `@nuxt/content` 2.13.4 (lockfile). `package.json` says `nuxt ^3.12.0`, `@nuxt/content ^2.13.0`. Node 20 in `netlify.toml`; local Node is v26.0.0.
- `server/api/newsletter-redirect.ts` exists (not examined; Netlify preset is static).
- Stray items at the repo root, checked with `git ls-files`: `cuahsi-site/` (30 tracked files, a stale copy of the site with its own `pages/`, `components/`, `nuxt.config.ts`); `ges/services   # old route, now superseded by hire-cuahsi` (tracked, 21 KB, a filename with a comment in it); `uxt .output node_modules/.vite` (tracked); `dist` (tracked as a symlink to `.output/public`, despite `dist/` in `.gitignore`). Also an empty directory named `{pages,components,composables,public}` at the root and inside `cuahsi-site/`, which git cannot track. These look like shell-typo artifacts. `.DS_Store` files: 0 tracked.

## Part C. Corrections proposed
Not applied.

1. **CLAUDE.md, footgun 3.** Says an apostrophe inside a static `style` attribute crashes the Vue compiler. 231 such lines build fine. Proposed: "`style="content:'x'"` (an apostrophe in a CSS string value) crashes... font-family names in single quotes are fine." Needs Jordan's confirmation; I have not reproduced the original crash.
2. **`scripts/verify.sh` apostrophe check** flags all font-family quotes. Fix the pattern (task of its own); until then `verify.sh` can never pass, so "Run before every commit; every FAIL must be fixed" cannot be followed as written.
3. **CLAUDE.md, Layout section.** Add the legacy `.rg-*` classes (9 live uses) or list them as a task-4 item.
4. **CLAUDE.md, header/search.** Anything claiming search works on the built site (`Search does not work here`, `build:search`) is only half true: the Pagefind index builds but there is no search UI component.
5. **`content/programs/README.md`** says no rendering page yet. `pages/learn-train/programs/[slug].vue` exists. (Content file; reported only. Likewise the `board` and `community` READMEs I did not verify against pages.)
6. **CLAUDE.md "44 grids in 20 files"** describes the original failure. Current count: 39 `rgrid` elements in 20 files, plus 1 inline grid and 9 `.rg-*` uses.
7. **agent/reconcile.md, Part A.3** asks about `YYMMDD-slug.md` for cyberseminars and research; neither uses it. The roadmap and content model should say these are un-migrated.

I did not open `agent/content-model.md` or check it against content (see Part B, Content), so no corrections to it are proposed yet.

## Proposed fix tasks (smallest first; Jordan decides)
1. Restore or rebuild `SiteSearch.vue` (needs the original or a new component; touches components, no dependency change).
2. Fix `verify.sh`'s apostrophe check so it stops flagging font-family quotes (script only).
3. Move `news/index.vue:67`'s inline grid onto `rgrid` (one line).
4. Add the `/news/` filter and `.catch` to `pages/community/index.vue` (footgun 1 and 5; also the other five `findOne()` WARNs).
5. Decide the `impactTag` strips: change the tags in code to values that exist, or add matching tags in content (content change; needs Phase 2).
6. Remove stray repo items: `cuahsi-site/`, `ges/`, `uxt .output node_modules/`, `{pages,...}/` (deletion; rule 8 applies).
7. Rename cyberseminars and research files to `YYMMDD-slug.md` (content change; slugs drive URLs so URLs would not change; Phase 2).
8. Quote the `excerpt` in the 2 research files (content change; Phase 2).
9. Delete or use `CommunityHero.vue` (unused).
10. Resolve the 3 team-profile 404s (content or code).
11. Set `site.url` for the sitemap (touches `nuxt.config.ts`; rule 8).

## Sample
Opened in full or by targeted lines to confirm bulk counts (rule 12):
- Affected: `content/research/2025-datacite-migration.md` (YAML error at line 12), `content/cyberseminars/2025-usgs-water-data-apis.md` (non-conforming name), `pages/index.vue` lines 56-72 (apostrophe FAIL lines, from the log).
- Unaffected: `content/events/260101-earthscope-geophysics.md`, `content/jobs/260401-icprb-spill-fellow.md`, `content/news/260423-jupyterhub-incident.md` (all conform, first 4 lines read).
- Not done: the intended `content/cyberseminars/2025-fair4rs.md` does not exist (a wrong guess of mine; `head` errored). I did not open any `.vue` file in full besides `AppHeader.vue`, `nuxt.config.ts`, and parts of the news and community pages. The per-file style counts are `grep` counts, not hand-read.
