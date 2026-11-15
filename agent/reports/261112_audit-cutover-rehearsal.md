# A7: Cut-over rehearsal and checklist

Site audit task A7 (org issue 112, epic 99), 12 November 2026. Read-only on both sites and on DNS: ordinary lookups, one request a second to the prototype, nothing changed anywhere. Built from `main` at `bfd158f` (the fork, 12 November). Nothing is fixed here. The rehearsal needed a staging name; none exists, so the "staging name" is the prototype `cuahsi3-website.netlify.app` (see section 4 for what that can and cannot show).

Ad hoc command output (headers, registration date, resolver times, address owners) is saved in `a7_adhoc_checks.txt`. Data (undated, per Jordan's file-name rule of 11 November; the project file names these `YYMMDD_`, and I followed the personal rule): `agent/audit/a7_dns_facts.csv` (46 rows), `a7_cutover_sim_urls.csv` (927 rows), `a7_cutover_sim_numbers.json`, `a7_control.txt`. Scripts: `scripts/parity/a7-dns-facts.mjs` (new; lookups only) and A2's `cutover-sim.mjs` and `cutover-control.mjs` (unchanged, re-run).

## 1. The answer in one paragraph

**The switch itself is small and reversible: two DNS records at one registrar. What is not ready is everything around it.** `cuahsi.org` is registered at Network Solutions, and its name servers are Network Solutions' too (the name servers are the registrar's, which suggests one account; nothing in the data shows that, and the owner is not known). The zone carries more than the website: Microsoft 365 mail, four mail senders in the SPF record, Zendesk, HydroShare, four Azure services and five Google-hosted ones. Only the apex and `www` records (both the legacy server) need to change; moving the name servers to anyone else without copying the zone would take mail and services down. **Today the answer to "can we switch?" is no, for five reasons:** (1) nobody is named for the registrar, DNS or Netlify accounts; (2) **492 of the 761 legacy pages that answer today would answer 404 (65%), 10,477 of 15,918 Search Console clicks on `www` paths (66%)**, A2 re-run on today's `main`; (3) the site tells search engines "no" in three places and its sitemap is empty (A6); (4) the host builds from the organisation's repository, which is behind the fork (293 files differ; four redirect rules are only in the fork); (5) the Critical Zone section is due live on 31 January 2027 (epic #62, read today; retirement "August 2027 at the latest" is from the same issue) and the site-wide switch has no date. **The domain `cuahsi.org` expires on 1 October 2027** (Network Solutions); the Critical Zone retirement is August 2027 and `criticalzone.org` expires 17 November 2027. Section 8 is the go/no-go list; section 12 is what I need from Jordan.

## 2. What was run

- **DNS and registrar** (`a7-dns-facts.mjs`): A, CNAME, NS, MX, TXT and CAA lookups through `dig` for 24 names, and `whois` for the two domains. TXT records are summarised (SPF and DMARC policy kept, verification values and every e-mail address left out, C11).
- **Dry run on the staging name:** (a) A2's simulation re-run on `main` against the same 927 URLs (761 legacy pages that answer 200, plus cited and Search Console addresses), after a fresh `npm run build:search`; (b) A2's control against the prototype: 50 legacy paths and 3 matching tests, one request a second.
- **The legacy server:** one HEAD request each to `https://www.cuahsi.org` and `https://cuahsi.org`, and to `/robots.txt`.
- **Reconciliation:** the issues #81, #82, #84 and the Critical Zone epic #62, read as they stand.

## 3. Who owns what, from the public records

| Item | What the records show | Owner |
|---|---|---|
| `cuahsi.org` registration | Network Solutions; created 2001; **expires 1 Oct 2027**; transfer lock on | **not named** |
| `cuahsi.org` DNS | name servers `ns41`/`ns42.worldnic.com` (Network Solutions) | **not named** |
| Apex and `www` | both an A record to one server (Apache, Craft CMS, in the response headers); the apex answers 301 to `https://www.cuahsi.org/`; no `robots.txt` (404) | hosting provider **not named** |
| Mail | MX at Microsoft 365; SPF names Microsoft, Zendesk, Mailchimp and SendGrid; DKIM CNAMEs for Microsoft and Zendesk; DMARC policy "quarantine" | not named |
| Other hosts in the zone | `hydroshare` (HydroShare), `help` (Zendesk), `data` and `hydroserver` (Azure web apps), `his` and `hiscentral` (Azure), `subset`, `jupyterhub`, `matlab`, `auth` (addresses that `whois` shows as Google LLC), `apps` (Google-hosted), `ftp` (an alias inside the zone) | not named |
| Wildcard (inferred) | one name that should not exist (`zz-no-such-host-7431.cuahsi.org`) resolves to the legacy server's address, as does `mail.cuahsi.org`; I read this as a wildcard record. Step D2 leaves it alone, so after the switch every unlisted name still resolves to the legacy server; the zone itself was not seen | n/a |
| `criticalzone.org` | GoDaddy registrar and DNS; **expires 17 Nov 2027**; `www` is a CNAME to **a Netlify site** (`cznet-static`), which is not this site; the apex is an address record (the same address Netlify uses for apex names, my reading that it is the same site) | Netlify account **not named** |
| `czo-archive.criticalzone.org` | an A record to a Google Cloud address; the response headers are Google Cloud Storage's | not named |
| This site | `cuahsi3-website.netlify.app`, built from the organisation's `main` | Netlify account **not named** |

"Not named" is the open question Jordan has not yet answered (plan 261106, point 5). Whether the registration auto-renews was not visible.

## 4. The dry run

**A2 re-run on `main` (rules: 326, was 322; the four added are the Code of Conduct pages).** The 927 addresses by class: 404 634, many-to-one 253, redirect 26, generic 7, same-path 7. Over the 761 legacy pages that answer 200:

| | pages | clicks (569 `www` paths in the export: 15,918) |
|---|---|---|
| 404 (no rule, no page) | **492** (65%) | **10,477** (66%) |
| many-to-one (graduate programs, portals, documents) | 253 | 2,091 |
| redirect | 4 | 119 |
| generic (to `/learn-train`) | 7 | 88 |
| same-path | 5 | 3,143 |

A2 on 6 November: 496 of 761 and 10,499 of 15,918. The change is the four Code of Conduct pages and nothing else. The nine pages with most clicks that would 404, and the tenth (a staff profile, 224), are the same as A2's (the job board 1,442 (A6's top-12 table gives 1,441 for it, a different filter, and A6 reads 570 rows and 15,882 clicks from the export where A2 and this report read 569 paths and 15,918); Summer Institute 1,045; MATLAB 1,001; the team 345; two workshops 301 and 289; Virtual University 281; HydroShare 260; grants 247).

