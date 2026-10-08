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
  youtube_id: z.string(),
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
]
