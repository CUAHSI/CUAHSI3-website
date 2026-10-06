<script setup lang="ts">
// The directory of graduate programs in water science: one table, from content/graduate-programs/programs.json
// (an array; Nuxt Content wraps a bare array in `.body`, so it is unwrapped here: CLAUDE.md footgun 7).
// Each row carries a "last reviewed" date; staff review the list once a year.
useHead({
  title: 'Graduate programs in water science',
  meta: [{ name: 'description', content: 'A directory of university graduate programs in water science, by degree, reviewed every year.' }]
})

type Row = { institution: string; programs: string; degrees: string[]; url?: string; last_reviewed: string }
const { data } = await useAsyncData('graduate-programs-json', () =>
  queryContent('graduate-programs').where({ _extension: 'json' }).findOne().catch(() => null)
)
const rows = computed<Row[]>(() => (Array.isArray(data.value?.body) ? data.value.body : []) as Row[])

const levels = [
  { key: 'all', label: 'All degrees' },
  { key: 'masters', label: "Master's" },
  { key: 'phd', label: 'Ph.D.' },
  { key: 'undergraduate', label: 'Undergraduate' },
  { key: 'professional', label: 'Other / professional' },
]
const degreeLabel = (k: string) => levels.find(l => l.key === k)?.label ?? k

const query = ref('')
const level = ref('all')
const filtered = computed(() => rows.value.filter(r =>
  (level.value === 'all' || r.degrees.includes(level.value)) &&
  (!query.value || (r.institution + ' ' + r.programs).toLowerCase().includes(query.value.toLowerCase()))
))
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[620px]">
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/learn-train" class="text-muted">Learn &amp; Train</NuxtLink> / Graduate programs</p></template>
      <template #kicker>Learn &amp; Train · Graduate programs</template>
      <template #title>Find a graduate program in water science.</template>
      <template #lead>Many universities have no hydrology department, which makes it hard to know where to start. This is a starting point: programs by institution and degree. We review each row every year.</template>
      <template #below><SectionNav section="learn" fixed /></template>
    </PageHero>

    <div class="mx-auto max-w-site p-[40px_40px_80px]">
      <div v-if="rows.length">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
          <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px]">Institutions</p>
          <input v-model="query" type="text" aria-label="Search institutions and programs" placeholder="Search institutions or programs…"
            class="border border-[rgba(15,33,43,.15)] rounded-[8px] p-[9px_12px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] w-[260px] max-w-full" />
        </div>
        <div class="flex gap-[6px] flex-wrap mb-5">
          <FilterChip v-for="l in levels" :key="l.key" variant="navy" :active="level === l.key" @click="level = l.key">{{ l.label }}</FilterChip>
        </div>
        <p class="font-mono text-[11px] text-muted mb-4" role="status" aria-live="polite">{{ filtered.length }} institution{{ filtered.length === 1 ? '' : 's' }}</p>

        <div role="table" aria-label="Graduate programs by institution" class="border border-[rgba(15,33,43,.1)] rounded-card overflow-hidden">
          <div role="row" class="hidden min-[900px]:grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1.4fr)_auto] gap-[16px] p-[10px_18px] bg-[rgba(15,33,43,.04)] border-b border-b-[rgba(15,33,43,.08)]">
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Institution</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Programs</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Degrees</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Reviewed</p>
          </div>
          <div class="divide-y divide-[rgba(15,33,43,.08)]">
          <div v-for="(r, i) in filtered" :key="r.institution + '|' + i" role="row" class="grid grid-cols-[minmax(0,1fr)] gap-[6px] p-[14px_18px] min-[900px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1.4fr)_auto] min-[900px]:gap-[16px] items-baseline bg-paper">
            <p role="cell" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[1.35] text-ink m-0">
              <a v-if="r.url" :href="r.url" target="_blank" rel="noopener" class="text-ink no-underline">{{ r.institution }} <span class="text-water">↗</span></a>
              <span v-else>{{ r.institution }}</span>
            </p>
            <p role="cell" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.45] text-[#3a4d57] m-0">{{ r.programs }}</p>
            <p role="cell" class="font-mono text-[11px] leading-[1.5] text-muted m-0">{{ r.degrees.map(degreeLabel).join(' · ') }}</p>
            <p role="cell" class="font-mono text-[10px] text-muted m-0 whitespace-nowrap"><span class="min-[900px]:hidden">Reviewed </span>{{ fmtDate(r.last_reviewed) }}</p>
          </div>
          </div>
        </div>
        <p v-if="!filtered.length" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-muted p-[20px_0]">No institutions match.</p>
      </div>
      <p v-else class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57] max-w-[560px]">The directory is being compiled and will appear here soon.</p>

      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.6] text-[#3a4d57] mt-[28px] max-w-[620px]">
        Know of a program that is missing or out of date?
        <NuxtLink to="/contact" class="text-water">Tell us →</NuxtLink>
      </p>
    </div>
  </div>
</template>
