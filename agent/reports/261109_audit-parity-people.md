# Audit A3a: people, legacy site against this site (9 November 2026)

Org issue 102, part of the site audit (epic 99). Read-only on both sites; nothing is fixed here. The legacy side is the snapshot of 6 November 2026 (`raw/legacy-site/261106/pages`: `about/our-team`, `faculty/guest-lecturer-database`, `about/governance`). This side is `content/team`, `content/board`, `content/community` and `content/members/reps.json` as of `origin/main` b773c5e (after PR 213). Script: `scripts/parity/a3a-people.mjs`; outputs `agent/audit/a3a-*`. Contact details are compared as present or absent only (P8); no address or number is copied into any file here.

## The answer in one paragraph

The legacy site has **91 person pages: 22 staff and 69 guest lecturers**. **All 22 staff have a counterpart here (22 exact, by name)**, and the 22 names on the legacy list are the same 22 names as in `full-team.json`. **None of the 69 lecturers has a person record here (69 none)**. That matches October's finding that they have no place in the schema or pages (`agent/reports/261005_parity-stage3.md`, point 4); the stage 7 decisions list them with options A to D (A: one table page, no contact details; recommended "if staff confirm the list is current") and I found no recorded decision. But the match is thinner than the count says. Only **6 of the 22 staff have a page of their own here**; the other 16 appear only as a card on the team list. The short bio field here is **shorter than the legacy bio for 22 of 22** (1,804 words on the legacy pages, 839 in the field here); three people (Jordan Read, Anthony Castronova, Lindsay Platt) also have a longer profile text below it, so for them the page here holds more than the legacy page. **Contact details differ on all 22**: each legacy page shows an e-mail address (behind a script) and 3 also a phone number; no staff page here shows either. The two sides **give different titles for one person** (Summer Conley). One person has **no photo here** (Henok Tedla). **All 91 legacy addresses answer 404 at cut-over**, and there are no redirect rules for them. Outside the 91: the legacy governance page names **32 people** (the board of directors and three advisory committees); **this site's governance page names none**.

## 1. What was compared, and how matches were decided

- **Legacy staff: 22** pages at `/about/our-team/<slug>`, all 22 on the `/about/our-team` list (20 staff and, under "Independent contractors", 2). **Legacy lecturers: 69** pages at `/faculty/guest-lecturer-database/<slug>`; the names and affiliations come from the list cards (69 cards, 69 pages, none missing either way). On 67 of the 69 detail pages the name is the e-mail link and shows only as a placeholder ("email hidden; JavaScript is required"), so a name is read from the list pages. The placeholders were counted, never decoded.
- **People records here: 36**: 22 in `full-team.json` (6 with `has_profile` true), 9 profile files in `content/team`, 1 in `content/board`, 4 in `content/community`. Of the 22 team entries, 9 also have a profile file. The 229 rows of the member representatives file are not people records for this purpose; they are used only to ask whether a lecturer's name occurs there, as yes or no (C11: no row number or content is written).
- **Levels** are October's scale (`agent/reports/261005_parity-stage4.md`, section 1) and never raised: *exact* the whole name is the same (case, accents and punctuation ignored); *probable* the last word is the same and the first names share their first three letters; *weak* the same last word only; *none*. "Matched" means exact or probable. Nicknames and married names are not guessed (so "Kimberlee" and "Kimmy" are *probable*, not exact; the first is what both lists use).
- **Facts compared for each matched staff pair:** title, bio (word counts, then three read by hand), photo (a field and a file in `public/`), links, contact details (present or absent), fun fact, pronouns, whether a page exists in the build. "Status (current or former)": neither side carries a field for it; both hold current staff only (see finding 8).
- **Extras, not in the issue's scope but found on the way:** whether each lecturer's name occurs elsewhere on this site; the 34 names on the legacy governance page. Both are labelled as extras below.

## 2. Counts

| Legacy pages | Level | Count |
|---|---|---|
| Staff (22) | exact | **22** |
| | probable, weak, none | 0, 0, 0 |
| Lecturers (69) | exact, probable, weak | 0, 0, 0 |
| | none | **69** |

