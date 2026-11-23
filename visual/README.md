# Visual baseline

Full-page screenshots of 30 routes at 390px and 1280px (60 images), taken from a build of `main` at
`66e5514` (1 November 2026; the Critical Zone Science package, #89 and #90). They replaced the set taken at
`b5fefd7` (8 October 2026), which had itself replaced the first set, taken at `2ae92b5` before the Tailwind migration
(roadmap task 4), which every later change had made out of date (52 of 52 failed, including `/contact`, whose own
content had not changed: only the shared header and footer had). They are the reference that later code pull requests are compared against (see "Which pull requests run it").
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
Four images were retaken from a build of `main` at `686000f` (20 November 2026): `home` and `community-jobs` at 390 and 1280 px. The
back-sync of the jobs agent's 16 November run (`a1cb779`, 17 November) changed the job files after the 16 November retake and did not
retake these two pages, so they failed on every branch from then on. The comparison's fixed clock was holding the date still; the job
files had changed. The other 56 were not changed; after the retake, 60 of 60 passed in each of three runs.
Two images were retaken from a build of `main` at `9bee238` (22 November 2026): `about-team` at 390 and 1280 px. Julia Masterman's
profile (jordansread/CUAHSI3-website#275, a content PR, which under the rule below did not retake) made her card a link to her profile
and added a "profile →" badge; the old and new images differ only in that 64 by 20 px badge. This is drift (rule below), retaken when
Jordan asked after #275 merged rather than when a code PR met it. The other 58 were not changed. Before the retake, three runs on that
build failed `about-team` at both widths every time, and three other pages twice each, never both widths in the same run: `about`,
`about-governance` and `about-team-profile` (each at 390 px in one run and 1280 px in another; 6 of their 18 checks). By "Intermittent
failures" below, a page failing twice is a real difference, so these were not retaken and are in the Noticed list instead
(`agent/roadmap.md`); their diff images were overwritten by the next run and were not kept. After the retake, 60 of 60 passed in each
of three runs.
Two images were retaken on `task/event-time` (22 November 2026), a code PR, as the rule below allows: `community-event` at 390 and
1280 px. The page's time zone box now gives the zone's name ("Eastern Time") where it gave the city ("New York"); the images differ
only in that value. The other 58 were not changed; after the retake, 60 of 60 passed in each of three runs. The baselined event is a
date-only one, so no image shows the new Time box.
Two images were retaken on `task/event-dates` (22 November 2026), a code PR: `community-events` at 390 and 1280 px. Event days
are now the day written in the file, not the UTC day (footgun 16); on the list, the CUAHSI Community Gathering at AGU moved from
Dec 10 to Dec 9, and the images differ only in its date badge and date line. The other 58 were not changed. After the retake, 1 of
3 full runs passed 60 of 60; the other two failed one image each (`community-events` at 1280, its diff not kept; `about` at 390).
In 20 more runs of `community-events` alone (8, then 12 on a fresh build), 2 failed, both at 390 and both by 59,833 pixels, text
anti-aliasing across the whole page. The same count twice means a second render of the page, not random flicker, and by
"Intermittent failures" a page failing twice is a real difference: it is in the Noticed list. Not retaken again (a retake would only
pick one of the two renders).

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
PR and show the diff. Do not retake an image to make a failure you cannot explain go away.

```bash
npm run visual:baseline    # rewrites all 60 images. Only from a build of main, in its own PR.
npx playwright test --update-snapshots=all -g '(about-team|home)$'   # retakes the named routes only, both widths
```

## Which pull requests run it, and when images are retaken

The comparison checks code, not content. Jordan's rule, 20 November 2026.

- **Code PRs run it** (`task/` branches), after a build. A page the change is meant to alter fails: show the diff in the PR,
  and retake that page's images on the branch, both widths, with the route filter above (never `visual:baseline`, which
  rewrites all 60), saying why. That is the one retake a code branch makes.
- **Content PRs do not run it and never retake images**: `content/` branches and the jobs agent's runs. What a content
  change shows is checked on the deploy preview, from the PR's look-at table. Content on `main` therefore drifts away from
  the images. That is expected.
- **Organisation packages and back-syncs do not run it either**, code or content. They copy images already retaken on the
  other repository; copying is not retaking.
- **Drift is caught up when a code PR meets it.** If a code PR's comparison fails on pages its change does not touch, and
  the diffs show content that has changed on `main` (new jobs, events, profiles), retake those pages' images from a build of
  `main` in a PR of their own, then rerun the code PR's comparison. Do not retake them on the code branch.

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
