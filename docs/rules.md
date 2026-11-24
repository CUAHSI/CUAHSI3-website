# Rules 1 to 13, in full

The full text of the repository rules, moved unchanged from `CLAUDE.md` on 14 November 2026 (org
issue 124). `AGENTS.md` carries a short form of each rule, which is always loaded; this file holds
the reasons and the enforcement details. The numbers and titles are the same in both places, and
"rule N" anywhere in the repository means the rule of that number here. Where this file says "this
file", read `AGENTS.md` and the files it names. "See the list below" in rule 6 is the list of
deliberate oddities, now in `AGENTS.md` (short) and `.claude/rules/site-code.md` (full). "Visual review
request" (rule 2) is in `docs/procedures.md`; "Known footguns" (rule 13) is in `.claude/rules/site-code.md`.
Since 17 November 2026 the rules name roles where they named Jordan, so that other staff can direct a
session: the requester and a website owner, defined at the top of `AGENTS.md`, which also says which
decisions stay with Jordan. Jordan is a website owner, and the requester whenever he directs the session.

## Rules

1. **The repository is authoritative.** `agent/content-model.md`, the roadmap and this
   file describe intent. They were written from memory, and files were lost in transit
   at least twice during the original build. When a document and the code disagree,
   the code is the fact. Report the disagreement; do not quietly follow either one.
2. **You cannot see what you render.** A passing build is not evidence that a page is
   correct. Every serious bug in this repo's history built cleanly and failed only on
   a screen or on a click: wrong photos on team cards, total mobile layout collapse,
   cards that did nothing when clicked, desktop grids locked at two columns. For any
   change touching layout, markup structure or links, do not write "verified,"
   "tested" or "works." Write what you checked, and list what a human must look at
   (see "Visual review request").
3. **One request, one PR.** (Jordan, 24 November 2026; it replaced "a branch changes content or code, never both", which
   turned one staff request into two PRs and, with the fork, two more: `agent/reports/261123_content_flow_cost.md`.) A PR
   carries the whole request: its content, the `public/` files that belong to it and the small code change it needs. A
   follow-up while the PR is open goes on the same branch. The diff decides the route, not the branch name: a PR that
   changes `content/`, and otherwise only `agent/` records and the `public/` files of a content item, takes the short route ("Content PR" in
   `docs/procedures.md`); any other change adds the reviewer, the log file and `npm run visual:compare`. `verify.sh` prints
   which one a branch is. A refactor, or code the request does not need, is not "the small code change it needs" (rules 5
   and 9). The content rules C1 to C16 apply to every change under `content/`.
4. **Git.** All work goes to `CUAHSI/CUAHSI3-website` ("the organisation"). Until 24 November 2026 it went to Jordan's fork
   and was copied over in packages and copied back; those procedures are gone. Work on a branch named `content/short-name`
   (it changes content) or `task/short-name` (it does not), cut from the organisation's up-to-date `main`: `origin/main` in a
   clone of the organisation, `upstream/main` in a clone of a staff member's fork (`node scripts/base-ref.mjs` prints it).
   Never commit on `main`. Commit only after `./scripts/verify.sh` passes. Stage files by name and read `git diff --staged`
   before committing; never `git add -A` or `git add .`. Never skip hooks. Never merge a PR, never force-push, never push to
   `main`. **Every PR targets `main`.** No stacked PRs.
   **When to push.** Jordan's standing yes of 24 November 2026: for a staff content request he has told you to take up, push
   its branch and open its PR without asking again, and push later commits to it. If the request needs code, the code waits for
   Jordan's yes before it is built; with that yes, the request's PR is covered as before. It does not cover a PR nobody
   requested, a code task of its own, anything rule 8 or an owner's decision holds, a comment on an issue, or a merge. Anything else is pushed only
   when the requester (AGENTS.md, top) says to in that conversation. Before opening a PR: `git fetch`, and
   `git merge-base --is-ancestor origin/main HEAD` must exit 0. Open it with the base named explicitly: `gh pr create --repo
   CUAHSI/CUAHSI3-website --base main --head <branch>`. `verify.sh` fails, in CI, any PR whose base is not `main`, and
   warns locally when the branch does not contain the organisation's `main`.
