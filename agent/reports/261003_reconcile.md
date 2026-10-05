# Reconcile report, 261003
Commit examined: f4360d7 (main), examined on branch task/reconcile. No code or content changed.

## Summary
4 of 7 checks confirmed; 3 not as described; 0 could not determine.

The findings that matter most:
1. **`SiteSearch` does not exist.** `components/AppHeader.vue:58` renders `<SiteSearch />`, but no `SiteSearch.vue` exists anywhere in the repo (checked with `find` and `git ls-files`). The built homepage contains no search markup. The `build:search` script and the `/pagefind` output exist, but the header search box is missing. This looks like a file lost in transit.
2. **`verify.sh` FAILs on a clean `main`-equivalent tree, and one of its two FAILs is a false alarm.** The apostrophe check flags 231 lines in 21 files, all of the form `style="font:700 22px 'Schibsted Grotesk'..."`. The build succeeds with all of them, so footgun 3 as written in `CLAUDE.md` is broader than the real failure. The other FAIL is real: an inline `grid-template-columns` at `pages/community/news/index.vue:67`.
3. **3 of 4 `impactTag` strips on `/data-platforms` are empty.** `hydroshare` matches 4 research entries; `jupyterhub`, `water-data-services` and `matlab` match 0.

Footgun 4 (`<img>` reuse in `v-for`) is **not cleared repo-wide**: my scan window (6 lines) missed the team cards, I read only `pages/about/team/index.vue` in full (keys present) and did not re-run a wider scan.

Also: `pages/community/index.vue:15` queries `news` with no `/news/` filter (footgun 1, unguarded). `cuahsi-site/` is a stale duplicate of the site, and 4 stray items (`cuahsi-site/`, `ges/services...`, `uxt .output node_modules/.vite`, the `dist` symlink) are tracked in git.

## Part A

### 1. News filter: confirmed (with one extra finding)
- `pages/community/news/index.vue:15`: `(allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))`. Confirmed.
- `pages/community/news/[slug].vue:11`: `!item.value || !item.value._path?.startsWith('/news/')`, and `.findOne().catch(() => null)` at lines 4-8. Confirmed.
- Homepage `pages/index.vue` queries only `research`, `events`, `cyberseminars` (lines 11, 16, 25). No `queryContent('news')`. Confirmed.
- **Not covered by the check, found anyway:** `pages/community/index.vue:15-20` runs `queryContent('news').where({published:true}).sort({date:-1}).limit(3).find()` with no prefix filter. `verify.sh` also WARNs on this. Whether newsletter issues actually appear in its "latest news" list I could not determine: the built `.output/public/community/index.html` contains no `/community/news/<slug>` links at all, only `/community/newsletter/2026-july` once. I did not look at why.

### 2. Header: confirmed
- `components/AppHeader.vue:3-9`: `navItems` is exactly About, Data & Computing, Learn & Train, Community, Hire CUAHSI.
- Hamburger: `<button class="md:hidden ...">` (`components/AppHeader.vue:67`) toggles `mobileOpen`; the panel is `v-if="mobileOpen" class="md:hidden"` (line 75). Desktop nav is `hidden md:flex`. Confirmed.
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
The full file-to-route listing is Appendix B (28 tracked `.vue` files). I compared it to the expected tree by eye, not with a script.
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
33 calls across 19 files; every call is listed in Appendix C (file, line, collection, collision). Prefix collisions are possible only for `news` (matches `/newsletter/`). Other pairs checked by directory names in `content/`: `events`, `research`, `jobs`, `team`, `programs`, `cyberseminars`, `members/reps`, `newsletter`: no other directory name is a prefix of another. `team` and `members/reps` are fine.

| Collision risk | File:line | Filtered? |
|---|---|---|
| `news` | pages/community/news/index.vue:8 | yes (line 15) |
| `news` | pages/community/news/[slug].vue:4 | yes (line 11) |
| `news` | pages/community/index.vue:15 | **no** |

