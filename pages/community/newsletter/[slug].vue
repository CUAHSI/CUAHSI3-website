<script setup lang="ts">
const route = useRoute()

const { data: issue } = await useAsyncData(`newsletter-${route.params.slug}`, () =>
  queryContent('newsletter').where({ slug: route.params.slug, published: true }).findOne().catch(() => null)
)

if (!issue.value) throw createError({ statusCode: 404, message: 'Issue not found' })

useHead({
  title: `${issue.value.title} · CUAHSI`,
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
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Nav -->

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">
      <div class="rgrid rgrid-split" style="display:grid;gap:48px;padding:36px 0 48px;--cols:minmax(0,1fr) 220px;">

        <!-- Main content -->
        <article>
          <NuxtLink to="/community/newsletter" style="font-size:12px;color:#9ca3af;text-decoration:none;display:block;margin-bottom:16px;">← Newsletter archive</NuxtLink>

          <p style="font-size:11px;color:#9ca3af;margin-bottom:6px;">{{ fmtDate(issue.date) }}</p>
          <h1 style="font-size:26px;font-weight:500;margin-bottom:10px;line-height:1.25;">{{ issue.title }}</h1>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:14px;">{{ issue.summary }}</p>

          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:28px;padding-bottom:24px;border-bottom:0.5px solid #f3f4f6;">
            <span v-for="t in issue.topics" :key="t"
              style="font-size:11px;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;border:0.5px solid #bbf7d0;">
              {{ t.replace(/-/g,' ') }}
            </span>
          </div>

          <!-- Rendered markdown body -->
          <div style="font-size:14px;line-height:1.75;color:#374151;">
            <ContentRenderer :value="issue" class="newsletter-prose" />
          </div>

          <!-- Prev/next -->
          <div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:0.5px solid #f3f4f6;">
            <NuxtLink v-if="prevIssue" :to="`/community/newsletter/${prevIssue.slug}`"
              style="font-size:13px;color:#6b7280;text-decoration:none;">
              ← {{ prevIssue.title }}
            </NuxtLink>
            <span v-else></span>
            <NuxtLink v-if="nextIssue" :to="`/community/newsletter/${nextIssue.slug}`"
              style="font-size:13px;color:#6b7280;text-decoration:none;">
              {{ nextIssue.title }} →
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside style="padding-top:68px;">

          <!-- People mentioned -->
          <div v-if="people?.length" style="margin-bottom:24px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">People in this issue</p>
            <template v-for="person in people" :key="person.slug">
            <NuxtLink v-if="person.has_profile"
              :key="`person-link-${person.slug}`"
              :to="`/about/team/${person.slug}`"
              style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
              <div :style="`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0;background:${person._contentType==='board'?'#EEF2FF':person._contentType==='community'?'#FFF7ED':'#F0FDF4'};color:${person._contentType==='board'?'#4338CA':person._contentType==='community'?'#C2410C':'#166534'};`">
                {{ person.name.split(' ').map((n:string) => n[0]).join('').slice(0,2) }}
              </div>
              <div style="flex:1;">
                <p style="font-size:12px;font-weight:500;margin-bottom:1px;">{{ person.name }} <span style="font-size:10px;color:#1D9E75;">→</span></p>
                <p style="font-size:11px;color:#9ca3af;">{{ person.role }}</p>
              </div>
            </NuxtLink>
            <div v-else :key="`person-div-${person.slug}`"
              style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:0.5px solid #f3f4f6;">
              <div :style="`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0;background:${person._contentType==='board'?'#EEF2FF':person._contentType==='community'?'#FFF7ED':'#F0FDF4'};color:${person._contentType==='board'?'#4338CA':person._contentType==='community'?'#C2410C':'#166534'};`">
                {{ person.name.split(' ').map((n:string) => n[0]).join('').slice(0,2) }}
              </div>
              <div>
                <p style="font-size:12px;font-weight:500;margin-bottom:1px;">{{ person.name }}</p>
                <p style="font-size:11px;color:#9ca3af;">{{ person.role }}</p>
                <p v-if="person.institution" style="font-size:11px;color:#d1d5db;">{{ person.institution }}</p>
              </div>
            </div>
            </template>
          </div>

          <!-- Topics -->
          <div style="margin-bottom:24px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">Topics</p>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <span v-for="t in issue.topics" :key="t"
                style="font-size:12px;color:#6b7280;">
                {{ t.replace(/-/g,' ') }}
              </span>
            </div>
          </div>

          <!-- Events mentioned -->
          <div v-if="relatedEvents?.length" style="margin-bottom:24px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">Events in this issue</p>
            <NuxtLink v-for="event in relatedEvents" :key="event.slug"
              :to="`/community/events/${event.slug}`"
              style="display:block;padding:8px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
                <p style="font-size:12px;font-weight:500;line-height:1.35;flex:1;">{{ event.title }}</p>
                <span :style="`font-size:10px;padding:1px 6px;border-radius:99px;flex-shrink:0;background:${event.type==='deadline'?'#FEF9C3':event.type==='webinar'?'#E1F5EE':event.type==='workshop'?'#EDE9FE':'#EFF6FF'};color:${event.type==='deadline'?'#854D0E':event.type==='webinar'?'#0F6E56':event.type==='workshop'?'#5B21B6':'#1E40AF'};`">
                  {{ event.type }}
                </span>
              </div>
              <p style="font-size:11px;color:#9ca3af;margin-top:2px;">
                {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                <span v-if="event.location?.city"> · {{ event.location.city }}</span>
                <span v-else-if="event.location?.mode === 'virtual'"> · Virtual</span>
                <span style="color:#1D9E75;margin-left:4px;">→</span>
              </p>
            </NuxtLink>
          </div>

          <!-- Other issues -->
          <div style="margin-bottom:24px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;">Other issues</p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <NuxtLink v-if="prevIssue" :to="`/community/newsletter/${prevIssue.slug}`"
                style="font-size:12px;color:#6b7280;text-decoration:none;">
                ← {{ fmtDate(prevIssue.date) }}
              </NuxtLink>
              <NuxtLink v-if="nextIssue" :to="`/community/newsletter/${nextIssue.slug}`"
                style="font-size:12px;color:#6b7280;text-decoration:none;">
                {{ fmtDate(nextIssue.date) }} →
              </NuxtLink>
            </div>
          </div>

          <!-- Original Mailchimp link -->
          <div v-if="issue.mailchimp_url" style="padding-top:16px;border-top:0.5px solid #f3f4f6;">
            <p style="font-size:11px;color:#9ca3af;margin-bottom:4px;">Original version</p>
            <a :href="issue.mailchimp_url" target="_blank" rel="noopener"
              style="font-size:11px;color:#9ca3af;word-break:break-all;">
              Mailchimp archive ↗
            </a>
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<style>
.newsletter-prose h2 { font-size: 16px; font-weight: 500; margin: 28px 0 10px; }
.newsletter-prose h3 { font-size: 14px; font-weight: 500; margin: 20px 0 8px; }
.newsletter-prose p { margin-bottom: 14px; }
.newsletter-prose ul { padding-left: 20px; margin-bottom: 14px; }
.newsletter-prose li { margin-bottom: 5px; }
.newsletter-prose strong { font-weight: 500; }
.newsletter-prose em { font-style: italic; }
.newsletter-prose a { color: #166534; }
</style>
