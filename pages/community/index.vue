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
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const waysin = [
  {
    icon: '📅',
    title: 'Attend an event',
    desc: 'Join workshops, webinars, conferences, and the annual Virtual Open House. Most CUAHSI events are free and open to the community regardless of membership.',
    cta: 'See upcoming events',
    href: '/community/events',
    internal: true,
  },
  {
    icon: '🎓',
    title: 'Apply for training or funding',
    desc: 'Workshops, fellowships, the Virtual University, and travel grants are open to students and early-career researchers at any institution.',
    cta: 'Browse programs',
    href: '/learn-train',
    internal: true,
  },
  {
    icon: '📬',
    title: 'Subscribe to the newsletter',
    desc: 'Monthly updates on programs, events, funding deadlines, HydroShare highlights, and community spotlights. The archive is fully indexed on cuahsi.org.',
    cta: 'Subscribe',
    href: 'https://cuahsi.us3.list-manage.com/subscribe?u=aad7e9257f329c1a46ebbd412&id=e9b95979ca',
    internal: false,
  },
  {
    icon: '🏛️',
    title: 'Bring CUAHSI to your campus',
    desc: 'CUAHSI staff are available for free seminars, hands-on workshops, and consultations at universities and colleges — tailored to your audience, in person or virtual.',
    cta: 'See what we offer',
    href: '/community/campus-visits',
    internal: true,
  },
  {
    icon: '💼',
    title: 'Post or find a job',
    desc: 'The CUAHSI job board lists opportunities across water science, hydrology, engineering, and data science. Postings remain active for 60 days.',
    cta: 'View job board',
    href: '/community/jobs',
    internal: false,
  },
  {
    icon: '🤝',
    title: 'Join a member institution',
    desc: 'If your university or organization is not yet a CUAHSI member, institutional membership connects your community to shared infrastructure, training, and governance.',
    cta: 'Learn about membership',
    href: '/about/membership',
    internal: true,
  },
  {
    icon: '🔬',
    title: 'Serve on an advisory committee',
    desc: 'Advisory committees on informatics, education and outreach, and instrumentation are open to any interested individual regardless of membership status.',
    cta: 'Learn about governance',
    href: '/about/governance#advisory-committees',
    internal: true,
  },
  {
    icon: '💡',
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

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">

      <!-- Hero -->
      <section style="padding:48px 0 40px;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;color:#5C6E78;font-weight:500;letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px;">Get involved</p>
        <h1 style="font-size:32px;font-weight:500;line-height:1.2;margin-bottom:16px;max-width:560px;">
          Connect with the water science community
        </h1>
        <p style="font-size:15px;color:#6b7280;line-height:1.7;max-width:560px;">
          CUAHSI community consists of students, educators, researchers, volunteer scientists, outreach coordinators,
          environmental and watershed organizations, and federal and state agencies. Everyone involved in water
          science, water-resources management, or water-resources protection has a place here.
        </p>
      </section>

      <!-- Quote -->
      <section style="padding:36px 0;border-bottom:0.5px solid #f3f4f6;">
        <blockquote style="border-left:3px solid #e5e7eb;padding-left:22px;max-width:680px;">
          <p style="font-size:15px;color:#374151;line-height:1.75;font-style:italic;margin-bottom:10px;">
            "CUAHSI plays a one-of-a-kind and vital role connecting and engaging the academic community in the
            hydrological sciences. CUAHSI has succeeded in providing academic researchers, faculty, and graduate
            students with a consistent and well-resourced hub for academic exchange, data and modeling tools,
            conferences, training, and cross-disciplinary, trans-institutional programming."
          </p>
          <p style="font-size:12px;color:#5C6E78;">Scott H. Ensign, Ph.D., Assistant Director and Research Scientist, Stroud Water Research Center</p>
        </blockquote>
      </section>

      <!-- Ways to get involved -->
      <section style="padding:40px 0;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#5C6E78;margin-bottom:20px;">Ways to get involved</p>
        <div class="rgrid rgrid-multi" style="display:grid;gap:12px;--cols:repeat(4,minmax(0,1fr));">
          <div v-for="way in waysin" :key="way.title"
            style="border:0.5px solid #e5e7eb;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px;">
            <div style="font-size:22px;margin-bottom:2px;">{{ way.icon }}</div>
            <p style="font-size:13px;font-weight:500;line-height:1.35;">{{ way.title }}</p>
            <p style="font-size:12px;color:#6b7280;line-height:1.55;flex:1;">{{ way.desc }}</p>
            <NuxtLink v-if="way.internal" :to="way.href"
              style="font-size:12px;color:#0F7A57;text-decoration:none;margin-top:4px;">
              {{ way.cta }} →
            </NuxtLink>
            <a v-else :href="way.href" style="font-size:12px;color:#0F7A57;text-decoration:none;margin-top:4px;">
              {{ way.cta }} →
            </a>
          </div>
        </div>
      </section>

      <!-- News + Events + Newsletter -->
      <section class="rgrid rgrid-multi" style="display:grid;gap:32px;padding:40px 0;border-bottom:0.5px solid #f3f4f6;--cols:repeat(3,minmax(0,1fr));">

        <div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;">
            <p style="font-size:13px;font-weight:500;">Latest news</p>
            <NuxtLink to="/community/news" style="font-size:12px;color:#5C6E78;text-decoration:none;">All news →</NuxtLink>
          </div>
          <div v-if="latestNews?.length">
            <div v-for="post in latestNews" :key="post._path"
              style="padding:11px 0;border-bottom:0.5px solid #f3f4f6;">
              <p style="font-size:11px;color:#5C6E78;margin-bottom:3px;">{{ fmtDate(post.date) }}</p>
              <p style="font-size:13px;font-weight:500;line-height:1.4;margin-bottom:3px;">{{ post.title }}</p>
              <p v-if="post.excerpt" style="font-size:12px;color:#6b7280;line-height:1.5;">{{ post.excerpt }}</p>
            </div>
          </div>
          <p v-else style="font-size:13px;color:#5C6E78;">No news yet.</p>
        </div>

        <div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;">
            <p style="font-size:13px;font-weight:500;">Upcoming events</p>
            <NuxtLink to="/community/events" style="font-size:12px;color:#5C6E78;text-decoration:none;">All events →</NuxtLink>
          </div>
          <div v-if="upcomingEvents?.length">
            <NuxtLink v-for="event in upcomingEvents" :key="event._path"
              :to="`/community/events/${event.slug}`"
              style="display:flex;gap:10px;padding:10px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
              <div style="flex-shrink:0;width:36px;background:#f9fafb;border-radius:6px;text-align:center;padding:5px 2px;">
                <p style="font-size:9px;color:#5C6E78;text-transform:uppercase;letter-spacing:.05em;margin-bottom:1px;">
                  {{ new Date(event.start).toLocaleDateString('en-US',{month:'short'}) }}
                </p>
                <p style="font-size:16px;font-weight:500;line-height:1;">{{ new Date(event.start).getDate() }}</p>
              </div>
              <div style="flex:1;min-width:0;">
                <p style="font-size:13px;font-weight:500;line-height:1.35;margin-bottom:3px;">{{ event.title }}</p>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  <span :style="typeStyle(event.type)">{{ event.type }}</span>
                  <span v-if="event.location?.city" style="font-size:11px;color:#5C6E78;">{{ event.location.city }}</span>
                  <span v-else-if="event.location?.mode==='virtual'" style="font-size:11px;color:#5C6E78;">Virtual</span>
                </div>
              </div>
            </NuxtLink>
          </div>
          <p v-else style="font-size:13px;color:#5C6E78;">No upcoming events.</p>
        </div>

        <div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;">
            <p style="font-size:13px;font-weight:500;">Newsletter</p>
            <NuxtLink to="/community/newsletter" style="font-size:12px;color:#5C6E78;text-decoration:none;">Archive →</NuxtLink>
          </div>
          <div v-if="latestNewsletter" style="border:0.5px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
              <span style="width:6px;height:6px;border-radius:50%;background:#1D9E75;flex-shrink:0;"></span>
              <span style="font-size:11px;color:#5C6E78;text-transform:uppercase;letter-spacing:.05em;font-weight:500;">Latest issue</span>
            </div>
            <NuxtLink :to="`/community/newsletter/${latestNewsletter.slug}`"
              style="font-size:13px;font-weight:500;line-height:1.4;display:block;margin-bottom:6px;text-decoration:none;color:inherit;">
              {{ latestNewsletter.title }}
            </NuxtLink>
            <p style="font-size:12px;color:#6b7280;line-height:1.5;margin-bottom:10px;">{{ latestNewsletter.summary }}</p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              <span v-for="t in latestNewsletter.topics?.slice(0,3)" :key="t"
                style="font-size:11px;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;border:0.5px solid #bbf7d0;">
                {{ t.replace(/-/g, ' ') }}
              </span>
            </div>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:14px;">
            <p style="font-size:13px;font-weight:500;margin-bottom:4px;">Stay connected</p>
            <p style="font-size:12px;color:#6b7280;margin-bottom:10px;line-height:1.5;">Monthly news, events, and funding opportunities. No spam.</p>
            <a href="https://cuahsi.us3.list-manage.com/subscribe?u=aad7e9257f329c1a46ebbd412&id=e9b95979ca"
              target="_blank"
              style="display:inline-block;font-size:12px;font-weight:500;padding:7px 14px;background:#111827;color:white;border-radius:7px;text-decoration:none;">
              Subscribe →
            </a>
          </div>
        </div>

      </section>

      <!-- CZNet + Resources -->
      <section class="rgrid rgrid-split" style="display:grid;gap:20px;padding:40px 0;border-bottom:0.5px solid #f3f4f6;--cols:minmax(0,1fr) minmax(0,1fr);">

        <div style="border:0.5px solid #e5e7eb;border-radius:12px;padding:22px;">
          <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#5C6E78;margin-bottom:10px;">Research initiative</p>
          <p style="font-size:15px;font-weight:500;margin-bottom:8px;">Critical Zone Collaborative Network</p>
          <p style="font-size:13px;color:#6b7280;line-height:1.65;margin-bottom:14px;">
            CUAHSI is the Coordinating Hub for the Critical Zone Collaborative Network (CZNet), the next
            phase of NSF Critical Zone research. The CZNet comprises nine Thematic Clusters studying
            how rock, soil, water, air, and life interact across diverse geological and climatic settings.
            CUAHSI hub activities enhance water data services and broaden the community.
          </p>
          <a href="https://criticalzone.org" target="_blank" rel="noopener"
            style="font-size:13px;color:#0F7A57;text-decoration:none;">Visit criticalzone.org ↗</a>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#5C6E78;margin-bottom:2px;">Community resources</p>

          <a href="https://www.cuahsi.org/hydrologic-instrumentation-facilities" target="_blank" rel="noopener"
            style="border:0.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:2px;">Hydrologic instrumentation facilities</p>
              <p style="font-size:12px;color:#6b7280;">Community facilities and infrastructure available for research</p>
            </div>
            <span style="font-size:14px;color:#d1d5db;margin-left:10px;flex-shrink:0;">↗</span>
          </a>

          <a href="https://www.cuahsi.org/community/water-data-portals" target="_blank" rel="noopener"
            style="border:0.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:2px;">Water data portals</p>
              <p style="font-size:12px;color:#6b7280;">Web portals and websites with water resources data</p>
            </div>
            <span style="font-size:14px;color:#d1d5db;margin-left:10px;flex-shrink:0;">↗</span>
          </a>

          <a href="https://www.youtube.com/CUAHSI" target="_blank" rel="noopener"
            style="border:0.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:2px;">Cyberseminar archive</p>
              <p style="font-size:12px;color:#6b7280;">150+ recorded presentations from water scientists on YouTube</p>
            </div>
            <span style="font-size:14px;color:#d1d5db;margin-left:10px;flex-shrink:0;">↗</span>
          </a>

          <a href="https://www.cuahsi.org/ongoing-research-projects" target="_blank" rel="noopener"
            style="border:0.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:2px;">Ongoing research projects</p>
              <p style="font-size:12px;color:#6b7280;">Collaborative projects CUAHSI is actively supporting</p>
            </div>
            <span style="font-size:14px;color:#d1d5db;margin-left:10px;flex-shrink:0;">↗</span>
          </a>

          <NuxtLink to="/community/jobs"
            style="border:0.5px solid #e5e7eb;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:2px;">Job board</p>
              <p style="font-size:12px;color:#6b7280;">Open positions across water science and related fields</p>
            </div>
            <span style="font-size:14px;color:#d1d5db;margin-left:10px;flex-shrink:0;">→</span>
          </NuxtLink>
        </div>

      </section>

      <!-- Donate -->
      <section style="padding:32px 0 48px;">
        <div style="background:#f9fafb;border-radius:16px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
          <div style="max-width:520px;">
            <p style="font-size:15px;font-weight:500;margin-bottom:6px;">Support CUAHSI</p>
            <p style="font-size:13px;color:#6b7280;line-height:1.65;">
              CUAHSI is a nonprofit organization. Donations support programs, fellowships, and infrastructure
              that benefit the entire water science community, including researchers and students at institutions
              that are not yet CUAHSI members.
            </p>
          </div>
          <NuxtLink to="/support"
            style="flex-shrink:0;font-size:13px;font-weight:500;padding:10px 22px;background:#111827;color:white;border-radius:8px;text-decoration:none;white-space:nowrap;">
            Donate →
          </NuxtLink>
        </div>
      </section>

    </div>
  </div>
</template>
