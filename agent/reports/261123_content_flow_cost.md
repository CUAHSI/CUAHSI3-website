# What small staff content changes cost, 19 to 23 November 2026

Asked for by Jordan Read on 23 November 2026, who called the flow "really quite clunky" and the number of PRs for trivial
content changes not sustainable. He had said so on 19 and 20 November too. Counted from GitHub, the logs and the session record.

## What came in

Five content requests, all opened 18 to 20 November on CUAHSI/CUAHSI3-website: #149 (Abner Bogan's profile), #151 (a webinar),
#152 (a new event), #154 (Julia Masterman's profile), #157 (an event update). Also Callie Porter-Borden's feedback on
CUAHSI/CUAHSI3-website#156. Abner Bogan put his own effort at about 15 minutes.

## What it produced

| | Count |
|---|---|
| Merged PRs, jordansread/CUAHSI3-website#265 to #281 | 17 of 17 |
| Merged PRs, CUAHSI/CUAHSI3-website#150, #153, #159, #160, #161 | 5 |
| **Total PRs** | **22** |
| Commits in them | 55 (44 + 11) |
| Content lines changed by the 7 PRs that carry the requests (added + removed) | 105 |
| Lines changed under `agent/` in the 17 fork PRs | 138 |
| Baseline image changes | 36 (24 fork, 12 organisation) |
| PR description text, 17 fork PRs | about 83,000 characters |
| Jordan's typed messages in the session | 62, of which 14 only report a merge and 14 tell the agent to push |

Not counted: the jobs agent's CUAHSI/CUAHSI3-website#155 and #158, Callie's open #156, PRs before #265.

| What the 22 were | PRs | Count |
|---|---|---|
| The requests themselves | fork 265, 266, 267, 269, 270, 275, 279 | 7 |
| Visitor-facing code that followed (event pictures, wrong event day, time box) | fork 268, 277, 278 | 3 |
| Copying to the organisation | org 150, 153, 159, 160 | 4 |
| Copying back | fork 280 | 1 |
| A duplicate job that came from two sources | org 161 | 1 |
| Screenshot retakes only | fork 271, 276, 281 | 3 |
| Process and setup documents (Callie's feedback) | fork 272, 273, 274 | 3 |

Not all of the 22 come from the requests: the jobs agent's runs are part of the cause of 4 (fork 271, 280 and 281, org 161), and
3 (fork 272, 273, 274) come from Callie's feedback. They are counted because the flow produced them.

So 10 of 22 changed something for a visitor for the first time; one more (org 161) removed a duplicate; 11 of 22 were
copying, screenshots or process. The webinar (#151) alone took fork 267, 268, 269, 270 and 278.

Still queued when this was written, to move one sentence in 11 event descriptions: a code PR, a content PR, two organisation
packages and a back-sync. Total would be 27.

Time to the public site: the webinar update merged on the fork on 19 November 17:58 UTC and reached the organisation on
23 November 12:04 (a weekend between). The organisation content branch was pushed on 20 November and no PR was opened from it.

What the checks found in the period: 17 defect lines `caught: reviewer` (19 to 23 November). By the agent's reading, 10 are
about the paperwork itself (log wording, PR description, counts), 3 about process documents, 4 about the site. One test
found a real hydration failure (28 checks). The wrong event day was found by the agent while building something else.
In the log since October the agent found two faults on a page that the screenshot comparison showed, both on 8 October: a broken
/community/jobs (`task/upstream-code-sync`) and event tags in the wrong colour (`task/events-hydration-date`). Most other mentions
are about keeping the images.

## Why

1. **Two repositories.** Work is done on the fork, the site is published from the organisation. A fork PR has no deploy
   preview, so an owner merges it on its description, then the same change is reviewed again as a package, then copied back.
2. **Code and content may not share a PR, and one concern per PR.** A change that needs both is two PRs, then two packages,
   in order.
3. **Screenshots are stored in git and depend on live content.** Every content change makes them wrong.
4. **One weight for every change.** `cost: free` (two lines of diff) took the same log, reviewer, template and approvals as a
   refactor.
5. **The same fact in several places.** A bio in two files, a time in a sentence and a field, a job from two feeds.
6. **Every step waits for Jordan by message.** Say push, open the organisation PR, merge, report the merge.
7. **Each problem adds a rule.** The instruction files an agent may need (AGENTS, CLAUDE, the two rule files, docs/, visual/README,
   the log README) are about 14,700 words.
8. **The agent widened small requests.** "Show the time as a header" became a Time box, a date fix, a list change, an 18-file
   content change and their packages. Each was offered one at a time, without the total cost. `timezone: ET` was an option.
   The agent also answered the 19 and 20 November complaints with partial fixes.

## What was decided (24 November 2026)

Jordan: "yes to all six, and park the event-time work". The six: work on the organisation and retire the fork; one request, one PR;
delete the stored screenshots; a short route for content; a standing yes to push and open PRs for staff requests; no spin-offs.
Built on `task/one-flow`. By the agent's estimate the same work would have been about 8 PRs; that is not measured. To check it,
count the merged PRs, commits and Jordan's messages for the next five staff requests and compare them with the table above.
