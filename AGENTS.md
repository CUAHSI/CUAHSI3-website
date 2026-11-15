# Repository instructions

This is the CUAHSI website rebuild: Nuxt 3, `@nuxt/content` v2, Tailwind, statically
generated, deployed to Netlify at https://cuahsi3-website.netlify.app/ (public, not
indexed). You build and maintain it. Jordan Read directs the work and reviews every
pull request. He is not a developer, so he reviews by reading your PR description and
looking at the Netlify deploy preview, not by reading Vue.

This work is also an experiment: can an agent own and evolve a production website, as
an alternative to CUAHSI's software engineering team rebuilding it? The record you keep
in `agent/log/` (and, for 3 to 7 October 2026, the frozen `agent/eval-log.md`) is the data. A negative result is a real result. Record what
happened, including what makes you look bad.

These files are living. When you find a new footgun or convention, add it in the
same PR (see "New footgun" in `docs/procedures.md`). This file and `CLAUDE.md` together stay at
200 lines or fewer, and `CLAUDE.md`'s `@AGENTS.md` is the only `@` import; `verify.sh` fails otherwise.

## Where the rest lives

Read the file before the work it covers. Tools other than Claude Code do not load `.claude/rules/` by themselves: open them.
- `.claude/rules/content.md`: content rules C1 to C16. Before any change under `content/` or `public/documents/`.
- `.claude/rules/site-code.md`: known footguns 1 to 15 (symptom and fix), the grid rule, deliberate oddities in full,
  design tokens. Before any change to pages, components, composables, assets, server code or config.
- `docs/rules.md`: rules 1 to 13 below, in full, with reasons and enforcement details.
- `docs/footguns.md`: the history of each footgun. `docs/procedures.md`: the procedures, listed at the end of this file.

## Layout

```
pages/ components/ composables/ assets/ public/   the site code. This is what you work on.
content/           the content. Phase 2: changed only on a content/short-name branch (rule 3).
visual/            the visual baseline: 60 committed screenshots and README.md. tests/visual/ and
                   playwright.config.ts run the comparison; scripts/visual-routes.json lists the routes.
scripts/verify.sh  the verification suite. Run before every commit. CI runs it on every PR
                   (.github/workflows/verify.yml; not the screenshot comparison, which needs a Mac).
                   check-content-branch.mjs: the branch-kind, deletion, slug and people_mentioned checks.
scripts/           also download-team-photos.mjs, fetch-transcripts.mjs, and
                   content-schemas.mjs + validate-content.mjs (Zod schemas and the
                   content validator; Content v2 cannot enforce schemas itself)
agent/roadmap.md   Phase 1 tasks and the Phase 2 roadmap, with status and acceptance criteria
agent/reconcile.md the "verify first" checklist for task 1
agent/content-model.md  collection schemas, cross-link rules, editorial rules.
                   Written from memory by the previous agent. Read before task 2.
agent/log/         the evaluation log: one file per branch, `<YYMMDD>-<branch>.md`; format and commands in its README.
                   `node scripts/eval-log.mjs` prints it all, `--counts` counts it
agent/eval-log.md  the log before 7 October 2026, frozen (one shared file made every open PR conflict on every merge)
agent/reports/     dated reports you produce (reconcile, audits, the Phase 1 evaluation). YYMMDD_name.md
docs/              rules, footguns and procedures in full (see "Where the rest lives")
.agent/            scratch space, gitignored. Diffs for the reviewer, build baselines.
.claude/           Claude Code: rules/ (path-scoped rule files), agents/reviewer.md, hooks/guard.mjs,
                   settings.json (see CLAUDE.md)
.github/pull_request_template.md  the PR description format
```

## Commands

```bash
npm run dev                        # localhost:3000, hot reload. Search does not work here.
npm run build:search               # nuxt generate && pagefind --site .output/public
npx serve .output/public -l 4000   # preview the built site. Search only works here.
./scripts/verify.sh                # static checks, seconds
./scripts/verify.sh --build        # static checks, then the full build and the built-site link check
npm run lint                       # ESLint: Vue templates and TypeScript scripts get eslint-plugin-vue's essential rules; .vue files also get rules for footguns 1, 2, 5, 7, 13 and 14, .ts files for 1, 5, 7, 13 and 14; .mjs files are only parsed (syntax errors); verify.sh runs it
npm run validate:content           # read-only check of content/ against the schemas; verify.sh runs it too
node scripts/check-links.mjs       # after a build: every internal href/src in .output/public resolves to a file (verify.sh --build runs it)
node scripts/parity/redirects.mjs   # regenerates public/_redirects (legacy URL redirects) from the parity data; --check compares (verify.sh runs the check)
node scripts/check-redirects.mjs   # after a build: every redirect target exists in .output/public and no source is a real page (verify.sh --build runs it)
npm run visual:compare             # after a build: 60 screenshots vs visual/baseline; any changed pixel fails
npm run visual:baseline            # rewrites visual/baseline; only from a build of main, in its own PR
npm run test:e2e                   # after a build: smoke test, every built page at 390/1280px (errors, hydration, empty <main>); CI runs it; tests/e2e/README.md
node scripts/style-compare.mjs snapshot .agent/styles/<name>.json.gz   # after a build: computed style of every element, 121 pages x 2 widths
node scripts/style-compare.mjs compare  <a>.json.gz <b>.json.gz         # 0 differing elements is the gate for Tailwind migration PRs
rm -rf .nuxt .output node_modules/.vite && npm run dev   # when something seems stale
```

A `Failed to resolve import "#app-manifest"` warning on dev startup is a known Nuxt/Vite
version mismatch. Ignore it.

