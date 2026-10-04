# Accessibility leftovers: options with measured contrast (4 October 2026)

Options for Jordan to choose from. **Nothing was changed.** Each item below is a visible design change (`tailwind.config.ts` is a rule-8 file and the colours are brand decisions), so I measured and laid out the choices; I did not pick. Contrast ratios are WCAG 2.x relative-luminance ratios that I computed myself from the hex values (not from a screenshot); AA needs 4.5:1 for normal-size text and 3:1 for large text (24px, or 18.66px bold).

Background: after the contrast PR, `agent/eval-log.md` and the Noticed list record that 263 of 10,076 text runs on 121 pages still fall below AA: decorative arrows and the Cmd+K hint (153), dimmed past events (48), the clay accent (42), the ORCID badge (5). Those four add up to 248; the other 15 of the 263 are, per the log, the dimmed event type pills and one muted label on a darker tile.

## 1. The clay accent `#C0603C` (42 text runs, plus two buttons)

Used as `text-clay` in 25 places in 11 files (small mono labels such as "SUPPORT CUAHSI", prices, the kicker above page titles) and as the button background `bg-clay` with white text in 2 places (the home page "Subscribe" and the Hire CUAHSI submit button). It is one token in `tailwind.config.ts` (line 19).

Measured today:

| `#C0603C` as text on | ratio | AA (4.5)? |
|---|---|---|
| paper `#FBFAF7` (page background) | 4.04 | no |
| sand `#F3EEE4` (panels) | 3.65 | no |
| white | 4.22 | no |
| white text on a clay button | 4.22 | no (15px semibold is not "large") |

The same hue (about 16 degrees, saturation 52%) made slightly darker. Lightness lowered in 1% steps:

| Candidate | on paper | on sand | on white | white text on it |
|---|---|---|---|---|
| `#B85C3A` (2 steps) | 4.35 | 3.92 | 4.54 | 4.54 |
| `#B05837` (4) | 4.68 | 4.23 | 4.89 | 4.89 |
| **`#A95435` (6, smallest step that passes on every background; thin margin on sand)** | **5.02** | **4.53** | **5.24** | **5.24** |
| **`#A55234` (7, recommended margin)** | **5.22** | **4.71** | **5.45** | **5.45** |
| `#A15032` (8) | 5.42 | 4.90 | 5.66 | 5.66 |

The page heroes use a gradient from paper to sand (`PageHero.vue`), so the worst background for the kicker label is sand. `#A95435` clears AA on sand by only 0.03 (4.53); **`#A55234` (10 steps would be wasteful; this is 5 steps) gives 4.71 on sand, 5.22 on paper, 5.45 on white**, a safer margin for the same look. The text-selection colour `::selection` in `assets/css/global.css` line 5 also hard-codes `#C0603C`, so the token change leaves that one place to update.

**Options:** (a) change the token to `#A55234` (or `#A95435`): every use passes AA, the colour stays clearly the same warm brick red, a little darker and less bright; one change in `tailwind.config.ts` plus the selection colour, and all 25 text uses and both buttons follow. (b) Keep `#C0603C` as the brand colour for large or decorative uses and add a second, darker token (e.g. `clay-text`) for small text and buttons: more work (about 27 spots), keeps the brand colour where it is large. (c) Leave as is and accept the fail for small labels. **My recommendation: (a)**, and I would show before/after pictures of the home page and `/support` first. Because the baseline screenshots contain this colour, every page with a clay label would re-draw its screenshot on purpose (a large baseline change in its own PR).

## 2. Past events shown dimmed (48 text runs, plus the type pills)

On `/community/events` past events are drawn with `opacity: 0.65` on the whole row, which fades the title, meta text and tag pills together. Measured effect on the page background `#FBFAF7`:

