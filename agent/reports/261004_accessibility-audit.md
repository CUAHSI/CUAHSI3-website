# Accessibility audit, 4 October 2026

Roadmap task 6, first step: **an audit report, no fixes.** No page, component, style or content file was changed; the only files in this commit are this report, a roadmap status cell and the eval log. Fixes follow in separate pull requests by category (roadmap), and contrast changes need your eye on the design tokens.

## Short answer

The basics are in good shape: every page has a language, a title, exactly one `h1`, the four landmarks, a zoomable viewport, and every image has an `alt` attribute. The problems cluster in **interactive parts built from clickable `div`s**, in **the mobile menu and search dialog**, in **form labels and focus rings**, and in **text contrast**.

**Ten findings I rate high** (they stop or confuse a keyboard or screen-reader user, or fail a measurable WCAG AA threshold), **four medium, three low.** Each has a count with its denominator and where to look. How I measured is in "Method and limits"; the main limit is that **I have not used a screen reader and have not walked every page by keyboard**: the checks below are automated scans of all 121 built pages at 1280px and at 390px, plus scripted keyboard tests on a few pages.

| # | Finding | Scale |
|---|---|---|
| H1 | Team cards open profiles with a mouse click only; the team page has **no links** to profile pages | 1 page; it has 0 links to the 6 profile pages |
| H2 | Cyberseminar thumbnails open the player with a mouse click only | 6 of 6 cards on the page (focusable parts inside: 0) |
| H3 | Hire CUAHSI service cards select a service with a mouse click only | 4 of 4 cards |
| H4 | The mobile menu button has no accessible name and no expanded state | 121 of 121 pages at phone width |
| H5 | The search dialog has no dialog role, no label on its input, does not trap focus and does not return focus | 1 component, on all 121 pages |
| H6 | Form fields without a label (placeholder only) | 9 of 9 visible fields, on 4 pages (+ the search box inside the dialog) |
| H7 | Focus outline removed with inline `outline:none` | 10 elements in 5 files |
| H8 | No "skip to content" link | 121 of 121 pages |
| H9 | Text contrast below WCAG AA | 2501 of 9955 text runs (25%), 51 rows of colour, background and size (29 distinct colour pairs) |
| H10 | Page scrolls sideways at phone width | 1 of 121 pages (`/learn-train/archive/`, 627px wide in a 390px viewport) |

## High-priority findings

### H1. Team cards are not links (WCAG 2.1.1 Keyboard, 4.1.2 Name, Role, Value)
`pages/about/team/index.vue` lines 35 to 39: each person's card is a `<div>` with `@click="... $router.push('/about/team/<slug>')"` and `cursor:pointer`. A keyboard or screen-reader user cannot open a profile. I searched the built `/about/team/` page for links to profile pages (`a[href^="/about/team/"]`): **0 found**. The 6 profile pages exist (`/about/team/<slug>/`) but are not linked from the team page at all, which also hides them from search engines that follow links. This is the same page whose photo mapping broke earlier in this project.

### H2. Cyberseminar thumbnails are mouse-only (2.1.1, 4.1.2)
`components/CyberseminarCard.vue` line 32: the thumbnail is a `<div class="relative cursor-pointer" @click="$emit('toggle')">`. On the built page: 6 clickable thumbnails, **0** with a focusable element inside. The Close button (once open) is a real button with a 44px minimum height; opening is the problem. Already in Noticed as "opening a card is mouse-only".

### H3. Hire CUAHSI service cards are mouse-only (2.1.1, 4.1.2)
`pages/hire-cuahsi/index.vue` lines 168 to 171: four cards are `<div ... cursor-pointer @click="selectService(s.label)">` that choose a service for the enquiry form. Keyboard users cannot choose one.

### H4. Mobile menu button has no name or state (4.1.2 Name, Role, Value)
`components/AppHeader.vue` line 67: an icon-only `<button>` visible below 768px. In the browser it has **no attributes at all**: no `aria-label`, no `aria-expanded`, no `aria-controls`; text content is empty. A screen reader announces just "button". At phone width this is the only way to the navigation. Size is 38 by 38px (target-size minimum is 24px; 44px is the common guidance). Clicking the button opens the menu (9 header links become visible); I did not test the menu by keyboard.

