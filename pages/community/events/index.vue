<script setup lang="ts">
useHead({
  title: 'Events',
  meta: [{ name: 'description', content: 'Upcoming and past events from CUAHSI — workshops, conferences, webinars, deadlines, and training programs across the water science community.' }]
})

// Fetch all events once, split client-side so the date threshold is always current
const { data: allEvents } = await useAsyncData('all-events-page', () =>
  queryContent('events')
    .where({ published: true })
    .sort({ start: 1 })
    .find()
)

// The time the page works from: the build's time on the server and for the first browser render (so the two match and the
// colours of the tags, which are set once, are right), then the real time once the page is open.
const renderedAt = useState('events-rendered-at', () => Date.now())
onMounted(() => { renderedAt.value = Date.now() })
const now = computed(() => new Date(renderedAt.value))

const upcoming = computed(() =>
  (allEvents.value ?? []).filter(e => new Date(e.start) >= now.value)
)
const past = computed(() =>
  (allEvents.value ?? [])
    .filter(e => new Date(e.start) < now.value)
    .reverse()
    .slice(0, 12)
)

const typeFilters = ['all', 'conference', 'workshop', 'webinar', 'deadline']
const activeFilter = ref('all')

const filteredUpcoming = computed(() =>
  activeFilter.value === 'all'
    ? upcoming.value
    : upcoming.value?.filter(e => e.type === activeFilter.value)
)
const filteredPast = computed(() =>
  activeFilter.value === 'all'
    ? past.value
    : past.value?.filter(e => e.type === activeFilter.value)
)

const typeColors: Record<string, { bg: string; text: string }> = {
  conference: { bg: '#EFF6FF', text: '#1E40AF' },
  workshop:   { bg: '#EDE9FE', text: '#5B21B6' },
  webinar:    { bg: '#DCFCE7', text: '#15803D' },
  deadline:   { bg: '#FEF9C3', text: '#854D0E' },
  default:    { bg: '#F3F4F6', text: '#5C6E78' },
}

function typeStyle(type: string) {
  const c = typeColors[type] ?? typeColors.default
  return `font-size:10px;padding:2px 8px;border-radius:99px;background:${c.bg};color:${c.text};white-space:nowrap;`
}