5. **No spin-offs.** Do what was asked and no more. A problem or an idea outside the request goes under "Noticed" in the PR
   description (a branch that changes code may also add it to "Noticed" in `agent/roadmap.md`), with what it would cost in
   full: PRs, files, and the owner's steps. Start it only on a website owner's yes. Before offering a follow-up, look for the
   smaller way: in November 2026 "show the time as a header" grew into a time box, a date fix, a list change and an 18-file
   content change, each offered alone. If a request grows past what was asked, stop and say the new total. A fault a visitor
   can see (a wrong date) is worth reporting at once; when to fix it is still the owner's call.
6. **Do not "fix" deliberate oddities.** See the list below. Tidying them breaks live
   URLs.
7. **Never guess what the repo contains.** Open the file. Do not describe a component,
   a config value or a fix as present because a document says so. If you did not check,
   say you did not check.
8. **Ask Jordan before these** (the website owner for code, `AGENTS.md`, top). Adding, removing or upgrading a dependency. Changing
   `nuxt.config.ts`, `tailwind.config.*`, `netlify.toml` or `package.json` scripts.
   Deleting a page or route. Changing any URL. Anything in `public/` that is linked
   from outside the site. State what you want to change and why, then wait.
9. **Refactors preserve behaviour.** Component extraction and the Tailwind migration
   must not change what a visitor sees. If a refactor changes rendered output on
   purpose, that is a second concern and a second PR.
10. **Logs are append-only.** (A content-only PR writes none of these: the PR is its record. Count those PRs with `gh pr list`.) The files in `agent/log/`, `agent/eval-log.md` and the Noticed list
    are never rewritten. If an entry is wrong, add a new dated entry that says what was wrong
    and points to it (a `correction` line in your own branch's log file). Each branch writes only
    its own file, `agent/log/<YYMMDD>-<branch>.md`. `verify.sh` fails if `agent/eval-log.md`
    changes at all (it is frozen), if a log file already on the base branch changes (`agent/log/README.md`,
    which describes the format and is not a log, may be edited but not removed), or if a line
    in `agent/log/` is not in the format in `agent/log/README.md`. Ten lines in two files already on
    `main` are the only exception in `agent/log/` (9 in `261008-task-jobs-agu-credit.md`, 1 in
    `261015-content-upstream-jobs-2026-10-13.md`): they were merged wrong and cannot be edited, so
    `scripts/eval-log.mjs --check` skips them by file, line and a hash of the text (`KNOWN` in that
    script). Never add to that list for a new mistake; fix it in your own branch's log file. A branch cut before 7 October 2026
    that appended to `agent/eval-log.md` moves those lines (`git diff origin/main -- agent/eval-log.md`)
    into its own log file, then restores the frozen file with `git checkout origin/main -- agent/eval-log.md`;
    in a merge conflict in that file, take the default branch's version and keep your lines in your own file.
11. **Log every intervention.** Whenever the requester or a website owner corrects you, redirects you, rejects
    an approach, or has to decide something you should have been able to decide, add
    an `intervention` line to your branch's log file in that session (on a content-only PR: a line under "Corrections" in
    its description). Do not wait to be asked.
12. **Report counts with denominators and show your sample.** "31 of 44 grids
    migrated," not "most grids migrated." Before reporting any bulk result, open three
    affected files and three unaffected ones and confirm by reading them. Say which
    six.
13. **A new footgun goes in this file.** If something built cleanly and was wrong,
    it belongs under "Known footguns," and if it can be detected by a pattern, in
    `scripts/verify.sh` too.
