<script setup lang="ts">
useHead({
  title: 'Get involved',
  meta: [{ name: 'description', content: 'Connect with the CUAHSI water science community. Find jobs, attend events, share your work, bring CUAHSI to your campus, contribute to advisory committees, or become a member institution.' }]
})

const { data: allCommunityEvents } = await useAsyncData('community-events', () =>
  queryContent('events').where({ published: true }).sort({ start: 1 }).find()
)
const upcomingEvents = computed(() =>
  (allCommunityEvents.value ?? []).filter(e => new Date(e.start) >= new Date()).slice(0, 4)
)

const { data: allNews } = await useAsyncData('community-news', () =>
  queryContent('news')
    .where({ published: true })
    .sort({ date: -1 })
    .find()
)
// queryContent('news') matches by path PREFIX, so it also returns '/newsletter/...'.
// Filter with the trailing slash, then take 3: a limit() in the query would let
// newsletter issues use up the slots before this filter runs.
const latestNews = computed(() =>
  (allNews.value ?? []).filter(item => item._path?.startsWith('/news/')).slice(0, 3)
)

const { data: latestNewsletter } = await useAsyncData('community-newsletter', () =>
  queryContent('newsletter')
    .where({ published: true })
    .sort({ date: -1 })
    .limit(1)
    .findOne()
    .catch(() => null)
)

