# Audit A4: links, files and embeds (10 November 2026)

Org issue 109, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. This side is the site as built from `main` on 9 November 2026 (186 pages in `.output/public`). The legacy side is the snapshot of 6 November 2026 (761 saved pages, `raw/legacy-site/261106`), its list of 118 linked files and the HEAD log of that day. The live web was read on 9 and 10 November 2026 (`scripts/parity/a4-link-check.mjs`; HEAD requests, a GET only when a server refuses HEAD, nothing sent or posted). Scripts: `scripts/parity/a4-links-extract.mjs`, `a4-link-check.mjs`, `a4-links-analyse.mjs`, `a4-files-embeds.mjs`; data files `agent/audit/a4-*`.

## The answer in one paragraph

**This site's outward links are mostly sound: of 3,485 distinct addresses on 264 hosts, 28 are dead (27 if the Google Scholar profile, which showed a bot check when opened by hand, is not counted), 13 blocked our check and 12 errored; 3,432 answer or redirect (1,556 answer, 1,876 redirect).** The 28 dead are on 11 published pages: the graduate programs directory (9), the newsletter issues (10; expired jobs and registrations, as old issues would have), the portals table (6), two staff pages and one impact story. Seven of them are websites whose name did not resolve on one lookup. **Of 1,876 addresses that redirect, 1,832 are DOIs** (a DOI that resolves; the publisher's page was not requested) and 44 are other sites. **This site links to the legacy site (`www.cuahsi.org`) in 73 addresses on 37 pages** (71 answer today, 2 are dead, 16 are files), and to 4 live CUAHSI service addresses (`data`, `jupyterhub`, `matlab` and `subset.cuahsi.org`). **Legacy files: of 118 linked file addresses (116 distinct names, 271 MB), 63 are hosted here (59 with a redirect, 4 by name only), 10 are linked on the legacy host, and 45 have no copy** (34 PDFs, 11 images). Among the 45 are the Code of Conduct policy and the conduct concern report form, which a search of `pages/`, `content/` and `components/` by title words did not find anywhere on this site. **Legacy embeds:** 13 YouTube players, 1 donation form, 81 video links and 236 links to forms, registrations and meetings; the donation form and 73 of 92 videos have a counterpart here, and all 19 videos without one are still public. The control (10 live and 10 dead addresses known beforehand) was found 20 of 20, and a re-run of 100 random addresses gave the same verdict 100 of 100.

## 1. What was compared, and how

- **Outward links.** Every `<a href>` to an absolute address in the 186 built pages: 7,553 links, 7,407 address-on-page pairs, **3,485 distinct addresses** (the `#fragment` dropped), 264 hosts. This covers pages and content together, because content is built into the pages. It does not see links that JavaScript builds in a browser, links in content that is not published (not built), or the 55 `mailto:` links (counted, not checked).
- **The check.** One address at a time per host, one second apart (24 hosts at once). A redirect is followed only on the same host (http to https, a trailing slash); a redirect to **another** host is not followed and is recorded with the host it points to, so no request is made outside the one-per-second queue. HEAD first; a 400, 403, 404, 405 or 501 on HEAD is repeated once as a GET (640 of 3,485). Verdicts: *ok* (2xx), *redirect* (3xx to another host), *dead* (404, 410, or a name that does not exist), *blocked* (401, 403, 429), *error* (5xx, timeout, a certificate that cannot be verified, anything else). "Ok" says the address answers, not that the page says what the link text says.
- **Legacy files.** The 118 addresses in the legacy crawl's list of linked files (`files.json`), with their HEAD status, type and size (`fetch-log.csv`). A file is *hosted* when `public/_redirects` sends its address to a file that exists here, or a file of the same name is under `public/`; *linked to the legacy host* when no copy is hosted and this site links to the legacy address; otherwise *none*. Never raised to improve a number.
- **Legacy embeds.** In the 761 saved pages: every `iframe`, `embed`, `object`, `video` and `audio`, and every link to YouTube or to a form, registration, meeting, map or donation host. A YouTube video has a counterpart when its 11-character id is in this site's content or built pages (cyberseminar transcripts, which are named by id, are left out); any other address when the same address (case, scheme, trailing slash and `#fragment` ignored) is a link or an embed on this site.
- **No e-mail address or telephone number** is in any committed file. One legacy link wraps a person's e-mail address in its query string (an Outlook safelink); the file records it without its query string.

