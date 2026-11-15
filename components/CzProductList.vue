<script setup lang="ts">
// The Critical Zone products list (content/critical-zone/products.json) as one table that can be searched, filtered by
// observatory or cluster, and sorted. Epic CUAHSI/CUAHSI3-website#62, ticket T9a, redesigned from the grouped lists (era, then
// award, then site) after Jordan found 60 award pills unusable.
//
// The server writes every row, newest first, so the page is complete without client script. The controls (search, picker, sort
// buttons) appear only after mount and change what is shown from then on. State starts at the defaults on the server and in the
// browser's first render (footgun 13), and is read from the address (?site=&q=&sort=&dir=) in onMounted.
//
// The data comes from a bare JSON array, which Nuxt Content wraps in `body` (footgun 7). `transform` keeps only the fields
// this component shows, so the page payload does not carry whole records.
const props = defineProps<{
  type?: 'dataset' | 'paper'   // only products of this type; all when left out
  types?: string[]             // only products of these types (used when more than one, such as datasets with software and models)
  site?: string                // only products tagged with this site slug; also hides the observatory picker
  idPrefix?: string            // put before every id, so several lists on one page do not repeat ids
  compact?: boolean            // for a list inside another section: no controls, no sorting, rows in the default order
  label?: string               // accessible name of the table (the section it sits in)
}>()

type Row = {
  title: string; type: string; doi?: string; url?: string; repository?: string; awards?: string[]
  sites?: string[]; year?: number; date_added?: string; highlight?: boolean
}
type Award = { id: string; funder?: string; number: string; url?: string; text: string }
type Shown = Row & { i: number; where: string; siteText: string; period: string; periodStart: number; awardList: { title: string; number: string }[]; hay: string }

const { data: file } = await useAsyncData(`cz-products-${props.type ?? props.types?.join('+') ?? 'all'}-${props.site ?? 'all'}`, () =>
  queryContent('critical-zone').where({ _extension: 'json' }).findOne().catch(() => null),
  {
    transform: (f: any) => {
      const all: Row[] = f?._path === '/critical-zone/products' && Array.isArray(f?.body) ? f.body : []
      const rows = all
        .filter(r => (!props.type || r.type === props.type) && (!props.types || props.types.includes(r.type)) && (!props.site || (r.sites ?? []).includes(props.site)))
        .map(r => ({ title: r.title, type: r.type, doi: r.doi, url: r.url, repository: r.repository, awards: r.awards, sites: r.sites, year: r.year, highlight: r.highlight === true }))
      const added = all.map(r => r.date_added).filter(Boolean).sort() as string[]
      return { rows, asOf: added.length ? added[added.length - 1] : null }
    },
  }
)
const { data: awardFile } = await useAsyncData('cz-award-registry', () =>
  queryContent('awards').where({ _extension: 'json' }).findOne().catch(() => null),
  { transform: (f: any) => (f?._path === '/awards/awards' && Array.isArray(f?.body) ? f.body : []) as Award[] }
)

const awardById = computed(() => new Map((awardFile.value ?? []).map(a => [a.id, a])))
const awardTitle = (a?: Award) => a?.text?.match(/"([^"]+)"/)?.[1] ?? ''
const siteName = (slug: string) => CZ_SITE_NAMES[slug] ?? slug
const siteList = (r: Row) => (r.sites ?? []).filter(s => s !== 'national' || (r.sites ?? []).length === 1).map(siteName).join(', ')
const link = (r: Row) => (r.doi ? `https://doi.org/${r.doi}` : r.url ?? '')
// Who holds the product: a paper's publisher (from its DOI prefix), a dataset's repository. "DOI" stays for a paper whose prefix is not in the table.
function where(r: Row) {
  if (r.type === 'paper') {
    if (r.doi) return czPublisher(r.doi) || 'DOI'
  } else {
    if ((r.url ?? '').includes('hydroshare.org')) return 'HydroShare'
    if (r.repository) return czRepositoryName(r.repository)
  }
  if (r.doi) return 'DOI'
  if ((r.url ?? '').includes('hydroshare.org')) return 'HydroShare'
  if ((r.url ?? '').includes('czo-archive.criticalzone.org')) return 'CZO archive page (retiring)'
  return 'Link'
}

// Plain comparisons, not localeCompare: the build (Node) and the visitor's browser may order accented titles differently, and a
// different order on the first browser render puts the wrong content in each row (see footgun 13 for the same kind of fault).
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

