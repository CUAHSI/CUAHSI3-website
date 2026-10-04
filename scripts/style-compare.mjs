// Computed-style comparison: proves that a refactor changed no element's computed style.
//
//   node scripts/style-compare.mjs snapshot <out.json.gz> [route-filter]   record every element of every built page
//   node scripts/style-compare.mjs compare  <a.json.gz> <b.json.gz>        diff two snapshots, element by element
//
// A snapshot loads each page of .output/public (build first: npm run build:search) at 390px and 1280px, and records for
// every element in <body>: its tag, a short text key, about 70 computed properties and its box (x, y, width, height).
// Pages are paired element by element in document order, so it only works for changes that keep the markup structure
// (moving inline styles into classes does). Exit code 1 if any element differs.
// One declared difference: the style and colour of a border side with zero width are ignored (it draws nothing).
// (A ", sans-serif" font-family fallback was considered and dropped: it changes how glyphs missing from the web font draw.)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { chromium } from '@playwright/test'

const PROPS = [
  'display', 'position', 'float', 'visibility', 'opacity', 'z-index', 'overflow-x', 'overflow-y', 'box-sizing',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-items', 'align-self', 'align-content',
  'justify-content', 'justify-items', 'justify-self', 'order', 'row-gap', 'column-gap', 'grid-template-columns',
  'grid-template-rows', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end', 'grid-auto-flow',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'color', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant-caps', 'line-height', 'letter-spacing',
  'text-align', 'text-transform', 'text-decoration-line', 'text-decoration-color', 'text-overflow', 'white-space',
  'word-break', 'overflow-wrap', 'vertical-align', 'list-style-type', 'cursor', 'box-shadow', 'transform',
  'transition-property', 'transition-duration', 'animation-name', 'object-fit', 'object-position', 'aspect-ratio',
  'pointer-events', 'outline-style', 'outline-width', 'outline-color', 'fill', 'stroke'
]

const root = path.resolve(process.env.STYLE_ROOT || '.output/public')   // STYLE_ROOT: compare a build somewhere else
const widths = [390, 1280]

function routes(filter) {
  const acc = []
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name === 'index.html') acc.push('/' + path.relative(root, path.dirname(p)).replace(/^\.$/, '') + (path.dirname(p) === root ? '' : '/'))
    }
  }
  walk(root)
  const all = [...new Set(acc)].sort().map(r => (r === '' ? '/' : r))
  return filter ? all.filter(r => r.includes(filter)) : all
}

function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' }
  const server = http.createServer((req, res) => {
    let p
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname) } catch { res.writeHead(400); return res.end() }
    let f = path.join(root, p)
    if (f !== root && !f.startsWith(root + path.sep)) { res.writeHead(403); return res.end() }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found') }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' })
    fs.createReadStream(f).pipe(res)
  })
  return new Promise(r => server.listen(0, () => r(server)))
}

// Runs in the page: one record per element in <body>, in document order.
function collect(props) {
  const out = []
  const els = [document.body, ...document.body.querySelectorAll('*')]
  for (const el of els) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue
    const cs = getComputedStyle(el)
    const vec = props.map(p => cs.getPropertyValue(p))
    const r = el.getBoundingClientRect()
    out.push({
      t: el.tagName.toLowerCase(),
      x: (el.childNodes && [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue.trim()).join(' ').slice(0, 24)) || '',
      v: vec.join('\u0001'),
      b: [r.x, r.y, r.width, r.height].map(n => Math.round(n * 10) / 10).join(',')
    })
  }
  return out
}

