// Visual regression: full-page screenshots of the routes in scripts/visual-routes.json at 390px and 1280px,
// compared with the images committed in visual/baseline/. See visual/README.md.
//   npm run build:search && npm run visual:compare      compare the current build with the baseline
//   npm run build:search && npm run visual:baseline     rewrite the baseline (only from a build of main)
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: '.agent/visual/test-results',
  snapshotPathTemplate: 'visual/baseline/{projectName}/{arg}{ext}',
  fullyParallel: true,
  workers: 4,
  timeout: 90_000,
  // No retries: a retry would turn an intermittent visual difference into a pass reported only as "flaky".
  retries: 0,
  reporter: [['list']],
  expect: {
    // Zero tolerance: any changed pixel fails, so a subtle colour or spacing change is not missed.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css' }
  },
  use: { baseURL: 'http://localhost:4100', deviceScaleFactor: 1, reducedMotion: 'reduce' },
  projects: [
    { name: '390', use: { viewport: { width: 390, height: 844 } } },
    { name: '1280', use: { viewport: { width: 1280, height: 800 } } }
  ],
  webServer: { command: 'node scripts/serve-static.mjs', url: 'http://localhost:4100', reuseExistingServer: false }
})
