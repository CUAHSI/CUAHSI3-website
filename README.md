# CUAHSI Website — cuahsi.org v3

Nuxt 3 + @nuxt/content + Tailwind CSS. Deployed on Netlify (see `netlify.toml`).

**Local dev:** `npm install && npm run dev` → http://localhost:3000

---

## Quick start for new contributors

```bash
git clone <repo-url>
cd CUAHSI3-website
npm install
npm run dev
```

Open http://localhost:3000. Hot-reload is on — edit any `.vue` or content file and see it update immediately.

If you hit `Failed to resolve import "#app-manifest"` in the terminal on startup: this is a known, harmless Nuxt/Vite version-mismatch warning. It doesn't break anything and can be ignored. If it's producing a blocking overlay *in the browser* rather than just terminal noise, confirm `nuxt.config.ts` has:
```ts
vite: { server: { hmr: { overlay: false } } }
```

If pages look broken or a component's changes aren't showing up after a lot of file changes, clear the cache:
```bash
rm -rf .nuxt .output node_modules/.vite
npm run dev
```

---

## Site structure

Five top-level nav sections:

```
/                    Homepage — wayfinding, featured content, latest news
/about               Organization — team, governance, membership, impact
/data-platforms      Tools — HydroShare, JupyterHub, Water Services, MATLAB Online
/learn-train         Training — cyberseminars, structured programs, workshop archive
/community           Engagement — events, jobs, newsletter, news, campus visits
/hire-cuahsi         Fee-for-service work — consulting, DevOps, data wrangling, integrations
```

Plus unlisted (not in nav, reachable by direct URL):
```
/contact             Triaged contact routing — technical / membership / paid work / press
/support             Donation page (Zeffy embed)
/member-portal       Member rep directory — NOT access-controlled yet, see note below
```

**`/highlights/`** still resolves — it's a permanent redirect to `/about/impact/`. Highlights was folded into About in an IA pass; the old URL is kept alive for existing links and NSF reporting references.

⚠️ **`/member-portal` has no real access control.** It renders a directory of 229 real people's names and email addresses. It's deliberately not linked from the nav, but it is publicly reachable at that URL right now. Before this goes to production, this route needs to be gated at the edge — e.g. Cloudflare Access — since a client-side password check cannot actually protect statically-generated pages (the data ships in the build regardless of any JS gate). Don't add more sensitive content to this route until that's in place.

---

## Pages

```
pages/
├── index.vue                              Homepage
├── about/
│   ├── index.vue                          About hub (mission, history, what we do)
│   ├── governance.vue                     Board and advisory committees
│   ├── membership.vue                     Member roster (101 institutions, searchable/filterable)
│   ├── impact/
│   │   ├── index.vue                      Highlights index (category + year filters)
│   │   └── [slug].vue                     Individual highlight detail
│   └── team/
│       ├── index.vue                      Team photo grid (grouped by department)
│       └── [slug].vue                     Individual profile (has_profile: true only)
├── data-platforms/
│   └── index.vue                          Tools hub — HydroShare, JupyterHub, Water Services, MATLAB
├── learn-train/
│   ├── index.vue                          Training hub — cyberseminar feature + Programs + extras
│   ├── cyberseminars/
│   │   └── index.vue                      Archive with inline embeds + transcripts
│   ├── programs/
│   │   └── [slug].vue                     Individual program detail (CVU, Snow School, Summer Institute)
│   └── archive/
│       └── index.vue                      Full workshop/training archive, past + upcoming, by year
├── community/
│   ├── index.vue                          Get involved hub
│   ├── campus-visits/
│   │   └── index.vue                      Campus engagement + membership vs. fee-for-service comparison
│   ├── events/
│   │   ├── index.vue                      Upcoming and past events
│   │   └── [slug].vue                     Individual event detail
│   ├── jobs/
│   │   └── index.vue                      Job board with type filters
│   ├── news/
│   │   └── index.vue                      Operational announcements
│   └── newsletter/
│       ├── index.vue                      Newsletter archive with topic filters
│       └── [slug].vue                     Individual newsletter issue
├── hire-cuahsi/
│   └── index.vue                          Fee-for-service menu, rate calculator, quote form
├── contact/
│   └── index.vue                          Triaged contact routing (4 cards by intent)
├── support/
│   └── index.vue                          Donation page, Zeffy form embedded
├── member-portal/
│   └── index.vue                          Member rep directory — see access-control warning above
└── highlights/
    ├── index.vue                          301 redirect stub → /about/impact
    └── [slug].vue                         301 redirect stub → /about/impact/[slug]
```

## Components

```
components/
├── AppHeader.vue      Sticky nav — utility bar, logo, desktop nav, mobile hamburger menu
├── AppFooter.vue       4-column footer (2-col at tablet, 1-col at mobile)
└── StatsBand.vue       Reusable navy stats strip, used on several page heroes
```

`AppHeader.vue` and `AppFooter.vue` are used on every page — layout/nav changes go here, not per-page.

---

## Content

