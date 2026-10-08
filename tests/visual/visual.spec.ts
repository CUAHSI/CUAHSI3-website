import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const routes: { name: string; path: string }[] = JSON.parse(fs.readFileSync('scripts/visual-routes.json', 'utf8'))

// A fixed 1x1 grey PNG, used in place of third-party YouTube thumbnails (see the route below).
const GREY_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPomjIHAANmAbuHN4HVAAAAAElFTkSuQmCC',
  'base64'
)

// Google Fonts answers are fetched once per worker and then replayed, so one slow or dropped request does not
// leave a page without its web fonts (seen in trial runs: roughly 1 run in 10 had a page without fonts).
const fontCache = new Map<string, { status: number; headers: Record<string, string>; body: Buffer }>()

for (const r of routes) {
  test(r.name, async ({ page, context }) => {
    // The donation form on /support is a third-party iframe that never goes idle and is not ours to compare.
    await context.route(/zeffy\.com/, route => route.abort())
    // The home page's gage card loads the latest flow of a real USGS gage in the browser, so its value and bars change every
    // few minutes. Block that request: the card then shows its "no reading" state, the same on every run.
    await context.route(/api\.waterdata\.usgs\.gov/, route => route.abort())
    // YouTube thumbnails on the cyberseminars page are third-party and can change or load late (one failed run in
    // a stress test). Replace them with a fixed grey pixel; the page still sizes and crops them as it does today.
    await context.route(/img\.youtube\.com/, route => route.fulfill({ status: 200, contentType: 'image/png', body: GREY_PIXEL }))
    await context.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
      const url = route.request().url()
      let hit = fontCache.get(url)
      if (!hit) {
        const res = await route.fetch()
        // body() is already decoded, so drop the encoding and length headers that described the compressed bytes.
        const { 'content-encoding': _enc, 'content-length': _len, ...headers } = res.headers()
        hit = { status: res.status(), headers, body: await res.body() }
        if (hit.status === 200) fontCache.set(url, hit)
      }
      await route.fulfill(hit)
    })
    // Fixed clock, so nothing that depends on "now" can change between runs.
    await page.clock.install({ time: new Date('2026-10-01T12:00:00Z') })
    await page.goto(r.path, { waitUntil: 'networkidle' })
    // The site loads its fonts from Google Fonts. Load every face we use and require that they are ready,
    // otherwise a slow font request changes the page height and the run fails at random (seen in trial runs).
    const fontsReady = await page.evaluate(async () => {
      const faces = [
        ...[500, 600, 700, 800].map(w => `${w} 20px "Schibsted Grotesk"`),
        ...[400, 500, 600, 700].map(w => `${w} 16px "Hanken Grotesk"`),
        ...[400, 700].map(w => `${w} 12px "Space Mono"`)
      ]
      await Promise.all(faces.map(f => document.fonts.load(f, 'AaBbZz09')))
      await document.fonts.ready
      // check() is also true when a family has no @font-face at all, so also require loaded faces per family.
      const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, ''))
      return ['Schibsted Grotesk', 'Hanken Grotesk', 'Space Mono'].every(fam => loaded.includes(fam))
        && faces.every(f => document.fonts.check(f, 'AaBbZz09'))
    })
    expect(fontsReady, 'web fonts did not load (needs network access to Google Fonts)').toBe(true)
    await page.evaluate(async () => {
      // Scroll once so lazy-loaded images are fetched, then back to the top.
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise(res => setTimeout(res, 40))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle')
    // Every image must be finished (loaded or failed) before the shot.
    await page.waitForFunction(() => [...document.images].every(i => i.complete), undefined, { timeout: 15_000 })
    await expect(page).toHaveScreenshot(`${r.name}.png`, { fullPage: true })
  })
}
