# Where documents, policies, graduate programs and the archive live (proposal and prototype, 5 Oct 2026)

Jordan's brief: the biggest issue is the lack of a strategic place for documents and policies that fits the navigation without the site feeling overloaded. Keep the graduate programs list alive and updated, a library of key documents and historical references, and an archive for past events. Stale job posts, other stale things and the lecturer inventory are not a worry. This is **my proposal**; a prototype of the layout is on branch `task/proto-library-ia`. Nothing is decided.

## 1. My take in one sentence

**Do not add anything to the header. Give each section a quiet row of tabs under its heading, and put the new homes in those rows.** The header stays at five items; the sections grow without the front door getting crowded.

## 2. Where each thing goes

| what | where | address | why there |
|---|---|---|---|
| Policies (code of conduct, concern reporting), reports and plans, bylaws and minutes, historical papers | **About → Documents & policies** | `/about/documents` | People who look for governance and policies look under About; one page with four labelled sections, policies first because they carry an obligation. |
| Graduate programs directory | **Learn & Train → Graduate programs** | `/learn-train/graduate-programs` | Prospective students are choosing training; it sits beside programs and cyberseminars. |
| Archive of past events and workshops | **Learn & Train → Archive** (exists) | `/learn-train/archive` | Already built; the tab makes it findable. A "past events" link from Community → Events is the natural second door (not built in the prototype). |
| Everything, by search | the search box in the header | existing | Documents are found by name without browsing. |

Plus two footer links (Documents & policies, Graduate programs) so both are reachable from every page. The tab rows are: **About:** Overview · Team · Governance · Membership · Impact · Documents & policies. **Learn & Train:** Overview · Programs · Cyberseminars · Archive · Graduate programs.

## 3. Options I considered

| option | why not |
|---|---|
| A sixth header item ("Library" or "Resources") | The header is full (five items, search, Member Portal, two links above it); a sixth item is the overload you want to avoid, and it takes policies away from About. |
| A drop-down or mega-menu | Heavy, needs script, and is the opposite of "elegantly simple". |
| A third utility link ("Library") | Splits policies from About and crowds the thin bar at the top. |
| Footer only | Invisible to most visitors. |
| **Section tabs plus two footer links (chosen)** | Extends what the site already does: the About page and the Impact page already had a hard-coded sub-nav; this puts it in one place and gives every page of a section the same row. |

## 4. How the lists stay alive (the part that matters over time)

Plain words: a *record* is one entry (one program, one document); a *content collection* is a folder of such records that the site reads to build a page; a *schema* is the list of fields each record must have, checked automatically; the *content lint* is a periodic check that lists things needing attention.

- **Graduate programs.** One record per program with institution, department, level, website and a **last reviewed date**, shown on each row. Staff review the list once a year; the content lint procedure (documented in `CLAUDE.md`) would be extended to list entries not reviewed in 12 months. A "Tell us about a change" link goes to `/contact`. The starting data would come from the 30 legacy list pages (a content task with a stated source, never copied without one; the 107 `-dev` stub pages carry no more than a name and a link).
- **Library.** One record per document with a kind (policy, report, plan, minutes, historical paper), a year and a file. The kinds are the ones the legacy library holds (stage 7: 49 meeting minutes, 9 Summer Institute reports, 6 annual reports, 2 strategic plans, 9 historical papers). New documents are added as records, so the page grows by adding a file, not by building a page. Hosting the files is a change to `public/` that outside pages link to, so it needs your approval before it is done (outside pages link to files in that folder).
- **Archive.** It already builds itself from the events (`workshop` and `field` types, grouped by year); nothing new to maintain.
- Both new lists would be new content collections with a schema in the checker. Setting that up is a code change and filling it in is a content change, so they are two separate pull requests (a rule of this project: one branch never mixes the two).

## 5. What the prototype shows (branch `task/proto-library-ia`)

- **New:** `components/SectionNav.vue` (the tab row, one list per section); `pages/about/documents.vue` (policies, reports and plans, governance documents, historical papers, in a shell); `pages/learn-train/graduate-programs/index.vue` (a directory with working search and level filters over six **placeholder** rows).
- **Changed:** the tab row now appears on the About pages (overview, team, governance, membership, impact) and the Learn & Train pages (overview, cyberseminars, archive); the header is untouched; two links are added to the footer's Explore list.
- **Placeholder content:** the headings and document titles are real (from the legacy library, by title); no document is hosted, the cards do not open (except the bylaws, which this site already links), and the program rows say "Example University A". A banner on each new page says so.
- **Deliberate changes to existing pages (rule 9, a refactor must keep what visitors see, so each change is listed; see also section 9):** the old tab row, which appeared only on the About overview and the Impact page, had nine entries (Overview, Mission & values, What we do, History, Our team, Governance, Membership, Impact, Contact). It is now the shared row of six page tabs: the three in-page jumps and the Contact link are gone from it (the sections they pointed to are still on the About overview, and Contact is in the header). Team, Governance, Membership, the Learn & Train overview, Cyberseminars and the Archive **gain** a tab row they did not have.
- **One overlap left on purpose:** the Governance page already has a small Documents block (bylaws, strategic plan, annual report). The prototype leaves it and the new Documents & policies page repeats the bylaws link. Proposed: the new page owns documents; Governance keeps one line pointing to it. The screenshot comparison (`npm run visual:compare`) will therefore fail on these pages; that is expected and not a regression.

## 6. What this changes in the stage 7 decision list (PR 62)

