# Evaluation log, one file per branch

From 7 October 2026 the evaluation log lives here. `agent/eval-log.md` (558 lines on 7 October 2026: a
header and 530 log lines, 3 to 7 October 2026) is frozen history; read it with `node scripts/eval-log.mjs`, which
prints it and these files together.

Why: every PR used to append to the end of one shared file, so each merge made every other open
PR conflict in that file (on 7 October 2026 all six open PRs conflicted in this file after the merge of PR 84, and in no other file). A file per
branch cannot conflict.

## Where to write

One file per branch: `agent/log/<YYMMDD>-<branch>.md`, where `<YYMMDD>` is the date of the branch's
first line and `<branch>` is the branch name with `/` written as `-`, in lower case as branch names are here
(`task/fix-transcript-timestamps` on 7 October 2026 is `261007-task-fix-transcript-timestamps.md`).
The branch field inside the lines is the real branch name; `--check` does not compare it with the file name.
If that name is already taken on the default branch, add `-2`. Write only to your own branch's
file. A log file that is already on the default branch never changes (`verify.sh` fails if it does;
this README is not a log file and changes when the format does);
to correct an old line, write a `correction` line in your own file that points to it.

## Format

Plain lines, no front matter, no headings: `YYMMDD | branch | event | detail`. Events:

- `start`: task begun. Detail: begins `by: <full name>;` (a semicolon, since a name can hold a period), the
  requester who directed the session (`AGENTS.md`, top), as they give it, the same way every time; then the roadmap
  number and one-line description. `--check` requires it on start lines dated from 261118 (the roles were added
  on 17 November 2026); `--counts` counts starts by requester.
- `intervention`: the requester or a website owner corrected, redirected, rejected an approach, or made a
  decision the agent should have been able to make. Detail: what, in their words where possible.
- `defect`: something was wrong. Detail must contain `caught: self-check`, `caught: reviewer`,
  `caught: test`, `caught: typecheck`, `caught: human-review`, `caught: deploy-preview` or `caught: production`
  (at the end is usual) (the check enforces these seven in this folder; the frozen file also has a few `me`, `self` and
  `verify`), then what it was. `test` is a failing automated test of behaviour (for example the smoke test
  planned in CUAHSI/CUAHSI3-website#121); `typecheck` is the type check. Both were added on 14 November 2026 (epic CUAHSI/CUAHSI3-website#117);
  a check that `verify.sh` already ran before then (links, validator, backticks) is still `self-check`.
- `pr`: PR opened. Detail: PR number, files changed, and the reviewer's minutes when they are reported.
- `merged` / `abandoned`: outcome. Detail: PR number; for abandoned, why.
- `note`: anything else worth having later.
- `correction`: points to an earlier line by date and branch, and says what is right.
- `event`: something that is not a task of a branch (rare).

## If your branch was cut before this change

A branch that appended lines to `agent/eval-log.md` before 7 October 2026 and then merges the default
branch in will fail `verify.sh` ("agent/eval-log.md changed"). Move your lines
(`git diff origin/main -- agent/eval-log.md`) into your own file here, then restore the frozen file:
`git checkout origin/main -- agent/eval-log.md`. In a merge conflict in that file, take the default
branch's version and keep your lines in your own file.

## Reading and counting

```bash
node scripts/eval-log.mjs --tail 10    # the last ten lines
node scripts/eval-log.mjs --counts     # lines by event, defects by where caught, starts by requester
node scripts/eval-log.mjs --branch task/reconcile
node scripts/eval-log.mjs --check      # the format check verify.sh runs
```

The merged view lists the frozen file first, in its own order, then these files by file name
(that is, by first date) and by line within each. It does not re-sort by date.

A line that a website owner's review reports after the branch has merged (for example a defect found
on the deploy preview) goes in the file of the next branch you work on, or in a new file named
for the branch it concerns with a `-2` suffix.
