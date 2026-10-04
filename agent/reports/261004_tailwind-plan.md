# Plan: roadmap task 4, inline styles to Tailwind (retire `.rgrid` / `--cols`)

Written 4 October 2026 on `task/tailwind-migration`. **A plan only: nothing has been migrated.** Per CLAUDE.md, task 4 waits for Jordan's approval of this plan.

## What there is to migrate (counted from the files today)

| | Count |
|---|---|
| Template files with inline styles (`pages/` + `components/` + `app.vue`) | 37 files |
| Static `style="..."` attributes | **903** (65 different CSS properties; the most used: `color` 467, `font-size` 298, `padding` 229, `font` shorthand 202, `margin-bottom` 185) |
| Dynamic `:style="..."` bindings (template strings built from data) | 36 |
| `.rgrid` elements (`rgrid-multi` and `rgrid-split`, counted in the templates) | 40 elements in 21 files |
| Older `.rg-2 / .rg-3 / .rg-4 / .rg-intro` classes (desktop-first media queries in `global.css`) | 9 uses in 6 files |
| `.site-container` (23 uses) and `.hero-section` (6 uses) | custom classes; fine to keep |

By section (static styles / `.rgrid` elements): community 390 / 15 (9 files), about 149 / 9 (7), home 86 / 6 (1), components 82 / 2 (8), learn-train 77 / 6 (4), hire-cuahsi 48 / 0, data-platforms 23 / 1, support 23 / 1, member-portal 16 / 0, contact 8 / 0, app.vue 1 / 0. The largest single files: `community/index.vue` 89, `index.vue` 86, `community/campus-visits` 69, `community/events/[slug]` 62.

## The approach

1. **Convert by hand, one route section per pull request**, using the tokens already in `tailwind.config.ts` (colours `ink navy water clay paper sand muted…`, fonts `font-display / font-body / font-mono`, radii `rounded-card / rounded-btn / rounded-chip`, `max-w-site`) and Tailwind arbitrary values for the rest (`text-[15px]`, `p-[14px_16px]`, `leading-[1.65]`). The `font:700 18px/1.3 'Schibsted Grotesk'` shorthand (202 uses) becomes `font-display font-bold text-[18px] leading-[1.3]`.
2. **Grids:** `rgrid rgrid-multi` / `rgrid-split` + `--cols` become plain grid utilities. The 640px and 900px steps map to `sm:` and an arbitrary `min-[900px]:` variant, so **no change to `tailwind.config.ts` is needed**. The old `.rg-*` classes go the same way.
3. **Dynamic `:style` bindings (36) stay** unless one is trivially static (they depend on data, e.g. a category colour); the final PR lists what is left, with the reason for each.
4. **`.rgrid`, `.rg-*` and the `--cols` rules are deleted from `global.css` only in the last PR**, after a search shows zero uses, with the count stated (as the roadmap says).
5. `tailwind.config.ts`, `nuxt.config.ts`, `package.json` and `netlify.toml` are **not changed** by this plan. If one turns out to be needed, I stop and ask (rule 8).

## How "no change" is proved (the part I think matters most)

The roadmap's tools for this task are the visual baseline (task 3b, 52 images of 26 page types) and the reviewer. Those catch a lot, but they do not cover the other 95 pages, hover or focus states, or sub-pixel changes below the threshold of a screenshot. Because I now have a real browser, I propose a **stricter gate**, built first, as PR 0:

- **A computed-style comparison** (`scripts/style-compare.mjs`, run directly with `node`, no `package.json` change): for every one of the 121 pages at 390px and 1280px, record the computed style of **every element** (about 60 properties) from a build of `main`, then from the migrated branch, and diff them element by element. A migration PR must show **0 differing elements** except a short list of declared, intended differences (below). Moving inline styles to classes does not change the DOM structure, so elements pair up one to one.
- **`npm run visual:compare`** must still pass at 52 of 52 (zero pixel tolerance). No image is re-written in a migration PR.
- **Declared deviations** (listed in each PR if they appear): the `font-family` string, because `font-display` adds a `sans-serif` fallback that the inline shorthand did not have (same font when it loads); anything else needs a stated reason.
- The reviewer subagent on each diff, as always, with its report unchanged in the PR.
- **Not covered by any of this:** hover, focus and pressed states (no interaction in the snapshot). I rely on the existing hover rules staying as they are, and I list the hover and click checks for you in each PR's visual review list.

