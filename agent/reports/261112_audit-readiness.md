# Audit A6: readiness for the new address

Org issue 111 (epic 99), workstream W6. Read-only: **nothing on the site was changed and nothing is fixed.** Every change below is a proposal, and the ones that touch `nuxt.config.ts`, `assets/robots.txt` or `netlify.toml` need Jordan's approval first (rule 8). The table with one row per item is `agent/audit/a6_items.csv`.

## 1. The answer

The site is not ready to be found, for one reason and several smaller ones.

**The sitemap is empty because the site says "do not index" in three places, and the one that matters to the sitemap is `assets/robots.txt` (`Disallow: /`).** The robots module reads it, marks every page not indexable, and the sitemap module then leaves every page out. I isolated it with three builds of the same code, each change reverted afterwards and none committed: with only `assets/robots.txt` changed to allow all, the sitemap listed 574 URLs; with only a site address set (`NUXT_SITE_URL`), 0. So the robots file alone is the cause; the address is a separate need (canonical links, the `Sitemap:` line). **389 of those 574 have no page**: `strictNuxtContentPaths: true` in `nuxt.config.ts` adds every content file under its content path (`/jobs/…` 149, `/cyberseminars/…` 88, `/events/…` 45, and nine more groups). With that option removed as well the sitemap lists 185 URLs, none without a page; 15 of the 185 are redirect stubs that should be left out. So opening the site to search engines is not "flip a switch"; done naively it publishes 389 addresses that return 404.

Around that: 81 of 170 pages have no description, none has a canonical link, social-preview tags or structured data, the 404 page is Nuxt's default, and **9 of the 12 legacy pages with most clicks have no redirect and no page of that address**. The 325 redirect rules themselves are clean (no chains, no loops). Accessibility is much better than in October.

## 2. Method