| Text colour | at opacity 0.65 | at 0.75 | at 0.85 |
|---|---|---|---|
| ink `#15212B` (the event title, which has no colour class so it inherits) | 5.04 (passes) | 7.06 | 9.83 |
| muted `#5C6E78` (date and location lines, 11px; the month label, 9px) | 2.59 (fails) | 3.10 | 3.75 |
| grey `#6b7280` (the 20px day number, weight 500, not "large text") | 2.46 (fails) | 2.92 | 3.49 |

So only the title (ink) passes; the date, location, month label and day number fail, and even at 0.85 they stay below 4.5. The numbers assume the paper background; the day number sits on a `#f9fafb` tile (muted is 5.08 and `#6b7280` is 4.63 on that tile **before** the opacity). The type pills take their colours from `typeColors` in the page (for example `#1E40AF` on `#EFF6FF`, `#5C6E78` on `#F3F4F6`); I did not measure them at 0.65. Past rows have no description line (only upcoming rows do); even at 0.85 the grey text stays below 4.5.

**Options:** (a) drop the dimming and mark past events another way (a small "Past" label, or a lighter date tile) so the text keeps its normal colour: passes everywhere; (b) keep a dimmed look but build it from colours chosen to pass (title dark, meta in a mid-grey that is at least 4.5:1) instead of `opacity`: keeps the idea, needs a few classes changed; (c) leave as is. **Recommendation: (a) or (b); your call, since it is about how "past" should look.**

## 3. Footer links turn white on hover (no contrast issue)

Several hover colours never worked (an inline colour overrode them, recorded in the Noticed list as the footer links, the past-workshop titles, the About/Impact sub-navigation, and the home-page event titles). They are not contrast problems; they are about whether links should react to hover. **Options:** switch them on or leave things as they are. The Noticed lines name `hover:text-white` for the footer links and `hover:text-water` for the home-page event titles; for the past-workshop titles and the About/Impact sub-navigation the colour would be my choice (water blue is the natural one). Contrast of the candidates: white on the footer navy `#0A2032` is 16.59; the footer links today are 6.29; `#1F6FB2` is 5.28 on white, 5.06 on paper and 4.57 on sand (passes on all three).

## 4. The ORCID badge (5 runs) and the decorative arrows (153)

- **ORCID "iD" link** (`pages/about/team/[slug].vue` line 54): green text `#A6CE39` and a green border on a light background, 1.82:1. It is ORCID's brand green, but what is built is a plain text link in that colour, not ORCID's own icon (their icon is the green circle with a white "iD"), and it is the only link to the person's ORCID profile. Whether it counts as a logotype (WCAG exempts logotypes) is a judgment, not settled. **Options:** (a) leave it; (b) darken the text to a green that passes (the link keeps its border colour); (c) use the white-on-green form with the same text. Recommendation: (b) or (c) if you want it fully readable; (a) is defensible for five runs.
- **Arrows and the Cmd+K hint:** I have not checked what all 153 runs are. Most are the "→" at the end of links and buttons; WCAG exempts text that is purely decorative (visually decorative), and `aria-hidden` does not make something decorative for that purpose, so hiding the arrows from screen readers would not by itself make them pass. The Cmd+K hint is a shortcut hint beside a labelled search button and is fainter than AA. Not worth a design change on its own; `aria-hidden` on the arrows would be an invisible tidy-up for screen readers only, and I can do it if you want.

## What I need from Jordan

One line per item: **(1) a / b / c, (2) a / b / c, (3) switch on hover or leave, (4) leave or mark arrows hidden.** The colour changes touch `tailwind.config.ts` (rule 8), and each visible change gets its own small PR with before/after pictures and re-drawn baseline screenshots.

## What I did not do

Measure real rendered colours in a browser (the ratios are from hex values; the `opacity` rows assume the paper background and the pills were not measured), test with a screen reader, check the 153 / 48 / 42 / 5 breakdown against the original scan data (I only have the figures from the log), or check large-text exceptions beyond the two buttons.
