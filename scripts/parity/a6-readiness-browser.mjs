#!/usr/bin/env node
// Site audit, task A6 (org issue 111), step 2 of 2: what a browser shows on the pages visitors use most. Needs a LOCAL build served on a port; it refuses any other host.
//
//   npx serve .output/public -l 4106        (in another shell)
//   node scripts/parity/a6-readiness-browser.mjs --base http://localhost:4106 [--public .output/public] [--extra /hire-cuahsi,/about/membership] [--out agent/audit]
//
// Pages: the new-site counterpart of each of the 12 legacy pages with most Search Console clicks (6 Oct to 6 Nov export, cuahsi.org host). The counterpart is the agent's
// choice, listed below; two of the 12 have none. Per page at 1280 and at 390 px: the October audit's findings H1 to H10 re-checked by the same kind of test, plus transfer
// weight, requests, outside hosts, load time, largest paint and layout shift (desktop). Also the 404 page, and the five largest built pages by HTML size.
// Nothing leaves the machine except fonts, which are blocked (the page is measured without them and the report says so).
// The contrast test walks up to the first opaque background; text over a gradient or an image is counted as "not scored", not as a pass (the October audit scored the worst stop).
// Writes <out>/a6_browser.json and a6_browser_pages.csv. File names carry no date (the owner's rule for in-progress files).
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const BASE = String(argv.base || ''), OUT = String(argv.out || 'agent/audit')
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) { console.error('--base must be a local server, e.g. http://localhost:4106'); process.exit(1) }

const TOP = [
  [1, '/', '/'], [2, '/job-board', '/community/jobs'], [3, '/summer-institute', '/learn-train/programs/summer-institute'], [4, '/data-services/matlab', null],
  [5, '/students/graduate-programs-in-water-science', '/learn-train/graduate-programs'], [6, '/about/our-team', '/about/team'], [7, '/workshops/snow-measurement-field-school-2026', '/learn-train/programs/snow-field-school'],
  [8, '/workshops/hydrolearn-ciroh-may-june-2026-workshop-and-hackathon', '/community/events/hydrolearn-ciroh-workshop-2026'], [9, '/virtual-university', '/learn-train/programs/virtual-university'],
  [10, '/students/graduate-programs-in-water-science/ph-d', '/learn-train/graduate-programs'], [11, '/data-services/hydroshare', '/data-platforms'], [12, '/grant-opportunities', null],
]
const distinct = [...new Set(TOP.map(t => t[2]).filter(Boolean))]
// five largest built pages by HTML size, from the build next to this script's working directory
const pubDir = String(argv.public || '.output/public')
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['_nuxt', 'pagefind', 'api', '__sitemap__'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)])
const big = fs.existsSync(pubDir) ? walk(pubDir).filter(f => f.endsWith('index.html')).map(f => ({ r: '/' + path.relative(pubDir, f).replace(/index\.html$/, '').replace(/\/$/, ''), b: fs.statSync(f).size })).sort((a, b) => b.b - a.b).slice(0, 5).map(x => x.r || '/') : []
const extra = String(argv.extra || '').split(',').filter(Boolean)  // pages where October's findings were: re-checked even though they are not in the top 12
const heavy = [...new Set([...big, ...extra])].filter(r => !distinct.includes(r))

const inPage = () => {
  const out = { clickable_div: 0, menu_button_named: null, unlabeled_fields: 0, fields: 0, outline_none_inline: 0, skip_link: false, h1: document.querySelectorAll('h1').length, landmarks: ['header,[role=banner]', 'nav', 'main', 'footer,[role=contentinfo]'].map(s => !!document.querySelector(s)), heading_skips: 0, links_no_name: 0, buttons_no_name: 0, scroll_overflow: document.documentElement.scrollWidth - window.innerWidth, contrast_fail: 0, contrast_scored: 0, contrast_unscored: 0, dup_ids: 0 }
  const first = document.querySelector('a[href],button,input,select,textarea'); out.skip_link = !!first && first.tagName === 'A' && (first.getAttribute('href') || '').startsWith('#')
  for (const el of document.querySelectorAll('div,span,li,img,svg,p')) { const cs = getComputedStyle(el); if (cs.cursor === 'pointer' && !el.closest('a,button,[role=button],[role=link],label,select,summary') && !el.querySelector('a,button,[tabindex]') && el.getAttribute('tabindex') === null && cs.display !== 'none') out.clickable_div++ }
  for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')) { if (!el.offsetParent) continue; out.fields++; const id = el.id; const lab = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label') || (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) || el.getAttribute('title'); if (!lab) out.unlabeled_fields++ }
  out.outline_none_inline = [...document.querySelectorAll('[style]')].filter(e => /outline\s*:\s*(none|0)/i.test(e.getAttribute('style'))).length
  let prev = 0; for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) { const l = +h.tagName[1]; if (prev && l > prev + 1) out.heading_skips++; prev = l }
  const nameOf = e => (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.textContent.trim() || e.querySelector('img[alt]:not([alt=""])') || e.getAttribute('title') || '')
  for (const a of document.querySelectorAll('a[href]')) if (a.offsetParent && !nameOf(a)) out.links_no_name++
  for (const b of document.querySelectorAll('button')) if (b.offsetParent && !nameOf(b)) out.buttons_no_name++
  const ids = {}; for (const e of document.querySelectorAll('[id]')) ids[e.id] = (ids[e.id] || 0) + 1; out.dup_ids = Object.values(ids).filter(n => n > 1).length
  const parse = c => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null }
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el)
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.opacity === '0') continue
    let bg = null, e = el, unscored = false
    while (e) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none') { unscored = true; break } const c = parse(s.backgroundColor); if (c && c[3] === 1) { bg = c; break } e = e.parentElement }
    if (unscored) { out.contrast_unscored++; continue } if (!bg) bg = [255, 255, 255, 1]
    const fg = parse(cs.color); if (!fg) continue; const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    const px = parseFloat(cs.fontSize), large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700); out.contrast_scored++; if (ratio < (large ? 3 : 4.5) && fg[3] === 1) out.contrast_fail++
  }
  return out
}

