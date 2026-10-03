# Evaluation log

Append-only. One line per event, newest at the bottom. Never edit or delete a line;
if one is wrong, add a `correction` line that says what was wrong. This log is the
evidence for whether agentic maintenance of this site works, so it records failures
as carefully as successes.

Format: `YYMMDD | branch | event | detail`

Events:
- `start`: task begun. Detail: roadmap number and one-line description.
- `intervention`: Jordan corrected, redirected, rejected an approach, or made a
  decision the agent should have been able to make. Detail: what, in his words where
  possible.
- `defect`: something was wrong. Detail must begin `caught: self-check`,
  `caught: reviewer`, `caught: human-review`, `caught: deploy-preview` or
  `caught: production`, then what it was.
- `pr`: PR opened. Detail: PR number, files changed, and Jordan's review minutes
  when he reports them.
- `merged` / `abandoned`: outcome. Detail: PR number; for abandoned, why.
- `note`: anything else worth having later.
- `correction`: points to an earlier line by date and branch, and says what is right.

Counting: `grep -c '| intervention |' agent/eval-log.md`, and likewise for
`caught: production` and the rest.

---
261003 | task/reconcile | start | roadmap 1: reconcile repo against the verify-first list (read-only; report at agent/reports/261003_reconcile.md)
261003 | task/reconcile | intervention | Jordan asked for a blank line in content/news (blocked, rule 3), then said "open Phase 2", then "Stop. We are not opening Phase 2... I only want to see the guard fire." The agent had proposed a Phase 2 opening plan before he clarified he was testing the guard. Guard results: Edit on content/ refused by the settings.json deny rule (not guard.mjs); a git add -A test was blocked by guard.mjs.
261003 | task/reconcile | intervention | Jordan granted a one-time exception to "commit only after verify.sh passes" (rule 4): "Commit the report now, with a one-time exception, and fix verify.sh as its own task." verify.sh had 2 FAIL (apostrophe check false positive; inline grid at community/news/index.vue:67), both pre-existing. Reviewer subagent not run before this commit; to be run before the PR.

