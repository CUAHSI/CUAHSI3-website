# Audit A3c: news posts and newsletter issues, legacy site against this site (9 November 2026)

Org issue 104, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. The legacy side is the snapshot of 6 November 2026 (`raw/legacy-site/261106/pages/community/news`, 76 files). This side is `content/news` (23 files) and `content/newsletter` (10 files) as of `origin/main` at f70f0a0. The script is `scripts/parity/a3c-news.mjs`; it uses no network. Outputs are in `agent/audit/` with the prefix `a3c-`.

## The answer in one paragraph

Of the 70 posts on the legacy news page, **21 have a counterpart here (19 exact, 2 probable)**, 1 is weak, 1 is "possible" and 47 have none. The split is by date, not by kind: **19 of the 21 posts dated 2026 are here; 2 of the 49 posts dated 2022 to 2025 are** (a further 2 of those 49 have a counterpart that the title scale misses, found by hand, below). The more serious finding is about the 21 that are here. **12 news items here are stubs that point back to the legacy page (`source_url`), and 5 of those have no body at all**, so the article exists only on the old site; the page shows a "Read full article" link to an address that, after cut-over, is a 404 on the new site (69 of the 70 legacy post addresses are 404 in the A2 simulation, and `public/_redirects` has no rule for them). The most-visited post is one of the five: FloodSavvy (108 recorded clicks, 1,481 words on the old site, empty here). Nothing about this shows on a build; it is visible only by opening the page. For newsletters the match is good: all 6 legacy monthly issues are here, with the same Mailchimp id on both sides and the same section headings in the one I compared.

## 1. What was compared, and how matches were decided

