# Parity stage 3: structural parity (5 Oct 2026)

Read-only on both sites. This stage is about shape, not content: it reports no content gaps. Sources: the committed stage 1 outputs (`agent/parity/legacy-inventory.csv`, `legacy-nav.txt`, from the crawl of 5 Oct 2026), the saved legacy pages in `raw/legacy-site/261005/pages/` (755 HTML files; not committed), and this repository (`pages/`, `components/`, `scripts/content-schemas.mjs`, `content/`) on `main` after PR 55. Nothing was fetched from the live legacy site. Where a line is my reading rather than a fact from a file, it is marked **(mine)**.

Method limit, stated once: the field lists in table 2 come from reading **one saved page per legacy type (12 pages)**, not every page of the type. A field a type shows on other pages would be missed. Counts and the function evidence in table 3 are from all 755 saved pages (scripted, aggregated).

## 1. Navigation

Legacy tree (from `legacy-nav.txt`): 6 top-level items and 26 header entries in all, plus 4 in the footer. This site (read from `components/AppHeader.vue` and `AppFooter.vue`): 5 flat header items, 3 utility links, and 15 footer links in three groups plus 3 social links (the stage 2 figure of 11 counted distinct internal routes only). "Built pages" below means the 136 `index.html` files in `.output/public`, which include the 14 redirect stubs.

| legacy entry | nearest entry here **(mine)** | note |
|---|---|---|
| ABOUT | About (`/about`) | same label |
| About > Who We Are | About (`/about`) | no page of its own |
| About > Our Team | `/about/team` | |
| About > Governance | `/about/governance` | |
| About > What We Do | About (`/about`) | the legacy page is not a separate page here |
| About > Membership | `/about/membership` | |
| About > Policies & Conduct | none | the words "Policies" occur in 0 of 136 built pages |
| About > Document Library | none | 76 legacy library pages; here 4 distinct PDFs are linked from `/about` and `/about/governance`, and they point at www.cuahsi.org |
| About > Contact Us | Contact (`/contact`, a utility link) | |
| STUDENTS | none | the nearest section is Learn & Train (`/learn-train`) |
| FACULTY | none | no entry point for faculty as an audience |
| COMMUNITY | Community (`/community`) | |
| Community > Jobs | `/community/jobs` | |
| Community > Instrumentation Facilities | none | the exact phrase is on 1 built page (`/community`), the bare word on 3; no page of its own |
| Community > Data Portals | none | 44 legacy entry pages; none here (see table 2) |
| Community > Cyberseminar Archives | `/learn-train/cyberseminars` | different section |
| Community > Research Projects | `/about/impact` | the nearest, not the same thing; **(mine)** |
| Community > News | `/community/news` | |
| Community > Events | `/community/events` | |
| Community > Water Science Exchange | none | mentioned on 15 of 136 built pages; no page of its own |
| DATA SERVICES & SOFTWARE | Data & Computing (`/data-platforms`) | |
| Data Services > Solutions / Products | `/data-platforms` | one page here; legacy has 9 pages under `/data-services/` |
| Data Services > Research Data Management Guide | none | |
| Data Services > Frequently Asked Questions | none | 0 of 136 built pages mention it |
| DONATE | Support CUAHSI (`/support`, a utility link) | |
| footer: Acknowledging CUAHSI | none | |
| footer: Policies & Conduct | none | |
| footer: Contact Us, Membership | `/contact`, `/about/membership` | |

Counts, from the table: the legacy tree has 26 header entries and 4 footer entries (30; Contact Us, Membership and Policies & Conduct appear in both). 11 of the 30 have no counterpart here (Policies & Conduct twice, Document Library, Students, Faculty, Instrumentation Facilities, Data Portals, Water Science Exchange, Research Data Management Guide, Frequently Asked Questions, Acknowledging CUAHSI); 4 are folded into a page here (Who We Are, What We Do, Solutions, Products); the other 15 have a page here, one of them (Research Projects) only approximately **(mine)**.

Entry points that exist here and not on the legacy site: **Hire CUAHSI** (`/hire-cuahsi`, a paid-work and quote page), **Member Portal** (`/member-portal`, a header utility link), Impact (`/about/impact`), Newsletter (`/community/newsletter`), Campus visits (`/community/campus-visits`), Learn & Train and its programs and archive. Entry points that exist on the legacy site and not here: **Students** and **Faculty** (audience entry points), Donate as a top-level item (here a utility link), Document Library.

Legacy social links in header and footer: Facebook, Bluesky, Instagram, LinkedIn, YouTube (5). This site's footer: Bluesky, YouTube, LinkedIn (3).

## 2. Page types to collections

Legacy counts are the 767 URLs of stage 1 (of which 755 returned a saved page). Counts here are files in `content/` (and `full-team.json` for staff).

