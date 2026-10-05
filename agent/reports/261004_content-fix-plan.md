# Plan: the 12 content validator failures (4 October 2026)

> **Status (added when this report was committed):** Jordan chose option A. The edits are waiting for the Phase 2 content locks to be lifted.

Read-only analysis, written while the Phase 2 locks were still closed, so no content file was changed. It says what each failure is, the exact edit I would make, what changes on the site, and what I need from Jordan. Everything below was read from the files in the repo on the day; "I expect" marks anything I could not see without making the change.

`npm run validate:content` reports **11 YAML parse failures** (9 cyberseminar files, 2 research files) and **1 schema failure** (1 of 229 entries in `members/reps.json`). `scripts/validate-content.known-failures.txt` lists them (12 lines).

## 1. Nine cyberseminar files: the front matter is never closed

**Diagnosis.** In each of the 9 files the file starts with a `---` line, lists the fields, and ends with the `description:` line. There is no closing `---`. The site therefore reads no fields from them (no title, slug, date, `published`). I looked at all 15 files in `content/cyberseminars/`: the 6 files that work have a closing `---` (at line 23 to 28), the 9 broken ones have `---` only at line 1.

**The edit.** Add one line, `---`, at the end of each of the 9 files. No other change.

**What I expect on the site (inference: I have not closed any file, so none of this was seen).** All 9 files say `published: true`, so closing them would add 9 cards to `/learn-train/cyberseminars` (6 cards become 15; under option A, 11), and new series buttons would appear (the page builds its buttons from the series values of the published files: 3 today). If all 9 are published (option B), 3 more buttons: `Navigating (beyond) Academic Waters (with AGU H3S)`, `Post-Field Season Data Management` and `Standalone webinar`. Under option A only the 5 good-ID files appear, so 5 new cards and 2 new buttons (`Post-Field Season Data Management`, `Standalone webinar`). The home page's "Latest recording" would not change (the newest date stays 2025-12-10). Baseline images for `/learn-train/cyberseminars` (2 widths) would change on purpose.

**The catch: 4 of the 9 files have a video ID that is not a real YouTube ID.** YouTube IDs are 11 characters. I counted:

| File | `youtube_id` | Problem |
|---|---|---|
| `2025-nav-beyond-academic-careers.md` | `""` (empty) | no video |
| `2025-nav-beyond-academic-funding.md` | `""` (empty) | no video |
| `2025-nav-beyond-academic-broader-impacts.md` | `Y483oWkQ` (8 characters) | looks cut off |
| `2025-nav-beyond-academic-ai.md` | `GMeAjRTsM` (9 characters) | looks cut off |

The other 5 have 11-character IDs. A card with no ID never opens; a card with a cut-off ID would open a player that shows an error. I cannot supply the real IDs: that would be inventing content.

**Options for you (this is the decision I need):**

- **A. Close all 9 files; set `published: false` on the 4 with a bad video ID. Recommended.** The 5 good seminars appear. The 4 stay hidden exactly as they are hidden today, but become valid files, and they can be switched on when you give me the real IDs. The only invented-looking change is one `true` to `false` on 4 lines, which keeps today's behaviour.
- **B. Close all 9 and publish all 9.** Fifteen cards, but two cards that cannot play and two that show a broken video.
- **C. Close only the 5 good files and leave the 4 alone.** The 4 stay on the validator's known-failures list.

If you choose A or B I would also like the real YouTube links for the 4 (the page for each series on the CUAHSI YouTube channel has them).

## 2. Two research files: a colon inside an unquoted value

**Diagnosis.** `content/research/2025-datacite-migration.md` and `2025-hydrocare-ndistem.md` have, on line 12, an `excerpt:` whose text contains a colon followed by a space ("...for researchers: NSF Public Access..." and "...a central theme: trust-building..."). In YAML an unquoted value cannot contain `: `, so the line fails to parse.

**The edit.** Put double quotes around the excerpt text on line 12 of each file. Neither excerpt contains a double quote, so no escaping is needed. The words do not change.

**What I expect on the site: a visible change on 2 pages.** Both stories already show their title and body today, so the parser reads most fields, but the excerpt is lost. The story page `pages/about/impact/[slug].vue` prints `item.excerpt` (lines 29 and 33): the built page of a healthy story (`hydrolearn-ciroh-hackathon-2026`) contains its excerpt text, and the built output contains the DataCite excerpt text nowhere, so the excerpt is dropped today. Quoting line 12 should therefore add the excerpt lead to **`/about/impact/datacite-doi-migration-2025`** and **`/about/impact/hydrocare-ndistem-2025`** (I inferred the second from the same cause and did not check its built page). The list cards on `/about/impact` print an excerpt paragraph that is **empty on all 32 cards, including healthy files**, so the list page should not change; I did not investigate why (Nuxt Content has its own `excerpt` meaning) and will record it as a Noticed line. All of this is inference until the edit is made and the built pages are compared.

## 3. One bad email in `members/reps.json`

**Diagnosis.** Row 47 of the members file has an email address followed by a stray character, written in the file as the JSON escape `\u00c2` (not the letter itself, so a search for the letter finds nothing; search for `u00c2`) (a capital A with a circumflex, left over from a text-encoding mix-up). It is the only occurrence of that escape in all of `content/` (searched for `u00c2` and `u00c3`).

**The edit.** On line 288, remove `\u00c2` from the email value so it reads as the address without the stray character. That is the address already in the file, minus the junk character.

**What changes on the site.** On `/member-portal` row 47 currently shows the address with the stray character and its mailto link includes the stray character, so the link does not open a correct address. After the edit the text and link are correct. One row changes.

## Order and size

Three small content PRs, each with its own branch (`task/content-...`), in this order: (3) the email (smallest, no decision); (2) the two excerpts; (1) the cyberseminars once you pick A, B or C. Each removes its files from `scripts/validate-content.known-failures.txt` in the same PR, and I report the validator counts before and after (12 failures now; I expect 0 at the end under A and B: the schema takes `published` as a plain boolean, so under A the 4 hidden files still pass; under C the 4 stay on the list).

## What I could not do

- Make any of these edits: the hook still blocks `content/` and the deny rule in `settings.json` is still there (Jordan edits both).
- Check the YouTube IDs against YouTube.
- Check that no other page reads these files in a way I have not seen (I read the cyberseminars page and the home page logic earlier in this session; `grep` finds `reps.json` only in `pages/member-portal/index.vue`).
