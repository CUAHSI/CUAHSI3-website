#!/usr/bin/env node
// Site audit, task A5 (org issue 110), step 2 of 3: what a visitor can DO on this site, tried in a browser. The site is served from the local build
// (npx serve .output/public -l 4105), so nothing leaves this machine except the page's own outward embeds, which are blocked here. Nothing is typed into
// a field except search words and filter words; no field gets a name, e-mail address or message; the two forms that do nothing are only clicked empty,
// and every request the click makes is recorded.
//
//   node scripts/parity/a5-behaviour-new.mjs [--base http://localhost:4105] [--out agent/audit] [--date 261106]
//
// Writes agent/audit/a5-behaviour-new-<d>.json (every observation) and prints it. Run on a build made with `npm run build:search`.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const BASE = String(argv.base || 'http://localhost:4105'), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE) && !argv['allow-remote']) { console.error('refusing: --base must be localhost (the test clicks controls); pass --allow-remote to override'); process.exit(2) }
const obs = {}
const browser = await chromium.launch()
const newPage = async (w, h = 900) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }), page = await ctx.newPage()
  // keep every outward request on this machine: record it and refuse it
  page.external = []
  await page.route(u => !u.href.startsWith(BASE), r => { page.external.push(r.request().method() + ' ' + new URL(r.request().url()).hostname); r.abort() })
  return page
}
const go = async (page, p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(400) }

// 1. site search, at desktop and phone width
for (const [label, w] of [['desktop 1280', 1280], ['phone 390', 390]]) {
  const page = await newPage(w), res = { visible_button: false, queries: {} }
  await go(page, '/')
  const btn = page.getByRole('button', { name: /^Search/ }).first()
  res.visible_button = await btn.isVisible().catch(() => false)
  res.keyboard_shortcut_opens_dialog = null
  if (!res.visible_button) {
    // maybe the mobile menu has it
    const burger = page.locator('button[aria-label*="enu" i], button[aria-label*="av" i]').first()
    if (await burger.count()) { await burger.click().catch(() => {}); await page.waitForTimeout(300); res.search_in_mobile_menu = await page.getByRole('button', { name: /^Search/ }).first().isVisible().catch(() => false) }
    res.search_inputs_anywhere_on_home = await page.locator('input[type=search],input[placeholder*=earch i]').count()
  } else {
    for (const q of ['streamflow', 'code of conduct', 'hydroshare', 'zzqxqx']) {
      await go(page, '/'); await page.getByRole('button', { name: /^Search/ }).first().click()
      const box = page.getByRole('dialog').getByRole('textbox'); await box.fill(q); await page.waitForTimeout(1500)
      const items = page.getByRole('dialog').locator('button.w-full'), n = await items.count()
      const titles = []; for (let i = 0; i < Math.min(n, 3); i++) titles.push((await items.nth(i).locator('p').first().innerText()).trim())
      res.queries[q] = { results: n, first_titles: titles, said_no_results: await page.getByText('No results for').count() > 0 }
    }
    // does a result take you to a page?
    await go(page, '/'); await page.getByRole('button', { name: /^Search/ }).first().click()
    await page.getByRole('dialog').getByRole('textbox').fill('code of conduct'); await page.waitForTimeout(1500)
    const first = page.getByRole('dialog').locator('button.w-full').first()
    if (await first.count()) { await first.click(); await page.waitForTimeout(800); res.click_first_result_lands_on = new URL(page.url()).pathname }
  }
  res.outward_requests_refused = page.external
  obs['search ' + label] = res; await page.context().close()
}

// 2. lists: how many items, which controls change what is shown
const countLinks = (page, prefix) => page.locator(`main a[href^="${prefix}"]`).evaluateAll(a => new Set(a.map(x => x.getAttribute('href'))).size)
for (const [route, prefix] of [['/community/events', '/community/events/'], ['/community/jobs', null], ['/community/news', '/community/news/'], ['/community/newsletter', '/community/newsletter/'], ['/learn-train/cyberseminars', null], ['/about/impact', '/about/impact/'], ['/about/documents', null], ['/data-platforms/portals', null], ['/learn-train/graduate-programs', null], ['/about/membership', null]]) {
  const page = await newPage(1280, 1000), res = {}
  await go(page, route)
  res.list_items_link_count = prefix ? await countLinks(page, prefix) : null
  res.buttons = await page.locator('main button').evaluateAll(b => b.map(x => (x.innerText || x.getAttribute('aria-label') || '').trim().slice(0, 28)).filter(Boolean).slice(0, 40))
  res.text_inputs = await page.locator('main input[type=text],main input[type=search],main input:not([type])').count()
  res.selects = await page.locator('main select').count()
  res.has_next_page_or_load_more = await page.getByText(/load more|show more|next page|older|^next$/i).count()
  res.table_rows_or_list_rows = await page.locator('main [role=row],main tbody tr').count()
  // a filter: type a word into the first text input and count rows before and after
  const input = page.locator('main input[type=text],main input[type=search],main input:not([type])').first()
  if (await input.count()) {
    const sel = route === '/about/membership' ? 'h3' : '[role=row],tbody tr'; const before = await page.locator('main ' + sel).count()
    await input.fill('water'); await page.waitForTimeout(500)
    res.filter_word_water = { rows_before: before, rows_after: await page.locator('main ' + sel).count() }
    await input.fill('zzqxqx'); await page.waitForTimeout(500)
    res.filter_word_nonsense_rows = await page.locator('main ' + sel).count()
  }
  res.external_requests_refused = page.external
  obs['list ' + route] = res; await page.context().close()
}

