// One-off extraction for content/data-portals/portals.json from the saved legacy pages (raw/legacy-site/261005/pages/community/water-data-portals*.html,
// not committed). Reads only the snapshot. One row per entry page: name (h2), owner ("Site Owner"), scope ("Geographical Scope"), website ("Website").
// The long fields (accession date, link to data, API, export formats) and the contact (script-hidden emails, never decoded) are not read into the data.
// The list pages (the main list and p2 to p5) are read to cross-check that every listed entry has an entry page and the reverse.
// Writes agent/parity/portals-extract.json. Run: node agent/parity/portals-extract.mjs
import fs from 'node:fs'
import * as cheerio from 'cheerio'
const DIR = 'raw/legacy-site/261005/pages/community/water-data-portals'
const clean = s => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const entries = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && !/^p\d+\.html$/.test(f)).sort().map(f => {
  const $ = cheerio.load(fs.readFileSync(`${DIR}/${f}`, 'utf8')); const box = $('.jobs.detail').first()
  const dl = {}; box.find('dt').each((_, dt) => { const key = clean($(dt).text()).replace(/:$/, ''); const dd = $(dt).nextAll('dd').first(); dl[key] = { text: clean(dd.text()), href: dd.find('a').first().attr('href') || null } })
  return { file: f, name: clean(box.find('h2').first().text()), accession: clean(box.find('h3').first().text()), description: clean(box.find('p').first().text()).slice(0, 160), dl }
})
const listFiles = [`${DIR}.html`, ...[2, 3, 4, 5].map(n => `${DIR}/p${n}.html`)]
const listed = listFiles.flatMap(f => { const $ = cheerio.load(fs.readFileSync(f, 'utf8')); return $('div.jobs h2').map((_, h) => ({ name: clean($(h).text()), href: $(h).find('a').attr('href') || '' })).get() })
fs.writeFileSync('agent/parity/portals-extract.json', JSON.stringify({ entries, listed }, null, 1))
console.log('entry pages', entries.length, '| listed on the list pages', listed.length, '| distinct listed', new Set(listed.map(l => l.name)).size)
console.log('keys seen', [...new Set(entries.flatMap(e => Object.keys(e.dl)))].join(' | '))