### Inline styles
Total `style="` attributes across `pages/`, `components/`, `app.vue`: **994**, in 31 of 33 files (the two `highlights` stubs have 0). That is **953 static `style="` plus 41 bound `:style="`** (`grep -oE '[[:space:]]style="'` and `grep -oE ':style="'`; they sum to 994). The first version of this report did not separate them. Task 4's denominator is 953 static + 41 bound. Elements with class `rgrid`: **39**, in 20 files. Per-file counts (style= / rgrid class attributes where rgrid-substring count in brackets):

- Per-file table: Appendix A (all 33 files; static, bound, `rgrid` element, `rgrid-multi`, `rgrid-split` and legacy `rg-*` counts). Totals there: 953 static, 41 bound, 39 `rgrid` elements (16 multi, 23 split), 9 legacy `rg-*`.
- Inline `grid-template-columns` in a `style="..."`: 1 (community/news/index.vue:67).

### `<component :is>`
0 uses (`git grep "<component"` and `:is=`). Footgun 2 has no live instances.

### `v-for` over elements containing `<img>`
My scan looked for `<img` within 6 lines of a `v-for`. One hit: `pages/learn-train/cyberseminars/index.vue:48`, key `s.slug`, one keyed `div` per iteration. The scan **missed the team cards** (`v-for` at line 36, `<img>` at line 43, 7 lines apart). I then read `pages/about/team/index.vue` in full: the card `div` is keyed `person.slug` (line 36) and the `<img>` carries `:key="img-${person.slug}"` (line 44). Within each card a `v-if`/`v-else` swaps the `<img>` for an initials `div` when `photo` is null; that is inside one card, not across list items. The scan window needs widening before it is trusted for other files; other `v-for`/`<img>` pairs further apart than 6 lines were not looked for.

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

#### Documented (`agent/content-model.md`) versus used

Method: PyYAML over every `.md` except the README files; JSON read with `json`. "Absent" means the key is missing, not null. Denominators are per collection.