**Control on the prototype:** 49 of 50 agree; the one that differs is `/about/policies-and-conduct`, expected 301, got 404, because the prototype is built from the organisation's `main` and the four Code of Conduct rules are only in the fork. Matching: trailing slash and query string carried, upper case not matched, as in A2 (2 of the 9 tests also differ, for the same page).

**What this rehearsal cannot show.** The prototype is not on `cuahsi.org`: a host-name alias, the certificate for the real names, the apex-to-`www` rule, the effect of the DNS change and what a visitor on the old address sees were **not rehearsed**. They need the Netlify account (add the two names to the site before touching DNS) and the DNS account. One idea, not tried: once the names are added in Netlify, request the new site with the real host name against Netlify's address (`curl --resolve`), which tests host handling with no visitor affected.

**Two repository facts the cut-over depends on.**
- The rewrite `/flooding-gages.json` points at the fork's `flood-data` branch on `raw.githubusercontent.com`; a scheduled workflow (`flood-snapshot.yml`, every 3 hours) writes that branch in whichever repository runs it. If the organisation's repository becomes the source, the workflow writes there and the rewrite still reads the fork's copy.
- The fork and the organisation differ by 293 files (46,165 lines added in the fork) and 4 redirect rules; the Netlify host builds the organisation's. Which repository and which Netlify site serve `cuahsi.org` is a decision, not a fact I could find.

## 5. Proposed cut-over order

Each step says whether it needs an owner and whether it can be done early. This is a proposal for Jordan; none of it has been done.

**Before (no visitor effect).**

