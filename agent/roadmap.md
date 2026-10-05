# Phase 1 roadmap

(The Phase 2 roadmap is at the end of this file. The Phase 1 acceptance text below is kept as it was written.)

Tasks in order. Do not start one unprompted. Update Status on the task's own branch.
Status values: `not started`, `in progress`, `PR open`, `merged`, `blocked: reason`.

| # | Task | Status | Risk |
|---|---|---|---|
| 1 | Reconcile repo against the verify-first list | merged | none (read-only) |
| 2 | Zod schemas (`scripts/content-schemas.mjs`) plus a standalone validator (`npm run validate:content`) | merged | low |
| 3 | Extract repeated markup into components | merged | medium |
| 3b | Visual baseline: screenshots of every route before task 4 | merged | low |
| 4 | Inline styles to Tailwind; retire `.rgrid` / `--cols` | merged (4 PRs: #24, #27, #28, #29) | **highest** |
| 4b | Dependency audit report (read-only): the 36 `npm audit` findings, sorted by whether they reach the built site | merged | none (read-only) |
| 5 | Linting and CI, with `verify.sh` as a required check | merged (workflow, link check, validator; ESLint template-only, PR #31). "Required" is a GitHub setting for Jordan; not checked here | low |
| 6 | Accessibility audit: contrast, semantic HTML, ARIA | in progress (audit, keyboard and semantic fixes, and contrast fixes merged; leftovers in the Noticed list) | medium |

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
and why. The validator is run on demand and is not part of `verify.sh` (see task 5).
*Correction:* this task originally said `content.config.ts` and asked to confirm what
`@nuxt/content` v2 supports for typed collections. It supports none: the installed
2.13.4 has no collections or schema support (`content.config.ts` and `defineCollection`
belong to Content v3), so a `content.config.ts` would be ignored. The schemas are
therefore plain Zod in `scripts/`, checked by the validator, and nothing enforces them
at build time. `zod` and `yaml` were added as pinned devDependencies with Jordan's
approval (rule 8).

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

**4b. Dependency audit.** `agent/reports/YYMMDD_dependency-audit.md`. Read-only. `npm audit`
reported 36 findings on 261003 (4 low, 3 moderate, 25 high, 4 critical). For **each**
finding: the package, the advisory, and how it got into the tree (which direct dependency
in `package.json` pulls it in). Then two answers, with the evidence for each:
(a) does the package end up in the built static site (anything in `.output/public`, or
anything that runs in the visitor's browser or shapes the prerendered HTML), or is it build
tooling only (installed on the build machine, never shipped); and (b) does a fix exist
without leaving Nuxt Content v2: a patched version inside the semver range already allowed
by `package.json`; a patched version that needs a major bump of some direct dependency (and
say whether that bump would take the project off Content v2, for example a new major of
`@nuxt/content`, or off Nuxt 3, or neither); or no fix yet. Report counts with denominators (for example "N of 36 reach the built site"), and say which
findings you opened in full (rule 12). The Nuxt MDC advisory GHSA-cj6r-rrr9-fg82 is one of
the 36; the others are not yet looked at. **No upgrades in this task**: no `npm audit fix`,
no change to `package.json` or the lockfile. Any upgrade is its own task and needs Jordan's
approval first (rule 8).

**5. Linting and CI.** ESLint for Vue, a GitHub Actions workflow running
`verify.sh --build` and the content validator on every PR. A built-site link check
(every internal `href` in `.output/public` resolves to a file) belongs here. The
content validator (`npm run validate:content`, built in task 2) is deliberately left
out of `verify.sh` until then; it gets wired into `verify.sh` in this task.

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
- Upgrade to Nuxt Content v3. Not proposed. It is the only route to build-time schema
  enforcement (`content.config.ts` collections). It is a major-version upgrade that
  would touch every `queryContent()` call (32 calls in 19 files, counted by searching
  for the text `queryContent(` and leaving out two comment lines), how the JSON files
  are loaded, and the shape of the data pages receive.
- Search on phones: the header shows the search button only at the `md` breakpoint and up (`components/AppHeader.vue`, the desktop actions block), so phones have no way to open search. Jordan: acceptable for now. Revisit when the header is next changed; adding it means a change to `AppHeader.vue` and its mobile menu.
- Cyberseminar transcripts and descriptions: per-seminar pages with the text in the static HTML, versus an on-click panel. Decide in Phase 2 after the 9 files are repaired.
- Deferred, cyberseminar transcript timestamps: fix `scripts/fetch-transcripts.mjs` so it writes real times. All 733 paragraph timestamps in the 7 transcript files read `NaN:NaN`, and the script builds them from `seg.start`, probably the wrong field (unverified). Depends on: Phase 2 (the regenerated files are content, in `content/` and `public/`), Jordan's approval of two new dependencies, `youtube-transcript` and `gray-matter` (rule 8), and network access.
- Deferred, cyberseminar follow-in-time sync (the transcript following the video). Depends on: the timestamp fix above, the transcripts-and-descriptions decision above, and a decision about loading the YouTube IFrame Player API, a script served from youtube.com.
- Rename research and cyberseminar files to `YYMMDD-`: one bulk task, only after checking that no query or link depends on the file name or path. (Until then new research files use `YYYY-slug.md`, C13.)

## Noticed

Append-only. Things seen outside the task in hand. One line each: date, file, what.

261003 | pages/community/news/index.vue | uses colors outside the design tokens (#1D9E75, #9ca3af, #6b7280, #f3f4f6) and links to /highlights, a redirect stub
261003 | pages/about/team/index.vue | cards are clickable via @click and $router.push on a div, not a link; not keyboard-reachable
261003 | repo root | `dist` symlink is tracked despite `dist/` in .gitignore; `nuxt generate` also moves public/robots.txt to public/_robots.txt (restored by hand after the reconcile build)
261003 | pages/community/index.vue | CONFIRMED in built HTML: the "latest news" list on /community shows newsletter issues ("July 2026 e-Newsletter", "June 2026 e-Newsletter") because of the unfiltered queryContent('news'). Two separate builds of the same code listed different items there, so the list is also not stable between builds (cause not investigated). Fix planned in task/community-news-filter.
261003 | pages/community/index.vue | dates in "Latest news" render one day early in the built HTML ("Jun 30, 2026" for a 2026-07-01 item, "May 31" for 06-01, "Apr 22" for 04-23), also in the main build. Likely a UTC-versus-local-time issue in fmtDate at build time; not investigated.
261003 | assets / build | the Tailwind CSS inlined in every page contained 8 invalid rules generated from DOI text in content/team/tony-castronova.md (".[doi:10.1016/...]{doi:...}") in both main-based builds, and none in two builds of the task/community-news-filter branch; why is not known. Harmless as far as I can tell (the property "doi" is invalid), but it means inline CSS differs by 631 bytes per page between those builds.
261003 | assets / build | follow-up to the line above: builds of identical code differ in two CSS details. Across 6 local builds (junk DOI rules / extra stylesheet link to StatsBand.*.css on /, /about/impact, /data-platforms, /learn-train): main before news-grid 8/1, news-grid 8/1, community-news-filter 0/1 (twice), same code with the stray files present 0/1, same code with them deleted 8/0. The junk rules appear in some builds and not others with the 33 stray files present (8 in two builds, 0 in three), so they are not caused by deleting them; cause not found, possibly local cache state (.nuxt, node_modules/.vite). The extra stylesheet link is absent only in the one build made without the stray files; with one build per state it is NOT shown whether the deletion caused it (cuahsi-site/components/StatsBand.vue, a component with the same name, was among the deleted files). The CSS rule sets on the four affected pages are identical apart from the 8 junk rules (231/231 rules, 230/230 on /learn-train).
261003 | assets / build | update to the line above: a second build with the 33 stray files deleted has the StatsBand stylesheet link (and no junk DOI rules), the same as builds with the files present. So both details vary between builds in the same file state and the deletion did not cause the missing link. Cause of the variation still not found.
261003 | content/cyberseminars/ | 9 of 15 files have no closing --- line, so the site reads no fields from them: in the built site's data they have no published, slug, date or series, and a title made from the file name. Details and the full validator results are in agent/reports/261003_content-validation.md (task/content-schemas). Content is frozen; reported only.
261003 | repo / npm | `npm audit` reports 36 vulnerabilities in the installed tree (4 low, 3 moderate, 25 high, 4 critical), including a Nuxt MDC XSS advisory (GHSA-cj6r-rrr9-fg82). Not investigated and not changed; zod and yaml (added in task 2) were not named in what I saw. Upgrading would be a dependency change (rule 8).
261003 | pages/learn-train/cyberseminars/index.vue | read-only investigation of the reported "cards don't expand correctly" on the 6 cards that show (no branch, nothing changed). WHAT THE CODE DOES: one card per `published: true` seminar (the series are only filter buttons); clicking the thumbnail area (only that area) sets `expanded` to the card's slug, one card at a time, and clicking again closes it; when expanded and `youtube_id` is set, a youtube-nocookie iframe with autoplay appears BELOW the thumbnail, the thumbnail stays, and the play overlay is hidden. FIELDS IT DEPENDS ON: `slug` (the card key and the expanded id), `youtube_id` (thumbnail, overlay, iframe); `has_transcript` only draws a "TRANSCRIPT ✓" badge; `description`, `tags` and the 7 transcript files are not shown anywhere on the site. THE 6 PARSING FILES: all have `published: true`, unique slugs, an 11-character `youtube_id` and `has_transcript: true`; all 6 YouTube thumbnails and oEmbed lookups returned 200 when fetched; netlify.toml sets no CSP. VERDICT: the content looks clean for what the code uses and the code does what it says, so I cannot reproduce "does not expand correctly" without knowing the symptom. Candidates from reading the code, NOT verified on a screen: expanding adds a video under an unchanged thumbnail, and cards in the same grid row stretch to match the taller one; expanding shows no description or transcript although the badge and the hero text ("many with full transcripts") suggest it; clicking the title or body does nothing. FOOTGUNS: 1 not triggered (the transcripts/ folder shares the cyberseminars prefix, but its JSON files have no `published` key so the filter excludes them); 4 not triggered (cards keyed by slug, slugs unique); 2, 5, 6, 7 and 9 not applicable; 3 unverified, build clean. SEPARATE, from the code: the cards print `{{ s.date }}` unformatted, and all 6 parsing files store dates as full ISO strings, so the card likely reads "2023-10-12T00:00:00.000Z" (inferred, not seen). Needs from Jordan: what is seen when a card is clicked.
261003 | components/SiteSearch.vue | added unchanged from the file Jordan supplied (task/site-search). Deferred, not changed: all styling is inline with off-token greys, so it belongs in the Tailwind migration (task 4); accessibility gaps (no dialog role or label, no focus trap, placeholder-only input, results are buttons not links) belong in task 6; the header shows the search button only at md and up, so phones have no way to open search (a design decision, and a change to AppHeader); the Cmd/Ctrl+K handler is registered on every page and the button shows the Mac symbol on all platforms.
261003 | netlify.toml | the build command is `npm run generate` (nuxt generate only), so Pagefind never runs on Netlify and the search index does not exist on the deploy preview or production; `npm run build:search` would build it. Needs Jordan's approval (rule 8). Raised in task/site-search.
261003 | netlify.toml | UPDATE to the entry above: the build command is changed to `npm run build:search` in task/site-search (Jordan approved, rule 8), pending merge. First real test is the Netlify deploy preview of that PR; reverting is one line.
261003 | README.md | says the site is deployed via Cloudflare Pages (line 3) and lists Cloudflare Pages build settings (lines 316-317); the site deploys to Netlify (CLAUDE.md, netlify.toml). Not edited (outside the task in hand).
261003 | pages/learn-train/cyberseminars/index.vue | UPDATE to the cyberseminar-cards entry above, after Jordan's report of what he sees: he clicks a thumbnail and the card expands down, "but it is small", and he cannot read the transcript; he expects it large with a transcript to follow in time. Findings (details in the eval log): (1) the embed is only as wide as the card, about 375 px wide on a 1280 px screen, by design of the markup: code; (2) no page shows transcripts at all, only a badge: code; (3) all 733 paragraph timestamps in the 7 transcript files are "NaN:NaN", so follow-in-time cannot work from the current files; scripts/fetch-transcripts.mjs reads `seg.start`, which is probably the wrong field (unverified); regenerating them is a content change and needs two dependencies. Fix tasks proposed to Jordan in the session; none started.
261003 | public/robots.txt | FOOTGUN, a build modifies a tracked file. The @nuxtjs/robots module (4.1.11) moves the tracked public/robots.txt (its content is `User-agent: *` and `Disallow: /`) to public/_robots.txt whenever the site is built, and prints "Your robots.txt file was moved to ./public/_robots.txt to avoid conflicts." The build still passes, but the tree is left dirty (`D public/robots.txt` and `?? public/_robots.txt`) after every build, and nothing in verify.sh notices it. The file is crawler-facing, so committing the deletion or the _robots.txt copy by accident would change a file linked from outside the site (rule 8). Today it is restored by hand before each commit and files are staged by name, which will eventually be forgotten. Seen after every build in the session of 261003; it also came back once after a restore while no build of the agent's was running (possibly Jordan's own `nuxt dev`; unverified). The built site still contains both robots.txt and _robots.txt. Jordan asked (261003) for a small follow-up task after the cyberseminar-card PR merges: record it under Known footguns in CLAUDE.md and list the options for stopping the build dirtying the tree. Not started.
261003 | components/CyberseminarCard.vue | accessibility, left for task 6: a seminar cannot be opened with the keyboard (the thumbnail is a click-only div, not a button, with no role, tabindex or key handler); focus is not moved when a card opens or closes, so after Close it is lost; the open card hides the TRANSCRIPT badge. Found by the reviewer of task A; the Close button is a real button.
261003 | pages/learn-train/cyberseminars/index.vue | the `expanded` state (one slug) survives the series filter: expand a card, click a series that hides it, click All, and the card returns open with its autoplay iframe, so the video starts on its own. Existing behaviour, more noticeable now that the open player is large (task A). A one-line reset when the series changes would fix it; not done (the page is not part of task A). Also: `tags` and `selectedTag` are declared but unused in the template.
261003 | pages (heroes) | the 17 gradient-band page heroes differ in small ways: the band's own style is identical in all, but the container has 9 distinct style values, the heading 13 and the lead paragraph 14 (four heading sizes). On phones: 6 pages use site-container (side padding 20px) and 11 use a fixed 40px; 5 use hero-section (tighter top and bottom padding under 640px) and 12 do not. So the same band is padded differently on phones depending on the page. Not changed; whether to normalise it is a design decision (see the heroes plan, task 3) and a visible change, so not part of a behaviour-preserving extraction. components/CommunityHero.vue is unused.

261003 | pages (filter chips) | none of the filter chips on the 5 pages has aria-pressed (or any aria attribute or type), so a screen reader is not told which chip is selected. Not changed: adding it changes the markup, which is a second concern for a later PR. Since the chips now share components/FilterChip.vue, it is a one-place change.
261003 | pages/index.vue (home) | the 'Latest recording' card prints the raw ISO date '2025-12-10T00:00:00.000Z' (line 246 prints latestSeminar.date directly; the other dates on this page use fmtDate). Found in the first screenshot of the visual-baseline trial, not by any earlier check. Not fixed: outside task 3b, and a visible change.
261004 | components/CyberseminarCard.vue | each cyberseminar card prints the raw ISO date ('2025-12-10T00:00:00.000Z') instead of a formatted one (line 53 prints seminar.date). All 6 cards on the cyberseminars page show it in the visual baseline. The card was extracted from the page with identical output, so the defect predates the component. Same kind of defect as the home-page 'Latest recording' card (noted above). Not fixed: a visible change outside task 3b; fixing either changes the committed baseline images for those pages, by design.
261004 | contrast | after the contrast fixes, 263 of 10,076 text runs on 121 pages still fall below WCAG AA: decorative arrows and the Cmd+K hint (153), past events shown dimmed with opacity (48 plus the dimmed type pills), the clay accent #C0603C used for small labels and prices (42; 4.04:1 on paper, 3.65 on sand), the ORCID badge (5). The clay accent is a brand colour and a tailwind.config token (rule 8), so darkening it for small text is Jordan's decision.
261004 | pages/community/events/index.vue | on the built page at 1280px the single upcoming event is laid out as a full-width grey bar with the date centred, then the title block and a faint arrow below it, unlike the past list where the date sits to the left of the title. Looks like the upcoming row's layout is not as intended. Not changed.
261004 | dev server | npm run dev fails with 'spawn EBADF' from esbuild on Jordan's machine and on mine; see the eval log (261004, task/a11y-contrast). Preview a build instead: npm run build:search and npx serve .output/public -l 4000.
261004 | components/AppFooter.vue | the footer links (BLUESKY, YOUTUBE, LINKEDIN and the Explore, Tools and Connect lists) carried a hover:text-white class that never worked, because an inline colour overrode it. When the Tailwind migration moved the colour into a class I removed the dead hover classes so behaviour stays identical. If white-on-hover is wanted, it is a one-line, visible change. Also: PageHero now renders empty style="" attributes on the container, heading and lead of the migrated pages (harmless); they go when its old *-style props are removed in the last migration PR.
261004 | components/CommunityHero.vue | unused (no page renders it) and still has 7 inline styles; the Tailwind migration leaves it alone because the style comparison cannot see it. Delete it or migrate it in the last PR.
261004 | pages/learn-train/archive/index.vue, pages/about/index.vue, pages/about/impact/index.vue | the hover colour classes on the past-workshop titles and on the About/Impact sub-navigation links never worked (an inline colour overrode them). Tailwind PR 2 removed the dead classes so nothing changed; if a hover colour is wanted it is a visible, one-line change in a separate PR. Same family as the footer links already noted.
261004 | pages/index.vue | the upcoming-events title links on the home page had a hover:text-water that never worked (an inline colour overrode it). Tailwind PR 3 removed the dead class so nothing changed; a hover colour is a visible, separate, one-line change. Same family as the footer links, the past-workshop titles and the About sub-navigation.
261004 | .claude/agents/reviewer.md | the reviewer checklist still contains a line about '.rgrid use missing rgrid-multi or rgrid-split'. The .rgrid classes were deleted in Tailwind PR 4, so the check is dead, and nothing in the checklist looks for the new grid pattern (grid-cols-[1fr] plus sm:/min-[900px]: variants). Left alone because it is the reviewer's own instruction file; Jordan to decide.
261004 | README.md | UPDATE to the 261003 Cloudflare Pages line: the two stale hosting statements are corrected by the PR from task/readme-netlify (true once it is merged). One 'e.g. Cloudflare Access' example remains at README.md line 55 (an example for gating /member-portal, not a hosting claim); left for Jordan. The README still says to start with npm run dev, which fails on Jordan's machine and mine (see the 261004 dev server line).
261004 | pages/learn-train/cyberseminars/index.vue | UPDATE to the 261003 'expanded state survives the series filter' line: fixed in task/seminar-filter-reset.
261004 | pages (dates) | UPDATE to the 261003 line 'dates in Latest news render one day early': cause found and fixed in task/fix-date-timezone. 14 pages formatted date-only content dates in the running machine's time zone; US visitors saw a day early after the page loaded, and builds on a US machine baked it into the HTML. The 26 visual baseline images that showed day-early dates were re-written in that branch.
261004 | public/robots.txt | UPDATE to the 261003 robots.txt footgun line: fixed by moving the source to assets/robots.txt in task/robots-txt (true once merged); CLAUDE.md footgun 11 and a verify.sh check added.
261004 | pages/index.vue, components/CyberseminarCard.vue | UPDATE to the two raw-ISO-date lines: fixed in task/iso-date-cards.
261004 | .claude/agents/reviewer.md | line 21 says any path under content/ is a finding. In Phase 2 every content task would be flagged. The file is protected (permission rules deny edits under .claude/), so Jordan has to change it: for example 'a path under content/ is a finding unless the branch is a content task (task/content-...)'. Same file as the dead .rgrid checklist line noted earlier.
261004 | visual tests | the screenshot suite fails one or two tests in the first run after a build, each time a test that took about 11 s instead of about 2 s (about-membership 390; about and about-governance 1280); reruns pass. Probably a slow first load on a busy machine; the tests wait for images and fonts but not for the machine to catch up. Not fixed (playwright.config.ts / tests/visual are not rule-8 files; a longer wait or one retry is a candidate).
261004 | content/events/ | two apparent duplicate events (visible as repeated rows on /community/events): WaterSoftHack 2026, 20 Jul, in 260701-watersofthack.md (slug watersofthack-2026) and 260720-watersofthack-2026.md (slug watersofthack-2026-july); and the 24 Jun open house in 260601-virtual-open-house.md ('CUAHSI Virtual Open House', slug virtual-open-house-2026) and 260624-spring-virtual-open-house.md ('CUAHSI Spring Virtual Open House', slug spring-virtual-open-house-2026). Both pairs have different slugs, so each has its own page and URL; removing one would break a URL (rule 8) and the slugs may be linked from newsletters. A Phase 2 content question for Jordan, not touched.
261005 | .claude/hooks/guard.mjs | line 36 blocks any git command that sends commits to a remote when the command text contains the whole word for the default branch (or its older name) anywhere, so a content branch named like `content/<that word>-page-fix` could not be sent, and a command whose commit message or PR title merely contains the word is blocked too (seen several times on 5 October). Jordan's file; not touched. Workaround so far: keep those words out of branch names and split commands.
261005 | .github/workflows/verify.yml | the first comment line says the content validator's known failures stay a warning and extra ones fail. After the known-failures list was deleted any non-zero validator exit is a FAIL, so the comment is untrue. Comment only, no behaviour depends on it; not edited because Jordan said not to change CI. Also .claude/agents/reviewer.md check 1b still lists the known-failures file as an allowed extra (Jordan's file by convention).
261005 | visual baselines | the baseline images of /, /community/, /community/events/, /community/events/agu-bridges-deadline-2026/ and /learn-train/archive/ depend on the date the site is built: pages/community/events/index.vue splits events into upcoming and past with new Date() (read in code). They match only while no event date passes, so with events on 6, 8 and 19 October the comparison will start failing day by day with no code or content change. Fix would be a code PR that freezes the clock in tests/visual. Also observed on 5 October: the pixel comparison flaked on about-membership and home (a failure that did not reproduce on rerun; 3 flaky failures over 5 runs); cause not investigated. Not fixed here.
261005 | pages/community/events/[slug].vue and index.vue | both format event dates with timeZone UTC (read in code; confirmed on a built page), so an event that crosses midnight UTC shows the next day on its detail page: a 6 to 9 pm PST event on 9 December rendered as Thursday, December 10 (the list said Dec 9). Worked around in content by making that one event date-only. A code PR should format in the event's own timezone. Not fixed here.
261005 | visual baselines | correction to the 261005 baseline entry above: the dates that flip the date-dependent pages also include 15 October (AGU Bridges deadline, already in the content), and an event with a time flips at that moment, not at midnight. Which pages use the events list was not read for home, community and learn-train/archive; I know only that their screenshots changed when events were added.

# Phase 2 roadmap (content agent)

Phase 2 was opened by Jordan on 4 October 2026. Content changes go on `content/short-name`
branches under the content rules in CLAUDE.md (C1 to C13). The guard hook and permission
setting that blocked edits to `content/` were unlocked by Jordan on 5 October 2026
(`PHASE = 2`; deny rule removed; the commit reaches the default branch through the unlock PR). The hook
does not check branch kind, so content-versus-code separation rests on the guardrails in
`verify.sh` (branch kind, deletions, slugs, `people_mentioned`) and review.

| # | Task | Status | Notes |
|---|---|---|---|
| P2.0 | Phase 1 evaluation summary | in the P2.1 PR | `agent/reports/261004_phase1-evaluation.md` |
| P2.1 | Integrate the Phase 2 rules, branch checks and roadmap | merged (#43; P2.0 report included) | CLAUDE.md rules 3 and 4, C1 to C13, `verify.sh` branch checks |
| P2.2 | Unlock: Jordan edits the two protected files | merged (#44) | the commit was made after #43 merged and reached the default branch through #44 |
| P2.3 | Content repairs: three PRs (member email, excerpts, cyberseminars) emptying the known-failures list | repairs merged (#45, #46, #47); known-failures list empty, validator exits 0 | `newsletter_source` optional on events (so a staff-submitted event can validate): this branch, `task/events-newsletter-source-optional`, PR open once pushed. `task/content-patches` (unpushed) is superseded by the three merged branches |
| P2.4 | Jobs: harvest and maintain `content/jobs/` | not started | A new job source (beyond `newsletter` and `joshswaterjobs`) needs a schema change first, as a code PR |
| P2.5 | Events and news from newsletters: decomposition per C9 | not started | propose, then apply |
| P2.6 | Decision backlog from Phase 1 (below) | not started: Jordan | |
| P2.7 | Editing workflow for staff | not started | DecapCMS is mentioned in the handoff; not verified in this repo |

Decisions waiting for Jordan before P2.3 to P2.6: four YouTube IDs, two apparent duplicate
event pairs, which stories carry a tool's tag, his own LinkedIn URL on the team page,
cyberseminar transcripts, and the research file-name pattern (C13).

The three `people_mentioned` values that match no profile file (informational, not a repair
item; checked with `npm run validate:content` on 5 October 2026): `masoumeh-hashemi`
(newsletter 260101-january), `marco-maneta` and `punwath-prum` (newsletter 260201-february).

The known-failures file and its check were deleted on 5 October 2026 (`task/known-failures-cleanup`):
the validator must now exit 0 (C1).