- **Legacy posts: 70.** Every page the listing (`/community/news` and its pages p2 to p7) links to; 70 addresses linked, 70 files, none missing either way. The six listing pages themselves are not posts. 70 = the 68 of 5 October (49 news and 19 newsletter-titled) + 2 posted since (the October issue and the JP Gannon reflection, both 6 to 8 October).
- **"Newsletter" on the legacy side** means the slug or title contains "newsletter" (October's rule R01): **20 of 70** (19 in October + the October 2026 issue). Only **6** of the 20 are monthly issues ("CUAHSI e-Newsletter May 2026" ... "October 2026"). The other 14 are guest and community spotlights titled "<Month> e-Newsletter Community Guest Spotlight with <name>", and one stub (`december-e-newsletter`, title "April e-Newsletter", 2023).
- **New items: 33** (23 news, 10 newsletter), all published.
- **Levels** are October's scale (`agent/reports/261005_parity-stage4.md`, section 1), as written in the header of the script. *exact*: a new news file whose `source_url` is the legacy page; or a "CUAHSI e-Newsletter <Month> <Year>" post and the issue of that month; or equal title words (case, punctuation, 4-digit years, words under 3 letters and *the, and, for, with, free, part* ignored) with dates within 3 days. *probable*: title overlap (Jaccard) of 0.6 or more with dates within 60 days. *weak*: 0.4 within 60 days, 0.5 within 180, or 0.3 on the same day. *possible* (added in A3b, same meaning): the same day and some overlap below 0.3; not counted as matched. "Matched" means exact or probable. The scale was not changed to improve a number.
- **Facts compared for the 21 matched pairs:** posted date against date; title words; external links (the page's links, with the Mailchimp subscribe and "HTML version" lines of each issue counted apart); numbers; how many e-mail addresses each side has (counts only; see "Limits"); the Mailchimp id; and the length of the body.

## 2. Counts

| | n | of |
|---|---|---|
| Legacy posts matched (exact + probable) | **21** | 70 |
| exact / probable / weak / possible / none | 19 / 2 / 1 / 1 / 47 | 70 |
| matched by `source_url` / by issue month / by title and date | 12 / 6 / 3 | 21 |
| Posts dated 2026 that are matched | 19 | 21 |
| Posts dated 2022 to 2025 that are matched | 2 | 49 |
| News-titled legacy posts matched (9 exact, 2 probable) | 11 | 50 |
| Newsletter-titled legacy posts matched (all exact) | 10 | 20 |
| New items with a legacy post (15 news, 6 newsletter) | 21 | 33 |
| New items with no legacy post (8 news, 4 newsletter) | 12 | 33 |

Legacy posts with no match (49 = 47 none + weak + possible), by my own grouping of the titles (a judgment, not a field): 15 "Hydroinformatics Blog" reposts, 12 spotlights, 21 other, 1 newsletter stub. The 21 "other" include the 2023 to 2028 Strategic Plan announcement, the 2023 annual members report, the bylaws vote, two Summer Institute anniversary posts and the board nomination call (list in `a3c-match-261106.csv`, filter `level`).

**The 12 new items with no legacy post:** 8 news (`250903-cheristy-jones`, which has a counterpart by hand, below; `251022-virtual-open-house`; `260601-new-staff-henok-tedla`; `260813-university-of-calgary-joins`; `261008-aih-fundamental-exam-member-spotlight`; `261008-ciroh-science-meeting-2026`; `261008-swot-river-discharge-explorer`; `261008-wpi-2027-theme-leaders-call`) and 4 newsletter issues (January to April 2026). The legacy site has no post for those four issues (its first 2026 issue post is "May", dated 4 June). "No legacy post" is not an error: these were never posted to the old news page.

### Posts that are newsletter on one side and news on the other

- **4 legacy newsletter-titled posts are news items here:** the January spotlight with Masoumeh Hashemi, the January spotlight with Punwath Prum, the March spotlight with the 2025 WaterSoftHack fellows, the September spotlight with Amirhossein Montazeri. A fifth, the September 2025 spotlight with Cheristy Jones, is a news item here by hand but is only "possible" on the scale (the title was rewritten and shares 4 of 14 words).
- **0 legacy news-titled posts are newsletter issues here.**
- One news item here still carries the word in its title: "September e-Newsletter Guest Spotlight with Amirhossein Montazeri" (`260908-guest-spotlight-amirhossein-montazeri`). Whether spotlights are news or newsletter content is an editorial call (C7) and is Jordan's.

## 3. Control (made before the script)

The hand file `agent/audit/a3c-hand-match-261109.csv` was written from the titles and dates of all **70** listed posts before the script existed (the 6 newsletter rows were corrected afterwards, after seeing script output, so for them it is not blind) (22 matched by hand: 6 issues, 12 by `source_url`, JupyterHub, the two board spotlights, and Cheristy Jones). It is not independent: I wrote it, and also the script, in one session, and for the 12 `source_url` rows the hand answer and the key are the same fact. Of the 70 rows, 12 are `source_url` rows (same fact as the key) and 6 are issue-month rows (same rule as the key), so only about 4 matched rows (JupyterHub, two board spotlights, Cheristy Jones) and the unmatched rows carry an independent reading. Result: **69 of 70** agree on matched or not matched, and **68 of 70** on identical level. The two that differ:

1. `september-e-newsletter-community-guest-spotlight-with-cheristy-jones`: by hand the same item as `250903-cheristy-jones` (same person, same day); the scale says *possible* (title overlap 4 of 14 words, 0.29, just under the 0.3 line for weak). Not raised.
2. `hydrolearn-fellows-reflections`: by hand no counterpart among news and newsletter; the script gives *weak* to an unrelated news item (`260310-watersofthack-fellows`; the word "fellows"). **Found later by hand:** it does have a counterpart, the impact story `research/2025-hydrolearn-fellows`, same day (8 December 2025). Neither my hand file nor the scale looked there; the "elsewhere" probe (`a3c-elsewhere-261106.csv`) did.

The first run showed 7 rows differing on matched or not: 6 were my hand file naming the newsletter issues by slug where the script uses the file name (a mistake in the control, fixed in the control; no script change), and 1 is Cheristy Jones.

## 4. Six items read by hand

Matched (read on both sides):

1. **`cuahsi-e-newsletter-august-2026` and `newsletter/260813-august`** (exact, issue month). Section headings (h2 and h3 text): 19 on the legacy page, the same 19 here in the same order, plus a final "Calendar dates" here. Legacy posted 14 August, issue dated 13 August here. The links differ in one place that is not Mailchimp: the legacy page links "OpenET" to its LinkedIn page; here it does not. The legacy "HTML version" link has the id `08ea71d88b`, which is this issue's `mailchimp_id`. Also: the *Call for Nominations* line links to a legacy address that has no page here (below).
2. **`cuahsis-25th-anniversary-reflections-a-challenge-for-todays-hydrologic-scientists-by-rick-hooper` and `news/260701-25th-anniversary-rick-hooper`** (exact, `source_url`). Legacy: the full essay, 907 words, with "$100 million" and "$180 million" in the first paragraph. Here: a three-paragraph summary of 104 words and a link to the legacy page. The two figures are not here. Dates: posted 7 July, dated 1 July here.
3. **`jupyterhub-data-loss-incident` and `news/260423-jupyterhub-incident`** (exact, title and date; the only legacy post whose address is also a page here). Legacy: 368 words: what happened, the two changes made (upgrade procedure review, longer backup retention), who is affected, three practices. Here: the first two sentences (28 words). **What a user would act on, the changes and the advice, is not here.** No number or link screen would find this; it shows only in the word counts.

Not matched (searched for in every collection I could):

4. **`call-for-nominations-cuahsi-board-of-directors`** (12 August 2026; four nominators named; terms 2027 to 2029; expected time commitment; how to nominate): no counterpart in any collection (title, date and a search of `content/` for the address). **Four links in the August and September issues point at this address** (two per issue), so they will land on a 404. Its calendar entry reads "deadline - October 2..." and today is 9 November; the call has probably closed.
5. **`hydrolearn-fellows-reflections`** (8 December 2025): not a news item here; the counterpart is the impact story `research/2025-hydrolearn-fellows` (627 words, same day). Reached by the title scale only at 0.22. Pages that matter for redirects.
6. **`2026-hydrolearn-workshop-and-hackathon-recap`** (8 July 2026; 22 fellows, 11 modules): no news item. The July issue here carries the same text (it says "11 new HydroLearn modules" and "The 22 fellows selected..."), and the events `260501-hydrolearn*` describe the event, not the result. Its facts are here; its page is not.

## 5. Findings

1. **A stub item and a dead link.** 12 news items have a `source_url` that is the legacy page; the page template shows "Originally published on cuahsi.org / Read full article ↗" for any `source_url` (`pages/community/news/[slug].vue` lines 63 to 70). After cut-over that link is on the same host, to a page that is not there. **5 of the 12 have no body** (`251030-board-nominees`, `251112-floodsavvy`, `260107-masoumeh-hashemi`, `260211-punwath-prum`, `260310-watersofthack-fellows`): the page shows the excerpt and the dead link. 3 more are summaries shorter than 35% of the legacy length (Rick Hooper 104 of 907 words, Hoori Ajami 235 of 706, Amirhossein Montazeri 198 of 697). With JupyterHub (28 of 368) that is **9 of the 21 pairs** with a body shorter than 35% of the legacy page (the script's "short" line). Legacy figures for the five empty items: FloodSavvy 11 numbers and 7 external links; the WSH fellows reflection 4 numbers and 2 links; the Punwath Prum spotlight 6 numbers and 1 link.
2. **Addresses.** 69 of the 70 legacy post addresses are class 404 in the A2 cut-over simulation (the one that resolves is JupyterHub, the same slug), and `public/_redirects` has 0 rules for `/community/news`. The 70 posts have 542 recorded clicks, 540 of them on addresses that will 404; 243 clicks are on the 21 matched posts and 299 on the 49 that are not. (The Search Console export keeps 1,000 rows, so these are floors; 10 of the 70 posts have none recorded.)
3. **This site's own content points at the legacy news addresses:** 30 references in 19 content files to 17 distinct addresses (12 are the `source_url` lines, 18 are links in text). 15 of the 17 addresses have a counterpart here and can be repointed; 2 do not (the board nomination call, 4 references; the HydroLearn recap, 1 reference).
4. **Dates.** 5 of the 21 pairs differ: May issue 21 days (legacy posted 4 June, dated 14 May here), June 10 days, July 8 days, Rick Hooper 6 days, August 1 day. I do not know which date each side means (the posting date on the website or the date the issue was sent); it is Jordan's call (P4).
5. **Numbers and links screened.** Of the 21 pairs, 6 have a link that the legacy post has and the new item does not (13 links: FloodSavvy 7, the WSH reflection 2, Punwath Prum 1, and one each in the August, September and October issues: the OpenET LinkedIn page, a HydroShare sign-up link carrying a session token, a `cvent.me` short link). The 12 other links "missing" are the Mailchimp subscribe line and the "HTML version" line of each of the 6 issues, which this site carries in `mailchimp_url`. For numbers, 4 values looked lost in 3 issues; I looked each up and all four are in the new issue (the screen was fooled by date forms: June 24, November 19, October 29, August 5th). The real losses are in the stubs: FloodSavvy 11 of 11, Punwath Prum 6 of 6, the WSH reflection 4 of 4, Masoumeh Hashemi 1 of 1, Rick Hooper 2 of 5.
6. **Addresses (e-mail).** The legacy site hides every address behind a script; 26 of 70 posts have at least one (36 in all), and none has a `mailto:` link in the saved HTML. I counted the hidden ones and did not decode them. This site has an address in 12 of 33 items. Only 7 of the 21 pairs have an address on either side, and in those 7 the counts are equal (12 more pairs are 0 and 0). The two that differ are stubs (the board nominees: 1 legacy, 0 here; FloodSavvy: 3 legacy, 0 here), because the contact text is on the old page only. Counts agreeing does not show the same address; the legacy count is every hidden placeholder, the count here is distinct addresses in the whole file, so a repeated address would show as a difference. No address is copied into this report (C11).
7. **Oddities.** `test-news-post` (title "Announcing New HydroShare How-To Videos!", 4 March 2022) is a real, listed post under an address that says "test". Three more addresses of the form `/community/news/<e-mail address>` answer 404 on the legacy site: mis-made mailto links, not posts.

## 6. Not examined

- **Wording.** Only 3 of the 21 pairs were read by hand, plus the August section headings (a 4th partial). The other 18 were compared by the counts above only. Whether the text of the other 18 matches is not known.
- **Images and attachments in the 70 posts:** not counted or compared.
- **External links:** 0 of the links were opened (no network was used). A link that appears on both sides may be dead on both.
- **The 4 new issues for January to April 2026:** no legacy post exists, so nothing was compared; their Mailchimp links were not opened.
- **The 23 events here with no legacy page** (A3b): this issue does not ask for them to be checked against the newsletters, and I did not. I had offered to do it in this task; it is a separate small task.
- **Whether the 49 older posts belong on the new site** (Jordan's decision, below). The 15 Hydroinformatics Blog reposts are external writing; C8 says not to mirror it.
- **Legacy listing pages** p2 to p7 (6) and the 3 e-mail-address 404 pages: not posts.

## 7. Limits of the method

- The scale reads titles and dates; a reworded title on a different day, or a post that was rewritten into an impact story, is found only by hand. Two such cases are above (Cheristy Jones, HydroLearn Fellows). "None" means no counterpart found by title or date among news and newsletters, not proved absent.
- The hand control was written by me, in one session, and is not independent.
- The classification of the 49 unmatched posts into blog, spotlight, other is mine.
- `source_url` is a strong key for the 12 items that have one, but it says the item was written from that page, not that the page's content is here (finding 1 is the proof).

## 8. Proposed fixes (for Jordan; none made here)

Content (`content/short-name`, each its own PR):
1. Write the bodies for the **5 empty items** from their legacy pages (FloodSavvy first: 108 clicks), and extend the 4 summary items (the three above and JupyterHub) to cover what the legacy page says. These are CUAHSI-hosted pages by named authors; whether C8 (do not mirror external articles) applies to the guest essays is Jordan's call. Dropping `source_url` removes the recorded source (C2); say so in that PR. Once a body is carried over, drop `source_url` so the dead link goes (C10 allows the change).
2. Decide whether the **board nomination call** and the **2026 HydroLearn recap** get news items (the July issue already holds the recap's facts).
3. Decide which date is right for the 5 pairs whose dates differ.
4. Decide whether any of the **49 unmatched older posts** come across. By group, with clicks: 15 blog reposts (83), 12 spotlights (77), 21 other (137), 1 stub (2). The Strategic Plan announcement and the bylaws vote belong with your decision on issue 113.

Code (`task/short-name`, separate PRs, each needing Jordan's approval first where rule 8 says so):
5. (A page change: its own PR with a visual review.) The template shows "Originally published on cuahsi.org" for any `source_url`. After cut-over it is a self-link. Show it only for a `source_url` on another host, or drop the box; `261008-wpi-2027-theme-leaders-call` has a `source_url` on cuahsi.org that is not a legacy post (`/summer-institute`, not checked) and would also lose its box (a page change; its own PR with a visual review).

For the cut-over (A2, A4 and A6, which I would carry forward; the data is in `a3c-match-261106.csv`, column `new_route`):
6. (`public/_redirects` is generated by `scripts/parity/redirects.mjs` from the parity data, so the change is to that data; changing URLs needs Jordan's approval, rule 8.) A redirect for each of the **21 matched** legacy post addresses to the route here, plus `hydrolearn-fellows-reflections` to the impact story and the Cheristy Jones spotlight to `/community/news/community-spotlight-cheristy-jones`. For the other 47 addresses, a decision: one redirect to `/community/news`, or none (299 clicks).
7. Repoint the 4 inbound links from the August and September issues (the board nomination call) and the 1 in the July issue (the HydroLearn recap); whether sent-issue archives should be edited at all is a question for Jordan, and C10 applies once item 2 is decided; repoint the other 13 text links, and handle the 12 `source_url` lines as in item 1.
