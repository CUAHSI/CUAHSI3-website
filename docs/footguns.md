# Known footguns, with their history

The full entries, moved unchanged from `CLAUDE.md` on 14 November 2026 (org issue 124). The
symptom and the fix of each, which is what an agent needs while editing, is in
`.claude/rules/site-code.md` under the same number and title; this file keeps the story: when it
was seen, what was tried, what is still unverified. A new footgun gets an entry in both
(see "New footgun" in `docs/procedures.md`). "See 'Bulk edit.'" in footgun 9 means "Bulk edits" in `AGENTS.md`.

## Known footguns

Every one of these cost real debugging time. Most failed silently; the third is unverified (see below), the eleventh printed a warning but left the tree dirty, the thirteenth hydrated with stale tag colours, the fourteenth crashed one page with a green build, and the fifteenth ignored the address on a page that otherwise loaded.

1. **`queryContent('news')` also returns `/newsletter/` content.** Nuxt Content matches
   by path prefix, and `/newsletter/2026-06` starts with `/news`. This put newsletter
   issues on the news page with broken URLs. Always filter, with the trailing slash:
   ```js
   const items = computed(() =>
     (allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))
   )
   ```
   Check every new `queryContent()` call for the same kind of collision. `npm run lint` fails
   `queryContent('news')` (any content folder name that starts another) in a file whose script has no `startsWith('/news/')`.
2. **`<component :is="cond ? 'a' : 'NuxtLink'">` renders but does not navigate.** The
   markup looks right and clicks do nothing. Hit twice. Use explicit `v-if` / `v-else`
   with real `<a>` and `<NuxtLink>` tags. `npm run lint` fails a ternary `:is`, or one with the string `NuxtLink`, on `<component>`.
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
5. **`findOne()` throws when nothing matches.** Always `.findOne().catch(() => null)`. `npm run lint` fails a `findOne()` not directly followed by `.catch`.
6. **`throw createError()` inside `setup()` breaks client-side navigation in dev.**
   Use a `notFound` computed that the template renders conditionally (as in
   `pages/community/news/[slug].vue`); `verify.sh` fails a `throw createError` in `pages/` or `components/`.
7. **Bare JSON arrays in `content/` get wrapped.** Nuxt Content warns and moves the
   array into `.body`. Unwrap: `Array.isArray(data.value?.body) ? data.value.body : []`.
   Since 15 November 2026 `npm run lint` fails a file that queries a folder holding a bare-array JSON file
   (the list is read from `content/`, subfolders included) and has no `Array.isArray(... .body)`. It works per file, as the
   footgun 1 rule does. A query whose first `.where()`, written directly on `queryContent()`, asks for `_extension: 'md'` is not counted.
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
12. **Not showing data on a page does not stop the site publishing it.** `@nuxt/content` v2 writes every content file, whole, into
    the static output (`/api/_content/cache.<id>.json`, `/api/_content/query/<hash>.json`) so pages can query it in the browser.
    Taking the member representatives' email addresses out of `/member-portal` left all 229 in those files. A field that must not
    be public has to be removed when the file is parsed: `server/plugins/strip-rep-emails.ts` does it for `content/members/reps.json`,
    and `scripts/check-member-emails.mjs` (run by `verify.sh --build`) fails the build if any address, in plain, %40 or &#64; form, or a
    row with an email key, is found in `.output/public` or `.output/server`. The dev server also serves `/api/_content/*` live; the plugin
    covers it too, the check does not.
    The file is still in the repository, which is public.
13. **A page that compares dates with `new Date()` hydrates wrong.** The build writes the page on the day it is built; the browser
    then runs the same code on a later day. Where a date decides which list an item is in (upcoming or past), the browser's first
    render differs from the server's, and Vue does not repair a differing `style` attribute (my reading; the fix removed the symptom, the mechanism was not isolated): an event kept the tag colour of
    the item that had been in its place (a workshop in green, a deadline in blue). It built cleanly and the visual baseline
    had the wrong colours in it. Fix: take the time from `useState('<page>-rendered-at', () => Date.now())` (the build's time on
    the server and for the first browser render) and set it to the real time in `onMounted`, as the job board, the home page
    and the events pages do. Do not call `new Date()` inside a `computed` that picks what to render. No `verify.sh` check:
    `new Date()` is also fine in a handler or a one-off format. Since 15 November 2026 `npm run lint` fails a clock read
    (`new Date()` with no argument, `Date.now()`) that runs while the page is set up: inside `computed()` or `ref()`/`reactive()`,
    at the top of the script (exported or not), in a callback that runs at once (`filter`, `sort`), or in a template expression
    other than an `@event` handler. A named helper, a handler, a method, and a callback that runs later (`onMounted`, `useState`,
    `watch`, `setTimeout`; the list is `later` in `eslint.config.mjs`) are not flagged. It does not see a computed or composable
    that calls a helper which reads the clock. The script rules exempt `components/GageCard.vue` (the whole file, so a new clock
    read there is not checked): its `ageHours` computed reads `Date.now()` only once a reading has loaded in the browser. The first
    case the check would have caught is `const now = ref(new Date())` in `pages/learn-train/archive/index.vue`, repaired in
    jordansread/CUAHSI3-website#231.
