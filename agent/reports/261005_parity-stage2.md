# Parity stage 2: the new-site inventory (5 Oct 2026)

Read-only on both sites. Source: a fresh `npm run build:search` of `main` (after PR 55), read from `.output/public` and the repository by `scripts/parity/new-inventory.mjs`. Nothing was fetched from the live legacy site. The columns are those of the legacy inventory plus `source` (the page component and, where there is one, the content file), `type_rule`, `section_rule` and `head_title`. Rows marked "claim" are my reading; the evidence is in the CSV.

Outputs in `agent/parity/`: `new-inventory.csv` (136 routes), `new-page-type-rules.csv`, `new-unpublished.csv` (4 items), `new-content-without-route.csv` (5 items), `new-nav.txt`, `stage2-numbers.json`. A re-run is deterministic.

## 1. Totals

**136 routes** (every `index.html` in the build; `/200.html` and `/404.html` are fallbacks, not routes).

By type (sums to 136): event 40, impact story 31, redirect stub 14, news post 12, newsletter issue 9, listing 9, landing page 6, person 6, static page 5, program 4.

By section, taken from the navigation (sums to 136): Community 67, About 42, none 15 (the home page and the 14 redirect stubs), Learn & Train 7, Utility links in the header 3, Data & Computing 1, Hire CUAHSI 1.

Words per page: median 145; 21 of 136 under 50 words (the 14 redirect stubs have none); 6 of 136 over 1,000.

Flags: 1 of 136 has a form, 2 of 136 an embed, 20 of 136 show contact details (recorded as a flag only), 1 of 136 links a file.

The type rules are N01 to N10 (`new-page-type-rules.csv`); they work from the route and the page component, not from the words on the page.

## 2. Published content against routes

Each content collection compared with the routes built from it (files / published / routes):

| collection | files | published | item routes |
|---|---|---|---|
| events | 40 | 40 | 40 |
| news | 12 | 12 | 12 |
| newsletter | 9 | 9 | 9 |
| research (shown as `/about/impact/`) | 31 | 31 | 31 |
| programs | 4 | 4 | 4 |
| team | 8 | 8 | 6 |
| cyberseminars | 15 | 11 | 0 (listed on one page) |
| jobs | 29 | 29 | 0 (listed on one page) |
| community | 4 | 4 | 0 |
| board | 1 | 1 | 0 |
| members | 0 | 0 | 0 |

- **Team, 8 files against 6 routes.** 5 published files have no page because `has_profile` is false in `full-team.json` (brianna-kearns, callie-porter-borden, kimmy-wong, lisa-mucciacito, zahraa-alhmood); the reverse also occurs: 3 profile pages (danielle-tijerina-kreuzer, irene-garousi-nejad, lindsay-platt) have no `.md` and are built from `full-team.json` alone. 3 routes have both a file and a page.
- **Cyberseminars: 4 of 15 unpublished** (`new-unpublished.csv`). Reason, from the file: 2 have an empty `youtube_id`, 2 have one of 9 and 8 characters where a YouTube id has 11. The 11 published appear on `/learn-train/cyberseminars` and have no page of their own.
- **Jobs, 29 of 29 published**, shown on `/community/jobs` only; no job has its own page.
- **Community (4) and board (1)** files are the source of no page: a search of `pages/`, `components/` and `composables/` finds no `queryContent` call for either collection (checked). They are not listed in `new-content-without-route.csv`, which covers the team case only.

## 3. Things that differ from what the project documents say

- **`/highlights/*` is 14 redirect stubs, and they are not 301s.** `CLAUDE.md` says "301 redirect stubs". In the build each is a one-line HTML page with `<meta http-equiv="refresh" content="0; url=/about/impact">`. A static host cannot return a 301 from a page file. `netlify.toml` has one redirect, a 301 for `/archive`, and none for `/highlights` (read); there is no `public/_redirects` file. For the parity work: a search engine treats a meta refresh differently from a 301. Not fixed here (rule 6 and rule 8); added to Noticed.
- **The built sitemap is empty (0 locations)** and the site is noindex, so there is no sitemap route on this side to compare with the legacy 681.
- **The navigation is flat:** 5 header items and 3 utility links, no submenus in the HTML (`new-nav.txt`). The legacy site has 6 top-level items with submenus. Stage 3 compares them.
- Routes found only by links (108 of 136) have no nav entry; that is normal here, since the listings link every item.

## 4. Six-item check (P5)

Present (route read from the built HTML and recomputed independently): `/community/events/annual-membership-meeting-2026` (119 words, date 2026-12-01), `/about/impact/indigenous-data-sovereignty-2026` (139 words, 2026-04-15), `/community/events/data-publishing-program-fall-2026` (125 words, 2026-10-19; the page's own date line reads October 19 – November 9, 2026). Word counts agree with my independent count; dates agree with the page text.

Missing (a published or listed item with no route; confirmed absent from `.output/public`): `/about/team/kimmy-wong`, `/about/team/lisa-mucciacito`, `/about/team/zahraa-alhmood`.

This check found two defects in my first run, both fixed before this report: dates were blank for two pages and wrong for one, and word counts ran words together because the built HTML has no whitespace between elements. After the fix: dates present on 40 of 40 events, 12 of 12 news posts, 31 of 31 impact stories. **Newsletter issues: the `date` column is blank for 9 of 9.** The reviewer found that my first fix took the first date in the body (event text) as the issue date, wrong for 9 of 9 (for example August read 2026-11-12; the file says 2026-08-13). An issue page shows no date of its own (`pages/community/newsletter/[slug].vue`), so the column is now blank; the date is in the content file's `date`, which stage 4 can use. The `date` column is reliable only for types whose page shows a date (events, news posts, impact stories); the six-item sample did not include a newsletter issue, which is why it missed this.

## 5. Not examined

- Anything in the rendered pages that depends on the browser (search, filters, header menus, the 2 embeds): the inventory reads built HTML only. "No submenus" in section 3 means none in the HTML; client-side menu behaviour was not tested.
- Embeds on `/learn-train/cyberseminars`: `has_embed` is false for it, but the page lists 11 recordings; whether they are players or links was not opened. `has_embed` only detects iframes, video elements and YouTube/Vimeo links in the built HTML, so it may undercount.
- The type rule N08 is a fixed list of 9 listing routes and N10 catches every other route as a static page; a new route would be typed a static page.
- What Netlify actually returns for `/highlights/*` (I read config, not the deployed site).
- The contents of the community and board files beyond counts.
- Page text accuracy: no comparison with the legacy site (that is stage 5).

## 6. Personal data (P8)

A search of every new output for email addresses finds 0. 20 pages are flagged as showing contact details; the details are not recorded. Names appear in 6 team URLs (public).
