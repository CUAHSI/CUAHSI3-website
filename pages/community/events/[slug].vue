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

// build time for the first render (it matches the server's), the real time once the page is open
const renderedAt = useState('event-rendered-at', () => Date.now())
onMounted(() => { renderedAt.value = Date.now() })
const isPast = computed(() => event.value ? new Date(event.value.start) < new Date(renderedAt.value) : false)

const typeColors: Record<string, { bg: string; text: string }> = {
  conference: { bg: '#EFF6FF', text: '#1E40AF' },
  workshop:   { bg: '#EDE9FE', text: '#5B21B6' },
  webinar:    { bg: '#DCFCE7', text: '#15803D' },
  deadline:   { bg: '#FEF9C3', text: '#854D0E' },
  default:    { bg: '#F3F4F6', text: '#5C6E78' },
}
function typeStyle(type: string) {
  const c = typeColors[type] ?? typeColors.default
  return `font-size:11px;padding:3px 10px;border-radius:99px;background:${c.bg};color:${c.text};font-weight:500;`
}

function fmtDate(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
  if (!end) return s.toLocaleDateString('en-US', opts)
  const e = new Date(end)
  if (s.toISOString().slice(0, 10) === e.toISOString().slice(0, 10)) return s.toLocaleDateString('en-US', opts)
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth())
    return `${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}–${e.getUTCDate()}, ${e.getUTCFullYear()}`
  return `${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} – ${e.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">
      <div class="grid gap-[48px] p-[36px_0_48px] grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_220px]">

        <!-- Main -->
        <article>
          <NuxtLink to="/community/events" class="text-[12px] text-muted no-underline block mb-[16px]">← All events</NuxtLink>

          <!-- Past banner -->
          <div v-if="isPast" class="bg-[#f9fafb] border-[0.5px] border-[#e5e7eb] rounded-[8px] p-[10px_14px] mb-[20px] text-[12px] text-[#6b7280]">
            This event has already taken place.
          </div>

          <div class="flex items-center gap-[8px] mb-[10px] flex-wrap">
            <span :style="typeStyle(event.type)">{{ event.type }}</span>
            <span v-if="event.featured" class="text-[11px] p-[3px_10px] rounded-[99px] bg-[#FFF7ED] text-[#C2410C] border-[0.5px] border-[#FED7AA] font-medium">Featured</span>
          </div>

          <h1 class="text-[26px] font-medium mb-[16px] leading-[1.25]">{{ event.title }}</h1>

          <!-- Key details strip -->
          <div class="grid gap-[12px] mb-[28px] p-[16px] bg-[#f9fafb] rounded-[12px] grid-cols-[1fr] min-[900px]:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
            <div>
              <p class="text-[10px] uppercase tracking-[.06em] text-muted mb-[3px]">Date</p>
              <p class="text-[13px] font-medium">{{ fmtDate(event.start, event.end) }}</p>
            </div>
            <div v-if="event.location?.city || event.location?.mode">
              <p class="text-[10px] uppercase tracking-[.06em] text-muted mb-[3px]">Location</p>
              <p class="text-[13px] font-medium">
                {{ event.location.city ?? (event.location.mode === 'virtual' ? 'Virtual' : event.location.mode) }}
              </p>
            </div>
            <div v-if="event.registration">
              <p class="text-[10px] uppercase tracking-[.06em] text-muted mb-[3px]">Cost</p>
              <p class="text-[13px] font-medium capitalize">{{ event.registration.cost ?? 'See details' }}</p>
            </div>
            <div v-if="event.timezone">
              <p class="text-[10px] uppercase tracking-[.06em] text-muted mb-[3px]">Timezone</p>
              <p class="text-[13px] font-medium">{{ event.timezone.replace('America/', '').replace('_', ' ') }}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="text-[14px] text-[#374151] leading-[1.75] mb-[28px]">
            <p>{{ event.description }}</p>
          </div>

          <!-- Audience -->
          <div v-if="event.audience?.length" class="mb-[24px]">
            <p class="text-[12px] font-medium mb-[8px]">Who should attend</p>
            <div class="flex gap-[6px] flex-wrap">
              <span v-for="a in event.audience" :key="a"
                class="text-[12px] p-[3px_10px] rounded-[99px] border-[0.5px] border-[#e5e7eb] text-[#6b7280]">
                {{ a }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="event.tags?.length" class="mb-[28px]">
            <p class="text-[12px] font-medium mb-[8px]">Tags</p>
            <div class="flex gap-[6px] flex-wrap">
              <span v-for="t in event.tags" :key="t"
                class="text-[11px] p-[2px_8px] rounded-[99px] bg-[#f3f4f6] text-muted">
                {{ t }}
              </span>
            </div>
          </div>

          <!-- Register CTA -->
          <div v-if="event.registration?.url && !isPast"
            class="p-[20px] bg-[#f0fdf4] rounded-[12px] border-[0.5px] border-[#bbf7d0] mb-[32px]">
            <p class="text-[14px] font-medium mb-[4px]">Registration is open</p>
            <p class="text-[13px] text-[#6b7280] mb-[12px]">
              {{ event.registration.cost === 'free' ? 'This event is free to attend.' : 'See the registration page for pricing details.' }}
            </p>
            <a :href="event.registration.url" target="_blank" rel="noopener"
              class="inline-block text-[13px] font-medium p-[9px_20px] bg-[#111827] text-white rounded-[8px] no-underline">
              Register →
            </a>
          </div>

          <!-- Prev/next -->
          <div class="flex justify-between pt-[24px] border-t-[0.5px] border-t-[#f3f4f6]">
            <NuxtLink v-if="prevEvent" :to="`/community/events/${prevEvent.slug}`"
              class="text-[12px] text-[#6b7280] no-underline max-w-[200px]">
              ← {{ prevEvent.title }}
            </NuxtLink>
            <span v-else></span>
            <NuxtLink v-if="nextEvent" :to="`/community/events/${nextEvent.slug}`"
              class="text-[12px] text-[#6b7280] no-underline max-w-[200px] text-right">
              {{ nextEvent.title }} →
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="pt-[68px]">

          <!-- Quick facts -->
          <div class="bg-[#f9fafb] rounded-[12px] p-[16px] mb-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[12px]">Quick facts</p>
            <div class="flex flex-col gap-[10px]">
              <div>
                <p class="text-[11px] text-muted mb-[1px]">Type</p>
                <p class="text-[12px] font-medium capitalize">{{ event.type }}</p>
              </div>
              <div>
                <p class="text-[11px] text-muted mb-[1px]">Date</p>
                <p class="text-[12px] font-medium">{{ fmtDate(event.start, event.end) }}</p>
              </div>
              <div v-if="event.location">
                <p class="text-[11px] text-muted mb-[1px]">Format</p>
                <p class="text-[12px] font-medium capitalize">{{ event.location.mode }}</p>
              </div>
              <div v-if="event.location?.city">
                <p class="text-[11px] text-muted mb-[1px]">City</p>
                <p class="text-[12px] font-medium">{{ event.location.city }}</p>
              </div>
            </div>
          </div>

          <!-- Mentioned in newsletters -->
          <div v-if="event.newsletter_source?.length" class="mb-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">In the newsletter</p>
            <div class="flex flex-col gap-[6px]">
              <NuxtLink v-for="slug in event.newsletter_source" :key="slug"
                :to="`/community/newsletter/${slug}`"
                class="text-[12px] text-[#6b7280] no-underline flex items-center gap-[4px]">
                <span class="w-[5px] h-[5px] rounded-[50%] bg-[#1D9E75] shrink-0"></span>
                {{ slug.replace('-', ' ').replace(/(\d{4})\s(\w+)/, '$2 $1') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Audience -->
          <div v-if="event.audience?.length" class="mb-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">Audience</p>
            <div class="flex flex-col gap-[4px]">
              <span v-for="a in event.audience" :key="a" class="text-[12px] text-[#6b7280] capitalize">{{ a }}</span>
            </div>
          </div>

          <!-- Nearby events -->
          <div v-if="prevEvent || nextEvent" class="mb-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">Other events</p>
            <div class="flex flex-col gap-[8px]">
              <NuxtLink v-if="prevEvent" :to="`/community/events/${prevEvent.slug}`"
                class="no-underline">
                <p class="text-[12px] text-[#6b7280] leading-[1.35]">← {{ prevEvent.title }}</p>
                <p class="text-[11px] text-muted">{{ fmtShort(prevEvent.start) }}</p>
              </NuxtLink>
              <NuxtLink v-if="nextEvent" :to="`/community/events/${nextEvent.slug}`"
                class="no-underline">
                <p class="text-[12px] text-[#6b7280] leading-[1.35]">{{ nextEvent.title }} →</p>
                <p class="text-[11px] text-muted">{{ fmtShort(nextEvent.start) }}</p>
              </NuxtLink>
            </div>
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>
