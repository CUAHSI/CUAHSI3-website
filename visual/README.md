# Visual baseline

Full-page screenshots of 26 routes at 390px and 1280px (52 images), taken from a build of `main` at
`b5fefd7` (8 October 2026). They replaced the first set, taken at `2ae92b5` before the Tailwind migration
(roadmap task 4), which every later change had made out of date (52 of 52 failed, including `/contact`, whose own
content had not changed: only the shared header and footer had). They are the reference that later pull requests are compared against.

- Routes: `scripts/visual-routes.json` (one page per route template, plus the hubs).
- Images: `visual/baseline/390/*.png` and `visual/baseline/1280/*.png`.
- Test: `tests/visual/visual.spec.ts`; config: `playwright.config.ts`.

## Use

```bash
npm run build:search       # build the branch first
npm run visual:compare     # 52 comparisons; any changed pixel fails. Nothing else may be using port 4100.
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
- It covers 26 of the 121 built pages (one per template). A change that only affects another page of the
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
