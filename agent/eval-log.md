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
261003 | task/reconcile | intervention | Agent had started narrowing verify.sh check 2 on task/fix-verify (keep only content: apostrophes). Jordan redirected: delete the check and reword footgun 3 to say the claim came from the previous agent, was not reproduced, and 231 such lines build cleanly. Agent discarded its uncommitted narrowing. He also asked for the content-model comparison and the rule 12 sample to be added to the reconcile report, and the reviewer run on it.
261003 | task/reconcile | note | Jordan authorised a second one-time exception to rule 4 (commit with verify.sh failing): both FAILs pre-exist on main and this branch changes no code. FAILs: (1) apostrophe check, 231 lines in 21 files, false positive; (2) inline grid-template-columns at pages/community/news/index.vue:67. To be noted in the commit message and PR description.
261003 | task/reconcile | defect | caught: self-check first report drafted counts from memory: queryContent 36 calls in 20 files (measured 33 in 19), files with inline styles 32/30 (measured 31 of 33), rgrid files 16 (measured 20). Corrected in the report before the commit.
261003 | task/reconcile | defect | caught: self-check the 994 inline-style total mixed 953 static style= with 41 bound :style=; the v-for/img scan window of 6 lines missed the team cards. Both corrected in the report; the scan was not re-run.
261003 | task/reconcile | defect | caught: reviewer report lacked the per-file inline-style/rgrid table, the file-to-route listing and the per-call queryContent listing that agent/reconcile.md asks for. Added as Appendix A, B, C.
261003 | task/reconcile | defect | caught: reviewer build and verify.sh findings were quoted from a log not in the repo; AppHeader hamburger line given as "about line 70" (is 67). Added log excerpts as Appendix D; line fixed. Footgun 4 stated as not cleared repo-wide in the Summary.