function fmtDate(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
  if (!end) return s.toLocaleDateString('en-US', opts)
  const e = new Date(end)
  if (s.toISOString().slice(0, 10) === e.toISOString().slice(0, 10)) return s.toLocaleDateString('en-US', opts)
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth())
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}–${e.getUTCDate()}, ${e.getUTCFullYear()}`
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
}
</script>

<template>
  <div>

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">

      <div class="p-[36px_0_24px]">
        <p class="text-[11px] text-muted mb-[8px]">Community / Events</p>
        <h1 class="text-[28px] font-medium mb-[10px]">Events</h1>
        <p class="text-[14px] text-[#6b7280] leading-[1.6] max-w-[520px] mb-[8px]">
          Workshops, conferences, webinars, and deadlines across the water science community.
          CUAHSI hosts, co-organizes, or participates in events year-round.
        </p>
        <p class="text-[12px] text-muted leading-[1.6] max-w-[520px] mb-[20px]">
          Training sessions with a scheduled date appear here. The programs are described on
          <NuxtLink to="/learn-train" class="text-water">Learn &amp; Train</NuxtLink>.
        </p>
        <div class="flex gap-[6px] flex-wrap">
          <FilterChip v-for="f in typeFilters" :key="f" variant="gray" :active="activeFilter===f" @click="activeFilter=f">
            {{ f === 'all' ? 'All types' : f }}
          </FilterChip>
        </div>
      </div>

      <!-- Upcoming -->
      <section class="mb-[48px]">
        <h2 class="text-[12px] font-medium tracking-[.06em] uppercase text-muted mb-[0] pb-[10px] border-b-[0.5px] border-b-[#f3f4f6]">Upcoming</h2>
        <div v-if="filteredUpcoming?.length">
          <NuxtLink v-for="event in filteredUpcoming" :key="event._path"
            :to="`/community/events/${event.slug}`"
            class="grid grid-cols-[1fr] min-[900px]:grid-cols-[56px_1fr_auto] gap-[16px] [align-items:start] p-[16px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
            <!-- Date block -->
            <div class="text-center bg-[#f9fafb] rounded-[8px] p-[8px_4px]">
              <p class="text-[9px] text-muted uppercase tracking-[.06em] mb-[2px]">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) }}
              </p>
              <p class="text-[20px] font-medium leading-[1] text-[#111827]">
                {{ new Date(event.start).getUTCDate() }}
              </p>
            </div>
            <!-- Details -->
            <div>
              <div class="flex items-center gap-[8px] mb-[4px] flex-wrap">
                <p class="text-[14px] font-medium leading-[1.35]">{{ event.title }}</p>
                <span :style="typeStyle(event.type)">{{ event.type }}</span>
                <span v-if="event.featured" class="text-[10px] p-[2px_8px] rounded-[99px] bg-[#FFF7ED] text-[#C2410C] border-[0.5px] border-[#FED7AA]">featured</span>
              </div>
              <p class="text-[12px] text-[#6b7280] leading-[1.5] mb-[6px] max-w-[520px]">{{ event.description }}</p>
              <div class="flex gap-[12px] flex-wrap text-[11px] text-muted">
                <span>{{ fmtDate(event.start, event.end) }}</span>
                <span v-if="event.location?.city">{{ event.location.city }}</span>
                <span v-else-if="event.location?.mode">{{ event.location.mode }}</span>
                <span v-if="event.registration?.cost === 'free'" class="text-[#15803D]">Free</span>
                <span v-if="event.registration?.required" class="text-[#1E40AF]">Registration required</span>
              </div>
            </div>
            <!-- Arrow -->
            <span class="text-[13px] text-[#d1d5db] pt-[4px]">→</span>
          </NuxtLink>
        </div>
        <p v-else class="text-[13px] text-muted p-[16px_0]">No upcoming events matching this filter.</p>
      </section>

      <!-- Past -->
      <section class="mb-[48px]">
        <h2 class="text-[12px] font-medium tracking-[.06em] uppercase text-muted mb-[0] pb-[10px] border-b-[0.5px] border-b-[#f3f4f6]">Past</h2>
        <div v-if="filteredPast?.length">
          <NuxtLink class="grid grid-cols-[1fr] min-[900px]:grid-cols-[56px_1fr_auto] gap-[16px] [align-items:start] p-[14px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit opacity-[0.65]" v-for="event in filteredPast" :key="event._path"
            :to="`/community/events/${event.slug}`">
            <div class="text-center bg-[#f9fafb] rounded-[8px] p-[8px_4px]">
              <p class="text-[9px] text-muted uppercase tracking-[.06em] mb-[2px]">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) }}
              </p>
              <p class="text-[20px] font-medium leading-[1] text-[#6b7280]">
                {{ new Date(event.start).getUTCDate() }}
              </p>
            </div>
            <div>
              <div class="flex items-center gap-[8px] mb-[3px] flex-wrap">
                <p class="text-[13px] font-medium leading-[1.35]">{{ event.title }}</p>
                <span :style="typeStyle(event.type)">{{ event.type }}</span>
              </div>
              <div class="flex gap-[12px] text-[11px] text-muted">
                <span>{{ fmtDate(event.start, event.end) }}</span>
                <span v-if="event.location?.city">{{ event.location.city }}</span>
                <span v-else-if="event.location?.mode">{{ event.location.mode }}</span>
              </div>
            </div>
            <span class="text-[13px] text-[#e5e7eb] pt-[4px]">→</span>
          </NuxtLink>
        </div>
        <p v-else class="text-[13px] text-muted p-[16px_0]">No past events matching this filter.</p>
      </section>

    </div>
  </div>
</template>
