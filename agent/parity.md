# Parity analysis: this site against www.cuahsi.org

A staged, read-only comparison of the legacy site at https://www.cuahsi.org with this
one, in structure and in content. Run a stage only when Jordan asks for it. Stages
marked STOP end with a stop for his review.

## What "parity" means here

Not a copy. This site's structure is deliberately different from the legacy one. The
goal is that **every legacy page has a decided fate** before this site replaces it:

- `migrated`: its content exists here, at a named route.
- `merged`: its content is covered by a page here that is organised differently.
- `redirect`: no equivalent is wanted, but the URL should land somewhere sensible.
- `retired`: deliberately dropped.
- `external`: the content now lives on another platform (HydroShare, YouTube, a
  partner site).
- `undecided`: needs Jordan.

Fates are decided **per body of work** (stage 7) and each URL inherits its body's fate
unless a row in `dispositions-urls.csv` overrides it (exceptions, tier A pages, cited
URLs); a script expands this to every URL. `link out` is not a separate fate: it is
`external` with the target named. A body proposed to be brought here is `migrated`
(proposed) with the collection or page named, and stays `proposed` until it is done.

The analysis ends when no legacy URL is `undecided` and Jordan has seen the gaps
ranked by how much they matter. Closing the gaps is separate work, scheduled from the
backlog this analysis produces.

## Priority (set by Jordan on 5 October 2026)

