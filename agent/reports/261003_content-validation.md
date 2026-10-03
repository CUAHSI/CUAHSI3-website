# Content validation report, 261003

Roadmap task 2. Produced by `npm run validate:content` (`scripts/validate-content.mjs`, schemas in `scripts/content-schemas.mjs`). Read-only: nothing under `content/` was changed, and no failing file was fixed or excused. Base commit: `main` at `084d6c3`.

## Summary

389 items checked, 377 pass, 1 fails a schema, 11 fail to parse, 0 cross-reference problems, and 8 unresolved `people_mentioned` values that are reported as informational only. The validator exits 1, because of the 12 failing files.

| Collection | Checked | Pass | Schema fail | YAML parse fail |
|---|---|---|---|---|
| news | 12 | 12 | 0 | 0 |
| newsletter | 7 | 7 | 0 | 0 |
| events | 27 | 27 | 0 | 0 |
| jobs | 29 | 29 | 0 | 0 |
| cyberseminars | 15 | 6 | 0 | **9** |
| research | 31 | 29 | 0 | **2** |
| programs | 4 | 4 | 0 | 0 |
| team (.md) | 8 | 8 | 0 | 0 |
| board | 1 | 1 | 0 | 0 |
| community | 4 | 4 | 0 | 0 |
| team/full-team.json (entries) | 22 | 22 | 0 | 0 |
| members/reps.json (entries) | 229 | 228 | **1** | 0 |
| **Total** | **389** | **377** | **1** | **11** |

"Checked" is files for the markdown collections and array entries for the two JSON files. A file with a YAML parse failure is counted in that column only, not also as a schema failure.

The findings that matter, in order:

1. **9 of 15 cyberseminar files carry no fields as far as the site is concerned.** They have no closing `---` line, so the site reads no fields from them (details below). This is the largest problem the validator found. The reconcile report did not catch it: its key counts for cyberseminars (every key "15 of 15") came from a parser that did not need the closing line, so they described the YAML text in the file, not what the site reads.
2. **2 of 31 research files have broken YAML** (an unquoted `: ` in `excerpt`). The site keeps going and stores `excerpt` as an object.
3. **1 of 229 member reps has a bad email** (`ypokhrel@msu.eduÂ`, with a stray character).
4. **8 distinct `people_mentioned` values are not staff slugs** (they name board and community people). 72 references in 24 files were checked. By Jordan's decision these are **unresolved, informational**, not errors: they have their own list and do not change the exit code (section 3).

A repair list for the 12 failing files (file, line, exact change) is in section 10. It has not been applied; applying it on a scratch copy took the validator from 377 to 389 of 389 passing.

Everything else passes, including slug uniqueness (151 slugs in 11 collections), every `newsletter_source` value (40 references, all real newsletter slugs) and every `content/team/*.md` slug (8 of 8 are in `full-team.json`).

## 1. YAML parse failures (a separate category from schema failures)

### 1a. Nine cyberseminar files with unclosed frontmatter

`2024-intro-compute-services-july`, `2024-intro-hydroshare-may`, `2025-nav-beyond-academic-ai`, `2025-nav-beyond-academic-broader-impacts`, `2025-nav-beyond-academic-careers`, `2025-nav-beyond-academic-funding`, `2025-post-field-data-practices`, `2025-usgs-nwaa-understanding`, `2025-usgs-water-data-apis` (all `.md`, in `content/cyberseminars/`).

Each starts with `---`, lists its fields, and ends without a second `---` line. The site's frontmatter reader needs the closing line; without it the file has no frontmatter.

What I checked, and what I did not:
- **The files.** Counting `---`-only lines in all 15: **9 have exactly 1** (and 12 to 13 lines in total, no body); the other **6 have 2** (24 to 29 lines). Independent of the validator.
- **What the site stored.** The built site ships its parsed content as `api/_content/cache.*.json`. In it, the 22 cyberseminar documents (15 `.md` and 7 transcript `.json`) split like this: **6 have `published: true`; the 9 broken files have no `published`, `slug`, `date`, `series` or `speakers` at all.** Their title is made from the file name (for example "2024 Intro Hydroshare May"), and the YAML text sits in the body. Every other collection's `published: true` count in that cache matches its file count (events 27 of 27, jobs 29 of 29, news 12 of 12, newsletter 7 of 7, research 31 of 31, team 8 of 8, board 1, community 4, programs 4).
- **What follows.** Any page that asks for `published: true` cyberseminars cannot return these nine. Three do: the Cyberseminars page, the team profile "seminars" block and the home page's latest seminar. **Confirmed on the live Cyberseminars page by Jordan: it shows 6 cards, the same as the 6 files that parse.** The team profile block and the home page are inferred from their queries; I have not looked at either in a browser.
- **A correction to my own earlier wording.** A first draft of this report said the Cyberseminars page "lists series, not individual seminars". That was wrong: the page draws one card per seminar (`pages/learn-train/cyberseminars/index.vue` loops over the `published: true` seminars), and the series are only filter buttons above the cards. I had counted the text `card-lift` in the built page (8), which also appears in the page's CSS, and mistook the count for series. Counting the actual card elements gives 6.
- **Likely fix (Phase 2, not done):** add a closing `---` line to each of the nine files. The six good files have the same layout, with a blank body after the closing line.