**People records here with no legacy page: 5 of 36**: the board profile (Tao Wen) and the 4 community profiles. They are not staff or lecturers; the legacy site has no pages like them, so this is expected. The other 31 records (22 team entries and their 9 profile files) have a legacy page.

**Staff pairs (22 of 22), what differs:**

| Fact | Same | Differs |
|---|---|---|
| Title | 21 (of which 3 are worded differently, see finding 3) | **1** (Summer Conley) |
| Bio (the `bio` field only) | 0 | 22 of 22 shorter here; 3 of the 22 also have profile text below it (finding 2) |
| Photo | 21 of 22 have a file here | 1 has none |
| Fun fact | 10 have one on both sides | 10 on the legacy page are not here; 1 is here only (Anthony Castronova) |
| Pronouns (in the bio text) | 7 of 7 same | 0 |
| Links (LinkedIn, Scholar, ORCID, GitHub) | 12 (11 with none on both sides, 1 with all three on both) | 10 pages have links here that the legacy page does not; 0 are lost |
| Contact details | | **differ on 22 of 22** (legacy: e-mail on 22, phone on 3; here: neither; computed per pair, not assumed) |
| Page of their own | 6 of 22 | 16 have none |
| Address | 19 of 22 slugs the same | 3 differ (finding 4) |

**At cut-over (A2 simulation, `agent/audit/cutover-261106-urls.csv`):** **91 of 91 legacy person addresses answer 404** (22 staff, 69 lecturers); `public/_redirects` has 0 rules for `/about/our-team` or `/faculty/guest-lecturer-database`. 19 of the 22 staff addresses and 16 of the 69 lecturer addresses have a row in the Search Console export, with **725 clicks (staff) and 64 clicks (lecturers)**. Those are floors: the export keeps 1,000 rows. The top staff addresses are Jordan Read (224), Julia Masterman (92) and Anthony Castronova (91).

**Lecturers' names elsewhere on this site (extra): 11 of 69.** 9 appear in `content/` (7 as a cyberseminar speaker, 3 in a research item; one person is in both), 6 share a full name with a row of the member representatives file (`in_member_file` in `a3a-probe-261106.csv`: yes or no only, C11; the names, though not the addresses, are also on the public member-portal page). In 4 of the 7 speaker cases the institution is the same on both sides; in 3 it differs, so it is not shown that it is the same person. **58 of 69 appear nowhere.**

**Governance page (extra): 32 people** (18 on the board: 15 directors and 3 officers; 16 committee seats: informatics 7, education and outreach 3, instrumentation 6; two people sit on the board and a committee). **0 of 32 are named on this site's governance page.** 2 of 32 have a person record here (Tao Wen on the board, Jordan Read on the team); **15 of 32 appear somewhere else in `content/` or as a member representative; 17 appear nowhere.**

## 3. Control (made before the script)

Twenty people were matched by hand before the matching ran: 10 staff (the odd-numbered positions 1 to 19 of the 22 pages in alphabetical order; position 21, Summer Conley, was left out, and she is the one pair with a different title, so the control did not test it) and 10 lecturers (every seventh of 69, from the first). For the staff I read the legacy name against `full-team.json`; for the lecturers I searched `content/`, `pages/` and `components/` for the surname (wider than the script, which looks in `content/` only, so the control did not use the method it checks). The hand file is `agent/audit/a3a-hand-match-261109.csv`. Whether it was written before the matching ran cannot be shown from the files; the order is in my session record. The script's answer was then compared: **20 of 20 the same level**. This is a weak control: the 10 staff were all easy exact names and the 10 lecturers all *none*, so no *probable* or *weak* decision was tested. The script had been run with `--legacy-only` first (only the two legacy files, to draw the sample); I did not look at its matching until the hand file was written.

## 4. Six items read by hand