const browser = await chromium.launch()
const rows = [], detail = {}
for (const route of [...distinct, ...heavy]) {
  const rec = { route, heavy_only: heavy.includes(route) ? 1 : 0 }
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }), page = await ctx.newPage()
    const outside = new Set(); let bytes = 0, reqs = 0
    await page.route('**/*', r => { const u = new URL(r.request().url()); if (!/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) { outside.add(u.hostname); return r.abort() } return r.continue() })
    page.on('response', async res => { try { const b = await res.body(); bytes += b.length; reqs++ } catch {} })
    await page.addInitScript(() => { window.__lcp = 0; window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) })
    const resp = await page.goto(BASE + route, { waitUntil: 'networkidle' }); await page.waitForTimeout(400)
    const r = await page.evaluate(inPage)
    const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), imgs: document.images.length, big_imgs: [...document.images].filter(i => i.naturalWidth > 1.5 * i.clientWidth && i.clientWidth > 0).length } })
    if (tag === 'm') {
      const btn = await page.$('header button[aria-controls="mobile-menu"]'); r.menu_button_named = btn ? !!((await btn.getAttribute('aria-label')) || (await btn.innerText()).trim()) : null; r.menu_button_expanded_attr = btn ? (await btn.getAttribute('aria-expanded')) !== null : null
    } else {
      const sb = await page.$('button:has-text("Search")'); r.search_dialog_role = null
      if (sb && await sb.isVisible()) { await sb.click(); await page.waitForTimeout(300); r.search_dialog_role = !!(await page.$('[role=dialog]')); r.search_input_labelled = await page.evaluate(() => { const i = document.querySelector('input[type=search],input[placeholder*=earch]'); return !!(i && (i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || document.querySelector(`label[for="${i.id}"]`))) }) }
    }
    Object.assign(rec, Object.fromEntries(Object.entries({ ...r, ...nav, status: resp.status(), bytes, requests: reqs, outside_hosts: [...outside].join(' ') }).map(([k, v]) => [`${tag}_${k}`, Array.isArray(v) ? v.join('/') : v])))
    await ctx.close()
  }
  rows.push(rec)
}
// 404
const c404 = await browser.newContext({ viewport: { width: 1280, height: 900 } }), p404 = await c404.newPage()
await p404.route('**/*', r => (/^(localhost|127\.0\.0\.1)$/.test(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
const r404 = await p404.goto(BASE + '/this-page-does-not-exist-a6', { waitUntil: 'networkidle' }); await p404.waitForTimeout(500)
const notFound = { status: r404.status(), title: await p404.title(), h1: await p404.evaluate(() => [...document.querySelectorAll('h1')].map(h => h.textContent.trim())), text: (await p404.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300), links_home: await p404.evaluate(() => !!document.querySelector('main a[href="/"],a[href="/"]')) }
await c404.close(); await browser.close()
const cols = [...new Set(rows.flatMap(r => Object.keys(r)))]
fs.writeFileSync(path.join(OUT, 'a6_browser_pages.csv'), [cols.join(','), ...rows.map(r => cols.map(c => { const s = r[c] === undefined ? '' : String(r[c]); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }).join(','))].join('\n') + '\n')
fs.writeFileSync(path.join(OUT, 'a6_browser.json'), JSON.stringify({ base: BASE, top: TOP, distinct_counterparts: distinct.length, heavy_checked: heavy, notFound, rows }, null, 2) + '\n')
console.log(JSON.stringify({ notFound, rows: rows.map(r => ({ route: r.route, d_bytes: r.d_bytes, d_requests: r.d_requests, d_lcp: r.d_lcp, d_cls: r.d_cls, d_clickable_div: r.d_clickable_div, m_overflow: r.m_scroll_overflow, d_contrast: `${r.d_contrast_fail}/${r.d_contrast_scored}+${r.d_contrast_unscored}`, d_search_dialog: r.d_search_dialog_role, m_menu_named: r.m_menu_button_named, d_unlabeled: `${r.d_unlabeled_fields}/${r.d_fields}`, skip: r.d_skip_link })) }, null, 2))
