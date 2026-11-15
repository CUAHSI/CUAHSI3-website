#!/usr/bin/env node
// Site audit, task A3a (org issue 102): the legacy person pages against the people records on this site.
//
//   node scripts/parity/a3a-people.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages [--legacy-only] [--hand agent/audit/a3a-hand-match-261109.csv]
//
// Reads ONLY the saved legacy pages (about/our-team*, faculty/guest-lecturer-database*, about/governance), content/ and the site code
// (pages/, components/, public/ for a file-exists check). It never touches the network. Writes agent/audit/:
//   a3a-legacy-staff-<d>.csv      one row per /about/our-team/<slug> page: name, role, section on the list, photo, which contact kinds are present, bio, links
//   a3a-legacy-lecturers-<d>.csv  one row per /faculty/guest-lecturer-database/<slug> page: name (from the list cards), affiliation, topics
//   a3a-new-<d>.csv               one row per person record here (full-team.json, and the team, board and community profile files)
//   a3a-match-<d>.csv             each legacy person page with its best match here, the level and the evidence
//   a3a-facts-<d>.csv             for each matched staff pair: role, bio, photo, links, contact details (present or absent only), pronouns
//   a3a-probe-<d>.csv             for each lecturer: does the name appear anywhere else on this site (content folder), and whether it is a name in the member-representatives file (yes or no; no row number or content is written, C11)
//   a3a-governance-<d>.csv        the board and advisory committee names on the legacy governance page, and where each appears here
//   a3a-numbers-<d>.json          counts, and the comparison with the hand-matched control
// With --legacy-only only the two legacy files are written (used to draw the control sample before any matching is seen).
// Match levels, as in October's parity analysis (agent/reports/261005_parity-stage4.md, section 1) and never raised to improve a number:
//   exact    the whole name is the same (accents, case, dots and punctuation ignored)
//   probable the last word is the same and the first names share their first three letters (Kimmy / Kimberlee)
//   weak     the last word is the same and the first names differ
//   none
// "Matched" in the counts means exact or probable. A person record here is a name in content/team/full-team.json or the name: of a file in content/team,
// content/board or content/community. Nicknames and married names are not guessed. Contact details are compared as present or absent; no address,
// number or e-mail is copied anywhere. The legacy site hides its e-mail addresses behind a script; they are counted as placeholders and never decoded.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : ''
if (!SNAP) { console.error('usage: a3a-people.mjs --snapshot <pages folder> [--legacy-only] [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
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
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const clean = s => (s ?? '').replace(/\s+/g, ' ').trim()
const nWords = s => (s.match(/[A-Za-z0-9’'-]+/g) ?? []).length
const PLACEHOLDER = /email hidden; JavaScript is required/i
// a name as a list of lower-case ascii words; "(Chair)", ", (Officer)" and the like are cut off first
const nameWords = s => clean(s).replace(/[,(].*$/, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
const nameKey = s => nameWords(s).join(' ')
const textKey = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const levelOf = (a, b) => {
  const x = nameWords(a), y = nameWords(b)
  if (!x.length || !y.length) return 'none'
  if (x.join(' ') === y.join(' ')) return 'exact'
  if (x.at(-1) !== y.at(-1)) return 'none'
  const f = x[0], g = y[0]
  return f.length >= 3 && g.length >= 3 && f.slice(0, 3) === g.slice(0, 3) ? 'probable' : 'weak'
}
const RANK = { exact: 3, probable: 2, weak: 1, none: 0 }
const frontMatter = file => { const t = fs.readFileSync(file, 'utf8'); const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); return m ? { fm: parseYaml(m[1]) ?? {}, body: m[2] } : { fm: {}, body: t } }

// ---- legacy: staff -----------------------------------------------------------------------------------------------------------
const loadHtml = f => cheerio.load(fs.readFileSync(f, 'utf8'))
const staffDir = path.join(SNAP, 'about', 'our-team')
const listText = (() => { // the list page: name, role pairs; the page then repeats every person in a pop-up, which ends the list
  const $ = loadHtml(path.join(SNAP, 'about', 'our-team.html')); $('script, style, nav, footer').remove()
  const lines = $('main').length ? $('main').text() : $('body').text()
  const L = lines.split('\n').map(clean).filter(Boolean); const out = []; let section = 'staff'; const seen = new Set()
  for (let i = L.indexOf('Our Team') + 1; i < L.length - 1; i++) {
    if (/^Independent contractors$/i.test(L[i])) { section = 'independent contractor'; continue }
    if (seen.has(L[i]) || PLACEHOLDER.test(L[i])) break
    if (L[i + 1] && !/^email hidden/.test(L[i + 1])) { out.push({ name: L[i], role: L[i + 1], section }); seen.add(L[i]); i++ }
  }
  return out
})()
const staff = fs.readdirSync(staffDir).filter(f => f.endsWith('.html')).sort().map(f => {
  const $ = loadHtml(path.join(staffDir, f)); $('script, style').remove()
  const box = $('.modal-content').first()
  const name = clean(box.find('.modal-title').first().text()), role = clean(box.find('.position').first().text())
  const body = box.find('.modal-body'); const links = body.find('a').map((_, a) => $(a).attr('href') ?? '').get()
  const kinds = new Set(); for (const h of links) { if (/linkedin\.com/.test(h)) kinds.add('linkedin'); else if (/scholar\.google/.test(h)) kinds.add('google_scholar'); else if (/orcid\.org/.test(h)) kinds.add('orcid'); else if (/github\.com/.test(h)) kinds.add('github'); else if (h) kinds.add('other') }
  const fun = clean(body.find('p.text-primary').text()).replace(/^Fun Fact:\s*/i, '')
  const paras = body.find('p').filter((_, p) => !$(p).hasClass('text-primary') && clean($(p).text()) !== clean($(p).find('a').text())).map((_, p) => clean($(p).text())).get().filter(Boolean)
  const bio = paras.join(' ')
  const lst = listText.find(x => nameKey(x.name) === nameKey(name))
  return {
    slug: f.replace(/\.html$/, ''), url: 'https://www.cuahsi.org/about/our-team/' + f.replace(/\.html$/, ''), name, role,
    list_role: lst?.role ?? '', list_section: lst?.section ?? '', on_list: lst ? 'yes' : 'no',
    photo: box.find('img').first().attr('src') ?? '', email_placeholder: PLACEHOLDER.test(box.text()) ? 'yes' : 'no', phone: box.find('a[href^="tel:"]').length ? 'yes' : 'no',
    bio_words: nWords(bio), fun_fact: fun ? 'yes' : 'no', pronouns_in_text: /\((he|she|they)\/(him|her|them|they)[^)]*\)/i.test(bio) ? 'yes' : 'no',
    links: [...kinds].sort().join('+'), bio,
  }
})

// ---- legacy: guest lecturers -------------------------------------------------------------------------------------------------
const lecDir = path.join(SNAP, 'faculty', 'guest-lecturer-database')
const detailFiles = fs.readdirSync(lecDir).filter(f => f.endsWith('.html') && !/^(p\d+|general-audience|intro-level|upper-level|other)\.html$/.test(f))
const cards = new Map()
for (const f of walk(lecDir).concat(lecDir + '.html').filter(f => f.endsWith('.html'))) {
  const $ = loadHtml(f); $('script, style').remove()
  $('div.jobs').each((_, el) => {
    const href = $(el).find('a.btn').attr('href') ?? ''; const m = href.match(/guest-lecturer-database\/([^/?#]+)$/); if (!m) return
    const slug = decodeURIComponent(m[1]); const p = $(el).find('p').first()
    const audience = clean($(el).find('p a[href*="guest-lecturer-database/"]').not('.btn').first().text())
    const rec = { slug, name: clean($(el).find('h2').text()), affiliation: clean($(el).find('h3').text()), topic: clean(p.text()).replace(/^Lecture Topic:\s*/i, '').replace(/\s*Key Terms:.*$/i, ''), topic_links: p.find('a').not('[href*="guest-lecturer-database/"]').length, audience }
    const old = cards.get(slug); cards.set(slug, old ? { ...old, audience: old.audience || rec.audience } : rec)
  })
}
const lecturers = detailFiles.sort().map(f => {
  const slug = decodeURIComponent(f.replace(/\.html$/, '')); const c = cards.get(slug)
  const $ = loadHtml(path.join(lecDir, f)); $('script, style').remove()
  const d = $('div.jobs.detail').first()
  return {
    slug, url: 'https://www.cuahsi.org/faculty/guest-lecturer-database/' + f.replace(/\.html$/, ''), name: c?.name ?? '', affiliation: c?.affiliation ?? '',
    on_list: c ? 'yes' : 'no', detail_name_hidden: PLACEHOLDER.test(d.find('h2').text()) ? 'yes' : 'no', detail_affiliation: clean(d.find('h3').text()),
    topics: c?.topic ?? '', topic_links: c?.topic_links ?? 0, audience: c?.audience ?? '',
  }
})
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3a-legacy-staff-${DATE}.csv`, staff.map(({ bio, ...r }) => r))
writeCsv(`a3a-legacy-lecturers-${DATE}.csv`, lecturers)
if (argv.debug) console.log(listText.map(x => x.name + ' | ' + x.role + ' | ' + x.section).join('\n'))
console.log(`legacy: ${staff.length} staff pages (${listText.length} on the list page), ${lecturers.length} lecturer pages (${cards.size} cards)`)
if (argv['legacy-only']) process.exit(0)

// ---- this site: the people records -----------------------------------------------------------------------------------------
const people = []
const team = JSON.parse(fs.readFileSync('content/team/full-team.json', 'utf8'))
for (const t of team) people.push({ id: 'team-json:' + t.slug, source: 'full-team.json', name: t.name, slug: t.slug, role: t.role, has_profile: t.has_profile ? 'yes' : 'no', rec: t })
for (const dir of ['team', 'board', 'community']) {
  for (const f of fs.readdirSync(path.join('content', dir)).filter(f => f.endsWith('.md') && f !== 'README.md')) {
    const { fm, body } = frontMatter(path.join('content', dir, f))
    people.push({ id: `${dir}:${f.replace(/\.md$/, '')}`, source: `content/${dir}/${f}`, name: String(fm.name ?? ''), slug: String(fm.slug ?? ''), role: String(fm.role ?? ''), has_profile: dir === 'team' ? (team.find(t => t.slug === fm.slug)?.has_profile ? 'yes' : 'no') : 'n/a', published: fm.published === true ? 'yes' : 'no', md_words: nWords(body), md_has_contact: /@|\(\d{3}\)\s*\d{3}/.test(JSON.stringify(fm) + body) ? 'yes' : 'no' })
  }
}
const bestFor = name => {
  let best = { level: 'none', id: '', via: '' }
  for (const p of people) { const l = levelOf(name, p.name); if (RANK[l] > RANK[best.level]) best = { level: l, id: p.id, via: p.name } }
  return best
}
const matches = [
  ...staff.map(s => ({ kind: 'staff', key: s.slug, url: s.url, legacy_name: s.name, ...bestFor(s.name) })),
  ...lecturers.map(s => ({ kind: 'lecturer', key: s.slug, url: s.url, legacy_name: s.name, ...bestFor(s.name) })),
]
const cut = new Map(readCsv(path.join(OUT, `cutover-${DATE}-urls.csv`)).map(r => [decodeURIComponent(r.url).toLowerCase(), r]))
for (const m of matches) { const r = cut.get(decodeURIComponent(m.url).toLowerCase()); m.cutover = r ? r.class : 'not in the cut-over file'; m.clicks = r ? r.clicks : ''; m.impressions = r ? r.impressions : '' }
for (const m of matches) m.evidence = m.level === 'none' ? 'no name here shares the last word' : `${m.level}: legacy "${m.legacy_name}" / here "${m.via}"`
writeCsv(`a3a-match-${DATE}.csv`, matches.map(m => ({ kind: m.kind, key: m.key, legacy_name: m.legacy_name, level: m.level, new_record: m.id, new_name: m.via, evidence: m.evidence, cutover_class: m.cutover, clicks: m.clicks, impressions: m.impressions })))
const matchedIds = new Set(matches.filter(m => RANK[m.level] >= 2).map(m => m.id))
const legacyNames = [...staff, ...lecturers]
writeCsv(`a3a-new-${DATE}.csv`, people.map(p => ({ id: p.id, source: p.source, name: p.name, slug: p.slug, role: p.role, has_profile: p.has_profile, published: p.published ?? 'n/a', md_words: p.md_words ?? '', md_has_contact: p.md_has_contact ?? '',
  legacy_page: [...staff, ...lecturers].filter(l => RANK[levelOf(l.name, p.name)] >= 2).map(l => l.url).join(' ') })))

// ---- facts for each matched staff pair -----------------------------------------------------------------------------------------
const roleKey = s => clean(s).toLowerCase().replace(/\(contractor\)/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()
const facts = []
for (const s of staff) {
  const m = matches.find(x => x.kind === 'staff' && x.key === s.slug); if (RANK[m.level] < 2) continue
  const p = people.find(x => x.id === m.id); const t = p.rec; if (!t) continue
  const md = people.find(x => x.id === 'team:' + p.slug)
  const newLinks = Object.keys(t.links ?? {}).filter(k => t.links[k]).sort()
  const photoFile = t.photo ? path.join('public', t.photo) : ''
  facts.push({
    slug: s.slug, level: m.level, legacy_role: s.role, new_role: t.role, role: roleKey(s.role) === roleKey(t.role) ? 'same' : 'differs',
    role_note: roleKey(s.role) === roleKey(t.role) && s.role !== t.role ? (/contractor/i.test(t.role) && s.list_section === 'independent contractor' ? 'the legacy list heading Independent contractors is a (contractor) note in the role here' : 'same words, spelled differently') : '',
    legacy_section: s.list_section, new_contractor_in_role: /contractor/i.test(t.role) ? 'yes' : 'no',
    legacy_bio_words: s.bio_words, new_bio_words: nWords(t.bio ?? ''), new_md_words: md?.md_words ?? 0, bio: !t.bio ? 'new has none' : 'both have one',
    legacy_photo: s.photo ? 'yes' : 'no', new_photo_field: t.photo ? 'yes' : 'no', new_photo_file_exists: photoFile && fs.existsSync(photoFile) ? 'yes' : 'no',
    legacy_links: s.links || 'none', new_links: newLinks.join('+') || 'none', links: (s.links || 'none') === (newLinks.join('+') || 'none') ? 'same' : 'differs',
    legacy_contact: [s.email_placeholder === 'yes' ? 'email' : '', s.phone === 'yes' ? 'phone' : ''].filter(Boolean).join('+') || 'none',
    new_contact: (/@/.test(JSON.stringify(t)) || md?.md_has_contact === 'yes') ? 'present' : 'none', contact_details: ((s.email_placeholder === 'yes' || s.phone === 'yes') ? 'present' : 'none') === ((/@/.test(JSON.stringify(t)) || md?.md_has_contact === 'yes') ? 'present' : 'none') ? 'same' : 'differ',
    legacy_fun_fact: s.fun_fact, new_fun_fact: t.fun_fact ? 'yes' : 'no', legacy_pronouns: s.pronouns_in_text, new_pronouns: t.pronouns ? 'yes' : 'no',
    new_has_profile_page: t.has_profile ? 'yes' : 'no', new_md_name: md?.name ?? '', md_name_matches_json: md ? (md.name === t.name ? 'same' : 'differs') : 'no file', md_role_matches_json: md ? (roleKey(md.role) === roleKey(t.role) ? 'same' : 'differs') : 'no file',
  })
}
writeCsv(`a3a-facts-${DATE}.csv`, facts)

// ---- other places a legacy name appears here (content/ only: code files hold markup such as "li li" that would match the name Li Li) -------------------------------------------------------------------------------------
const corpus = []
for (const root of ['content']) for (const f of walk(root)) {
  if (f === path.join('content', 'members', 'reps.json') || !/\.(md|json|vue|ts)$/.test(f)) continue
  corpus.push({ f, root, folder: root === 'content' ? f.split(path.sep)[1] : root, text: ' ' + textKey(fs.readFileSync(f, 'utf8')) + ' ' })
}
const reps = JSON.parse(fs.readFileSync('content/members/reps.json', 'utf8'))
const repKeys = reps.map(r => nameKey(`${r.first_name} ${r.last_name}`))
const probeOf = name => {
  const k = nameKey(name); if (!k || k.split(' ').length < 2) return { files: [], folders: '', reps: [] }
  const hits = corpus.filter(c => c.text.includes(' ' + k + ' '))
  const folders = [...new Set(hits.map(h => h.folder))].sort()
  return { files: hits.map(h => h.f), folders: folders.map(fo => `${fo}:${hits.filter(h => h.folder === fo).length}`).join(' '), reps: repKeys.map((x, i) => (x === k ? i + 1 : 0)).filter(Boolean) }
}
const probe = lecturers.map(l => { const p = probeOf(l.name); return { slug: l.slug, name: l.name, files_with_name: p.files.length, where: p.folders, in_member_file: p.reps.length ? 'yes' : 'no', match_level: matches.find(m => m.kind === 'lecturer' && m.key === l.slug).level } })
writeCsv(`a3a-probe-${DATE}.csv`, probe)

// ---- the governance page ----------------------------------------------------------------------------------------------------------
const gov = (() => {
  const $ = loadHtml(path.join(SNAP, 'about', 'governance.html')); $('script, style, nav, footer').remove()
  const L = ($('main').length ? $('main') : $('body')).text().split('\n').map(clean).filter(Boolean)
  const rows = []
  const take = (from, to, group) => { for (let i = from; i < to; i += 2) rows.push({ group, name: L[i], affiliation: L[i + 1] }) }
  const b = L.indexOf('Board of Directors') + 1, e = L.findIndex(x => /^CUAHSI Advisory Committees/.test(x))
  take(b, e, 'board')
  let g = 'committee'; const heads = L.map((x, i) => (x === 'Committee members' ? i : -1)).filter(i => i >= 0)
  const names = ['informatics', 'education and outreach', 'instrumentation']
  heads.forEach((h, n) => { let j = h + 1; const end = n + 1 < heads.length ? heads[n + 1] : L.findIndex(x => x === 'What We Do'); const stop = L.findIndex((x, i) => i > h && /Committee$/.test(x)) ; const to = stop > h && stop < end ? stop : end; take(j, to - ((to - j) % 2), names[n]) })
  return rows
})()
const govRows = gov.map(r => {
  const best = bestFor(r.name); const p = probeOf(r.name); const rep = p.reps
  return { group: r.group, name: r.name, affiliation: r.affiliation, person_record_level: best.level, person_record: best.level === 'none' ? '' : best.id, files_with_name: p.files.length, where: p.folders, in_member_file: rep.length ? 'yes' : 'no',
    on_governance_page_here: (fs.readFileSync('pages/about/governance.vue', 'utf8').toLowerCase().includes(nameWords(r.name).join(' ')) ? 'yes' : 'no') }
})
writeCsv(`a3a-governance-${DATE}.csv`, govRows)

// ---- numbers and the control ------------------------------------------------------------------------------------------------------
const count = (rows, f) => rows.reduce((o, r) => { const k = f(r); o[k] = (o[k] ?? 0) + 1; return o }, {})
const num = {
  legacy: { staff_pages: staff.length, staff_on_list_page: staff.filter(s => s.on_list === 'yes').length, list_page_entries: listText.length, lecturer_pages: lecturers.length, lecturer_cards: cards.size,
    lecturers_name_only_in_list: lecturers.filter(l => l.detail_name_hidden === 'yes').length, lecturers_without_card: lecturers.filter(l => l.on_list === 'no').length },
  new: { records: people.length, team_json: team.length, team_json_with_profile: team.filter(t => t.has_profile).length, team_md: people.filter(p => p.id.startsWith('team:')).length, board_md: people.filter(p => p.id.startsWith('board:')).length, community_md: people.filter(p => p.id.startsWith('community:')).length,
    team_md_without_profile_flag: people.filter(p => p.id.startsWith('team:') && p.has_profile === 'no').length, members_rep_rows: reps.length },
  match: { staff: count(matches.filter(m => m.kind === 'staff'), m => m.level), lecturers: count(matches.filter(m => m.kind === 'lecturer'), m => m.level) },
  new_records_with_legacy_page: people.length - people.filter(p => ![...staff, ...lecturers].some(l => RANK[levelOf(l.name, p.name)] >= 2)).length, new_records_without_legacy_page: people.filter(p => ![...staff, ...lecturers].some(l => RANK[levelOf(l.name, p.name)] >= 2)).map(p => p.id),
  cutover: { staff: count(matches.filter(m => m.kind === 'staff'), m => m.cutover), lecturers: count(matches.filter(m => m.kind === 'lecturer'), m => m.cutover), clicks_staff: matches.filter(m => m.kind === 'staff').reduce((a, m) => a + (+m.clicks || 0), 0), clicks_lecturers: matches.filter(m => m.kind === 'lecturer').reduce((a, m) => a + (+m.clicks || 0), 0), gsc_rows_staff: matches.filter(m => m.kind === 'staff' && m.clicks !== '').length, gsc_rows_lecturers: matches.filter(m => m.kind === 'lecturer' && m.clicks !== '').length },
  facts: { pairs: facts.length, role: count(facts, f => f.role), links: count(facts, f => f.links), bio: count(facts, f => f.bio), photo_file_exists: count(facts, f => f.new_photo_file_exists), contact_details: count(facts, f => f.contact_details), legacy_email_placeholder: staff.filter(s => s.email_placeholder === 'yes').length, legacy_phone: staff.filter(s => s.phone === 'yes').length, md_name_matches_json: count(facts, f => f.md_name_matches_json), md_role_matches_json: count(facts, f => f.md_role_matches_json) },
  lecturer_probe: { name_in_either: probe.filter(p => p.files_with_name > 0 || p.in_member_file === 'yes').length, name_found_in_files: probe.filter(p => p.files_with_name > 0).length, name_in_member_rep_rows: probe.filter(p => p.in_member_file === 'yes').length, of: probe.length },
  governance: { distinct_people: new Set(govRows.map(r => nameKey(r.name))).size, distinct_with_person_record: new Set(govRows.filter(r => r.person_record_level !== 'none').map(r => nameKey(r.name))).size, distinct_found_elsewhere: new Set(govRows.filter(r => r.files_with_name > 0 || r.in_member_file === 'yes').map(r => nameKey(r.name))).size, rows: govRows.length, by_group: count(govRows, r => r.group), with_person_record: govRows.filter(r => r.person_record_level !== 'none').length, named_on_governance_page_here: govRows.filter(r => r.on_governance_page_here === 'yes').length, name_found_in_files: govRows.filter(r => r.files_with_name > 0).length, in_member_rep_rows: govRows.filter(r => r.in_member_file === 'yes').length },
}
if (HAND) {
  const hand = readCsv(HAND); const rows = hand.map(h => { const m = matches.find(x => x.kind === h.kind && x.key === h.key); return { ...h, script_level: m?.level ?? 'missing', script_new: m?.id ?? '', same: m && m.level === h.hand_level ? 'yes' : 'no' } })
  num.control = { rows: rows.length, same_level: rows.filter(r => r.same === 'yes').length, differ: rows.filter(r => r.same === 'no').map(r => `${r.kind}:${r.key} hand ${r.hand_level}, script ${r.script_level}`) }
}
fs.writeFileSync(path.join(OUT, `a3a-numbers-${DATE}.json`), JSON.stringify(num, null, 2) + '\n')
console.log(JSON.stringify(num, null, 2))
