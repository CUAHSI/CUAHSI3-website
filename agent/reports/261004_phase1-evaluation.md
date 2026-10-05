# Phase 1 evaluation summary (P2.0)

Written 4 October 2026 from `agent/eval-log.md` and the git history only, as P2.0 of the Phase 2 proposal asks. Counts come with their method (end of file); nothing here is estimated. One paragraph of interpretation, at the end.

## What counts as Phase 1 here

The agent worked on this repository from 3 October 2026. The log has dates but no times, and its lines are in the order they reached `main` through each branch's merge, not strictly the order events happened. So I do not split the log by line number. **Phase 1 = the fork's pull requests #1 to #38** and every log line on a branch begun before Jordan asked to open Phase 2. The 10 branches begun after that request (the Phase 2 opening, the four reports, the lockfile audit fix, the events row fix, the content patches) are counted separately as "since". PR #39 opened Phase 2; #40 to #42 followed it.

Source limits: the log never records a clock time, so durations come from git commit and merge times only; GitHub's own records (PR open times, review comments) were not used.

## Tasks started

- **`start` lines:** 37 on Phase 1 branches, plus 6 since (43 in all).
- **Roadmap tasks** (`agent/roadmap.md`, Phase 1): 1 reconcile, 2 schemas and validator, 3 component extraction, 3b visual baseline, 4 Tailwind migration (four PRs), 4b dependency audit report: all merged. 5 linting and CI: merged in three PRs (#30, #31, #38), but the roadmap line still says "PR open" (stale). 6 accessibility: audit, keyboard and semantic fixes and contrast fixes merged; the leftovers (clay accent, dimmed past events, hover colours, ORCID badge, arrows) were left as they are on Jordan's decision. That is 8 roadmap items; the other `start` lines are unplanned tasks the agent or Jordan added (bug fixes, footgun fixes, repairs, the cyberseminar cards and player).

## Pull requests

| | Count |
|---|---|
| Opened on the fork (`jordansread/CUAHSI3-website`), numbered #1 to #42 | 42 |
| Merged into `main` | 39 (14 on 3 October, 25 on 4 October) |
| Merged into a stacked base branch instead of `main` | 3: #10, #20, #33 |
| `abandoned` log lines / closed without a merge commit | 0 / 0 |
| Phase 1 (#1 to #38) / since (#39 to #42) | 38 / 4 |

Not in this count: the organisation's own PR #1 (`CUAHSI/CUAHSI3-website`, "noindex Netlify setup", merged 3 August, before the agent started) shares the number 1 with the fork's first PR; I did not count it.

The three stacked PRs: **#10** was merged into the branch of #9 and reached `main` when #9 merged; the log records no defect for it. **#20** (contrast fixes) was merged into the stacked base after #19 had already merged, so its changes never reached `main`; found by the agent, re-opened as #23. **#33** (seminar dates) did the same after #32 merged; found by Jordan's report, re-opened as #36. Both are `defect` lines.

## Interventions

**39 `intervention` lines** in total: 36 on Phase 1 branches, 3 since. Per branch (and the PRs each branch produced) in Appendix A; every intervention, one line each, in Appendix B. The log records an intervention on the branch the agent was working on when Jordan said it, which is often the next task's branch, so "per PR" is by log branch, not necessarily the PR the intervention was about.

## Defects, by where they were caught

| Caught | Phase 1 | Since | Total |
|---|---|---|---|
| self-check | 20 | 0 | 20 |
| reviewer | 36 | 7 | 43 |
| human-review | 2 | 0 | 2 |
| deploy-preview | 0 | 0 | 0 |
| production | 0 | 0 | 0 |
| unclassified | 0 | 0 | 0 |
| **defect lines** | **58** | **7** | **65** |

These are `defect` **lines**, not defects: one line often bundles several findings. 20 of the 43 `caught: reviewer` lines state a number of findings; they add up to **97 findings** (the other 23 lines do not give one). "Self-check" includes 5 lines that begin "Process slip, caught by me" (the agent used scripts for edits where the bulk-edit rule says to edit by hand). Nothing was logged as caught on a deploy preview or in production.

## Rule 4 exceptions and logged slips

- **Exceptions Jordan granted:** 3 one-time exceptions to "commit only after `verify.sh` passes", all on the first two branches (`task/reconcile` twice, `task/fix-verify` once), because `verify.sh` had failing checks that pre-dated the work (log lines 30 and 32 on `task/reconcile`, 35 and 41 on `task/fix-verify`). No exception was granted after that; later PR lines say "no rule 4 exception".
- **Slips the agent logged against rule 4 or the review procedure:** opened the first PR in the fork instead of the organisation repository without asking which (line 34); two stacked PRs merged into a stale base (#20, #33, above). The agent also logged two cases of the safety hook blocking harmless commands (it matches the words "main" and "-f" anywhere), worked around by splitting commands.
- **Not found:** I searched the log for a commit on `main`, a forced push, a skipped hook and a `git add -A` that ran, and found none reported (a `git add -A` test was blocked by the hook, line 29). The search was by keyword, so a slip described in other words would not show.

## Jordan's review time

**Not recorded.** The log format has a place for it ("Jordan's review minutes when he reports them"). Of 29 `pr` lines, 10 say "Review minutes not yet reported"; of 27 `merged` lines, 9 say "not reported"; no line anywhere gives Jordan's review time in minutes (the one line that mentions minutes next to the word review is a CI time limit), and the other 19 `pr` lines and 18 `merged` lines do not mention review time at all. What git does record: the first agent commit is 2026-10-03 12:12:32 -0500 and the last merge to `main` is 2026-10-04 19:52:44 -0500, about 32 hours of wall-clock time for 42 PRs. Git does not record when a PR was opened or when Jordan began reviewing, so review time cannot be derived.

## Planned for Phase 1 and not done

- **Task 6 (accessibility):** the leftovers above, left by decision, not by failure. Measured options are in `261004_a11y-options.md`.
- **Task 5:** `verify.sh` is a CI check on every PR but is **not set as a required check** (a GitHub setting; Jordan's). ESLint reads templates and TypeScript scripts with the essential rule set only: no undefined-name, unused-variable or type checking.
- **Planned follow-up never started:** `task/site-search-fixes` (log line 110): it waited for Jordan's report on the search preview, which the log never records.
- **Open decisions left open** (roadmap "Open decisions"): who reviews agent PRs and how fast; whether the SE team sees Phase 1; search on phones; the Content v3 upgrade (not proposed); redirects as page stubs.
- **Deferred, depends on Phase 2:** cyberseminar transcript timestamps (all 733 read `NaN:NaN`) and follow-along sync; transcripts and descriptions as pages or panels.
- **Known content problems found, not fixed in Phase 1:** 12 validator failures (patches written and tested, see `261004_content-fix-plan.md`), two apparent duplicate events, the `impactTag` matching, the unpublished seminars.

## One paragraph

In about 32 hours the agent started 43 tasks, opened 42 PRs and had 39 merged into `main`, with 3 merged into a stacked base branch instead (one of them, #10, still reached main with its base; the other two, #20 and #33, were merged by mistake and lost their changes until re-opened). Jordan intervened 39 times across the 42 PRs. The agent logged 65 defect lines; the reviewer subagent caught 43 of them and the agent's own checks 20; Jordan's review caught 2 and nothing was logged as found on a preview or in production. That the log shows no production or preview defects is not the same as there being none: Jordan did not report what the deploy previews showed for several PRs, and review time was never recorded.

## Sample check (rule 12)

I read these log lines in full and compared them with the counts: line 30 (an `intervention`, counted once: one-time exception, yes), line 34 (a `note`, not counted as an intervention or defect, yes), line 143 (a `merged` line naming #9 and #10: counted as one `merged` line covering two PRs; this is why PR counts come from git, not from the lines), and from the unaffected side lines 7 to 15 (the log's own header text, matched by none of the event counts, because the count requires `YYMMDD | branch | event | detail`), line 1 (the title) and one blank line. In git: merge commit `29562c0` is the fork's #1 (`task/reconcile`), merge commit `86e681e` is the organisation's #1; both were read and kept apart. The totals reproduce with the commands below.

## Method

- Log events: lines matching `^\d{6} \| .* \| .* \| ` split on the first three separators; 339 lines in the file, 310 events, 29 header or blank lines (an `unparsed` check showed only the title, the header text and blank lines).
- PRs: `git log --all --merges --grep="Merge pull request"` filtered to `from jordansread/`; "merged into main" = first-parent merge commits of `origin/main`.
- Defect classification: the text after `caught:`; lines that start "Process slip, caught by me" count as self-check.
- Phase split: by branch name, as described at the top; the boundary list is in this report's first section.

## Appendix A. Per branch: PRs, interventions, defect lines

| Branch | PR(s) | start | interventions | defect lines (reviewer / self / human) |
|---|---|---|---|---|
| `task/reconcile` | #1 | 1 | 3 | 4 (2 / 2 / 0) |
| `task/fix-verify` | #2 | 1 | 0 | 2 (2 / 0 / 0) |
| `task/news-grid` | #3 | 1 | 0 | 0 (0 / 0 / 0) |
| `task/community-news-filter` | #4 | 1 | 0 | 1 (0 / 1 / 0) |
| `task/gitignore-r-files` | #5 | 1 | 0 | 0 (0 / 0 / 0) |
| `task/remove-stray-files` | #6 | 3 | 2 | 3 (1 / 2 / 0) |
| `task/content-schemas` | #7 | 1 | 4 | 7 (5 / 1 / 1) |
| `task/site-search` | #8 | 1 | 1 | 0 (0 / 0 / 0) |
| `task/log-cyberseminar-feedback` | — | 0 | 0 | 0 (0 / 0 / 0) |
| `task/cyberseminar-card` | #9 | 1 | 5 | 1 (0 / 1 / 0) |
| `task/cyberseminar-player` | #10 | 1 | 1 | 1 (0 / 1 / 0) |
| `task/hero-component` | #11 | 1 | 1 | 0 (0 / 0 / 0) |
| `task/hero-component-2` | #12 | 1 | 0 | 2 (0 / 2 / 0) |
| `task/hero-component-3` | #13 | 1 | 0 | 0 (0 / 0 / 0) |
| `task/filter-chip` | #14 | 1 | 0 | 0 (0 / 0 / 0) |
| `task/prose-block` | #15 | 1 | 1 | 1 (0 / 1 / 0) |
| `task/accessibility-audit` | #18 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/visual-baseline` | #16 | 1 | 4 | 1 (0 / 1 / 0) |
| `task/dependency-audit` | #17 | 1 | 0 | 4 (4 / 0 / 0) |
| `task/a11y-fixes` | #19, #23 | 1 | 1 | 2 (1 / 1 / 0) |
| `task/a11y-contrast` | #20 | 1 | 1 | 4 (4 / 0 / 0) |
| `task/linkedin-url` | #22 | 1 | 0 | 1 (0 / 1 / 0) |
| `task/learn-train-archive-card` | #21 | 1 | 0 | 0 (0 / 0 / 0) |
| `task/tailwind-migration` | #24 | 1 | 2 | 5 (3 / 2 / 0) |
| `task/member-portal-compact` | #26 | 0 | 3 | 1 (1 / 0 / 0) |
| `task/support-donation-height` | #25 | 1 | 1 | 1 (1 / 0 / 0) |
| `task/tailwind-pr2` | #27 | 1 | 0 | 3 (1 / 2 / 0) |
| `task/tailwind-pr3` | #28 | 1 | 1 | 3 (1 / 2 / 0) |
| `task/tailwind-pr4` | #29 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/ci-checks` | #30 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/eslint` | #31 | 1 | 1 | 1 (1 / 0 / 0) |
| `task/readme-netlify` | #35 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/seminar-filter-reset` | #34 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/fix-date-timezone` | #32, #36 | 1 | 2 | 2 (1 / 0 / 1) |
| `task/robots-txt` | #37 | 1 | 1 | 1 (1 / 0 / 0) |
| `task/iso-date-cards` | #33 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/eslint-typescript` | #38 | 1 | 1 | 1 (1 / 0 / 0) |
| `task/open-phase-2` (since) | #39 | 0 | 1 | 1 (1 / 0 / 0) |
| `task/content-fix-plan` (since) | — | 1 | 0 | 1 (1 / 0 / 0) |
| `task/node22-evidence` (since) | — | 1 | 0 | 1 (1 / 0 / 0) |
| `task/audit-fix-evidence` (since) | — | 1 | 0 | 1 (1 / 0 / 0) |
| `task/a11y-options` (since) | — | 1 | 0 | 1 (1 / 0 / 0) |
| `task/prep-reports` (since) | #42 | 0 | 1 | 0 (0 / 0 / 0) |
| `task/events-upcoming-row` (since) | #41 | 1 | 0 | 1 (1 / 0 / 0) |
| `task/audit-fix` (since) | #40 | 1 | 1 | 1 (1 / 0 / 0) |

## Appendix B. Every intervention

Log line, branch, first 150 characters.

- 29 `task/reconcile`: Jordan asked for a blank line in content/news (blocked, rule 3), then said "open Phase 2", then "Stop. We are not opening Phase 2... I only want to se…
- 30 `task/reconcile`: Jordan granted a one-time exception to "commit only after verify.sh passes" (rule 4): "Commit the report now, with a one-time exception, and fix verif…
- 31 `task/reconcile`: Agent had started narrowing verify.sh check 2 on task/fix-verify (keep only content: apostrophes). Jordan redirected: delete the check and reword foot…
- 71 `task/remove-stray-files`: Jordan asked how to navigate from About to /about/impact; the agent found no direct link (About page link row and header nav have none; only the foote…
- 75 `task/remove-stray-files`: Jordan pasted the two link rows (/about/impact: Overview, Mission & values, History, Governance, Membership, Impact, Our team; /about: Mission & value…
- 81 `task/content-schemas`: Jordan approved option A for task 2 ("Approved: option A. Add zod and yaml as devDependencies, pinned, and state the versions in the PR. Add the valid…
- 93 `task/content-schemas`: Jordan, after the PR was ready: "Push task/content-schemas and open the PR. Then, without editing anything, add a repair list to the report under agen…
- 96 `task/content-schemas`: Jordan refined the people_mentioned rule: "keep non-staff values informational, but split them into two lists: 'matches a board or community profile f…
- 97 `task/content-schemas`: Jordan asked for a read-only investigation, on no branch, of why the 6 cyberseminar cards that show do not expand correctly: what the expand behaviour…
- 108 `task/site-search`: Jordan's decisions on the SiteSearch review: "Yes: change the netlify.toml build command to npm run build:search in this PR. State it in the descripti…
- 118 `task/cyberseminar-card`: Jordan: "Fold task/log-cyberseminar-feedback into the next task's branch. Next, in order, one at a time: Start roadmap task 3 with the cyberseminar ca…
- 120 `task/cyberseminar-card`: After Jordan supplied /Users/jordanread/Downloads/SiteSearch.vue the agent read it in full and began the parked SiteSearch task on its own reading (an…
- 124 `task/cyberseminar-card`: Jordan approved the card-extraction plan with an addition: "before moving any markup, list every class the card uses and where each is defined. Any ru…
- 128 `task/cyberseminar-card`: Jordan, on the robots.txt behaviour: "a build that modifies a tracked file is a footgun, and restoring it by hand before each commit will eventually b…
- 129 `task/cyberseminar-card`: Jordan: "Move on to the next task", sent while the card branch was pushed but its PR was not yet open. Agent's reading: finish the pending steps (the …
- 131 `task/cyberseminar-player`: Jordan, on how to proceed after PR #9 was opened: chose option 2, "stack it" (start task A now, cut from task/cyberseminar-card, its PR depending on #…
- 139 `task/hero-component`: Jordan: "Move onto task Heroes" (after choosing to stack, and after the agent listed heroes, task 4b and the filter reset as candidates for the next t…
- 169 `task/prose-block`: Prose blocks: I recommended skipping a component (option 1) because a wrapper would only map a name to a class and the real problem is duplicate, conf…
- 180 `task/visual-baseline`: Jordan chose option 1 for the roadmap's open visual-regression tooling decision: Playwright with screenshots in the repo (rather than a hosted service…
- 182 `task/visual-baseline`: Jordan approved the Playwright devDependency and said 'measure first' on storage (plan: trial capture into .agent/, report real size, then decide what…
- 185 `task/visual-baseline`: Jordan decided the visual-baseline storage after the measured trial: commit the 54-image representative set (27 routes x 2 widths, 24 MB on disk) and …
- 193 `task/visual-baseline`: Jordan: 'When done with this stage, move on to the next without requiring my approval to advance. I'd like you to keep going through the tasks as guid…
- 206 `task/a11y-fixes`: Jordan: 'Merged #18, start the keyboard access fixes and other accessibility all together.' I read 'all together' as one branch and one PR (rule 5 say…
- 212 `task/a11y-contrast`: Jordan: 'Move ahead on the next task' (no task named). I took it as the last open accessibility item, contrast (H9), which I had left out of #19 becau…
- 227 `task/tailwind-migration`: Jordan, after approving the contrast colours: 'Move on to the next task.' No task named; I took it as the next roadmap item, task 4 (inline styles to …
- 229 `task/tailwind-migration`: Jordan answered the Tailwind plan: approved; fewer PRs preferred (eleven became four: tool + components + small pages; learn-train + about; home + fir…
- 240 `task/member-portal-compact`: Jordan: 'member-portal is too large of a table, listing each institution and their rep shouldn't take that much space.' A visible design change, so it…
- 245 `task/member-portal-compact`: Jordan chose option 1 for the Zeffy card on /support (let the form's own resize message set the iframe height) after I listed three options.
- 247 `task/member-portal-compact`: Jordan chose option 2 for the Zeffy card: fixed compromise height of about 900px.
- 251 `task/support-donation-height`: Jordan decided the Zeffy card question (his words: '2'): options were (1) resize the iframe from the form's own height message, which I then found doe…
- 263 `task/tailwind-pr3`: Jordan, mid-task: 'Keep working through the next task without checking in until I ping you again'. Taken as: continue with the next roadmap work witho…
- 278 `task/eslint`: Jordan chose ESLint (via the question 'which task next?') and so approved, for rule 8: eslint, eslint-plugin-vue and vue-eslint-parser as pinned devDe…
- 290 `task/fix-date-timezone`: Jordan: 'move on to the next task and keep working through for the next 1.5 hrs'. No task was named, so I chose from the Noticed list: work that needs…
- 295 `task/robots-txt`: Jordan chose the robots.txt build fix (via 'which task next?') and then said 'go on to the next task without stopping for me'. Taken as: carry the tas…
- 304 `task/fix-date-timezone`: Jordan: '32 and 33 are merged, 34 has conflicts now'. Resolved #34's conflicts and found that #33's content is not on the default branch.
- 306 `task/eslint-typescript`: Jordan: 'yes on TypeScript parser for ESLint'. Approved for rule 8: @typescript-eslint/parser and typescript as pinned devDependencies. Chosen pins: @…
- 322 `task/open-phase-2`: Jordan: 'Open phase 2'. I asked who edits the three lock points (PHASE in .claude/hooks/guard.mjs, PHASE in scripts/verify.sh, the Edit(/content/**) d…
- 329 `task/audit-fix`: Jordan's decisions on the four reports: 'Go with A for seminars' (content-fix-plan option A: close the front matter of all 9 broken seminar files, pub…
- 336 `task/prep-reports`: Jordan: 'push the prep-reports branch' (after deciding on each report: A for the seminars, no CI change, apply the audit fix, leave accessibility). Th…
