# Procedures

The procedures, moved unchanged from `CLAUDE.md` on 14 November 2026 (org issue 124), so that the
always-loaded `AGENTS.md` stays under 200 lines. `AGENTS.md` lists each one with when to use it.
They are due to become skills (org issue 125). "Locks" moved to `CLAUDE.md`, because it is about
Claude Code's hook and permission files. References to "Known footguns" mean
`.claude/rules/site-code.md` (symptom and fix) and `docs/footguns.md` (history); "the content
rules" are in `.claude/rules/content.md`; "Bulk edits" is in `AGENTS.md`.

## Procedures

**Start of session.** Run `git status` and `git branch --show-current`. Read the Status
column in `agent/roadmap.md` and the last ten lines of the log (`node scripts/eval-log.mjs --tail 10`). Tell Jordan
in three lines where things stand: branch, task in progress, anything uncommitted. Add one
line on upstream (see "Upstream"): run `git fetch upstream` and report what it has that the
fork lacks, with counts. Then wait for direction. Do not start a roadmap task unprompted.

**Upstream.** `origin` is Jordan's fork (`jordansread/CUAHSI3-website`); `upstream` is the
organisation repo (`CUAHSI/CUAHSI3-website`). All your work goes to `origin`; never push to
`upstream` (Jordan opens the fork-to-organisation PRs, for example organisation PR #28 on 5
October 2026). Things also change upstream, and not only on its `main`: on 5 October 2026
`upstream/main` held nothing the fork lacked, but the branch `upstream/agent-prototype` held 24
commits of job updates (3 new job files, 17 jobs set to `published: false`) and about 22 job
and audit PRs were open against it. Check, read only: `git fetch upstream`;
`git rev-list --count main..upstream/main`; `git log main..upstream/main`;
`git branch -r --no-merged upstream/main` (it also lists `origin/*`; read the `upstream/` ones);
`gh pr list --repo CUAHSI/CUAHSI3-website --state all --limit 40`. Bring upstream changes
into the fork only through a branch from an up-to-date `main` and a PR, never by merging on
`main`. Jobs files are content: a `content/short-name` branch with the content rules, never a
`task/` branch (rule 3). Do not merge a whole
upstream branch that is far behind `main` (`agent-prototype` was 222 commits behind): copy
only the changed files, or ask Jordan. Run the validator on the result before opening the
PR. If incoming files fail it (on 5 October 2026 three jobs used `source: usajobs` and a
`source_id` key, which the schema rejected until it was extended for both), stop and tell Jordan: a schema change is a separate code PR
(C1), raised with Jordan before it is started. Never describe what upstream holds without
having fetched it.

**Start a task.** Jordan names a roadmap task or describes a new one. Confirm the tree
is clean. `git switch main && git pull --ff-only`, then `git switch -c task/short-name`
(`content/short-name` for a content task).
Before changing anything, state the plan: files you expect to touch, how you will
check the result, what will need human eyes. For roadmap tasks 3 and 4, wait for
Jordan to approve the plan. Create your branch's log file (`agent/log/<YYMMDD>-<branch with / as ->.md`) with a `start` line.

**Reconcile.** Roadmap task 1. Read `agent/reconcile.md` and follow it. It is
read-only: it produces a report and changes no code.

**Verify.** Run `./scripts/verify.sh`. Every `FAIL` must be fixed. Every `WARN` must be
read and either fixed or explained in the PR description. Before a PR, run
`./scripts/verify.sh --build`. Then, for each route the change affects, with the built
site served on port 4000: fetch the page, confirm it returns 200, and confirm each
internal link in the changed markup points to a file that exists in `.output/public`.
This is the nearest you can get to clicking. Say in the PR that it is not the same.

**Compare rendered output.** For refactors (rule 9). Build `main` and copy
`.output/public` to `.agent/baseline/`. Build the branch. Diff the HTML of each
affected route, ignoring Vue's `data-v-*` scoped-style hashes. Explain every remaining
difference in the PR, or remove it. For the Tailwind migration the HTML will differ by
design, so this does not replace the visual baseline (roadmap task 3b).

**Review.** Before every commit that will go in a PR. Write the diff to a file:
`mkdir -p .agent && git diff main...HEAD > .agent/review.diff` (add uncommitted changes
with `git diff >> .agent/review.diff`). Delegate to the `reviewer` subagent with the
task description and that path. Put its findings in the PR description unchanged,
then say what you did about each. If you disagree with a finding, say so and leave
it for Jordan; do not drop it. Each finding you fix is a `defect` line in your
branch's log file with `caught: reviewer`.

**Finish a task.** Run Verify, then Review, then commit (rule 4). Fill in
`.github/pull_request_template.md` and show Jordan the description. When he says to
open the PR: `git push -u origin <branch>` and `gh pr create --repo
jordansread/CUAHSI3-website --base main --head <branch>` with that description, then
check the base with `gh pr view` (rule 4). Give him the PR link and say the deploy preview
will appear on the PR.
Update the Status column in `agent/roadmap.md` on the branch. Add a `pr` line to
your branch's log file.

