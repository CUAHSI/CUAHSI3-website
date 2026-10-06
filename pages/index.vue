<script setup lang="ts">
useHead({
  title: 'CUAHSI — Advancing Water Science',
  meta: [{ name: 'description', content: 'CUAHSI connects researchers, students, and institutions with the data, computing, and training that make water science open, reproducible, and shared.' }]
})

const { useCategoryColor } = await import('~/composables/useCategoryColor')

// Latest highlights
const { data: highlights } = await useAsyncData('home-highlights', () =>
  queryContent('research').where({ published: true }).sort({ date: -1 }).limit(4).find()
)

// Upcoming events
const { data: allEvents } = await useAsyncData('home-events', () =>
  queryContent('events').where({ published: true }).sort({ start: 1 }).find()
)
const upcomingEvents = computed(() => {
  const now = new Date()
  return (allEvents.value ?? []).filter(e => new Date(e.start) >= now).slice(0, 3)
})

// Latest cyberseminar
const { data: latestSeminar } = await useAsyncData('home-seminar', () =>
  queryContent('cyberseminars').where({ published: true }).sort({ date: -1 }).findOne().catch(() => null)
)

function fmtEventDay(d: string) { return new Date(d).toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' }) }
function fmtEventMon(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase() }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }
function fmtFullDate(d?: string) {
  const t = d ? new Date(d) : null
  return t && !isNaN(t.getTime()) ? t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : ''
}

const pathways = [
  { tag: 'I want to work with data', title: 'Data & Computing', desc: 'HydroShare, cloud compute, and national water-data discovery.', to: '/data-platforms' },
  { tag: 'I want to learn or teach', title: 'Learn & Train', desc: 'Cyberseminars, summer institutes, and classroom-ready material.', to: '/learn-train' },
  { tag: 'I represent an institution', title: 'Membership', desc: 'Governance, benefits, and how to join the consortium.', to: '/about/membership' },
  { tag: 'I want to see impact', title: 'Impact', desc: 'What the community is building, measuring, and discovering.', to: '/about/impact' },
]

const homeTools = [
  { name: 'HydroShare', kicker: 'DATA REPOSITORY', tagline: 'Publish, share, and collaborate on hydrologic data and models with a citable DOI.', tags: ['Repository', 'DOI', 'Open data'], cta: 'Open HydroShare', href: 'https://www.hydroshare.org' },
  { name: 'CUAHSI JupyterHub', kicker: 'CLOUD COMPUTE', tagline: 'Cloud notebooks for hydrologic analysis — no local setup, ready in seconds.', tags: ['Python', 'R', 'Cloud'], cta: 'Launch compute', href: 'https://jupyterhub.cuahsi.org' },
  { name: 'Water Services', kicker: 'TIME-SERIES DATA', tagline: 'Discover and access national time-series water data — map-based search plus standardized WaterOneFlow/WaterML services.', tags: ['WaterML', 'Time series', 'Map'], cta: 'Explore Water Services', href: 'https://data.cuahsi.org/' },
]

const featured = computed(() => highlights.value?.[0])
const sideHighlights = computed(() => highlights.value?.slice(1, 4) ?? [])
</script>

