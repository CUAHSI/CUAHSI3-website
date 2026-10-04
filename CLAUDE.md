# Repository instructions

This is the CUAHSI website rebuild: Nuxt 3, `@nuxt/content` v2, Tailwind, statically
generated, deployed to Netlify at https://cuahsi3-website.netlify.app/ (public, not
indexed). You build and maintain it. Jordan Read directs the work and reviews every
pull request. He is not a developer, so he reviews by reading your PR description and
looking at the Netlify deploy preview, not by reading Vue.

This work is also an experiment: can an agent own and evolve a production website, as
an alternative to CUAHSI's software engineering team rebuilding it? The record you keep
in `agent/eval-log.md` is the data. A negative result is a real result. Record what
happened, including what makes you look bad.

This file is living. When you find a new footgun or convention, add it here in the
same PR (see "New footgun").

## Layout

```
pages/ components/ composables/ assets/ public/   the site code. This is what you work on.
content/           the content. Do not modify in Phase 1 (rule 3).
visual/            the visual baseline: 52 committed screenshots and README.md. tests/visual/ and
                   playwright.config.ts run the comparison; scripts/visual-routes.json lists the routes.
scripts/verify.sh  the verification suite. Run before every commit. CI runs it on every PR
                   (.github/workflows/verify.yml; not the screenshot comparison, which needs a Mac).
scripts/           also download-team-photos.mjs, fetch-transcripts.mjs, and
                   content-schemas.mjs + validate-content.mjs (Zod schemas and the
                   content validator; Content v2 cannot enforce schemas itself)
agent/roadmap.md   Phase 1 tasks in order, with status and acceptance criteria
agent/reconcile.md the "verify first" checklist for task 1
agent/content-model.md  collection schemas, cross-link rules, editorial rules.
                   Written from memory by the previous agent. Read before task 2.
agent/eval-log.md  append-only record of tasks, interventions and defects
agent/reports/     dated reports you produce (reconcile, audits). YYMMDD_name.md
.agent/            scratch space, gitignored. Diffs for the reviewer, build baselines.
.claude/agents/reviewer.md   read-only reviewer subagent
.claude/hooks/guard.mjs      blocks edits to content/ and unsafe git commands
.claude/settings.json        permissions and hook wiring
.github/pull_request_template.md  the PR description format
```

## Commands

```bash
npm run dev                        # localhost:3000, hot reload. Search does not work here.
npm run build:search               # nuxt generate && pagefind --site .output/public
npx serve .output/public -l 4000   # preview the built site. Search only works here.
./scripts/verify.sh                # static checks, seconds
./scripts/verify.sh --build        # static checks, then the full build and the built-site link check
npm run lint                       # ESLint: Vue templates and TypeScript scripts get eslint-plugin-vue's essential rules; .ts and .mjs files are only parsed (syntax errors), no rules; verify.sh runs it
npm run validate:content           # read-only check of content/ against the schemas; verify.sh runs it too
node scripts/check-links.mjs       # after a build: every internal href/src in .output/public resolves to a file (verify.sh --build runs it)
npm run visual:compare             # after a build: 52 screenshots vs visual/baseline; any changed pixel fails
npm run visual:baseline            # rewrites visual/baseline; only from a build of main, in its own PR
node scripts/style-compare.mjs snapshot .agent/styles/<name>.json.gz   # after a build: computed style of every element, 121 pages x 2 widths
node scripts/style-compare.mjs compare  <a>.json.gz <b>.json.gz         # 0 differing elements is the gate for Tailwind migration PRs
rm -rf .nuxt .output node_modules/.vite && npm run dev   # when something seems stale
```

A `Failed to resolve import "#app-manifest"` warning on dev startup is a known Nuxt/Vite
version mismatch. Ignore it.

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
3. **Do not modify `content/**` in Phase 1.** Content is the stable asset; code is what
   is being refactored. If content never changes, any content breakage is a code
   regression. The hook blocks edits and `verify.sh` fails if the branch touches
   `content/`. If a code change seems to need a content change, stop and tell Jordan.