| # | Step | Needs | Early? |
|---|---|---|---|
| B1 | Name the owners of: the Network Solutions account (registrar and DNS), the Netlify account(s), the GoDaddy account, the legacy server | Jordan | yes |
| B2 | Confirm `cuahsi.org` is renewed beyond 1 October 2027 (and `criticalzone.org` beyond 17 November 2027) | registrar owner | yes |
| B3 | Decide which repository and Netlify site serve the real name; package the fork's changes into it; fix the `/flooding-gages.json` rewrite and the workflow | Jordan, then a code PR (rule 8) | yes |
| B4 | The redirect work: decide per body of work (A3) and add rules; target: every legacy page with traffic either lands or is retired by decision. Re-run `cutover-sim.mjs` after each batch | Jordan decisions, then PRs | yes |
| B5 | The go-live release (A6 section 8): `assets/robots.txt`, the `netlify.toml` header, the site address, the sitemap option, descriptions, canonical links, the 404 page | rule 8 approval | prepared early, merged on the day |
| B6 | Add `cuahsi.org` and `www.cuahsi.org` to the Netlify site; choose `www` as the primary name (all 927 legacy addresses are `www`; the legacy apex already redirects to it) | Netlify owner | yes |
| B7 | Lower the time-to-live on the two records to about 5 minutes at least two days ahead (the live values were not readable; a fresh lookup of `www` returned 900 seconds, so that record's value is probably 900; the apex showed 622 remaining, its value is not known; see `a7_adhoc_checks.txt`) | DNS owner | yes |
| B8 | Final crawl of the legacy site (A1 script), refresh A2, take the snapshot (also Critical Zone T3; the 6 November snapshot is in a gitignored folder on one machine) | agent, Jordan | the day before |
| B9 | Announce the freeze: no content changes on the legacy site from that date; the date the legacy site becomes read-only | Jordan | yes |

**On the day.**

| # | Step | Needs |
|---|---|---|
| D1 | Merge the go-live release (B5) and let the deploy finish | Jordan, Netlify |
| D2 | Change the apex A record and the `www` record to Netlify's; **change nothing else in the zone** | DNS owner |
| D3 | Check the certificate on both names; request 10 pages and 10 legacy addresses by hand | agent or Jordan |
| D4 | Run the A2 simulation against the real name (927 requests at one a second, about 16 minutes) and compare with the offline numbers | agent |
| D5 | Submit the sitemap in Search Console (the property is a Domain property, so no address change is needed if `www` stays the main name; not checked against Google's current help) | Jordan |

**After.** Keep the legacy server running, unchanged, until the rollback window ends (proposed 14 days, Jordan's call); then switch it to read-only or off. Re-run the redirect check weekly for the first month against Search Console's "not found" report. Critical Zone: the `criticalzone.org` and `czo-archive` steps follow the same pattern (section 7).

## 6. Rollback

- **Trigger:** Jordan's call; the obvious ones are a certificate error on either name, the home page or a top-twelve page returning an error, or e-mail or a service in the zone failing.
- **Action:** set the apex and `www` records back to the legacy server's address (the old values are in `a7_dns_facts.csv`: both were an A record to the same address). It takes effect after the time-to-live set in B7. Because the other records are not touched, mail and services should be unaffected either way.
- **Needs:** the legacy server still running and unchanged (hence B9 and the window), and the DNS owner reachable on the day.
- **Costs:** anything published on the new site after the switch (jobs, events) is not on the legacy site; search engines will have seen the sitemap.
- **Tested?** No. Only the old values are recorded. Nothing about it can be tested without the DNS account. Netlify can republish an earlier deploy; I did not check that in the account.

## 7. Reconciling the Critical Zone tickets

| Ticket | Keeps | Moves to this plan |
|---|---|---|
| #81 T15 section redirect map and domain setup | The map from each archive sub-site and each CZNet cluster to a page in the section; testing it with the redirect check | Who does DNS, the order, time-to-live, certificates. New facts for it: `www.criticalzone.org` names a **different Netlify site** (`cznet-static`) and the apex looks to be on Netlify too (inferred); `czo-archive` is a Google Cloud storage address; a name can be on one Netlify site only, so either its aliases move to this site (host rules in `_redirects` then send them to `/critical-zone-science`) or the other site's redirects are changed. Rule 8 applies to either. |
| #82 T16 retirement checklist | The CZ snapshot, the final CZ recrawl, every mapped redirect tested | "DNS owner named; cutover order written" (sections 3 and 5 here) |
| #84 T18 go-live gate | The suite, the visual review, the claims, the sign-off | Its open question "indexed or noindex" has one answer for the whole site: the three places are one release (A6). **Date conflict:** the section is due 31 January 2027; the site-wide switch has no date. Either the section goes live on the prototype host, noindex, on 31 January, or the site-wide switch is on or before that date. Jordan decides. |

I changed none of the three issues.

## 8. Go/no-go list, read against A1 to A6

Status today. Figures are from the reports named, not re-derived here, except A2's.

| # | Condition | Today | Source |
|---|---|---|---|
| 1 | Registrar, DNS, Netlify and legacy-server owners named | **no** | section 3 |
| 2 | Domain renewal confirmed past 1 Oct 2027 | **unknown** | section 3 |
| 3 | Legacy pages that would 404: an agreed ceiling | 492 of 761 (65%); 10,477 of 15,918 clicks | A2, re-run here |
| 4 | The 12 most-visited legacy pages land | 3 of 12 land; 9 do not; MATLAB and grants have no counterpart | A6 |
| 5 | Content decisions per body: events | 14 of 120 legacy event pages have a counterpart | A3 events |
| 5 | news | 21 of 70 posts; 12 items here point back to the legacy page, 5 with no body | A3 news |
| 5 | people | 22 of 22 staff present, 6 with a page of their own; 0 of 69 lecturers | A3 people |
| 5 | jobs and workshops | the job board is not carried; 5 of 21 workshop pages | A3 jobs |
| 5 | programs, portals, documents | directory 102 of 102; 2 of 6 program pages; 44 of 44 portals; 59 of 77 library files hosted | A3 |
| 5 | cyberseminars | 72 of 75 linked recordings are not on the new site | A3g |
| 6 | Links in published newsletters and content that point at the legacy site | 46 of the 47 cited addresses would 404; 73 addresses on 37 pages | A2 (47 cited), A4 (73 addresses) |
| 7 | Outward links dead | 28 of 3,485 | A4 |
| 8 | Broken controls | 4 (two sign-ups, the quote form, the Code of Conduct report form) | A5 |
| 9 | Indexing and sitemap | noindex in 3 places; sitemap empty; opening it naively lists 389 addresses with no page | A6 |
| 10 | Page descriptions, canonical, 404 page | 81 of 170 pages without a description; no canonical; Nuxt's default 404 | A6 |
| 11 | Accessibility | contrast fails on 4 of 19 pages tested | A6 |
| 12 | The organisation's repository holds what is to be shown | **no**: fork ahead by 293 files | section 4 |
| 13 | Rollback written and the legacy server kept | written; not tested | section 6 |
| 14 | A date | **none**; Critical Zone's is 31 January 2027 | section 7 |

**Verdict today: no-go.** Items 1, 2, 12 and 14 need no engineering and can be settled in a day.

## 9. Six items read by hand (rule 12)

Matched, the script or simulation said X and a second source agrees: (1) the apex and `www` return the same single address on a fresh `dig` (the CSV says the same); (2) `/job-board`: simulation class 404; `curl` of the prototype returned 404 (opened separately from the control); (3) `/community/water-data-portals/datastream`: rule in `public/_redirects`; the control got 301 to `/data-platforms/portals` on the prototype, with `?x=1` kept.
Missing, read in the files: (4) `public/_redirects` has no host-based rule (no line starts with a scheme) and `netlify.toml` has none; (5) `public/_redirects` has no rule for MATLAB (0 matches) and the simulation row for `/data-services/matlab` is class 404 with 1,001 clicks; (6) the zone has no CAA record (0 returned), so any certificate authority may issue for it.

## 10. Not examined

- Anything in a Netlify, Network Solutions, GoDaddy or Google Cloud account (no access): the domain settings, certificates, deploy history, auto-renewal.
- The legacy server's behaviour after the switch, and who hosts it.
- E-mail delivery after any change (the plan leaves those records alone; nothing was sent or tested).
- Every other host in the zone beyond one lookup each.
- The records' real time-to-live (only the remaining time was seen).
- The Search Console behaviour at cut-over (not checked against Google's help).
- A real-network load test of the new site (A6).
- Case-sensitive file systems (A2's note).

## 11. Counts

- DNS: 24 names, 46 rows in the data file, 2 domains in `whois`.
- A2 re-run: 927 addresses, 761 that answer 200 on the legacy site, 326 rules.
- Control: 50 paths (49 agree, 1 differs for a stated reason), 9 matching tests (7 agree, 2 differ for the same page).
- Go/no-go: 19 rows (14 conditions; condition 5 has 6 rows); 4 conditions (1, 2, 12, 14) are "no", unknown or none and need no engineering; the rest are open decisions or known gaps counted in the audits.

## 12. Proposed fixes and decisions for Jordan

1. Name the owners (item 1) and confirm the renewal (item 2).
2. Choose the repository and Netlify site that serve the real name (item 12), and a date (item 14), settling the 31 January question for the Critical Zone section.
3. Choose `www` or the apex as the main name (proposed: `www`).
4. Approve a CAA record and a lower time-to-live as part of B7 (rule 8 does not cover DNS; I list it because it is a change).
5. Decide the ceiling for item 3 and the per-body decisions behind it (A3).
6. Decide the rollback window (proposed 14 days).
7. Fix the `/flooding-gages.json` rewrite before the repository moves (a code PR, rule 8).
8. Ask for the Netlify domain step (B6) and the `curl --resolve` test to be done together, so the first real test of host handling happens before DNS changes.