<template>
  <div>
    <!-- ── Hero ── -->
    <PageHero container-class="mx-auto max-w-site p-[76px_40px_72px] grid grid-cols-[1fr] min-[900px]:grid-cols-[1.04fr_.96fr] gap-[60px] items-center">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Consortium of Universities · Hydrologic Science</span>
          <h1 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(40px,5vw,62px)] leading-[1.03] tracking-[-.022em] text-navy m-[18px_0_0] [text-wrap:balance]">
            Advancing the science of water, together.
          </h1>
          <p class="font-['Hanken_Grotesk'] font-normal text-[19px] leading-[1.55] text-[#3a4d57] max-w-[520px] m-[22px_0_0]">
            CUAHSI connects researchers, students, and institutions with the data, computing, and training that make water science open, reproducible, and shared.
          </p>
          <div class="flex gap-[14px] mt-8 flex-wrap">
            <NuxtLink to="/data-platforms" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white font-semibold rounded-btn font-['Hanken_Grotesk'] text-[16px] leading-[normal] p-[15px_26px]">
              Explore data &amp; tools <span class="arr">→</span>
            </NuxtLink>
            <NuxtLink to="/community" class="inline-flex items-center bg-transparent font-semibold rounded-btn font-['Hanken_Grotesk'] text-[16px] leading-[normal] text-navy p-[15px_26px] border-[1.5px] border-[rgba(15,46,68,.22)]">
              Join the community
            </NuxtLink>
          </div>
          <div class="flex gap-[28px] mt-[38px] flex-wrap">
            <div>
              <div class="font-['Schibsted_Grotesk'] font-bold text-[22px] leading-[normal] text-navy">100+</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">MEMBER UNIVERSITIES</div>
            </div>
            <div class="w-px bg-[rgba(15,33,43,.12)]"></div>
            <div>
              <div class="font-['Schibsted_Grotesk'] font-bold text-[22px] leading-[normal] text-navy">National</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">WATER-DATA NETWORK</div>
            </div>
            <div class="w-px bg-[rgba(15,33,43,.12)]"></div>
            <div>
              <div class="font-['Schibsted_Grotesk'] font-bold text-[22px] leading-[normal] text-navy">Open</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">SOURCE &amp; ACCESS</div>
            </div>
          </div>
        </div>

        <!-- Hero image + live data card -->
        <div class="relative">
          <div class="relative rounded-[16px] overflow-hidden min-h-[480px] bg-[linear-gradient(155deg,#10324c,#236193_70%)] [box-shadow:0_30px_60px_-30px_rgba(15,46,68,.5)]">
            <div class="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.05)_0_2px,transparent_2px_22px)]"></div>
            <span class="absolute left-5 top-5 font-mono font-bold tracking-[.1em] uppercase text-[11px] text-[rgba(255,255,255,.8)] bg-[rgba(0,0,0,.22)] p-[7px_11px] rounded-[6px]">PHOTO — FIELD TEAM GAUGING A RIVER</span>
          </div>
          <!-- Live gauge card -->
          <div class="absolute bg-white rounded-[12px] gauge-card left-[-22px] bottom-[-24px] p-[16px_18px] [box-shadow:0_20px_40px_-18px_rgba(15,46,68,.4)] border border-[rgba(15,33,43,.08)] w-[236px]">
            <div class="flex items-center gap-[7px] mb-[10px]">
              <span class="animate-livePulse w-[8px] h-[8px] rounded-[50%] bg-[#1f9d55] inline-block"></span>
              <span class="font-mono font-bold tracking-[.1em] text-muted text-[10.5px]">LIVE · USGS 06752260</span>
            </div>
            <div class="font-['Schibsted_Grotesk'] font-bold text-[26px] text-navy leading-[1]">142 <span class="font-mono text-[13px] text-muted">cfs</span></div>
            <div class="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[normal] text-muted m-[3px_0_12px]">Cache la Poudre River, CO</div>
            <div class="flex items-end gap-[3px] h-[34px]">
              <span v-for="(h, i) in [40,55,48,70,62,85,100,78]" :key="i" class="flex-1 rounded-sm" :style="`height:${h}%;background:${i < 3 ? '#cfe0ee' : i < 5 ? '#9cc4e2' : '#2A86C9'};`"></span>
            </div>
          </div>
        </div>
    </PageHero>

    <!-- ── Stats band ── -->
    <StatsBand />

    <!-- ── Find your path ── -->
    <section class="mx-auto max-w-site p-[84px_40px_20px]">
      <div class="flex justify-between items-end gap-6 mb-9 flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Find your path</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.2vw,40px)] leading-[1.08] text-navy tracking-[-.018em] m-[14px_0_0] max-w-[620px]">
            Wherever you are in water science, start here.
          </h2>
        </div>
      </div>
      <div class="grid grid-cols-[1fr] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(4,1fr)] gap-[18px]">
        <NuxtLink v-for="p in pathways" :key="p.to" :to="p.to"
          class="card-lift arrow-row bg-white flex flex-col rounded-card text-left border border-[rgba(15,33,43,.1)] p-[24px_22px_22px] min-h-[218px] no-underline">
          <span class="font-mono font-bold tracking-[.06em] uppercase text-clay text-[11px]">{{ p.tag }}</span>
          <span class="font-['Schibsted_Grotesk'] font-bold text-[22px] leading-[normal] text-navy m-[14px_0_8px] block">{{ p.title }}</span>
          <span class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-muted flex-1 block">{{ p.desc }}</span>
          <span class="arrow-row inline-flex items-center gap-[7px] mt-4 font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water">Go there <span class="arr">→</span></span>
        </NuxtLink>
      </div>
    </section>

    <!-- ── Tools preview ── -->
    <section class="mx-auto max-w-site p-[72px_40px]">
      <div class="flex justify-between items-end gap-6 mb-[34px] flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Data &amp; computing</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.2vw,40px)] leading-[1.08] text-navy tracking-[-.018em] m-[14px_0_0]">Tools built for water science.</h2>
        </div>
        <NuxtLink to="/data-platforms" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] text-water">See all platforms <span class="arr">→</span></NuxtLink>
      </div>
      <div class="grid grid-cols-[1fr] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)] gap-[18px]">
        <div v-for="t in homeTools" :key="t.name" class="card-lift bg-white flex flex-col rounded-card overflow-hidden border border-[rgba(15,33,43,.1)]">
          <div class="relative h-[158px] bg-[repeating-linear-gradient(135deg,#e7eef3_0_14px,#dfe8ee_14px_28px)] border-b border-b-[rgba(15,33,43,.08)]">
            <span class="absolute font-mono tracking-[.06em] left-[14px] bottom-[12px] text-[10px] text-[#43657c] bg-[rgba(255,255,255,.85)] p-[5px_9px] rounded-[5px]">SCREENSHOT — {{ t.name.toUpperCase() }}</span>
          </div>
          <div class="flex flex-col flex-1 p-[22px]">
            <h3 class="font-['Schibsted_Grotesk'] font-bold text-[20px] leading-[normal] text-navy m-[0]">{{ t.name }}</h3>
            <p class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-muted m-[9px_0_16px] flex-1">{{ t.tagline }}</p>
            <div class="flex gap-[6px] flex-wrap mb-[18px]">
              <span v-for="tag in t.tags" :key="tag" class="font-mono text-[11px] text-[#1A5F9A] bg-[rgba(31,111,178,.09)] p-[4px_9px] rounded-[5px]">{{ tag }}</span>
            </div>
            <a :href="t.href" target="_blank" class="arrow-row inline-flex items-center gap-[7px] font-['Hanken_Grotesk'] font-semibold text-[14.5px] leading-[normal] text-navy">{{ t.cta }} <span class="arr">→</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Highlights ── -->
    <section class="bg-sand border-t border-t-[rgba(15,33,43,.08)] border-b border-b-[rgba(15,33,43,.08)]">
      <div class="mx-auto max-w-site p-[78px_40px]">
        <div class="flex justify-between items-end gap-6 mb-[34px] flex-wrap">
          <div>
            <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">From the community</span>
            <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.2vw,40px)] leading-[1.08] text-navy tracking-[-.018em] m-[14px_0_0]">Highlights &amp; impact.</h2>
          </div>
          <NuxtLink to="/about/impact" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] text-water">All highlights <span class="arr">→</span></NuxtLink>
        </div>
        <div class="grid grid-cols-[1fr] min-[900px]:grid-cols-[1.5fr_1fr] gap-[22px]" v-if="highlights?.length">
          <!-- Featured -->
          <NuxtLink v-if="featured" :to="`/about/impact/${featured.slug}`"
            class="card-lift bg-white rounded-[16px] overflow-hidden flex flex-col text-left border border-[rgba(15,33,43,.1)] no-underline">
            <div class="relative h-[300px] bg-[linear-gradient(150deg,#10324c,#2A86C9)]">
              <span class="absolute font-mono font-bold tracking-[.08em] text-white rounded-[6px]" :style="`left:18px;top:16px;font-size:10.5px;background:${useCategoryColor(featured.category).color};padding:6px 11px;`">
                {{ useCategoryColor(featured.category).label.toUpperCase() }}
              </span>
              <span class="absolute font-mono text-[10px] rounded-[5px] left-[18px] bottom-[14px] text-[rgba(255,255,255,.85)] bg-[rgba(0,0,0,.25)] p-[5px_9px]">PHOTO — {{ featured.title.toUpperCase() }}</span>
            </div>
            <div class="p-[24px]">
              <div class="font-mono text-[11px] tracking-[.06em] text-muted mb-2">{{ fmtDate(featured.date) }}</div>
              <h3 class="font-['Schibsted_Grotesk'] font-bold text-[24px] leading-[1.2] text-navy m-[0_0_10px] tracking-[-.01em]">{{ featured.title }}</h3>
              <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.55] text-muted m-[0_0_18px]">{{ featured.excerpt }}</p>
              <span class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[14.5px] leading-[normal] text-water">Read highlight <span class="arr">→</span></span>
            </div>
          </NuxtLink>

          <!-- Side stack -->
          <div class="flex flex-col gap-[14px]">
            <NuxtLink v-for="h in sideHighlights" :key="h.slug" :to="`/about/impact/${h.slug}`"
              class="card-lift bg-white rounded-card flex-1 flex flex-col border border-[rgba(15,33,43,.1)] p-[18px_20px] no-underline min-h-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-mono font-bold tracking-[.08em] text-white rounded-[4px]" :style="`font-size:10px;background:${useCategoryColor(h.category).color};padding:3px 8px;`">
                  {{ useCategoryColor(h.category).label.toUpperCase() }}
                </span>
                <span class="font-mono text-[10px] text-muted">{{ fmtDate(h.date) }}</span>
              </div>
              <h3 class="font-['Schibsted_Grotesk'] font-bold text-[17px] leading-[1.3] text-navy m-[0_0_6px] flex-1">{{ h.title }}</h3>
              <span class="arrow-row inline-flex items-center gap-1 mt-2 font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water">Read <span class="arr">→</span></span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Get involved: Events + Cyberseminar ── -->
    <section class="mx-auto max-w-site p-[78px_40px]">
      <div class="grid grid-cols-[1fr] min-[900px]:grid-cols-[1fr_1fr] gap-[48px]">

        <!-- Events -->
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Get involved</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(22px,2.4vw,32px)] leading-[1.1] text-navy tracking-[-.016em] m-[14px_0_24px]">Upcoming events.</h2>
          <div class="flex flex-col gap-[1px] bg-[rgba(15,33,43,.08)] rounded-[10px] overflow-hidden">
            <div v-for="e in upcomingEvents" :key="e.slug" class="bg-paper flex gap-4 items-start p-[16px_18px]">
              <div class="text-center flex-none rounded-[6px] bg-navy text-white w-[44px] p-[7px_4px]">
                <div class="font-mono font-bold text-[10px] text-water-soft tracking-[.06em]">{{ fmtEventMon(e.start) }}</div>
                <div class="font-['Schibsted_Grotesk'] font-bold text-[22px] leading-[1]">{{ fmtEventDay(e.start) }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/community/events/${e.slug}`" class="font-['Hanken_Grotesk'] font-semibold text-[14.5px] leading-[normal] text-navy no-underline transition-colors">{{ e.title }}</NuxtLink>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="font-mono text-[11px] text-muted">{{ e.location?.city || (e.location?.mode === 'virtual' ? 'Virtual' : '') }}</span>
                  <span class="font-mono text-[10px] rounded-[4px] bg-[rgba(31,111,178,.09)] text-[#1A5F9A] p-[2px_7px]">{{ e.location?.mode }}</span>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink to="/community/events" class="arrow-row inline-flex items-center gap-2 mt-5 font-['Hanken_Grotesk'] font-semibold text-[14.5px] leading-[normal] text-water">All events <span class="arr">→</span></NuxtLink>
        </div>

        <!-- Latest cyberseminar -->
        <div v-if="latestSeminar">
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Latest recording</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(22px,2.4vw,32px)] leading-[1.1] text-navy tracking-[-.016em] m-[14px_0_24px]">Cyberseminar archive.</h2>
          <NuxtLink to="/learn-train/cyberseminars" class="card-lift block bg-white rounded-card overflow-hidden border border-[rgba(15,33,43,.1)] no-underline">
            <div class="relative flex items-center justify-center h-[180px] bg-[linear-gradient(155deg,#10324c,#1F6FB2)]">
              <div class="rounded-full bg-white flex items-center justify-center w-[52px] h-[52px] opacity-[.9]">
                <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="7,4 17,10 7,16" fill="#0F2E44"/></svg>
              </div>
              <span v-if="latestSeminar.has_transcript" class="absolute font-mono font-bold text-[10px] tracking-[.06em] rounded-[4px] right-[14px] top-[14px] bg-[#1B7F46] text-white p-[4px_8px]">TRANSCRIPT ✓</span>
              <span class="absolute font-mono text-[10px] rounded-[5px] left-[14px] bottom-[12px] text-[rgba(255,255,255,.85)] bg-[rgba(0,0,0,.25)] p-[5px_9px]">{{ latestSeminar.series }}</span>
            </div>
            <div class="p-[18px_20px]">
              <div class="font-mono text-[10px] tracking-[.06em] text-muted mb-2">{{ fmtFullDate(latestSeminar.date) }}</div>
              <h3 class="font-['Schibsted_Grotesk'] font-bold text-[17px] leading-[1.3] text-navy m-[0_0_8px]">{{ latestSeminar.title }}</h3>
              <p class="line-clamp-2 font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.5] text-muted m-[0_0_14px]">{{ latestSeminar.description }}</p>
              <span class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">Browse archive <span class="arr">→</span></span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── Newsletter CTA ── -->
    <section class="bg-navy">
      <div class="mx-auto max-w-site p-[64px_40px] grid grid-cols-[1fr] min-[900px]:grid-cols-[1fr_1fr] gap-[48px] items-center">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-[#e0a384]">Stay connected</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(26px,2.8vw,38px)] leading-[1.1] text-white tracking-[-.016em] m-[14px_0_10px]">Water science news, monthly.</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.55] text-[#7fa4bf] max-w-[440px]">Programs, funding opportunities, community spotlights, and research updates — no spam, unsubscribe anytime.</p>
        </div>
        <div class="flex gap-3">
          <input type="email" aria-label="Email address" placeholder="your@university.edu"
            class="flex-1 rounded-btn text-ink bg-white font-['Hanken_Grotesk'] font-normal text-[14px] leading-[normal] p-[14px_16px] border-0 min-w-0" />
          <button class="flex-none rounded-btn font-semibold text-white font-['Hanken_Grotesk'] text-[15px] leading-[normal] bg-clay p-[14px_24px] border-0 cursor-pointer whitespace-nowrap">Subscribe</button>
        </div>
      </div>
    </section>

  </div>
</template>

<style>
@media (max-width: 640px) {
  .gauge-card { left: 12px !important; right: 12px; bottom: -20px !important; width: auto !important; }
}
.card-lift { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.card-lift:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(15,46,68,.35); }
.arrow-row:hover .arr { transform: translateX(5px); }
.arr { transition: transform .18s ease; display: inline-block; }
</style>
