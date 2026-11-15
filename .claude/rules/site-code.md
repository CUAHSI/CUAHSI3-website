---
paths:
  - "pages/**"
  - "components/**"
  - "composables/**"
  - "assets/**"
  - "server/**"
  - "netlify/**"
  - "app.vue"
  - "nuxt.config.ts"
  - "tailwind.config.ts"
  - "scripts/**"
  - "public/**"
  - "tests/**"
  - "playwright.config.ts"
  - "eslint.config.mjs"
---

<!-- Split from CLAUDE.md on 14 November 2026 (org issue 124). Loaded by Claude Code when a matching file is read or edited. Other tools: AGENTS.md names this file. The footgun entries below are the symptom and the fix; the history of each is in docs/footguns.md under the same number. The sections after the footguns moved unchanged. -->

# Site code rules

## Known footguns

Each one built cleanly and was wrong. Symptom and fix here; the history (when, what was tried,
what is unverified) in `docs/footguns.md`. Check the changed files against every number.

1. **`queryContent('news')` also returns `/newsletter/` content.** Nuxt Content matches
   by path prefix, and `/newsletter/2026-06` starts with `/news`. Always filter, with the trailing slash:
   ```js
   const items = computed(() =>
     (allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))
   )
   ```
   Check every new `queryContent()` call for the same kind of collision. `npm run lint` fails
   `queryContent('news')` (any content folder name that starts another) in a file whose script has no `startsWith('/news/')`.
2. **`<component :is="cond ? 'a' : 'NuxtLink'">` renders but does not navigate.** Use explicit
   `v-if` / `v-else` with real `<a>` and `<NuxtLink>` tags. `npm run lint` fails a ternary `:is`, or one with the string `NuxtLink`, on `<component>`.
3. **Unverified: an apostrophe inside a static `style="..."` attribute.** Reported to crash the Vue
   compiler; not reproduced, and 231 such lines build. No check. If a build ever fails on a style
   attribute with an apostrophe, record the exact error in `docs/footguns.md`.
4. **Vue reuses DOM nodes across `v-for`, including `<img src>`.** A `:key` on a wrapping
   `<template v-for>` is not enough (Vue looks past the template to the rendered children). Symptom: the
   right content flashes, then a neighbour's replaces it. Use one stable keyed element per iteration. Do not switch
   element types mid-list.
5. **`findOne()` throws when nothing matches.** Always `.findOne().catch(() => null)`. `npm run lint` fails a `findOne()` not directly followed by `.catch`.
6. **`throw createError()` inside `setup()` breaks client-side navigation in dev.**
   Use a `notFound` computed that the template renders conditionally (as in
   `pages/community/news/[slug].vue`); `verify.sh` fails a `throw createError` in `pages/` or `components/`.
7. **Bare JSON arrays in `content/` get wrapped.** Nuxt Content warns and moves the
   array into `.body`. Unwrap: `Array.isArray(data.value?.body) ? data.value.body : []`. `npm run lint` fails a file
   that queries such a folder and has no `Array.isArray(... .body)` (per file; a query whose `.where()` asks for `_extension: 'md'` is not counted).
8. **`nitro.prerender.failOnError: false` is deliberate.** Without it, a dynamic-route
   404 aborts the whole build. Leave it.
9. **A bulk edit once corrupted a template literal and broke the build.** The backtick
   balance check in `verify.sh` exists because of it. See "Bulk edits" in `AGENTS.md`.
10. **Inline styles beat classes.** Turning an inline style into a Tailwind class changes an element
    that had a class and an inline value for the same property, and wakes classes that were dead under
    it (`hover:text-white` under an inline `color`). Use the exact arbitrary form when the inline style
    was exact: `grid-cols-N` is `minmax(0,1fr)`, not `1fr`; `items-start` is `flex-start`, not `start`;
    `antialiased` adds a property; the build adds `-webkit-backdrop-filter`. An old `font:` shorthand
    needs `leading-[normal]`, never with an explicit `leading-*` on the same element. For text that had
    a plain inline `font-family`, write `font-['Hanken_Grotesk']`, not `font-display` / `font-body`
    (their `sans-serif` fallback changes arrows and ticks). No pattern finds this: check with
    `node scripts/style-compare.mjs` and `npm run visual:compare`.
11. **A build modified a tracked file: `public/robots.txt`.** `@nuxtjs/robots` renames
    `public/robots.txt` to `public/_robots.txt` on every build or dev run. The source lives at
    `assets/robots.txt`; `verify.sh` fails if `public/robots.txt` exists.
12. **Not showing data on a page does not stop the site publishing it.** `@nuxt/content` v2 writes every
    content file, whole, into `/api/_content/*.json` in the static output (taking the emails off `/member-portal`
    left all 229 there). A field that must not be public has to be removed when the file is parsed
    (`server/plugins/strip-rep-emails.ts` does it for `content/members/reps.json`); `scripts/check-member-emails.mjs`
    (in `verify.sh --build`) fails the build on any member address (plain, %40 or &#64;) in `.output/public` or `.output/server`. The dev server serves `/api/_content/*` live; the plugin covers it, the check does not.
    The file is still in the repository, which is public.
13. **A page that compares dates with `new Date()` hydrates wrong.** The browser runs on a later day than
    the build, so a date that decides which list an item is in renders differently, and items keep the
    wrong tag colour. Take the time from `useState('<page>-rendered-at', () => Date.now())` and set it to
    the real time in `onMounted`, as the job board, the home page and the events pages do. Do not call
    `new Date()` inside a `computed` that picks what to render (a handler or a one-off format is fine). `npm run lint` fails
    a clock read inside `computed()` or `ref()`/`reactive()`, at the top of the script, in a callback that runs at once (`filter`,
    `sort`), or in a template expression; not one in a named helper, a handler or a callback that runs later (`onMounted`,
    `useState`). It does not see a computed that calls a helper which reads the clock. `components/GageCard.vue` is exempt in
    its script (reason in `eslint.config.mjs`).
14. **A `watch()` on a computed, placed above what the computed reads, crashes the page and the build passes.**
    `watch()` runs the computed at once, before the `const` it reads is declared. Put a `watch()` after the
    declarations it depends on (the end of `<script setup>` is safe), and run `npm run visual:compare` after
    any change to a page's script. `npm run lint` fails a `watch()` whose source reads, directly or through a computed or
    function, a `const`, `let` or class declared below it in the script, or in the function the `watch()` is in.
15. **`window.location.search` is empty in `onMounted` on a statically generated page, though the address bar has a query.**
    Read the query with `useRoute().query` inside `onMounted` (not in `setup`; footgun 13). Write the choice
    back with `router.replace({ query })`, not `history.replaceState`, so the router and the address agree on Back.
    Seen only with `npx serve`; the cause was not isolated and Netlify was not tried. `verify.sh` fails `location.search`
    (and `location['search']`, `{ search } = location`) in the site code, a comment included; it does not see `new URL(location.href)`.

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