4. **Git.** Work on a branch named `task/short-name`, cut from an up-to-date `main`.
   Never commit on `main`. Commit on the task branch only after `./scripts/verify.sh`
   passes. Stage files by name and read `git diff --staged` before committing; never
   `git add -A` or `git add .`. Never skip hooks. Push the branch and open the PR only
   when Jordan says to in that conversation. Never merge a PR, never force-push, never
   push to `main`.
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
10. **Logs are append-only.** `agent/eval-log.md` and the Noticed list are never
    rewritten. If an entry is wrong, add a new dated entry that says what was wrong
    and points to it. `verify.sh` fails if the eval log loses a line.
11. **Log every intervention.** Whenever Jordan corrects you, redirects you, rejects
    an approach, or has to decide something you should have been able to decide, add
    an `intervention` line to the eval log in that session. Do not wait to be asked.
12. **Report counts with denominators and show your sample.** "31 of 44 grids
    migrated," not "most grids migrated." Before reporting any bulk result, open three
    affected files and three unaffected ones and confirm by reading them. Say which
    six.
13. **A new footgun goes in this file.** If something built cleanly and was wrong,
    it belongs under "Known footguns," and if it can be detected by a pattern, in
    `scripts/verify.sh` too.

## Known footguns

Every one of these cost real debugging time. Most failed silently; the third is unverified (see below), and the eleventh printed a warning but left the tree dirty.

1. **`queryContent('news')` also returns `/newsletter/` content.** Nuxt Content matches
   by path prefix, and `/newsletter/2026-06` starts with `/news`. This put newsletter
   issues on the news page with broken URLs. Always filter, with the trailing slash:
   ```js
   const items = computed(() =>
     (allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))
   )
   ```
   Check every new `queryContent()` call for the same kind of collision.
2. **`<component :is="cond ? 'a' : 'NuxtLink'">` renders but does not navigate.** The
   markup looks right and clicks do nothing. Hit twice. Use explicit `v-if` / `v-else`
   with real `<a>` and `<NuxtLink>` tags.
3. **Unverified: an apostrophe inside a static `style="..."` attribute.** The previous
   agent reported that it crashes the Vue compiler (`style="content:'x'"` was the
   example). That was not reproduced. 231 such lines in 21 files build cleanly: the
   build passed (reconcile report, `agent/reports/261003_reconcile.md`, check 7), and
   every line the report read was a `font-family` name like `'Hanken Grotesk'`. That
   shows the build did not fail, not that every line renders correctly. A standalone
   `@vue/compiler-sfc` compile of `style="content:'x'"` with Vue 3.5.35 (client and
   SSR, not a Nuxt build) also succeeded; the test is recorded in `agent/eval-log.md`.
   There is no `verify.sh` check for it. If a build ever fails on a style attribute
   with an apostrophe, record the exact error here.
4. **Vue reuses DOM nodes across `v-for`, including `<img src>`.** A `:key` on a
   wrapping `<template v-for>` is not enough; Vue looks past the template to the
   rendered children. Symptom: the right content flashes, then a neighbour's replaces
   it. Use one stable keyed element per iteration. Do not switch element types
   mid-list.
5. **`findOne()` throws when nothing matches.** Always `.findOne().catch(() => null)`.
6. **`throw createError()` inside `setup()` breaks client-side navigation in dev.**
   Use a `notFound` computed that the template renders conditionally.
7. **Bare JSON arrays in `content/` get wrapped.** Nuxt Content warns and moves the
   array into `.body`. Unwrap: `Array.isArray(data.value?.body) ? data.value.body : []`.
8. **`nitro.prerender.failOnError: false` is deliberate.** Without it, a dynamic-route
   404 aborts the whole build. Leave it.
9. **A bulk edit once corrupted a template literal and broke the build.** The backtick
   balance check in `verify.sh` exists because of it. See "Bulk edit."