- **Static pass** (`scripts/parity/a6-readiness-static.mjs`, offline): reads the built site. Title, description, canonical, robots meta, Open Graph, Twitter, JSON-LD, `h1`, `lang`, images without `alt` for each of 185 built pages (170 real, 15 redirect stubs); duplicates; the redirect rules (chains, loops, targets); the Search Console export mapped to this site.
- **Browser pass** (`scripts/parity/a6-readiness-browser.mjs`, Playwright, local server only; it refuses any other host): 9 counterpart pages of the top 12, plus 5 pages where October found problems and the 5 largest built pages, at 1280 and 390 px. October's checks H1 to H10, transfer weight, requests, largest paint, layout shift; the 404 page. Fonts are blocked, so weights exclude them.
- **Builds:** the as-deployed build is `main` at `d70d9ab`, built as it stands. The two sitemap experiments are builds from the same code with a local change that was reverted (`git checkout`), not committed.
- **Search Console:** `raw/search-console/261106_cuahsi-org_pages.zip` (the pages table, 1,000 rows, of which 570 are on the www.cuahsi.org host; 15,882 clicks on that host). The 12 pages with most clicks are 9,352 of them (59%).
- **File names:** the data files carry no date (Jordan's global rule, 11 November: in-progress files take no date). The older audit files carry one; I followed the global rule and said so here.

## 3. Items (summary; full table in the CSV)

| Item | Result | Status |
|---|---|---|
| Sitemap | 0 URLs; cause found (section 1) | fix proposed, rule 8 |
| Sitemap would list non-pages | 389 of 574 without a page; 15 redirect stubs | fix proposed, rule 8 |
| Titles | 0 of 170 missing; 4 pages in 2 groups duplicate; 93 of 170 over 60 characters | fine, one small decision |
| Descriptions | 81 of 170 missing (about 51 of 54, community 23 of 84, learn-train 7 of 9) | fix proposed |
| Canonical | 0 of 170 | fix proposed, rule 8 |
| Social previews | 0 of 170 | fix proposed |
| Structured data | 0 of 170 | fix proposed |
| 404 page | Nuxt default, shows the path, one link | fix proposed |
| Redirects | 325 × 301 + 1 rewrite; 0 chains, 0 loops | fine |
| Top 12 pages | 3 land, 9 do not | fix proposed |
| Indexing at go-live | three places say no | decision |
| Accessibility | see section 5 | fix proposed |
| Page weight | see section 6 | decision |

## 4. The 12 most visited pages

Ranked by clicks, 6 October to 6 November, cuahsi.org host only (one hiscentral address is left out).

| # | Legacy path | Clicks | New site |
|---|---|---|---|
| 1 | `/` | 2,981 | `/` |
| 2 | `/job-board` | 1,441 | no rule; `/community/jobs` exists (my choice) |
| 3 | `/summer-institute` | 1,045 | no rule; `/learn-train/programs/summer-institute` (my choice) |
| 4 | `/data-services/matlab` | 1,001 | **no rule, no page found** (61,550 impressions) |
| 5 | `/students/graduate-programs-in-water-science` | 888 | 301 to `/learn-train/graduate-programs` |
| 6 | `/about/our-team` | 345 | no rule; `/about/team` (my choice) |
| 7 | `/workshops/snow-measurement-field-school-2026` | 301 | no rule; `/learn-train/programs/snow-field-school` (my choice) |
| 8 | `/workshops/hydrolearn-ciroh-may-june-2026-workshop-and-hackathon` | 289 | no rule; `/community/events/hydrolearn-ciroh-workshop-2026` (my choice) |
| 9 | `/virtual-university` | 281 | no rule; `/learn-train/programs/virtual-university` (my choice) |
| 10 | `/students/graduate-programs-in-water-science/ph-d` | 273 | 301 to `/learn-train/graduate-programs` |
| 11 | `/data-services/hydroshare` | 260 | no rule; `/data-platforms` (my choice) |
| 12 | `/grant-opportunities` | 247 | **no rule, no page found** |

3 of 12 land today (4,142 clicks, 44% of the 9,352). For 7 of the other 9 a counterpart exists but nothing sends the visitor there. For the MATLAB page (the fourth most clicked and the most seen, 61,550 impressions) and the grant page I found no counterpart; whether one should exist is Jordan's decision. The counterparts above are my choice, read from the route list, not checked against content. This overlaps A7 (cut-over rehearsal), which tests every legacy URL; here only the top 12 are named.

## 5. Accessibility against the October audit

Re-tested on 19 pages: the 9 distinct counterparts of the top 12, 5 pages where October found problems (`/hire-cuahsi`, `/about/membership`, `/member-portal`, `/learn-train/cyberseminars`, `/learn-train/archive`) and the 5 largest built pages (all Critical Zone). The tests are my own scripted checks, not an accessibility tool (none is installed, and adding one is a dependency, rule 8). A control with one light-grey paragraph, one clickable `div` and one unlabelled field was scored 1 failing text run of 3, 1 clickable `div`, 1 unlabelled field: the checks see what they should.

| October finding | Now (19 pages, both widths) |
|---|---|
| H1, H2, H3 mouse-only cards | 0 clickable non-interactive elements on 19 of 19 |
| H4 menu button without a name | named, with `aria-expanded` and `aria-controls`, on 19 of 19 (my first run read the Search button instead of the menu button and wrongly reported `aria-expanded` missing; the reviewer caught it, the selector is fixed and the run repeated) |
| H5 search dialog | has a dialog role and a labelled input on 19 of 19 (focus trap and focus return not re-tested) |
| H6 unlabelled fields | 0 of 17 visible fields unlabelled (desktop; 17 on phone) |
| H7 `outline:none` inline | 0 elements with an inline `outline:none` |
| H8 skip link | first focusable element is an in-page link on 19 of 19 |
| H9 contrast | 4 pages fail: home 13 of 166 text runs, jobs 56 of 816, hire 1 of 89, archive 1 of 90; the other 15 pages 0 |
| H10 sideways scroll at phone width | 0 of 19 (the archive page was the October case) |

Contrast in detail (figures from the ad hoc run saved in `a6_adhoc_checks.txt`, not from the CSV): on the jobs page 54 of the 56 are the decorative `↗` (light grey, 1.3 to 1.4:1; October made the same point about glyphs). On the home page the clay accent colour `#C0603C` on the light backgrounds is 3.65 to 4.22:1 at 11 to 12 px (it needs 4.5), 10 runs; "white on white" in 3 labels over a picture is a limit of my test, which does not see the picture. Text over a gradient or an image is counted "not scored" (0 to 17 per page), not as a pass. The clay colour is a design token, so changing it is Jordan's decision.

**What the contrast and click tests miss:** semi-transparent text, translucent backgrounds, a faded parent and text over a picture are not scored as failures, so "0 failing" on 15 pages means none found by this test, not a pass. The clickable test looks at `div`, `span`, `li`, `img`, `svg` and `p` with a pointer cursor only. The October numbers quoted here are from `agent/reports/261004_accessibility-audit.md`, not re-derived. The control (1 failing run of 3, 1 clickable `div`, 1 unlabelled field) is at the top of the ad hoc file.

Not re-tested from October's list: focus trap and focus return in the search dialog; the keyboard path through the menu; anything that needs a screen reader (I have not used one).

## 6. Page weight and load

Local server, no throttling, fonts blocked, **sizes uncompressed** (the host compresses text). Two runs of the home page gave 2.5 and 3.5 MB; the data files of linked pages (1.8 MB of the home page's total in the ad hoc run) are fetched ahead of a click and the amount depends on timing (my reading of the request list, not isolated).

| Page | Desktop | Phone | Requests (desktop) |
|---|---|---|---|
| Home | 2.5 to 3.5 MB | 1.6 MB | 52 to 69 |
| `/about/team` | 3.7 to 5.6 MB | 2.7 MB | 93 |
| `/critical-zone-science/papers` | 5.4 to 6.5 MB | 4.5 MB | 59 |
| Other counterparts | 2.7 to 3.3 MB | 0.7 to 1.3 MB | 52 to 69 |

The figures are from the saved run (`a6_browser_pages.csv`: home 3.55 MB in 60 requests, team 5.57 MB, papers 6.49 MB in 60); the lower ends of the ranges come from a second run kept only in `a6_adhoc_checks.txt` (home 2.47 MB).

The Critical Zone papers page is 2.8 MB of HTML on its own (11,220 text runs). Largest paint was under 0.3 s for every page, which says nothing about a real connection; **a throttled or real-network measure was not made.**

## 7. Indexing and robots at go-live; Search Console

Today the site says no in three places: the `X-Robots-Tag: noindex, nofollow, noarchive` header in `netlify.toml`, `Disallow: /` in `assets/robots.txt`, and `<meta name="robots" content="noindex, nofollow">` on 170 of 170 pages (written by the robots module because of the second). All three must change in the same release as the new address, or the site stays hidden. The second fixes the meta tag and the sitemap; the first is separate.

The Search Console steps for an address move are general practice, not checked against Google's current documentation in this session, and they depend on the final address, which is not decided (A7):
1. If the address stays `www.cuahsi.org` there is no change-of-address; the legacy pages are replaced in place, and the 325 redirects carry the old paths.
2. If the host changes, add and verify the new property first, then use the change-of-address tool on the old one.
3. Submit the new sitemap; inspect the 12 pages above and the home page; watch coverage for the first weeks.
4. Keep the redirects.

## 8. Proposed fixes (none made), for Jordan

1. **One go-live PR, rule 8 approval needed:** `assets/robots.txt` to allow all and name the sitemap; `nuxt.config.ts` to set the site address and remove `strictNuxtContentPaths: true`; `netlify.toml` to drop the noindex header. It must wait for the date and the address (A7). Tested: with the first two the sitemap lists 185 URLs, none without a page. Not tested: leaving out the 15 redirect stubs; the header.
2. **Redirects for the 7 top pages with a counterpart:** one code PR (the file is generated by `scripts/parity/redirects.mjs`).
3. **Decide the MATLAB page and the grant opportunities page.** 1,001 and 247 clicks; no page.
4. **Descriptions** on the 81 pages without one: a code PR for the templates and a content PR for the rest.
5. **Canonical, social-preview and structured-data tags**: a code PR after 1.
6. **A site 404 page** in the site's design (code PR).
7. **Contrast:** the clay colour on light backgrounds and the decorative arrow (design decision).
8. **Page weight:** decide whether to measure on a real connection first.

## 9. Hand reads (rule 12)

Three the script called matched, three it called missing; each confirmed by reading.
- **Matched:** (1) the deployed `sitemap.xml` has 0 `<loc>` and `robots.txt` says `Disallow: /`, with an `x-robots-tag: noindex` header (curl); (2) line 86 of `public/_redirects` sends `/students/graduate-programs-in-water-science` to `/learn-train/graduate-programs`; (3) the two WaterSoftHack 2026 event files carry the same title.
- **Missing:** (4) `_redirects` has no line for `matlab`, `grant-opportunities`, `job-board` or `summer-institute`, and no built page of those names; (5) `/jobs/261012-university-of-pittsburgh-water-research-and-data-analyst` is in the experimental sitemap and the local server returns 404 for it; (6) the built home page has 0 `canonical` links and the code has none (`grep` over `pages`, `components`, `app.vue` and `nuxt.config.ts` finds the word only in a comment about the member list).

## 10. Not examined

- A real-network or throttled load measure (section 6).
- Screen reader use; keyboard walk through every page; focus trap in the search dialog.
- Accessibility on the two top-12 pages with no counterpart (MATLAB, grants), and on most of the site: 19 of 170 pages tested (11%).
- Google's current documentation for an address move (section 7).
- The deployed host's own 404 page and headers beyond status (it is built from the organisation's `main`, not the fork's).
- The hiscentral address in the top pages list (another host).

## 11. Counts with denominators

170 real pages + 15 redirect stubs = 185 built pages. 81 of 170 without description. 0 of 170 with canonical, Open Graph, Twitter or JSON-LD. 93 of 170 titles over 60 characters. Images: 4 of 203 have no `alt` attribute (note below). 325 + 1 redirect rules: 266 land on a page, 59 on a file, 1 on another site. Top 12: 3 land, 9 do not (7 with a counterpart, 2 without). Sitemap experiment: 574 URLs, 185 with a page, 389 without.

Note on images: the static pass found 4 of 203 images with no `alt` attribute, all on `/about/impact`; I did not open them.

## 12. Noticed

- The `/flooding-gages.json` rewrite points at the fork's `flood-data` branch (section 3 and A7).
- The title of the 404 page contains the word "Nuxt".
- The deployed host still shows October-style pages; see the A5 report for how far behind it is.