async function snapshot(outFile, filter) {
  const server = await serve()
  const port = server.address().port
  const browser = await chromium.launch()
  const list = routes(filter)
  const jobs = []
  for (const r of list) for (const w of widths) jobs.push({ r, w })
  const dict = new Map()   // vector string -> index
  const vectors = []
  const pages = {}
  const fontCache = new Map()
  let done = 0
  async function worker() {
    const ctxs = {}
    while (jobs.length) {
      const { r, w } = jobs.shift()
      try {
        if (!ctxs[w]) {
          ctxs[w] = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
          await ctxs[w].route(/zeffy\.com|img\.youtube\.com/, route => route.abort())
          await ctxs[w].route(/fonts\.(googleapis|gstatic)\.com/, async route => {
            const url = route.request().url()
            let hit = fontCache.get(url)
            if (!hit) {
              const res = await route.fetch()
              const { 'content-encoding': _e, 'content-length': _l, ...headers } = res.headers()
              hit = { status: res.status(), headers, body: await res.body() }
              if (hit.status === 200) fontCache.set(url, hit)
            }
            await route.fulfill(hit)
          })
        }
        const page = await ctxs[w].newPage()
        await page.clock.install({ time: new Date('2026-10-01T12:00:00Z') })
        await page.goto(`http://localhost:${port}${r}`, { waitUntil: 'networkidle', timeout: 60000 })
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
        const ok = await page.evaluate(async () => {
          const faces = [...[500, 600, 700, 800].map(x => `${x} 20px "Schibsted Grotesk"`), ...[400, 500, 600, 700].map(x => `${x} 16px "Hanken Grotesk"`), ...[400, 700].map(x => `${x} 12px "Space Mono"`)]
          await Promise.all(faces.map(f => document.fonts.load(f, 'AaBbZz09')))
          await document.fonts.ready
          for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(res => setTimeout(res, 30)) }
          window.scrollTo(0, 0)
          return ['Schibsted Grotesk', 'Hanken Grotesk', 'Space Mono'].every(fam => [...document.fonts].some(f => f.status === 'loaded' && f.family.replace(/["']/g, '') === fam))
        })
        if (!ok) throw new Error('web fonts did not load')
        await page.waitForLoadState('networkidle')
        await page.waitForFunction(() => [...document.images].every(i => i.complete), undefined, { timeout: 15000 })
        const recs = await page.evaluate(collect, PROPS)
        pages[`${r}@${w}`] = recs.map(e => {
          let idx = dict.get(e.v)
          if (idx === undefined) { idx = vectors.length; dict.set(e.v, idx); vectors.push(e.v) }
          return [e.t, e.x, idx, e.b]
        })
        await page.close()
      } catch (e) {
        pages[`${r}@${w}`] = { error: String(e.message).split('\n')[0] }
      }
      done++
    }
    for (const c of Object.values(ctxs)) await c.close()
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  // Interaction states that are not on the page when it loads (a closed dialog has no elements to compare).
  if (!filter) {
    const STATES = [
      { key: '/@search', w: 1280, path: '/', act: async page => { await page.getByRole('button', { name: /^Search/ }).click(); await page.waitForSelector('[role=dialog]') } },
      { key: '/@menu', w: 390, path: '/', act: async page => { await page.getByRole('button', { name: 'Open menu' }).click(); await page.waitForSelector('#mobile-menu') } },
      { key: '/learn-train/cyberseminars/@open', w: 1280, path: '/learn-train/cyberseminars/', act: async page => { await page.getByRole('button', { name: /^Play video:/ }).first().click(); await page.waitForSelector('text=Close video') } },
      { key: '/hire-cuahsi/@lookup', w: 1280, path: '/hire-cuahsi/', act: async page => { await page.getByLabel('Find your institution').fill('university'); await page.waitForTimeout(300) } },
      { key: '/community/jobs/@filtered', w: 1280, path: '/community/jobs/', act: async page => { await page.locator('main button[aria-pressed="false"]').first().click(); await page.waitForTimeout(300) } },
    ]
    for (const st of STATES) {
      try {
        const ctx = await browser.newContext({ viewport: { width: st.w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
        await ctx.route(/zeffy\.com|img\.youtube\.com|youtube-nocookie\.com/, route => route.abort())
        await ctx.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
          const url = route.request().url(); let hit = fontCache.get(url)
          if (!hit) { const res = await route.fetch(); const { 'content-encoding': _e, 'content-length': _l, ...headers } = res.headers(); hit = { status: res.status(), headers, body: await res.body() }; if (hit.status === 200) fontCache.set(url, hit) }
          await route.fulfill(hit)
        })
        const page = await ctx.newPage()
        await page.clock.install({ time: new Date('2026-10-01T12:00:00Z') })
        await page.goto(`http://localhost:${port}${st.path}`, { waitUntil: 'networkidle', timeout: 60000 })
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
        await page.evaluate(async () => { await document.fonts.ready })
        await st.act(page)
        await page.waitForTimeout(400)
        const recs = await page.evaluate(collect, PROPS)
        pages[`${st.key}@${st.w}`] = recs.map(e => {
          let idx = dict.get(e.v)
          if (idx === undefined) { idx = vectors.length; dict.set(e.v, idx); vectors.push(e.v) }
          return [e.t, e.x, idx, e.b]
        })
        await ctx.close()
      } catch (e) {
        pages[`${st.key}@${st.w}`] = { error: String(e.message).split('\n')[0] }
      }
    }
  }
  await browser.close(); server.close()
  const errors = Object.entries(pages).filter(([, v]) => v.error)
  fs.writeFileSync(outFile, zlib.gzipSync(JSON.stringify({ props: PROPS, vectors, pages })))
  const els = Object.values(pages).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0)
  console.log(`snapshot ${outFile}: ${list.length} pages x ${widths.length} widths, ${els} elements, ${vectors.length} distinct style vectors, ${errors.length} errors`)
  for (const [k, v] of errors.slice(0, 5)) console.log('  ERROR', k, v.error)
  if (errors.length) process.exitCode = 1
}

const norm = (prop, v) => v   // no declared value differences (the font-family fallback idea was dropped: it changes how fallback glyphs such as arrows draw)

// Layout values are measured, and the same build measures a text width a hair differently from run to run
// (0.02px). Numbers inside a value are therefore compared with a tolerance of 0.5px; everything else exactly.
const TOL = 0.5
const NUM = /-?\d+(?:\.\d+)?/g
function same(a, b) {
  if (a === b) return true
  if (a.replace(NUM, '#') !== b.replace(NUM, '#')) return false
  const na = a.match(NUM) || [], nb = b.match(NUM) || []
  return na.length === nb.length && na.every((n, i) => Math.abs(parseFloat(n) - parseFloat(nb[i])) <= TOL)
}

function compare(fa, fb) {
  const A = JSON.parse(zlib.gunzipSync(fs.readFileSync(fa)))
  const B = JSON.parse(zlib.gunzipSync(fs.readFileSync(fb)))
  const props = A.props
  let pagesDiff = 0, elsDiff = 0, els = 0, structure = 0
  const shown = []
  const keys = [...new Set([...Object.keys(A.pages), ...Object.keys(B.pages)])].sort()
  for (const k of keys) {
    const pa = A.pages[k], pb = B.pages[k]
    if (!Array.isArray(pa) || !Array.isArray(pb)) { pagesDiff++; structure++; shown.push(`${k}: missing or error (${pa?.error || pb?.error || 'absent in one snapshot'})`); continue }
    if (pa.length !== pb.length) { pagesDiff++; structure++; shown.push(`${k}: ${pa.length} elements before, ${pb.length} after (structure changed)`); continue }
    let pageDiff = 0
    for (let i = 0; i < pa.length; i++) {
      els++
      const [ta, xa, ia, ba] = pa[i], [tb, xb, ib, bb] = pb[i]
      const diffs = []
      if (ta !== tb) diffs.push(`tag ${ta} -> ${tb}`)
      if (xa !== xb) diffs.push(`text '${xa}' -> '${xb}'`)
      if (!same(ba, bb)) diffs.push(`box ${ba} -> ${bb}`)
      // The two snapshots have separate dictionaries, so compare the vectors themselves, never their indices.
      if (A.vectors[ia] !== B.vectors[ib]) {
        const va = A.vectors[ia].split('\u0001'), vb = B.vectors[ib].split('\u0001')
        props.forEach((p, j) => {
          // A border side with zero width draws nothing, so its style and colour do not count (declared deviation:
          // `border: none` and `border-width: 0` leave different, invisible leftovers).
          const bm = p.match(/^border-(top|right|bottom|left)-(style|color)$/)
          if (bm) {
            const w = props.indexOf(`border-${bm[1]}-width`)
            if (va[w] === '0px' && vb[w] === '0px') return
          }
          if (!same(norm(p, va[j]), norm(p, vb[j]))) diffs.push(`${p}: ${va[j]} -> ${vb[j]}`)
        })
      }
      if (diffs.length) {
        pageDiff++; elsDiff++
        if (shown.length < 25) shown.push(`${k} element ${i} <${ta}> '${xa}': ${diffs.slice(0, 4).join(' | ')}`)
      }
    }
    if (pageDiff) pagesDiff++
  }
  console.log(`compared ${keys.length} page-widths, ${els} elements: ${elsDiff} elements differ on ${pagesDiff} page-widths${structure ? ` (${structure} with a structure change)` : ''}`)
  for (const s of shown) console.log('  ' + s)
  if (elsDiff || pagesDiff) process.exitCode = 1
}

const [mode, a, b] = process.argv.slice(2)
if (mode === 'snapshot' && a) await snapshot(a, b)
else if (mode === 'compare' && a && b) compare(a, b)
else { console.error('usage: node scripts/style-compare.mjs snapshot <out.json.gz> [route-filter] | compare <a.json.gz> <b.json.gz>'); process.exit(2) }