### 1b. Two research files with a colon in `excerpt`

`2025-datacite-migration.md` and `2025-hydrocare-ndistem.md`, line 12: an unquoted `excerpt:` value contains `: ` (a colon and a space), which YAML reads as a nested mapping. Error from the parser: `BLOCK_AS_IMPLICIT_KEY: Nested mappings are not allowed in compact mappings`.

The site does not stop. It keeps whatever the parser recovered, and the recovered `excerpt` is an **object**, not a string; the schema flags it as `expected string, received object`. This is the likely reason the built page for the DataCite story had no meta description. I read the source line of `2025-datacite-migration.md` to confirm the unquoted colon. Likely fix (Phase 2): put quotes around the value.

## 2. Schema failures

One: `content/members/reps.json[47]` (Yadu Pokhrel), `email: Invalid email address`. The value is `ypokhrel@msu.eduÂ`. The last character is a stray `Â`. That looks like a non-breaking space saved in the wrong encoding, but I only inferred that from the character.

No other file fails its schema. That includes the checks I added beyond what the model document says (non-empty strings, slug format, real calendar dates, valid URLs): every existing file satisfies them, so they catch nothing today but will catch new mistakes.

## 3. Cross-references

| Check | Result |
|---|---|
| Slugs unique within each collection | ok, 151 slugs in 11 collections |
| Every `people_mentioned` value is a staff slug in `full-team.json` (newsletter and research) | **not a failure.** 72 references in 24 files, 23 distinct values, against 22 staff slugs; 15 values are staff slugs and **8 are unresolved, informational** (5 match a profile, 3 match none; listed below and in their own section of the validator output) |
| No unresolved `people_mentioned` value is a probable typo of a staff slug | ok, 0 of the 8 flagged |
| Every events `newsletter_source` value is a newsletter slug | ok, 40 references in 27 files, 7 distinct values, 7 newsletter slugs |
| Also checked: every `content/team/*.md` slug is in `full-team.json` | ok, 8 of 8 |

Jordan's decision: these eight name board and community people, so they are not errors. The validator lists them as "Unresolved, informational" and does not count them as failures or let them change the exit code. They are split into two lists:

- **Matches a board or community profile file** (5): `tao-wen`, `moses-kiwanuka`, `aashish-gautam`, `hassan-saleh`, `heather-kropp`.
- **Matches no profile file** (3): `masoumeh-hashemi`, `marco-maneta`, `punwath-prum`.

"Matches" means the value equals the profile's `slug` frontmatter or its file name (without `.md`). For the five matches both agree: the slug and the file name are the same word in each. If board and community were not both read (a partial run), the values are not split and the list says so.

**One hard failure was added:** a non-staff value that is a near miss of an existing staff slug (one or two characters different, or the same words in another order) fails as a probable typo, and the message names the slug it resembles. **On the current content it flags 0 of the 8**, as Jordan expected. I tested it on a scratch copy (`.agent/typo`, built from the repaired scratch tree, gitignored): `julia-mastermann` (one character added to `julia-masterman`), `platt-lindsay` (the words of `lindsay-platt` reordered) and `lindsay-plat-x` (two characters from `lindsay-platt`) were each flagged, naming the right staff slug. Two controls were correctly left alone and listed as informational: `someone-unrelated`, and `tao-wang` (a near miss of the *board* member `tao-wen`, which is not a staff slug). **Limits:** the check compares only with staff slugs, so a typo of a board or community person is not caught; it is a heuristic, so a typo more than two characters away is not caught either.

The eight values that are not staff slugs, all in newsletters: `masoumeh-hashemi` (260101-january), `marco-maneta` and `punwath-prum` (260201-february), `tao-wen`, `moses-kiwanuka`, `aashish-gautam`, `hassan-saleh` and `heather-kropp` (260301-march). `content-model.md` says `people_mentioned` takes team slugs. Five of the eight match profiles in `content/board/` and `content/community/` (see above); the other three match none. The schema accepts any slug-shaped value. Whether `content-model.md` should say `people_mentioned` also takes board and community slugs is still open.