## The pull requests (11, smallest and lowest risk first)

| PR | Content | Static styles | Notes |
|---|---|---|---|
| 0 | `scripts/style-compare.mjs`, the baseline snapshot procedure, notes in CLAUDE.md. **No site change.** | 0 | Proves the gate on `main` against itself (0 differences) and against a deliberate one-property change (must fail). |
| 1 | `components/` (8 files) + `app.vue` | 83 | Header, footer, search, cards: shown on every page. |
| 2 | `support`, `contact`, `member-portal` | 47 | Small pages. |
| 3 | `data-platforms`, `hire-cuahsi` | 71 | Hire has a form and a scoped style block. |
| 4 | `learn-train/*` (4 files) | 77 | |
| 5 | `about/*` (7 files) | 149 | |
| 6 | Home `index.vue` | 86 | The most visible page; includes the gauge card. |
| 7 to 9 | `community/*` in three parts: (a) `index` + `campus-visits`, (b) `events` + `jobs`, (c) `news` + `newsletter` | 390 | The largest section, split so each is reviewable in a sitting. |
| 10 | Delete `.rgrid`, `.rg-*`, `--cols` from `global.css` after a search shows zero uses; list the remaining dynamic styles | 0 | Last. |

Each of PRs 1 to 9 carries a visual review list (5 to 8 routes at 390px and 1280px, with hover and click checks) in plain language. If eleven reviews is too many, PRs 2 to 5 could be merged into two bigger ones; the cost is a longer review each.

## Risks I can see

- **Specificity.** An inline style beats any class; a utility class does not. A rule like `.hero-section { padding-top: 44px !important }` still wins as before, but places where an inline style currently *overrides* a global class could flip. The computed-style comparison is what catches this, so it is built first.
- **The `font` shorthand resets** `font-style`, `font-variant` and `line-height`, which the separate utilities do not; I will include the resets where an element sits inside italic or otherwise styled text. The same gate catches misses.
- **A mistake in a scripted bulk edit** broke the build once in this project's history (CLAUDE.md, footgun 9). The plan is to convert **by hand**, file by file, with `verify.sh` after each file; no codemod. That is slow (903 attributes), and I would rather be slow than wrong.
- **Class-name bloat and Tailwind scanning:** class strings are built statically, so Tailwind's scanner finds them. I will not build class names from variables.

## Decisions for you

1. Approve the plan, the order and the gate (or change any of them).
2. Is eleven PRs acceptable, or do you prefer fewer, larger ones?
3. OK with the one declared deviation (`font-family` fallback)? The alternative is to keep each font exactly as written with arbitrary values, which is uglier but byte-identical.
4. Dynamic `:style` bindings stay as they are unless trivial: OK?

Nothing starts until you answer. PR 0 (the comparison tool) is the first step and changes no page.

## Jordan's answers (4 October 2026) and the revised PR list

The decisions above were answered as follows.

1. Plan, order and gate: **approved.**
2. **Fewer PRs preferred.** The eleven become **four**, still smallest and lowest risk first:
   - **PR 1:** the computed-style comparison tool (`scripts/style-compare.mjs`), plus `components/`, `app.vue`, `support`, `contact`, `member-portal`, `data-platforms`, `hire-cuahsi` (about 200 inline styles).
   - **PR 2:** `learn-train/*` and `about/*` (226).
   - **PR 3:** home, `community/index` and `community/campus-visits` (244).
   - **PR 4:** the rest of `community/*` (events, jobs, news, newsletter; 232), plus the deletion of `.rgrid`, `.rg-*` and `--cols` after a search shows zero uses, and the list of remaining dynamic styles.
3. The `font-family` fallback difference: **accepted.**
4. Dynamic `:style` bindings stay unless trivial: **yes.**

## Update during PR 1 (4 October): the font-family deviation was dropped

Jordan accepted a `font-family` fallback difference (the `font-display` / `font-body` tokens add `sans-serif`). PR 1 showed it is not invisible: glyphs missing from the web fonts, such as the arrows and ticks in links, draw from a different fallback font, and 5 screenshots changed by 11 to 567 pixels. PR 1 therefore uses the exact family (`font-['Hanken_Grotesk']`, `font-['Schibsted_Grotesk']`) and the style comparison no longer ignores any font-family difference. The only declared difference left is that the style and colour of a border side with zero width are ignored, because it draws nothing.
