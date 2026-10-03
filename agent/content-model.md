# Content model

**Provenance.** This is sections 3, 4 and 9 of the handoff written on 2 September 2026
by the agent that built the prototype, from session memory, without the repository in
front of it. Nothing enforces these schemas at build time: the installed Nuxt Content
(2.13.4) has no schema support. `npm run validate:content` checks the files on demand
against `scripts/content-schemas.mjs`, which follows the files, not this document.
Treat every field list as a claim to
check against the actual files in `content/` (rule 1). The reconcile report, Part B,
records what the files really contain; where it disagrees with this document, the
report is right and this document gets corrected.

Read this before roadmap task 2. Do not edit `content/` in Phase 1.

Section numbers below are the handoff's own. References to §6, §7 and §2 point to
material now in `CLAUDE.md` (Layout, Known footguns) and the strategic goals: the
newsletter draws from the site, reports harvest the same content, most staff can
contribute, and agents handle routine content upkeep. All four depend on a validated
schema, which is why task 2 comes early.

---

## 3. Content model — the most important section

All content lives in `content/` as Markdown with YAML frontmatter, or JSON. Pages query
it via `queryContent()`. **This content model is the durable asset; the Vue
implementation is disposable.**

### 3.1 Naming convention

**Every dated content type uses `YYMMDD-slug.md`.** No exceptions.

```
260531-hydrolearn-fellows.md     # 31 May 2026
260701-july.md                   # July 2026 newsletter (day always 01)
260211-board-marco-maneta.md     # 11 Feb 2026
```

- Unknown or not-applicable day → use `01`.
- **The `slug` frontmatter field drives the URL, not the filename.** The filename prefix
  exists only for sort order in directory listings. Renaming a file to fix its prefix
  never breaks a live URL.
- `content/programs/` is the one exception — evergreen program descriptions, named by
  slug only (`virtual-university.md`), no date prefix.

> ⚠️ Earlier in the project, `content/newsletter/` used `YYYY-MM.md` and
> `content/cyberseminars/` used `YYYY-slug.md`. A migration to `YYMMDD-` was started but
> **may not be complete**. Verify.

### 3.2 Schemas

These are conventions that nothing enforces at build time (Nuxt Content 2.13.4 has no
schema support). `npm run validate:content` checks them on demand. An agent writing
content must honor them exactly or cross-links silently fail.

**`content/newsletter/` — monthly e-newsletter issues**
```yaml
title: "July 2026 e-Newsletter"
date: 2026-07-01
slug: 2026-july                  # drives /community/newsletter/2026-july
summary: "One-paragraph abstract of the issue"
topics: [announcements, training, events]
people_mentioned: [jordan-read, tony-castronova]   # CUAHSI staff slugs — see §4
programs_mentioned: [hydrolearn, summer-institute]
mailchimp_id: ff35393a0a
mailchimp_url: https://us3.campaign-archive.com/?u=...&id=...
published: true
```
Body: full issue content as markdown, `##` section headings.

**`content/events/` — anything with a date**
```yaml
title: WaterSoftHack 2026
slug: watersofthack-2026-july
type: workshop                   # workshop | field | webinar | webinar-series | conference | deadline
audience: [graduate-students, postdocs]
start: 2026-07-20                # ISO8601; may include time + offset
end: 2026-07-31
timezone: ET                     # or null
location:
  mode: virtual                  # virtual | in-person | hybrid
  city: Salt Lake City, UT       # omit/null if virtual
  url: https://...
description: "Prose description"
registration:
  required: true
  url: https://...
  cost: free
tags: [cyberinfrastructure, machine-learning]
newsletter_source: [2026-july]   # newsletter slugs that announced this — see §4
featured: false
published: true
```
> `type` matters functionally: `/learn-train/archive` filters to `workshop` and `field`
> only. `/community/events` shows everything.

**`content/research/` — evergreen outcome stories (renders at `/about/impact/`)**
```yaml
title: "HydroLearn–CIROH Hackathon Produces 11 New Learning Modules"
slug: hydrolearn-ciroh-hackathon-2026
date: 2026-07-01
year: 2026
category: training               # research | cyberinfrastructure | data-infrastructure | training | community
tags: [HydroLearn, CIROH, education]
people_mentioned: [irene-garousi-nejad]
partners: [CIROH, HydroLearn]
funding: "NOAA Cooperative Institute Program (NA22NWS4320003)"
published: true
excerpt: "1–2 sentence card summary"
```
> **Directory is `content/research/` but the URL is `/about/impact/`.** This is a known,
> deliberate mismatch left from an IA change. Do not "fix" it without updating every
> query and link.

**`content/news/` — short-lived operational notices**
```yaml
title: "New Staff: Henok Tedla Joins as Controller"
slug: new-staff-henok-tedla
date: 2026-06-01
excerpt: "Card summary"
tags: [announcements, new-staff]
source_url: https://www.cuahsi.org/...   # optional — renders "Read full article ↗"
published: true
```

**`content/jobs/`**
```yaml
title: PhD Student — Computational Hydrology
slug: nmsu-hydrocs-phd-2026
organization: New Mexico State University
location: Las Cruces, NM
type: graduate-assistantship     # permanent | post-doc | fellowship | internship | graduate-assistantship | faculty
posted: 2026-07-01
deadline: null                   # expired jobs hidden by default, toggle reveals
url: https://...                 # external application link
source: newsletter               # provenance — anticipates automated aggregation
tags: [PhD, computational-hydrology]
published: true
```
> The `source` field exists specifically to support the planned harvesting agent.
> Existing values include `newsletter` and `joshswaterjobs`.

