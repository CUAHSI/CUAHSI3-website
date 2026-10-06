// One-off extraction for the graduate programs data (content/graduate-programs/programs.json), from the saved legacy list pages
// in raw/legacy-site/261005/pages/students/graduate-programs-in-water-science*.html (not committed). Reads only the snapshot.
// Source of each row: the main list (11 pages), one block per institution: its name, its program text and its "Degrees" links.
// The Master's, Ph.D., Other/Professional and Undergraduate lists are read to cross-check the degrees (and to fill them in when the
// main list gives none). Writes agent/parity/grad-programs-extract.json (rows plus checks). Run: node agent/parity/grad-programs-extract.mjs
import fs from 'node:fs'
import * as cheerio from 'cheerio'
const DIR = 'raw/legacy-site/261005/pages/students'
const DEG = { "master's": 'masters', 'ph.d.': 'phd', 'other/professional': 'professional', 'undergraduate': 'undergraduate' }
const clean = s => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
function blocks(file) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8')); const out = []
  $('div.jobs').each((_, el) => {
    const h2 = $(el).find('h2').first(); const name = clean(h2.text()); if (!name) return
    const h3 = clean($(el).find('h3').first().text())
    const paras = $(el).find('p').filter((_, p) => !$(p).find('strong').text().startsWith('Degrees')).map((_, p) => {
      const t = $(p).clone(); t.find('a').each((_, a) => { const href = $(a).attr('href') || ''; const txt = clean($(a).text()); $(a).replaceWith(href && txt === href ? `[${href}]` : txt) })
      return clean(t.text())
    }).get().filter(Boolean)
    const links = $(el).find('p a').map((_, a) => ({ href: $(a).attr('href') || '', text: clean($(a).text()) })).get()
    const degrees = $(el).find('p').filter((_, p) => $(p).find('strong').text().startsWith('Degrees')).find('a').map((_, a) => DEG[clean($(a).text()).toLowerCase()] ?? `?${clean($(a).text())}`).get()
    out.push({ name, stub: h2.find('a').attr('href') || '', h3, paras: h3 ? [h3, ...paras] : paras, links, degrees })
  })
  return out
}
const mainFiles = [`${DIR}/graduate-programs-in-water-science.html`, ...Array.from({ length: 10 }, (_, i) => `${DIR}/graduate-programs-in-water-science/p${i + 2}.html`)]
const rows = mainFiles.flatMap((f, i) => blocks(f).map(b => ({ ...b, page: i + 1 })))
const cats = { masters: ['masters'], phd: ['ph-d'], professional: ['other-professional'], undergraduate: ['undergraduate'] }
const catSets = {}
for (const [k, [folder]] of Object.entries(cats)) {
  const files = [`${DIR}/graduate-programs-in-water-science/${folder}.html`]
  const d = `${DIR}/graduate-programs-in-water-science/${folder}`
  if (fs.existsSync(d)) files.push(...fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => `${d}/${f}`))
  catSets[k] = new Set(files.flatMap(f => blocks(f).map(b => b.name)))
}
// the saved stub page of each block (students/graduate-programs-in-water-science-dev/...) carries the institution's "Website:" link
// and, for two blocks whose list entry is empty, the program text
function stubInfo(stubUrl) {
  const f = 'raw/legacy-site/261005/pages/' + stubUrl.replace('https://www.cuahsi.org/', '') + '.html'
  if (!fs.existsSync(f)) return { website: null, text: '', missing: true }
  const $ = cheerio.load(fs.readFileSync(f, 'utf8')); const main = $('main').length ? $('main') : $('body')
  let website = null
  main.find('p, div').each((_, e) => { const t = clean($(e).clone().children('a').remove().end().text()); if (!website && /Website:\s*$/.test(t)) { const a = $(e).find('a').first().attr('href'); if (a) website = a } })
  if (!website) { const m = clean(main.text()).match(/Website:\s*(https?:\/\/\S+)/); if (m) website = m[1] }
  main.find('a, script, style').each((_, a) => { if (!$(a).closest('h1').length && /Graduate Programs in Water Science|←/.test($(a).text())) $(a).remove() })
  let text = clean(main.text()).replace(/^←?\s*Graduate Programs in Water Science\s*/, '')
  return { website, text, missing: false }
}
for (const b of rows) Object.assign(b, { stubInfo: stubInfo(b.stub) })
// one row per institution: blocks with the same name are merged (programs joined, degrees united)
const IS_BRACKET_URL = /\s*\[(https?:\/\/[^\]]+)\]\.?/g
const merged = []
for (const b of rows) {
  let m = merged.find(x => x.institution === b.name)
  if (!m) { m = { institution: b.name, parts: [], degrees: new Set(), urls: [], stubs: [], websites: [], stubTexts: [] }; merged.push(m) }
  m.stubs.push(b.stub); b.degrees.forEach(d => m.degrees.add(d)); if (b.stubInfo.website) m.websites.push(b.stubInfo.website); if (!b.paras.length && b.stubInfo.text) m.stubTexts.push(b.stubInfo.text.replace(new RegExp('^' + b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'), '').replace(/\s*Website:.*$/, '').replace(/\s*Degrees:.*$/, '').trim())
  for (const t of b.paras) { const urls = [...t.matchAll(IS_BRACKET_URL)].map(x => x[1]); m.urls.push(...urls); const txt = t.replace(IS_BRACKET_URL, '').trim(); if (txt && !m.parts.includes(txt)) m.parts.push(txt) }
  for (const l of b.links) if (/^https?:/.test(l.href) && !/cuahsi\.org/.test(l.href)) m.urls.push(l.href)
}
const fromCats = {}
for (const m of merged) { m.fromList = [...m.degrees]; for (const [k, set] of Object.entries(catSets)) if (set.has(m.institution)) m.degrees.add(k) }
const final = merged.map(m => ({ institution: m.institution, programs: (m.parts.length ? m.parts : m.stubTexts).join('; '), degrees: ['masters', 'phd', 'undergraduate', 'professional'].filter(d => m.degrees.has(d)), url: m.websites[0] ?? null, programs_from_stub: m.parts.length ? false : true, listUrl: m.urls[0] ?? null, degreesFromCategoryLists: m.degrees.size - m.fromList.length, blocks: m.stubs.length }))
fs.writeFileSync('agent/parity/grad-programs-extract.json', JSON.stringify({ final, rows, catCounts: Object.fromEntries(Object.entries(catSets).map(([k, s]) => [k, s.size])), cats: Object.fromEntries(Object.entries(catSets).map(([k, s]) => [k, [...s]])) }, null, 1))
console.log('main rows', rows.length, 'distinct names', new Set(rows.map(r => r.name)).size, 'category counts', JSON.stringify(Object.fromEntries(Object.entries(catSets).map(([k, s]) => [k, s.size]))))
console.log('institutions', final.length, '| no degrees anywhere', final.filter(r => !r.degrees.length).length, '| no url', final.filter(r => !r.url).length, '| empty programs', final.filter(r => !r.programs).length, '| url only in list text', final.filter(r => !r.url && r.listUrl).length, '| missing stubs', rows.filter(r => r.stubInfo.missing).length)
console.log('rows with no Degrees field', rows.filter(r => !r.degrees.length).length, '| rows with an unknown degree label', rows.filter(r => r.degrees.some(d => d.startsWith('?'))).length)
