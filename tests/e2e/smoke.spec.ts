// Opens every built page (every *.html in .output/public) at each width in the config and fails it on:
//   an uncaught error, a console.error, a hydration message, an empty <main>, or a <title> with "Nuxt" in it.
// Redirect stubs (a <meta http-equiv="refresh"> page, the 301 stubs under /highlights/) are not opened: the test
// checks that the stub's target is a built page, which is opened in its own test.
// Pages known to fail are listed, with a reason, in known-failures.txt; see the README.
import { test, expect, type ConsoleMessage } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../..')
const site = path.join(repo, '.output/public')
if (!fs.existsSync(site)) throw new Error('No .output/public. Build first: npm run build:search')

// Every *.html file, as the URL path a visitor would use (/about/index.html -> /about/).
function htmlFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) return htmlFiles(full)
    return e.name.endsWith('.html') ? [full] : []
  })
}
function urlPath(file: string): string {
  const rel = '/' + path.relative(site, file).split(path.sep).join('/')
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel
}
const pages = htmlFiles(site).map(f => ({ file: f, path: urlPath(f) })).sort((a, b) => a.path.localeCompare(b.path))
const refreshTarget = (html: string) => html.match(/<meta[^>]+http-equiv="refresh"[^>]+url=([^"]+)"/i)?.[1]

// known-failures.txt: one line per known failure, "path | width | reason", width 390, 1280 or both.
type Known = { path: string; width: string; reason: string }
const known: Known[] = fs.readFileSync(path.join(here, 'known-failures.txt'), 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  .map(l => {
    const [p, width, ...reason] = l.split('|').map(s => s.trim())
    if (!p || !['390', '1280', 'both'].includes(width) || !reason.join('|').trim()) {
      throw new Error(`known-failures.txt: bad line (want "path | 390|1280|both | reason"): ${l}`)
    }
    return { path: p, width, reason: reason.join('|').trim() }
  })

// Requests that the static build cannot answer, and the console noise they cause when they fail:
// - every other host (Google Fonts, YouTube, the Zeffy donation form, USGS), so a run does not depend on the network;
// - three paths that exist only on Netlify: /api/gage/ and /api/geo (edge functions in netlify/edge-functions/) and
//   /flooding-gages.json (a rewrite in public/_redirects to a file on GitHub). Locally they would answer 404.
// They are blocked; Chromium then logs "Failed to load resource" for each, and those lines, and only those, are not
// counted. A "Failed to load resource" for any other path on the site (a missing file of ours) is a failure.
const NETLIFY_ONLY = ['/api/gage/', '/api/geo', '/flooding-gages.json']
// An empty address (a message with no source) is not off-site: it counts.
const isOffSite = (url: string, base: string) =>
  !!url && (!url.startsWith(base + '/') || NETLIFY_ONLY.some(p => url.slice(base.length).startsWith(p)))

// 404.html and 200.html are Nuxt's client-side fallback shells, not pages: they render whatever route the address
// names. Netlify serves 404.html, with status 404, for any address that has no file. So each is opened the way a
// visitor meets it, at an address that does not exist (served here from the file), and must render a proper page.
// On that address Nuxt logs its own "Page not found" error (how it renders the 404), and Chromium logs the 404 status of
// the address itself; those two lines are not counted.
const SHELLS: Record<string, number> = { '/404.html': 404, '/200.html': 200 }
const MISSING = '/smoke-test-no-such-page/'

// Every line must name a page that is opened (not a redirect stub, which never runs as test.fail), and no page may be
// named twice, so that every line can fail when its page starts passing.
test('known-failures.txt names only opened pages, each once', () => {
  const opened = new Set(pages.filter(p => !refreshTarget(fs.readFileSync(p.file, 'utf8'))).map(p => p.path))
  expect(known.filter(k => !opened.has(k.path)).map(k => k.path), 'not an opened page').toEqual([])
  const seen = new Set<string>()
  const repeated = known.filter(k => { const r = seen.has(k.path); seen.add(k.path); return r }).map(k => k.path)
  expect(repeated, 'named more than once').toEqual([])
})

for (const pg of pages) {
  const target = refreshTarget(fs.readFileSync(pg.file, 'utf8'))
  if (target) {
    test(`${pg.path} (redirect stub)`, () => {
      const t = target.replace(/\/?$/, '/')
      const exists = fs.existsSync(path.join(site, t, 'index.html')) || fs.existsSync(path.join(site, target))
      expect(exists, `redirect target ${target} is not a built page`).toBe(true)
    })
    continue
  }

  test(pg.path, async ({ page, baseURL }, info) => {
    const k = known.find(x => x.path === pg.path && (x.width === 'both' || x.width === info.project.name))
    // test.fail: the test is expected to fail; if the page starts passing, Playwright reports it as a failure,
    // so the line must be removed and the list can only shrink.
    test.fail(!!k, k?.reason)

    const base = baseURL!
    const problems: string[] = []
    await page.route(url => isOffSite(url.href, base), route => route.abort())
    const shellStatus = SHELLS[pg.path]
    if (shellStatus) {
      await page.route(base + MISSING, route => route.fulfill({ status: shellStatus, contentType: 'text/html', body: fs.readFileSync(pg.file) }))
    }
    page.on('pageerror', err => problems.push(`uncaught error: ${err.message}`))
    page.on('console', (msg: ConsoleMessage) => {
      const text = msg.text()
      const where = msg.location().url ?? ''
      if (msg.type() === 'error' && text.startsWith('Failed to load resource') && isOffSite(where, base)) return
      if (shellStatus && text.startsWith('[nuxt] error caught during app initialization') && text.includes(`Page not found: ${MISSING}`)) return
      if (shellStatus === 404 && text.startsWith('Failed to load resource') && where === base + MISSING) return
      if (msg.type() === 'error') problems.push(`console.error: ${text}${where ? ` (${where})` : ''}`)
      else if (/hydrat/i.test(text)) problems.push(`console.${msg.type()} (hydration): ${text}`)
    })

    const res = await page.goto(shellStatus ? MISSING : pg.path, { waitUntil: 'networkidle' })
    expect(res?.status(), 'HTTP status').toBe(shellStatus ?? 200)

    const title = await page.title()
    if (/nuxt/i.test(title)) problems.push(`<title> contains "Nuxt": ${title}`)
    const mains = await page.locator('main').count()
    if (mains === 0) problems.push('no <main>')
    else {
      const text = (await page.locator('main').first().innerText()).trim()
      if (!text) problems.push('<main> has no text')
    }

    expect(problems, `${pg.path} at ${info.project.name}px`).toEqual([])
  })
}