| Collection | Documented, matches the files | Documented, not as described | Used, undocumented |
|---|---|---|---|
| newsletter (7) | All 10 keys, 7 of 7 | none | none |
| events (27) | 11 keys 27 of 27; `location` is a mapping 27 of 27 (`mode` 27, `city` 11, `url` 11); `audience` is a list 27 of 27; every `newsletter_source` value is a real newsletter slug | `end` absent in 4, `featured` absent in 14, `registration` absent in 12 (so it is optional, not always present); `type: field` is allowed but used 0 times (used: workshop 8, conference 8, deadline 6, webinar 4, webinar-series 1); `timezone: ET or null` but 9 distinct values (`America/New_York` 10, null 5, `ET` 3, `America/Chicago` 3, `MT` 2, and 4 others once each); `registration` mapping holds `required` 15, `cost` 15, `url` 12 | none |
| research (31) | `category` values: all 5 documented values used (training 9, data-infrastructure 6, research 5, community 5, cyberinfrastructure 4); keys as listed | 2 of 31 files do not parse (Part A.4); `funding` 27 of 29, `partners` 26 of 29, `people_mentioned` 26 of 29, so optional in practice; `people_mentioned` is documented as team slugs, but 8 distinct values are not in `full-team.json` (`masoumeh-hashemi`, `marco-maneta`, `punwath-prum`, `tao-wen`, `moses-kiwanuka`, `aashish-gautam`, `hassan-saleh`, `heather-kropp`; 5 of them equal the filenames of profiles in `content/board/` and `content/community/`, the other 3 (`masoumeh-hashemi`, `marco-maneta`, `punwath-prum`) match no profile file; I compared filenames, not `slug` frontmatter) | none |
| news (12) | All documented keys; `source_url` 6 of 12 (documented optional) | none | `author`, 1 of 12 |
| jobs (29) | All keys; `type` uses exactly the 6 documented values (permanent 12, graduate-assistantship 7, post-doc 6, fellowship 2, internship 1, faculty 1); `deadline` null in 14 of 29; `source` values `joshswaterjobs` 19 and `newsletter` 4 as documented | `source` absent in 6 of 29 | none |
| cyberseminars (15) | All keys; `youtube_id` empty in 2 of 15 | `has_transcript` absent in 3 of 15 (true 7, false 5); filenames not `YYMMDD` (Part A.3) | a `transcripts/` directory of 7 `.json` files |
| programs (4 + README) | Documented 3 files (virtual-university, snow-field-school, summer-institute) match the documented schema: 13 keys each | The model says "the three flagship recurring programs"; there are 4 files | `watersofthack.md` uses a different schema: `type`, `description`, `next_date`, `location`, `apply_url`, `featured` (each 1 of 4), and none of `abbreviation`, `status`, `frequency`, `season`, `contact`, `partners`, `funding`, `excerpt` |
| team/full-team.json | 22 entries; all 10 documented keys present 22 of 22; `department` uses exactly the 6 documented values (Leadership 5, Research 5, Programs 4, Operations 4, Engineering 3, Communications 1); `links` keys are the 4 documented (github 9, orcid 6, google_scholar 4, linkedin 3); `photo` null in 1 of 22; `has_profile` true in 6 | 3 of the 6 `has_profile: true` people (`lindsay-platt`, `irene-garousi-nejad`, `danielle-tijerina-kreuzer`) have no `content/team/*.md` | none |
| team/*.md (8) | `bio` in 6 of 8 | The model says not to duplicate the bio in the `.md`; I did not check whether the 6 `.md` bios duplicate `full-team.json` or whether the page renders both | `.md` frontmatter repeats `name`, `slug`, `role`, `department`, `published` (8 of 8) |
| members/reps.json | 229 entries; 4 keys each, 229 of 229 | none | none |
| board (1 profile + README), community (4 profiles + README) | Model: "stub directories with no rendering pages" | They hold real profiles (board: `tao-wen`; community: `moses-kiwanuka`, `heather-kropp`, `aashish-gautam`, `hassan-saleh`), and 5 of the 8 non-staff `research.people_mentioned` values equal their filenames | keys `name`, `slug`, `role`, `institution`, `title`, `bio`, `published` plus `elected` (board) or `type` (community) |

Other claims in `content-model.md`, checked against the repo:
- §3.1 "Every dated content type uses `YYMMDD-slug.md`. No exceptions": 0 exceptions in newsletter, events, news, jobs; 15 of 15 cyberseminars and 28 of 31 research files are exceptions. The "migration may not be complete" warning is right.
- §4 `impactTag` list `hydroshare`, `jupyterhub`, `his`, `water-data-services`, `matlab`: the code at `pages/data-platforms/index.vue` has 4, not 5 (no `his`). Only `hydroshare` matches content (Part A.4).
- §4 cyberseminar speaker match "AND, not OR": I did not open the matching code (`pages/about/team/[slug].vue`). Not checked.
- §3.2 `full-team.json` and `reps.json` are "bare JSON arrays": both are, and the build warns that it moves each into `.body` (Part A.7).

Documented but entirely unused: only the `field` event type. Used but undocumented: `news.author`, the `watersofthack.md` schema, the `transcripts/` directory, the board and community profile contents, and optional keys listed above.

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

8. **agent/content-model.md §3.1** says every dated type uses `YYMMDD-slug.md` with no exceptions. Proposed: list cyberseminars (15 of 15) and research (28 of 31) as not yet migrated, and `programs/` as 4 files, not 3.
9. **agent/content-model.md §3.2, events.** `timezone` is "ET or null" but has 9 distinct values; `end`, `featured` and `registration` are optional (absent in 4, 14 and 12 of 27); `type: field` is unused. Proposed: document the optional keys and the real `timezone` values.
10. **agent/content-model.md §3.2, programs.** "Three flagship programs" is 4 files, and `watersofthack.md` has a different schema. Proposed: document it as a second program schema or flag it for task 2.
11. **agent/content-model.md §3.2, research.** `people_mentioned` is "team slugs" but 8 values are not in `full-team.json`. Proposed: say it also takes board and community profile slugs, if that is the intent.
12. **agent/content-model.md, last paragraph of §3.2.** "Stub directories with no rendering pages: `board/`, `community/`" — they hold 1 and 4 real profiles. Proposed: reword.
13. **agent/content-model.md §4.** The `impactTag` list has 5 entries including `his`; the code has 4, without `his`.
14. **agent/content-model.md, `news`.** Add the `author` key (1 of 12).

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
**Inline-style counts (rule 12).** Six `.vue` files read in full, counts made by hand and compared with `grep -o`:

| File | Group | `style="` read by hand | `grep` (static / bound) | Match |
|---|---|---|---|---|
| `components/StatsBand.vue` | affected | 4 (lines 12, 15 bound, 16, 17) | 3 / 1 | yes |
| `pages/about/team/index.vue` | affected | 16 (15 static, line 39 bound) | 15 / 1 | yes |
| `pages/community/news/index.vue` | affected | 27 (26 static, line 52 bound) | 26 / 1 | yes |
| `pages/highlights/[slug].vue` | unaffected | 0 | 0 / 0 | yes |
| `pages/highlights/index.vue` | unaffected | 0 | 0 / 0 | yes |
| `app.vue` | least affected | 1 (line 2) | 1 / 0 | yes |

Only two files in the repo have zero inline styles (the `highlights` stubs), so the third "unaffected" file is `app.vue`, which has 1. That is a limit of this sample, not a clean control. The three affected files are small by choice: they are the ones I could read whole, not a random draw, and none of the large files (`pages/index.vue` 91, `community/index.vue` 90) was read in full.

**Other bulk results** (rule 12):
- Filenames (Part A.3): directory listings checked with a regex. Opened: `content/cyberseminars/2025-usgs-water-data-apis.md` and `content/research/2025-datacite-migration.md` (affected); `content/events/260101-earthscope-geophysics.md`, `content/jobs/260401-icprb-spill-fellow.md`, `content/news/260423-jupyterhub-incident.md` (unaffected, first 4 lines each). The intended `content/cyberseminars/2025-fair4rs.md` does not exist (my wrong guess; `head` errored).
- Apostrophe lines (Part A.7): read the `verify.sh` log lines; also saw `font-family` quotes in `StatsBand.vue:16` and `team/index.vue:25`, `:32`, `:46`, `:52`, `:55` while reading those files in full.
- Content keys (Part B): computed by script, not hand-counted. Not otherwise sampled.
- Content-model comparison: `agent/content-model.md` read in full (274 lines).

**Noticed while reading, outside this task** (also added to `agent/roadmap.md`, Noticed): `pages/community/news/index.vue` uses colors outside the design tokens (`#1D9E75`, `#9ca3af`, `#6b7280`, `#f3f4f6`) and links to `/highlights`, a redirect stub; `pages/about/team/index.vue` makes cards clickable with `@click` and `$router.push` on a `div` (not a link, not keyboard-reachable).

## Appendix: listings (generated by script, 261003)

### A. Inline styles per file

| File | `style=` static | `:style=` bound | elements with class `rgrid` | of which `rgrid-multi` | `rgrid-split` | legacy `rg-*` |
|---|---|---|---|---|---|---|
| app.vue | 1 | 0 | 0 | 0 | 0 | 0 |
| components/AppFooter.vue | 22 | 0 | 1 | 1 | 0 | 0 |
| components/AppHeader.vue | 18 | 2 | 0 | 0 | 0 | 0 |
| components/CommunityHero.vue | 7 | 1 | 0 | 0 | 0 | 0 |
| components/StatsBand.vue | 3 | 1 | 1 | 1 | 0 | 0 |
| pages/about/governance.vue | 17 | 0 | 1 | 1 | 0 | 0 |
| pages/about/impact/[slug].vue | 12 | 1 | 0 | 0 | 0 | 0 |
| pages/about/impact/index.vue | 17 | 5 | 1 | 1 | 0 | 0 |
| pages/about/index.vue | 52 | 2 | 4 | 3 | 1 | 0 |
| pages/about/membership.vue | 36 | 1 | 0 | 0 | 0 | 1 |
| pages/about/team/[slug].vue | 30 | 0 | 2 | 0 | 2 | 0 |
| pages/about/team/index.vue | 15 | 1 | 1 | 1 | 0 | 0 |
| pages/community/campus-visits/index.vue | 69 | 1 | 5 | 0 | 5 | 0 |
| pages/community/events/[slug].vue | 62 | 1 | 2 | 0 | 2 | 0 |
| pages/community/events/index.vue | 34 | 3 | 1 | 0 | 1 | 0 |
| pages/community/index.vue | 89 | 1 | 3 | 2 | 1 | 0 |
| pages/community/jobs/index.vue | 29 | 2 | 2 | 0 | 2 | 0 |
| pages/community/news/[slug].vue | 22 | 0 | 0 | 0 | 0 | 0 |
| pages/community/news/index.vue | 26 | 1 | 0 | 0 | 0 | 0 |
| pages/community/newsletter/[slug].vue | 43 | 3 | 1 | 0 | 1 | 0 |
| pages/community/newsletter/index.vue | 16 | 0 | 0 | 0 | 0 | 0 |
| pages/contact/index.vue | 12 | 4 | 0 | 0 | 0 | 1 |
| pages/data-platforms/index.vue | 28 | 3 | 1 | 0 | 1 | 1 |
| pages/highlights/[slug].vue | 0 | 0 | 0 | 0 | 0 | 0 |
| pages/highlights/index.vue | 0 | 0 | 0 | 0 | 0 | 0 |
| pages/hire-cuahsi/index.vue | 51 | 3 | 0 | 0 | 0 | 4 |
| pages/index.vue | 88 | 3 | 6 | 2 | 4 | 0 |
| pages/learn-train/archive/index.vue | 23 | 0 | 1 | 1 | 0 | 0 |
| pages/learn-train/cyberseminars/index.vue | 21 | 2 | 1 | 1 | 0 | 0 |
| pages/learn-train/index.vue | 41 | 0 | 3 | 2 | 1 | 0 |
| pages/learn-train/programs/[slug].vue | 22 | 0 | 1 | 0 | 1 | 0 |
| pages/member-portal/index.vue | 20 | 0 | 0 | 0 | 0 | 2 |
| pages/support/index.vue | 27 | 0 | 1 | 0 | 1 | 0 |
| **Total (33 files)** | **953** | **41** | **39** | **16** | **23** | **9** |

### B. Routes (file under `pages/` to route)

| File | Route |
|---|---|
| pages/about/governance.vue | /about/governance |
| pages/about/impact/[slug].vue | /about/impact/[slug] |
| pages/about/impact/index.vue | /about/impact |
| pages/about/index.vue | /about |
| pages/about/membership.vue | /about/membership |
| pages/about/team/[slug].vue | /about/team/[slug] |
| pages/about/team/index.vue | /about/team |
| pages/community/campus-visits/index.vue | /community/campus-visits |
| pages/community/events/[slug].vue | /community/events/[slug] |
| pages/community/events/index.vue | /community/events |
| pages/community/index.vue | /community |
| pages/community/jobs/index.vue | /community/jobs |
| pages/community/news/[slug].vue | /community/news/[slug] |
| pages/community/news/index.vue | /community/news |
| pages/community/newsletter/[slug].vue | /community/newsletter/[slug] |
| pages/community/newsletter/index.vue | /community/newsletter |
| pages/contact/index.vue | /contact |
| pages/data-platforms/index.vue | /data-platforms |
| pages/highlights/[slug].vue | /highlights/[slug] |
| pages/highlights/index.vue | /highlights |
| pages/hire-cuahsi/index.vue | /hire-cuahsi |
| pages/index.vue | / |
| pages/learn-train/archive/index.vue | /learn-train/archive |
| pages/learn-train/cyberseminars/index.vue | /learn-train/cyberseminars |
| pages/learn-train/index.vue | /learn-train |
| pages/learn-train/programs/[slug].vue | /learn-train/programs/[slug] |
| pages/member-portal/index.vue | /member-portal |
| pages/support/index.vue | /support |

### C. Every `queryContent` call

| File:line | Collection queried | Prefix collision with another content directory? |
|---|---|---|
| pages/about/impact/[slug].vue:6 | `research` | no |
| pages/about/impact/index.vue:10 | `research` | no |
| pages/about/team/[slug].vue:5 | `team` | no |
| pages/about/team/[slug].vue:14 | `team` | no |
| pages/about/team/[slug].vue:17 | `research` | no |
| pages/about/team/[slug].vue:20 | `newsletter` | no |
| pages/about/team/[slug].vue:23 | `cyberseminars` | no |
| pages/about/team/index.vue:4 | `team` | no |
| pages/community/events/[slug].vue:5 | `events` | no |
| pages/community/events/[slug].vue:17 | `events` | no |
| pages/community/events/[slug].vue:25 | `newsletter` | no |
| pages/community/events/index.vue:9 | `events` | no |
| pages/community/index.vue:8 | `events` | no |
| pages/community/index.vue:15 | `news` | **yes: also matches newsletter** |
| pages/community/index.vue:23 | `newsletter` | no |
| pages/community/jobs/index.vue:8 | `jobs` | no |
| pages/community/news/[slug].vue:4 | `news` | **yes: also matches newsletter** |
| pages/community/news/index.vue:8 | `news` | **yes: also matches newsletter** |
| pages/community/news/index.vue:11 | `news` | **yes: also matches newsletter** |
| pages/community/newsletter/[slug].vue:5 | `newsletter` | no |
| pages/community/newsletter/[slug].vue:18 | `team` | no |
| pages/community/newsletter/[slug].vue:31 | `events` | no |
| pages/community/newsletter/[slug].vue:39 | `newsletter` | no |
| pages/community/newsletter/index.vue:8 | `newsletter` | no |
| pages/data-platforms/index.vue:9 | `research` | no |
| pages/index.vue:11 | `research` | no |
| pages/index.vue:16 | `events` | no |
| pages/index.vue:25 | `cyberseminars` | no |
| pages/learn-train/archive/index.vue:8 | `events` | no |
| pages/learn-train/cyberseminars/index.vue:4 | `cyberseminars` | no |
| pages/learn-train/index.vue:5 | `programs` | no |
| pages/learn-train/programs/[slug].vue:5 | `programs` | no |
| pages/member-portal/index.vue:13 | `members/reps` | no |

### D. Build and verify.sh log excerpts (from `./scripts/verify.sh --build` on commit f4360d7; the full log is in `.agent/verify-build.log`, which is gitignored)

```
1:ok    backticks balanced
2:FAIL  apostrophe inside static style attribute:
234:FAIL  grid-template-columns in a style attribute:
236:ok    no string-resolved link components
237:ok    content JSON parses
238:WARN  pages/community/index.vue queries 'news' with no startsWith('/news/') filter; it will also return 'newsletter'
239:WARN  findOne() with no .catch within two lines:
246:WARN  throw createError in a page; breaks client-side navigation in dev:
249:ok    branch: task/reconcile
250:ok    content/ untouched
251:ok    eval log append-only
252:----  npm run build:search
385:[nuxt-site-config]  ERROR  The @nuxtjs/sitemap module requires a site.url to be set:
396: WARN  JSON array is not supported in content:members:reps.json, moving the array into the body key
399: WARN  JSON array is not supported in content:team:full-team.json, moving the array into the body key
839:  │ ├── [404] Document not found!
840:  │ └── Linked from /about/team/irene-garousi-nejad
846:  │ ├── [404] Document not found!
847:  │ └── Linked from /about/team/lindsay-platt
854:  │ ├── [404] Document not found!
855:  │ └── Linked from /about/team/danielle-tijerina-kreuzer
892:[nitro] ℹ Prerendered 379 routes in 4.795 seconds
907:Did not find a data-pagefind-body element on the site.
916:  Indexed 107 pages
927:ok    build passed
928:----  2 FAIL, 3 WARN
```

Apostrophe FAIL: 231 lines in 21 files (script count of the indented lines under that FAIL).