The question that matters is **which large concepts or bodies of work on the legacy
site are missing from this one**, not whether individual items agree. Item-level
accuracy (an event's date, a title's wording, whether one of 118 old events has a
twin here) is out of scope for stages 5 to 8 except where it changes a decision about
a whole body of work. A **body of work** is a group of legacy URLs that serve one
purpose for one audience: a section, a collection or a type (for example "document
library", "graduate programs directory", "policies and conduct"). The unit of analysis
and of decision from stage 5 on is the body of work, not the URL. Stage 4's per-URL
mapping (`agent/parity/mapping.csv`, with the stage 3 report: both are on open pull
requests and must be merged before stage 5 starts) is the evidence underneath; its open
questions (the ten least-sure matches, the `probe review` rows) matter only if a ruling
would change a body-level answer.

Known and deferred: the **cyberseminar archive** is known to be largely missing and
has not been started (Jordan, 5 October 2026). It stays in the ranking, sized and
marked "known, deferred", so the backlog has its size; it is not a finding.

## Rules for this analysis

P1. **Read-only on both sites.** No file under `content/`, `pages/` or `components/`
    changes. No content is created from legacy pages during the analysis, however
    obvious the gap. Gaps go in the backlog.
P2. **Fetch the legacy site once, politely, and work from the snapshot.** Read
    `robots.txt` first and obey it. One request at a time, at least one second apart,
    with a User-Agent that names CUAHSI and Jordan's contact address. Save every
    response under `raw/legacy-site/YYMMDD/` (gitignored). Every later stage reads the
    snapshot, never the live site. Record the fetch date in every output file.
P3. **A match is a claim with evidence.** Each mapped pair records why it was matched
    and a confidence: `exact` (same slug or same canonical title and date), `probable`
    (strong title or text similarity; say the measure), `weak` (same topic, different
    item), `none`. Never raise a confidence to make a number look better.
P4. **Discrepancies are reported, not resolved.** If the two sites state different
    facts (a count, a date, a name, an address), record both with their locations.
    Which one is right is Jordan's call.
P5. **Counts with denominators, and a sample, in every stage report** (rule 12).
    Each report names six items checked by reading: three the stage called matched or
    present, three it called missing.
P6. **Judgment is proposed and labelled.** Dispositions, importance rankings and
    "equivalent page" calls are the agent's proposals. Say so, and say why.
P7. **Say what could not be seen.** Pages behind a login, content drawn by JavaScript
    that is absent from the fetched HTML, PDFs not opened, forms not submitted. Each
    stage report has a "Not examined" list with counts.
P8. **Personal data.** The legacy site lists staff, board members and contacts. The
    inventories record that a page contains contact details, not the details
    themselves.

## Layout

```
raw/legacy-site/YYMMDD/     fetched pages and a fetch log. Gitignored. Never edited.
agent/parity/               committed outputs, one CSV per stage (below)
agent/reports/YYMMDD_parity-stageN.md    the stage reports
scripts/parity/             the scripts that produce the CSVs. Re-runnable.
```

All work is on code branches (`task/parity-stageN`). CSVs are generated by script
from the snapshot and the built site, never typed by hand, so a re-run after either
site changes produces a comparable result.

## Stage 0. Setup and scope. STOP for approval.

No fetching yet. Produce a one-page plan for Jordan covering:

1. What `robots.txt` and any `sitemap.xml` on the legacy site say, from fetching
   those two files only.
2. The tooling you propose: how pages are fetched, how HTML is parsed, and any
   dependency that needs (rule 8).
3. An estimate of the crawl size and duration, and where the crawl stops: same host
   only; a page cap that you state; which query strings and paginated listings are
   followed.
4. What is out of scope: other CUAHSI hosts (HydroShare, the JupyterHub, the Water
   Content Portal), the member portal, anything behind a login.
5. What Jordan can supply that changes the analysis: the 12-month Search Console
   export (clicks and impressions per URL), and any list of URLs known to be cited in
   NSF reports or newsletters.

## Stage 1. Legacy inventory. STOP for review.

Crawl from the sitemap if there is one, and from the navigation and footer in any
case; compare the two sets and report URLs found by only one route. Output
`agent/parity/legacy-inventory.csv`, one row per URL:

`url, status, redirect_target, title, h1, section, page_type, date, word_count,
heading_count, internal_links_in, internal_links_out, files_linked, has_form,
has_embed, has_contact_details, in_nav, found_via`

- `section`: the top-level navigation area it belongs to.
- `page_type`: classify by template and URL pattern, not one by one: landing page,
  static page, news post, newsletter issue, event, cyberseminar, cyberseminar series,
  job, person, program, document or file, listing, other. State each rule you used
  and how many URLs it caught. List the `other` rows in full.
- `files_linked`: PDFs and other downloads, counted. List them separately in
  `legacy-files.csv` with URL, type, size and the pages linking to them. Do not open
  them yet.

Report: totals by section and by page type; broken links and redirects found inside
the legacy site; the date range of dated items by type; the navigation tree as an
indented list.

## Stage 2. New-site inventory.

From a fresh `npm run build:search`, the same columns for every route in
`.output/public`, plus `source` (the content file or page component behind it).
Output `agent/parity/new-inventory.csv`. Include unpublished content items in a
separate list with the reason, since they are candidates for closing gaps.

## Stage 3. Structural parity.

Three comparisons, each a table in the report.

1. **Navigation.** The two trees side by side. For every legacy nav entry: the
   nearest entry here, or "none." Note entry points that exist for an audience on one
   site and not the other.
2. **Page types to collections.** For each legacy page type: the collection or page
   here that carries it, the count on each side, and the fields the legacy type shows
   that the collection's schema has no place for (and the reverse).
3. **Functions.** Everything a visitor can do on the legacy site, found from forms,
   embeds, outbound service links and scripts in the snapshot: search, subscribe,
   donate, register for an event, submit or apply for a job, log in, download a
   document, filter or page through a listing, watch a recording, contact someone.
   For each: present here, present differently, or absent, with the evidence.

This stage is about shape, so it reports no content gaps. Its output feeds the
schema and component backlog.

## Stage 4. Content mapping. STOP for review.

Map every legacy URL to its counterpart here. Output `agent/parity/mapping.csv`:

`legacy_url, page_type, new_route, new_source, confidence, matched_by, notes`

Work type by type, in this order, because the easy types calibrate the hard ones:

1. Items with stable identity: people (by name), cyberseminars (by YouTube ID where
   present, then title and date), newsletter issues (by month), programs (by name).
2. Dated items: events and news (title similarity plus date within a stated window),
   jobs (by external URL, then organisation and title).
3. Static pages: by title, then by heading overlap. Expect many `merged` and `none`.

Report per type: legacy count, matched `exact`, `probable`, `weak`, `none`, and the
count here with no legacy counterpart. Then the unmatched legacy URLs in full, and
the ten `probable` matches you are least sure of, for Jordan to rule on. His rulings
are recorded in the CSV as `matched_by: jordan`.

## Stage 5. Bodies of work, and spot checks.

Replaces the page-by-page depth comparison. Two parts.

**5a. The bodies of work.** Group every legacy URL into a body of work, by rule from
the inventory and the stage 3 and 4 outputs (path prefix, page type, navigation
section), and write `agent/parity/bodies.csv`, one row per body:

`body, audience, legacy_urls, legacy_words, in_nav, here_equivalent, here_status, known_to_jordan, notes`

`here_status` is `absent` (nothing here), `partial` (some of it, or a page that
covers it in outline), `present`, or `different` (done another way: say how).
`legacy_words` and `legacy_urls` show size; `here_equivalent` names the route,
collection or page. Bodies are named in plain language. Where the grouping is a
judgment (is "Policies & Conduct" one body or four pages?), say so (P6). `known_to_jordan` is `yes` where Jordan has said in the conversation that he knows the
gap and its status (the date and quote go in `notes`), otherwise `no`; I set it and
never infer it. Every legacy URL belongs to exactly one body; check that by script.
URLs that fit no rule go into a body named "Unassigned", listed in the report with
their count, and the stage does not finish until I have read them.

**5b. Spot checks.** For the largest matched bodies and the pages a visitor lands on
first (About, Membership, Governance, the data tools, Donate, Contact, the program
pages), compare ten to fifteen pairs with the `page-comparer` subagent (one finding
per pair, fixed format, snapshot file against built HTML). The aim is to see whether
a body that is "present" is present in substance: `equivalent`, `summary` (shorter on
purpose, links out), `partial` or `stub`. Record only factual differences a reader would act
on: numbers, names or roles, status (open or closed, current or past), URLs and
whether contact details differ (P8: say that they differ, never the details), for
example "more than 130 member organizations" against "101 member institutions".
Wording, the dates of single events and typos are not recorded. This narrows the
earlier plan: `depth.csv` and `discrepancies.csv` are not produced; their place is
`agent/parity/spot-checks.csv` (verdict and differences per pair). The pilot is five
pairs by me and the same five through the subagent (earlier plan: ten each); report
how many verdicts differ. **Gate:** if more than one of the five differs, stop and
ask Jordan before the rest; otherwise proceed and say so.

## Stage 6. Importance of each body of work.

Rank the bodies, not the URLs. For each body show the inputs separately, then a tier:

- Search Console clicks and impressions over twelve months, summed over the body's
  URLs (the export is at `raw/search-console/261005_pages_all.csv`; say plainly if it
  does not cover a body).
- Internal links pointing into the body from the rest of the legacy site, and whether
  it is in the navigation or footer.
- Who it serves and what an absence costs them (a visitor, a member, a funder, staff,
  a legal or organisational obligation such as a code of conduct). This is the
  strongest input and it is a judgment: label it as mine and give the reason.
- Recency and whether it is still current.
- Whether it is externally cited. Jordan has no list (stage 0); I build one from the
  newsletters and `content/` (cuahsi.org URLs they cite: 47 found in stage 0, 8 of
  them not found on the legacy site in stage 1) and say how it was built. **Every
  cited URL gets its own row in `dispositions-urls.csv`, whatever its body's tier.**

Tiers: `A` a visitor, member or funder would notice its absence, or it carries an
obligation; `B` worth having; `C` long tail. State the thresholds. The tier is a
proposal (P6). Per-URL tiers are produced only inside tier A bodies, to find the few
pages that matter most.

## Stage 7. A fate for each body of work. STOP for decisions.

Propose one fate per body of work, from the list under "What parity means" (a
body proposed to come here is `migrated`, naming the collection or page). Output `agent/parity/dispositions.csv`
with rows per body and per rule, and `agent/parity/dispositions-urls.csv` for
exceptions and for tier A URLs:

`body_or_url, disposition, target, tier, rule, decided_by`

The report for this stage is a **one-page decision list for Jordan**: each body, its
size, its tier, my proposal and why, in plain language, ordered by tier. He rules by
body; `decided_by` is `proposed` until he does. Rules for the long tail (for example
"events before 2024: redirect to the events archive, N URLs") are listed first so a
single decision covers them.

From the approved dispositions, generate `agent/parity/redirects-draft.txt` in the
host's redirect format: the script expands each body's fate and target to its URLs
(a body needs a target route, or `none` for retired) and applies the URL-level
overrides. It is a draft: do not install it. Check it by script: every legacy URL with
a 200 status appears exactly once; no target is itself redirected; every target route
exists in the built site. Separately, the draft has a section for **this site's own
stubs**: Jordan asked (5 October 2026) for "replace meta-refresh stubs with real
redirects" under `pages/highlights/` to be done with this list. They are routes here,
not legacy URLs, so the legacy check does not cover them; the script checks that each
stub's target exists. Installing anything is a code change and a URL change (rule 8),
with Jordan's approval, in its own pull request.

## Stage 8. Report and backlog.

`agent/reports/YYMMDD_parity-summary.md`, two pages, for a reader who is not a
developer. It leads with the answer to the question in "Priority":

1. **The bodies of work, ranked**: a table of body, size (URLs and words), who it
   serves, status here, tier, decided fate. Cyberseminars appear as "known, deferred".
2. What this site has that the legacy site does not.
3. Structural gaps: navigation entries, page types and functions with no counterpart
   (from stage 3).
4. The headline counts: legacy URLs; how many are migrated, merged, redirected,
   retired, external, undecided; the same split for tier A alone.
5. Content gaps by collection, with counts ("cyberseminars: N of M present"), from
   `bodies.csv` and `mapping.csv`.
6. Factual discrepancies that matter (stage 5b), with the ten that matter most.
7. What was not examined (P7).
8. A proposed backlog, as roadmap tasks: content tasks (which collection, how many
   items, what source), code tasks (schema fields, page types, functions), and
   decisions. Each with its tier and a rough size. Nothing is started.

## Refresh

The legacy site keeps publishing until this one replaces it. When Jordan says
"refresh parity": take a new snapshot under a new date, re-run stages 1, 4 and 5a by
script, and report only the difference since the last run: new legacy URLs (and any
that fit no body), changed pages among tier A, and matches that broke. Append one line per refresh to
`agent/ingest-log.md`.

## Starting observations

Seen on the legacy homepage on 5 October 2026, by Jordan's assistant, not by this
analysis. Each is a lead to confirm in the stage named, not a finding.

- Top-level navigation is About, Students, Faculty, Community, Data Services &
  Software, Donate. This site has no Students or Faculty entry points. (Stage 3.)
- Legacy sections with no obvious counterpart here: Policies & Conduct, Document
  Library, Instrumentation Facilities, Data Portals, Research Projects, Water Science
  Exchange, Research Data Management Guide, Frequently Asked Questions, Acknowledging
  CUAHSI, Workshops. (Stages 3 and 4.)
- The homepage describes an archive of over 150 recorded cyberseminars and links to
  series pages. This site has 15 seminar files. (Stage 4.)
- Newsletter issues, guest spotlights and anniversary reflections are published
  there as news posts. This site separates newsletters from news. (Stage 3.)
- The legacy site's description says it represents more than 130 universities and
  organizations; this site says 101 member institutions. (Stage 5, discrepancy.)
- Events and cyberseminars have their own detail pages with times and descriptions.
  (Stage 3.)
- URL patterns differ throughout, for example `/job-board`, `/about/our-team`,
  `/cyberseminars/...`. Nearly every legacy URL will need a redirect. (Stage 7.)