Matched (legacy page and this site's entry read side by side):

1. **Emily Clark.** Same title (Deputy Director (acting), Project Manager). The legacy bio runs to three sentences; here it keeps the prior job and the four qualifications, loses "In her free time..." and shortens the qualification names (the Project Management Professional certification is now "PMP"). The fun fact is the same. No links either side. The legacy page has a photo, here a file exists.
2. **Summer Conley.** The legacy title is **Compliance and Accounting Coordinator**; here it is **Program and Operations Assistant**. The legacy bio opens by naming the old title and also lists two minors and a hobby; here it keeps the field of study and drops the minors. The fun fact is the same. Which title is right is Jordan's call.
3. **Henok Tedla.** Same title (Controller). The bio here is the legacy text, shortened (drops three sentences: working with leadership and boards, the policies and internal controls he built, and his skill with financial systems); the fun fact is kept. **No photo here** (`photo` is null in `full-team.json`; the legacy page shows one).

Missing (no counterpart; what I searched and what I found):

4. **Darren Ficklin** (lecturer, Indiana University; also on the legacy board). Searched `content/`, `pages/`, `components/` for "Ficklin": one hit, in the members list. No person record, not named on the governance page. Level none.
5. **Jerad Bales** (lecturer, CUAHSI). Searched "Bales" and "Jerad Bales": no hit anywhere. Level none.
6. **Sam Zipper** (lecturer, Kansas Geological Survey). "Zipper": one hit, in the members list. No person record. Level none.

## 5. Findings

1. **Staff: every person is here, but 16 of 22 have no page of their own.** The build holds `/about/team/<slug>` for 6 slugs (Abner Bogan, Danielle Tijerina-Kreuzer, Irene Garousi-Nejad, Jordan Read, Lindsay Platt, Anthony Castronova under `tony-castronova`) and none for the other 16 (check 1, `a3a-checks-261109.txt`). A visitor from an old address can reach, at best, the team list for those 16. That is as in October (6 pages, 16 on the list).
2. **The `bio` field here is shorter for 22 of 22** (1,804 legacy words, 839 here, counting the legacy bio paragraphs including any with inline links;  the two hand-read examples show the loss: degrees and certifications kept, hobbies and "prior to" sentences cut). But Jordan Read (762 words), Anthony Castronova (511) and Lindsay Platt (341) also have profile text below the field, shown on their pages, against legacy bios of 79, 140 and 99 words; for those three the page here is longer. For the other 19 the bio is a summary. This reads as a deliberate summary, not damage, but it was done to every person. Whether it was agreed with each person I cannot tell. Facts that a reader might act on (qualifications, prior employer) are mostly kept; the free-time sentences are cut.
3. **Titles: 1 real difference and 3 wordings.** Summer Conley (above). Brianna Kearns: "Events and Training Support Fellow" (legacy) against "Events & Training Support Fellow" (here). Devin Cowan and Neal DeBuhr: the legacy list puts them under the heading "Independent contractors"; here the title says "(contractor)". The group heading exists nowhere here, only the note in the title.
4. **Three legacy addresses have a different name from the page here.** `anthony-castronova` is `tony-castronova` here; `kimberlee-wong` is `kimmy-wong`; `kaysa-vaarre-lamoureux-she-they` is `kaysa-vaarre-lamoureux`. A redirect list built from slugs would miss these three. The Kimberlee/Kimmy difference is also inside this site: `full-team.json` says Kimberlee Wong, `content/team/kimmy-wong.md` says Kimmy Wong.
5. **Contact details: absent here on 22 of 22.** Each legacy page offers an e-mail address, 3 of them a phone number as well. No staff card or page here shows a contact route for a person (the footer and contact page are not part of this audit). This may be a decision; it is a difference a visitor would notice.
6. **Five profile files cannot be reached.** Of the 9 files in `content/team`, 5 (Brianna Kearns, Callie Porter-Borden, Kimmy Wong, Lisa Mucciacito, Zahraa Alhmood) belong to people whose `has_profile` is false, so no page shows them. Only 3 of the 9 (Jordan Read, Anthony Castronova, Lindsay Platt) have any text below the front matter.
7. **Lecturers: 69 of 69 have no counterpart, and I found no recorded decision.** October's stage 3 lists them as having no place in the schema; stage 7 (`261005_parity-stage7-decisions.md`) gives options A to D, with A (one table page of name, institution and topics, no contact details) recommended if staff confirm the list is current. The legacy page itself says "This list is an archive and is not currently being updated." That is a statement about the old list, not a decision about this site. Each page carries a lecture topic, an affiliation and, for 67, an address behind a click. The list pages are also 404 at cut-over. 11 of 69 names occur elsewhere on this site (above); 58 do not.
8. **Status (current or former) cannot be compared:** neither side has a field. Both lists are the 22 current staff. Headshot files named `laura-davis` and `maureen-ako` are in `public/team/headshots`, though no one with those slugs is in `full-team.json` (commit dd48676 removed two people from the team) (noticed, see section 8).
9. **The governance page here names no board or committee member.** The legacy page lists 32 people with their institutions. This site's page has the headline "Board, committees, and bylaws." and then shows only a paragraph on committees and a documents list. `content/board/README.md` says board profiles are "referenced from about/governance.vue manually"; the page contains none. The documents and the code disagree.

## 6. Not examined

- **Whether a photo is the right person's.** I checked that a file exists for 21 of 22; whether each shows the person named needs eyes (the October failure was wrong photos on cards).
- **Bios were compared by word count for 22 and read for 3.** The other 19 were not read.
- **The decoded e-mail addresses** (never decoded; only placeholders counted) and any phone number's value.
- **Lecturer topics and links** (69): there is nothing to compare them with. The 11 list pages (audience pages and p2 to p7) were used only to read names.
- **Whether a name occurring elsewhere is the same person** (11 lecturers; 3 of the 7 speaker hits have a different institution).
- **The 229 member representatives**: only their full names were compared with the 69 lecturers and the 32 governance names, as yes or no.
- **Anyone who left before the snapshot**; the legacy site has no former-staff list, and I did not look in the October crawl for one.

## 7. Limits of the method

1. Matching is by name only. A person under a different spelling, or whose name changed, is *none*. The only nickname case found (Kimmy) came from the profile file, not from a rule.
2. The lecturer and governance probes look for the full name as words in `content/` (with accents and dots ignored). A name written "Surname, F." (as in an author list, for example in the Critical Zone products list) is not found, so "appear nowhere" (58 of 69; 17 of 32) means "not found as First Last". They do not look at `pages/` or `components/` (an early run matched the name "Li Li" inside markup). A name split across a line, or shortened, is missed. The inline-link bios were counted (the totals did not change).
3. The control is small and easy (section 3).
4. The cut-over classes and click counts come from the 6 November simulation; clicks are floors.
5. "Differs" for contact details means present on one side and absent on the other; I did not read what would be shown, because the pages here show nothing.
6. I decided what "a staff or lecturer page" is from the legacy address pattern. The governance names are an extra and were read from the page text, not from person pages.

## 8. Proposed fixes (for Jordan; none made here)

1. **Redirects** (rule 8: a change of URLs, to be approved by Jordan): 22 staff addresses, 6 to their profile and 16 to `/about/team`; the 3 slug differences (finding 4) need their own lines. Today all 22 are 404.
2. **Decide the title for Summer Conley** (finding 3) and whether "Independent contractors" should be a visible group.
3. **Henok Tedla has no photo here.** The legacy file exists; a decision, then a `public/` addition.
4. **Contact route for staff** (finding 5): decide whether a person's page or card should offer one.
5. **Fun facts**: 10 of 20 on the legacy pages were dropped; decide whether to restore any.
6. **Lecturers**: decide whether the archive comes across as one page (a list of 69 names, affiliations and topics, with the archive notice), is dropped, or is replaced by something new. If dropped, the 69 addresses and the list pages need a redirect target (the team page would be the wrong target for them; `/learn-train`, which exists as a route here, is closer). I would not rebuild 69 profile pages for an archive that says it is not updated; option A of stage 7 (one table page, no contact details) is the smaller thing. The existing redirect file already sends `/faculty` and three of its subpages to `/learn-train`; none of those rules has a splat, so the lecturer addresses are not covered.
7. **Governance**: decide whether the board and the three committees are listed on `/about/governance`. The names are public on the legacy page. If they are, that is a content task (the board profile has one entry, Tao Wen, and a README that says it is not rendered).
8. **Tidy-ups on the team files:** the Kimberlee/Kimmy name in two places; the 5 unreachable profile files; the two headshots of people no longer on the team (privacy, not a parity point).
9. **Next audit, A3d to A3f**: not started.
