// Zod schemas for the files in content/. Used by scripts/validate-content.mjs.
//
// Written from the content files as they are on disk (CLAUDE.md rule 1), not from
// agent/content-model.md alone. Where they disagree, the choice and the reason are in
// the comment on the field, and in agent/reports/*_content-validation.md.
//
// Rules used for every collection:
//  - A key is required if every file in the collection has it, optional if only some do.
//    (board has 1 profile and community has 4, so "every file" is a weak test there.)
//  - Objects are strict: an unknown key is a failure, so a typo or a new key is noticed.
//  - A value is typed as the files use it. Nothing is loosened to make a file pass.
//  - Some checks are tighter than the content model, or than a bare type: non-empty strings, the
//    slug format, real calendar dates, valid URLs and emails, and strict objects. Every existing
//    file satisfies them except where the validator reports a failure (the only schema failure at
//    the time of writing is one email). They are listed in the report's section 5.
//  - Markdown bodies are not validated, only frontmatter.
//  - This is Zod 4 (the site's @nuxt/content 2.13.4 has no schema support; see the roadmap).

import { z } from 'zod'

// ---- shared pieces --------------------------------------------------------------------

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase words joined by single hyphens')

// The site's YAML parser leaves dates as strings, so dates are checked as strings. Formats in
// use: 2026-07-01 | 2026-07-01T09:00:00-06:00 | 2025-08-13T16:00:00.000Z.
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/
const isoDate = z.string().regex(DATE_RE, 'must be YYYY-MM-DD, optionally with a time and Z or an offset')
  .refine(s => {
    const m = DATE_RE.exec(s)
    if (!m) return true // the regex rule above already reports it
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const dt = new Date(Date.UTC(y, mo - 1, d))
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
  }, 'is not a real calendar date')

const url = z.url()
const nonEmpty = z.string().min(1, 'must not be empty')
const strings = z.array(z.string())
const slugs = z.array(slug)

// ---- markdown collections (frontmatter) ----------------------------------------------

// content/news/ : 12 files.
const news = z.strictObject({
  title: nonEmpty,
  slug,
  date: isoDate,
  excerpt: nonEmpty,
  tags: strings,
  published: z.boolean(),
  source_url: url.optional(),   // 6 of 12
  author: nonEmpty.optional(),  // 1 of 12; not in content-model.md
})

// content/newsletter/ : 7 files.
const newsletter = z.strictObject({
  title: nonEmpty,
  date: isoDate,
  slug,
  summary: nonEmpty,
  topics: strings,
  people_mentioned: slugs,     // checked against team slugs in the cross-reference section
  programs_mentioned: slugs,
  mailchimp_id: nonEmpty,
  mailchimp_url: url,
  published: z.boolean(),
})

// content/events/ : 27 files.
// type: content-model.md lists six values; the files use five. "field" is kept because the
// model documents it and pages/learn-train/archive filters on it.
// timezone: the model says "ET or null"; the files use nine different strings (America/New_York,
// ET, MT, ...), so this accepts any string or null. Not normalised.
const events = z.strictObject({
  title: nonEmpty,
  slug,
  type: z.enum(['workshop', 'field', 'webinar', 'webinar-series', 'conference', 'deadline']),
  audience: strings,
  start: isoDate,
  end: isoDate.optional(),      // 23 of 27
  timezone: z.string().nullable(),
  location: z.strictObject({
    mode: z.enum(['virtual', 'in-person', 'hybrid']),
    city: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  }),
  description: nonEmpty,
  registration: z.strictObject({ // 15 of 27 have it
    required: z.boolean(),
    url: z.string().nullable().optional(),
    cost: z.string().nullable().optional(),
  }).optional(),
  tags: strings,
  newsletter_source: z.array(z.string()).optional(), // 27 of 27 have it; optional so an event supplied by staff, not announced in a newsletter, validates. Checked against newsletter slugs in the cross-reference section
  featured: z.boolean().optional(),       // 13 of 27
  published: z.boolean(),
})

