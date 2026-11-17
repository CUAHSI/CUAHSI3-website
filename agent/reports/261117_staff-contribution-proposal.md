# Proposal: how CUAHSI staff contribute to the website

17 November 2026. For Jordan's decision before any work starts.

## The goal

Any staff member can change the website safely, at their own level of technical skill. Each person
should get the right help:

- **Small changes:** update your own professional page, or add an event, a news item or an impact story.
  An agent does the file work; the staff member supplies the facts and checks the result.
- **Larger changes:** a new page, a new section, or anything involving code. The person proposes the
  change first and builds it only after it is agreed.

## What exists today

The pieces that keep an agent's changes safe are already built:

- **Content checks.** The schemas and validator check every content file. Content rules C1 to C16 cover
  sources, never inventing facts, duplicates, file names and personal data.
- **Written procedures.** "New content item", "Content repair", "Add a Critical Zone product" and
  "Propose, then apply" are in `docs/procedures.md`.
- **Review and enforcement.** The reviewer subagent reads every change. CI runs `verify.sh` on every PR,
  and a hook blocks unsafe git commands.

These are all written for one person: an agent working for Jordan.

| Gap | Why it matters for staff |
|---|---|
| The procedures say "show Jordan", "Jordan approves", "push only when Jordan says to" | An agent working for someone else would either stop and wait for Jordan, or treat the staff member as Jordan. Neither is right. |
| Nothing is written for a non-developer | `README.md` assumes `git clone` and `npm`. Its "Adding content" quick reference is out of date: it gives `YYYY-MM.md` for newsletter issues, and the files are named by send date. |
| Procedures are prose, not commands | A staff member must know to ask for "the New content item procedure". |
| Staff vocabulary differs from the site's | Staff say "highlight"; the site calls it an impact story (`content/research/`, shown at `/about/impact/`). A profile lives in two places that do not agree: `full-team.json` (22 people, 6 with `has_profile: true`) and 9 page files in `content/team/`. Two people with `has_profile: true` have no page file; five page files belong to people with `has_profile: false`. |
| Fork PRs get no deploy preview | Previews are built only for pull requests to the organisation repo. On the fork, a staff member cannot see their change before it merges. |
| One reviewer | Jordan reviews and merges every PR. With staff contributing, he becomes the bottleneck. |

## Proposed design: three levels

### Level 1: "Ask" (no GitHub, no install)

For anyone with Claude (claude.ai). The staff member uses a ready-made prompt for their item type (event,
news, impact story, profile update). Their Claude interviews them and produces a filled-in request: the
facts, the source link, any photo, and what is still unconfirmed. They send it to a website owner by email
or a GitHub issue form; an agent at Level 2 turns it into a PR.

- *Effort for staff:* minutes.
- *What it needs:* one guide page with the prompts, and an intake route (decision 3).

### Level 2: "Do it with an agent" (Claude Code, GitHub account)

For staff willing to install the Claude desktop app and get a GitHub account with access. They open the
repository in Claude Code and type a command such as `/new-event`, `/new-news`, `/new-impact-story` or
`/update-profile`. The command:

1. Runs the existing procedure: duplicate check, the right collection, the schema, C1 to C16.
2. Asks the staff member for each fact, and never guesses (C3).
3. Shows them the result in plain language and runs the validator and the build.
4. Opens a content PR with the "To verify" list once the staff member says so.

A website owner reviews and merges. The staff member never reads Vue or YAML unless they want to.

- *What it needs:* project skills in `.claude/skills/`, one per item type, each wrapping the existing
  procedure. The rules must also be changed to name the person directing the session rather than Jordan
  (see "Changes to the rules").

### Level 3: "Propose a larger change" (code, new pages, structure)

For changes to layout, navigation, components, new sections or URLs. The rule is **proposal first,
build second**:

1. **Open a proposal issue.** A short GitHub issue: what, why, which pages, who asked, and what
   "done" looks like. An agent can draft it with `/propose-change`.
2. **Agreement.** A website owner agrees, narrows or declines it. Rule 8 items (dependencies, config,
   URLs, deleting pages) always need this.
3. **Build.** On a `task/` branch, following the existing procedures (Start a task, Verify, Review,
   Visual review request).
4. **Preview and merge.** The PR is reviewed on a deploy preview.

The developer-level documentation already exists (AGENTS.md, `docs/`, `.claude/rules/site-code.md`).
Level 3 adds a single entry page that explains this path and points into them.

## What gets written