(The stage 7 decision list is in PR 62, not yet merged; its counts come from the legacy inventory titles.) Jordan's direction settles several rows: **graduate programs** are kept and maintained (option A, one directory page, with the review date); **the library** is kept (reports, plans and historical papers hosted; the minutes still need a ruling); **past events** go to the archive; **guest lecturers** are dropped (option C) and **stale job posts** are redirected to `/community/jobs` without migration. I will record these as his rulings once he confirms them in the PR.

## 7. What I could not check, and what to look at

I took screenshots of the new pages and the About and Archive pages at 1280px and 390px and looked at them. I cannot judge the feel; that is yours. On the deploy preview, please open, at phone width (390px) and desktop width (1280px):
- `/about/documents`: do the four sections feel like one calm page? Do the tabs under the heading read as part of About? On a phone the tab row scrolls sideways and opens on the current tab; check that it is obvious that it scrolls.
- `/learn-train/graduate-programs`: type in the search box and click the level chips; do they feel right?
- `/about`, `/about/governance` and `/learn-train/archive`: the tab row appears under the heading; does it add clutter or help?

## 8. Questions for Jordan

1. Is **About** the right home for documents and policies, or would you accept a sixth header item for a "Library" if it keeps policies and reports together?
2. Meeting minutes: public, members-only (a Member Portal area) or dropped?
3. Are Graduate programs right under **Learn & Train**, or does it belong under Community?
4. Are the tab labels right ("Documents & policies", "Archive")?
5. Should Community and Data & Computing get a tab row too, in the same style, or stay as they are?

## 9. Update, 6 October 2026: Jordan's rulings and the first code change

**Rulings (Jordan, 6 October):** Documents & policies stays under About, and the **meeting minutes are public and on that page**. Graduate programs: **one table built from the 30 legacy list pages**, under Learn & Train. Water data portals: **one table, under Data & Computing**. Short columns only for both (graduate programs: institution, programs, degrees, website, last reviewed; portals: name, owner, scope, link, last reviewed). Large PDFs: some published as **HydroShare resources** and linked out with a citation; the 2021 annual report is to be compressed.

**Built in this code change** (no content file is added; the pages say "being compiled" until the data arrives): the tab row on About, Learn & Train and Data & Computing; `/about/documents`, `/learn-train/graduate-programs` and `/data-platforms/portals`, each reading a list in `content/` (`documents`, `graduate-programs`, `data-portals`, as JSON); the checker (validator) knows all three. A document is either a PDF hosted here (`file`) or hosted elsewhere (`url`, such as a HydroShare resource, with a `citation` shown under "How to cite").

**A dividing line for the PDFs (my proposal, from the legacy file sizes in `agent/parity/legacy-files.csv`, recounted after review):** *documents about the organisation* live on this site; *scientific and technical reports* go to HydroShare, each with a citation. The line is the kind of document, not its size, so a future report is easy to place.
- **On this site, about 50 MB:** the 50 meeting-minutes files (15.9 MB; the 49 minutes pages link 50 files), the bylaws (0.2 MB), the two strategic plans (7.3 MB; the 7.1 MB single-pages file can be compressed too), and the five annual reports other than 2021 (26.8 MB). The compressed 2021 report adds about 6 MB.
- **On HydroShare, cited, 109.7 MB of distinct files:** the Summer Institute and technical reports: 13 file entries (133.2 MB) of which 11 are distinct, because the 2022 report is linked three times (one a `.docx.pdf` copy of the same size) and the 2024 report twice. The 2018 report alone is 24.9 MB. The TR series files that sit in the "other" group (TR13, 11.4 MB; TR6, 5.7 MB) would join them.
- **Not yet placed: the "other" group, 44 file entries (49.4 MB: 33 PDFs, 10 PNG, 1 JPG)**, including the 2025 membership meeting packet (8.6 MB), flyers, the first-year graduate guide, job-board PDFs and images used on pages. They need a look before they are placed; most are not library documents.

**The 2021 annual report** (27.7 MB, 13 pages, 31 images): I re-sampled its images with a PDF library and compared the pages side by side at screen size. At **120 dpi it is 5.9 MB** and at **150 dpi 12.7 MB**; at 100 dpi 4.9 MB. The text is untouched (only images are re-sampled) and in a side-by-side render at screen size I could see no difference (an agent's reading of a render, so please open the two candidate files yourself); print quality is lower. My suggestion is the 120 dpi version. The candidates are in `.agent/pdf/` on this machine (not committed; hosting a file under `public/` needs Jordan's approval).

**Further visible changes to existing pages (rule 9), listed after review:** the old tab labelled "Our team" is now "Team"; each tab has slightly different padding and a 2px underline on the current one; the old row used plain links (a full page load) and the new one uses the site's client-side links; the Data & Computing overview page gains a tab row (Overview, Water data portals); the About overview and Impact lose the in-page jumps and the Contact entry (the section ids still exist but nothing links to them; Contact is in the header). The tab row's side padding matches the heading on each page (40px on a phone like most pages; the Archive page uses 20px, so its heading and row sit 20px further left than the others in its section: left as is).

**Merging alone.** The three new pages and their footer and tab links show "being compiled" until the data changes merge, so this change should merge **together with, or just before, the data changes**; Jordan decides when. The pages say each row is reviewed every year; the schema's `last_reviewed` field exists but the check that lists rows older than 12 months (the content lint) is not built yet, and is on the backlog. The three new routes are not in the screenshot-comparison route list and the nine changed existing pages will fail that comparison until the baselines are refreshed in their own change from a build of `main` (the project's rule).