// content/jobs/ : 29 files.
const jobs = z.strictObject({
  title: nonEmpty,
  slug,
  organization: nonEmpty,
  location: nonEmpty,
  type: z.enum(['permanent', 'post-doc', 'fellowship', 'internship', 'graduate-assistantship', 'faculty', 'temporary']),
  posted: isoDate,
  deadline: isoDate.nullable(),
  url,
  tags: strings,
  published: z.boolean(),
  source: z.enum(['newsletter', 'joshswaterjobs', 'usajobs', 'agu']).optional(), // 23 of 29 existing files; the model names the first two; usajobs added 5 Oct 2026 for the federal postings the upstream jobs automation writes
  source_id: nonEmpty.optional(), // the posting's id at its source (a USAJOBS control number); only the usajobs files have it
  sector: z.enum(['academic']).optional(), // written by hand on a job at a university or college; the board's Sector filter shows usajobs as federal, `academic` as Academic and everything else as Other (federal is never written here: it is the source)
  member_institution: nonEmpty.nullable().optional(), // a name from content/members/reps.json (checked by the validator): the employer is or belongs to that CUAHSI member institution. null = checked, not a member (turns off the board's name match); absent = not decided (the board falls back to matching the member names in `organization`)
  source_url: url.refine(u => /^https?:\/\//.test(u), 'must be an http(s) URL').optional(), // the posting's page on the source site; the jobs board shows "via Josh's Water Jobs" (or "via AGU Career Center" for source agu) with it. Written by the upstream jobs automation for joshswaterjobs postings
})

// content/cyberseminars/ : 15 files. The transcripts/ folder (7 .json files) is not validated here.
// youtube_id may be empty (the model: "empty = card renders without embed").
const cyberseminars = z.strictObject({
  title: nonEmpty,
  slug,
  series: nonEmpty,
  series_slug: slug,
  date: isoDate,
  youtube_id: z.string().regex(/^[A-Za-z0-9_-]{11}$|^$/, 'must be empty or an 11-character YouTube id (letters, digits, _ and -)'), // two unpublished files once carried 8- and 9-character ids and nothing stopped them going live (audit A3g)
  speakers: strings,
  speaker_orgs: strings,
  tags: strings,
  published: z.boolean(),
  description: nonEmpty,
  has_transcript: z.boolean().optional(), // 12 of 15
})

// content/research/ : 31 files (renders at /about/impact/).
// The files carry no author-controlled enum beyond category. people_mentioned is typed as slugs here
// and checked against team slugs in the cross-reference section (the model says "team slugs").
// A story's picture: shown on its card and at the top of its page. src is a file in public/story-images/ (the validator checks that it exists and
// is not too big); alt is what a screen reader says; caption and credit print under the picture on the story page; fit "contain" shows a
// diagram whole (cover crops); position is a CSS object-position for the crop.
const storyImage = z.strictObject({
  src: z.string().regex(/^\/story-images\/[a-z0-9][a-z0-9-]*\.(jpg|webp|png|svg)$/, 'must be /story-images/<name>.jpg (or .webp, .png, .svg), lower case with hyphens'),
  alt: nonEmpty,
  caption: nonEmpty.optional(),
  credit: nonEmpty.optional(),
  fit: z.enum(['cover', 'contain']).optional(),
  position: z.string().regex(/^(?:center|top|bottom|\d{1,3}% \d{1,3}%)$/, 'center, top, bottom or "x% y%"').optional(),
})

const research = z.strictObject({
  title: nonEmpty,
  slug,
  date: isoDate,
  year: z.number().int(),
  category: z.enum(['research', 'cyberinfrastructure', 'data-infrastructure', 'training', 'community']),
  tags: strings,
  published: z.boolean(),
  excerpt: nonEmpty,
  funding: z.string().nullable().optional(),
  partners: strings.optional(),
  people_mentioned: slugs.optional(),
  image: storyImage.optional(),
  awards: slugs.optional(),   // ids from content/awards/awards.json; the page shows each award's acknowledgment under the story. [] means checked, no award of CUAHSI's to acknowledge; absent means not yet decided
})

// content/awards/awards.json : the awards CUAHSI's stories acknowledge, each written once. A story lists award ids (see `awards`
// above) and /about/impact/<story> shows the acknowledgment sentence. `text` is the whole sentence; `{number}` stands where the
// award number goes, and that is the only place the number is typed (it becomes a link when `url` is given).
const award = z.strictObject({
  id: slug,
  funder: nonEmpty,
  number: nonEmpty,
  url: url.refine(u => /^https?:\/\//.test(u), 'must be an http(s) URL').optional(),
  text: nonEmpty,
}).refine(a => a.text.split('{number}').length === 2, { message: 'text must contain {number} exactly once' })

// content/programs/ : 4 files, two shapes. Three are program descriptions (the shape the model
// documents); watersofthack.md is a different shape (an application call with a date and place).
// A schema that fits both would have almost every key optional, so there are two schemas and a file
// must satisfy one of them. The union is reported as a single failure with both sets of problems.
const programFull = z.strictObject({
  title: nonEmpty,
  slug,
  abbreviation: nonEmpty,
  status: nonEmpty,
  frequency: nonEmpty,
  season: nonEmpty,
  audience: strings,
  contact: nonEmpty,
  partners: strings,
  funding: nonEmpty,
  tags: strings,
  excerpt: nonEmpty,
  published: z.boolean(),
})
const programEvent = z.strictObject({
  title: nonEmpty,
  slug,
  type: nonEmpty,
  description: nonEmpty,
  audience: strings,
  tags: strings,
  next_date: isoDate,
  location: nonEmpty,
  apply_url: url,
  featured: z.boolean(),
  published: z.boolean(),
})
const programs = z.union([programFull, programEvent])

// content/team/*.md : 8 files. Extended profile pages; the staff list itself is full-team.json.
const teamMd = z.strictObject({
  name: nonEmpty,
  slug,
  role: nonEmpty,
  department: z.enum(['Leadership', 'Research', 'Engineering', 'Programs', 'Communications', 'Operations']),
  published: z.boolean(),
  bio: nonEmpty.optional(), // 6 of 8
})

// content/board/*.md (1 profile) and content/community/*.md (4 profiles). The model calls these "stub
// directories with no rendering pages"; they hold real profiles, so they are validated.
const boardProfile = z.strictObject({
  name: nonEmpty,
  slug,
  role: nonEmpty,
  institution: nonEmpty,
  title: nonEmpty,
  bio: nonEmpty,
  elected: z.number().int(),
  published: z.boolean(),
})
const communityProfile = z.strictObject({
  name: nonEmpty,
  slug,
  role: nonEmpty,
  institution: nonEmpty,
  title: nonEmpty,
  bio: nonEmpty,
  type: z.enum(['fellow', 'faculty-partner']),
  published: z.boolean(),
})

// ---- JSON files (arrays; each entry is validated) -------------------------------------

// content/team/full-team.json : 22 entries.
const link = z.string().nullable()
const fullTeamEntry = z.strictObject({
  name: nonEmpty,
  slug,
  role: nonEmpty,
  department: z.enum(['Leadership', 'Research', 'Engineering', 'Programs', 'Communications', 'Operations']),
  pronouns: z.string().nullable(),
  photo: z.string().nullable(),
  bio: nonEmpty,
  fun_fact: z.string().nullable(),
  links: z.strictObject({
    orcid: link.optional(),
    google_scholar: link.optional(),
    github: link.optional(),
    linkedin: link.optional(),
  }),
  has_profile: z.boolean(),
})

// content/members/reps.json : 229 entries.
const memberRep = z.strictObject({
  first_name: nonEmpty,
  last_name: nonEmpty,
  institution: nonEmpty,
  email: z.email(),
})

// content/graduate-programs/programs.json : the directory of graduate programs in water science (a table on
// /learn-train/graduate-programs). One entry per institution, as on the legacy list: the programs are free text
// (department or program names as the institution gives them), the degrees are from a fixed list. `last_reviewed`
// is how the list is kept alive: staff review each row once a year and the content lint lists rows older than 12 months.
const webUrl = url.refine(u => /^https?:\/\//.test(u), 'must start with http:// or https://')
const graduateProgram = z.strictObject({
  institution: nonEmpty,
  programs: nonEmpty,
  degrees: z.array(z.enum(['masters', 'phd', 'undergraduate', 'professional'])),   // may be empty: the legacy list gives no degree for some institutions, and none is guessed
  url: webUrl.optional(),
  last_reviewed: isoDate.optional(),   // set only when a person at CUAHSI has checked the row; the page shows nothing otherwise
})

// content/data-portals/portals.json : the catalog of water data portals (a table on /data-platforms/portals).
// Short columns only: name, owner, scope and a link; the longer legacy fields (API, export formats, contact) are not kept.
const dataPortal = z.strictObject({
  name: nonEmpty,
  owner: nonEmpty.optional(),        // the legacy entry names no owner for a few portals; none is guessed
  scope: nonEmpty.optional(),        // geographical scope, as the legacy entry gives it
  url: webUrl,
  last_reviewed: isoDate.optional(),   // set only when a person at CUAHSI has checked the row; the page shows nothing otherwise
})

// content/documents/documents.json : the library on /about/documents (reports, plans, minutes, governance documents,
// historical papers). Exactly one of `file` (a PDF hosted here, under public/documents/) or `url` (hosted elsewhere, for
// example a HydroShare resource) is required; a document hosted elsewhere may carry a `citation`.
const documentEntry = z.strictObject({
  title: nonEmpty,
  kind: z.enum(['policy', 'report', 'plan', 'minutes', 'governance', 'historical']),
  series: nonEmpty.optional(),       // documents of one series (for example "Annual reports") are shown together, by year
  year: z.number().int().min(1980).max(2100).optional(),   // required except for a policy: a policy may carry no date (none is guessed)
  date: isoDate.optional(),          // the meeting or publication date, when the title does not give it
  file: z.string().regex(/^\/documents\/[A-Za-z0-9._\/-]+\.pdf$/, 'must be a PDF under /documents/').optional(),
  url: webUrl.optional(),
  citation: nonEmpty.optional(),
  note: nonEmpty.optional(),
}).refine(d => Boolean(d.file) !== Boolean(d.url), { message: 'exactly one of file and url is required' })
  .refine(d => d.kind === 'policy' || d.year !== undefined, { message: 'year is required for every kind except a policy' })
  .refine(d => d.kind !== 'minutes' || Boolean(d.date), { message: 'minutes need a date (they are listed by date within the year)' })

// content/data-management/guide.md : the research data management guide (a tab on /data-platforms/data-management-guide).
// One markdown file: the frontmatter is validated, the body is the guide. `source_url` is where the text came from.
const dataManagementGuide = z.strictObject({
  title: nonEmpty,
  published: z.boolean(),
  source_url: webUrl.optional(),
})

// ---- Critical Zone section (epic: CUAHSI/CUAHSI3-website#62) -----------------------------

// content/critical-zone/*.md : narrative pages of /critical-zone-science. One file per page; the body is the page.
// `order` sorts pages within the section; `sources` are the pages the text was written from (C2); the review fields
// are filled when the science reviewers sign a page off (reviewers are a placeholder until named; decision 12 in epic #62).
const criticalZonePage = z.strictObject({
  title: nonEmpty,
  slug,
  summary: nonEmpty,
  published: z.boolean(),
  order: z.number().int().optional(),
  updated: isoDate.optional(),
  sources: z.array(url.refine(u => /^https?:\/\//.test(u), 'must be an http(s) URL')).optional(),
  reviewed_by: strings.optional(),
  reviewed_on: isoDate.optional(),
})

// content/critical-zone/products.json : the list of known Critical Zone products (datasets, papers, software, models),
// appended to over time. One entry per product, as an array. Only what is known is filled (C3): an unknown optional field is left out.
// `source` is where the entry came from (the source of record); `source_url` is the page or record it was read from;
// `date_added` is when it joined the list. A product needs a DOI or a URL. `usage` holds the counts read from the public
// public sources found in epic ticket T2 (CUAHSI/CUAHSI3-website#64: HydroShare landing pages for views and downloads, OpenAlex for citations), with the date they were read (they change).
const DOI_RE = /^10\.\d{4,9}\/\S*[^\s.,;]$/   // bare DOI; a trailing . , or ; (copied from a sentence) is rejected
// The slugs come from the URL patterns in agent/reports/261028_cz-legacy-inventory.md (T1): the archive's 11 sub-sites, and the Hub and
// nine clusters on criticalzone.org (its /dynamic_water is written dynamic-water here, to match the slug rule).
const CZ_SITES = [
  'national', 'boulder', 'calhoun', 'catalina-jemez', 'christina', 'eel', 'iml', 'luquillo', 'reynolds', 'shale-hills', 'sierra',          // the CZO archive's observatories
  'hub', 'bedrock', 'bigdata', 'cinet', 'coastal', 'drylands', 'dust2', 'dynamic-water', 'geomicrobiology', 'urban',                      // CZNet's hub and nine clusters
]
// `related`: links from this product to other products (epic ticket T6c, CUAHSI/CUAHSI3-website#87). Each says what THIS product is to the linked
// one, in the supporting relations only: `supports` (this product is data that supports the linked product, for example a dataset for a
// paper), `cited-by` (the linked product cites this one), `described-by` (the linked product describes this one, for example a data paper).
// The links live with the dataset, because a repository records "this dataset supplements that paper" and the paper's own record usually
// says nothing back. `source` is where the link was read: `datacite`, or `manual` for a person's confirmed list. The linked product is named by
// a DOI or a URL (the DOI decides when both are given; a URL is compared as written) and must be in the list and not be the product itself,
// unless the entry says `in_list: false` (not yet in it: the validator reports a mismatch either way).
const relatedLink = z.strictObject({
  relation: z.enum(['supports', 'cited-by', 'described-by']),
  doi: z.string().regex(DOI_RE, 'must be a bare DOI such as 10.4211/hs.0123..., not a URL').optional(),
  url: webUrl.optional(),
  source: z.enum(['datacite', 'manual']),
  in_list: z.literal(false).optional(),   // only ever written as false, for a product not yet in the list
}).refine(l => Boolean(l.doi) || Boolean(l.url), { message: 'a related link needs a doi or a url' })
const criticalZoneProduct = z.strictObject({
  title: nonEmpty,
  type: z.enum(['dataset', 'paper', 'software', 'model']),
  doi: z.string().regex(DOI_RE, 'must be a bare DOI such as 10.4211/hs.0123..., not a URL').optional(),
  url: webUrl.optional(),
  hydroshare_id: z.string().regex(/^[a-f0-9]{32}$/, 'must be 32 lowercase hex characters').optional(),
  repository: nonEmpty.optional(),
  awards: slugs.optional(),   // ids in content/awards/awards.json, checked in the cross-reference section
  sites: z.array(z.enum(CZ_SITES)).optional(),
  era: z.enum(['czo', 'cznet']).optional(),
  year: z.number().int().min(1950).max(2100).optional(),
  access: z.enum(['open', 'restricted']).optional(),
  highlight: z.boolean().optional(),
  related: z.array(relatedLink).optional(),
  source: z.enum(['czo-archive', 'discover', 'datacite', 'crossref', 'openalex', 'par', 'suggested', 'manual']),
  source_url: webUrl.optional(),
  date_added: isoDate,
  usage: z.strictObject({
    views: z.number().int().min(0).optional(),
    downloads: z.number().int().min(0).optional(),
    citations: z.number().int().min(0).optional(),
    as_of: isoDate,
  }).optional(),
}).refine(p => Boolean(p.doi) || Boolean(p.url), { message: 'a product needs a doi or a url' })

// ---- what the validator reads ---------------------------------------------------------

// kind "md": every *.md in the folder except README.md, frontmatter validated.
// kind "json": one file holding an array; each entry validated.
export const COLLECTIONS = [
  { name: 'news',          kind: 'md', dir: 'content/news',          schema: news },
  { name: 'newsletter',    kind: 'md', dir: 'content/newsletter',    schema: newsletter },
  { name: 'events',        kind: 'md', dir: 'content/events',        schema: events },
  { name: 'jobs',          kind: 'md', dir: 'content/jobs',          schema: jobs },
  { name: 'cyberseminars', kind: 'md', dir: 'content/cyberseminars', schema: cyberseminars },
  { name: 'research',      kind: 'md', dir: 'content/research',      schema: research },
  { name: 'programs',      kind: 'md', dir: 'content/programs',      schema: programs },
  { name: 'team (.md)',    kind: 'md', dir: 'content/team',          schema: teamMd },
  { name: 'board',         kind: 'md', dir: 'content/board',         schema: boardProfile },
  { name: 'community',     kind: 'md', dir: 'content/community',     schema: communityProfile },
  { name: 'team/full-team.json',  kind: 'json', file: 'content/team/full-team.json',  schema: fullTeamEntry },
  { name: 'members/reps.json',    kind: 'json', file: 'content/members/reps.json',    schema: memberRep },
  // optional: the folders are created by the content changes that fill them (see the schemas above)
  { name: 'graduate-programs',    kind: 'json', file: 'content/graduate-programs/programs.json', schema: graduateProgram, optional: true, uniqueBy: e => e?.institution, uniqueLabel: 'institution' },
  { name: 'data-portals',         kind: 'json', file: 'content/data-portals/portals.json',       schema: dataPortal,      optional: true, uniqueBy: e => e?.name, uniqueLabel: 'name' },
  { name: 'data-management',       kind: 'md',   dir: 'content/data-management',                                   schema: dataManagementGuide, optional: true },
  { name: 'awards',               kind: 'json', file: 'content/awards/awards.json',              schema: award,           optional: true, uniqueBy: e => e?.id, uniqueLabel: 'id' },
  { name: 'documents',            kind: 'json', file: 'content/documents/documents.json',        schema: documentEntry,   optional: true, uniqueBy: e => e?.title, uniqueLabel: 'title' },
  { name: 'critical-zone',        kind: 'md',   dir: 'content/critical-zone',                                   schema: criticalZonePage, optional: true },
  { name: 'critical-zone/products.json', kind: 'json', file: 'content/critical-zone/products.json',  schema: criticalZoneProduct, optional: true,
    uniqueKeys: [
      { label: 'doi', by: e => (typeof e?.doi === 'string' ? e.doi.toLowerCase() : null) },
      { label: 'hydroshare_id', by: e => (typeof e?.hydroshare_id === 'string' ? e.hydroshare_id.toLowerCase() : null) },
    ] },
]
