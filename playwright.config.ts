// Visual regression: full-page screenshots of the routes in scripts/visual-routes.json at 390px and 1280px,
// comparing a build of the branch with a build of the commit it was cut from. Run through scripts/visual-compare.mjs:
//   npm run build:search && npm run visual:compare      See tests/visual/README.md.
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: '.agent/visual/test-results',
  snapshotPathTemplate: '.agent/visual/images/{projectName}/{arg}{ext}',
  fullyParallel: true,
  workers: 4,
  timeout: 90_000,
  // No retries: a retry would turn an intermittent visual difference into a pass reported only as "flaky".
  retries: 0,
  reporter: [['list']],
  expect: {
    timeout: 30_000,   // the tallest page (56,000 px at 1280) needs more than the default 5 s for its two matching shots
    // Zero tolerance: any changed pixel fails, so a subtle colour or spacing change is not missed.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css' }
  },
  // timezoneId: the home page's gage card picks a gage near the visitor from the browser's time zone, so a fixed one keeps the
  // screenshot the same on every machine (Central: the Wisconsin River at Muscoda).
  use: { baseURL: 'http://localhost:4100', deviceScaleFactor: 1, reducedMotion: 'reduce', timezoneId: 'America/Chicago' },
  projects: [
    { name: '390', use: { viewport: { width: 390, height: 844 } } },
    { name: '1280', use: { viewport: { width: 1280, height: 800 } } }
  ],
  webServer: { command: 'node scripts/serve-static.mjs', url: 'http://localhost:4100', reuseExistingServer: false }
})
