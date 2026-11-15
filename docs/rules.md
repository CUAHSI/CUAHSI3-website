# Rules 1 to 13, in full

The full text of the repository rules, moved unchanged from `CLAUDE.md` on 14 November 2026 (org
issue 124). `AGENTS.md` carries a short form of each rule, which is always loaded; this file holds
the reasons and the enforcement details. The numbers and titles are the same in both places, and
"rule N" anywhere in the repository means the rule of that number here. Where this file says "this
file", read `AGENTS.md` and the files it names. "See the list below" in rule 6 is the list of
deliberate oddities, now in `AGENTS.md` (short) and `.claude/rules/site-code.md` (full). "Visual review
request" (rule 2) is in `docs/procedures.md`; "Known footguns" (rule 13) is in `.claude/rules/site-code.md`.

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
3. **A branch changes content or code, never both.** Content work goes on a branch
   named `content/short-name` and changes only `content/**`, plus: `agent/` (logs, reports,
   roadmap); `public/` files that belong to a content item the PR names; `visual/baseline/`
   images (the PR lists which images changed and why).
   Code work stays on `task/short-name` and does not touch `content/**`. What kind of branch
   it is comes from what the diff changes, not from its name, so the check also works in CI
   (where the checkout has no branch name); locally `verify.sh` also fails when the name and
   the diff disagree. `verify.sh` fails a branch that mixes the two (locally, if `node_modules/yaml` is missing
   this check is a warning, not a failure; in CI it fails). A branch that changes only
   `public/` or `visual/baseline/` counts as a code branch. The reason is the same
   as in Phase 1: when something breaks, the kind of branch that merged tells you where to
   look. Changes to `agent/`, the eval log and the roadmap are allowed on either. The
   content rules C1 to C16 apply to every change under `content/`. A code change that a
   content change needs is a second PR.
4. **Git.** Work on a branch named `task/short-name` (code) or `content/short-name`
   (content, rule 3), cut from an up-to-date `main`.
   Never commit on `main`. Commit on the task branch only after `./scripts/verify.sh`
   passes. Stage files by name and read `git diff --staged` before committing; never
   `git add -A` or `git add .`. Never skip hooks. Push the branch and open the PR only
   when Jordan says to in that conversation. Never merge a PR, never force-push, never
   push to `main`. **Every PR targets `main`.** No stacked PRs: if a task needs a change
   that has not merged yet, wait for it to merge, or put both in one branch. Before
   opening a PR: `git fetch origin`, and `git merge-base --is-ancestor origin/main HEAD`
   must exit 0 (the branch contains the current `main`). Open it with the base named
   explicitly: `gh pr create --repo jordansread/CUAHSI3-website --base main --head
   <branch>`. After opening, `gh pr view <number> --repo jordansread/CUAHSI3-website
   --json baseRefName` must say `main`. `verify.sh` fails, in CI, any PR whose base is not
   `main`, and warns locally when the branch does not contain `origin/main`.
5. **One task per branch, one concern per PR.** No drive-by fixes. If you notice a
   problem outside the task, add a line to "Noticed" in `agent/roadmap.md` and leave it.
6. **Do not "fix" deliberate oddities.** See the list below. Tidying them breaks live
   URLs.
7. **Never guess what the repo contains.** Open the file. Do not describe a component,
   a config value or a fix as present because a document says so. If you did not check,
   say you did not check.
8. **Ask before these.** Adding, removing or upgrading a dependency. Changing
   `nuxt.config.ts`, `tailwind.config.*`, `netlify.toml` or `package.json` scripts.
   Deleting a page or route. Changing any URL. Anything in `public/` that is linked
   from outside the site. State what you want to change and why, then wait.
9. **Refactors preserve behaviour.** Component extraction and the Tailwind migration
   must not change what a visitor sees. If a refactor changes rendered output on
   purpose, that is a second concern and a second PR.
10. **Logs are append-only.** The files in `agent/log/`, `agent/eval-log.md` and the Noticed list
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
11. **Log every intervention.** Whenever Jordan corrects you, redirects you, rejects
    an approach, or has to decide something you should have been able to decide, add
    an `intervention` line to your branch's log file in that session. Do not wait to be asked.
12. **Report counts with denominators and show your sample.** "31 of 44 grids
    migrated," not "most grids migrated." Before reporting any bulk result, open three
    affected files and three unaffected ones and confirm by reading them. Say which
    six.
13. **A new footgun goes in this file.** If something built cleanly and was wrong,
    it belongs under "Known footguns," and if it can be detected by a pattern, in
    `scripts/verify.sh` too.
