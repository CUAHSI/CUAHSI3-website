<script setup lang="ts">
useHead({
  title: 'Impact · About',
  meta: [{ name: 'description', content: 'What the CUAHSI community is building, measuring, and discovering.' }]
})

const { useCategoryColor } = await import('~/composables/useCategoryColor')

const { data: allHighlights } = await useAsyncData('highlights', () =>
  queryContent('research').where({ published: true }).sort({ date: -1 }).find()
)

const catDefs = [
  { key: 'all',                label: 'All',                color: '#15212B' },
  { key: 'research',           label: 'Research',           color: 'oklch(0.55 0.13 245)' },
  { key: 'cyberinfrastructure',label: 'Cyberinfrastructure',color: 'oklch(0.53 0.12 200)' },
  { key: 'data-infrastructure',label: 'Data infrastructure',color: 'oklch(0.52 0.13 290)' },
  { key: 'training',           label: 'Training & programs', color: 'oklch(0.54 0.12 150)' },
  { key: 'community',          label: 'Community',           color: 'oklch(0.56 0.13 55)' },
]

const selectedCat  = ref('all')
const selectedYear = ref('all')

const years = computed(() => {
  const ys = [...new Set((allHighlights.value ?? []).map(h => String(h.year)))]
  return ys.sort((a, b) => Number(b) - Number(a))
})

const filtered = computed(() => {
  let items = allHighlights.value ?? []
  if (selectedCat.value !== 'all')  items = items.filter(h => h.category === selectedCat.value)
  if (selectedYear.value !== 'all') items = items.filter(h => String(h.year) === selectedYear.value)
  return items
})

function colorOf(key: string) { return (catDefs.find(c => c.key === key) || catDefs[0]).color }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }

</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[720px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[560px]">
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about" class="text-muted">About</NuxtLink> / Impact</p></template>
      <template #kicker>Impact</template>
      <template #title>What the community is building, measuring, and discovering.</template>
      <template #lead>Selected outcomes from CUAHSI programs — spanning research advances, infrastructure development, training impact, and community engagement.</template>
      <template #below><SectionNav section="about" fixed /></template>
    </PageHero>

    <!-- Stats band -->
    <StatsBand />

    <!-- Filter bar -->
    <div class="mx-auto max-w-site p-[36px_40px_0]">
      <div class="flex gap-6 flex-wrap items-start justify-between">
        <div class="flex gap-[6px] flex-wrap">
          <FilterChip v-for="c in catDefs" :key="c.key" variant="category" :color="c.color"
            :active="selectedCat === c.key"
            @click="selectedCat = c.key">
            {{ c.label }}
          </FilterChip>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Year</span>
          <FilterChip variant="year" :active="selectedYear === 'all'" @click="selectedYear = 'all'">All</FilterChip>
          <FilterChip v-for="y in years" :key="y" variant="year" :active="selectedYear === y" @click="selectedYear = y">{{ y }}</FilterChip>
        </div>
      </div>
      <div class="font-mono text-[11px] tracking-[.06em] text-muted mt-4 mb-6">
        SHOWING {{ filtered.length }} OF {{ allHighlights?.length ?? 0 }} HIGHLIGHTS
      </div>
    </div>

    <!-- Card grid -->
    <div class="mx-auto max-w-site p-[0_40px_80px] grid grid-cols-[1fr] gap-[20px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
      <NuxtLink v-for="h in filtered" :key="h.slug" :to="`/about/impact/${h.slug}`"
        class="card-lift bg-white rounded-card overflow-hidden flex flex-col"
        :style="`border:1px solid rgba(15,33,43,.1);border-top:3px solid ${colorOf(h.category)};text-decoration:none;`">
        <!-- Photo placeholder -->
        <div class="relative h-[180px] bg-[repeating-linear-gradient(135deg,#e7eef3_0_14px,#dfe8ee_14px_28px)]">
          <span class="absolute font-mono font-bold tracking-[.08em] text-white rounded-[6px]" :style="`left:14px;top:14px;font-size:10px;background:${colorOf(h.category)};padding:5px 10px;`">
            {{ useCategoryColor(h.category).label.toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-col flex-1 p-[20px]">
          <div class="font-mono text-[11px] tracking-[.05em] text-muted mb-2">{{ fmtDate(h.date) }}</div>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[18px] leading-[1.3] text-navy m-[0_0_10px] flex-1 tracking-[-.008em]">{{ h.title }}</h2>
          <p class="line-clamp-3 font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.55] text-muted m-[0_0_16px]">{{ h.excerpt }}</p>
          <span class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">Read highlight <span class="arr">→</span></span>
        </div>
      </NuxtLink>
      <p v-if="!filtered.length" class="text-muted col-span-3 py-8 text-center font-['Hanken_Grotesk'] font-normal text-[14px] leading-[normal]">No highlights match this filter.</p>
    </div>
  </div>
</template>

<style>
.card-lift { transition: transform .18s ease, box-shadow .18s ease; }
.card-lift:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(15,46,68,.35); }
.arrow-row:hover .arr { transform: translateX(5px); }
.arr { transition: transform .18s ease; display: inline-block; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
