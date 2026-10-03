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

