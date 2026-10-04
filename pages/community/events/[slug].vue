<script setup lang="ts">
const route = useRoute()

const { data: event } = await useAsyncData(`event-${route.params.slug}`, () =>
  queryContent('events').where({ slug: route.params.slug, published: true }).findOne().catch(() => null)
)

if (!event.value) throw createError({ statusCode: 404, message: 'Event not found' })

useHead({
  title: `${event.value.title} · Events`,
  meta: [{ name: 'description', content: event.value.description }]
})

// Adjacent events (upcoming sorted chronologically)
const { data: allEvents } = await useAsyncData('all-events-nav', () =>
  queryContent('events').where({ published: true }).sort({ start: 1 }).find()
)
const idx = computed(() => allEvents.value?.findIndex(e => e.slug === route.params.slug) ?? -1)
const prevEvent = computed(() => allEvents.value?.[idx.value - 1] ?? null)
const nextEvent = computed(() => allEvents.value?.[idx.value + 1] ?? null)

// Newsletters that mentioned this event
const { data: relatedNewsletters } = await useAsyncData(`event-newsletters-${route.params.slug}`, () =>
  queryContent('newsletter')
    .where({ published: true, programs_mentioned: { $contains: route.params.slug as string } })
    .sort({ date: -1 })
    .find()
)

const isPast = computed(() => event.value ? new Date(event.value.start) < new Date() : false)

const typeColors: Record<string, { bg: string; text: string }> = {
  conference: { bg: '#EFF6FF', text: '#1E40AF' },
  workshop:   { bg: '#EDE9FE', text: '#5B21B6' },
  webinar:    { bg: '#DCFCE7', text: '#15803D' },
  deadline:   { bg: '#FEF9C3', text: '#854D0E' },
  default:    { bg: '#F3F4F6', text: '#6B7280' },
}
function typeStyle(type: string) {
  const c = typeColors[type] ?? typeColors.default
  return `font-size:11px;padding:3px 10px;border-radius:99px;background:${c.bg};color:${c.text};font-weight:500;`
}