All content lives in `content/` as Markdown (`.md`) or JSON files, queried via `@nuxt/content`.

### File naming convention

**Every dated content type uses YYMMDD-slug.md, no exceptions** — this includes `newsletter/`, which earlier used a `YYYY-MM.md` format inconsistent with the rest of the site. All newsletter files should follow the same convention as everything else:
```
260531-hydrolearn-fellows.md     # May 31, 2026  (research)
260701-july.md                   # July 2026 issue (newsletter — day is always 01)
260211-board-marco-maneta.md     # February 11, 2026  (news)
```
Unknown or not-applicable day → use `01`. The `slug` field in frontmatter drives the URL — the filename prefix is sort-order only, so renaming a file to match this convention never breaks a live link.

`content/programs/` is the one exception: those three files aren't dated content (they're evergreen program descriptions), so they're just named by slug with no date prefix (`virtual-university.md`, not `260101-virtual-university.md`).

```
content/
├── team/full-team.json          Single source of truth for all staff (array of objects)
├── members/reps.json            229 member institution reps — name, institution, email
├── newsletter/    YYMMDD-slug   One file per issue (day is always 01, e.g. 260701-july.md)
├── events/        YYMMDD-slug   One file per event
├── cyberseminars/ YYMMDD-slug   One file per recording (+ transcripts/ subfolder)
├── research/      YYMMDD-slug   One file per highlight (URL is /about/impact/, not /research/)
├── jobs/          YYMMDD-slug   One file per job listing
├── news/          YYMMDD-slug   Operational announcements only — see schema note below
├── programs/      slug.md       CVU, Snow Field School, Summer Institute — not dated, no prefix
├── board/                       Stub — no rendering page yet
└── community/                   Stub — no rendering page yet
```

### Content type schemas

**newsletter**
```yaml
title, date, slug, summary, topics[], people_mentioned[], programs_mentioned[],
mailchimp_id, mailchimp_url, published
```

**events**
```yaml
title, slug, type, audience[], start (ISO8601), end, timezone,
location: { mode, city, url }, registration: { required, url, cost },
tags[], newsletter_source[], featured, published
```
`type` values used across the site: `workshop`, `field`, `webinar`, `conference`, `deadline`. The Learn & Train archive page filters to `workshop`/`field` only — Community's Events page shows everything.

**cyberseminars**
```yaml
title, slug, series, series_slug, date, youtube_id, speakers[],
speaker_orgs[], tags[], has_transcript, published, description
```

**research** (rendered at `/about/impact/`, directory stays `content/research/`)
```yaml
title, slug, date, year, category, tags[], people_mentioned[],
partners[], funding, published, excerpt
```
`category`: `research`, `cyberinfrastructure`, `data-infrastructure`, `training`, `community`.

**jobs**
```yaml
title, slug, organization, location, type, posted, deadline,
url, source, tags[], published
```

**news**
```yaml
title, slug, date, excerpt, tags[], published
```
Short-lived operational items only (platform incidents, service changes). Durable outcome stories go in `research/`; the newsletter should originate nothing new — it's assembled from `news/` + `research/` entries plus an editor's note.

**programs**
```yaml
title, slug, abbreviation, status, frequency, season, audience[],
contact, partners[], funding, tags[], excerpt, published
```
The three flagship recurring programs (CVU, Snow Field School, Summer Institute) — annual, cohort-based, application-driven. Distinct from one-off workshops, which live in `content/events/` and surface on the `/learn-train/archive` page instead.

**team** (`full-team.json`)
```json
{ "name", "slug", "role", "department", "pronouns", "photo", "bio",
  "fun_fact", "links": {...}, "has_profile" }
```
`department`: `Leadership`, `Research`, `Engineering`, `Programs`, `Communications`, `Operations`.

**members** (`reps.json`)
```json
{ "first_name", "last_name", "institution", "email" }
```
Flat array, 229 records. Powers `/member-portal`.

> **Note:** `full-team.json` and `reps.json` are bare JSON arrays. Nuxt Content will print a `JSON array is not supported... moving into body key` warning on startup — this is expected and harmless. Both pages already unwrap it correctly: `Array.isArray(data.body) ? data.body : []`.

---

## Two hard-won gotchas — read before touching navigation or the news/newsletter pages

**1. Never use `<component :is="condition ? 'a' : 'NuxtLink'">`.**
Resolving a component by string name like this renders visually fine but does **not** reliably wire up click navigation in this Nuxt version. We hit this twice — once on the team page, once on Learn & Train's "Also from CUAHSI" cards — and both times the fix was the same: replace it with an explicit `<template v-for>` containing a real `<a v-if>` and a real `<NuxtLink v-else>`. If you need to conditionally render a link vs. an external anchor, always use `v-if`/`v-else`, never dynamic `:is`.

