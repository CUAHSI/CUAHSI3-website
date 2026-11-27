---
paths:
  - "content/**"
  - "public/documents/**"
---

<!-- Moved unchanged from CLAUDE.md on 14 November 2026 (org issue 124). Loaded by Claude Code when a matching file is read or edited. Other tools: AGENTS.md names this file. -->

## Content rules (Phase 2)

These apply to every change under `content/`. `verify.sh` enforces C1, C5 and C6 where a
check can; the rest are yours to keep and a website owner's to check (`AGENTS.md`, top), and the reviewer's when the branch has code.

C1. **The validator must exit 0.** `npm run validate:content` reports no failure, no
    cross-reference problem and no skipped check group, and `verify.sh` fails a branch
    where it does not. Until 5 October 2026 a known-failures list
    (`scripts/validate-content.known-failures.txt`) tolerated the 12 failing files or
    entries; the three repair PRs emptied it and it was deleted. Do not recreate
    it: `verify.sh` fails if the file exists. Never loosen a schema
    to make content pass. A schema change is code and Jordan's to approve; once he has, a field that a request needs goes
    in the request's own PR (rule 3), which says who approved it. `verify.sh` warns when a branch changes both.
C2. **Every item has a source.** A job has `url` (required by the schema) and `source`
    (optional; `newsletter`, `joshswaterjobs` or `usajobs`; give it whenever it is known; a
    USAJOBS posting also carries its id in the optional `source_id`). A job's `url` is the posting's own page, never a link
    found in its description text; the validator rejects an Outlook SafeLinks wrapper (`safelinks.protection.outlook.com`). An event announced in a
    newsletter has `newsletter_source` (optional in the schema; leave it out for an event
    that no newsletter announced, and say where the facts came from). A news item
    summarising an article has `source_url`. If the requester or another staff member supplied the facts
    directly, say so in the PR description: who, and when.
C3. **Never invent.** No guessed dates, URLs, YouTube IDs, email addresses, names,
    funding numbers or deadlines. If a required field is unknown, the item is not ready:
    leave it `published: false` and list what is missing under "To verify" in the PR. If an
    optional field is unknown, leave it out.
C4. **Check for duplicates before creating anything.** Search the collection for the same
    `slug`, the same `url`, and the same title with a nearby date. Recurring events are
    announced in several newsletter issues; update the existing entry and add the new issue
    to `newsletter_source`. Show the requester each plausible match and let them decide; unpublishing an existing item
    needs a website owner (C5).
C5. **A published slug never changes, and a published file is never deleted or renamed.**
    To withdraw something, set `published: false`. To merge duplicates, keep one and
    unpublish the other. Ask a website owner whether a redirect is needed. `verify.sh` fails a branch
    that deletes or renames any file under `content/` (published or not), changes the slug of
    a published `.md` item, or removes or changes a slug in a content JSON array (a rename
    a website owner asked for needs `VERIFY_ALLOW_CONTENT_RENAME=1`, and the PR says so; the same switch turns a changed slug of a published `.md` item from a failure into a warning, and that PR must also say that the old address needs a redirect, which nothing checks). It cannot
    read the slug of a file whose front matter does not parse (the 9 cyberseminar files
    with no closing `---`), so for those the check passes silently; look yourself.
C6. **`people_mentioned` takes slugs of people who have a profile in the repo:** team slugs
    (copied from `full-team.json`), board slugs and community slugs (the `slug` of a file in
    `content/board/` or `content/community/`; `verify.sh` also accepts a file name there). Not display names, not guesses. Whether a
    named person has a profile is a fact to check against those files. A new value that
    matches no profile is not allowed, and `verify.sh` fails it. Three values already in the
    content match no profile; the validator lists them as informational output and they are
    not a repair item.
C7. **Editorial judgment is proposed, not applied.** News versus impact story, `category`,
    which stories get a tool's tag, and every `excerpt` are judgment calls. Make the call,
    label it as yours in the PR ("Agent's choice: news, because it expires"), and let a website
    owner change it.
C8. **Do not mirror external articles.** Write a short summary in your own words and set
    `source_url`. Do not copy a job posting's full text.
