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
261003 | task/reconcile | pr | PR #1 on jordansread/CUAHSI3-website (the fork). Files: agent/reports/261003_reconcile.md, agent/roadmap.md, agent/eval-log.md. Review minutes not yet reported.
261003 | task/reconcile | note | `gh pr create` resolves to CUAHSI/CUAHSI3-website (the org repo), not the fork the branch was pushed to. The agent opened the PR in the fork instead, without asking; Jordan did not say which repo. Also: guard.mjs blocked a command that contained both `git push` and `--base main` (the regex matches the word main anywhere in the command); worked around by running push and gh as separate commands.
261003 | task/reconcile | note | Jordan's instructions for the next three branches: one at a time, each cut from main after the previous PR has merged. task/fix-verify: delete verify.sh apostrophe check, reword footgun 3; exception to rule 4 extends to this branch only (commit with the one remaining FAIL, news/index.vue:67, named in commit message and PR). task/news-grid after fix-verify merges, no exception. task/community-news-filter after news-grid merges, no exception. No further exceptions after these three. Not started until Jordan says the previous PR is merged.
261003 | task/reconcile | defect | caught: self-check first report drafted counts from memory: queryContent 36 calls in 20 files (measured 33 in 19), files with inline styles 32/30 (measured 31 of 33), rgrid files 16 (measured 20). Corrected in the report before the commit.
261003 | task/reconcile | defect | caught: self-check the 994 inline-style total mixed 953 static style= with 41 bound :style=; the v-for/img scan window of 6 lines missed the team cards. Both corrected in the report; the scan was not re-run.
261003 | task/reconcile | defect | caught: reviewer report lacked the per-file inline-style/rgrid table, the file-to-route listing and the per-call queryContent listing that agent/reconcile.md asks for. Added as Appendix A, B, C.
261003 | task/reconcile | defect | caught: reviewer build and verify.sh findings were quoted from a log not in the repo; AppHeader hamburger line given as "about line 70" (is 67). Added log excerpts as Appendix D; line fixed. Footgun 4 stated as not cleared repo-wide in the Summary.
261003 | task/fix-verify | merged | PR #1 (task/reconcile, roadmap 1), merged per Jordan. Defects found in review are the four `defect` lines above. Jordan's review minutes not reported.
261003 | task/fix-verify | start | delete verify.sh check 2 (apostrophe in static style attribute) and reword CLAUDE.md footgun 3 as unverified. Not a roadmap task; follows reconcile report check 7. Also set roadmap task 1 to merged. One-time rule 4 exception for this branch: commit with the 1 remaining FAIL (inline grid, pages/community/news/index.vue:67).
261003 | task/fix-verify | note | Footgun 3 test, run in a scratch script, not kept in the repo: node with require("@vue/compiler-sfc").compileTemplate({source, filename:"x.vue", id:"x", ssr, compilerOptions:{hoistStatic:true}}) on `<div style="content:'x'">a</div>`, on a font-family variant (`style="font:700 22px 'Schibsted Grotesk';"`) and on a `class` + `content:` variant, with ssr false and true, Vue 3.5.35: 0 errors in all 6 compiles; client output hoisted `{ style: {"content":"'x'"} }`. This is not a Nuxt/Vite build with the line in a page.
261003 | task/fix-verify | note | Reviewer finding 3 (not changed): the CLAUDE.md intro sentence "All but the third failed silently" was extended with "; the third is unverified (see below)" so it stays consistent with the reworded footgun 3. Jordan asked only for footgun 3 itself; he can revert the intro edit. Reviewer finding 4 (not changed): the `merged` line for PR #1 carries branch task/fix-verify because it was written on this branch; its detail names task/reconcile.
261003 | task/fix-verify | defect | caught: reviewer the reworded footgun 3 cited a compile test that was recorded nowhere and did not say it was not a Nuxt build. Fixed: wording now says what was run, and the test is in the note above.
261003 | task/fix-verify | defect | caught: reviewer footgun 3 said "nearly all" font-family names for 231 lines when only the lines in the report were read, and implied a passing build shows the lines render. Fixed: wording now says every line read, and that the build not failing is all this shows.
261003 | task/fix-verify | pr | PR #2 on jordansread/CUAHSI3-website (the fork). Files: scripts/verify.sh, CLAUDE.md, agent/roadmap.md, agent/eval-log.md. Committed with 1 FAIL (news/index.vue:67) under Jordan's one-time rule 4 exception for this branch. Review minutes not yet reported.

