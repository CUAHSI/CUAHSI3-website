<script setup lang="ts">
useHead({ title: 'Cyberseminars · CUAHSI' })
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
    <section style="background:linear-gradient(180deg,#FBFAF7,#F3EEE4);border-bottom:1px solid rgba(15,33,43,.08);">
      <div class="mx-auto" style="max-width:1240px;padding:64px 40px 48px;">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Learn &amp; Train · Cyberseminars</span>
        <h1 style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:14px 0 14px;">350+ free recordings on water science.</h1>
        <p style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">Virtual presentations, panels, and demos from leading water scientists — all free, all archived, many with full transcripts.</p>
      </div>
    </section>

    <!-- Filters -->
    <div class="mx-auto" style="max-width:1240px;padding:28px 40px 0;">
      <div class="flex gap-6 flex-wrap">
        <div>
          <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-2" style="font-size:10px;">Series</p>
          <div class="flex gap-[6px] flex-wrap">
            <button @click="selectedSeries='all'" :style="`font:600 12.5px 'Hanken Grotesk';padding:6px 13px;border-radius:22px;border:1px solid ${selectedSeries==='all'?'#0F2E44':'rgba(15,33,43,.18)'};background:${selectedSeries==='all'?'#0F2E44':'transparent'};color:${selectedSeries==='all'?'#fff':'#3a4d57'};cursor:pointer;`">All</button>
            <button v-for="s in series" :key="s" @click="selectedSeries=s" :style="`font:600 12.5px 'Hanken Grotesk';padding:6px 13px;border-radius:22px;border:1px solid ${selectedSeries===s?'#0F2E44':'rgba(15,33,43,.18)'};background:${selectedSeries===s?'#0F2E44':'transparent'};color:${selectedSeries===s?'#fff':'#3a4d57'};cursor:pointer;`">{{ s }}</button>
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