**2. `queryContent('news')` also matches `/newsletter/...` — filter explicitly.**
Nuxt Content's `queryContent(path)` matches by path *prefix*. Since `/newsletter/2026-06` starts with the literal string `/news`, a bare `queryContent('news')` silently returns newsletter issues too — and if your template builds links from `item.slug`, you get broken URLs like `/community/news/2026-june`. Always add an explicit filter:
```js
const items = computed(() =>
  (allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))
)
```
Note the trailing slash — that's what disambiguates `/news/` from `/newsletter/`.

---

## Responsive layout system

Grids are **not** set with inline `style="display:grid;grid-template-columns:..."` — that pattern can't be overridden by a media query (inline styles beat CSS specificity), which caused a real mobile-breakage bug earlier in this project. Write them as mobile-first Tailwind utilities instead (the old `.rgrid` / `.rg-*` classes and the `--cols` variable were removed in the Tailwind migration):

```html
<!-- 3-up card grid: 1 col on phones, 2 col on tablets (640px), 3 col on desktop (900px) -->
<div class="grid grid-cols-[1fr] gap-[18px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
</div>

<!-- asymmetric 2-col split (hero, sidebar): stacked until 900px, then splits -->
<div class="grid grid-cols-[1fr] gap-[48px] min-[900px]:grid-cols-[minmax(0,1fr)_240px]">
</div>
```

- Use the exact track list the design needs (`1fr`, `minmax(0,1fr)`): `grid-cols-2` writes `minmax(0,1fr)`, which differs from `1fr` when an item is wider than its track.
- `.site-container` (in `assets/css/global.css`) — use for outer page containers needing responsive side padding (40px → 20px on mobile).

If a page you're editing still has raw `grid-template-columns` in a `style` attribute, that's a bug — convert it to this system.

---

## Scripts

```
scripts/
├── download-team-photos.mjs     Downloads headshots for staff with photo: null
└── fetch-transcripts.mjs        Fetches YouTube auto-captions for cyberseminars
```

**Team photos:**
```bash
node scripts/download-team-photos.mjs
```

**Cyberseminar transcripts:**
```bash
npm install youtube-transcript gray-matter   # first time only
node scripts/fetch-transcripts.mjs --id=VIDEO_ID
```

---

## Cross-linking system

| Link | Mechanism |
|---|---|
| Team profile → newsletters they appear in | `newsletter.people_mentioned[]` contains team slug |
| Team profile → highlights they contributed to | `research.people_mentioned[]` contains team slug |
| Team profile → cyberseminars they spoke in | `cyberseminar.speakers[]` name-matches team first **and** last name (AND, not OR — an earlier version matched on first name alone and cross-linked the wrong person) |
| Newsletter issue → events mentioned | `event.newsletter_source[]` contains newsletter slug |
| Data & Computing tool → related highlights | `research.tags[]` contains the tool's `impactTag` (e.g. `hydroshare`, `jupyterhub`) |

---

## Adding content — quick reference

**New newsletter issue:** create `content/newsletter/YYYY-MM.md` → extract highlights into `content/research/` → extract events into `content/events/`. Everything else updates automatically.

**New team member:** add to `full-team.json` → run `download-team-photos.mjs` if needed → set `has_profile: true` once there's enough cross-linked content to warrant a page.

**New cyberseminar:** create the `.md` file → find the YouTube video ID → run `fetch-transcripts.mjs --id=VIDEO_ID`.

**New highlight:** create `content/research/YYMMDD-slug.md`, set `category`, add `people_mentioned[]`. Renders at `/about/impact/[slug]`.

**New workshop/event:** create `content/events/YYMMDD-slug.md`. Set `type: workshop` if it should appear on `/learn-train/archive`.

---

## Search (Pagefind)

Search does **not** work in `npm run dev` — Pagefind indexes static HTML that only exists after a production build.

```bash
npm run build:search        # nuxt generate + pagefind indexing
npx serve .output/public -l 4000
```
Visit http://localhost:4000 to test search. Keep `npm run dev` running on :3000 for editing; use :4000 only to verify search.

**Netlify build settings** (defined in `netlify.toml`):
- Build command: `npm run build:search` (that is `nuxt generate && pagefind --site .output/public`)
- Publish directory: `.output/public`
- `NODE_VERSION = "20"`, `NITRO_PRESET = "static"`; every response carries `X-Robots-Tag: noindex, nofollow, noarchive`, and `/archive` redirects to `/community/newsletter`.

---

## Known gaps / future work

- **`/member-portal` needs real access control** before production — see warning above.
- **`content/board/`** and **`content/community/`** have stub files with no rendering pages.
- **`/data-platforms/`** is a single page — HydroShare, JupyterHub, and Water Services could each warrant their own page eventually.
- **`content/events/` → `content/programs/` link is manual.** The README describes programs as "authored once" with events as scheduled instances, but this isn't yet enforced at the content-model level — a training session can currently be duplicated between the two collections if someone isn't careful. Treat `content/programs/` as the canonical description and `content/events/` as dated instances only.
- **Institution data lives in two places.** `pages/about/membership.vue` and `pages/hire-cuahsi/index.vue`'s institution lookup both have their own hardcoded/JSON-sourced member lists. These should be consolidated to one shared source so they can't drift out of sync.