// The period a dataset covers, when its title ends in one, as the archive writes it: "(2006)" or "(2010-2017)". `year` is the year it was
// published; the two differ, and the title is left as it is. Only a trailing parenthesised year or range counts.
const PERIOD = /\((\d{4})(?:\s*[-–]\s*(\d{4}|Ongoing))?\)\s*$/
function periodOf(title: string): { text: string; start: number } {
  const m = PERIOD.exec(title)
  if (!m) return { text: '', start: 0 }
  const start = Number(m[1])
  const end = m[2] === 'Ongoing' ? Infinity : Number(m[2] ?? m[1])
  // A placeholder such as (0000-0000), or an end before the start, is not a period.
  if (start < 1800 || end < start) return { text: '', start: 0 }
  return { text: m[2] === 'Ongoing' ? `${m[1]}–ongoing` : end !== start ? `${m[1]}–${m[2]}` : m[1], start }
}

// Every row with the text it shows worked out once. `i` is the row's place in the file: a stable key for the table.
const all = computed<Shown[]>(() => (file.value?.rows ?? []).map((r, i) => {
  const awardList = (r.awards ?? []).map(id => {
    const a = awardById.value.get(id)
    return { title: awardTitle(a), number: a?.number ?? id }
  })
  const siteText = siteList(r)
  const per = periodOf(r.title)
  const place = where(r)
  return {
    ...r, i, where: place, siteText, awardList, period: per.text, periodStart: per.start,
    hay: [r.title, r.repository, place, r.year, per.text, r.highlight ? 'highlight' : '', siteText, ...awardList.map(a => `${a.title} ${a.number}`)].join(' ').toLowerCase(),
  }
}))

const asOf = computed(() => file.value?.asOf
  ? new Date(file.value.asOf).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  : null)
// The Data period column is shown only when some row has a period (datasets do; papers have none).
const showPeriod = computed(() => all.value.some(r => r.period))
// The Type column is shown when the list holds more than one type of product (for example datasets and software); a list of one type has no need of it.
const showType = computed(() => new Set(all.value.map(r => r.type)).size > 1)

// Observatories and clusters that have at least one row, in the order of the label table (observatories first, then clusters).
const siteOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const r of all.value) for (const s of r.sites ?? []) counts.set(s, (counts.get(s) ?? 0) + 1)
  return Object.keys(CZ_SITE_NAMES).filter(s => counts.has(s)).map(s => ({ slug: s, name: siteName(s), n: counts.get(s) as number }))
})

type SortKey = 'title' | 'site' | 'award' | 'year' | 'period'
const q = ref('')
const siteFilter = ref('')
const sortKey = ref<SortKey>('year')
const sortDir = ref<'asc' | 'desc'>('desc')
const mounted = ref(false)

const sortValue = (r: Shown, k: SortKey): string | number =>
  k === 'year' ? (r.year ?? 0) : k === 'period' ? r.periodStart : k === 'title' ? r.title.toLowerCase() : k === 'site' ? r.siteText.toLowerCase() : (r.awardList[0] ? `${r.awardList[0].title} ${r.awardList[0].number}`.toLowerCase() : '')

const shown = computed<Shown[]>(() => {
  const tokens = q.value.toLowerCase().split(/\s+/).filter(Boolean)
  const rows = all.value.filter(r => (!siteFilter.value || (r.sites ?? []).includes(siteFilter.value)) && tokens.every(t => r.hay.includes(t)))
  const dir = sortDir.value === 'asc' ? 1 : -1
  const k = sortKey.value
  return [...rows].sort((a, b) => {
    const x = sortValue(a, k), y = sortValue(b, k)
    // A row with no value for the column (no award, no site, no year) goes last whichever way the column is sorted.
    const xe = x === '' || x === 0, ye = y === '' || y === 0
    if (xe !== ye) return xe ? 1 : -1
    const c = typeof x === 'number' && typeof y === 'number' ? x - y : cmp(String(x), String(y))
    // Rows that tie fall back to newest first, then title.
    return c * dir || (b.year ?? 0) - (a.year ?? 0) || cmp(a.title, b.title)
  })
})