const typeColors: Record<string, {bg: string; text: string}> = {
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
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// The two big cards at the top of "ways to get involved" carry a live fact (the next event, the number of open jobs); the
// time they use is worked out again in the browser, so a build that is days old does not show a stale event or count.
const renderedAt = useState('community-rendered-at', () => Date.now())
onMounted(() => { renderedAt.value = Date.now() })
const nextEvent = computed(() => {
  const now = new Date(renderedAt.value)
  return (allCommunityEvents.value ?? []).find(e => e.type !== 'deadline' && new Date(e.start) >= now) ?? null
})
const { data: allJobs } = await useAsyncData('community-jobs', () =>
  queryContent('jobs').where({ published: true }).only(['deadline']).find()
)
// the job board's own rule: published, and no deadline or a deadline that has not passed
const openJobs = computed(() => {
  const now = new Date(renderedAt.value)
  return (allJobs.value ?? []).filter(j => !j.deadline || new Date(j.deadline) >= now).length
})
function shortDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// The six smaller ways. `tile` is the colour of the icon's tile (written out whole so Tailwind sees the classes).
const waysin = [
  {
    icon: 'learn' as const,
    tile: 'bg-[#DCEBF7] text-[#0F2E44]',
    title: 'Apply for training or funding',
    desc: 'Workshops, fellowships, the Virtual University, and travel grants are open to students and early-career researchers at any institution.',
    cta: 'Browse programs',
    href: '/learn-train',
    internal: true,
  },
  {
    icon: 'network' as const,
    tile: 'bg-[#F6E3DA] text-[#9A4524]',
    title: 'Join a member institution',
    desc: 'If your university or organization is not yet a CUAHSI member, institutional membership connects your community to shared infrastructure, training, and governance.',
    cta: 'Learn about membership',
    href: '/about/membership',
    internal: true,
  },
  {
    icon: 'campus' as const,
    tile: 'bg-[#E1F0E9] text-[#14573F]',
    title: 'Bring CUAHSI to your campus',
    desc: 'CUAHSI staff are available for free seminars, hands-on workshops, and consultations at universities and colleges — tailored to your audience, in person or virtual.',
    cta: 'See what we offer',
    href: '/community/campus-visits',
    internal: true,
  },
  {
    icon: 'mail' as const,
    tile: 'bg-[#E4E1F4] text-[#3D3480]',
    title: 'Subscribe to the newsletter',
    desc: 'Monthly updates on programs, events, funding deadlines, HydroShare highlights, and community spotlights. The archive is fully indexed on cuahsi.org.',
    cta: 'Subscribe',
    href: 'https://cuahsi.us3.list-manage.com/subscribe?u=aad7e9257f329c1a46ebbd412&id=e9b95979ca',
    internal: false,
  },
  {
    icon: 'committee' as const,
    tile: 'bg-[#DCEBF7] text-[#0F2E44]',
    title: 'Serve on an advisory committee',
    desc: 'Advisory committees on informatics, education and outreach, and instrumentation are open to any interested individual regardless of membership status.',
    cta: 'Learn about governance',
    href: '/about/governance#advisory-committees',
    internal: true,
  },
  {
    icon: 'story' as const,
    tile: 'bg-[#F6E3DA] text-[#9A4524]',
    title: 'Share your CUAHSI story',
    desc: 'As CUAHSI marks its 25th anniversary, we are collecting reflections from the community. What is a CUAHSI moment that stands out for you?',
    cta: 'Send a reflection',
    href: 'mailto:commgr@cuahsi.org',
    internal: false,
  },
]
</script>

<template>
  <div>
    <!-- Hero: the same banner as the other sections, and the page below it is now the same width and side padding as theirs (it was a narrower 1024px column) -->
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[580px]">
      <template #kicker>Get involved</template>
      <template #title>Connect with the water science community</template>
      <template #lead>CUAHSI community consists of students, educators, researchers, volunteer scientists, outreach coordinators, environmental and watershed organizations, and federal and state agencies. Everyone involved in water science, water-resources management, or water-resources protection has a place here.</template>
    </PageHero>

    <div class="mx-auto max-w-site p-[0_40px]">

      <!-- Quote -->
      <section class="p-[36px_0] border-b-[0.5px] border-b-[#f3f4f6]">
        <blockquote class="border-l-[3px] border-l-[#e5e7eb] pl-[22px] max-w-[680px]">
          <p class="text-[15px] text-[#374151] leading-[1.75] italic mb-[10px]">
            "CUAHSI plays a one-of-a-kind and vital role connecting and engaging the academic community in the
            hydrological sciences. CUAHSI has succeeded in providing academic researchers, faculty, and graduate
            students with a consistent and well-resourced hub for academic exchange, data and modeling tools,
            conferences, training, and cross-disciplinary, trans-institutional programming."
          </p>
          <p class="text-[12px] text-muted">Scott H. Ensign, Ph.D., Assistant Director and Research Scientist, Stroud Water Research Center</p>
        </blockquote>
      </section>

      <!-- Ways to get involved: two big cards with a live fact, then six smaller ones -->
      <section class="p-[44px_0_48px] border-b-[0.5px] border-b-[#f3f4f6]">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[#9A4524] text-[12px]">Ways to get involved</span>
        <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(24px,3vw,32px)] leading-[1.12] tracking-[-.016em] text-navy m-[12px_0_26px]">Pick a way in.</h2>
        <div class="grid grid-cols-[1fr] sm:grid-cols-[repeat(2,minmax(0,1fr))] min-[900px]:grid-cols-[repeat(6,minmax(0,1fr))] gap-[16px]">

          <!-- Events -->
          <NuxtLink to="/community/events" class="card-lift arrow-row flex flex-col sm:col-span-2 min-[900px]:col-span-3 rounded-[16px] bg-navy text-white p-[28px] no-underline">
            <span class="flex items-center gap-[10px] font-mono font-bold tracking-[.14em] uppercase text-[#7FC0EE] text-[11.5px]"><WayIcon name="calendar" class="w-[20px] h-[20px]" /> Attend an event</span>
            <template v-if="nextEvent">
              <span class="font-mono text-[12px] tracking-[.06em] uppercase text-[#aecbe0] m-[24px_0_6px]">Next up</span>
              <span class="font-['Schibsted_Grotesk'] font-bold text-[clamp(30px,4vw,40px)] leading-[1.05] tracking-[-.02em] text-white">{{ shortDate(nextEvent.start) }}</span>
              <span class="font-['Hanken_Grotesk'] font-medium text-[16px] leading-[1.4] text-white m-[8px_0_0]">{{ nextEvent.title }}</span>
            </template>
            <span v-else class="font-['Schibsted_Grotesk'] font-bold text-[26px] leading-[1.15] tracking-[-.015em] text-white m-[24px_0_0]">Workshops, webinars, and conferences.</span>
            <span class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.55] text-[#c8dceb] flex-1 m-[14px_0_18px]">Join workshops, webinars, conferences, and the annual Virtual Open House. Most CUAHSI events are free and open to the community regardless of membership.</span>
            <span class="inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-white">See upcoming events <span class="arr" aria-hidden="true">→</span></span>
          </NuxtLink>

          <!-- Jobs -->
          <NuxtLink to="/community/jobs" class="card-lift arrow-row flex flex-col sm:col-span-2 min-[900px]:col-span-3 rounded-[16px] bg-[#16578F] text-white p-[28px] no-underline">
            <span class="flex items-center gap-[10px] font-mono font-bold tracking-[.14em] uppercase text-[#CFE6F8] text-[11.5px]"><WayIcon name="briefcase" class="w-[20px] h-[20px]" /> Post or find a job</span>
            <span class="font-mono text-[12px] tracking-[.06em] uppercase text-[#CFE6F8] m-[24px_0_6px]">Job board</span>
            <span v-if="openJobs > 0" class="font-['Schibsted_Grotesk'] font-bold text-[clamp(30px,4vw,40px)] leading-[1.05] tracking-[-.02em] text-white">{{ openJobs }} open {{ openJobs === 1 ? 'position' : 'positions' }}</span>
            <span v-else class="font-['Schibsted_Grotesk'] font-bold text-[26px] leading-[1.15] tracking-[-.015em] text-white">Jobs across water science.</span>
            <span class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.55] text-[#DCEBF7] flex-1 m-[14px_0_18px]">The CUAHSI job board lists opportunities across water science, hydrology, engineering, and data science. Postings remain active for 60 days.</span>
            <span class="inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-white">View job board <span class="arr" aria-hidden="true">→</span></span>
          </NuxtLink>

          <!-- The rest -->
          <div v-for="way in waysin" :key="way.title" class="contents">
            <NuxtLink v-if="way.internal" :to="way.href"
              class="card-lift arrow-row flex flex-col min-[900px]:col-span-2 rounded-[16px] border border-[rgba(15,33,43,.12)] bg-white p-[22px] no-underline">
              <span class="flex-none w-[44px] h-[44px] rounded-[12px] flex items-center justify-center m-[0_0_16px]" :class="way.tile"><WayIcon :name="way.icon" /></span>
              <span class="font-['Schibsted_Grotesk'] font-bold text-[17px] leading-[1.25] text-navy m-[0_0_8px]">{{ way.title }}</span>
              <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.6] text-muted flex-1 m-[0_0_14px]">{{ way.desc }}</span>
              <span class="inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">{{ way.cta }} <span class="arr" aria-hidden="true">→</span></span>
            </NuxtLink>
            <a v-else :href="way.href"
              class="card-lift arrow-row flex flex-col min-[900px]:col-span-2 rounded-[16px] border border-[rgba(15,33,43,.12)] bg-white p-[22px] no-underline">
              <span class="flex-none w-[44px] h-[44px] rounded-[12px] flex items-center justify-center m-[0_0_16px]" :class="way.tile"><WayIcon :name="way.icon" /></span>
              <span class="font-['Schibsted_Grotesk'] font-bold text-[17px] leading-[1.25] text-navy m-[0_0_8px]">{{ way.title }}</span>
              <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.6] text-muted flex-1 m-[0_0_14px]">{{ way.desc }}</span>
              <span class="inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">{{ way.cta }} <span class="arr" aria-hidden="true">→</span></span>
            </a>
          </div>
        </div>
      </section>

      <!-- News + Events + Newsletter -->
      <section class="grid grid-cols-[1fr] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,minmax(0,1fr))] gap-[32px] p-[40px_0] border-b-[0.5px] border-b-[#f3f4f6]">

        <div>
          <div class="flex items-baseline justify-between mb-[16px]">
            <p class="text-[13px] font-medium">Latest news</p>
            <NuxtLink to="/community/news" class="text-[12px] text-muted no-underline">All news →</NuxtLink>
          </div>
          <div v-if="latestNews?.length">
            <div v-for="post in latestNews" :key="post._path"
              class="p-[11px_0] border-b-[0.5px] border-b-[#f3f4f6]">
              <p class="text-[11px] text-muted mb-[3px]">{{ fmtDate(post.date) }}</p>
              <p class="text-[13px] font-medium leading-[1.4] mb-[3px]">{{ post.title }}</p>
              <p v-if="post.excerpt" class="text-[12px] text-[#6b7280] leading-[1.5]">{{ post.excerpt }}</p>
            </div>
          </div>
          <p v-else class="text-[13px] text-muted">No news yet.</p>
        </div>

        <div>
          <div class="flex items-baseline justify-between mb-[16px]">
            <p class="text-[13px] font-medium">Upcoming events</p>
            <NuxtLink to="/community/events" class="text-[12px] text-muted no-underline">All events →</NuxtLink>
          </div>
          <div v-if="upcomingEvents?.length">
            <NuxtLink v-for="event in upcomingEvents" :key="event._path"
              :to="`/community/events/${event.slug}`"
              class="flex gap-[10px] p-[10px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
              <div class="shrink-0 w-[36px] bg-[#f9fafb] rounded-[6px] text-center p-[5px_2px]">
                <p class="text-[9px] text-muted uppercase tracking-[.05em] mb-[1px]">
                  {{ new Date(event.start).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) }}
                </p>
                <p class="text-[16px] font-medium leading-[1]">{{ new Date(event.start).getUTCDate() }}</p>
              </div>
              <div class="flex-1 min-w-[0]">
                <p class="text-[13px] font-medium leading-[1.35] mb-[3px]">{{ event.title }}</p>
                <div class="flex gap-[6px] items-center flex-wrap">
                  <span :style="typeStyle(event.type)">{{ event.type }}</span>
                  <span v-if="event.location?.city" class="text-[11px] text-muted">{{ event.location.city }}</span>
                  <span v-else-if="event.location?.mode==='virtual'" class="text-[11px] text-muted">Virtual</span>
                </div>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="text-[13px] text-muted">No upcoming events.</p>
        </div>

        <div>
          <div class="flex items-baseline justify-between mb-[16px]">
            <p class="text-[13px] font-medium">Newsletter</p>
            <NuxtLink to="/community/newsletter" class="text-[12px] text-muted no-underline">Archive →</NuxtLink>
          </div>
          <div v-if="latestNewsletter" class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[16px] mb-[12px]">
            <div class="flex items-center gap-[6px] mb-[8px]">
              <span class="w-[6px] h-[6px] rounded-[50%] bg-[#1D9E75] shrink-0"></span>
              <span class="text-[11px] text-muted uppercase tracking-[.05em] font-medium">Latest issue</span>
            </div>
            <NuxtLink :to="`/community/newsletter/${latestNewsletter.slug}`"
              class="text-[13px] font-medium leading-[1.4] block mb-[6px] no-underline text-inherit">
              {{ latestNewsletter.title }}
            </NuxtLink>
            <p class="text-[12px] text-[#6b7280] leading-[1.5] mb-[10px]">{{ latestNewsletter.summary }}</p>
            <div class="flex flex-wrap gap-[4px]">
              <span v-for="t in latestNewsletter.topics?.slice(0,3)" :key="t"
                class="text-[11px] p-[2px_8px] rounded-[99px] bg-[#f0fdf4] text-[#166534] border-[0.5px] border-[#bbf7d0]">
                {{ t.replace(/-/g, ' ') }}
              </span>
            </div>
          </div>
          <div class="bg-[#f9fafb] rounded-[10px] p-[14px]">
            <p class="text-[13px] font-medium mb-[4px]">Stay connected</p>
            <p class="text-[12px] text-[#6b7280] mb-[10px] leading-[1.5]">Monthly news, events, and funding opportunities. No spam.</p>
            <a href="https://cuahsi.us3.list-manage.com/subscribe?u=aad7e9257f329c1a46ebbd412&id=e9b95979ca"
              target="_blank"
              class="inline-block text-[12px] font-medium p-[7px_14px] bg-[#111827] text-white rounded-[7px] no-underline">
              Subscribe →
            </a>
          </div>
        </div>

      </section>

      <!-- CZNet + Resources -->
      <section class="grid grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[20px] p-[40px_0] border-b-[0.5px] border-b-[#f3f4f6]">

        <div class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[22px]">
          <p class="text-[11px] font-medium tracking-[.07em] uppercase text-muted mb-[10px]">Research initiative</p>
          <p class="text-[15px] font-medium mb-[8px]">Critical Zone Collaborative Network</p>
          <p class="text-[13px] text-[#6b7280] leading-[1.65] mb-[14px]">
            CUAHSI is the Coordinating Hub for the Critical Zone Collaborative Network (CZNet), the next
            phase of NSF Critical Zone research. The CZNet comprises nine Thematic Clusters studying
            how rock, soil, water, air, and life interact across diverse geological and climatic settings.
            CUAHSI hub activities enhance water data services and broaden the community.
          </p>
          <a href="https://criticalzone.org" target="_blank" rel="noopener"
            class="text-[13px] text-[#0F7A57] no-underline">Visit criticalzone.org ↗</a>
        </div>

        <div class="flex flex-col gap-[10px]">
          <p class="text-[11px] font-medium tracking-[.07em] uppercase text-muted mb-[2px]">Community resources</p>

          <a href="https://www.cuahsi.org/hydrologic-instrumentation-facilities" target="_blank" rel="noopener"
            class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[14px_16px] no-underline text-inherit flex justify-between items-center">
            <div>
              <p class="text-[13px] font-medium mb-[2px]">Hydrologic instrumentation facilities</p>
              <p class="text-[12px] text-[#6b7280]">Community facilities and infrastructure available for research</p>
            </div>
            <span class="text-[14px] text-[#d1d5db] ml-[10px] shrink-0">↗</span>
          </a>

          <a href="https://www.cuahsi.org/community/water-data-portals" target="_blank" rel="noopener"
            class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[14px_16px] no-underline text-inherit flex justify-between items-center">
            <div>
              <p class="text-[13px] font-medium mb-[2px]">Water data portals</p>
              <p class="text-[12px] text-[#6b7280]">Web portals and websites with water resources data</p>
            </div>
            <span class="text-[14px] text-[#d1d5db] ml-[10px] shrink-0">↗</span>
          </a>

          <a href="https://www.youtube.com/CUAHSI" target="_blank" rel="noopener"
            class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[14px_16px] no-underline text-inherit flex justify-between items-center">
            <div>
              <p class="text-[13px] font-medium mb-[2px]">Cyberseminar archive</p>
              <p class="text-[12px] text-[#6b7280]">150+ recorded presentations from water scientists on YouTube</p>
            </div>
            <span class="text-[14px] text-[#d1d5db] ml-[10px] shrink-0">↗</span>
          </a>

          <a href="https://www.cuahsi.org/ongoing-research-projects" target="_blank" rel="noopener"
            class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[14px_16px] no-underline text-inherit flex justify-between items-center">
            <div>
              <p class="text-[13px] font-medium mb-[2px]">Ongoing research projects</p>
              <p class="text-[12px] text-[#6b7280]">Collaborative projects CUAHSI is actively supporting</p>
            </div>
            <span class="text-[14px] text-[#d1d5db] ml-[10px] shrink-0">↗</span>
          </a>

          <NuxtLink to="/community/jobs"
            class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[14px_16px] no-underline text-inherit flex justify-between items-center">
            <div>
              <p class="text-[13px] font-medium mb-[2px]">Job board</p>
              <p class="text-[12px] text-[#6b7280]">Open positions across water science and related fields</p>
            </div>
            <span class="text-[14px] text-[#d1d5db] ml-[10px] shrink-0">→</span>
          </NuxtLink>
        </div>

      </section>

      <!-- Donate -->
      <section class="p-[32px_0_48px]">
        <div class="bg-[#f9fafb] rounded-[16px] p-[28px_32px] flex items-center justify-between gap-[24px]">
          <div class="max-w-[520px]">
            <p class="text-[15px] font-medium mb-[6px]">Support CUAHSI</p>
            <p class="text-[13px] text-[#6b7280] leading-[1.65]">
              CUAHSI is a nonprofit organization. Donations support programs, fellowships, and infrastructure
              that benefit the entire water science community, including researchers and students at institutions
              that are not yet CUAHSI members.
            </p>
          </div>
          <NuxtLink to="/support"
            class="shrink-0 text-[13px] font-medium p-[10px_22px] bg-[#111827] text-white rounded-[8px] no-underline whitespace-nowrap">
            Donate →
          </NuxtLink>
        </div>
      </section>

    </div>
  </div>
</template>
