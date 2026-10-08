<script setup lang="ts">
const rights = "CUAHSI job board. Reuse of this compilation of listings without CUAHSI's permission is not allowed, and where a listing comes from another provider, such as Josh's Water Jobs, that provider's permissions must be honored."
useHead({
  title: 'Job board',
  meta: [
    { name: 'description', content: 'Find and share water science job opportunities — postdocs, permanent positions, fellowships, and internships — through the CUAHSI community job board.' },
    // the same statement as the notice at the bottom of the page, for anyone or anything that reads page metadata
    { name: 'copyright', content: rights },
    { name: 'dcterms.rights', content: rights }
  ]
})

const { data: jobs } = await useAsyncData('jobs', () =>
  queryContent('jobs').where({ published: true }).sort({ posted: -1 }).find()
)

const baseTypeFilters = ['all', 'permanent', 'post-doc', 'fellowship', 'internship', 'graduate-assistantship']
// These two have a chip only while a listing of that type is visible (expired ones count only when shown),
// so the board does not offer a filter that leads to "No current listings".
const optionalTypeFilters = ['faculty', 'temporary']
const typeFilters = computed(() => [
  ...baseTypeFilters,
  ...optionalTypeFilters.filter(t => (jobs.value ?? []).some(j => j.type === t && (showPast.value || !isExpired(j.deadline)))),
])
const activeFilter = ref('all')
const showPast = ref(false)

// The time the page works from: the build's time on the server and for the first browser render (so the two match), then the real
// time once the page is open, because the order, the "closing soon" cut-off and the expired listings depend on it.
const renderedAt = useState('jobs-rendered-at', () => Date.now())
onMounted(() => { renderedAt.value = Date.now() })
const today = computed(() => new Date(renderedAt.value))

function isExpired(deadline: string | null) {
  if (!deadline) return false
  return new Date(deadline) < today.value
}

// Member institutions: the names in content/members/reps.json (names only; no addresses leave this block). A listing with a
// member_institution value is decided by it; otherwise it is from a member when its employer text contains a member's name (compared without case, punctuation, "the" and "of"). This is a text match, so
// a department, centre or institute that does not carry its university's name in the employer text is not recognised.
const { data: memberNames } = await useAsyncData('jobs-member-institutions', async (): Promise<string[]> => {
  const doc = await queryContent('members/reps').findOne().catch(() => null)
  const rows: any[] = Array.isArray(doc?.body) ? doc.body : []
  return [...new Set(rows.map(r => String(r.institution || '').trim()).filter(Boolean))]
})
const normName = (s: string) => ` ${s.toLowerCase().replace(/['’]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `
// Other ways the same institution is written in an employer line: "University of Texas, Austin" is also "University of Texas at
// Austin", and a few well-known short forms. A match is not counted when the name is followed by "of", "in" or "at" (Indiana
// University of Pennsylvania, University of Alabama in Huntsville are not the members Indiana University and University of Alabama).
const ALIASES: Record<string, string> = { 'penn state': 'Pennsylvania State University', 'virginia polytechnic institute': 'Virginia Tech' }
const normMembers = computed(() => {
  const names = memberNames.value ?? []
  const forms = names.flatMap(n => (n.includes(',') ? [n, n.replace(',', ' at')] : [n]))
  return [...forms, ...Object.keys(ALIASES).filter(a => names.includes(ALIASES[a]))].map(normName).filter(n => n.trim())
})
function isMember(job: any) {
  // the job's own answer wins: a name from the member list = a member, null = checked and not a member
  if (job.member_institution === null) return false
  if (typeof job.member_institution === 'string' && job.member_institution) return true
  const org = normName(String(job.organization ?? ''))
  return normMembers.value.some(m => {
    const i = org.indexOf(m)
    if (i < 0) return false
    return !/^(of|in|at) /.test(org.slice(i + m.length))
  })
}

// Order of the list: (1) listings closing within CLOSING_SOON_DAYS days, soonest first; (2) the rest, newest first. Ties (the same
// closing date, or the same posted date) go to listings from CUAHSI member institutions, then newest, then alphabetical by title
// and employer. In words: "Listings closing within 7 days come first (soonest first), then the newest. When dates tie, listings from
// CUAHSI member institutions come first, then the newest, then A to Z." (This rule is not printed on the page.) Expired listings (only shown on request) come last, the most recently closed first.
const CLOSING_SOON_DAYS = 7
const DAY_MS = 86400000
function isClosingSoon(job: any) {
  if (!job.deadline) return false
  const left = Math.ceil((new Date(job.deadline).getTime() - today.value.getTime()) / DAY_MS)
  return left >= 0 && left <= CLOSING_SOON_DAYS
}
const byTitle = (a: any, b: any) =>
  String(a.title).localeCompare(String(b.title), 'en', { sensitivity: 'base' }) || String(a.organization).localeCompare(String(b.organization), 'en', { sensitivity: 'base' })
