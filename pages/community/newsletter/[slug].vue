<script setup lang="ts">
const route = useRoute()

const { data: issue } = await useAsyncData(`newsletter-${route.params.slug}`, () =>
  queryContent('newsletter').where({ slug: route.params.slug, published: true }).findOne().catch(() => null)
)

if (!issue.value) throw createError({ statusCode: 404, message: 'Issue not found' })

useHead({
  title: issue.value.title,
  meta: [{ name: 'description', content: issue.value.summary }]
})

// Resolve people_mentioned from full-team.json — the single source of truth for all staff.
// Individual .md files in content/team/ only exist for some staff; full-team.json has everyone.
const { data: fullTeamData } = await useAsyncData('full-team-nl', () =>
  queryContent('team').where({ _extension: 'json' }).findOne().catch(() => null)
)
const people = computed(() => {
  const slugs: string[] = issue.value?.people_mentioned ?? []
  if (!slugs.length) return []
  const allStaff: any[] = Array.isArray(fullTeamData.value?.body) ? fullTeamData.value.body : []
  return slugs
    .map(slug => allStaff.find((p: any) => p.slug === slug))
    .filter(Boolean)
})

// Events mentioned in this issue (via newsletter_source back-reference)
const { data: relatedEvents } = await useAsyncData(`nl-events-${route.params.slug}`, () =>
  queryContent('events')
    .where({ published: true, newsletter_source: { $contains: route.params.slug as string } })
    .sort({ start: 1 })
    .find()
)