## 4. How this validator differs from what the site's parser accepts

The validator checks **the files**, not what the pages receive.

- **Same parser.** Frontmatter is read with the `yaml` package, version 2.9.0, calling `parseDocument(text).toJSON()`: the same package, version and call as the site's own reader (`remark-mdc`'s `parseFrontMatter`, which `@nuxtjs/mdc` calls). I read that code. Dates therefore stay strings in both (`2026-07-01` is a string, not a Date), and the date format check works on strings.
- **Difference 1, errors.** The site never looks at the parser's error list; it keeps what was recovered and carries on. The validator reports every error and warning as a YAML parse failure. That is why files the site accepts show up here. For the unclosed-frontmatter case the site's reader returns no fields at all, which is the opposite of "accepts loose YAML": it silently reads nothing.
- **Difference 2, post-processing.** The site then converts dotted keys into nested objects (`a.b: 1` becomes `{a: {b: 1}}`) and Nuxt Content adds its own fields (`_path`, `_id`, and, as seen in the cache, a title made from the file name when there is none). The validator does none of that, so a dotted key would show up as an unknown key and a missing title would show up as a missing field. I read the dotted-key step in the code; I did not test it. I did not check whether Nuxt Content changes `date` values further; in the one case I looked at (a cyberseminar `date`) the stored value matched the source string.
- **Difference 3, JSON.** For a top-level JSON array the site stores `{ body: [...] }` and prints a warning (footgun 7). The validator reads the raw array and checks each entry.
- **Difference 4, empty frontmatter.** A frontmatter block with nothing in it (`---` followed straight away by `---`) is reported as a failure here. The site carries on with no fields. No current file does this.
- **Bodies.** Markdown bodies are never validated.
- **Partial runs.** `npm run validate:content -- events` checks one collection, so the cross-reference checks that need other collections cannot run. They are printed as `SKIP` lines, the last line says "partial run", and the exit code is 0 if nothing else failed. A full run treats a skipped check as a failure. (The first version of the script skipped them silently and ended "OK"; the reviewer caught that.)

## 5. Where the schemas follow the files and where they follow the model

Rule: a key is required if every file in the collection has it, optional if only some do. Objects are strict (an unknown key fails). Nothing was loosened to make a file pass.

| Item | Content model says | Files show | Schema follows |
|---|---|---|---|
| events `type` | six values including `field` | five used; `field` unused | the model: `pages/learn-train/archive` filters on `field`, so it is a valid value |
| events `timezone` | "ET or null" | nine different strings (`America/New_York`, `ET`, `MT`, ...) | the files: any string or null |
| events `end`, `featured`, `registration` | listed as ordinary fields | absent in 4, 14 and 12 of 27 | the files: optional |
| research `people_mentioned`, `partners`, `funding` | listed | absent in some files | the files: optional |
| news `author` | not listed | present in 1 of 12 | the files: optional key |
| programs | "three flagship programs", one shape | 4 files, two shapes (`watersofthack.md` is a different shape) | the files: two shapes; a file must match one |
| board, community | "stub directories with no rendering pages" | 1 and 4 real profiles | the files: validated as profiles |
| jobs `source` | `newsletter`, `joshswaterjobs` | both used, absent in 6 of 29 | both: those two values, optional |
| research `category`, jobs `type`, team `department` | enumerated | exactly the documented values used | both agree |
| filenames | `YYMMDD-slug.md` for every dated type | not followed by cyberseminars or research | not checked by the validator (the reconcile report has the counts) |

Checks that are **tighter than the model document** (or than a bare type). Every existing file satisfies them except the one failure reported in section 2, so they catch nothing else today:

| Check | Where |
|---|---|
| strings must not be empty | most required text fields (titles, descriptions, bios, roles, excerpts and so on). Plain or nullable strings are exempt: `youtube_id`, events `timezone`, `location.city`, `location.url`, `registration.url` and `.cost`, research `funding`, and in `full-team.json` `pronouns`, `photo`, `fun_fact` and the `links` values |
| slug format: lowercase words joined by single hyphens | every `slug`, `series_slug`, and each `people_mentioned` / `programs_mentioned` value |
| real calendar date (no `2026-13-40`), in one of three formats seen in the files | every date field |
| must be a valid URL | `source_url`, `mailchimp_url`, jobs `url`, programs `apply_url` |
| must be a valid email | `members/reps.json` `email` (the one failure) |
| strict objects: an unknown key fails | every collection and nested object (events `location`, `registration`; `full-team.json` `links`) |
| an enumerated value the model does not list | community `type` (`fellow`, `faculty-partner`; the model gives `community/` no schema) |
| whole number | `year` in research, `elected` in board |

