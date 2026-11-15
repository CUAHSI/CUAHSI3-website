# Plan: responding to the external reviewer's feedback

12 November 2026, corrected 14 November. A proposal for Jordan; nothing in the repository changes until he decides. The claims come from four kinds of source, and section 12 says which is which: counts made with read-only commands (`grep`, `ls`, `wc`, short scripts) on `main` at `b8ac43b`; things seen in this work's sessions on 12 and 13 November and not re-run since (a build of the site, one run of the visual comparison, the guard hook's refusals); GitHub (issue and PR numbers); and Claude Code's documentation (memory, skills and subagents pages at code.claude.com/docs), read through a documentation subagent and marked **[docs]**. Where I could not check something, I say so.

**Corrections (14 November).** An outside review of this report found wrong figures, and the epic (#117) and task #129 were written from them. Each corrected figure below was measured again on 14 November; the pattern and scope are stated where it appears.
- **Footgun checks.** I said 6 of the 7 footguns a pattern can find were guarded by memory alone, and that 3 of 14 failed a check. `scripts/verify.sh` already fails footgun 2 and warns on footguns 1, 5 and 6. `CLAUDE.md` at `b8ac43b` lists 15 footguns, not 14 (footgun 15, `window.location.search` read in `onMounted`, was missed in the first count and in the first correction). Of the 15, 4 fail a check (2, 9, 11, 12), 3 only warn (1, 5, 6) and 8 have none (sections 2, 3, 6, 10).
- **Footgun 13 is broken in 1 file,** `pages/learn-train/archive/index.vue`; I had said it held everywhere. It is now a Phase A repair (section 4).
- **The log's defects:** 288 defect lines, 196 caught by the reviewer, not 211 and 155 (section 1).
- **The visual comparison:** 60 baseline images (30 routes at 2 widths), not 56 screenshots and not 112 images. The 5 failures came from one run on 12 November, out of 60 (sections 2, 4, 10).
- **Composables:** none of the 3 files in `composables/` is a composable, not 2 of 3 (section 2).
- **References to rule numbers:** 66 in `scripts/` and `.claude/`, not 75; `.claude/` has no "footgun N" (section 6).
- **Scopes stated** for the `any`, `new Date(` and raw hex counts, which were given without them; the `any` file count was 15, not 16 (sections 2, 3).
- **ESLint (Phase D)** is reframed as turning existing warnings into failures (section 7). Footgun 6 belongs to Phase A only; Phase D listed it too.
- **The data layer (Phase E)** was said to make four footguns impossible; the design makes them much harder to repeat, not impossible (section 8).

## 1. The answer

**The reviewer is right about the main thing: the project's safety rests on a model reading prose.** Of the 288 defect lines in the log, 196 were caught by the reviewer subagent and 0 by a test, because there are no tests of behaviour (`node scripts/eval-log.mjs --counts`, run 14 November on `b8ac43b` plus this branch's own log file, which held 1 of the 288; before this correction's own log lines). The rules that keep the code safe are mostly written, not checked: of the 15 footguns, 4 fail a check, 3 only warn, and 8 have no check at all (section 3). The code mostly obeys them today (section 3), but only because a model reads 549 lines of instructions before every change. Claude Code's own documentation sets a target of 200 lines and says longer files reduce adherence **[docs]**.

**The plan, in order of value:**
1. **Repair the guardrails that exist** (two bugs in the guard hook, a red visual comparison on `main`, and the two footguns broken today).
2. **Add tests of behaviour.** A smoke test that opens every built page and fails on a crash, a console error or a hydration mismatch. Then a dozen scenario tests built from the browser scripts the audits already wrote.
3. **Restructure the instructions** into a short `AGENTS.md` under 200 lines, rule files that load only when matching files are touched, skills for the procedures, and `docs/` for history. Rule numbers stay the same, because 66 references in `scripts/` and `.claude/` use them, and many more in the logs (section 6).
4. **Make the repository legible to a developer:** editor settings, a type check with a ratchet, a formatter, and a developer guide the reviewer can test from a fresh clone.
5. **Build a data layer**, one typed function per collection. Four of the fifteen footguns (1, 5, 7, 13) become much harder to repeat, because their handling lives in one place, and a check can then fail any page that calls `queryContent()` or reads the clock directly. This is the large, risky change: one collection per PR, each proved to change nothing a visitor sees.

**Not done:** component folders (16 files is small), Pinia (no state is shared across pages), VueUse (one `localStorage` use).

**Section 11 lists the eight decisions I need from you.**

**Issues (13 November):** epic CUAHSI/CUAHSI3-website#117, tasks #118 to #134 (A1 to A3: #118 to #120; B1 to B3: #121 to #123; C1, C2: #124, #125; D1 to D5: #126 to #130; E1 to E4: #131 to #134), label `epic:code-quality`. The eight decisions are open on the epic.

## 2. The review, point by point

| # | The reviewer says | What I found | Response |
|---|---|---|---|
| 1 | Content direction is good: Markdown/JSON, validated, reused | Zod schemas (`scripts/content-schemas.mjs`) and `npm run validate:content`, run by `verify.sh` and CI | agree; keep |
| 2 | No tests | One Playwright file (`tests/visual/visual.spec.ts`) compares 60 screenshots, pixel for pixel: the 30 routes in `scripts/visual-routes.json` at 390 and 1280 px, against the 60 PNGs in `visual/baseline/390/` and `visual/baseline/1280/` (30 each). It runs on a Mac only (not in CI). No test clicks, filters or loads data. `verify.sh` checks links, redirects, e-mail leakage and content | **accept, first priority** (section 5) |
| 3 | No typecheck | `nuxi` is installed, `vue-tsc` is not; no `typecheck` script; no root `tsconfig.json` | accept (section 7) |
| 4 | Weak types; 37 `any` | 43 lines (51 occurrences) match the pattern `: any\b\|as any\b\|<any>\|any\[\]` in the `.vue` and `.ts` files under `pages/`, `components/` and `composables/`, in 15 files; 21 of the 43 lines (26 occurrences) are in three files, 7 lines each (jobs page, site search, `useGageCard.ts`). Adding `server/` makes it 45 lines in 16 files. The reviewer's 37 was not reproduced with any scope I tried. All 53 `<script setup>` blocks are `lang="ts"` | accept; remove `any` as files are touched, not in a sweep |
| 5 | No intellisense for Nuxt auto-imports | No root `tsconfig.json` extending `.nuxt/tsconfig.json`; no `postinstall: nuxt prepare`; no `.vscode/`. Not tested in an editor | accept (section 7) |
| 6 | No `.editorconfig`, formatter, format-on-save | None exists. ESLint runs only Vue's "essential" rules; `.ts` files are parsed, not linted (the config says so) | accept, with one reformat PR at a quiet moment |
| 7 | Data layer for `queryContent()` | **51 calls in 30 files**, over 15 collections (events 7, newsletter 6, research 5, news 5, critical-zone 5, team 4, awards 4, members 3, jobs 3, cyberseminars 3, and 5 with 1 or 2) | **accept; the largest change** (section 8) |
| 8 | Logic lives in pages | The 39 page files hold 4,996 lines. Fetching, filtering, sorting and date logic are in them | accept, through the data layer |
| 9 | Flat `components/` (16 files) | 16 files | **defer**: revisit at about 30 |
| 10 | No shared types folder | Types are inline; the real shapes live in the Zod schemas | accept (decision 5) |
| 11 | `composables/` holds non-composables | 3 of 3: none of the files in `composables/` calls `ref`, `computed`, `watch`, `reactive`, `useState`, `onMounted` or `useAsyncData`. `useCzLabels.ts` (lookup tables), `useGageCard.ts` (343 lines, 20 exports, including the `GAGES` data array) and `useCategoryColor.ts` (one plain function, 11 lines) | accept; move to `utils/` (Nuxt auto-imports it) |
| 12 | VueUse `useStorage` | `localStorage` in 1 file (`useGageCard.ts`) | **decline for now**: one use does not justify a dependency. Storage read during the first render is a hydration risk (footgun 13) whichever API is used |
| 13 | `CLAUDE.md` too long (549 lines), mixes rules with history | 549 lines, 42,951 characters. 157 lines are 21 procedures; 99 are content rules; 88 are footguns with their history | **accept** (section 6) |
| 14 | `AGENTS.md` works with other tools | Claude Code reads `AGENTS.md` only when there is no `CLAUDE.md`; the documented pattern is a `CLAUDE.md` whose first line is `@AGENTS.md` **[docs]** | accept, in that form |
| 15 | Procedures as skills | A skill's body loads only when used; its description is always visible **[docs]** | accept for 19 of 21 procedures (section 6) |
| 16 | Rules written down, not enforced; some already broken | Of the 15 footguns, `verify.sh` fails 4 (2, 9, 11, 12) and only warns on 3 (1, 5, 6); 8 have no check, and ESLint enforces none. 2 footguns are broken today: 6 in 2 files (a WARN every PR has carried) and 13 in 1 file (no check). Separately, a run of the visual comparison on 12 November failed 5 of its 60 images on `main` (it is not in CI), and the guard hook has 2 bugs. Section 3 | **accept**: the gap is enforcement (warnings nobody must act on, and no check at all for 8 of the 15 footguns) more than breakage |
| 17 | Guardrails are good | Hook, deny rules, reviewer subagent, code/content split, CI | agree; repair the hook (section 4) |
| 18 | A developer without AI would struggle | No README section or `docs/` explains how a page gets its data or how to add a collection | accept; test it with the reviewer (section 7) |

## 3. Which rules hold, and which only hold because someone remembers

Read on `main` (`b8ac43b`). A "check" means `verify.sh`, ESLint, the hook or CI reports it without anyone reading. `verify.sh` has two strengths: a FAIL stops the run (exit 1), a WARN is printed and the run passes. CI runs `verify.sh --build` on every PR, so every check below, including the `--build` ones, runs in CI. ESLint runs eslint-plugin-vue's "essential" rules only (`eslint.config.mjs`); none of them targets a footgun. The check numbers are the comments in `scripts/verify.sh` (read in full, 171 lines, 14 November).

| Rule | Holds today? | Enforced by a check? |
|---|---|---|
| Footgun 1: `queryContent('news')` also returns `/newsletter/` | yes: the 3 files that query `news` all filter `/news/`. `news`/`newsletter` is the only prefix pair among the 17 collection folders | **WARN**: check 6 warns on any file that queries the shorter of two prefix-colliding folder names and has no `startsWith('/name/')` anywhere in it |
| Footgun 2: `:is` with a conditional | yes: 0 found | **FAIL**: check 4 fails a `:is="..."` that contains `'a'`, `'NuxtLink'` or `'nuxt-link'` |
| Footgun 3: apostrophe in a static `style` (unverified) | not applicable: never reproduced | no: the check was removed (check 2) |
| Footgun 4: reused DOM in `v-for` | not checked by pattern | no. ESLint's `vue/require-v-for-key` requires a `:key` but cannot tell whether it sits on one stable element per iteration |
| Footgun 5: `findOne()` without `.catch` | yes: 27 of 27 have one (2 on the next line) | **WARN**: check 7 warns on a `findOne()` with no `.catch` within the next two lines |
| Footgun 6: `throw createError` in `setup()` | **no: 2 files** (`pages/community/events/[slug].vue`, `pages/community/newsletter/[slug].vue`) | **WARN**: check 8, which every PR has carried |
| Footgun 7: JSON collections must be unwrapped | yes: 14 of 14 files that read a JSON collection unwrap it | no |
| Footgun 8: `failOnError: false` stays | yes (`nuxt.config.ts` line 39) | no |
| Footgun 9: unbalanced backticks | yes | **FAIL**: check 1 |
| Footgun 10: inline styles beat classes | not checkable by pattern | no: `style-compare.mjs` and the visual comparison find it, run by hand, not by `verify.sh` or CI |
| Footgun 11: `public/robots.txt` | yes | **FAIL**: check 8b |
| Footgun 12: member e-mails in the built site | yes | **FAIL**: check 15, with `--build` only (CI runs it) |
| Footgun 13: a clock read in setup that decides what renders | **no: 1 file.** `pages/learn-train/archive/index.vue` line 17, `const now = ref(new Date())`: the computeds `upcoming` and `past` (lines 20 and 21) read it, so the build's render and the browser's first render can sort a workshop differently. Found with `grep -E "new Date\(\)\|Date\.now\(\)"` over `pages/`, `components/`, `composables/` and `app.vue`: 21 lines in 9 files; 12 lines in 6 files use the prescribed `useState` and `onMounted` pattern, 7 lines in 2 files (`useGageCard.ts`, `GageCard.vue`) run only after a reading loaded in the browser, and 2 lines are this file. The first draft's "0" came from looking only for `new Date()` written inside a `computed`; here the computed reads a `ref` | no |
| Footgun 14: `watch()` above what it reads | yes: in all 5 files that use `watch`, it comes after the declarations | no; only the visual comparison caught it once |
| Footgun 15: `window.location.search` is empty in `onMounted` on a static page | yes: 0 lines match `location\.search` in `pages/`, `components/`, `composables/` and `app.vue`; the one list that reads the address, `components/CzProductList.vue`, reads `route.query` inside `onMounted` (lines 149 to 154), as the footgun prescribes | no (`CLAUDE.md`: "No `verify.sh` check"). A grep for `location.search` in site code could fail it; whether to add one is a question for Jordan (section 7) |
| Grid columns in a `style` attribute | yes | **FAIL**: check 3 (one-line form only) |
| Branch kind, deletions, log format, validator, links, redirects | yes | **FAIL**: `verify.sh` and CI |
| Never push to main, force-push, merge, `add -A`, skip hooks | yes | the guard hook, with 2 bugs (section 4) |
| Design tokens | partly: kept exact on purpose in the Tailwind migration (rule 9); consistency debt, not a broken rule. Counted over the `.vue` files in `pages/` and `components/`, with the pattern `#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?\b`: 495 occurrences (89 distinct, ignoring case) on 393 lines in 49 files; 35 of the 495 are one of the ten named colours written out. 362 of the 495 (65 distinct, in 46 files) are Tailwind arbitrary values such as `text-[#5C6E78]` (pattern `\[#[0-9A-Fa-f]{6}\]`). The first draft mixed these two scopes | no |

The `new Date(` count the first draft gave (61 in 21 files) is 61 lines (67 occurrences) in 21 files, pattern `new Date\(`, in `pages/` and `components/`; with `composables/`, 64 lines (70 occurrences) in 22 files. Most are date formatting, which footgun 13 allows.

So the reviewer's "some already broken" is true for two footguns (6 in 2 files, 13 in 1 file) and for the red visual comparison. **Of the 15 footguns in `CLAUDE.md`, 4 fail a check (2, 9, 11, 12), 3 only warn (1, 5, 6), and 8 have no check (3, 4, 7, 8, 10, 13, 14, 15).** Of the 8 that a pattern could find (1, 2, 5, 6, 7, 13, 14, 15), 1 fails, 3 warn and 4 have nothing. A WARN does not stop a merge: footgun 6's has been on every PR, and the code broke the rule anyway.

## 4. Phase A: repair the guardrails that exist (S)

- **The guard hook has two bugs**, both seen today.
  - It blocks any `git push` whose command text contains the word "main" anywhere. A push followed by `gh pr create --base main` in one command was refused three times.
  - It reads the branch of the main checkout, not of the folder the command runs in. A commit in a worktree was refused because the *main checkout* was on `main`. **The reverse also follows: a commit made on `main` inside a worktree would pass while the main checkout sits on a task branch.** The fix runs `git` in the command's own folder and matches the push target, not the word.
  - A third, smaller misfire (13 November): the skip-hooks check matches its flag anywhere in the command text, including inside a heredoc that only writes a file.
  - `.claude/hooks/` is protected by the deny rules and is yours, so I would write the fix as a proposal, or you lift the rule for that one PR.
- **Green `main`.** In one run on 12 November (in an earlier session; not re-run for the 14 November correction), the visual comparison failed 5 of its 60 images on an unchanged build of `main`: about-governance at both widths and critical-zone-science-datasets at 1280 (both known), and about-team at both widths (new). Regenerate the baselines in their own PR, with each image named and explained. The 6 images PR 227 changed (home, hire-cuahsi, contact) go in the same PR.
- **Footgun 6's two files:** replace the `throw createError` with the `notFound` pattern the footgun prescribes, and make the WARN a FAIL. A check everyone ignores teaches everyone to ignore checks.
- **Footgun 13 in `pages/learn-train/archive/index.vue`** (added 14 November; a repair candidate, not yet an issue): take the time from `useState('<page>-rendered-at', () => Date.now())` and set it in `onMounted`, as the events, jobs and home pages do. It is a page change, so it needs the visual comparison and a look at `/learn-train/archive` on the deploy preview. Whether it gets its own task or joins the footgun 6 task is Jordan's call (one concern per PR, rule 5, suggests its own).

## 5. Phase B: tests of behaviour (M; no new dependency)

Playwright 1.63 is already installed, and `scripts/serve-static.mjs` already serves the built site for the visual tests. Behaviour tests go in `tests/e2e/` with their own config and run in CI on Linux, because they do not compare pixels.

1. **A smoke test over every built page:** every built page (187 HTML files in `.output/public`, 15 of them redirect stubs) at 390 and 1280 px. A page fails on any of these:
   - an uncaught error or a `console.error`
   - a Vue hydration-mismatch warning
   - an empty `<main>`
   - a `<title>` with "Nuxt" in it

   It would have caught footgun 14 (the jobs page crashed while the build was green) and the hydration symptom of footgun 13. It is the single most valuable test.
2. **Scenario tests (about 12)** for what a visitor does, built from the reviewed audit scripts: `scripts/parity/a5-behaviour-new.mjs` and `a6-readiness-browser.mjs`.
   - Opening the phone menu (named button, `aria-expanded`).
   - Search on the built site.
   - The filters on jobs, events, cyberseminars and the Critical Zone products.
   - The member lookup on `/hire-cuahsi`.
   - The newsletter links and the quote button (PR 227's fixes).
   - The event Register button, which follows the end date.
   - The 404 page.
3. **Each test is shown failing** with its bug put back (the old home sign-up box, the old `watch` order), and the PR says so. A test never seen to fail proves nothing.
4. **The log learns two new places a defect is caught:** `caught: test` and `caught: typecheck` (a change to `agent/log/README.md` and `scripts/eval-log.mjs`). Without them the experiment cannot measure what the new gates catch.
5. **Later, with the data layer:** Vitest for pure functions (date windows, Gage helpers, label lookups). That is a dependency (rule 8).

## 6. Phase C: restructure the agent's instructions (M; no site change)

**What the documentation says, and what follows from it [docs]:**
- **Size:** keep the always-loaded instructions under 200 lines.
- **Imports:** `@file` imports load in full at start, so splitting with imports saves nothing.
- **Path-scoped rules:** files in `.claude/rules/` with `paths:` load only when a matching file is read or edited.
- **Skills:** a skill's description is always visible, and its body loads only when it is used. A subagent can preload named skills (`skills:` in its definition).
- **Comments:** HTML comments (`<!-- -->`) in `CLAUDE.md` are stripped before loading. Notes for maintainers cost nothing.

**Proposed layout** (today's 549 lines; the target is about 150 always loaded):

| File | Holds | Loaded |
|---|---|---|
| `AGENTS.md` (~120 lines, tool-neutral) | What this is, folder map, commands, rules 1 to 13 in short form, "ask before" (rule 8), where everything else lives | always (through `CLAUDE.md`) |
| `CLAUDE.md` (~25 lines) | `@AGENTS.md`, then Claude-only notes: hooks, subagents, skill names | always |
| `.claude/rules/content.md` | C1 to C16, `paths: content/**, public/documents/**` | when a content file is touched |
| `.claude/rules/site-code.md` | footguns 1 to 15 (the rule and the fix; the stories go to `docs/`), the grid rule, the oddities, design tokens, bulk edits; `paths: pages/**, components/**, composables/**, utils/**, assets/**` | when site code is touched |
| `.claude/skills/<name>/SKILL.md` | 19 of the 21 procedures: start of session, upstream, start a task, reconcile, verify, compare rendered output, review, finish a task, visual review request, after review, quick log, new footgun, status, content repair, new content item, propose then apply, add a Critical Zone product, unpublish, content lint. The other 2 (review of a content branch, locks) go to the reviewer's definition and `AGENTS.md` | when used |
| `docs/` | the history behind each footgun, the experiment, the design-token reference, the developer guide | read by people, linked from the rules |

**Safeguards:**
- **Rule numbers do not change.** Counted as occurrences in all files under `scripts/` and `.claude/` (14 November): "rule N" (pattern `\brule [0-9]+\b`, ignoring case; misses plurals such as "rules 3 and 4") 15 and 11; "CN" (pattern `(^|[^%A-Za-z0-9_])C([1-9]|1[0-6])\b`, which leaves out a URL escape such as `%C3`) 28 and 4; "footgun N" (pattern `\bfootgun [0-9]+\b`, ignoring case) 8 and 0. That is 66 in all, plus many in the append-only logs. Every rule keeps its number and title in its new home.
- **A mapping table** lists every rule, content rule, footgun, oddity and procedure in today's file (13, 16, 15, 4, 21) and where it went, checked line by line and reported with counts. The reviewer subagent reads both versions before merging.
- **Two limits of path rules:**
  - A path rule loads only after a matching file is touched. Anything needed *before* the first edit, such as which branch kind to cut, stays in `AGENTS.md`.
  - Tools other than Claude Code do not read `.claude/rules/`, so `AGENTS.md` names those files.
- **The reviewer subagent** (`.claude/agents/reviewer.md`, 79 lines) is told which rule files to read, because it reviews a diff file and may never touch a matching path.
- **A size check in `verify.sh`:** fail if `AGENTS.md` plus `CLAUDE.md` exceed 200 lines. This enforces the reviewer's "should not be allowed to grow".
- **An experiment note.** The instructions are part of the experiment's conditions. The switch date goes in the log, so defects before and after can be compared.

## 7. Phase D: a repository a developer can work in (M; rule 8 for each dependency)

- **No dependency needed:**
  - An `.editorconfig` matching what the files already do (checked on a sample).
  - A root `tsconfig.json` extending `.nuxt/tsconfig.json`.
  - `.vscode/extensions.json` recommending the Vue and ESLint extensions.
- **`postinstall: nuxt prepare`**, so types for the auto-imports exist after `npm install`. This is a `package.json` scripts change (rule 8).
- **`vue-tsc` and a `typecheck` script.** The first run only counts errors, by file. After that `verify.sh` fails when the count rises (a ratchet), and each later PR lowers it. Demanding zero at once would freeze all work.
- **Prettier with `format:check`.**
  - One repository-wide reformat, in its own PR, when no other PR is open.
  - It must show zero difference with `node scripts/style-compare.mjs` and `npm run visual:compare`.
  - Until then, PRs format only the lines they change (C10).
- **Turn warnings into failures.** `verify.sh` already warns on footguns 1 and 5 (section 3), and a warning stops nothing. Make each a failure, either in `verify.sh` or as an ESLint error, whichever gives the clearer message; the ESLint form also shows in an editor. Footgun 6's warning belongs to Phase A (#120), which removes the two `throw createError` and makes that warning a FAIL. Footgun 2 already fails in `verify.sh`; an ESLint rule for it adds editor feedback. Status on 14 November: ESLint rules for footguns 1, 2 and 5, and linting of `.ts` files, are on the branch `task/eslint-footguns` (commit `f5f680c`, not merged). New checks where a pattern can be written, each shown failing on the bug put back: footgun 7 (a JSON collection read without the `.body` unwrap), footgun 13 (a `ref(new Date())` or a clock read in setup outside `useState`) and footgun 14 (a `watch()` above the declaration it reads). **A question for Jordan:** footgun 15 could be a one-line `verify.sh` FAIL on `location.search` in `pages/`, `components/`, `composables/` and `app.vue` (0 hits today), though `CLAUDE.md` says only a browser shows the symptom. Add it?
- **`docs/developing.md`:** how to run the site, the folder map, how a page gets its data, how to add a page or a collection, which checks to run, and what an agent does versus what a person does. **The acceptance test is the reviewer following it from a fresh clone** and reporting where it failed.

## 8. Phase E: a data layer (L; about 8 PRs)

**Design:**
- **One composable per collection or group,** in `composables/content/`: `useEvents`, `useNews`, `useJobs`, `useResearch`, `useTeam`, and so on. Each returns typed data and holds the collection's rules in one place:
  - the path filter (footgun 1)
  - `published` and sorting
  - `.catch(() => null)` on single items (footgun 5)
  - unwrapping JSON arrays (footgun 7)
  - the build-time clock for upcoming versus past (footgun 13)

  **These four footguns become much harder to repeat, because the handling lives in one place instead of at each call site.** A page can still bypass the layer, so the last PR adds a check that fails any page or component that calls `queryContent()` or reads the clock directly.
- **Plain helpers and data move to `utils/`:** label tables, Gage data, colour lookup.
- **Shared types live in `types/`** (decision 5).

**Method:**
- **Rule 9:** refactors preserve behaviour.
- **First PR, the worked example:** two one-call collections (`documents`, `data-portals`), done by hand, following the bulk-edit rule.
- **Then one collection group per PR,** largest risk last: events with its date logic, and jobs with its filters (footgun 14's page).
- **Each PR proves no change** with three things:
  - a diff of the built HTML of every affected route against a build of `main` (the "Compare rendered output" procedure)
  - the visual comparison
  - the Phase B tests

  Each PR also removes the `any` in the files it touches.
- **Size:** 51 calls in 30 files. At the end, no page calls `queryContent()`, and `verify.sh` fails if one does.

## 9. Order, size and timing

| Phase | What | Size | Needs from Jordan |
|---|---|---|---|
| A | Hook bugs, green `main`, footguns 6 and 13 | S | hook edit (his file), approval of the new baseline images |
| B | Smoke test, scenario tests, CI job, log values | M | approval of the CI job (it downloads a browser in CI) |
| C | `AGENTS.md`, rules, skills, `docs/`, size check | M | read the mapping table; approve |
| D | editor files, `postinstall`, `vue-tsc`, Prettier, ESLint rules, developer guide | M | rule 8 for each dependency and script |
| E | data layer, `utils/`, `types/`, Vitest | L | rule 8 for Vitest; review of the first PR |

**Why this order:**
- **A first:** every later gate is worthless while the existing ones misfire.
- **B before C and E:** tests are what make it safe to change anything else, including the instructions.
- **C before D:** the instructions are read every session, and C needs no dependency.
- **E last:** it is the largest change, and it needs B's tests to prove it changed nothing.

**Against other commitments:**
- **Critical Zone.** The section is due live on 31 January 2027, and its content PRs compete for your review time. A to C touch no page, so they can run alongside it.
- **E and the cut-over.** I would not start E until the site-wide cut-over has a date. If the date is near, E waits until after it, while B's tests run on the live site.

**Who reviews:** phases B, D and E change code that no deploy preview shows. Your review by preview cannot judge them. I suggest asking the external reviewer to read the first PR of each of those three phases (decision 7).

## 10. How we will know it worked

Measured now and at the end of each phase, reported with denominators:

| Measure | Now | Target |
|---|---|---|
| Always-loaded instruction lines | 549 | 200 or fewer, enforced |
| Footguns enforced by a check | 4 of 15 fail a check (2, 9, 11, 12); 3 only warn (1, 5, 6); 8 have none | every one a pattern or a test can express fails a check; no footgun only warns |
| Behaviour tests | 0 | smoke over every built page at 2 widths, plus about 12 scenarios |
| `queryContent()` calls in pages and components | 51 in 30 files | 0 |
| `any` (lines matching the section 2 pattern in `pages/`, `components/`, `composables/`) | 43 lines in 15 files | 0 in files the data layer touches |
| Type check errors | not measured (no `vue-tsc`) | counted, then falling |
| Visual comparison on `main` | 5 of 60 images failed, in one run on 12 November | 0 |
| Defects caught by `test` or `typecheck` | not recordable | recorded in the log |
| A developer's cold start | not tried | the reviewer's report |

## 11. Decisions for Jordan

1. **Order.** A, B, C, D, E as above? The alternative is C first, because it is cheapest and changes every session.
2. **The guard hook.** Will you make the two fixes, or lift the deny rule so I can propose them in a PR you read line by line?
3. **Dependencies and scripts (rule 8).** `vue-tsc`, `prettier`, `vitest`, a `postinstall`, a CI job that downloads a browser. Approve each when its phase starts, or the set now?
4. **Type check policy.** A ratchet (fail only if errors rise), as proposed, or zero by a date?
5. **Shared types.** Pick one:
   - (a) Move the Zod schemas to TypeScript. The validator then needs a TypeScript runner: a dependency, or Node 22 or later in place of the Node 20 that Netlify and CI use (a config change; I have not checked which Node release runs `.ts` files without a flag).
   - (b) Write the types by hand in `types/`, with one test that compares them to the schemas.
   - (c) JSDoc types in the `.mjs` schemas.

   I recommend (b) now, and (a) when Node is next upgraded.
6. **One reformat PR.** Approve one repository-wide reformat when no PR is open, proved by zero style and pixel difference?
7. **The external reviewer.** Ask them to try the developer guide from a fresh clone, and to review the first PR of phases B, D and E?
8. **Timing of phase E** against the cut-over date (section 9).

## 12. What I checked and what I did not

**Checked, by source:**
- **Read-only commands on `main` (`b8ac43b`):** the counts in sections 2, 3 and 10, by `grep`, `ls`, `wc` or a short script. Footguns 1, 5, 7 and 14 were read at each call site. Not every first-draft count was right: the 14 November corrections (top) were re-measured, with their patterns and scopes stated; the counts not listed there were not re-measured.
- **`scripts/verify.sh`, `eslint.config.mjs` and `.github/workflows/verify.yml`, read in full on 14 November,** for which footguns a check enforces (section 3).
- **Seen in this work's sessions on 12 and 13 November, not re-run:** the 187 HTML files (15 of them redirect stubs) in `.output/public`, counted after a build; the one visual comparison run with 5 of 60 images failing; the guard hook's refusals (section 4), seen when they happened.
- **GitHub:** the issue numbers (#117 to #134) and the PRs named (221, 227).
- **Claude Code's documentation,** through a subagent that cited the pages (**[docs]**). The docs say `AGENTS.md` support needs Claude Code 2.1.277 or later; this machine's version was not checked.
- **A disagreement (rule 1):** `CLAUDE.md` says `visual/` holds 56 committed screenshots; the repository has 60 (30 per width), unchanged since 6 November. The file is out of date; it is not fixed here.

**Not checked:**
- An editor's behaviour with this repository.
- The reviewer's count of 37 `any`: not reproduced with the scopes I tried (section 2).
- How many type errors `vue-tsc` would report, because it is not installed.
- Footgun 4 by any means.
- Whether a smoke test can see every hydration problem. Vue reports a mismatch in development builds more fully than in production ones, so the smoke test may need a development build too. That is to be settled in phase B.
