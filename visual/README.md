# Visual baseline

Full-page screenshots of 30 routes at 390px and 1280px (60 images), taken from a build of `main` at
`66e5514` (1 November 2026; the Critical Zone Science package, #89 and #90). They replaced the set taken at
`b5fefd7` (8 October 2026), which had itself replaced the first set, taken at `2ae92b5` before the Tailwind migration
(roadmap task 4), which every later change had made out of date (52 of 52 failed, including `/contact`, whose own
content had not changed: only the shared header and footer had). They are the reference that later pull requests are compared against.
Two images were retaken from a build of `main` at `15b4758` (6 November 2026): `learn-train-cyberseminars` at 390 and 1280 px, because the 63 Women Advancing River Research lectures (#209) grew the page from 21 to 82 cards. The other 58 were not changed. `critical-zone-science-datasets` at 1280 px failed in most runs of the comparison on that build, by 562 pixels in the observatory filter's label, and was not retaken (cause not found).
Eleven images were retaken from a build of `main` at `b8ac43b` (14 November 2026): `about-team`, `about-governance`, `home`, `hire-cuahsi` and `contact` at 390 and 1280 px (PRs 215, 216 and 227 changed those pages), and `critical-zone-science-datasets` at 1280 px, to the render that came in 11 of 13 captures. That page still renders one of two ways, 269 px apart in the observatory filter's label; the cause is not found, and the comparison can fail on it when the other render comes up.
Twenty-eight images were retaken from a build of `main` at `00ce2ef` (16 November 2026), both widths of 14 routes: `about-team` and
`community-jobs` (mainly the organisation's job files and team changes brought back in #242), `home`, `community`, `community-news`,
`community-newsletter`, `community-events`, `about-impact`, `learn-train-archive` and `learn-train-cyberseminars` (the November newsletter
and its items, #243, #244 and #247), and `critical-zone-science`, `critical-zone-science-datasets`, `critical-zone-science-network` and
`critical-zone-science-observatory` (the Critical Zone changes, #248 to #253; the network page grew from 22,148 to 56,459 px tall at 1280px
when #248 tagged 435 records with their cluster). The other 32 were not changed. The first retake also rewrote `member-portal` at 1280px,
which had passed before (its old image was restored), and four of the 28 at 1280px (`about-impact`, `community-newsletter`,
`community-jobs`, `critical-zone-science-observatory`) then failed in each of the next four runs with the same pixel counts every time
(40,992; 28,004; 36,151; 350,044), across the text of the whole page. That is not the random flicker under "Intermittent failures" below;
the cause was not found (it resembles the capture-against-comparison difference noted on 15 November in
`agent/log/261115-content-org-sync-jobs-3.md`). The four were retaken once more; after that, 2 of 3 runs passed 60 of 60, and the third
failed only `about-membership` at 1280px (14,802 pixels), a page nothing had changed; its diff image was overwritten by the next run and
was not kept.

- Routes: `scripts/visual-routes.json` (one page per route template, plus the hubs).
- Images: `visual/baseline/390/*.png` and `visual/baseline/1280/*.png`.
- Test: `tests/visual/visual.spec.ts`; config: `playwright.config.ts`.

## Use

```bash
npm run build:search       # build the branch first
npm run visual:compare     # 60 comparisons; any changed pixel fails. Nothing else may be using port 4100.
```

A failure writes `*-expected.png`, `*-actual.png` and `*-diff.png` under `.agent/visual/test-results/`
(gitignored). Open the diff image to see what moved. An intended visual change is a failure too: say so in the
PR and show the diff. Do not re-baseline to make a failure go away.

```bash
npm run visual:baseline    # rewrites visual/baseline. Only from a build of main, in its own PR.
```

## What keeps it repeatable

Fixed clock (2026-10-01), animations off, reduced motion, device scale 1, all web fonts loaded before the
shot (the test fails if they did not), a scroll to load lazy images and a wait until every image has finished,
the third-party Zeffy donation iframe on `/support` blocked (that area is blank in the baseline), the live USGS
request of the home page's gage card blocked and the time zone fixed to America/Chicago (the card then shows the Wisconsin River
at Muscoda with "Reading unavailable right now"; with the request open its value and bars changed every few minutes and the home
page failed at random). So the baseline does not cover the card's real states (a live value and bars, a flood badge, loading):
checking those is a job for a person looking at the home page., and the YouTube
thumbnails on `/learn-train/cyberseminars` replaced by a fixed grey pixel (they are third-party; the baseline
shows grey boxes there, so it does not check that the real thumbnails display).

## Limits

- Zero pixel tolerance. The images were made on macOS with Playwright 1.63.0 and Chromium 153. Another OS,
  a different browser version or different font rendering can change pixels without any site change. If that
  happens, re-baseline from `main` on that machine in its own PR.
- The fonts come from Google Fonts at test time, so the test needs network access.
- It covers 30 pages, one per template (the papers list shares its template with the datasets list and has no image of its own; the datasets image is the list filtered to one observatory, `?site=eel`, and the observatory image is Eel River, because a full list is 70,000 to 95,000 pixels tall and Chromium does not draw it the same way twice), not every built page. A change that only affects another page of the
  same template is covered; a change to a page with unusual content may not be.
- The redirect stubs in `pages/highlights/` are not covered: they send the browser to `/about/impact`, so a
  screenshot of `/highlights/` is the Impact page again (the first version of the baseline had that duplicate).
- Intermittent failures: on 8 October 2026, 3 of 16 comparison runs on one Mac failed on a page the site change had not touched
  (`/about` once, the home page twice), the one diff I measured being text anti-aliasing differing across the whole page. The
  cause was not found, and a rerun passed each time. A rerun is not a retry in the test (see the next point): if a page fails, rerun once, and report the
  failure in the PR with its diff image (`.agent/visual/test-results/`) whether or not the rerun passes. The same page failing
  twice is a real difference.
- There are no retries, on purpose: a retry would let an intermittent difference pass as "flaky". If a run fails
  with "web fonts did not load", the font request failed: run it again, and report it if it keeps happening.
- Placeholder boxes (the hatched grey areas where photos will go) are part of the site and are in the baseline.
- It checks how pages look, not what clicks do.