### H5. Search dialog (2.4.3 Focus Order, 4.1.2)
`components/SiteSearch.vue` renders the dialog through `Teleport` with no `role="dialog"`, no `aria-modal`, and no `aria-label`. Scripted keyboard test on the home page at 1280px: Enter on the Search button opens it and moves focus into the input; the input has no label (placeholder only); **the first 8 Tab stops stayed inside the dialog and the 9th went into the page behind it** (no focus trap); **Escape closes it, but focus lands on the logo link, not on the Search button**.

### H6. Form fields without labels (1.3.1, 3.3.2, 4.1.2)
9 of 9 visible form fields in the built site have no label, `aria-label` or `aria-labelledby`: home newsletter email (1), `/about/membership/` institution search (1), `/member-portal/` search (1), `/hire-cuahsi/` institution lookup, Name, Organization, Email, the select and the textarea (6). All rely on placeholder text, which disappears as you type. (The search input inside the dialog is a tenth, counted under H5.)

### H7. Focus outline removed (2.4.7 Focus Visible)
`grep` finds inline `outline:none` on **10 elements in 5 files**: `pages/index.vue:267` (newsletter email), `pages/member-portal/index.vue:88`, `pages/about/membership.vue:183`, `pages/hire-cuahsi/index.vue` (lines 137, 223 to 226, 232) and `components/SiteSearch.vue:151`. Several of those also have `border:none`, so the field may show **no** focus indicator at all. I did not tab into each to look. On the rest of the site the browser's default ring is intact: of the first 14 focusable controls on the home page, all 14 showed the browser focus ring (`outline: auto 1px`); nothing in `global.css` sets `outline`.

### H8. No skip link (2.4.1 Bypass Blocks)
**121 of 121 pages** have no link that skips the header navigation (9 header links + search before the page content, plus the top bar).

### H9. Contrast (1.4.3 Contrast Minimum)
I computed the contrast of every visible text run on every page at 1280px against its real background (walking up the page for the first opaque background; gradients checked at every stop). **2501 of 9955 text runs (25%) fall below 4.5:1 (3:1 for large text)**, in 51 rows (a row is a colour, background and font size; they make 29 distinct foreground/background pairs). **Read the percentage with two cautions:** three rows that appear on all 121 pages (the footer links, the header "Search" text and the "⌘K" hint) account for 1210 of the 2501 failing runs (48%), and 174 failing runs are decorative arrow or shortcut glyphs. Text over a gradient is scored against its *worst* colour stop, which can overstate a failure for text sitting on the light end; the "Colours" column shows the background of that worst stop. The 14 biggest:

| Ratio | Needs | Size | Colours | Runs | Pages | Example text |
|---|---|---|---|---|---|---|
| 4.08 | 4.5 | 11px | `rgb(95, 130, 156)` on `rgb(10,32,50)` | 968 | 121 | "BLUESKY" |
| 2.43 | 4.5 | 11px | `rgb(156, 163, 175)` on `rgb(251,250,247)` | 348 | 52 | "Get involved" |
| 4.39 | 4.5 | 11px | `rgb(107, 114, 128)` on `rgb(243,244,246)` | 184 | 41 | "1 hour" |
| 2.43 | 4.5 | 11px | `rgb(156, 163, 175)` on `rgb(249,250,251)` | 126 | 28 | "Recent visits" |
| 2.54 | 4.5 | 12px | `rgb(156, 163, 175)` on `rgb(255,255,255)` | 121 | 121 | "Search" |
| 1.47 | 4.5 | 10px | `rgb(209, 213, 219)` on `rgb(255,255,255)` | 121 | 121 | "⌘K" |
| 2.43 | 4.5 | 10px | `rgb(156, 163, 175)` on `rgb(251,250,247)` | 101 | 1 | "Graduate Institution" |
| 2.43 | 4.5 | 10px | `rgb(156, 163, 175)` on `rgb(249,250,251)` | 91 | 27 | "Date" |
| 2.43 | 4.5 | 12px | `rgb(156, 163, 175)` on `rgb(251,250,247)` | 86 | 38 | "Scott H. Ensign, Ph.D., Assistant Direct" |
| 3.25 | 4.5 | 11px | `rgb(29, 158, 117)` on `rgb(251,250,247)` | 41 | 8 | "Included with membership" |
| 1.73 | 4.5 | 11px | `rgb(156, 163, 175)` on `rgb(251,250,247)` | 24 | 1 | "Sep 28, 2026" |
| 3.25 | 4.5 | 12px | `rgb(29, 158, 117)` on `rgb(251,250,247)` | 22 | 2 | "See upcoming events →" |
| 3.25 | 4.5 | 10px | `rgb(29, 158, 117)` on `rgb(251,250,247)` | 21 | 6 | "→" |
| 3.25 | 4.5 | 13px | `rgb(29, 158, 117)` on `rgb(251,250,247)` | 17 | 14 | "Visit criticalzone.org ↗" |