The research `category` and jobs `type` enums match the values the files use: 5 of 5 and 6 of 6 values appear in the content.

## 6. Not covered

- `README.md` files (3: board, community, programs) and `content/cyberseminars/transcripts/` (7 `.json` files): skipped, and listed in the validator's output.
- Markdown bodies, and the checks the model describes in prose but that I was not asked to build: cyberseminar speaker matching, `programs_mentioned` values, `series_slug` consistency between files, whether photo files exist, whether URLs work, tag vocabularies.
- The validator is not in `verify.sh`, as Jordan decided. Roadmap task 5 says it gets wired in there.

## 7. How the validator was tested

Because `content/` cannot be changed, I built a scratch tree (`.agent/make-fixture.mjs`, gitignored, so not in the PR) and ran `node scripts/validate-content.mjs --root=.agent/fixture` on it. It held one deliberately bad file per kind of check. Result: 2 YAML parse failures (an unclosed frontmatter, and a colon in `excerpt`), 9 schema failures (missing required field, unknown key, impossible date `2026-13-40`, bad URL, bad enum in `events.location.mode`, bad enum in `jobs.type`, a `programs` file matching neither shape, a bad `department` in `full-team.json`, a bad email), and 4 cross-reference problems (duplicate slug, `people_mentioned` not a staff slug, `newsletter_source` not a newsletter slug, a team `.md` slug not in `full-team.json`). After the later change that makes non-staff `people_mentioned` values informational, the same fixture gives 3 cross-reference problems plus 1 informational entry (`ghost-person`), and the validator still exits 1. The typo check was tested separately (section 3): 3 of 3 planted typos flagged, 2 of 2 controls not flagged, 0 of the 8 real values flagged. Every category fired and the README file was skipped. After the reviewer's findings I also ran: a one-collection run (`events`), which now prints three `SKIP` lines and "partial run"; a three-collection run, which runs the cross-references it has the data for; a `--root` that does not exist and a root with no `content/` folders, both of which exit 2 with "Nothing was validated". Nothing was tested beyond that; for example, a duplicate slug inside `full-team.json` was not exercised.

## 8. Sample (rule 12)

Files opened to confirm the bulk results:
- **Affected (read in full):** `content/cyberseminars/2024-intro-hydroshare-may.md` (ends at line 12, no closing `---`), `content/cyberseminars/2025-usgs-water-data-apis.md` (ends at line 13, no closing `---`), `content/research/2025-datacite-migration.md` (unquoted `: ` on line 12).
- **Unaffected:** `content/cyberseminars/2023-nav-academic-waters-niche.md` (closing `---` on line 23), `content/news/260423-jupyterhub-incident.md` (closes on line 9), `content/events/260101-earthscope-geophysics.md` (closes on line 21).
- `content/members/reps.json` entry 47 was printed and its email read (the stray `Â`).
- The 15-file `---` count came from `grep`, and the cache counts from a script over the built site's data; neither was hand-counted.

## 9. Noticed while doing this