| legacy type (count) | here | count here | fields the legacy page shows that the schema has no place for | fields the schema has that the legacy page did not show |
|---|---|---|---|---|
| event (118) | `events` collection, `/community/events/<slug>` | 40 | one rich body (the AGU sample lists staff and a booth number): the schema has `description` (one string) and the file body; contact details on 20 of 118 | `type`, `audience`, `tags`, `featured`, `timezone`, `newsletter_source` |
| workshop (20) | `events` with `type: workshop` | 11 of 40 | instructors with affiliations; "Overview" section | |
| cyberseminar (67) | `cyberseminars`, listed on one page, no page of its own | 15 (11 published) | start time and time zone, venue, a registration link (52 of 67 pages link a Zoom registration), "Convened by" | `youtube_id`, `speakers`, `speaker_orgs`, `has_transcript`, `tags` |
| cyberseminar series (20) | none: `series` is a text field on a seminar | 0 | the series page: date range, convener names and titles, description, registration (13 of 20 link Zoom) | `series_slug` only |
| news post (49) | `news`, `/community/news/<slug>` | 12 | | `excerpt`, `tags`, `source_url`, `author` |
| newsletter issue (19) | `newsletter`, `/community/newsletter/<slug>` | 9 | on the legacy site these are news posts (title "e-Newsletter ..."); no separate type | `mailchimp_id`, `mailchimp_url`, `topics`, `people_mentioned`, `programs_mentioned` |
| person: staff (22) | `full-team.json` plus 8 `.md` profiles, `/about/team/<slug>` | 22 (6 with a page) | email (hidden by a script on the legacy page) | `department`, `pronouns`, `photo`, `fun_fact`, `links`, `has_profile` |
| person: guest lecturer (69) | none | 0 | name, institution, lecture topics, hidden email | |
| job (13) | `jobs`, listed on one page | 29 | contact (hidden email, 10 of 13), experience level | `location`, `type`, `tags`, `source`, `source_id` |
| program (5) | `programs`, `/learn-train/programs/<slug>` | 4 | | two shapes; one has `apply_url` and `next_date` |
| data portal entry (44) | none | 0 | accession date, site owner, website, link to data, geographical scope, API, export formats, contact (35 of 44) | |
| graduate program (107) | none | 0 | institution, department, website | |
| document or file (76) | none | 0 | title, "Download Document" | |
| listing (73), landing page (6), static page (42) | page components in `pages/` | 9 listings, 6 landing, 5 static | | |
| other (17: 8 redirects, 4 not found, 5 empty) | n/a | | | |

Types here with no legacy counterpart: **impact story** (`research`, 31, shown at `/about/impact/`; the legacy site has "Ongoing Research Projects", 1 page), **board** (1 file, no page), **community profiles** (4 files, no page), **members** (`reps.json`, 229 rows, a directory at `/member-portal`).

Notes: the 107 graduate-program rows are the `-dev` stubs Jordan noted at stage 1; whether the legacy site publishes them elsewhere I did not examine. The legacy event page showed a date range written "December 20 - 20, 2025" for an event whose title says Dec 15-19; that is a legacy display fault, recorded and not interpreted.

## 3. Functions

Evidence base: all 755 saved legacy pages (forms, iframes, scripts, outbound links, aggregated by host), and this repo's page and component files.

| function | legacy (evidence) | here | status |
|---|---|---|---|
| search | a keyword form to `/search/results` on every page (762 forms in 755 pages) | `SiteSearch.vue`, Pagefind in the browser; no results page; works only on the built site | present differently |
| subscribe to the newsletter | a link labelled "Subscribe" to a Mailchimp list on 59 of 755 pages' main content | `/community` links the same Mailchimp list twice (`pages/community/index.vue` lines 73 and 242), and `/community/newsletter` (line 29) links a different provider, a Constant Contact opt-in, so this site has two subscribe targets. The **home page** (`pages/index.vue` lines 266 to 268) has an email box and a Subscribe button that are not in a `<form>` and have no handler: they do nothing | present differently; **the home page box is non-functional** |
| donate | Zeffy donation form in an iframe on `/donate` (1 page) | the same Zeffy embed on `/support` (`pages/support/index.vue` line 67) | present |
| register for an event | links out to Zoom registration (94 pages), Jotform (83), Cvent (9), Qualtrics or Google Forms (6) | `registration.url` on an event shows a button on the event page when the event is not past (`pages/community/events/[slug].vue` line 133) | present differently (a link in the file, per event) |
| register for a cyberseminar | a Register link on 52 of 67 seminar pages and 13 of 20 series pages | no registration field in the `cyberseminars` schema | absent |
| submit a job | the job board links a Jotform | `/community/jobs` "Post a job" links the Jotform `222235514170142` (lines 85 and 153); the legacy job board links `cuahsi.jotform.com/222235514170142`, and the legacy contact page links `form.jotform.com/222235514170142`, the same id | present |
| apply for a job | an "Apply Now" link per job | each job has a required `url` | present |
| log in | none: the forms in all 755 saved pages are search, hidden, submit and select inputs only; no password field | no login either. `/member-portal` is a page: it renders a directory of 229 member representatives, with 229 `mailto:` links in the built HTML, for anyone who opens the URL, plus resource tiles marked "coming soon" | not a function on either site; see "Raised" |
| download a document | 76 library pages, 116 linked files (105 PDFs), 260.5 MB | one PDF hosted here (`/cuahsi-campus-visit-flyer.pdf`) and 5 distinct links to PDFs on `www.cuahsi.org/uploads/` in `pages/` | present differently; 5 links depend on the legacy host |
| filter a listing | a category select on news (66 selects) and a keyword form; guest-lecturer and data-portal filters | filter chips on events, jobs, cyberseminars, impact and membership (client-side) | present differently |
| page through a listing | a pager `/pN` (45 pager pages fetched) | I found no pager in `pages/` (searched for pager, load-more and next-page words); long lists render on one page | present differently **(mine)** |
| watch a recording | YouTube iframe or link on 17 of 67 seminar pages and 5 of 20 series pages | a modal with a `youtube-nocookie` embed per published seminar that has a `youtube_id` (11 of 15 published) | present |
| contact someone | `/about/contact-us` with a Jotform; staff emails hidden by a script | `/contact` with 4 routes (mailto addresses); **the quote form on `/hire-cuahsi` is `<form @submit.prevent>` with no handler: "Send request" does nothing** | present differently; **the quote form is non-functional** |
| follow on social media | 5 networks | 3 networks | present differently |
| analytics | Google Tag Manager script on 755 of 755 pages | none found in `nuxt.config.ts`, `app.vue`, `components/`, `pages/` | absent |

