<script setup lang="ts">
useHead({
  title: 'Impact · About · CUAHSI',
  meta: [{ name: 'description', content: 'What the CUAHSI community is building, measuring, and discovering.' }]
})

const { useCategoryColor } = await import('~/composables/useCategoryColor')

const { data: allHighlights } = await useAsyncData('highlights', () =>
  queryContent('research').where({ published: true }).sort({ date: -1 }).find()
)

const catDefs = [
  { key: 'all',                label: 'All',                color: '#15212B' },
  { key: 'research',           label: 'Research',           color: 'oklch(0.55 0.13 245)' },
  { key: 'cyberinfrastructure',label: 'Cyberinfrastructure',color: 'oklch(0.56 0.12 200)' },
  { key: 'data-infrastructure',label: 'Data infrastructure',color: 'oklch(0.52 0.13 290)' },
  { key: 'training',           label: 'Training & programs', color: 'oklch(0.55 0.12 150)' },
  { key: 'community',          label: 'Community',           color: 'oklch(0.61 0.13 55)' },
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
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 52px;"
      title-style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;max-width:720px;"
      lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about" style="color:#5C6E78;">About</NuxtLink> / Impact</p></template>
      <template #kicker>Impact</template>
      <template #title>What the community is building, measuring, and discovering.</template>
      <template #lead>Selected outcomes from CUAHSI programs — spanning research advances, infrastructure development, training impact, and community engagement.</template>
      <template #below>
        <!-- About sub-nav -->
        <div class="mx-auto" style="max-width:1240px;padding:0 40px;">
          <div class="flex gap-0" style="border-top:1px solid rgba(15,33,43,.08);overflow-x:auto;">
            <a v-for="l in [{t:'Overview',h:'/about'},{t:'Mission & values',h:'/about#mission'},{t:'What we do',h:'/about#what-we-do'},{t:'History',h:'/about#history'},{t:'Our team',h:'/about/team'},{t:'Governance',h:'/about/governance'},{t:'Membership',h:'/about/membership'},{t:'Impact',h:'/about/impact'},{t:'Contact',h:'/about#contact'}]"
              :key="l.h" :href="l.h" style="font:500 13px 'Hanken Grotesk';color:#5C6E78;padding:14px 16px 14px 0;text-decoration:none;white-space:nowrap;"
              class="hover:text-navy transition-colors">
              {{ l.t }}
            </a>
          </div>
        </div>
      </template>
    </PageHero>

    <!-- Stats band -->
    <StatsBand />

    <!-- Filter bar -->
    <div class="mx-auto" style="max-width:1240px;padding:36px 40px 0;">
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
    <div class="mx-auto rgrid rgrid-multi" style="max-width:1240px;padding:0 40px 80px;display:grid;gap:20px;--cols:repeat(3,1fr);">
      <NuxtLink v-for="h in filtered" :key="h.slug" :to="`/about/impact/${h.slug}`"
        class="card-lift bg-white rounded-card overflow-hidden flex flex-col"
        :style="`border:1px solid rgba(15,33,43,.1);border-top:3px solid ${colorOf(h.category)};text-decoration:none;`">
        <!-- Photo placeholder -->
        <div class="relative" style="height:180px;background:repeating-linear-gradient(135deg,#e7eef3 0 14px,#dfe8ee 14px 28px);">
          <span class="absolute font-mono font-bold tracking-[.08em] text-white rounded-[6px]" :style="`left:14px;top:14px;font-size:10px;background:${colorOf(h.category)};padding:5px 10px;`">
            {{ useCategoryColor(h.category).label.toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-col flex-1" style="padding:20px;">
          <div class="font-mono text-[11px] tracking-[.05em] text-muted mb-2">{{ fmtDate(h.date) }}</div>
          <h3 style="font:700 18px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;flex:1;letter-spacing:-.008em;">{{ h.title }}</h3>
          <p style="font:400 13.5px/1.55 'Hanken Grotesk';color:#5C6E78;margin:0 0 16px;" class="line-clamp-3">{{ h.excerpt }}</p>
          <span class="arrow-row inline-flex items-center gap-2" style="font:600 13.5px 'Hanken Grotesk';color:#1F6FB2;">Read highlight <span class="arr">→</span></span>
        </div>
      </NuxtLink>
      <p v-if="!filtered.length" class="text-muted col-span-3 py-8 text-center" style="font:400 14px 'Hanken Grotesk';">No highlights match this filter.</p>
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