function fmtDate(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  if (!end) return s.toLocaleDateString('en-US', opts)
  const e = new Date(end)
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
    return `${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}–${e.getDate()}, ${e.getFullYear()}`
  return `${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">
      <div class="rgrid rgrid-split" style="display:grid;gap:48px;padding:36px 0 48px;--cols:minmax(0,1fr) 220px;">

        <!-- Main -->
        <article>
          <NuxtLink to="/community/events" style="font-size:12px;color:#9ca3af;text-decoration:none;display:block;margin-bottom:16px;">← All events</NuxtLink>

          <!-- Past banner -->
          <div v-if="isPast" style="background:#f9fafb;border:0.5px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#6b7280;">
            This event has already taken place.
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <span :style="typeStyle(event.type)">{{ event.type }}</span>
            <span v-if="event.featured" style="font-size:11px;padding:3px 10px;border-radius:99px;background:#FFF7ED;color:#C2410C;border:0.5px solid #FED7AA;font-weight:500;">Featured</span>
          </div>

          <h1 style="font-size:26px;font-weight:500;margin-bottom:16px;line-height:1.25;">{{ event.title }}</h1>

          <!-- Key details strip -->
          <div class="rgrid rgrid-split" style="display:grid;gap:12px;margin-bottom:28px;padding:16px;background:#f9fafb;border-radius:12px;--cols:repeat(auto-fit,minmax(140px,1fr));">
            <div>
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:3px;">Date</p>
              <p style="font-size:13px;font-weight:500;">{{ fmtDate(event.start, event.end) }}</p>
            </div>
            <div v-if="event.location?.city || event.location?.mode">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:3px;">Location</p>
              <p style="font-size:13px;font-weight:500;">
                {{ event.location.city ?? (event.location.mode === 'virtual' ? 'Virtual' : event.location.mode) }}
              </p>
            </div>
            <div v-if="event.registration">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:3px;">Cost</p>
              <p style="font-size:13px;font-weight:500;text-transform:capitalize;">{{ event.registration.cost ?? 'See details' }}</p>
            </div>
            <div v-if="event.timezone">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:3px;">Timezone</p>
              <p style="font-size:13px;font-weight:500;">{{ event.timezone.replace('America/', '').replace('_', ' ') }}</p>
            </div>
          </div>

          <!-- Description -->
          <div style="font-size:14px;color:#374151;line-height:1.75;margin-bottom:28px;">
            <p>{{ event.description }}</p>
          </div>

          <!-- Audience -->
          <div v-if="event.audience?.length" style="margin-bottom:24px;">
            <p style="font-size:12px;font-weight:500;margin-bottom:8px;">Who should attend</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span v-for="a in event.audience" :key="a"
                style="font-size:12px;padding:3px 10px;border-radius:99px;border:0.5px solid #e5e7eb;color:#6b7280;">
                {{ a }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="event.tags?.length" style="margin-bottom:28px;">
            <p style="font-size:12px;font-weight:500;margin-bottom:8px;">Tags</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span v-for="t in event.tags" :key="t"
                style="font-size:11px;padding:2px 8px;border-radius:99px;background:#f3f4f6;color:#6b7280;">
                {{ t }}
              </span>
            </div>
          </div>

          <!-- Register CTA -->
          <div v-if="event.registration?.url && !isPast"
            style="padding:20px;background:#f0fdf4;border-radius:12px;border:0.5px solid #bbf7d0;margin-bottom:32px;">
            <p style="font-size:14px;font-weight:500;margin-bottom:4px;">Registration is open</p>
            <p style="font-size:13px;color:#6b7280;margin-bottom:12px;">
              {{ event.registration.cost === 'free' ? 'This event is free to attend.' : 'See the registration page for pricing details.' }}
            </p>
            <a :href="event.registration.url" target="_blank" rel="noopener"
              style="display:inline-block;font-size:13px;font-weight:500;padding:9px 20px;background:#111827;color:white;border-radius:8px;text-decoration:none;">
              Register →
            </a>
          </div>

          <!-- Prev/next -->
          <div style="display:flex;justify-content:space-between;padding-top:24px;border-top:0.5px solid #f3f4f6;">
            <NuxtLink v-if="prevEvent" :to="`/community/events/${prevEvent.slug}`"
              style="font-size:12px;color:#6b7280;text-decoration:none;max-width:200px;">
              ← {{ prevEvent.title }}
            </NuxtLink>
            <span v-else></span>
            <NuxtLink v-if="nextEvent" :to="`/community/events/${nextEvent.slug}`"
              style="font-size:12px;color:#6b7280;text-decoration:none;max-width:200px;text-align:right;">
              {{ nextEvent.title }} →
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside style="padding-top:68px;">

          <!-- Quick facts -->
          <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:12px;">Quick facts</p>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div>
                <p style="font-size:11px;color:#9ca3af;margin-bottom:1px;">Type</p>
                <p style="font-size:12px;font-weight:500;text-transform:capitalize;">{{ event.type }}</p>
              </div>
              <div>
                <p style="font-size:11px;color:#9ca3af;margin-bottom:1px;">Date</p>
                <p style="font-size:12px;font-weight:500;">{{ fmtDate(event.start, event.end) }}</p>
              </div>
              <div v-if="event.location">
                <p style="font-size:11px;color:#9ca3af;margin-bottom:1px;">Format</p>
                <p style="font-size:12px;font-weight:500;text-transform:capitalize;">{{ event.location.mode }}</p>
              </div>
              <div v-if="event.location?.city">
                <p style="font-size:11px;color:#9ca3af;margin-bottom:1px;">City</p>
                <p style="font-size:12px;font-weight:500;">{{ event.location.city }}</p>
              </div>
            </div>
          </div>

          <!-- Mentioned in newsletters -->
          <div v-if="event.newsletter_source?.length" style="margin-bottom:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">In the newsletter</p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <NuxtLink v-for="slug in event.newsletter_source" :key="slug"
                :to="`/community/newsletter/${slug}`"
                style="font-size:12px;color:#6b7280;text-decoration:none;display:flex;align-items:center;gap:4px;">
                <span style="width:5px;height:5px;border-radius:50%;background:#1D9E75;flex-shrink:0;"></span>
                {{ slug.replace('-', ' ').replace(/(\d{4})\s(\w+)/, '$2 $1') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Audience -->
          <div v-if="event.audience?.length" style="margin-bottom:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">Audience</p>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <span v-for="a in event.audience" :key="a" style="font-size:12px;color:#6b7280;text-transform:capitalize;">{{ a }}</span>
            </div>
          </div>

          <!-- Nearby events -->
          <div v-if="prevEvent || nextEvent" style="margin-bottom:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">Other events</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <NuxtLink v-if="prevEvent" :to="`/community/events/${prevEvent.slug}`"
                style="text-decoration:none;">
                <p style="font-size:12px;color:#6b7280;line-height:1.35;">← {{ prevEvent.title }}</p>
                <p style="font-size:11px;color:#9ca3af;">{{ fmtShort(prevEvent.start) }}</p>
              </NuxtLink>
              <NuxtLink v-if="nextEvent" :to="`/community/events/${nextEvent.slug}`"
                style="text-decoration:none;">
                <p style="font-size:12px;color:#6b7280;line-height:1.35;">{{ nextEvent.title }} →</p>
                <p style="font-size:11px;color:#9ca3af;">{{ fmtShort(nextEvent.start) }}</p>
              </NuxtLink>
            </div>
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>