- `npm audit` reports 36 vulnerabilities in the installed tree (4 low, 3 moderate, 25 high, 4 critical), including an advisory for Nuxt MDC (GHSA-cj6r-rrr9-fg82). I did not look into them or change anything; the two packages added here (`zod`, `yaml`) are not named in what I saw.
- The three README files (`board`, `community`, `programs`) are ingested by Nuxt Content as documents (they appear in the built site's content cache). I did not check whether they are reachable by URL.

## 10. Repair list (nothing applied)

For each of the 12 failing content files: the file, the line, and the exact change that would fix it. **None of these edits has been made.** `content/` is frozen in Phase 1; Jordan decides who makes them and when.

All 12 together would take the validator from 377 of 389 passing to **389 of 389**, with no YAML parse failures and no schema failures. I tested that on a scratch copy of `content/` under `.agent/` (gitignored), by applying exactly the edits below and running `node scripts/validate-content.mjs --root=.agent/repaired`. That run also showed that the nine repaired seminar files pass the schema, which could not be tested before because the validator could not read their fields. After the repairs, the only remaining validator output is the 8 unresolved `people_mentioned` values (informational, so the validator then exits 0: I ran it that way after changing the check), and the slug count rises from 151 to 160 because the nine seminars' slugs become readable (all unique). The real `content/` was not touched during the test (`git status -- content` showed no changes).

### 10a. Nine cyberseminar files: add the missing closing `---`

Each file starts with `---`, lists its fields, and stops at the `description:` line with no closing delimiter. The change is the same for all nine: **add one new line containing exactly `---` after the last line of the file** (every file already ends with a newline, none uses Windows line endings). Nothing else in the file changes.

| File (in `content/cyberseminars/`) | Add `---` after line | That line is |
|---|---|---|
| `2024-intro-compute-services-july.md` | 12 | the `description:` line |
| `2024-intro-hydroshare-may.md` | 12 | the `description:` line |
| `2025-nav-beyond-academic-ai.md` | 13 | the `description:` line |
| `2025-nav-beyond-academic-broader-impacts.md` | 13 | the `description:` line |
| `2025-nav-beyond-academic-careers.md` | 13 | the `description:` line |
| `2025-nav-beyond-academic-funding.md` | 13 | the `description:` line |
| `2025-post-field-data-practices.md` | 13 | the `description:` line |
| `2025-usgs-nwaa-understanding.md` | 12 | the `description:` line |
| `2025-usgs-water-data-apis.md` | 13 | the `description:` line |

**What visitors would see change:** these nine seminars would stop being invisible to the site. Today they carry no `published`, `slug` or `date`, so queries that filter on `published: true` cannot return them. After the edit they carry their real fields and can appear in the places that list seminars (the cyberseminars pages, the team profile "seminars" block, and the home page's latest seminar). That is the intended result, but it is a visible change and deserves a look on a deploy preview. I have not seen any of those pages with the nine included.

### 10b. Two research files: put quotes around `excerpt`

In both files, **line 12** is an `excerpt:` value that contains a colon followed by a space (`: `), which YAML reads as the start of a nested mapping. The change is to wrap the text after `excerpt: ` in double quotes. Neither line contains a double quote or a backslash, so no escaping is needed (the second contains an apostrophe, which is fine inside double quotes).

`content/research/2025-datacite-migration.md`, line 12.

Before:
```
excerpt: HydroShare completed migration of all DOI registration from Crossref to DataCite — a registry better suited for data publication — with a direct benefit for researchers: NSF Public Access Repository submissions can now be auto-populated from a HydroShare DOI, importing author, title, and abstract without manual re-entry.
```
After:
```
excerpt: "HydroShare completed migration of all DOI registration from Crossref to DataCite — a registry better suited for data publication — with a direct benefit for researchers: NSF Public Access Repository submissions can now be auto-populated from a HydroShare DOI, importing author, title, and abstract without manual re-entry."
```

`content/research/2025-hydrocare-ndistem.md`, line 12.

Before:
```
excerpt: Two HydroCARE Travel Fellows attended the National Diversity in STEM (NDiSTEM) Conference in Columbus and participated in CUAHSI's workshop on data management — providing feedback that surfaced a central theme: trust-building must come before technical solutions, and CARE-aligned engagement requires long-term commitment to Indigenous-led initiatives.
```
After:
```
excerpt: "Two HydroCARE Travel Fellows attended the National Diversity in STEM (NDiSTEM) Conference in Columbus and participated in CUAHSI's workshop on data management — providing feedback that surfaced a central theme: trust-building must come before technical solutions, and CARE-aligned engagement requires long-term commitment to Indigenous-led initiatives."
```

**What visitors would see change:** on these two story pages the `excerpt` becomes the sentence it was meant to be, instead of an object. Wherever the excerpt text is shown (the story cards, the page's description), it would now appear. I have not looked at how those two pages render today beyond noticing the DataCite page had no meta description.

### 10c. One member email

`content/members/reps.json`, **line 288** (entry 47, Yadu Pokhrel). The file stores the stray character as the JSON escape `\u00c2` directly after `msu.edu`.

Before (the text to search for: after `msu.edu` the file has the six characters backslash, `u`, `0`, `0`, `c`, `2`, not the letter Â itself):
```
    "email": "ypokhrel@msu.edu\u00c2"
```
After:
```
    "email": "ypokhrel@msu.edu"
```

**What visitors would see change:** `pages/member-portal/index.vue` (`/member-portal`, which is deliberately not linked from the nav) prints each rep's email as text and as a `mailto:` link, and also searches on it. Today this rep's link is `mailto:ypokhrel@msu.eduÂ`, which a mail program is unlikely to deliver to the right address. After the edit it would be `mailto:ypokhrel@msu.edu`. I read that in the page's code; I did not open the page.