| Item | Audience | Where |
|---|---|---|
| `CONTRIBUTING.md`: a one-page "which level are you?" with links | everyone | repo root (GitHub shows it on every new PR and issue) |
| `docs/contribute/ask.md`: Level 1 prompts, one per item type, plus what makes a good source | Level 1 | repo, and optionally an internal staff page |
| `docs/contribute/with-an-agent.md`: install, access, first run, what to expect, how review works | Level 2 | repo |
| `docs/contribute/item-types.md`: each content type in plain words (what it is, where it shows, required facts, an example) | Levels 1 and 2 | repo |
| `docs/contribute/larger-changes.md`: the proposal path | Level 3 | repo |
| Skills `/new-event`, `/new-news`, `/new-impact-story`, `/update-profile`, `/propose-change` | the agent | `.claude/skills/` |
| GitHub issue forms: "Content request" and "Change proposal" (if decision 3 is "issue forms") | Levels 1 and 3 | `.github/ISSUE_TEMPLATE/` |

**Starting set of item types:** profile, event, news, impact story. Jobs already have their own agent,
and Critical Zone products their own procedure. Cyberseminars, newsletter issues and awards stay with
the website owners for now.

## Changes to the rules (Jordan's to approve; these files steer every agent session)

- **AGENTS.md and `docs/procedures.md`:** "Jordan" becomes "the person directing the session" for
  directing, approving content and saying when to push. Merging and approving rule 8 items stay with
  the website owners. Rule 11 (log interventions) applies to any person.
- **Logs:** a staff session still writes `agent/log/<YYMMDD>-<branch>.md`. The log gains a `by:` line
  naming who directed the session, so the experiment's record covers staff sessions too.
- **`.claude/settings.json` and the hook:** no change. Staff sessions get the same guard as yours.
  You decide whether that is enough.

## Decisions for you

1. **Which repo do staff contribute to?**
   - **(a) The organisation repo.** Staff get deploy previews, and most likely contributors already have
     access (for example Castronova, lindsayplatt, devincowan). But the agent's own work happens on the
     fork, so packages would have to flow both ways all the time (after package 5 the two mains differ in
     two log files only).
   - **(b) Your fork.** One source of truth, but staff get no previews, and each person needs
     collaborator access to the fork.
   - **(c) Move the active work to the organisation repo first.** Make it the single repo, then open it
     to staff.

   *Recommendation:* **(c)**, as its own task before Level 2 opens. Until then, run Level 1 only, which
   needs no repo access.

2. **Who reviews and merges content PRs?**
   *Recommendation:* name one or two content owners besides you (for example communications staff).
   Code PRs stay with you.

3. **The Level 1 intake route: email to help@cuahsi.org, GitHub issue forms, or both?**
   *Recommendation:* issue forms, plus email for people without GitHub. Issue forms keep requests
   visible and linkable.

4. **Profiles.** Can each staff member edit only their own profile, and does turning on a full profile
   page (`has_profile: true`) stay a website-owner decision?
   *Recommendation:* yes to both.

5. **Where the staff-facing guide lives.** Only in the repo, or also as an internal page or Google Doc
   that links to it?
   *Recommendation:* the repo is the source; one internal page points to it.

## Proposed order of work (each a separate PR, all code or docs, no content)

1. Rules and procedures generalised from "Jordan" to "the person directing", with the `by:` log line.
2. `CONTRIBUTING.md` and `docs/contribute/item-types.md`; the stale "Adding content" quick reference in
   `README.md` either fixed or pointed at the new page.
3. Level 1 guide and prompts, plus the issue forms if chosen. Trial with one staff member on one real
   event.
4. Level 2 skills, starting with `/new-event` and `/update-profile`. Trial with one staff member each.
5. Level 3 guide and `/propose-change`.
6. Afterwards: a short report on the trials (time taken, interventions, defects), in `agent/reports/`.

The repo decision (1) gates step 4. Steps 1 to 3 can start before it is settled.

## Risks

- **Rule files and the 200-line budget.** AGENTS.md plus CLAUDE.md are capped at 200 lines. Staff
  material must live in `docs/contribute/`, not in AGENTS.md.
- **An agent working for a staff member is as good as its procedure.** Where a procedure says "ask
  Jordan", the staff session must route the question to a website owner, not answer it itself.
- **Personal data.** Staff updating profiles may paste contact details. C11 and the schemas already
  limit this; the skills will say what never goes in.
- **The review load moves rather than disappears** unless decision 2 names more reviewers.