Reading it: three colours do most of the damage. (1) **`#9ca3af` (a grey, 2.4:1 on the page background)** carries dates, labels and the "Search" text: this is not a design token in CLAUDE.md. (2) The **footer link colour** (`rgb(95,130,156)` on the navy) is 4.08:1 at 11px: a near miss on 968 text runs, every page. (3) **`#1D9E75` green (3.25:1)** is used for links on news pages (`.news-prose a`), "Included with membership" and small arrows; and the design token `clay` `#C0603C` is 4.04:1 on paper, 4.22:1 on white and 3.65:1 on the sand end of the hero gradient, so it is below 4.5 for small text (it passes for large text). For comparison the design token `muted` `#5C6E78` is 5.08:1 on paper and passes; ink and navy pass comfortably (13.5:1). Any colour change alters how the site looks, so this is for your decision. I did not measure non-text contrast (1.4.11).

### H10. Reflow at phone width (1.4.10)
`/learn-train/archive/` is 627px wide in a 390px viewport (237px overflow). What I measured with a script (not saved): the only two elements whose right edge is beyond the screen are a `<span class="font-mono text-[11px] text-muted flex-none">` (`pages/learn-train/archive/index.vue` line 85) whose text starts "Salt Lake City, UT (in-person) + Virtual…" (right edge at 590px) and the arrow after it with `flex-none` (right edge 627px). `flex-none` stops the span from shrinking, so a long location string sets the row width. That cause is my reading of the source; I have not tested a fix. The other 120 pages have no horizontal overflow at 390px. The visual baseline (task 3b) cannot see this, because a screenshot is only as wide as the viewport.

## Medium

- **M1. Page titles (2.4.2).** 48 of 121 titles end with a duplicated site name (`Governance · CUAHSI · CUAHSI`): `nuxt.config.ts` line 12 sets `titleTemplate: '%s · CUAHSI'`, and these pages already end their own title with `· CUAHSI`. 30 pages share a title with another page: 14 of the 15 duplicate groups are the `/highlights/<slug>/` redirect stubs and the matching `/about/impact/<slug>/` page (the stubs are deliberate); one group is two events with the same title (`/community/events/watersofthack-2026/` and `/community/events/watersofthack-2026-july/`).
- **M2. Heading levels skip (1.3.1, advisory).** On 4 pages a heading jumps more than one level: `/about/impact/`, `/highlights/`, `/hire-cuahsi/`, `/learn-train/cyberseminars/`.
- **M3. Filter chips do not say which is selected (4.1.2).** 0 of 10 chip buttons on `/about/impact/` have `aria-pressed`; the same component (`FilterChip`) is used on 4 more pages. Already in Noticed.
- **M4. Small targets (2.5.8 Target Size, WCAG 2.2 AA).** Counting every link and control, 2818 of 3558 at phone width are under 24px in one dimension, but that number includes text links inside sentences, which the standard exempts, so I do not rely on it. A sample of six named pages at 390px (`/`, `/about/`, `/learn-train/`, `/community/jobs/`, `/community/events/`, `/contact/`), with in-sentence links excluded: **120 of 162 remaining controls are under 24px** (108 in the footer: the link list and the social links at 17 to 18px high; 12 in page bodies, such as the "See all platforms →" rows at 19 to 20px). The standard's spacing exception was not evaluated, so some of these may pass.

## Low / information

