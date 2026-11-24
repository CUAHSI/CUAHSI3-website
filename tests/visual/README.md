# Screenshot comparison

```bash
npm run build:search                        # build the branch first
npm run visual:compare                      # 60 images; any changed pixel counts. Nothing else may use port 4100
npm run visual:compare -- about-team home   # only the named routes, both widths
```

It compares screenshots of two builds: the commit the branch was cut from, and the branch. Both are made on the spot, on the same
machine, so no images are stored in git and a content change on `main` cannot make them wrong. The base build goes in
`.agent/visual/builds/<commit>/` (gitignored) and is reused. If the branch changes dependencies, the base is still built with the
branch's `node_modules`.

- **A PR that changes code runs it.** A content-only PR does not; what it shows is checked on the deploy preview.
- **A page the change is meant to alter is reported as changed.** Say which pages and why in the PR, and look at each
  `*-diff.png` under `.agent/visual/branch/`. A page the change should not touch is a fault to find. If the PR also changes
  content, the pages that show it are reported too.
- **Pages reported as "not repeatable"** differed from themselves on one build, or differed from the base in only one of two runs.
  Some pages draw in one of two ways (text anti-aliasing; causes not found). A real change can hide there: open the diff of any
  such page the change could have touched, and report the list in the PR.
- **Pages reported as "not on the base"** could not be shot on the base build, as with a new page. Look at them on the preview.

Until 24 November 2026 the images were stored in `visual/baseline/` and compared with every later build. Every job, event or
profile made them wrong, and retaking them took pull requests of their own (`agent/reports/261123_content_flow_cost.md`). The
history is in git (`git log -- visual`).

## What keeps it repeatable

Fixed clock (2026-10-01), animations off, reduced motion, device scale 1, all web fonts loaded before the shot (the test fails if
they did not; they come from Google Fonts, so it needs the network), a scroll to load lazy images and a wait until every image has
finished. Third parties are blocked or replaced: the Zeffy donation form on `/support`, the live USGS request of the home page's
gage card (time zone fixed to America/Chicago, so the card shows one gage with no reading) and YouTube thumbnails. Those three are
not checked here; a person looks at them.

## Limits

- 30 pages at two widths, one page per template (`scripts/visual-routes.json`), not every built page.
- The redirect stubs in `pages/highlights/` are not covered.
- No retries: a retry would let a real difference pass as flaky. "web fonts did not load" means a font request failed: run it again.
- It shows what a branch changes. A fault already on `main`, or one that appears as dates pass (footgun 13), is on both builds and
  is not seen. The stored images showed one such fault once (8 October 2026).
- It checks how pages look, not what clicks do (`npm run test:e2e` opens every page).