function compareJobs(a: any, b: any) {
  const ea = isExpired(a.deadline), eb = isExpired(b.deadline)
  if (ea !== eb) return ea ? 1 : -1
  if (ea) return new Date(b.deadline).getTime() - new Date(a.deadline).getTime() || (isMember(a) === isMember(b) ? 0 : isMember(a) ? -1 : 1) || byTitle(a, b)
  const ca = isClosingSoon(a), cb = isClosingSoon(b)
  if (ca !== cb) return ca ? -1 : 1
  if (ca) { const d = new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); if (d) return d }
  else { const p = new Date(b.posted).getTime() - new Date(a.posted).getTime(); if (p) return p }
  const ma = isMember(a), mb = isMember(b)
  if (ma !== mb) return ma ? -1 : 1
  return new Date(b.posted).getTime() - new Date(a.posted).getTime() || byTitle(a, b)
}

const filtered = computed(() => {
  let items = jobs.value ?? []
  if (activeFilter.value !== 'all') items = items.filter(j => j.type === activeFilter.value)
  if (!showPast.value) items = items.filter(j => !isExpired(j.deadline))
  return [...items].sort(compareJobs)
})

const expiredCount = computed(() =>
  (jobs.value ?? []).filter(j => isExpired(j.deadline)).length
)

const typeLabels: Record<string, string> = {
  permanent: 'Permanent position',
  'post-doc': 'Postdoc',
  fellowship: 'Fellowship',
  internship: 'Internship',
  'graduate-assistantship': 'Graduate assistantship',
  faculty: 'Faculty',
  temporary: 'Temporary position',
}

const typeColors: Record<string, {bg: string; text: string}> = {
  permanent:               { bg: '#EFF6FF', text: '#1E40AF' },
  'post-doc':              { bg: '#EDE9FE', text: '#5B21B6' },
  fellowship:              { bg: '#DCFCE7', text: '#15803D' },
  internship:              { bg: '#FFF7ED', text: '#C2410C' },
  'graduate-assistantship':{ bg: '#FEF9C3', text: '#854D0E' },
  faculty:                 { bg: '#FCE7F3', text: '#9D174D' },
  temporary:               { bg: '#ECFEFF', text: '#0E7490' },
}

// "via Josh's Water Jobs" is a condition of Josh's permission to list his postings. Link to the
// posting's page on his site: source_url when the agent wrote one, else url if it already points there.
function isJwjUrl(u: unknown): u is string {
  if (typeof u !== 'string') return false
  try {
    const x = new URL(u)
    return (x.protocol === 'https:' || x.protocol === 'http:') && (x.hostname === 'joshswaterjobs.com' || x.hostname.endsWith('.joshswaterjobs.com'))
  } catch { return false }
}
function jwjLink(job: any): string | null {
  if (job.source !== 'joshswaterjobs') return null
  if (isJwjUrl(job.source_url)) return job.source_url
  return isJwjUrl(job.url) ? job.url : null
}

function typeStyle(type: string) {
  const c = typeColors[type] ?? { bg: '#F3F4F6', text: '#5C6E78' }
  return `font-size:11px;padding:2px 9px;border-radius:99px;font-weight:500;white-space:nowrap;background:${c.bg};color:${c.text};`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - today.value.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'Closes today'
  if (diff === 1) return 'Closes tomorrow'
  if (diff <= CLOSING_SOON_DAYS) return `Closes in ${diff} days`
  return null
}
</script>

