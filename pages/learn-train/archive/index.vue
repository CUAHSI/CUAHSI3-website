<script setup lang="ts">
useHead({
  title: 'Training & Workshop Archive · CUAHSI',
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
    const y = new Date(e.start).getFullYear().toString()
    if (!map[y]) map[y] = []
    map[y].push(e)
  }
  return Object.keys(map).sort((a, b) => Number(b) - Number(a)).map(y => ({ year: y, items: map[y] }))
})

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <PageHero section-class="hero-section" container-class="mx-auto site-container" container-style="max-width:1240px;padding-top:64px;padding-bottom:44px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:16px 0 14px;max-width:700px;"
      lead-style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:600px;">
      <template #before>
        <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/learn-train" style="color:#5C6E78;">Learn &amp; Train</NuxtLink> / Archive</p>
        <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#C0603C;">Training &amp; Workshop Archive</span>
      </template>
      <template #title>
        Every CUAHSI workshop, one place.
      </template>
      <template #lead>
        A comprehensive record of CUAHSI-run workshops and field training — past and upcoming. Looking for our three flagship structured programs instead?
        <NuxtLink to="/learn-train#programs" style="color:#1F6FB2;">See Programs →</NuxtLink>
      </template>
    </PageHero>

    <div class="mx-auto site-container" style="max-width:1240px;padding-top:52px;padding-bottom:80px;">

      <!-- Upcoming -->
      <div v-if="upcoming.length" class="mb-14">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-6" style="font-size:11px;">Upcoming</p>
        <div class="rgrid rgrid-multi" style="display:grid;gap:16px;--cols:repeat(3,1fr);">
          <NuxtLink v-for="e in upcoming" :key="e.slug" :to="`/community/events/${e.slug}`"
            class="card-lift bg-white rounded-card flex flex-col"
            style="border:1px solid rgba(15,33,43,.1);padding:20px;text-decoration:none;">
            <p class="font-mono text-[11px] font-bold" style="color:#C0603C;margin-bottom:8px;">{{ fmtDate(e.start) }}</p>
            <p style="font:700 15px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 8px;flex:1;">{{ e.title }}</p>
            <p v-if="e.location?.city" class="font-mono text-[10.5px] text-muted">{{ e.location.city }}</p>
            <p v-else-if="e.location?.mode === 'virtual'" class="font-mono text-[10.5px] text-muted">Virtual</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Past, grouped by year -->
      <div v-if="pastByYear.length">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-6" style="font-size:11px;">Past workshops</p>
        <div v-for="group in pastByYear" :key="group.year" class="mb-8">
          <p style="font:700 16px 'Schibsted Grotesk';color:#0F2E44;margin-bottom:10px;">{{ group.year }}</p>
          <div class="flex flex-col">
            <NuxtLink v-for="e in group.items" :key="e.slug" :to="`/community/events/${e.slug}`"
              class="arrow-row flex gap-6 items-baseline"
              style="padding:12px 0;border-bottom:1px solid rgba(15,33,43,.08);text-decoration:none;">
              <span class="font-mono text-[11px] text-muted flex-none" style="min-width:90px;">{{ fmtDate(e.start) }}</span>
              <span style="font:600 14.5px 'Hanken Grotesk';color:#0F2E44;flex:1;line-height:1.3;" class="hover:text-water transition-colors">{{ e.title }}</span>
              <span v-if="e.location?.city" class="font-mono text-[11px] text-muted flex-none">{{ e.location.city }}</span>
              <span class="arr text-muted flex-none" style="font-size:13px;">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <p v-if="!upcoming.length && !pastByYear.length" style="font:400 14px 'Hanken Grotesk';color:#5C6E78;padding:24px 0;">
        No workshops recorded here yet.
      </p>

      <!-- Coverage note -->
      <div class="rounded-[10px] mt-8" style="background:#F3EEE4;padding:16px 20px;">
        <p style="font:400 12.5px/1.6 'Hanken Grotesk';color:#5C6E78;margin:0;">
          This archive reflects workshops tracked in our current content system and will grow more complete over time.
          For our long-running structured programs — the Virtual University, Snow Field School, and Summer Institute — see
          <NuxtLink to="/learn-train#programs" style="color:#1F6FB2;">Programs</NuxtLink>, which covers their full history and track record.
        </p>
      </div>
    </div>
  </div>
</template>
