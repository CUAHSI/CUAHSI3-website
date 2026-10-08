<script setup lang="ts">
// Policies, reports and the record, from content/documents/documents.json (an array; Nuxt Content wraps a bare array
// in `.body`, so it is unwrapped here: CLAUDE.md footgun 7). A document is either a PDF hosted here (`file`) or
// hosted elsewhere (`url`, for example a HydroShare resource, with a `citation`). Documents with the same `series`
// are shown together as year links; a section is drawn only when it has documents.
useHead({
  title: 'Documents & policies',
  meta: [{ name: 'description', content: 'CUAHSI policies, annual reports, strategic plans, meeting minutes and historical papers.' }]
})

type Doc = { title: string; kind: string; series?: string; year?: number; date?: string; file?: string; url?: string; citation?: string; note?: string }
const { data } = await useAsyncData('documents-json', () =>
  queryContent('documents').where({ _extension: 'json' }).findOne().catch(() => null)
)
const docs = computed<Doc[]>(() => (Array.isArray(data.value?.body) ? data.value.body : []) as Doc[])
const href = (d: Doc) => d.file ?? d.url ?? '#'
const external = (d: Doc) => Boolean(d.url)
const byKind = (k: string) => docs.value.filter(d => d.kind === k)

// reports and plans: one card per series (newest year first); a document with no series is its own card
const reportCards = computed(() => {
  const cards: { title: string; items: Doc[] }[] = []
  for (const d of [...byKind('report'), ...byKind('plan')].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))) {
    const title = d.series ?? d.title
    const card = cards.find(c => c.title === title)
    if (card) card.items.push(d); else cards.push({ title, items: [d] })
  }
  return cards
})
// meeting minutes: by year, newest first, each meeting by date
const minutesByYear = computed(() => {
  const map = new Map<number, Doc[]>()
  for (const d of byKind('minutes')) map.set(d.year ?? 0, [...(map.get(d.year ?? 0) ?? []), d])
  return [...map.keys()].sort((a, b) => b - a).map(y => ({ year: y, items: (map.get(y) ?? []).sort((a, b) => (a.date ?? a.title).localeCompare(b.date ?? b.title)) }))
})
const sections = computed(() => [
  { id: 'policies', label: 'Policies', show: byKind('policy').length > 0 },
  { id: 'reports', label: 'Reports and plans', show: reportCards.value.length > 0 },
  { id: 'governance', label: 'Governance', show: byKind('governance').length > 0 || minutesByYear.value.length > 0 },
  { id: 'history', label: 'Historical papers', show: byKind('historical').length > 0 },
].filter(s => s.show))
</script>

<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[600px] mb-[18px]">
      <template #kicker>About · Documents &amp; policies</template>
      <template #title>Our policies, reports and record.</template>
      <template #lead>The documents that say how CUAHSI works and what it has done, in one place.</template>
      <div v-if="sections.length" class="flex gap-x-[10px] gap-y-[2px] flex-wrap font-['Hanken_Grotesk'] font-medium text-[13px] leading-[normal]">
        <template v-for="(s, i) in sections" :key="s.id">
          <span v-if="i" class="text-muted p-[4px_0]" aria-hidden="true">·</span>
          <a :href="'#' + s.id" class="text-water no-underline p-[4px_0]">{{ s.label }}</a>
        </template>
      </div>
      <template #top><SectionNav section="about" fixed /></template>
    </PageHero>

    <div class="mx-auto max-w-site p-[40px_40px_80px]">
      <p v-if="!docs.length" class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57] max-w-[560px]">The documents are being added and will appear here soon.</p>

      <section v-if="byKind('policy').length" id="policies" class="mb-[56px] scroll-mt-[120px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Policies</p>
        <div class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <div v-for="d in byKind('policy')" :key="d.title" class="rounded-card border border-[rgba(15,33,43,.1)] p-[20px]">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[6px]">{{ d.title }}</p>
            <p v-if="d.note" class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-muted mb-[10px]">{{ d.note }}</p>
            <a :href="href(d)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water no-underline">{{ external(d) ? 'Open ↗' : 'Download PDF ↗' }}</a>
          </div>
        </div>
      </section>

      <section v-if="reportCards.length" id="reports" class="mb-[56px] scroll-mt-[120px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Reports and plans</p>
        <div class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <div v-for="c in reportCards" :key="c.title" class="rounded-card border border-[rgba(15,33,43,.1)] p-[20px]">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[12px]">{{ c.title }}</p>
            <div class="flex gap-[6px] flex-wrap">
              <a v-for="d in c.items" :key="d.title" :href="href(d)" target="_blank" rel="noopener" :title="d.title" :aria-label="d.title + (external(d) ? ' (opens another site)' : ' (PDF)')"
                class="font-mono text-[11px] text-water no-underline border border-[rgba(15,33,43,.18)] rounded-[99px] p-[3px_10px]">{{ c.items.length > 1 ? d.year : 'Open' }}{{ external(d) ? ' ↗' : '' }}</a>
            </div>
            <details v-if="c.items.some(d => d.citation)" class="mt-[12px]">
              <summary class="font-['Hanken_Grotesk'] font-medium text-[12.5px] leading-[normal] text-muted cursor-pointer">How to cite</summary>
              <p v-for="d in c.items.filter(x => x.citation)" :key="d.title" class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.5] text-muted m-[8px_0_0]">{{ d.citation }}</p>
            </details>
          </div>
        </div>
      </section>

      <section v-if="byKind('governance').length || minutesByYear.length" id="governance" class="mb-[56px] scroll-mt-[120px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Governance</p>
        <div v-if="byKind('governance').length" class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] mb-[28px]">
          <div v-for="d in byKind('governance')" :key="d.title" class="rounded-card border border-[rgba(15,33,43,.1)] p-[20px]">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[6px]">{{ d.title }}</p>
            <p v-if="d.note" class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-muted mb-[10px]">{{ d.note }}</p>
            <a :href="href(d)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water no-underline">{{ external(d) ? 'Open ↗' : 'Download PDF ↗' }}</a>
          </div>
        </div>
        <div v-if="minutesByYear.length">
          <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[12px]">Meeting minutes</p>
          <div class="border border-[rgba(15,33,43,.1)] rounded-card divide-y divide-[rgba(15,33,43,.08)] overflow-hidden">
            <div v-for="y in minutesByYear" :key="y.year" class="grid grid-cols-[1fr] gap-[8px] p-[14px_18px] sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-[16px] items-baseline bg-paper">
              <p class="font-mono font-bold text-[12px] text-muted m-0">{{ y.year }}</p>
              <div class="flex gap-x-[16px] gap-y-[6px] flex-wrap">
                <a v-for="d in y.items" :key="d.title" :href="href(d)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] font-medium text-[13.5px] leading-[1.4] text-water no-underline">{{ d.title }}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="byKind('historical').length" id="history" class="scroll-mt-[120px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Historical papers</p>
        <ul class="list-none p-0 m-0 border border-[rgba(15,33,43,.1)] rounded-card divide-y divide-[rgba(15,33,43,.08)]">
          <li v-for="d in byKind('historical')" :key="d.title" class="p-[14px_18px]">
            <a :href="href(d)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] font-medium text-[14px] leading-[1.4] text-ink no-underline">{{ d.title }} <span class="text-water">{{ external(d) ? '↗' : '' }}</span></a>
            <p class="font-mono text-[10px] text-muted m-[4px_0_0]">{{ d.year }}</p>
            <p v-if="d.citation" class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.5] text-muted m-[6px_0_0]">{{ d.citation }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