<template>
  <div>

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">

      <!-- Header -->
      <div class="grid gap-[24px] [align-items:end] p-[36px_0_28px] border-b-[0.5px] border-b-[#f3f4f6] mb-[28px] grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p class="text-[11px] text-muted mb-[8px]">
            <NuxtLink to="/community" class="no-underline text-muted">Get involved</NuxtLink> / Job board
          </p>
          <h1 class="text-[28px] font-medium mb-[10px]">Job board</h1>
          <p class="text-[14px] text-[#6b7280] leading-[1.65] max-w-[520px]">
            Find and share water science opportunities — postdocs, permanent positions, fellowships,
            and internships. Postings remain active for 60 days. Open to the full water science community.
          </p>
        </div>
        <a href="https://cuahsi.jotform.com/222235514170142" target="_blank" rel="noopener"
          class="shrink-0 text-[13px] font-medium p-[10px_18px] bg-[#111827] text-white rounded-[8px] no-underline whitespace-nowrap">
          Post a job →
        </a>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-[6px] flex-wrap mb-[24px]">
        <span class="text-[12px] text-muted mr-[4px]">Type</span>
        <FilterChip v-for="f in typeFilters" :key="f" variant="gray" :active="activeFilter===f" @click="activeFilter=f">
          {{ f === 'all' ? 'All types' : typeLabels[f] ?? f }}
        </FilterChip>
      </div>

      <!-- Listings -->
      <div class="mb-[32px]">
        <div v-if="filtered?.length">
          <div v-for="job in filtered" :key="job._path"
            class="relative block border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit"
            :class="isMember(job) ? 'p-[20px_16px] -mx-[16px] bg-[#EAF3FB] rounded-[10px] mb-[6px]' : 'p-[20px_0]'">
            <div class="flex items-start justify-between gap-[16px]">
              <div class="flex-1 min-w-[0]">
                <div class="flex items-center gap-[8px] mb-[5px] flex-wrap">
                  <p class="text-[15px] font-medium leading-[1.3]"><a :href="job.url" target="_blank" rel="noopener" class="no-underline text-inherit after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-[#1E40AF]">{{ job.title }}</a></p>
                  <span :style="typeStyle(job.type)">{{ typeLabels[job.type] ?? job.type }}</span>
                  <span v-if="job.deadline && daysUntil(job.deadline)"
                    class="text-[11px] p-[2px_8px] rounded-[99px] bg-[#FEF2F2] text-[#DC2626] border-[0.5px] border-[#FECACA]">
                    {{ daysUntil(job.deadline) }}
                  </span>
                </div>
                <p class="text-[13px] text-[#374151] font-medium mb-[4px] flex items-center gap-[8px] flex-wrap">
                  {{ job.organization }}
                  <span v-if="isMember(job)" class="text-[11px] font-medium p-[2px_8px] rounded-[99px] bg-[#CFE3F5] text-[#0F2E44]">CUAHSI member</span>
                </p>
                <div class="flex gap-[12px] text-[12px] text-muted mb-[8px] flex-wrap">
                  <span v-if="job.location">📍 {{ job.location }}</span>
                  <span>Posted {{ fmtDate(job.posted) }}</span>
                  <span v-if="job.deadline">Deadline {{ fmtDate(job.deadline) }}</span>
                </div>
                <p class="text-[13px] leading-[1.55]" :class="isMember(job) ? 'text-[#4b5563]' : 'text-[#6b7280]'">{{ job.body?.children?.[0]?.children?.[0]?.value ?? '' }}</p>
                <div class="flex gap-[5px] flex-wrap mt-[8px]">
                  <span v-for="t in job.tags" :key="t"
                    class="text-[11px] p-[2px_7px] rounded-[99px] bg-[#f3f4f6] text-muted">
                    {{ t.replace(/-/g,' ') }}
                  </span>
                </div>
                <p v-if="jwjLink(job)" class="text-[11px] text-muted mt-[8px]">
                  via <a :href="jwjLink(job)!" target="_blank" rel="noopener" class="relative z-10 underline text-inherit">Josh's Water Jobs</a>
                </p>
              </div>
              <span aria-hidden="true" class="text-[13px] text-[#d1d5db] shrink-0 pt-[2px]">↗</span>
            </div>
          </div>
        </div>
        <p v-else class="text-[14px] text-muted p-[24px_0]">No current listings match this filter.</p>
      </div>

      <!-- Show/hide expired toggle -->
      <div v-if="expiredCount > 0" class="mb-[48px]">
        <button @click="showPast=!showPast"
          class="text-[12px] text-muted bg-[none] border-0 cursor-pointer p-[0] underline">
          {{ showPast ? 'Hide' : 'Show' }} {{ expiredCount }} expired listing{{ expiredCount === 1 ? '' : 's' }}
        </button>
      </div>

      <!-- Post a job CTA -->
      <div class="bg-[#f9fafb] rounded-[12px] p-[22px_24px] mb-[48px] grid gap-[20px] items-center grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p class="text-[14px] font-medium mb-[4px]">Have a position to share?</p>
          <p class="text-[13px] text-[#6b7280] leading-[1.6]">
            CUAHSI welcomes job postings relevant to the water science community — faculty positions,
            postdocs, fellowships, internships, and industry roles. Postings are free and remain active for 60 days.
          </p>
        </div>
        <a href="https://cuahsi.jotform.com/222235514170142" target="_blank" rel="noopener"
          class="shrink-0 text-[13px] font-medium p-[9px_18px] border-[0.5px] border-[#d1d5db] rounded-[8px] no-underline text-inherit whitespace-nowrap">
          Submit a listing →
        </a>
      </div>

      <!-- Terms of use of the list -->
      <p class="text-[12px] text-muted leading-[1.65] max-w-[760px] mb-[64px]">
        <strong class="font-medium">Terms of use.</strong> CUAHSI compiles the listings on this page to help job seekers in the water
        science community. This compilation may not be copied, scraped, republished or redistributed without CUAHSI's written permission.
        Where a listing comes from another provider, such as Josh's Water Jobs, which shares its listings under its own permission, anyone
        who reuses or cites that listing must honor that provider's terms. To ask about reuse, write to
        <a href="mailto:connect@cuahsi.org" class="underline text-inherit">connect@cuahsi.org</a>.
      </p>

    </div>
  </div>
</template>