// Adjacent issues for prev/next
const { data: allIssues } = await useAsyncData('nl-all', () =>
  queryContent('newsletter').where({ published: true }).sort({ date: -1 }).find()
)
const idx = computed(() => allIssues.value?.findIndex(i => i.slug === route.params.slug) ?? -1)
const prevIssue = computed(() => allIssues.value?.[idx.value + 1] ?? null)
const nextIssue = computed(() => allIssues.value?.[idx.value - 1] ?? null)

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>
    <!-- Nav -->

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">
      <div class="grid gap-[48px] p-[36px_0_48px] grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_220px]">

        <!-- Main content -->
        <article>
          <NuxtLink to="/community/newsletter" class="text-[12px] text-muted no-underline block mb-[16px]">← Newsletter archive</NuxtLink>

          <p class="text-[11px] text-muted mb-[6px]">{{ fmtDate(issue.date) }}</p>
          <h1 class="text-[26px] font-medium mb-[10px] leading-[1.25]">{{ issue.title }}</h1>
          <p class="text-[14px] text-[#6b7280] leading-[1.6] mb-[14px]">{{ issue.summary }}</p>

          <div class="flex flex-wrap gap-[5px] mb-[28px] pb-[24px] border-b-[0.5px] border-b-[#f3f4f6]">
            <span v-for="t in issue.topics" :key="t"
              class="text-[11px] p-[2px_8px] rounded-[99px] bg-[#f0fdf4] text-[#166534] border-[0.5px] border-[#bbf7d0]">
              {{ t.replace(/-/g,' ') }}
            </span>
          </div>

          <!-- Rendered markdown body -->
          <div class="text-[14px] leading-[1.75] text-[#374151]">
            <ContentRenderer :value="issue" class="newsletter-prose" />
          </div>

          <!-- Prev/next -->
          <div class="flex justify-between mt-[48px] pt-[24px] border-t-[0.5px] border-t-[#f3f4f6]">
            <NuxtLink v-if="prevIssue" :to="`/community/newsletter/${prevIssue.slug}`"
              class="text-[13px] text-[#6b7280] no-underline">
              ← {{ prevIssue.title }}
            </NuxtLink>
            <span v-else></span>
            <NuxtLink v-if="nextIssue" :to="`/community/newsletter/${nextIssue.slug}`"
              class="text-[13px] text-[#6b7280] no-underline">
              {{ nextIssue.title }} →
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="pt-[68px]">

          <!-- People mentioned -->
          <div v-if="people?.length" class="mb-[24px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">People in this issue</p>
            <template v-for="person in people" :key="person.slug">
            <NuxtLink v-if="person.has_profile"
              :key="`person-link-${person.slug}`"
              :to="`/about/team/${person.slug}`"
              class="flex items-start gap-[10px] p-[8px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
              <div :style="`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0;background:${person._contentType==='board'?'#EEF2FF':person._contentType==='community'?'#FFF7ED':'#F0FDF4'};color:${person._contentType==='board'?'#4338CA':person._contentType==='community'?'#C2410C':'#166534'};`">
                {{ person.name.split(' ').map((n:string) => n[0]).join('').slice(0,2) }}
              </div>
              <div class="flex-1">
                <p class="text-[12px] font-medium mb-[1px]">{{ person.name }} <span class="text-[10px] text-[#0F7A57]">→</span></p>
                <p class="text-[11px] text-muted">{{ person.role }}</p>
              </div>
            </NuxtLink>
            <div v-else :key="`person-div-${person.slug}`"
              class="flex items-start gap-[10px] p-[8px_0] border-b-[0.5px] border-b-[#f3f4f6]">
              <div :style="`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0;background:${person._contentType==='board'?'#EEF2FF':person._contentType==='community'?'#FFF7ED':'#F0FDF4'};color:${person._contentType==='board'?'#4338CA':person._contentType==='community'?'#C2410C':'#166534'};`">
                {{ person.name.split(' ').map((n:string) => n[0]).join('').slice(0,2) }}
              </div>
              <div>
                <p class="text-[12px] font-medium mb-[1px]">{{ person.name }}</p>
                <p class="text-[11px] text-muted">{{ person.role }}</p>
                <p v-if="person.institution" class="text-[11px] text-muted">{{ person.institution }}</p>
              </div>
            </div>
            </template>
          </div>

          <!-- Topics -->
          <div class="mb-[24px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">Topics</p>
            <div class="flex flex-col gap-[4px]">
              <span v-for="t in issue.topics" :key="t"
                class="text-[12px] text-[#6b7280]">
                {{ t.replace(/-/g,' ') }}
              </span>
            </div>
          </div>

          <!-- Events mentioned -->
          <div v-if="relatedEvents?.length" class="mb-[24px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">Events in this issue</p>
            <NuxtLink v-for="event in relatedEvents" :key="event.slug"
              :to="`/community/events/${event.slug}`"
              class="block p-[8px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
              <div class="flex items-start justify-between gap-[6px]">
                <p class="text-[12px] font-medium leading-[1.35] flex-1">{{ event.title }}</p>
                <span :style="`font-size:10px;padding:1px 6px;border-radius:99px;flex-shrink:0;background:${event.type==='deadline'?'#FEF9C3':event.type==='webinar'?'#E1F5EE':event.type==='workshop'?'#EDE9FE':'#EFF6FF'};color:${event.type==='deadline'?'#854D0E':event.type==='webinar'?'#0F6E56':event.type==='workshop'?'#5B21B6':'#1E40AF'};`">
                  {{ event.type }}
                </span>
              </div>
              <p class="text-[11px] text-muted mt-[2px]">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) }}
                <span v-if="event.location?.city"> · {{ event.location.city }}</span>
                <span v-else-if="event.location?.mode === 'virtual'"> · Virtual</span>
                <span class="text-[#0F7A57] ml-[4px]">→</span>
              </p>
            </NuxtLink>
          </div>

          <!-- Other issues -->
          <div class="mb-[24px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[10px]">Other issues</p>
            <div class="flex flex-col gap-[6px]">
              <NuxtLink v-if="prevIssue" :to="`/community/newsletter/${prevIssue.slug}`"
                class="text-[12px] text-[#6b7280] no-underline">
                ← {{ fmtDate(prevIssue.date) }}
              </NuxtLink>
              <NuxtLink v-if="nextIssue" :to="`/community/newsletter/${nextIssue.slug}`"
                class="text-[12px] text-[#6b7280] no-underline">
                {{ fmtDate(nextIssue.date) }} →
              </NuxtLink>
            </div>
          </div>

          <!-- Original Mailchimp link -->
          <div v-if="issue.mailchimp_url" class="pt-[16px] border-t-[0.5px] border-t-[#f3f4f6]">
            <p class="text-[11px] text-muted mb-[4px]">Original version</p>
            <a :href="issue.mailchimp_url" target="_blank" rel="noopener"
              class="text-[11px] text-muted [word-break:break-all]">
              Mailchimp archive ↗
            </a>
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>
