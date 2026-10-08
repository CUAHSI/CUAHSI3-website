# Remaining inline styles after the Tailwind migration (4 October)

Written at the end of Tailwind PR 4 (roadmap task 4). Counted with `grep` over `pages/`, `components/` and `app.vue`
on the PR 4 branch.

**Static `style="..."` attributes left: 0** outside `components/CommunityHero.vue`, which no page renders (7 static
inline styles and 1 dynamic binding). It was left alone because the style comparison cannot see it. Delete it or
migrate it in a separate change; deleting is Jordan's call.

**Dynamic `:style` bindings left: 30 in 17 files.** Each takes a colour, a size or a state from data or from the
active route, so a fixed class cannot hold it. They are `:style` on purpose; converting them means mapping the
data values to class names (a safelist or a lookup table), which is a design decision, not a mechanical one.

| File | Count | What the binding is |
|---|---|---|
| `pages/contact/index.vue` | 4 | card accent colour per team (border, label, link colour) |
| `pages/index.vue` | 3 | river-gauge bar heights and colours; two category badges |
| `pages/hire-cuahsi/index.vue` | 3 | service-card accent colour (border, label, dot) |
| `pages/community/newsletter/[slug].vue` | 3 | person avatar colour by board or staff; event-type badge colour |
| `pages/community/events/index.vue` | 2 | event-type badge (`typeStyle()`) |
| `pages/about/index.vue` | 2 | capability icon background; timeline dot colour |
| `pages/about/impact/index.vue` | 2 | highlight card top border and category badge colour |
| `components/AppHeader.vue` | 2 | nav link active state (desktop and phone menu) |
| `pages/community/news/index.vue` | 1 | tag chip colours from a lookup |
| `pages/community/jobs/index.vue` | 1 | job-type badge (`typeStyle()`) |
| `pages/community/index.vue` | 1 | event-type badge (`typeStyle()`) |
| `pages/community/events/[slug].vue` | 1 | event-type badge (`typeStyle()`) |
| `pages/community/campus-visits/index.vue` | 1 | divider under all but the last recent visit |
| `pages/about/impact/[slug].vue` | 1 | category badge colour |
| `components/StatsBand.vue` | 1 | divider on all but the first stat |
| `components/FilterChip.vue` | 1 | chip colours by variant and state |
| `components/CommunityHero.vue` | 1 | unused component |

## Not part of the migration

- `components/AppFooter.vue` keeps a scoped `<style>` block with two `!important` column rules (`.footer-grid`).
- `pages/index.vue` keeps a `<style>` block with `.gauge-card` mobile rules (also `!important`) and a copy of the
  `card-lift` / `arrow-row` rules that already exist in `assets/css/global.css`.
- Hover, focus, pseudo-elements, print and non-Chromium rendering were not covered by any of the four comparisons.