**Visual review request.** Part of every PR touching layout, markup or links. List the
exact routes to open on the deploy preview, at phone width (390px) and desktop width
(1280px), and for each one what to look at and what to click, in plain language:
"Open /about/team. Every card should show the right person's photo. Click three cards;
each should open that person's profile." Jordan is not a developer. Make the list
short enough that he will actually do all of it.

**After review.** When Jordan reports the outcome of a PR, add lines to the log file of
the branch you are now working on (the finished branch's own file is already on the default
branch and does not change): `merged` or `abandoned`, plus one `defect` line for each problem found, with
where it was caught (`human-review`, `deploy-preview` or `production`). If he asks
for changes, each request is an `intervention` line.

**Quick log.** When Jordan types "log:" followed by a note, append it to your branch's log file
as an `intervention` or `note` line with today's date and the current branch. Keep his
wording. Do not discuss it.

**New footgun.** When something built cleanly and was wrong: add a numbered entry
under "Known footguns" with the symptom and the fix; add a check to `scripts/verify.sh`
if a pattern can detect it; add a `defect` line to your branch's log file. Do all three in
the PR that fixes it.

**Status.** When Jordan asks where things stand, answer from `agent/roadmap.md`, the
log and `git`, not from memory of the session. Give counts from `node scripts/eval-log.mjs --counts`:
tasks started, PRs merged, interventions, defects by where they were caught.

## Content procedures (Phase 2)

A content task follows Start a task, Verify, Review and Finish a task like any other, on a
`content/short-name` branch, with the content rules above and these procedures.

**Content repair.** For fixing existing files. State each file, line and change before
making it. Run `npm run validate:content` for a before count. Apply. Run the validator again
and the full build, and report both counts with denominators. In the PR, list every page
whose visible content changes and what changes on it, as a visual review list; list every
baseline image that changed and why.

**New content item.** Jordan or a staff member gives a draft: an event, a news item, a job,
an impact story. Run the duplicate check (C4). Choose the collection and say why (C7). Write
the file from the collection's schema, named by the pattern in C13. Fill only what the draft
supports (C3), and link the item's primary source (C14). Show Jordan the frontmatter and the "To verify" list before committing. Then
validator, build, PR. An event supplied directly by a staff member, with no newsletter,
leaves `newsletter_source` out (the field is optional in the schema since 5 October 2026);
say in the PR who supplied it and when (C2).

**Propose, then apply.** For any task that creates or changes more than five items from one
source (a newsletter issue, a job harvest, a batch of tags). First show a proposal and stop:
for each item, the collection, the slug, new or update, the judgment calls, and what is
unverified; then the items you would skip and why; then counts. Apply only what Jordan
approves. Do not go beyond the approved list.

**Add a Critical Zone product.** For a dataset, paper, software or model that someone suggests for
`content/critical-zone/products.json` (the public route is an email to help@cuahsi.org with the title, a DOI or
link, and the award or observatory; Jordan or a staff member passes it on). A `content/short-name` branch, with C1 to C16
and these steps:
1. Record who suggested it and when, in the PR (C2). Do not copy the sender's email address into the repo or the PR.
2. Duplicate check (C4): look in `products.json` for the same DOI (case does not matter), `hydroshare_id`, `url` and a similar
   title. The validator rejects a repeated DOI or a repeated HydroShare id, each compared only with its own kind; it does not
   compare `url` or title, so those you check yourself. Show Jordan each plausible match.
3. Open the link. For a DOI, `https://doi.org/api/handles/<doi>` must answer `responseCode` 1. A DOI that fails is not
   repaired by guessing (C3): look the title up in Crossref or DataCite, and if the right DOI is not clear, leave the item
   out and put it under "To verify".
4. In scope: it carries a CZO or CZNet award, comes from a CZ observatory or cluster, or is a dataset linked to a CZ paper
   (any repository counts, Jordan, 29 Oct 2026). Scope is Jordan's call: say why you think it is in, and let him decide.
5. Fill only what is known (C3): `type`, `doi` (bare, not a URL), `url`, `hydroshare_id` (32 lowercase hex characters, for a HydroShare
   resource; it is what the duplicate check relies on), `repository`, `awards`, `sites`, `era`, `year`. An `awards` id that is
   not in `content/awards/awards.json` fails the validator: leave `awards` out and say so in the PR, or first add the award to
   the registry on the same branch, checked at the funder's page (C15, C3).
   `source` is `suggested`; `source_url` is the page the facts were read from, not the email; `date_added` is today.
6. One item or a few by hand; more than five is "Propose, then apply". Validator, build, PR as for any content task.
This procedure is not yet on the section's pages (ticket T14's second item waits for the pages from T9).

**Unpublish.** Set `published: false`. Say in the PR which routes disappear and which pages
linked to them (rule 8: removing a route needs Jordan's approval first).

**Content lint.** On request: run the validator; list `published: false` items older than 60
days; events whose `end` has passed and are still `featured`; jobs past `deadline`;
cross-reference values that match nothing; items with no source (C2). Report with counts and
denominators. Do not fix silently.

**Review of a content branch.** The reviewer checks each changed file against C1 to C16 and
reports any path outside the allowed set in rule 3.