const nf = (n: number) => n.toLocaleString('en-US')
const filtered = computed(() => !!q.value.trim() || !!siteFilter.value)
const pid = (id: string) => (props.idPrefix ? `${props.idPrefix}-${id}` : id)
function sortBy(k: SortKey) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = k; sortDir.value = k === 'year' || k === 'period' ? 'desc' : 'asc' }
}
const ariaSort = (k: SortKey) => (sortKey.value === k ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none')
const arrow = (k: SortKey) => (sortKey.value === k ? (sortDir.value === 'asc' ? '↑' : '↓') : '')
function clearFilters() { q.value = ''; siteFilter.value = '' }

const route = useRoute()
const router = useRouter()
const SORT_KEYS: SortKey[] = ['title', 'site', 'award', 'year', 'period']
onMounted(() => {
  if (!props.compact) {
    const p = { get: (k: string) => { const v = route.query[k]; return (Array.isArray(v) ? v[0] : v) ?? null } }
    const s = p.get('site') ?? ''
    if (!props.site && siteOptions.value.some(o => o.slug === s)) siteFilter.value = s
    q.value = p.get('q') ?? ''
    const k = p.get('sort') as SortKey
    if (SORT_KEYS.includes(k) && (k !== 'period' || showPeriod.value)) {
      sortKey.value = k
      sortDir.value = p.get('dir') === 'asc' ? 'asc' : p.get('dir') === 'desc' ? 'desc' : (k === 'year' || k === 'period' ? 'desc' : 'asc')
    }
  }
  mounted.value = true
})

// Keep the choice in the address so a view can be sent as a link. Last in the script: it reads the refs above (footgun 14).
watch([q, siteFilter, sortKey, sortDir], () => {
  if (!mounted.value || props.compact) return
  const isDefault = sortKey.value === 'year' && sortDir.value === 'desc'
  const query: Record<string, any> = { ...route.query }
  const set = (k: string, v: string) => { if (v) query[k] = v; else delete query[k] }
  set('q', q.value.trim())
  set('site', siteFilter.value)
  set('sort', isDefault ? '' : sortKey.value)
  set('dir', isDefault ? '' : sortDir.value)
  router.replace({ query })
})
</script>

<template>
  <div>
    <p v-if="asOf" class="font-mono text-[12px] leading-[normal] text-muted m-[0_0_20px]">
      <span aria-live="polite">{{ filtered ? `${nf(shown.length)} of ${nf(all.length)} shown` : `${nf(all.length)} listed` }}.</span>
      The list is added to in batches; last addition {{ asOf }}.
    </p>

    <p v-if="!all.length" class="font-['Hanken_Grotesk'] text-[15px] leading-[1.6] text-[#3a4d57]">Nothing is listed here yet.</p>

    <!-- Controls: only once the page is running in the browser, because they do nothing without it -->
    <div v-if="all.length && mounted && !compact" class="flex flex-wrap items-end gap-[16px] mb-[20px]">
      <div class="flex flex-col gap-[4px] grow min-w-[220px] max-w-[420px]">
        <label :for="pid('search')" class="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Search</label>
        <input :id="pid('search')" v-model="q" type="search" placeholder="Title, journal, observatory, award or highlight"
          class="font-['Hanken_Grotesk'] text-[15px] leading-[normal] text-ink bg-white border border-[rgba(15,33,43,.25)] rounded-[8px] p-[9px_12px]">
      </div>
      <div v-if="!site" class="flex flex-col gap-[4px] min-w-[220px]">
        <label :for="pid('site')" class="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Observatory or cluster</label>
        <select :id="pid('site')" v-model="siteFilter"
          class="font-['Hanken_Grotesk'] text-[15px] leading-[normal] text-ink bg-white border border-[rgba(15,33,43,.25)] rounded-[8px] p-[9px_12px]">
          <option value="">All ({{ nf(all.length) }})</option>
          <option v-for="o in siteOptions" :key="o.slug" :value="o.slug">{{ o.name }} ({{ nf(o.n) }})</option>
        </select>
      </div>
      <button v-if="filtered" type="button" class="font-['Hanken_Grotesk'] text-[14px] leading-[normal] text-water font-medium bg-transparent border-0 p-[10px_4px] cursor-pointer" @click="clearFilters">Clear</button>
    </div>

    <div v-else-if="all.length && !compact" class="min-h-[66px] mb-[20px]" aria-hidden="true" />

    <p v-if="all.length && !shown.length" class="font-['Hanken_Grotesk'] text-[15px] leading-[1.6] text-[#3a4d57]">
      Nothing matches. <button type="button" class="text-water font-medium bg-transparent border-0 p-0 cursor-pointer" @click="clearFilters">Clear the search and filter</button>.
    </p>

    <div v-if="shown.length" class="overflow-x-auto">
      <table :id="pid('table')" :aria-label="label" class="w-full border-collapse text-left font-['Hanken_Grotesk'] text-[14.5px] leading-[1.45] text-[#3a4d57]">
        <thead>
          <tr class="font-mono text-[11.5px] tracking-[.05em] uppercase text-muted">
            <th scope="col" :aria-sort="mounted && !compact ? ariaSort('title') : undefined" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)]">
              <button v-if="mounted && !compact" type="button" class="sortbtn" @click="sortBy('title')">Title <span aria-hidden="true">{{ arrow('title') }}</span></button>
              <template v-else>Title</template>
            </th>
            <th v-if="showType" scope="col" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden sm:table-cell">Type</th>
            <th scope="col" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden sm:table-cell">Where</th>
            <th v-if="!site" scope="col" :aria-sort="mounted && !compact ? ariaSort('site') : undefined" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden sm:table-cell">
              <button v-if="mounted && !compact" type="button" class="sortbtn" @click="sortBy('site')">Observatory or cluster <span aria-hidden="true">{{ arrow('site') }}</span></button>
              <template v-else>Observatory or cluster</template>
            </th>
            <th scope="col" :aria-sort="mounted && !compact ? ariaSort('award') : undefined" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden min-[900px]:table-cell">
              <button v-if="mounted && !compact" type="button" class="sortbtn" @click="sortBy('award')">Award <span aria-hidden="true">{{ arrow('award') }}</span></button>
              <template v-else>Award</template>
            </th>
            <th v-if="showPeriod" scope="col" :aria-sort="mounted && !compact ? ariaSort('period') : undefined" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden sm:table-cell text-right">
              <button v-if="mounted && !compact" type="button" class="sortbtn" @click="sortBy('period')">Data period <span aria-hidden="true">{{ arrow('period') }}</span></button>
              <template v-else>Data period</template>
            </th>
            <th scope="col" :aria-sort="mounted && !compact ? ariaSort('year') : undefined" class="font-normal p-[8px_10px] border-b border-b-[rgba(15,33,43,.15)] hidden sm:table-cell text-right">
              <button v-if="mounted && !compact" type="button" class="sortbtn" @click="sortBy('year')">Published <span aria-hidden="true">{{ arrow('year') }}</span></button>
              <template v-else>Published</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in shown" :key="r.i" class="align-top">
            <td class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)]">
              <a :href="link(r)" target="_blank" rel="noopener" class="text-water font-medium">{{ r.title }}</a>
              <span v-if="r.highlight" class="inline-block align-middle ml-[8px] font-mono font-bold text-[10px] leading-[normal] tracking-[.1em] uppercase text-[#8F3F1F] bg-[rgba(192,96,60,.12)] rounded-[4px] p-[2px_6px]"><span class="sr-only">, </span>Highlight</span>
              <span v-if="r.repository" class="block text-[12.5px] text-muted">{{ r.repository }}</span>
              <!-- Phone width: the columns that follow are hidden and their values go here -->
              <span class="block sm:hidden font-mono text-[11.5px] text-muted mt-[4px]">{{ [showType ? r.type : '', r.where, r.siteText, r.period ? `Data ${r.period}` : '', r.year ? `Published ${r.year}` : ''].filter(Boolean).join(' · ') }}</span>
            </td>
            <td v-if="showType" class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] capitalize whitespace-nowrap hidden sm:table-cell">{{ r.type }}</td>
            <td class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] hidden sm:table-cell">{{ r.where }}</td>
            <td v-if="!site" class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] hidden sm:table-cell">{{ r.siteText }}</td>
            <td class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] hidden min-[900px]:table-cell max-w-[280px]">
              <span v-for="a in r.awardList" :key="a.number" class="block text-[12.5px] leading-[1.4] mb-[4px]">
                <span v-if="a.title" :title="a.title" class="block line-clamp-3">{{ a.title }}</span>
                <span class="block font-mono text-[11px] text-muted">{{ a.number }}</span>
              </span>
            </td>
            <td v-if="showPeriod" class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] hidden sm:table-cell text-right whitespace-nowrap [font-variant-numeric:tabular-nums]">{{ r.period }}</td>
            <td class="p-[8px_10px] border-b border-b-[rgba(15,33,43,.08)] hidden sm:table-cell text-right [font-variant-numeric:tabular-nums]">{{ r.year ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.sortbtn { font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
.sortbtn:hover { color: #0F2E44; }
</style>