14. **A `watch()` on a computed, placed above what the computed reads, crashes the page and the build passes.** `watch(typeFilters, ...)`
    runs `typeFilters` at once, which read `jobs` before the `const jobs = ...` line below it had run (a temporal dead zone error in `setup`).
    `verify.sh --build` and the link check were green; the job board came out as an 800px-high blank in the visual comparison, and only
    that showed it. Put a `watch()` after the declarations it depends on (the end of `<script setup>` is safe), and run
    `npm run visual:compare` after any change to a page's script. Since 15 November 2026 `npm run lint` fails it (the local rule
    `footgun/watch-order` in `eslint.config.mjs`): a `watch()` or `watchEffect()` whose source reads, directly or through computeds
    and functions, a `const`, `let` or class declared below it in the scope the watch runs in (the top of the script, or the
    function it is in, such as a composable). It reports the first such name it reaches. On the job board as merged in commit
    5984483 it reports `today`, which `typeFilters` reads through `isExpired()`.
15. **`window.location.search` is empty in `onMounted` on a statically generated page, though the address bar has a query.** Seen in
    the 31 October built site (Nuxt 3, served with `npx serve`): a list that read `?site=luquillo` from `window.location.search` in
    `onMounted` saw an empty string, ignored the address, and the build, the link check and the first page load were all fine. The
    router has the query: read it with `useRoute().query` inside `onMounted` (not in `setup`, where the server's empty query would make
    the first browser render differ from the built page; footgun 13). Found by loading a link with a query in the browser. Seen only
    with `npx serve`; the cause (my reading: the router rewrites the address after hydration) was not isolated, and it was not tried on
    Netlify. Write the choice back with `router.replace({ query })`, not `history.replaceState`, so the router and the address agree on
    Back. Only a browser shows the symptom, but the usual way to cause it has a pattern: since 15 November 2026 `verify.sh` (check 8d)
    fails `location.search`, `location['search']` and `{ search } = location` in the `.vue` and `.ts` files of the site code, a comment
    included (0 on that day; Jordan's decision on CUAHSI/CUAHSI3-website#129). It does not see `new URL(location.href).searchParams`
    or `location.href.split('?')`, and nothing checks `history.replaceState`.
16. **An event's date printed from `new Date(start)` is a day late for an evening event.** Found on 22 November 2026 while building
    the event page's Time box (task/event-time): the CUAHSI Community Gathering at AGU, `start: "2026-12-09T18:00:00-08:00"`, showed
    "Thursday, December 10" on its page and "Dec 10" on the events list. Every page that shows an event's day turned the text into an
    instant with `new Date(start)` and printed it with `timeZone: 'UTC'` (right for a date-only start, which is midnight UTC); for a
    time with an offset in the Americas, any start from 7 pm Eastern, 4 pm Pacific or 3 pm in Alaska (standard time; an hour later in summer) or 2 pm in Hawaii (all year) is
    the next day in UTC. The build, the link check
    and the visual comparison were all fine: the baselined event is date-only. @nuxt/content keeps `start` and `end` as the text in
    the file, offset included, quoted or not, so the day is the first ten characters: `eventDay()` in `composables/useEventDay.ts`
    returns that day at midnight UTC, and the existing UTC formatting prints it. Fixed on six pages (the event page and list, the
    home page's events strip, the Community page, the newsletter's events, the workshop archive) on task/event-dates. Upcoming and
    past still compare instants. `verify.sh` check 8e fails the inline form (`new Date(x.start).toLocale…`); on `main` before the fix
    it found 8 lines in 4 files. It does not see a helper that takes the date as an argument, which is how the event page and the home
    page did it (the Community page and the archive had both); the event page's helper for its neighbours' month, `fmtShort`, was
    found by the reviewer, not the check.