// 3. the two controls that look like forms and are not wired: click with every field empty, record the requests
for (const [name, route, label] of [['home newsletter box', '/', /^Subscribe$/], ['hire quote form', '/hire-cuahsi', /Send request/]]) {
  const page = await newPage(1280, 1000), reqs = []
  page.on('request', r => reqs.push(r.method() + ' ' + new URL(r.url()).pathname))
  await go(page, route); const before = new URL(page.url()).pathname + new URL(page.url()).search; reqs.length = 0
  const b = page.getByRole('button', { name: label }).first()
  await b.scrollIntoViewIfNeeded(); await b.click({ noWaitAfter: true }); await page.waitForTimeout(1500)
  obs[name] = { clicked_with_empty_fields: true, requests_after_click: reqs.filter(r => !/\.(js|css|woff2?|png|jpg|svg)$/.test(r)), url_changed: before !== new URL(page.url()).pathname + new URL(page.url()).search, outward_requests_refused: page.external, visible_message_after_click: await page.getByText(/thank|received|sent|success|subscribed/i).count() }
  await page.context().close()
}

// 4. donate, contact, jobs posting, registration, recordings, documents
{
  const page = await newPage(1280, 1000)
  await go(page, '/support'); obs['donate /support'] = { iframes: await page.locator('iframe').evaluateAll(f => f.map(x => new URL(x.src).hostname + new URL(x.src).pathname.replace(/[0-9a-f-]{36}/, '<id>'))), links_to_other_donation_services: await page.locator('a[href*=paypal],a[href*=donorbox],a[href*=stripe]').count() }
  await go(page, '/contact'); obs['contact /contact'] = { mailto_links: await page.locator('a[href^="mailto:"]').count(), forms: await page.locator('form').count(), tel_links: await page.locator('a[href^="tel:"]').count() }
  await go(page, '/community/jobs'); obs['jobs /community/jobs'] = { post_a_job_links: await page.locator('a[href*=jotform]').evaluateAll(a => [...new Set(a.map(x => new URL(x.href).hostname + new URL(x.href).pathname.replace(/\d{10,}/, '<id>')))]), job_cards: await page.locator('main a[target=_blank]').count() }
  await go(page, '/about/documents'); obs['documents /about/documents'] = { links: await page.locator('main a[href$=".pdf"]').count(), distinct_pdf_links: await page.locator('main a[href$=".pdf"]').evaluateAll(a => new Set(a.map(x => x.getAttribute('href'))).size), first_five: await page.locator('main a[href$=".pdf"]').evaluateAll(a => a.slice(0, 5).map(x => x.getAttribute('href'))) }
  await go(page, '/learn-train/cyberseminars')
  const playSel = '[aria-label^="Play video:"]', play = page.locator(playSel).first()
  obs['recordings /learn-train/cyberseminars'] = { seminars_on_page: await page.locator('main [class*="card-lift"]').count(), play_controls: await page.locator(playSel).count() }
  if (await play.count()) { await play.click(); await page.waitForTimeout(800); obs['recordings /learn-train/cyberseminars'].iframe_after_click = await page.locator('iframe').evaluateAll(f => f.map(x => new URL(x.src).hostname)) ; obs['recordings /learn-train/cyberseminars'].outward_requests_refused = page.external }
  await page.context().close()
}
await browser.close()
// outward requests are kept as counts per host (the page tried to reach them and the route above refused)
const hostCounts = a => Array.isArray(a) ? Object.fromEntries(Object.entries(a.reduce((o, x) => ((o[x.split(' ')[1]] = (o[x.split(' ')[1]] || 0) + 1), o), {})).sort()) : a
for (const v of Object.values(obs)) for (const k of Object.keys(v)) if (/refused$/.test(k)) v[k] = hostCounts(v[k])
fs.writeFileSync(path.join(OUT, `a5-behaviour-new-${DATE}.json`), JSON.stringify(obs, null, 2) + '\n')
console.log('written', Object.keys(obs).length, 'observations')