## 2. Counts

**Outward links on this site** (3,485 addresses, all checked)

| Verdict | Addresses | Of which |
|---|---|---|
| ok | 1,556 | HydroShare 594, the CZO archive 503, NSF 70, joshswaterjobs 47 and others |
| redirect | 1,876 | doi.org 1,832 (302 to a publisher); 44 other: 21 permanent (301, 308), 23 temporary |
| dead | **28** | 21 are 404 or 410, 7 are names that do not exist |
| blocked | 13 | 403 from 9 hosts, among them agu.org (4), LinkedIn (2), Wiley (2) |
| error | 12 | 3 LinkedIn (999), 4 timeouts, 4 certificate problems, 1 redirect chain that did not end (`www.awra.org`, more than 5 redirects) |

- By occurrence (7,407 address-on-page pairs): 29 are dead, 3,613 redirect, 3,559 ok, 185 blocked (169 of them are the LinkedIn company address in the footer of 169 of the 186 pages; the 17 without it are the 15 redirect stubs under `/highlights`, `/200` and `/404`), 21 error.
- **doi.org:** 1,832 addresses, 1,832 redirects to a publisher. That means each DOI is registered; the publisher's page was not requested.
- **http, not https:** 67 addresses (41 ok, 17 redirect, 6 dead, 1 blocked, 2 error).
- **The 28 dead, grouped by host:** every one is in `a4-dead-links-261106.csv` with every page that has it. By page: graduate programs directory 9 (Iowa, Temple, Missouri S&T, Ohio State, Florida, LSU, Oklahoma, UDLAP and Idaho: one each), newsletter issues 10 (expired job postings: RPI, Alabama, UC San Diego, UC Cooperative Extension, Minnehaha Creek; an Andrews Forest REU announcement; two Zoom registrations; the legacy site's own `/events/virtual-open-house` and a `/job-board/...` address), portals table 6 (`forecasting.vaci.org.vn`, `portailrbv.sedoo.fr`, `www-naweb.iaea.org`, `www.geoportal.org`, GDACS, Eawag), staff pages 2 (a GitHub profile and a Google Scholar profile), impact stories 1 (`edsbook.org`). By host: 26 hosts have one or two; the two on the legacy host are in newsletter issues.
- **Permanent redirects (21 addresses, not dead):** the site has moved (for example `public.wmo.int/en` to `wmo.int`, `www.uncc.edu` to `www.charlotte.edu`, `go-fair.org` to `gofair.foundation`); listed in `a4-redirects-261106.csv`.
- **Links to a host the Critical Zone epic retires:** 503 addresses to `czo-archive.criticalzone.org` (all answer today) on 12 pages, 11 to `criticalzone.org`.

**Links to the legacy site** (`www.cuahsi.org`): 73 addresses on 37 pages; 71 ok, **2 dead**. 16 are file addresses (all in the legacy 118). The 4 service subdomains (`data`, `jupyterhub`, `matlab`, `subset`) are not the legacy site: 3 ok, 1 redirect (`matlab`).

**Legacy files** (118 addresses)

| | hosted | linked to the legacy host | none |
|---|---|---|---|
| PDF (107) | 63 | 10 | 34 |
| image (11: 10 png, 1 jpg) | 0 | 0 | 11 |
| **all 118** | **63** | **10** | **45** |

- 118 addresses are 116 distinct names (two reports sit at two addresses each). All 118 answered 200 on 6 November. Total 271 MB; **the 55 not hosted are 189 MB**.
- **Hosted (63):** 59 by a redirect rule to a copy that exists (59 of 59 targets exist); **4 by name only, with no redirect rule**: the data management guide, the 25th milestone sheet, the founding institutions list and the outreach template. For these a copy is hosted, but the legacy address answers 404 at cut-over (A2 holds two of them as 404; the other two are not in A2's file).
- **Linked to the legacy host (10):** the 8 Summer Institute reports, the Zeffy donor information sheet and an About flyer. Each is linked from one page here (`content/programs/summer-institute.md`, `pages/support/index.vue`, `pages/about/index.vue`).
- **None (45), the PDFs (34):** among them the Code of Conduct policy and the conduct concern report form (2 files), the 2026 Virtual University module catalog, the first-year graduate guide and a quick guide to applying to graduate school, the 2022 Maidment symposium program, workshop agendas and schedules, the 2025 membership meeting packet, the 2026 board candidate bios, AGU session sheets, a jobs board flyer, flyers, a letter to member representatives, the COVID guidance statement, technical reports 1 to 8 and 13, the Summer Institute 2026 report. **11 images** (logos, a flyer, a map, two diagrams).
- **In A2's cut-over file:** 47 of the 118 addresses (46 with recorded clicks; clicks are floors): 22 answer 200 (redirected to a copy), 25 answer 404; the 55 not hosted have 192 recorded clicks in all.

**Legacy embeds** (761 pages scanned; 331 rows)

| Kind | Rows | Counterpart here | None |
|---|---|---|---|
| YouTube player (iframe) | 13 | 5 | 8 |
| other iframe (the Zeffy donation form on `/donate`) | 1 | 1 (the same form is embedded on `/support`) | 0 |
| YouTube link | 81 | 70 | 11 |
| link to a form, registration, meeting, event or map | 236 | 59 | 177 |

- **YouTube:** 92 distinct videos on the legacy pages; **73 appear here, 19 do not. All 19 answer as public** on YouTube's oEmbed endpoint (17 on the CUAHSI channel, one ESIP, one a TEDx talk): 7 on the CyberWater page, 9 on cyberseminar pages (the Synthesis Workshop series, hydrogeodesy, the federal job market and others), 3 elsewhere.
- **Forms and registrations (236 links):** 91 Jotform, 105 Zoom (95 at one host), 19 Cvent, 9 Mailchimp archives and others. 177 have no counterpart; 136 of those 177 are on event (53), cyberseminar (61), series (14) and workshop (8) pages, whose registration is over, so "no counterpart" there is expected. Of the 59 with a counterpart, 23 are on newsletter issues.
- **Not an embed:** the site search form on every legacy page (761), the browse-by menus (66 pages), Google Tag Manager on all 761.

## 3. Control, stability, and links opened by hand

- **Control:** 20 addresses written down before the check ran (`agent/audit/a4-control-urls-261109.csv`): 10 known live (9 addresses that A3f found answering on 9 November, and one legacy page) and 10 known dead (8 from A3f's check, 2 cited addresses that answered 404). The check found **20 of 20**. Two things it showed: for two live addresses the first answer to HEAD was wrong (a Box link answered 404 to HEAD and 200 to GET; a California careers address answered 307 to HEAD and 200 to GET), so the GET repeat matters; and 8 of the 20 addresses are also on the site, so the control is not wholly separate from the data. It is a weak control: 8 of the 10 dead are the legacy site's own 404s, which answer the same way every time.
- **Stability:** the HEAD results re-run on a random sample of **100 of the 3,497 checked addresses** (56 doi.org, 9 CZO archive, the other 35 on 18 other hosts) the same afternoon: **100 of 100 the same verdict**. (3,497 is the 3,485 addresses on the site and 12 control addresses that are not on it.) The sample held no address whose name did not resolve, so it says nothing about that class. The sample is weighted to the hosts that have the most addresses, which are the steadiest.
- **Opened by hand** (the built-in browser, 10 November): **3 called dead:** `github.com/abner-bogan` shows GitHub's "Page not found" (**confirmed**); the GDACS flood detection page shows "The resource cannot be found", HTTP 404 (**confirmed**); the Google Scholar profile of a staff member showed Google's "unusual traffic" page, not a profile and not a 404 (**not confirmed: the check's "dead" for `scholar.google.com` is probably a bot response; I count it as unchecked**). **3 called live:** a HydroShare resource, a DOI that landed on the publisher's article, and a CZO archive publication page all opened (**3 of 3 confirmed**).

## 4. Six items read by hand

**Called matched (3):**

1. **The Zeffy donation form.** Legacy `/donate` embeds the donation form `www.zeffy.com/en-US/embed/donation-form/1d9a…` in an iframe. `pages/support/index.vue:68-69` embeds the same form, with the text "Donations are processed securely through Zeffy". Same form; the donor information PDF it asks visitors to read is a link to the legacy host (`pages/support/index.vue:63`, status "linked to the legacy host" above).
2. **The data management guide PDF (`DMP_guide_digital.pdf`).** Legacy address `/uploads/pages/doc/DMP_guide_digital.pdf`, 371,969 bytes. A copy is hosted at `/documents/data-management/DMP_guide_digital.pdf`, 371,969 bytes, the same size. No redirect rule exists for the legacy address, and A2 records it as 404 at cut-over: **hosted copy, dead legacy address.** (Where it is linked: `content/data-management/guide.md`.)
3. **The 10-years retrospective video (`pELjrFr_o_I`).** An iframe player on the legacy `/summer-institute` page and on a legacy news post; here it is a text link on the Summer Institute page (`content/programs/summer-institute.md:58`), not a player. Same video; I did not play it.

**Called missing (3):**

4. **`2026_CVU_Module_Catalog.pdf`** (175 KB). Linked from the legacy `/virtual-university` page; 7 recorded clicks on the file address; not hosted, not linked here, no redirect. A3d found the same gap from the page side.
5. **The Code of Conduct policy and the concern report form** (`CUAHSI-Code-of-Conduct-Policy-Final_April-24.pdf`, 473 KB, and `Conduct-Concern-Report_v2.pdf`, 185 KB). Linked from the legacy pages `/about/policies-and-conduct/code-of-conduct-policy` (14 recorded clicks) and `.../conduct-concern-report`. I searched `pages/`, `content/` and `components/` for the policy and the form by name: neither the files nor any text about a code of conduct is here. Those legacy pages and `/about/policies-and-conduct` answer 404 at cut-over (A2).
6. **The seven CyberWater videos** (for example `852c2L0lBbM`, "CyberWater: Geographic Information System Capabilities"). On the legacy `/cyberwater` page as links; not on this site (the page itself has no counterpart: A3d). All seven answer as public on the CUAHSI channel.

## 5. Findings

1. **28 dead links on 11 published pages; 18 of the 28 are not in newsletter issues.** The ten in newsletters are expired jobs and registrations in old issues, which are inputs (C9); the 9 in the graduate programs directory and the 6 in the portals table are in content this audit covered earlier (A3d and A3e listed web addresses as "not examined"; here they are examined).
2. **Seven of the 28 are websites whose name did not resolve:** 4 in the portals table, 3 in the graduate directory. Each rests on one lookup, with no retry, and none was in the stability sample; I did not open them by hand.
3. **The DOI links resolve: 1,832 of 1,832** (the DOI is registered). Whether the publisher page opens was not checked.
4. **13 addresses are blocked to a script, among them the LinkedIn company address in the footer of 169 pages.** I did not open them by hand; their state is unknown.
5. **The legacy site is linked from 37 pages, 73 addresses.** After cut-over those that map to a redirect rule will land; the two dead ones will not.
6. **The Code of Conduct and the concern report form are not on this site.** The legacy addresses end in 404 at cut-over. Both documents are policy; whether they belong here is Jordan's call.
7. **Four hosted files have no redirect from their legacy address,** and 10 files are linked on the legacy host from three places here (Summer Institute reports, the donor sheet, the About flyer).
8. **19 YouTube videos on legacy pages have no counterpart here and all 19 are public**; 7 of them are the CyberWater series, which the programs audit (A3d) found has no page here.
9. **HEAD alone is not enough.** For 605 of the 3,485 addresses (17%) HEAD was refused (400, 403, 404, 405 or 501) and the GET repeat answered ok; in the control a Box link answered 404 to HEAD and a California careers address 307, both live. A HEAD-only check would have called such links dead.

## 6. Not examined

- **What a "live" link shows.** 1,556 addresses answer 200 and 1,832 DOIs resolve; I did not read the pages, so a link that lands on a changed or empty page is not found. By hand: 3 live links opened and read, 3 of 3 as expected.
- **The publisher page of each DOI.** Not requested.
- **The 7 addresses whose name did not resolve:** one lookup each, no retry, not opened by hand; open them once from another network before relying on the count.
- **The 13 blocked and the 12 errored addresses** (25 in all): unknown, not dead. 4 timeouts and 4 certificate problems may be passing or a real fault; the three LinkedIn 999 answers on staff pages are unknown. The Google Scholar address (called dead) showed a bot check by hand and is unchecked.
- **Links built by JavaScript, links in unpublished content, the 55 `mailto:` links, the footer and header links to this site's own pages** (A1 and `check-links.mjs` cover internal links).
- **Whether the 63 hosted legacy files are the right files.** A3e compared the library; the other hosted files were matched by name and size only.
- **The text of the 45 files with no copy.** Titles come from the file names and the pages that link them; none was opened.
- **Whether the 236 form and registration links on legacy pages were live** (most are for past events). Not checked.
- **Anchors (`#fragment`).** Dropped; not checked.

## 7. Limits of the method

- One request per host per second means the check of 3,485 addresses took about an hour; a link that was down for an hour during it could be called dead or ok.
- HEAD answers differ from GET on some servers; the GET repeat is used only for 400, 403, 404, 405 and 501, so a server that answers 200 to a HEAD it should refuse is called ok.
- "Redirect to another host" is not followed, so a link that redirects to a dead page on another host is called a redirect. For doi.org that is deliberate; for the 44 other addresses it is a limit.
- Bot protection changes what a script sees (Google Scholar, LinkedIn, Wiley, AGU). A script's verdict for such hosts is weaker than for others.
- The control is weak (section 3). The stability sample is weighted to doi.org.
- The legacy embed counterpart for a YouTube video is "the id appears in the content or built pages"; it does not say the video is shown on a matching page.
- The count of legacy file addresses uses the crawl's 118 (116 distinct names). Two names at two addresses are counted twice.
- The one-request-per-second rule is kept per host name, not per domain: `www.cuahsi.org` and `data.cuahsi.org`, or two `zoom.us` hosts, can be asked at the same moment. A same-host redirect to another scheme or port is followed.
- The count of files with no copy (45) is an upper bound on what is missing: a copy hosted under another name is not found by name.
- The three live addresses opened by hand were a HydroShare resource (`901a9ac9…`), the DOI `10.1002/wat2.1350` and a CZO archive publication page (`christina/publications/pub/van-stan-2012…`); the dead ones were the GitHub profile, the GDACS page and the Google Scholar profile (`uGQqEVMAAAAJ`). No file in the repository records these hand checks.
- Hand-read facts with no data file behind them: that the Code of Conduct is nowhere in `pages/`, `content/` and `components/` (a grep by title words), the Google Scholar and GDACS pages (opened in a browser), the Zeffy lines in `pages/support/index.vue`.

## 8. Proposed fixes (for Jordan; none made here)

1. **Dead links in this site's own content** (content PRs, each with its page and source): the 9 in the graduate programs directory and the 6 in the portals table (a content PR for each; 7 of the 15 are sites that no longer exist, so the right fix may be to remove the link or find the new address, not to guess one: C3); the GitHub link on one staff page (confirmed dead by hand; ask the staff member), the Google Scholar link on another (unconfirmed: open it yourself first) and the `edsbook.org` link in the impact story (ask the author). The 10 in newsletter issues stay (C9, historical).
2. **The Code of Conduct and the concern report form.** Host the two PDFs as library documents (a content PR; the sources are the legacy files) or write a short page; and a redirect for `/about/policies-and-conduct/...` (rule 8: your approval). This is the one finding I would not leave to the cut-over.
3. **The 10 files linked on the legacy host, and the hosted files still linked by their legacy address:** 3 of the 4 hosted-by-name files are linked here by the legacy address (the founding institutions list, the outreach template and the milestone sheet: all in newsletter issues, which stay, C9), and 3 files hosted by a redirect rule (the bylaws, the 2023 to 2028 plan, the 2025 annual report) are linked by their legacy address in `pages/about/governance.vue` and `pages/about/index.vue`. Options: change those code links to the hosted paths (a small code PR; the program page and Zeffy sheet are content and code PRs of their own); add the 4 missing redirect rules (rule 8). The Summer Institute reports are A3e's decision.
4. **The 45 files with no copy.** Options by group: host the policy and guide PDFs (Code of Conduct, the module catalog, the grad school guides) as documents; leave flyers, agendas and AGU sheets (past events) to 404; images need nothing unless a page is moved. A short list for you to rule on is in `a4-legacy-files-261106.csv` (filter `status` = none).
5. **The 19 videos:** the 7 CyberWater videos belong with whatever happens to the CyberWater page (A3d); the cyberseminar ones are A3g's gap.
6. **Redirected links:** update the 21 permanent redirects to their new addresses (one content PR; low priority).
7. **Check again before cut-over** with the same scripts (`a4-link-check.mjs`), since the world changes in the weeks between. A6 should rerun it against the new address.