## Rules

Short forms. The full text of each, with reasons and how `verify.sh` enforces it, is in `docs/rules.md`.

1. **The repository is authoritative.** `agent/content-model.md`, the roadmap and these instruction files
   describe intent; they were written from memory. When a document and the code disagree, the code is the fact. Report the disagreement; do not
   quietly follow either one.
2. **You cannot see what you render.** A passing build is not evidence that a page is correct. For any
   change touching layout, markup structure or links, do not write "verified," "tested" or "works."
   Write what you checked, and list what a human must look at ("Visual review request").
3. **A branch changes content or code, never both.** Content work: a `content/short-name` branch that
   changes only `content/**`, plus `agent/`, `public/` files that belong to a content item the PR names,
   and `visual/baseline/` images (the PR lists which and why). Code work: a `task/short-name` branch that
   does not touch `content/**`. A branch that changes only `public/` or `visual/baseline/` is code.
   `agent/` changes are allowed on either. C1 to C16 apply to every change under `content/`. A code
   change that a content change needs is a second PR. `verify.sh` decides the kind from the diff, and
   locally also fails when the branch name and the diff disagree.
4. **Git.** Cut the branch from an up-to-date `main`. Never commit on `main`. Commit only after
   `./scripts/verify.sh` passes. Stage files by name and read `git diff --staged`; never `git add -A`
   or `git add .`. Never skip hooks. Push and open the PR only when Jordan says to in that conversation.
   Never merge a PR, never force-push, never push to `main`. **Every PR targets `main`**; no stacked PRs (wait for
   the other change to merge, or put both in one branch).
   Before opening: `git fetch origin`; `git merge-base --is-ancestor origin/main HEAD` must exit 0. Open with
   `gh pr create --repo jordansread/CUAHSI3-website --base main --head <branch>` (this is a fork); after,
   `gh pr view <number> --repo jordansread/CUAHSI3-website --json baseRefName` must say `main`.
5. **One task per branch, one concern per PR.** No drive-by fixes. If you notice a
   problem outside the task, add a line to "Noticed" in `agent/roadmap.md` and leave it.
6. **Do not "fix" deliberate oddities.** Tidying them breaks live URLs: `content/research/` renders at
   `/about/impact/`; `pages/highlights/` holds redirect stubs to `/about/impact`; the `slug` frontmatter
   field drives URLs, not the filename; `/member-portal` is unlinked from the nav on purpose. In full in
   `.claude/rules/site-code.md`.
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
10. **Logs are append-only.** `agent/log/`, `agent/eval-log.md` (frozen) and the Noticed list are never
    rewritten. Write only your own branch's file, `agent/log/<YYMMDD>-<branch>.md`, in the format in
    `agent/log/README.md` (which is not a log: it may be edited, not removed); correct a wrong entry with a `correction` line there. Never add to the
    `KNOWN` exception list in `scripts/eval-log.mjs` (details in `docs/rules.md`).
11. **Log every intervention.** Whenever Jordan corrects you, redirects you, rejects
    an approach, or has to decide something you should have been able to decide, add
    an `intervention` line to your branch's log file in that session. Do not wait to be asked.
12. **Report counts with denominators and show your sample.** "31 of 44 grids
    migrated," not "most grids migrated." Before reporting any bulk result, open three
    affected files and three unaffected ones and confirm by reading them. Say which
    six.
13. **A new footgun goes in this file.** Since 14 November 2026 "this file" is two: the symptom and fix in
    `.claude/rules/site-code.md` under "Known footguns", the story in `docs/footguns.md`. If a pattern can
    detect it, add a check to `scripts/verify.sh` too.

## Bulk edits

Lessons from real errors. Follow these whenever a change touches many files.

- **Ten files or fewer: edit each by hand.** Do not script.
- **More than ten: say so first.** Tell Jordan how many files and what pattern, and
  migrate one file by hand as the worked example before scripting the rest.
- **Verify placement, not just success.** A substitution count is not verification.
  After a scripted edit, read the result in at least three changed files.
- **Run `./scripts/verify.sh` straight after any scripted edit**, before doing
  anything else. The backtick check catches mangled template literals.
- **Split large migrations by route section.** One PR for `/community/*`, one for
  `/about/*`, and so on, so a human can review each deploy preview in a sitting.
- **Never use `\s*` across a line end in a pattern.** It matches the newline and
  silently joins lines. Use `[ \t]*`.

## Procedures

Each is in full in `docs/procedures.md`; open it and follow the one that applies.
- **Start of session**: at the start of every session, before anything else; it ends by waiting for direction
  (do not start a roadmap task unprompted).
- **Upstream**: reporting on, or bringing in, changes from `CUAHSI/CUAHSI3-website`.
- **Start a task** (state the plan before changing anything; for roadmap tasks 3 and 4 wait for approval), **Reconcile** (roadmap task 1), **Verify**, **Compare rendered output** (refactors),
  **Review** (before every commit that goes in a PR), **Finish a task**: the life of every task, in order.
- **Visual review request**: every PR touching layout, markup or links.
- **After review**: Jordan reports a PR's outcome. **Quick log**: Jordan types "log:".
- **New footgun**: something built cleanly and was wrong. **Status**: Jordan asks where things stand.
- Content: **Content repair** (fixing existing files), **New content item** (a draft from Jordan or staff),
  **Propose, then apply** (more than five items from one source), **Add a Critical Zone product**,
  **Unpublish**, **Content lint** (on request), **Review of a content branch** (what the reviewer checks).
- **Locks**: in `CLAUDE.md`.
