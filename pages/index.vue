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

function fmtEventDay(d: string) { return new Date(d).toLocaleDateString('en-US', { day: '2-digit' }) }
function fmtEventMon(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

const pathways = [
  { tag: 'I want to work with data', title: 'Data & Computing', desc: 'HydroShare, cloud compute, and national water-data discovery.', to: '/data-platforms' },
  { tag: 'I want to learn or teach', title: 'Learn & Train', desc: 'Cyberseminars, summer institutes, and classroom-ready material.', to: '/learn-train' },
  { tag: 'I represent an institution', title: 'Membership', desc: 'Governance, benefits, and how to join the consortium.', to: '/about/membership' },
  { tag: 'I want to see impact', title: 'Impact', desc: 'What the community is building, measuring, and discovering.', to: '/about/impact' },
]

const homeTools = [
  { name: 'HydroShare', kicker: 'DATA REPOSITORY', tagline: 'Publish, share, and collaborate on hydrologic data and models with a citable DOI.', tags: ['Repository', 'DOI', 'Open data'], cta: 'Open HydroShare', href: 'https://www.hydroshare.org' },
  { name: 'CUAHSI JupyterHub', kicker: 'CLOUD COMPUTE', tagline: 'Cloud notebooks for hydrologic analysis — no local setup, ready in seconds.', tags: ['Python', 'R', 'Cloud'], cta: 'Launch compute', href: 'https://jupyter.cuahsi.org' },
  { name: 'Water Services', kicker: 'TIME-SERIES DATA', tagline: 'Discover and access national time-series water data — map-based search plus standardized WaterOneFlow/WaterML services.', tags: ['WaterML', 'Time series', 'Map'], cta: 'Explore Water Services', href: 'https://data.cuahsi.org/' },
]

const featured = computed(() => highlights.value?.[0])
const sideHighlights = computed(() => highlights.value?.slice(1, 4) ?? [])
</script>

<template>
  <div>
    <!-- ── Hero ── -->
    <PageHero container-class="mx-auto rgrid rgrid-split" container-style="max-width:1240px;padding:76px 40px 72px;display:grid;gap:60px;align-items:center;--cols:1.04fr .96fr;">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Consortium of Universities · Hydrologic Science</span>
          <h1 style="font:700 clamp(40px,5vw,62px)/1.03 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:18px 0 0;text-wrap:balance;">
            Advancing the science of water, together.
          </h1>
          <p style="font:400 19px/1.55 'Hanken Grotesk';color:#3a4d57;max-width:520px;margin:22px 0 0;">
            CUAHSI connects researchers, students, and institutions with the data, computing, and training that make water science open, reproducible, and shared.
          </p>
          <div class="flex gap-[14px] mt-8 flex-wrap">
            <NuxtLink to="/data-platforms" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white font-semibold rounded-btn" style="font:600 16px 'Hanken Grotesk';padding:15px 26px;">
              Explore data &amp; tools <span class="arr">→</span>
            </NuxtLink>
            <NuxtLink to="/community" class="inline-flex items-center bg-transparent font-semibold rounded-btn" style="font:600 16px 'Hanken Grotesk';color:#0F2E44;padding:15px 26px;border:1.5px solid rgba(15,46,68,.22);">
              Join the community
            </NuxtLink>
          </div>
          <div class="flex gap-[28px] mt-[38px] flex-wrap">
            <div>
              <div style="font:700 22px 'Schibsted Grotesk';color:#0F2E44;">100+</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">MEMBER UNIVERSITIES</div>
            </div>
            <div class="w-px" style="background:rgba(15,33,43,.12);"></div>
            <div>
              <div style="font:700 22px 'Schibsted Grotesk';color:#0F2E44;">National</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">WATER-DATA NETWORK</div>
            </div>
            <div class="w-px" style="background:rgba(15,33,43,.12);"></div>
            <div>
              <div style="font:700 22px 'Schibsted Grotesk';color:#0F2E44;">Open</div>
              <div class="font-mono text-[12px] tracking-[.03em] text-muted">SOURCE &amp; ACCESS</div>
            </div>
          </div>
        </div>

        <!-- Hero image + live data card -->
        <div class="relative">
          <div class="relative rounded-[16px] overflow-hidden" style="min-height:480px;background:linear-gradient(155deg,#10324c,#236193 70%);box-shadow:0 30px 60px -30px rgba(15,46,68,.5);">
            <div class="absolute inset-0" style="background:repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 2px,transparent 2px 22px);"></div>
            <span class="absolute left-5 top-5 font-mono font-bold tracking-[.1em] uppercase" style="font-size:11px;color:rgba(255,255,255,.8);background:rgba(0,0,0,.22);padding:7px 11px;border-radius:6px;">PHOTO — FIELD TEAM GAUGING A RIVER</span>
          </div>
          <!-- Live gauge card -->
          <div class="absolute bg-white rounded-[12px] gauge-card" style="left:-22px;bottom:-24px;padding:16px 18px;box-shadow:0 20px 40px -18px rgba(15,46,68,.4);border:1px solid rgba(15,33,43,.08);width:236px;">
            <div class="flex items-center gap-[7px] mb-[10px]">
              <span class="animate-livePulse" style="width:8px;height:8px;border-radius:50%;background:#1f9d55;display:inline-block;"></span>
              <span class="font-mono font-bold tracking-[.1em] text-muted" style="font-size:10.5px;">LIVE · USGS 06752260</span>
            </div>
            <div style="font:700 26px 'Schibsted Grotesk';color:#0F2E44;line-height:1;">142 <span class="font-mono text-[13px] text-muted">cfs</span></div>
            <div style="font:400 12px 'Hanken Grotesk';color:#5C6E78;margin:3px 0 12px;">Cache la Poudre River, CO</div>
            <div class="flex items-end gap-[3px]" style="height:34px;">
              <span v-for="(h, i) in [40,55,48,70,62,85,100,78]" :key="i" class="flex-1 rounded-sm" :style="`height:${h}%;background:${i < 3 ? '#cfe0ee' : i < 5 ? '#9cc4e2' : '#2A86C9'};`"></span>
            </div>
          </div>
        </div>
    </PageHero>

    <!-- ── Stats band ── -->
    <StatsBand />

    <!-- ── Find your path ── -->
    <section class="mx-auto" style="max-width:1240px;padding:84px 40px 20px;">
      <div class="flex justify-between items-end gap-6 mb-9 flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Find your path</span>
          <h2 style="font:700 clamp(28px,3.2vw,40px)/1.08 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.018em;margin:14px 0 0;max-width:620px;">
            Wherever you are in water science, start here.
          </h2>
        </div>
      </div>
      <div class="rgrid rgrid-multi" style="display:grid;gap:18px;--cols:repeat(4,1fr);">
        <NuxtLink v-for="p in pathways" :key="p.to" :to="p.to"
          class="card-lift arrow-row bg-white flex flex-col rounded-card text-left"
          style="border:1px solid rgba(15,33,43,.1);padding:24px 22px 22px;min-height:218px;text-decoration:none;">
          <span class="font-mono font-bold tracking-[.06em] uppercase text-clay" style="font-size:11px;">{{ p.tag }}</span>
          <span style="font:700 22px 'Schibsted Grotesk';color:#0F2E44;margin:14px 0 8px;display:block;">{{ p.title }}</span>
          <span style="font:400 14.5px/1.5 'Hanken Grotesk';color:#5C6E78;flex:1;display:block;">{{ p.desc }}</span>
          <span class="arrow-row inline-flex items-center gap-[7px] mt-4" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;">Go there <span class="arr">→</span></span>
        </NuxtLink>
      </div>
    </section>

    <!-- ── Tools preview ── -->
    <section class="mx-auto" style="max-width:1240px;padding:72px 40px;">
      <div class="flex justify-between items-end gap-6 mb-[34px] flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Data &amp; computing</span>
          <h2 style="font:700 clamp(28px,3.2vw,40px)/1.08 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.018em;margin:14px 0 0;">Tools built for water science.</h2>
        </div>
        <NuxtLink to="/data-platforms" class="arrow-row inline-flex items-center gap-2" style="font:600 15px 'Hanken Grotesk';color:#1F6FB2;">See all platforms <span class="arr">→</span></NuxtLink>
      </div>
      <div class="rgrid rgrid-multi" style="display:grid;gap:18px;--cols:repeat(3,1fr);">
        <div v-for="t in homeTools" :key="t.name" class="card-lift bg-white flex flex-col rounded-card overflow-hidden" style="border:1px solid rgba(15,33,43,.1);">
          <div class="relative" style="height:158px;background:repeating-linear-gradient(135deg,#e7eef3 0 14px,#dfe8ee 14px 28px);border-bottom:1px solid rgba(15,33,43,.08);">
            <span class="absolute font-mono tracking-[.06em]" style="left:14px;bottom:12px;font-size:10px;color:#43657c;background:rgba(255,255,255,.85);padding:5px 9px;border-radius:5px;">SCREENSHOT — {{ t.name.toUpperCase() }}</span>
          </div>
          <div class="flex flex-col flex-1" style="padding:22px;">
            <h3 style="font:700 20px 'Schibsted Grotesk';color:#0F2E44;margin:0;">{{ t.name }}</h3>
            <p style="font:400 14.5px/1.5 'Hanken Grotesk';color:#5C6E78;margin:9px 0 16px;flex:1;">{{ t.tagline }}</p>
            <div class="flex gap-[6px] flex-wrap mb-[18px]">
              <span v-for="tag in t.tags" :key="tag" class="font-mono text-[11px]" style="color:#1F6FB2;background:rgba(31,111,178,.09);padding:4px 9px;border-radius:5px;">{{ tag }}</span>
            </div>
            <a :href="t.href" target="_blank" class="arrow-row inline-flex items-center gap-[7px]" style="font:600 14.5px 'Hanken Grotesk';color:#0F2E44;">{{ t.cta }} <span class="arr">→</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Highlights ── -->
    <section style="background:#F3EEE4;border-top:1px solid rgba(15,33,43,.08);border-bottom:1px solid rgba(15,33,43,.08);">
      <div class="mx-auto" style="max-width:1240px;padding:78px 40px;">
        <div class="flex justify-between items-end gap-6 mb-[34px] flex-wrap">
          <div>
            <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">From the community</span>
            <h2 style="font:700 clamp(28px,3.2vw,40px)/1.08 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.018em;margin:14px 0 0;">Highlights &amp; impact.</h2>
          </div>
          <NuxtLink to="/about/impact" class="arrow-row inline-flex items-center gap-2" style="font:600 15px 'Hanken Grotesk';color:#1F6FB2;">All highlights <span class="arr">→</span></NuxtLink>
        </div>
        <div class="rgrid rgrid-split" v-if="highlights?.length" style="display:grid;gap:22px;--cols:1.5fr 1fr;">
          <!-- Featured -->
          <NuxtLink v-if="featured" :to="`/about/impact/${featured.slug}`"
            class="card-lift bg-white rounded-[16px] overflow-hidden flex flex-col text-left"
            style="border:1px solid rgba(15,33,43,.1);text-decoration:none;">
            <div class="relative" style="height:300px;background:linear-gradient(150deg,#10324c,#2A86C9);">
              <span class="absolute font-mono font-bold tracking-[.08em] text-white rounded-[6px]" :style="`left:18px;top:16px;font-size:10.5px;background:${useCategoryColor(featured.category).color};padding:6px 11px;`">
                {{ useCategoryColor(featured.category).label.toUpperCase() }}
              </span>
              <span class="absolute font-mono text-[10px] rounded-[5px]" style="left:18px;bottom:14px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.25);padding:5px 9px;">PHOTO — {{ featured.title.toUpperCase() }}</span>
            </div>
            <div style="padding:24px;">
              <div class="font-mono text-[11px] tracking-[.06em] text-muted mb-2">{{ fmtDate(featured.date) }}</div>
              <h3 style="font:700 24px/1.2 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;letter-spacing:-.01em;">{{ featured.title }}</h3>
              <p style="font:400 15px/1.55 'Hanken Grotesk';color:#5C6E78;margin:0 0 18px;">{{ featured.excerpt }}</p>
              <span class="arrow-row inline-flex items-center gap-2" style="font:600 14.5px 'Hanken Grotesk';color:#1F6FB2;">Read highlight <span class="arr">→</span></span>
            </div>
          </NuxtLink>

          <!-- Side stack -->
          <div class="flex flex-col gap-[14px]">
            <NuxtLink v-for="h in sideHighlights" :key="h.slug" :to="`/about/impact/${h.slug}`"
              class="card-lift bg-white rounded-card flex-1 flex flex-col"
              style="border:1px solid rgba(15,33,43,.1);padding:18px 20px;text-decoration:none;min-height:0;">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-mono font-bold tracking-[.08em] text-white rounded-[4px]" :style="`font-size:10px;background:${useCategoryColor(h.category).color};padding:3px 8px;`">
                  {{ useCategoryColor(h.category).label.toUpperCase() }}
                </span>
                <span class="font-mono text-[10px] text-muted">{{ fmtDate(h.date) }}</span>
              </div>
              <h3 style="font:700 17px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 6px;flex:1;">{{ h.title }}</h3>
              <span class="arrow-row inline-flex items-center gap-1 mt-2" style="font:600 13px 'Hanken Grotesk';color:#1F6FB2;">Read <span class="arr">→</span></span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Get involved: Events + Cyberseminar ── -->
    <section class="mx-auto" style="max-width:1240px;padding:78px 40px;">
      <div class="rgrid rgrid-split" style="display:grid;gap:48px;--cols:1fr 1fr;">

        <!-- Events -->
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Get involved</span>
          <h2 style="font:700 clamp(22px,2.4vw,32px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:14px 0 24px;">Upcoming events.</h2>
          <div class="flex flex-col gap-[1px]" style="background:rgba(15,33,43,.08);border-radius:10px;overflow:hidden;">
            <div v-for="e in upcomingEvents" :key="e.slug" class="bg-paper flex gap-4 items-start" style="padding:16px 18px;">
              <div class="text-center flex-none rounded-[6px] bg-navy text-white" style="width:44px;padding:7px 4px;">
                <div class="font-mono font-bold" style="font-size:10px;color:#7fc0ee;letter-spacing:.06em;">{{ fmtEventMon(e.start) }}</div>
                <div style="font:700 22px 'Schibsted Grotesk';line-height:1;">{{ fmtEventDay(e.start) }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/community/events/${e.slug}`" style="font:600 14.5px 'Hanken Grotesk';color:#0F2E44;text-decoration:none;" class="hover:text-water transition-colors">{{ e.title }}</NuxtLink>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="font-mono text-[11px] text-muted">{{ e.location?.city || (e.location?.mode === 'virtual' ? 'Virtual' : '') }}</span>
                  <span class="font-mono text-[10px] rounded-[4px]" style="background:rgba(31,111,178,.09);color:#1F6FB2;padding:2px 7px;">{{ e.location?.mode }}</span>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink to="/community/events" class="arrow-row inline-flex items-center gap-2 mt-5" style="font:600 14.5px 'Hanken Grotesk';color:#1F6FB2;">All events <span class="arr">→</span></NuxtLink>
        </div>

        <!-- Latest cyberseminar -->
        <div v-if="latestSeminar">
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Latest recording</span>
          <h2 style="font:700 clamp(22px,2.4vw,32px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:14px 0 24px;">Cyberseminar archive.</h2>
          <NuxtLink to="/learn-train/cyberseminars" class="card-lift block bg-white rounded-card overflow-hidden" style="border:1px solid rgba(15,33,43,.1);text-decoration:none;">
            <div class="relative flex items-center justify-center" style="height:180px;background:linear-gradient(155deg,#10324c,#1F6FB2);">
              <div class="rounded-full bg-white flex items-center justify-center" style="width:52px;height:52px;opacity:.9;">
                <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="7,4 17,10 7,16" fill="#0F2E44"/></svg>
              </div>
              <span v-if="latestSeminar.has_transcript" class="absolute font-mono font-bold text-[10px] tracking-[.06em] rounded-[4px]" style="right:14px;top:14px;background:rgba(31,159,85,.9);color:#fff;padding:4px 8px;">TRANSCRIPT ✓</span>
              <span class="absolute font-mono text-[10px] rounded-[5px]" style="left:14px;bottom:12px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.25);padding:5px 9px;">{{ latestSeminar.series }}</span>
            </div>
            <div style="padding:18px 20px;">
              <div class="font-mono text-[10px] tracking-[.06em] text-muted mb-2">{{ latestSeminar.date }}</div>
              <h3 style="font:700 17px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 8px;">{{ latestSeminar.title }}</h3>
              <p style="font:400 13.5px/1.5 'Hanken Grotesk';color:#5C6E78;margin:0 0 14px;" class="line-clamp-2">{{ latestSeminar.description }}</p>
              <span class="arrow-row inline-flex items-center gap-2" style="font:600 13.5px 'Hanken Grotesk';color:#1F6FB2;">Browse archive <span class="arr">→</span></span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── Newsletter CTA ── -->
    <section class="bg-navy">
      <div class="mx-auto rgrid rgrid-split" style="max-width:1240px;padding:64px 40px;display:grid;gap:48px;align-items:center;--cols:1fr 1fr;">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#e0a384;">Stay connected</span>
          <h2 style="font:700 clamp(26px,2.8vw,38px)/1.1 'Schibsted Grotesk';color:#fff;letter-spacing:-.016em;margin:14px 0 10px;">Water science news, monthly.</h2>
          <p style="font:400 15px/1.55 'Hanken Grotesk';color:#7fa4bf;max-width:440px;">Programs, funding opportunities, community spotlights, and research updates — no spam, unsubscribe anytime.</p>
        </div>
        <div class="flex gap-3">
          <input type="email" placeholder="your@university.edu"
            class="flex-1 rounded-btn text-ink bg-white"
            style="font:400 14px 'Hanken Grotesk';padding:14px 16px;border:none;outline:none;min-width:0;" />
          <button class="flex-none rounded-btn font-semibold text-white" style="font:600 15px 'Hanken Grotesk';background:#C0603C;padding:14px 24px;border:none;cursor:pointer;white-space:nowrap;">Subscribe</button>
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
