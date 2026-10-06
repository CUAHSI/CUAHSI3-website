<script setup lang="ts">
// The catalog of water data portals: one table, from content/data-portals/portals.json (an array; Nuxt Content wraps a
// bare array in `.body`, so it is unwrapped here: CLAUDE.md footgun 7). Short columns only: name, owner, scope, link.
useHead({
  title: 'Water data portals',
  meta: [{ name: 'description', content: 'A catalog of water data portals: who runs them, what they cover, and where to find them.' }]
})

type Row = { name: string; owner: string; scope?: string; url: string; last_reviewed: string }
const { data } = await useAsyncData('data-portals-json', () =>
  queryContent('data-portals').where({ _extension: 'json' }).findOne().catch(() => null)
)
const rows = computed<Row[]>(() => (Array.isArray(data.value?.body) ? data.value.body : []) as Row[])

const query = ref('')
const filtered = computed(() => rows.value.filter(r =>
  !query.value || (r.name + ' ' + r.owner + ' ' + (r.scope ?? '')).toLowerCase().includes(query.value.toLowerCase())
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
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/data-platforms" class="text-muted">Data &amp; Computing</NuxtLink> / Water data portals</p></template>
      <template #kicker>Data &amp; Computing · Water data portals</template>
      <template #title>Where to find water data.</template>
      <template #lead>A catalog of portals that publish water data: who runs each one, what it covers, and a link. We review each entry every year.</template>
      <template #below><SectionNav section="data" fixed /></template>
    </PageHero>

    <div class="mx-auto max-w-site p-[40px_40px_80px]">
      <div v-if="rows.length">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
          <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px]">Portals</p>
          <input v-model="query" type="text" aria-label="Search portals" placeholder="Search by name, owner or place…"
            class="border border-[rgba(15,33,43,.15)] rounded-[8px] p-[9px_12px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] w-[260px] max-w-full" />
        </div>
        <p class="font-mono text-[11px] text-muted mb-4" role="status" aria-live="polite">{{ filtered.length }} portal{{ filtered.length === 1 ? '' : 's' }}</p>

        <div role="table" aria-label="Water data portals" class="border border-[rgba(15,33,43,.1)] rounded-card overflow-hidden">
          <div role="row" class="hidden min-[900px]:grid grid-cols-[minmax(0,3fr)_minmax(0,2.4fr)_minmax(0,1.6fr)_auto] gap-[16px] p-[10px_18px] bg-[rgba(15,33,43,.04)] border-b border-b-[rgba(15,33,43,.08)]">
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Portal</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Owner</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Scope</p>
            <p role="columnheader" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] m-0">Reviewed</p>
          </div>
          <div class="divide-y divide-[rgba(15,33,43,.08)]">
          <div v-for="(r, i) in filtered" :key="r.name + '|' + i" role="row" class="grid grid-cols-[minmax(0,1fr)] gap-[6px] p-[14px_18px] min-[900px]:grid-cols-[minmax(0,3fr)_minmax(0,2.4fr)_minmax(0,1.6fr)_auto] min-[900px]:gap-[16px] items-baseline bg-paper">
            <p role="cell" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[1.35] text-ink m-0">
              <a :href="r.url" target="_blank" rel="noopener" class="text-ink no-underline">{{ r.name }} <span class="text-water">↗</span></a>
            </p>
            <p role="cell" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.45] text-[#3a4d57] m-0"><span class="font-mono text-[10px] text-muted min-[900px]:hidden">Owner: </span>{{ r.owner }}</p>
            <p role="cell" class="font-mono text-[11px] leading-[1.5] text-muted m-0"><span v-if="r.scope" class="min-[900px]:hidden">Scope: </span>{{ r.scope ?? '' }}</p>
            <p role="cell" class="font-mono text-[10px] text-muted m-0 whitespace-nowrap"><span class="min-[900px]:hidden">Reviewed </span>{{ fmtDate(r.last_reviewed) }}</p>
          </div>
          </div>
        </div>
        <p v-if="!filtered.length" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-muted p-[20px_0]">No portals match.</p>
      </div>
      <p v-else class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57] max-w-[560px]">The catalog is being compiled and will appear here soon.</p>

      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.6] text-[#3a4d57] mt-[28px] max-w-[620px]">
        Run a portal that is missing, or see something out of date?
        <NuxtLink to="/contact" class="text-water">Tell us →</NuxtLink>
      </p>
    </div>
  </div>
</template>