10. **Inline styles beat classes.** When an inline style becomes a Tailwind class, an element that had both a
    class and an inline value for the same property changes (the inline one used to win), and a class that was
    dead under an inline value, such as `hover:text-white` under an inline `color`, suddenly works. Also: Tailwind's
    `antialiased` adds a second property, `grid-cols-N` uses `minmax(0,1fr)` where plain CSS `1fr` is
    `minmax(auto,1fr)`, and the build adds `-webkit-backdrop-filter`; use the exact arbitrary form when the
    inline style was exact. Two more from the migration: `items-start` writes `align-items:flex-start` where
    the inline style said `start`, and an old `font:` shorthand needs `leading-[normal]` but must not be
    combined with an explicit `leading-*` on the same element (the earlier class wins, and the line height
    silently changes). No `verify.sh` check: none of this can be found by a pattern; the style comparison finds it. Check with
    `node scripts/style-compare.mjs` (computed style of every element) and `npm run visual:compare`. Do not use the
    `font-display` / `font-body` tokens for text that had a plain inline `font-family`: they add a `sans-serif`
    fallback that changes how arrows and ticks draw; write `font-['Hanken_Grotesk']` instead.
11. **A build modified a tracked file: `public/robots.txt`.** The `@nuxtjs/robots` module finds a robots.txt in
    several places and, when it is `public/robots.txt`, renames it to `public/_robots.txt` on every build or dev run
    (the tree is left dirty with a deleted tracked file and an untracked one). Observed in the 4 October build: the
    built site then also contained the copy as `/_robots.txt`; after the move it does not. The source now lives at `assets/robots.txt`, which the module reads without moving it;
    the built `/robots.txt` was byte-identical before and after the move (checked with diff on one build). `verify.sh` fails if `public/robots.txt` exists.

## Layout: never put `grid-template-columns` in a `style` attribute

Inline styles cannot be overridden by media queries. This caused a total mobile failure
across 44 grids in 20 files. The old `.rgrid` / `.rg-*` helper classes and the `--cols`
variable were retired in the Tailwind migration (roadmap task 4). Write responsive grids
as mobile-first utilities, with the same breakpoints the old helpers had:

```html
<!-- card grid: 1 column, 2 from 640px, 3 from 900px -->
<div class="grid grid-cols-[1fr] gap-[18px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
<!-- two-track layout (hero, sidebar): stacked until 900px -->
<div class="grid grid-cols-[1fr] gap-[48px] min-[900px]:grid-cols-[minmax(0,1fr)_240px]">
```

- Use the exact track list (`1fr`, `minmax(0,1fr)`) the design needs: `grid-cols-2` writes
  `minmax(0,1fr)`, which differs from `1fr` when an item is wider than its track.
- `.site-container` (in `assets/css/global.css`): responsive horizontal padding, 40px down to 20px.
- `verify.sh` still fails on `grid-template-columns` inside a `style="..."` attribute on one line; it does not
  see a value built across several lines, so do not rely on it for those.

## Deliberate oddities. Do not fix.

- **`content/research/` renders at `/about/impact/`.** Left from an IA change. Changing
  it breaks every query and link.
- **`pages/highlights/` holds 301 redirect stubs** to `/about/impact`. They preserve
  URLs used in NSF reporting and newsletter back issues.
- **The `slug` frontmatter field drives URLs, not the filename.** Renaming a content
  file never changes its URL.
- **`/member-portal` is unlinked from the nav** on purpose.

## Design tokens

Fonts: `Schibsted Grotesk` (headings), `Hanken Grotesk` (body), `Space Mono` (labels).

Colors: ink `#15212B`, navy `#0F2E44`, navy-deep `#0A2032`, water `#1F6FB2`,
water-bright `#2A86C9`, water-soft `#7FC0EE`, clay `#C0603C` (accent), paper `#FBFAF7`
(page background), sand `#F3EEE4` (panel background), muted `#5C6E78`. Category colors
are `oklch()` values in `composables/useCategoryColor.ts`.

`app.vue` wraps every page with `AppHeader`, `NuxtPage` and `AppFooter`. Pages contain
no nav or footer markup. Nav has five items: About, Data & Computing, Learn & Train,
Community, Hire CUAHSI.

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

