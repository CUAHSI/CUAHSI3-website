<script setup lang="ts">
useHead({ title: 'Cyberseminars' })
const { data: seminars } = await useAsyncData('cyberseminars', () =>
  queryContent('cyberseminars').where({ published: true }).sort({ date: -1 }).find()
)
const series = computed(() => [...new Set((seminars.value ?? []).map(s => s.series).filter(Boolean))])
const tags   = computed(() => [...new Set((seminars.value ?? []).flatMap(s => s.tags ?? []))])

const selectedSeries = ref('all')
const selectedTag    = ref('all')
const expanded       = ref<string|null>(null)

const filtered = computed(() => {
  let items = seminars.value ?? []
  if (selectedSeries.value !== 'all') items = items.filter(s => s.series === selectedSeries.value)
  if (selectedTag.value   !== 'all') items = items.filter(s => s.tags?.includes(selectedTag.value))
  return items
})

function toggle(slug: string) { expanded.value = expanded.value === slug ? null : slug }

// Changing a filter closes the open card. Otherwise a card hidden by the filter stays 'expanded', and when the filter is
// cleared it comes back open and its video starts playing on its own.
watch([selectedSeries, selectedTag], () => { expanded.value = null })
</script>
<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_48px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[560px]">
      <template #kicker>Learn &amp; Train · Cyberseminars</template>
      <template #title>350+ free recordings on water science.</template>
      <template #lead>Virtual presentations, panels, and demos from leading water scientists — all free, all archived, many with full transcripts.</template>
      <template #below><SectionNav section="learn" fixed /></template>
    </PageHero>

    <!-- Filters -->
    <div class="mx-auto max-w-site p-[28px_40px_0]">
      <div class="flex gap-6 flex-wrap">
        <div>
          <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-2 text-[10px]">Series</p>
          <div class="flex gap-[6px] flex-wrap">
            <FilterChip variant="navy" :active="selectedSeries==='all'" @click="selectedSeries='all'">All</FilterChip>
            <FilterChip v-for="s in series" :key="s" variant="navy" :active="selectedSeries===s" @click="selectedSeries=s">{{ s }}</FilterChip>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="mx-auto max-w-site p-[24px_40px_80px] grid grid-cols-[1fr] gap-[18px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
      <CyberseminarCard v-for="s in filtered" :key="s.slug" :seminar="s" :expanded="expanded === s.slug" @toggle="toggle(s.slug)" />
    </div>
  </div>
</template>