C9. **A newsletter issue is, today, an input; assembling issues from entries is the goal.**
    An issue is currently decomposed into `news/`, `research/`, `events/` and `jobs/` entries
    (content model, section 9). Every fact in an issue should end up in an entry: if a fact
    is only in the newsletter, the entry it belongs to is missing. The target state is the
    other direction, an issue assembled from entries plus an editor's note. Do not describe
    the target as current practice.
C10. **Leave what you were not asked to change.** Do not reformat, reorder, re-wrap or "tidy"
    frontmatter or body text in a file you are editing for another reason. The diff should
    show the change and nothing else.
C11. **Personal data.** `content/members/reps.json` holds names and email addresses. Change
    only the rows a task names. Never copy its contents into a report, a PR description or
    the eval log; refer to a row by its position ("row 47 of the members file"). The diff of
    the PR that changes the row necessarily shows it; that is the only place.
C12. **Bulk content edits follow "Bulk edits."** Ten files or fewer by hand. More than ten:
    state the pattern and the count, do one by hand, wait for a website owner's approval.
C13. **File names.** New files follow the pattern of their collection: `news`, `newsletter`,
    `events`, `jobs`: `YYMMDD-slug.md`. `cyberseminars`: `YYYY-slug.md`. `research`:
    `YYYY-slug.md` (28 of the 31 existing files; three use `YYMMDD-`; confirmed by Jordan).
    `programs`, `board`, `community`, `team`: `slug.md`. Existing files are not renamed
    unless a website owner asks. The frontmatter `slug` drives the URL, not the file name.
C14. **An item about a thing links to the thing.** A news item, impact story, event or recording that
    describes a dataset, software tool, paper, award, program, report or video links to its primary
    source in the body: the HydroShare resource or DOI, the code repository, the publisher's page, the
    funder's award page, the program page. Take the link from the source the item was written from (the
    newsletter, the article, the draft) and open it before using it; C3 applies, never guess a URL. Link
    text names the thing, not "click here". For a PDF, prefer a copy hosted here (`public/documents/`) to
    a link to the legacy cuahsi.org site, which will go. If the source gives no link and none can be found,
    say so under "To verify" in the PR instead of leaving the item silent. An item with nothing to link to
    (a welcome, a staff announcement) needs no link. The rule applies to new items and to any item a task
    already changes; stories written before it are not edited just for this (C10), so adding their links is
    its own task and PR. No `verify.sh` check: a pattern cannot tell which items describe a thing, so the
    reviewer checks it by reading the item against its source.

C15. **An impact story names the award that supports it, in `awards`.** Each story in `content/research/` lists the ids
    of the awards (from `content/awards/awards.json`) that its acknowledgment should show; `/about/impact/<story>` prints each
    award's sentence under the story, small and in italic. The sentence is written once, in the registry (the award number is
    typed once, in `number`, so a typo cannot repeat), and never in a story's body. If the registry has no suitable award, add
    one with the funder's own title and number, checked at the funder's page (C3); for a CIROH subaward give the long form of
    the number (A25-0364-S008) and the subaward's official title, with the standard CIROH sentence. `awards: []` means checked,
    nothing of CUAHSI's to acknowledge: use it for a highlight of other people's funded work (a dataset a researcher published
    on HydroShare, a book others are writing), and make the story say who made the work and, where known, who funded it. Leave
    `awards` out only while the attribution is undecided; `npm run validate:content` lists those stories. A story dated before
    an award began does not cite it. `verify.sh` fails a story that names an id the registry does not have.

C16. **A job names its member institution only when it is sure.** `member_institution` on a `content/jobs/` file (optional) is
    a name exactly as it is spelled in `content/members/institutions.json`, the member registry (the one list of members; a graduate
    program row takes the same field): the employer is, or is part of, that CUAHSI member institution.
    Set it when a member's name is in the employer text or the posting itself says the employer belongs to a member (for example
    the Alabama Water Institute, part of the University of Alabama); never from a guess. `null` means checked and not a member (it
    turns off the job board's name match for that job). Leave it out when unsure: the board then falls back to matching member names
    in `organization`. The job board shades member listings and lists them first. `verify.sh` fails a name that is not in the member list.