**`content/cyberseminars/`**
```yaml
title: "Changes Coming to USGS Water Data APIs"
slug: usgs-water-data-apis-2025
series: "Standalone webinar"
series_slug: standalone-2025
date: 2025-08-13
youtube_id: ""                   # empty = card renders without embed/thumbnail
speakers: [Elise Hinman, Lindsay Platt]
speaker_orgs: [USGS, CUAHSI]
tags: [USGS, water-data, APIs]
has_transcript: false
published: true
description: "Prose summary"
```

**`content/programs/` — the three flagship recurring programs**
```yaml
title: CUAHSI Virtual University
slug: virtual-university
abbreviation: CVU
status: active
frequency: annual
season: Fall (September–December)
audience: [graduate-students, faculty]
contact: jmasterman@cuahsi.org
partners: []
funding: NSF EAR-1849458
tags: [graduate-education, online]
excerpt: "Card summary"
published: true
```
Files: `virtual-university.md`, `snow-field-school.md`, `summer-institute.md`.

**`content/team/full-team.json`** — bare JSON array, single source of truth for staff
```json
{
  "name": "Anthony Castronova",
  "slug": "tony-castronova",
  "role": "Lead of Research",
  "department": "Leadership",
  "pronouns": null,
  "photo": "/team/headshots/tony-castronova.jpg",
  "bio": "...",
  "fun_fact": "...",
  "links": { "orcid": "...", "google_scholar": "...", "github": "...", "linkedin": "..." },
  "has_profile": true
}
```
- `department` ∈ Leadership, Research, Engineering, Programs, Communications, Operations
- `has_profile: true` → card is clickable, profile page renders at `/about/team/[slug]`
- `photo: null` → initials placeholder renders instead
- Optionally, `content/team/[slug].md` holds **extended** profile content (publications,
  recent work) that renders *below* the JSON-sourced bio. **Do not duplicate the bio in
  the `.md` file** — it will render twice.

**`content/members/reps.json`** — bare JSON array, 229 member institution reps
```json
{ "first_name": "...", "last_name": "...", "institution": "...", "email": "..." }
```

**Stub directories with no rendering pages:** `content/board/`, `content/community/`.

### 3.3 Editorial rules (decided during the build, enforced by nothing)

- **news** = short-lived operational notices (platform incidents, service changes,
  staff announcements). Expires in relevance.
- **research/impact** = durable outcome stories worth reading a year later.
- **newsletter originates nothing.** It is assembled from `news/` + `research/` entries
  plus an editor's note. This rule is the foundation of automation goal #1 in §2.

---

## 4. Cross-linking system

This is the mechanism that makes "newsletter draws from the site" possible. All of it is
**manual tagging** — there is no text scanning or NLP. If the frontmatter array isn't
populated, the link silently never appears.

| Link | Mechanism |
|---|---|
| Staff profile → newsletters mentioning them | `newsletter.people_mentioned[]` contains the team `slug` |
| Staff profile → impact stories they contributed to | `research.people_mentioned[]` contains the team `slug` |
| Staff profile → cyberseminars they spoke in | `cyberseminar.speakers[]` string-matches **first AND last name** |
| Newsletter issue → events it announced | `event.newsletter_source[]` contains the newsletter `slug` |
| Data & Computing tool → related impact stories | `research.tags[]` contains the tool's `impactTag` |

**Two traps already hit here:**

1. The cyberseminar speaker match originally used **OR** (first name *or* last name).
   "Anthony Castronova" matched a USGS speaker named "Anthony Martinez," cross-linking
   the wrong person onto a profile page. It must be **AND**.
2. `people_mentioned` takes **team slugs** (`jordan-read`), not display names. Writing
   "Jordan Read announced…" in body prose does nothing.

The tool `impactTag` values on the Data & Computing page (`hydroshare`, `jupyterhub`,
`his`, `water-data-services`, `matlab`) were **guessed**, not verified against actual
tags in `content/research/`. If they don't match real tags, those "related impact"
strips render empty — silently. **Verify.**

---

## 9. The manual newsletter-to-content procedure (Phase 2 reference; do not perform in Phase 1)

This was performed by hand several times during the build. It is the clearest candidate
for automation after the schema work, and directly serves strategic goal #1.

**Input:** a monthly e-newsletter as `.mhtml` (browser "Save Page As") or PDF.

**Procedure:**

1. **Extract text.** For MHTML: parse with Python `email` module, pull the `text/html`
   part, strip tags while preserving `href` attributes (links carry registration URLs,
   job postings, and article sources).
2. **Create the newsletter record** at `content/newsletter/YYMMDD-month.md` with full
   frontmatter per §3.2 and the issue body as markdown sections.
3. **Decompose into other content types:**
   - Anything with a **date** → `content/events/`, with `newsletter_source: [this-slug]`
   - **Program outcomes / narrative stories** → `content/research/` with a `category`
   - **Staff announcements, operational notices** → `content/news/`
   - **Job postings** → `content/jobs/` with `source: newsletter`
4. **Populate `people_mentioned[]`** on the newsletter and on each research entry, using
   team slugs from `full-team.json` for every CUAHSI staff member named.
5. **Deduplicate.** Recurring items (e.g. WaterSoftHack) are announced across multiple
   issues. Check for an existing `content/events/` entry before creating one.
6. **Apply editorial rules** from §3.3 when deciding news vs. research.
7. **Don't mirror external articles.** When the newsletter links to a full article on
   cuahsi.org, write a short summary and set `source_url` rather than reproducing it.

**Judgment calls that resisted automation** and will need either heuristics or
human-in-the-loop: deciding news vs. durable impact story; writing a genuinely useful
`excerpt`; choosing `category`; identifying which named people are CUAHSI staff versus
external community members.

---

