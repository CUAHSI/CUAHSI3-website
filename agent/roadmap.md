# Phase 1 roadmap

Tasks in order. Do not start one unprompted. Update Status on the task's own branch.
Status values: `not started`, `in progress`, `PR open`, `merged`, `blocked: reason`.

| # | Task | Status | Risk |
|---|---|---|---|
| 1 | Reconcile repo against the verify-first list | merged | none (read-only) |
| 2 | `content.config.ts` with Zod schemas, plus a standalone validator | not started | low |
| 3 | Extract repeated markup into components | not started | medium |
| 3b | Visual baseline: screenshots of every route before task 4 | not started | low |
| 4 | Inline styles to Tailwind; retire `.rgrid` / `--cols` | not started | **highest** |
| 5 | Linting and CI, with `verify.sh` as a required check | not started | low |
| 6 | Accessibility audit: contrast, semantic HTML, ARIA | not started | medium |

## Acceptance criteria

**1. Reconcile.** `agent/reports/YYMMDD_reconcile.md` exists and answers every item in
`agent/reconcile.md` with evidence. No code changed. Jordan decides which findings
become fix tasks.

**2. Schemas.** One Zod schema per collection, written from the content files as they
are, not from `agent/content-model.md` alone (rule 1). A validator runnable without a
full build (`npm run validate:content` or similar) that reports every failing file
with the field and the reason. It is run against all existing content, and the
results are reported with denominators: "events: 41 of 43 pass." Files that fail are
listed for Jordan. They are not fixed in this task, because content is frozen; and
the schema is not loosened to make them pass without saying so. Where the schema and
the content model document disagree, the report says which one the schema follows
and why. This task needs a dependency decision (rule 8): confirm what `@nuxt/content`
v2 supports for typed collections in the installed version before proposing an
approach, and ask.

**3. Components.** One component family per PR: cards, then heroes, then filter
chips, then prose blocks. Each PR compares rendered HTML against `main` and explains
every difference. Team cards go last within cards, and their PR names footgun 4 in
the visual review request.

**3b. Visual baseline.** Open decision: Playwright screenshots in the repo, or a
hosted service. Ask Jordan. Whichever is chosen, capture every route in
`agent/reconcile.md`'s route list at 390px and 1280px from `main`, before task 4
starts. Task 4 does not start without it.

**4. Tailwind migration.** One route section per PR. Within a section, grids first.
Each PR: screenshots compared against the baseline, the reviewer's before-and-after
column table, and a visual review request. `.rgrid` rules are removed from
`global.css` only in the final PR, after a search shows zero remaining uses, with
the count stated.

**5. Linting and CI.** ESLint for Vue, a GitHub Actions workflow running
`verify.sh --build` and the content validator on every PR. A built-site link check
(every internal `href` in `.output/public` resolves to a file) belongs here.

**6. Accessibility.** An audit report first, as its own PR with no fixes. Fixes
follow in separate PRs by category, because contrast fixes change what visitors see
and need Jordan's eye on the design tokens.

## Open decisions (Jordan)

- Who reviews agent PRs, and how fast? Slow review means fewer, larger PRs.
- Does the SE team see Phase 1 while it runs?
- Visual regression tooling (blocks 3b and therefore 4).
- Known duplicate sources of truth, to resolve when content unfreezes: member
  institutions are hardcoded in both `about/membership.vue` and the `hire-cuahsi`
  lookup; team data is split between `full-team.json` and per-person `.md` files.
- Redirects are page stubs (`definePageMeta`), not server `routeRules`. Leave until
  asked.

## Noticed

Append-only. Things seen outside the task in hand. One line each: date, file, what.

261003 | pages/community/news/index.vue | uses colors outside the design tokens (#1D9E75, #9ca3af, #6b7280, #f3f4f6) and links to /highlights, a redirect stub
261003 | pages/about/team/index.vue | cards are clickable via @click and $router.push on a div, not a link; not keyboard-reachable
261003 | repo root | `dist` symlink is tracked despite `dist/` in .gitignore; `nuxt generate` also moves public/robots.txt to public/_robots.txt (restored by hand after the reconcile build)
261003 | pages/community/index.vue | CONFIRMED in built HTML: the "latest news" list on /community shows newsletter issues ("July 2026 e-Newsletter", "June 2026 e-Newsletter") because of the unfiltered queryContent('news'). Two separate builds of the same code listed different items there, so the list is also not stable between builds (cause not investigated). Fix planned in task/community-news-filter.
261003 | pages/community/index.vue | dates in "Latest news" render one day early in the built HTML ("Jun 30, 2026" for a 2026-07-01 item, "May 31" for 06-01, "Apr 22" for 04-23), also in the main build. Likely a UTC-versus-local-time issue in fmtDate at build time; not investigated.
261003 | assets / build | the Tailwind CSS inlined in every page contained 8 invalid rules generated from DOI text in content/team/tony-castronova.md (".[doi:10.1016/...]{doi:...}") in both main-based builds, and none in two builds of the task/community-news-filter branch; why is not known. Harmless as far as I can tell (the property "doi" is invalid), but it means inline CSS differs by 631 bytes per page between those builds.

