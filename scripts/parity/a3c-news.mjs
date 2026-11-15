#!/usr/bin/env node
// Site audit, task A3c (org issue 104): the news posts and newsletter issues, legacy site against this site.
//
//   node scripts/parity/a3c-news.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages/community/news [--hand agent/audit/a3c-hand-match-261109.csv] [--out agent/audit]
//
// Reads ONLY the saved legacy pages (raw/legacy-site/<date>/pages/community/news, written by scripts/parity/fetch.mjs), content/news,
// content/newsletter, a few other content folders (to look for an item that lives elsewhere), and agent/audit/cutover-<d>-urls.csv; it never
// touches the network. Writes agent/audit/:
//   a3c-legacy-<d>.csv      one row per legacy post (the listing pages p2..p7 are not posts): title, posted date, kind, words, links
//   a3c-new-<d>.csv         one row per file of content/news and content/newsletter, with the legacy post it was matched to
//   a3c-match-<d>.csv       each legacy post with its best match here, the level, the evidence, and the posts that are newsletter on one side and news on the other
//   a3c-facts-<d>.csv       for each matched pair: date, title, links, numbers, e-mail addresses (counts only; the legacy site hides them behind a script that is not decoded here) and the Mailchimp id, side by side
//   a3c-elsewhere-<d>.csv   legacy posts and new items with no match, and their best candidate in another collection
//   a3c-numbers-<d>.json    counts, and the comparison with the hand-matched control
// A legacy post is one /community/news/<slug> page that the listing pages (news, p2..p7) link to. Its date is the "Posted" line.
// Match levels, as in October's parity analysis (agent/reports/261005_parity-stage4.md, section 1) and never raised to improve a number:
//   exact    a new news file whose source_url is the legacy page; or a "CUAHSI e-Newsletter <Month> <Year>" post and the issue of that month; or
//            the title words are the same (case, punctuation, 4-digit years, words of fewer than 3 letters and the words the, and, for, with,
//            free, part ignored) and the dates are within 3 days
//   probable the title words overlap by 0.6 or more (Jaccard) and the dates are within 60 days
//   weak     overlap of 0.4 or more within 60 days, or 0.5 or more within 180 days, or 0.3 or more on the same day
//   possible the same day and some overlap below 0.3 (shown for a person to confirm; not counted as matched)
//   none
// "Matched" in the counts means exact or probable. The facts are compared only for matched pairs.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : ''
if (!SNAP) { console.error('usage: a3c-news.mjs --snapshot <folder> [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
const readCsv = file => {
  const rows = []; let row = [], cell = '', q = false; const t = fs.readFileSync(file, 'utf8')
  for (let i = 0; i < t.length; i++) { const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += c }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  const h = rows.shift(); return rows.filter(r => r.length > 1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])))
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = n => String(n).padStart(2, '0')
const dayNum = s => (s ? Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400000 : NaN)
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const STOP = new Set(['the', 'and', 'for', 'with', 'free', 'part'])
const words = s => new Set((s ?? '').toLowerCase().replace(/\b20\d\d\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w)))
const jaccard = (a, b) => { const i = [...a].filter(x => b.has(x)).length, u = new Set([...a, ...b]).size; return u ? i / u : 0 }
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x))
const nWords = s => (s.match(/[A-Za-z0-9’'-]+/g) ?? []).length

// ---- links, numbers, addresses --------------------------------------------------------------------------------------
const normUrl = u => { try { const x = new URL(u.trim()); x.hash = ''; for (const k of [...x.searchParams.keys()]) if (/^utm_/.test(k)) x.searchParams.delete(k)
  return (x.hostname.replace(/^www\./, '').toLowerCase() + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase() } catch { return '' } }
const isSite = n => /^cuahsi\.org(\/|$)/.test(n)
const urlsIn = text => [...new Set((text.match(/https?:\/\/[^\s)>\]"'<]+/g) ?? []).map(u => normUrl(u.replace(/[.,;]+$/, ''))).filter(Boolean))]
const MAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const mailsIn = text => [...new Set((text.match(MAIL) ?? []).map(s => s.toLowerCase()))]
const numsIn = text => new Set((text.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{1,2}\b/g, ' ').match(/\$?\d[\d,]*(?:\.\d+)?%?/g) ?? []).map(s => s.replace(/,/g, '')).filter(s => s.replace(/\D/g, '').length >= 2 || /[$%]/.test(s)))
const MC = /campaign-archive\.com\/\?u=[a-f0-9]+(?:&amp;|&)id=([a-f0-9]+)/i

// ---- the legacy posts -----------------------------------------------------------------------------------------------
const listing = new Set()
for (const f of fs.readdirSync(SNAP).filter(f => /^p\d+\.html$/.test(f)).map(f => path.join(SNAP, f)).concat([path.join(SNAP, '..', 'news.html')])) {
  if (!fs.existsSync(f)) continue
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/href="https:\/\/www\.cuahsi\.org\/community\/news\/([^"#?]+)"/g)) if (!/^p\d+$/.test(m[1])) listing.add(m[1])
}
const cut = path.join(OUT, `cutover-${DATE}-urls.csv`)
const cutRows = fs.existsSync(cut) ? new Map(readCsv(cut).map(r => [r.url.replace(/\/+$/, ''), r])) : new Map()
const legacy = []
for (const f of fs.readdirSync(SNAP).filter(f => f.endsWith('.html') && !/^p\d+\.html$/.test(f)).sort()) {
  const slug = f.replace(/\.html$/, ''); const $ = cheerio.load(fs.readFileSync(path.join(SNAP, f), 'utf8'))
  const box = $('.jobs.detail').first(); const title = box.find('h2').first().text().replace(/\s+/g, ' ').trim()
  const pm = /Posted ([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/.exec(box.find('h3').first().text()); const posted = pm ? `${pm[3]}-${pad(MONTHS.findIndex(x => x.startsWith(pm[1])) + 1)}-${pad(+pm[2])}` : ''
  const html = box.html() ?? ''
  const hidden = (html.match(/email hidden; JavaScript is required/g) ?? []).length // the site hides addresses behind a script; counted, not decoded
  box.find('script, style').remove(); box.find('h2').first().remove(); box.find('h3').filter((_, e) => /^\s*Posted /.test($(e).text())).first().remove()
  const hrefs = box.find('a[href]').map((_, a) => $(a).attr('href')).get()
  const text = box.text().replace(/\s+/g, ' ').trim()
  const url = `https://www.cuahsi.org/community/news/${slug}`
  const links = [...new Set(hrefs.filter(h => /^https?:/.test(h)).map(normUrl).filter(Boolean))]
  const mailtos = hrefs.filter(h => /^mailto:/i.test(h)).map(h => h.replace(/^mailto:/i, '').split('?')[0].toLowerCase())
  const mc = MC.exec(html)
  const monthIssue = /^CUAHSI e-Newsletter (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/i.exec(title)
  legacy.push({ slug, url, title, posted, words: nWords(text), listed: listing.has(slug), newsletter_titled: /newsletter/i.test(slug + ' ' + title),
    issue_key: monthIssue ? `${monthIssue[2]}-${monthIssue[1].toLowerCase()}` : '', ext_links: links.filter(l => !isSite(l)), site_links: links.filter(isSite),
    mails: [...new Set([...mailtos, ...mailsIn(text)])], hidden, nums: numsIn(text), mc_id: mc ? mc[1] : '',
    clicks: +(cutRows.get(url)?.clicks ?? 0), cutover_class: cutRows.get(url)?.class ?? '' })
}

// ---- the new items --------------------------------------------------------------------------------------------------
const loadMd = (dir, coll) => fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
  const t = fs.readFileSync(path.join(dir, f), 'utf8'); const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(t); const d = parseYaml(m[1]); const body = m[2]
  const links = [...new Set([...body.matchAll(/\]\((https?:[^)\s]+)\)/g)].map(x => normUrl(x[1])).concat(urlsIn(body)).filter(Boolean))]
  return { coll, file: f, id: `${coll}:${f.replace(/\.md$/, '')}`, slug: d.slug, title: d.title ?? d.name ?? '', date: String(d.date ?? d.start ?? '').slice(0, 10), published: d.published !== false, source_url: d.source_url ?? '',
    words: nWords(body), ext_links: links.filter(l => !isSite(l)), site_links: links.filter(isSite), mails: mailsIn(t), nums: numsIn(body), mc_id: d.mailchimp_id ?? '', mc_url: d.mailchimp_url ?? '' } })
const news = loadMd('content/news', 'news'), letters = loadMd('content/newsletter', 'newsletter')
const NEW = [...news, ...letters]

// ---- matching -------------------------------------------------------------------------------------------------------
const RANK = { exact: 4, probable: 3, weak: 2, possible: 1, none: 0 }
const levelOf = (L, N) => {
  const lw = words(L.title), nw = words(N.title), tj = jaccard(lw, nw)
  const days = L.posted && N.date ? Math.abs(dayNum(L.posted) - dayNum(N.date)) : Infinity
  const out = (level, by) => ({ level, by, tj: +tj.toFixed(2), days })
  if (N.source_url && N.coll === 'news' && N.source_url.replace(/\/+$/, '') === L.url) return out('exact', 'source_url')
  if (L.issue_key && N.coll === 'newsletter' && N.slug === L.issue_key) return out('exact', 'issue month')
  if (sameSet(lw, nw) && lw.size && days <= 3) return out('exact', 'title and date')
  if (tj >= 0.6 && days <= 60) return out('probable', 'title and date')
  if ((tj >= 0.4 && days <= 60) || (tj >= 0.5 && days <= 180) || (tj >= 0.3 && days === 0)) return out('weak', 'title and date')
  if (days === 0 && tj > 0) return out('possible', 'same day')
  return out('none', '')
}
const bestFor = (L, pool) => { const all = pool.map(N => ({ N, ...levelOf(L, N) })).sort((a, b) => RANK[b.level] - RANK[a.level] || b.tj - a.tj || a.days - b.days || (a.N.id < b.N.id ? -1 : 1)); return all }

const match = []
for (const L of legacy) { const all = bestFor(L, NEW); const b = all[0], r = all[1]
  const cand = (x) => x && x.level !== 'none' ? `${x.N.id} (${x.level}, ${x.by})` : ''
  match.push({ L, best: b.level === 'none' ? null : b.N, level: b.level, by: b.by, tj: b.tj, days: Number.isFinite(b.days) ? b.days : '', runner_up: cand(r),
    best_title_overlap: b.N.id + ' ' + b.tj }) }
// a new item may be the best match of several legacy posts
const claimed = new Map(); for (const m of match) if (m.best && ['exact', 'probable'].includes(m.level)) claimed.set(m.best.id, [...(claimed.get(m.best.id) ?? []), m.L.slug])

const kindOf = m => (m.best ? (m.L.newsletter_titled ? 'newsletter-titled' : 'news-titled') + ' / ' + m.best.coll : (m.L.newsletter_titled ? 'newsletter-titled' : 'news-titled') + ' / -')
const matchRows = match.map(m => ({ legacy_slug: m.L.slug, legacy_title: m.L.title, posted: m.L.posted, listed: m.L.listed, newsletter_titled: m.L.newsletter_titled, level: m.level, matched_by: m.by,
  new_item: m.best?.id ?? '', new_route: m.best && ['exact', 'probable'].includes(m.level) ? (m.best.coll === 'news' ? '/community/news/' : '/community/newsletter/') + m.best.slug : '', new_title: m.best?.title ?? '', new_date: m.best?.date ?? '', new_published: m.best ? m.best.published : '', title_overlap: m.tj, days_apart: m.days, runner_up: m.runner_up,
  legacy_kind_and_new_collection: kindOf(m), clicks: m.L.clicks, cutover_class: m.L.cutover_class }))

// ---- facts for matched pairs ----------------------------------------------------------------------------------------
const facts = match.filter(m => m.best && ['exact', 'probable'].includes(m.level)).map(m => { const L = m.L, N = m.best
  const isMc = u => /^(cuahsi\.us3\.list-manage\.com|us3\.campaign-archive\.com)/.test(u) // the subscribe line and the "HTML version" line of every issue; the issue's mailchimp_url carries the second
  const missingAll = L.ext_links.filter(u => !N.ext_links.includes(u)), missing = missingAll.filter(u => !isMc(u)), extra = N.ext_links.filter(u => !L.ext_links.includes(u))
  const ln = [...L.nums], nn = N.nums, lost = ln.filter(x => !nn.has(x))
  const stub = N.words < 0.35 * L.words
  return { legacy_slug: L.slug, new_item: N.id, level: m.level, legacy_posted: L.posted, new_date: N.date, days_apart: Math.round(Math.abs(dayNum(L.posted) - dayNum(N.date))),
    title_words_equal: sameSet(words(L.title), words(N.title)), legacy_words: L.words, new_words: N.words, new_is_short: stub,
    legacy_external_links: L.ext_links.length, new_external_links: N.ext_links.length, legacy_mailchimp_links_not_in_new: missingAll.length - missing.length, legacy_links_not_in_new: missing.length, new_links_not_in_legacy: extra.length, legacy_links_not_in_new_list: missing.join(' '), new_links_not_in_legacy_list: extra.join(' '),
    legacy_numbers: ln.length, legacy_numbers_not_in_new: lost.length, numbers_covered: ln.length ? +((ln.length - lost.length) / ln.length).toFixed(2) : '',
    legacy_addresses_hidden_by_script: L.hidden, legacy_addresses_in_page: L.mails.length, new_addresses: N.mails.length, address_counts_agree: L.hidden + L.mails.length === N.mails.length,
    legacy_mailchimp_id: L.mc_id, new_mailchimp_id: N.mc_id, mailchimp_id_agrees: L.mc_id && N.mc_id ? L.mc_id === N.mc_id : '' } })

// ---- other collections ----------------------------------------------------------------------------------------------
const other = []
for (const [dir, coll] of [['content/events', 'events'], ['content/research', 'research'], ['content/programs', 'programs'], ['content/cyberseminars', 'cyberseminars'], ['content/jobs', 'jobs']]) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) { const m = /^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(path.join(dir, f), 'utf8')); if (!m) continue
    let d; try { d = parseYaml(m[1]) } catch { continue }
    other.push({ coll, id: `${coll}:${f.replace(/\.md$/, '')}`, title: d.title ?? d.name ?? '', date: String(d.date ?? d.start ?? d.posted ?? '').slice(0, 10), published: d.published !== false }) }
}
const elsewhere = []
const probe = (title, date, label, kind) => {
  const lw = words(title); const c = other.map(o => { const tj = jaccard(lw, words(o.title)); const days = date && o.date ? Math.abs(dayNum(date) - dayNum(o.date)) : Infinity; return { o, tj, days } })
    .filter(x => x.tj >= 0.5 || (x.tj >= 0.3 && x.days <= 7) || (x.days === 0 && x.tj > 0)).sort((a, b) => b.tj - a.tj)
  if (c[0]) elsewhere.push({ side: kind, item: label, title, date, candidate: c[0].o.id, candidate_title: c[0].o.title, candidate_date: c[0].o.date, candidate_published: c[0].o.published, title_overlap: +c[0].tj.toFixed(2), days_apart: Number.isFinite(c[0].days) ? c[0].days : '' })
}
for (const m of match) if (!m.best || !['exact', 'probable'].includes(m.level)) probe(m.L.title, m.L.posted, m.L.slug, 'legacy post with no match here')
const matchedNew = new Set(match.filter(m => m.best && ['exact', 'probable'].includes(m.level)).map(m => m.best.id))
const newOnly = NEW.filter(n => !matchedNew.has(n.id))
for (const n of newOnly) probe(n.title, n.date, n.id, 'new item with no legacy post')

// ---- addresses of legacy posts that this site's own content points at ---------------------------------------------------
const contentRefs = []
for (const f of walk('content').filter(f => /\.(md|json)$/.test(f))) for (const line of fs.readFileSync(f, 'utf8').split('\n'))
  for (const m of line.matchAll(/https?:\/\/(?:www\.)?cuahsi\.org\/community\/news\/([A-Za-z0-9@._-]+)/g)) contentRefs.push({ file: f, slug: m[1], field: /^source_url:/.test(line) ? 'source_url' : 'text' })
const refSlugs = [...new Set(contentRefs.map(r => r.slug))]
const refInfo = refSlugs.map(s => { const m = match.find(x => x.L.slug === s); return { slug: s, in_snapshot: !!m, level: m?.level ?? '', route_here: m && ['exact', 'probable'].includes(m.level) ? (m.best.coll === 'news' ? '/community/news/' : '/community/newsletter/') + m.best.slug : '' } })

// ---- outputs --------------------------------------------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3c-legacy-${DATE}.csv`, legacy.map(L => ({ slug: L.slug, title: L.title, posted: L.posted, listed: L.listed, newsletter_titled: L.newsletter_titled, issue_month_key: L.issue_key, words: L.words, external_links: L.ext_links.length, site_links: L.site_links.length, hidden_addresses: L.hidden, plain_addresses: L.mails.length, mailchimp_id: L.mc_id, clicks: L.clicks, cutover_class: L.cutover_class })))
writeCsv(`a3c-new-${DATE}.csv`, NEW.map(n => ({ item: n.id, title: n.title, date: n.date, slug: n.slug, published: n.published, source_url_is_legacy_post: n.source_url.startsWith('https://www.cuahsi.org/community/news/'), words: n.words, external_links: n.ext_links.length, matched_legacy_posts: (claimed.get(n.id) ?? []).join(' ') })))
writeCsv(`a3c-match-${DATE}.csv`, matchRows)
writeCsv(`a3c-facts-${DATE}.csv`, facts)
if (elsewhere.length) writeCsv(`a3c-elsewhere-${DATE}.csv`, elsewhere)

const count = (arr, f) => arr.reduce((o, x) => { const k = f(x); o[k] = (o[k] ?? 0) + 1; return o }, {})
const nums = {
  snapshot: SNAP, legacy_posts: legacy.length, listed: legacy.filter(l => l.listed).length, listing_links_with_no_file: [...listing].filter(s => !legacy.some(l => l.slug === s)).length,
  legacy_newsletter_titled: legacy.filter(l => l.newsletter_titled).length, legacy_issue_posts: legacy.filter(l => l.issue_key).length,
  by_level: count(match, m => m.level), by_level_news_titled: count(match.filter(m => !m.L.newsletter_titled), m => m.level), by_level_newsletter_titled: count(match.filter(m => m.L.newsletter_titled), m => m.level),
  matched_by: count(match.filter(m => ['exact', 'probable'].includes(m.level)), m => m.by),
  kind_crossing: count(match.filter(m => m.best && ['exact', 'probable'].includes(m.level)), kindOf),
  new_items: NEW.length, new_news: news.length, new_newsletter: letters.length, new_published: NEW.filter(n => n.published).length,
  new_with_legacy_match: matchedNew.size, new_news_with_legacy_match: news.filter(n => matchedNew.has(n.id)).length, new_newsletter_with_legacy_match: letters.filter(n => matchedNew.has(n.id)).length,
  new_without_legacy_post: newOnly.map(n => n.id), new_news_source_url_on_legacy: news.filter(n => n.source_url.startsWith('https://www.cuahsi.org/community/news/')).length,
  new_news_source_url_page_not_in_snapshot: news.filter(n => n.source_url.startsWith('https://www.cuahsi.org/community/news/') && !legacy.some(l => l.url === n.source_url.replace(/\/+$/, ''))).map(n => n.id),
  legacy_posts_sharing_one_new_item: [...claimed].filter(([, v]) => v.length > 1),
  pairs_compared: facts.length, pairs_date_differs: facts.filter(f => f.days_apart > 0).length, pairs_date_over_7_days: facts.filter(f => f.days_apart > 7).length,
  pairs_new_is_short: facts.filter(f => f.new_is_short).length, pairs_with_legacy_links_missing: facts.filter(f => f.legacy_links_not_in_new > 0).length,
  pairs_address_counts_differ: facts.filter(f => !f.address_counts_agree).length, legacy_posts_with_hidden_addresses: legacy.filter(l => l.hidden).length, legacy_hidden_addresses_total: legacy.reduce((s, l) => s + l.hidden, 0),
  new_items_with_addresses: NEW.filter(n => n.mails.length).length,
  content_references_to_legacy_news_addresses: contentRefs.length, content_files_with_them: new Set(contentRefs.map(r => r.file)).size, distinct_legacy_addresses_referenced: refSlugs.length,
  referenced_by_field: count(contentRefs, r => r.field), referenced_with_no_page_here: refInfo.filter(r => !r.route_here).map(r => r.slug + ' (' + contentRefs.filter(x => x.slug === r.slug).length + ')'), referenced_not_in_snapshot: refInfo.filter(r => !r.in_snapshot).map(r => r.slug),
  clicks_matched: match.filter(m => ['exact', 'probable'].includes(m.level)).reduce((a, m) => a + m.L.clicks, 0), clicks_unmatched: match.filter(m => !['exact', 'probable'].includes(m.level)).reduce((a, m) => a + m.L.clicks, 0),
  clicks_by_class: count(legacy, l => l.cutover_class || 'not in cut-over file'), clicks_total_legacy_posts: legacy.reduce((s, l) => s + l.clicks, 0),
}
if (HAND) { const hand = readCsv(HAND); const idx = new Map(match.map(m => [m.L.slug, m])); const rows = hand.map(h => { const m = idx.get(h.legacy_slug); const sm = m?.best && ['exact', 'probable'].includes(m.level) ? m.best.id : ''; const hm = ['exact', 'probable'].includes(h.hand_level) ? h.hand_new : ''
  return { slug: h.legacy_slug, hand: h.hand_new || '', hand_level: h.hand_level, script: m?.best?.id ?? '', script_level: m?.level ?? 'missing', same_level: (m?.level ?? 'missing') === h.hand_level, same_matched_verdict: sm === hm } })
  nums.control = { rows: rows.length, legacy_posts_without_row: legacy.filter(l => !hand.some(h => h.legacy_slug === l.slug)).length, same_level: rows.filter(r => r.same_level).length, same_matched_verdict: rows.filter(r => r.same_matched_verdict).length,
    differing: rows.filter(r => !r.same_matched_verdict || !r.same_level).map(r => `${r.slug}: hand ${r.hand_level} ${r.hand}; script ${r.script_level} ${r.script}`) } }
fs.writeFileSync(path.join(OUT, `a3c-numbers-${DATE}.json`), JSON.stringify(nums, null, 2) + '\n')
console.log(JSON.stringify(nums, null, 2))