- **L1. Text smaller than 12px on 121 of 121 pages** (3203 text runs, the smallest 9px): the mono labels. Not a WCAG failure; hard to read for low-vision readers.
- **L2. No `prefers-reduced-motion` rules** anywhere in the CSS (0 matches); the only use is in JavaScript, where `components/CyberseminarCard.vue` line 23 picks the scroll behaviour from that setting. The home page has a pulsing "live" dot and cards animate on hover. WCAG AA does not require it (2.3.3 is AAA).
- **L3. Same link text, different targets** on 11 of 121 pages (for example "Contact" going to two places; 2.4.4 Link Purpose, advisory).

## What passes (with denominators)

- `lang="en"` on 121 of 121 pages; non-empty `<title>` on 121 of 121; exactly one visible `h1` on 121 of 121; exactly one `main`, plus `header`, `nav` and `footer`, on 121 of 121.
- Viewport allows zoom (`width=device-width, initial-scale=1`, no `user-scalable=no`) on 121 of 121.
- All 33 `<img>` elements have an `alt` attribute (0 missing, 0 empty; on 8 pages). **Whether the alt text is good I did not judge.**
- All 4353 links have an accessible name; 0 buttons without a name on desktop (the one on phone is H4); all iframes have titles; 0 duplicate ids; 0 `aria-hidden` elements containing focusable controls.
- Browser focus rings are intact on the 14 home-page controls I tabbed through (see H7 for the exceptions).

## Method and limits

- **Scan:** a script loaded all 121 built pages (`.output/public`, served locally) in Chromium 153 at 1280px and again at 390px and ran the checks in the page. Third-party YouTube thumbnails and the Zeffy donation form were blocked.
- **Contrast:** for each visible text node, text colour (with opacity) against the first opaque ancestor background, mixing semi-transparent layers; gradients were checked at every colour stop; 0 text runs had an image background I could not resolve. I re-computed three failing pairs (grey `#9ca3af` on paper 2.43:1; footer link on navy 4.08:1; green `#1D9E75` on paper 3.25:1) and two passing ones (muted on paper 5.08:1; navy on paper 13.46:1) with a separate formula and they matched.
- **Keyboard checks** were scripted, not a human walk-through: Tab through the first 14 controls on the home page, the search dialog, and the phone menu button. A second script looked for clickable cards with no focusable part inside: it worked on the cyberseminars page (6 thumbnails, 0 focusable) but **returned 0 cards on the team page, so that detector was wrong there and I did not use it**; for the team cards (H1) the evidence is the source plus 0 links to profile pages in the built page, and for the hire service cards (H3) the evidence is the source alone. H7 is the source plus a search for `outline:none`; I did not Tab into each of those fields.
- **Not done:** screen-reader testing; a human keyboard pass of every page; zoom to 200% and 400%; non-text contrast; captions and transcripts for the YouTube videos; the accessibility of the downloadable PDFs; alt-text quality; the spacing exception for target size; forced-colours and dark mode. No automated accessibility engine (such as axe) was used, because adding one is a dependency (rule 8); the scripts are my own checks and may miss things such tools find, or report things differently.
- **Pages opened by eye:** none. The findings come from scans of all 121 pages, from reading the five component and page files named above, and from the scripted keyboard tests; sample checks of the contrast arithmetic are described above.
- Built with `main` at `2ae92b5`; the findings come from the built HTML, so a problem that only appears after hydration with real interaction may be missing.

## Suggested fix pull requests (by category, for your decision)

1. **Keyboard access (H1, H2, H3):** make the team cards, the cyberseminar thumbnails and the hire service cards real links or buttons. Changes markup, not looks; the visual baseline will show whether anything moved. Highest value.
2. **Names and states (H4, H5, H6, M3):** menu button label and expanded state; dialog role, label, focus handling; form labels; `aria-pressed` on chips. No visual change if labels are visually hidden.
3. **Focus and skip (H7, H8):** restore focus outlines on the 10 fields; add a skip link (visible on focus).
4. **Phone overflow (H10):** let the archive row wrap. A small visible change at 390px.
5. **Titles and headings (M1, M2):** fix the doubled site name and the heading skips.
6. **Contrast (H9):** needs your decision on the colours; shows up as differences in the visual baseline, by design. I would start with the footer and the `#9ca3af` text.
