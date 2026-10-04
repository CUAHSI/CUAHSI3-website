<script setup lang="ts">
useHead({
  title: 'Events · CUAHSI',
  meta: [{ name: 'description', content: 'Upcoming and past events from CUAHSI — workshops, conferences, webinars, deadlines, and training programs across the water science community.' }]
})

// Fetch all events once, split client-side so the date threshold is always current
const { data: allEvents } = await useAsyncData('all-events-page', () =>
  queryContent('events')
    .where({ published: true })
    .sort({ start: 1 })
    .find()
)

const upcoming = computed(() =>
  (allEvents.value ?? []).filter(e => new Date(e.start) >= new Date())
)
const past = computed(() =>
  (allEvents.value ?? [])
    .filter(e => new Date(e.start) < new Date())
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
  default:    { bg: '#F3F4F6', text: '#6B7280' },
}

function typeStyle(type: string) {
  const c = typeColors[type] ?? typeColors.default
  return `font-size:10px;padding:2px 8px;border-radius:99px;background:${c.bg};color:${c.text};white-space:nowrap;`
}

function fmtDate(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  if (!end) return s.toLocaleDateString('en-US', opts)
  const e = new Date(end)
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${e.getDate()}, ${e.getFullYear()}`
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}
</script>

<template>
  <div>

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">

      <div style="padding:36px 0 24px;">
        <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">Community / Events</p>
        <h1 style="font-size:28px;font-weight:500;margin-bottom:10px;">Events</h1>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;max-width:520px;margin-bottom:8px;">
          Workshops, conferences, webinars, and deadlines across the water science community.
          CUAHSI hosts, co-organizes, or participates in events year-round.
        </p>
        <p style="font-size:12px;color:#9ca3af;line-height:1.6;max-width:520px;margin-bottom:20px;">
          Training sessions with a scheduled date appear here alongside their full description on
          <NuxtLink to="/learn-train" style="color:#1F6FB2;">Learn &amp; Train</NuxtLink> — same session, one canonical page.
        </p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <FilterChip v-for="f in typeFilters" :key="f" variant="gray" :active="activeFilter===f" @click="activeFilter=f">
            {{ f === 'all' ? 'All types' : f }}
          </FilterChip>
        </div>
      </div>

      <!-- Upcoming -->
      <section style="margin-bottom:48px;">
        <h2 style="font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:0;padding-bottom:10px;border-bottom:0.5px solid #f3f4f6;">Upcoming</h2>
        <div v-if="filteredUpcoming?.length">
          <NuxtLink v-for="event in filteredUpcoming" :key="event._path"
            :to="`/community/events/${event.slug}`"
            style="display:grid;gap:16px;align-items:start;padding:16px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
            <!-- Date block -->
            <div style="text-align:center;background:#f9fafb;border-radius:8px;padding:8px 4px;">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short' }) }}
              </p>
              <p style="font-size:20px;font-weight:500;line-height:1;color:#111827;">
                {{ new Date(event.start).getDate() }}
              </p>
            </div>
            <!-- Details -->
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                <p style="font-size:14px;font-weight:500;line-height:1.35;">{{ event.title }}</p>
                <span :style="typeStyle(event.type)">{{ event.type }}</span>
                <span v-if="event.featured" style="font-size:10px;padding:2px 8px;border-radius:99px;background:#FFF7ED;color:#C2410C;border:0.5px solid #FED7AA;">featured</span>
              </div>
              <p style="font-size:12px;color:#6b7280;line-height:1.5;margin-bottom:6px;max-width:520px;">{{ event.description }}</p>
              <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:#9ca3af;">
                <span>{{ fmtDate(event.start, event.end) }}</span>
                <span v-if="event.location?.city">{{ event.location.city }}</span>
                <span v-else-if="event.location?.mode">{{ event.location.mode }}</span>
                <span v-if="event.registration?.cost === 'free'" style="color:#15803D;">Free</span>
                <span v-if="event.registration?.required" style="color:#1E40AF;">Registration required</span>
              </div>
            </div>
            <!-- Arrow -->
            <span style="font-size:13px;color:#d1d5db;padding-top:4px;">→</span>
          </NuxtLink>
        </div>
        <p v-else style="font-size:13px;color:#9ca3af;padding:16px 0;">No upcoming events matching this filter.</p>
      </section>

      <!-- Past -->
      <section style="margin-bottom:48px;">
        <h2 style="font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:0;padding-bottom:10px;border-bottom:0.5px solid #f3f4f6;">Past</h2>
        <div v-if="filteredPast?.length">
          <NuxtLink class="rgrid rgrid-split" v-for="event in filteredPast" :key="event._path"
            :to="`/community/events/${event.slug}`"
            style="display:grid;gap:16px;align-items:start;padding:14px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;opacity:0.65;--cols:56px 1fr auto;">
            <div style="text-align:center;background:#f9fafb;border-radius:8px;padding:8px 4px;">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short' }) }}
              </p>
              <p style="font-size:20px;font-weight:500;line-height:1;color:#6b7280;">
                {{ new Date(event.start).getDate() }}
              </p>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;">
                <p style="font-size:13px;font-weight:500;line-height:1.35;">{{ event.title }}</p>
                <span :style="typeStyle(event.type)">{{ event.type }}</span>
              </div>
              <div style="display:flex;gap:12px;font-size:11px;color:#9ca3af;">
                <span>{{ fmtDate(event.start, event.end) }}</span>
                <span v-if="event.location?.city">{{ event.location.city }}</span>
                <span v-else-if="event.location?.mode">{{ event.location.mode }}</span>
              </div>
            </div>
            <span style="font-size:13px;color:#e5e7eb;padding-top:4px;">→</span>
          </NuxtLink>
        </div>
        <p v-else style="font-size:13px;color:#9ca3af;padding:16px 0;">No past events matching this filter.</p>
      </section>

    </div>
  </div>
</template>
