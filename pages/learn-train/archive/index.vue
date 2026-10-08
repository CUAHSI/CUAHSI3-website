<script setup lang="ts">
useHead({
  title: 'Training & Workshop Archive',
  meta: [{ name: 'description', content: 'A comprehensive record of CUAHSI workshops and training sessions — past and upcoming.' }]
})

const { data: allEvents } = await useAsyncData('archive-events', () =>
  queryContent('events').where({ published: true }).sort({ start: -1 }).find()
)

// Scope to genuinely training/workshop-type events — distinct from Community's
// full events list, which also includes deadlines, conferences, and award nominations.
const workshops = computed(() =>
  (allEvents.value ?? []).filter(e => ['workshop', 'field'].includes(e.type))
)

const now = ref(new Date())
onMounted(() => { now.value = new Date() })

const upcoming = computed(() => workshops.value.filter(e => new Date(e.start) >= now.value))
const past = computed(() => workshops.value.filter(e => new Date(e.start) < now.value))

// Group past workshops by year for easier scanning
const pastByYear = computed(() => {
  const map: Record<string, any[]> = {}
  for (const e of past.value) {
    const y = new Date(e.start).getUTCFullYear().toString()
    if (!map[y]) map[y] = []
    map[y].push(e)
  }
  return Object.keys(map).sort((a, b) => Number(b) - Number(a)).map(y => ({ year: y, items: map[y] }))
})

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>
    <PageHero section-class="hero-section" container-class="mx-auto site-container max-w-site pt-[64px] pb-[44px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[16px_0_14px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[600px]">
      <template #before>
        <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/learn-train" class="text-muted">Learn &amp; Train</NuxtLink> / Archive</p>
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-clay">Training &amp; Workshop Archive</span>
      </template>
      <template #title>
        Every CUAHSI workshop, one place.
      </template>
      <template #lead>
        A comprehensive record of CUAHSI-run workshops and field training — past and upcoming. Looking for our three flagship structured programs instead?
        <NuxtLink to="/learn-train#programs" class="text-water">See Programs →</NuxtLink>
      </template>
      <template #below><SectionNav section="learn" /></template>
    </PageHero>

    <div class="mx-auto site-container max-w-site pt-[52px] pb-[80px]">

      <!-- Upcoming -->
      <div v-if="upcoming.length" class="mb-14">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-6 text-[11px]">Upcoming</p>
        <div class="grid grid-cols-[1fr] gap-[16px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <NuxtLink v-for="e in upcoming" :key="e.slug" :to="`/community/events/${e.slug}`"
            class="card-lift bg-white rounded-card flex flex-col border border-[rgba(15,33,43,.1)] p-[20px] no-underline">
            <p class="font-mono text-[11px] font-bold text-clay mb-[8px]">{{ fmtDate(e.start) }}</p>
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[1.3] text-navy m-[0_0_8px] flex-1">{{ e.title }}</p>
            <p v-if="e.location?.city" class="font-mono text-[10.5px] text-muted">{{ e.location.city }}</p>
            <p v-else-if="e.location?.mode === 'virtual'" class="font-mono text-[10.5px] text-muted">Virtual</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Past, grouped by year -->
      <div v-if="pastByYear.length">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-6 text-[11px]">Past workshops</p>
        <div v-for="group in pastByYear" :key="group.year" class="mb-8">
          <p class="font-['Schibsted_Grotesk'] font-bold text-[16px] leading-[normal] text-navy mb-[10px]">{{ group.year }}</p>
          <div class="flex flex-col">
            <NuxtLink v-for="e in group.items" :key="e.slug" :to="`/community/events/${e.slug}`"
              class="arrow-row flex gap-6 items-baseline p-[12px_0] border-b border-b-[rgba(15,33,43,.08)] no-underline">
              <span class="font-mono text-[11px] text-muted flex-none min-w-[90px]">{{ fmtDate(e.start) }}</span>
              <span class="font-['Hanken_Grotesk'] font-semibold text-[14.5px] text-navy flex-1 leading-[1.3] transition-colors">{{ e.title }}</span>
              <span v-if="e.location?.city" class="font-mono text-[11px] text-muted shrink min-w-0">{{ e.location.city }}</span>
              <span class="arr text-muted flex-none text-[13px]">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <p v-if="!upcoming.length && !pastByYear.length" class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[normal] text-muted p-[24px_0]">
        No workshops recorded here yet.
      </p>

      <!-- Coverage note -->
      <div class="rounded-[10px] mt-8 bg-sand p-[16px_20px]">
        <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.6] text-muted m-0">
          This archive reflects workshops tracked in our current content system and will grow more complete over time.
          For our long-running structured programs — the Virtual University, Snow Field School, and Summer Institute — see
          <NuxtLink to="/learn-train#programs" class="text-water">Programs</NuxtLink>, which covers their full history and track record.
        </p>
      </div>
    </div>
  </div>
</template>