**Start of session.** Run `git status` and `git branch --show-current`. Read the Status
column in `agent/roadmap.md` and the last ten lines of `agent/eval-log.md`. Tell Jordan
in three lines where things stand: branch, task in progress, anything uncommitted. Then
wait for direction. Do not start a roadmap task unprompted.

**Start a task.** Jordan names a roadmap task or describes a new one. Confirm the tree
is clean. `git switch main && git pull --ff-only`, then `git switch -c task/short-name`.
Before changing anything, state the plan: files you expect to touch, how you will
check the result, what will need human eyes. For roadmap tasks 3 and 4, wait for
Jordan to approve the plan. Append a `start` line to the eval log.

**Reconcile.** Roadmap task 1. Read `agent/reconcile.md` and follow it. It is
read-only: it produces a report and changes no code.

**Verify.** Run `./scripts/verify.sh`. Every `FAIL` must be fixed. Every `WARN` must be
read and either fixed or explained in the PR description. Before a PR, run
`./scripts/verify.sh --build`. Then, for each route the change affects, with the built
site served on port 4000: fetch the page, confirm it returns 200, and confirm each
internal link in the changed markup points to a file that exists in `.output/public`.
This is the nearest you can get to clicking. Say in the PR that it is not the same.

**Compare rendered output.** For refactors (rule 9). Build `main` and copy
`.output/public` to `.agent/baseline/`. Build the branch. Diff the HTML of each
affected route, ignoring Vue's `data-v-*` scoped-style hashes. Explain every remaining
difference in the PR, or remove it. For the Tailwind migration the HTML will differ by
design, so this does not replace the visual baseline (roadmap task 3b).

**Review.** Before every commit that will go in a PR. Write the diff to a file:
`mkdir -p .agent && git diff main...HEAD > .agent/review.diff` (add uncommitted changes
with `git diff >> .agent/review.diff`). Delegate to the `reviewer` subagent with the
task description and that path. Put its findings in the PR description unchanged,
then say what you did about each. If you disagree with a finding, say so and leave
it for Jordan; do not drop it. Each finding you fix is a `defect` line in the eval
log with `caught: reviewer`.

**Finish a task.** Run Verify, then Review, then commit (rule 4). Fill in
`.github/pull_request_template.md` and show Jordan the description. When he says to
open the PR: `git push -u origin task/short-name` and `gh pr create` with that
description. Give him the PR link and say the deploy preview will appear on the PR.
Update the Status column in `agent/roadmap.md` on the branch. Append a `pr` line to
the eval log.

**Visual review request.** Part of every PR touching layout, markup or links. List the
exact routes to open on the deploy preview, at phone width (390px) and desktop width
(1280px), and for each one what to look at and what to click, in plain language:
"Open /about/team. Every card should show the right person's photo. Click three cards;
each should open that person's profile." Jordan is not a developer. Make the list
short enough that he will actually do all of it.

**After review.** When Jordan reports the outcome of a PR, append lines to the eval
log: `merged` or `abandoned`, plus one `defect` line for each problem found, with
where it was caught (`human-review`, `deploy-preview` or `production`). If he asks
for changes, each request is an `intervention` line.

**Quick log.** When Jordan types "log:" followed by a note, append it to the eval log
as an `intervention` or `note` line with today's date and the current branch. Keep his
wording. Do not discuss it.

**New footgun.** When something built cleanly and was wrong: add a numbered entry
under "Known footguns" with the symptom and the fix; add a check to `scripts/verify.sh`
if a pattern can detect it; append a `defect` line to the eval log. Do all three in
the PR that fixes it.

**Status.** When Jordan asks where things stand, answer from `agent/roadmap.md`, the
eval log and `git`, not from memory of the session. Give counts from the eval log:
tasks started, PRs merged, interventions, defects by where they were caught.

**Phase 2.** Not yet. When Jordan opens Phase 2 (the content agent), rule 3 changes,
`PHASE` in `.claude/hooks/guard.mjs` and `scripts/verify.sh` changes with it, and
content procedures get added here. Until he says so, Phase 2 work is out of scope even
when it looks easy.
