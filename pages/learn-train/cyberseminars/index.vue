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
</script>
<template>
  <div>
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 48px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:14px 0 14px;"
      lead-style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">
      <template #kicker>Learn &amp; Train · Cyberseminars</template>
      <template #title>350+ free recordings on water science.</template>
      <template #lead>Virtual presentations, panels, and demos from leading water scientists — all free, all archived, many with full transcripts.</template>
    </PageHero>

    <!-- Filters -->
    <div class="mx-auto" style="max-width:1240px;padding:28px 40px 0;">
      <div class="flex gap-6 flex-wrap">
        <div>
          <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-2" style="font-size:10px;">Series</p>
          <div class="flex gap-[6px] flex-wrap">
            <FilterChip variant="navy" :active="selectedSeries==='all'" @click="selectedSeries='all'">All</FilterChip>
            <FilterChip v-for="s in series" :key="s" variant="navy" :active="selectedSeries===s" @click="selectedSeries=s">{{ s }}</FilterChip>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="mx-auto rgrid rgrid-multi" style="max-width:1240px;padding:24px 40px 80px;display:grid;gap:18px;--cols:repeat(3,1fr);">
      <CyberseminarCard v-for="s in filtered" :key="s.slug" :seminar="s" :expanded="expanded === s.slug" @toggle="toggle(s.slug)" />
    </div>
  </div>
</template>