## 4. Raised (discrepancies and defects; not fixed here, per P4 and rule 5)

1. **Two forms look real and do nothing**: the home-page newsletter box and the `/hire-cuahsi` quote form. Both are code changes. Proposal **(mine)**: a code PR that makes the home box a link or form to a subscribe URL; which provider (Mailchimp on `/community`, Constant Contact on `/community/newsletter`) is Jordan's decision; the quote form needs a decision from Jordan (where should requests go?).
2. **`/member-portal` publishes 229 representatives' email addresses in public HTML** (counted, not copied; C11 and P8). `CLAUDE.md` says the route is "unlinked from the nav on purpose", yet a "Member Portal" link is in the header (`components/AppHeader.vue` lines 59 and 81). The site is noindex but the address is public. The legacy site shows no equivalent in the pages I read; whether it publishes representative emails elsewhere I did not examine. Jordan to decide.
3. **No cyberseminar registration** in the schema, while the legacy site links registration on 52 of 67 seminars.
4. **No place in the schema or pages** for data portal entries (44), graduate programs (107), library documents (76), guest lecturers (69), cyberseminar series (20).
5. **Five PDF links point at the legacy host**; if that host changes, they break.
6. **Legacy URLs to redirect (stage 7):** every legacy section's URL pattern differs from this site's (stage 1 saw `/job-board`, `/about/our-team`, `/cyberseminars/...`).

## 5. Six-item check (P5)

Present: legacy **Governance** to `/about/governance` (file `pages/about/governance.vue` exists and the built route is in `.output/public/about/governance`), **Events** to `/community/events` (both exist), **Donate** to `/support` (the Zeffy iframe is at `pages/support/index.vue` line 67). Missing: **Policies & Conduct** (0 built pages mention "Policies"), **Frequently Asked Questions** (0 mention it), **Instrumentation Facilities** (no route; the phrase is on 1 built page and the word "instrumentation" on 3, which is why I wrote "no page of its own" and not "not mentioned"). The same check showed "Water Science Exchange" appears on 15 built pages and has no page; I wrote that, rather than "none".

## 6. Not examined

- Pages of each legacy type beyond the one sample page read (table 2).
- Images, photos, maps and layout of legacy pages; only text and links were read.
- Whether the Mailchimp, Jotform, Zoom, Cvent or Zeffy links still work (nothing was fetched).
- Script behaviour on the legacy site (`jquery.main.js`): I listed scripts by host and read no source; "filter" and "pager" behaviour is inferred from forms and URLs.
- Whether the legacy site has feeds, a sitemap beyond the 681 URLs, or logged-in areas.
- Table 1 "nearest entry" judgments are mine.
- Counts in section 3 from the saved legacy pages (59 of 755 subscribe, 17 of 67 and 5 of 20 YouTube, 94 Zoom, 755 of 755 Tag Manager, 52 of 67 and 13 of 20 registration) come from my own script and were not independently recounted by the reviewer, who may not read `raw/`. Modules configured outside the files I searched were not checked for analytics. The exact count of 229 `mailto:` links on `/member-portal` was my count; the reviewer saw many but did not count.

## 7. Personal data (P8)

No email address, phone number or personal contact detail appears in this report; the counts in section 3 and "Raised" are counts only. Names appear only as URL slugs of staff pages already in the stage 1 outputs.
