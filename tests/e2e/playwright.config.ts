// Smoke test: every built page at 390px and 1280px, in a real browser. See tests/e2e/README.md.
//   npm run build:search && npm run test:e2e
// Separate from the visual comparison (playwright.config.ts at the root, testDir tests/visual): no screenshots, so it
// can run on Linux; .github/workflows/verify.yml runs it on every pull request. Serves the build on port 4101, so it can run while the visual comparison holds 4100.
import { defineConfig } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const port = 4101

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: path.join(root, '.agent/e2e/test-results'),
  fullyParallel: true,
  // Each page is one short navigation with third-party requests blocked, so the run is CPU-bound in the browser.
  // 4 workers: the same as the visual config; on a 10-core Mac the 376 tests took about 80 s (see the README).
  workers: 4,
  timeout: 30_000,
  // No retries: a retry would hide an intermittent error as "flaky". A flaky page is listed, not retried.
  retries: 0,
  // In CI, a test.only left in a spec fails the run instead of quietly running that one test.
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    { name: '390', use: { viewport: { width: 390, height: 844 } } },
    { name: '1280', use: { viewport: { width: 1280, height: 800 } } }
  ],
  // cwd: the repository root, because serve-static.mjs serves .output/public relative to where it runs.
  webServer: {
    command: 'node scripts/serve-static.mjs',
    cwd: root,
    env: { PORT: String(port) },
    url: `http://localhost:${port}`,
    reuseExistingServer: false
  }
})
