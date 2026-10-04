<script setup lang="ts">
useHead({
  title: 'Data & Computing',
  meta: [{ name: 'description', content: 'HydroShare, JupyterHub, and the water data tools built for the hydrologic science community.' }]
})

// Query all impact entries once, filter per-tool by matching tag below
const { data: allImpact } = await useAsyncData('data-related-impact', () =>
  queryContent('research').where({ published: true }).sort({ date: -1 }).find()
)
function relatedImpact(impactTag: string) {
  return (allImpact.value ?? []).filter(h => h.tags?.includes(impactTag)).slice(0, 2)
}
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

const tools = [
  {
    name: 'HydroShare',
    impactTag: 'hydroshare',
    kicker: 'DATA REPOSITORY',
    tagline: 'Publish, share, and collaborate on hydrologic data and models with a citable DOI.',
    points: ['Mint DOIs for datasets and models', 'Group spaces for labs and courses', 'Versioning and granular access control'],
    tags: ['Repository', 'DOI', 'Open data'],
    cta: 'Open HydroShare',
    href: 'https://www.hydroshare.org',
  },
  {
    name: 'CUAHSI JupyterHub',
    impactTag: 'jupyterhub',
    kicker: 'CLOUD COMPUTE',
    tagline: 'Cloud notebooks for hydrologic analysis — no local setup, ready in seconds.',
    points: ['Pre-built hydrology environments', 'Large-memory options for big runs', 'Share notebooks as HydroShare resources'],
    tags: ['Python', 'R', 'Cloud'],
    cta: 'Launch compute',
    href: 'https://jupyter.cuahsi.org',
  },
  {
    name: 'Water Services',
    impactTag: 'water-data-services',
    kicker: 'TIME-SERIES DATA',
    tagline: 'Discover and access national time-series water data — map-based search, standardized WaterOneFlow/WaterML services, and export to common formats.',
    points: ['Map-based discovery by location, variable, and date range', 'WaterOneFlow web services with standardized WaterML output', 'Connects to national observation networks'],
    tags: ['WaterML', 'Time series', 'WaterOneFlow', 'Map', 'Discovery'],
    cta: 'Explore Water Services',
    href: 'https://data.cuahsi.org/',
    deprecation: 'This service is being deprecated and replaced by a community-hosted, open-source sensor data management platform — free for member institutions running small sensor deployments. More details coming as the transition takes shape.',
  },
  {
    name: 'MATLAB Online',
    impactTag: 'matlab',
    kicker: 'MEMBER BENEFIT',
    tagline: 'Free browser-based access to MATLAB for member institutions — no install, toolboxes included.',
    points: ['Browser-based, nothing to install', 'Common toolboxes included', 'Free for member institutions'],
    tags: ['License', 'Member benefit'],
    cta: 'Learn more',
    href: 'https://www.cuahsi.org/matlab',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 52px;"
      title-style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;"
      lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">
      <template #kicker>Data &amp; Computing</template>
      <template #title>Tools built for water science.</template>
      <template #lead>CUAHSI operates open infrastructure for the water science community — from data publication and cloud computing to national data discovery.</template>
    </PageHero>

    <!-- Stats band -->
    <StatsBand />

    <!-- Tool rows -->
    <div class="mx-auto" style="max-width:1240px;padding:0 40px;">
      <div v-for="(t, i) in tools" :key="t.name" class="rgrid rgrid-split"
        :style="`--cols:1fr 1fr;gap:64px;align-items:center;padding:72px 0;${i < tools.length - 1 ? 'border-bottom:1px solid rgba(15,33,43,.08);' : ''}`">
        <!-- Left: content -->
        <div :style="i % 2 === 1 ? 'order:2;' : ''">
          <div class="font-mono font-bold tracking-[.12em] uppercase text-water" style="font-size:11px;margin-bottom:14px;">{{ t.kicker }}</div>
          <h2 style="font:700 clamp(28px,3vw,38px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:0 0 14px;">{{ t.name }}</h2>
          <p style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;margin:0 0 24px;">{{ t.tagline }}</p>
          <ul class="flex flex-col gap-[10px] mb-6" style="list-style:none;padding:0;margin:0;">
            <li v-for="pt in t.points" :key="pt" class="flex items-start gap-3" style="font:400 14.5px 'Hanken Grotesk';color:#3a4d57;">
              <span class="rounded-full flex-none mt-[6px]" style="width:7px;height:7px;background:#2A86C9;"></span>
              {{ pt }}
            </li>
          </ul>
          <div class="flex gap-[8px] flex-wrap mb-6">
            <span v-for="tag in t.tags" :key="tag" class="font-mono text-[11px]" style="color:#1F6FB2;background:rgba(31,111,178,.09);padding:5px 10px;border-radius:5px;">{{ tag }}</span>
          </div>
          <div v-if="t.deprecation" class="rounded-[10px] mb-6" style="background:#FFF7ED;border:1px solid #FDBA74;padding:14px 16px;">
            <p class="font-mono font-bold tracking-[.06em] uppercase" style="font-size:10px;color:#C2410C;margin-bottom:6px;">Service transition planned</p>
            <p style="font:400 13px/1.55 'Hanken Grotesk';color:#7C2D12;margin:0;">{{ t.deprecation }}</p>
          </div>
          <a :href="t.href" target="_blank" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold" style="font:600 15px 'Hanken Grotesk';padding:13px 22px;">
            {{ t.cta }} <span class="arr">→</span>
          </a>
        </div>
        <!-- Right: screenshot placeholder -->
        <div :style="i % 2 === 1 ? 'order:1;' : ''">
          <div class="relative rounded-[12px] overflow-hidden"
            style="height:330px;background:repeating-linear-gradient(135deg,#e7eef3 0 14px,#dfe8ee 14px 28px);box-shadow:0 20px 48px -24px rgba(15,46,68,.22);border:1px solid rgba(15,33,43,.08);">
            <span class="absolute font-mono tracking-[.06em]" style="left:14px;bottom:14px;font-size:10px;color:#43657c;background:rgba(255,255,255,.9);padding:6px 10px;border-radius:5px;">SCREENSHOT — {{ t.name.toUpperCase() }}</span>
          </div>
          <!-- Related impact -->
          <div v-if="relatedImpact(t.impactTag).length" class="rg-2" style="margin-top:16px;">
            <NuxtLink v-for="h in relatedImpact(t.impactTag)" :key="h.slug" :to="`/about/impact/${h.slug}`"
              class="arrow-row" style="border:1px solid rgba(15,33,43,.1);border-radius:10px;padding:14px 16px;text-decoration:none;display:block;">
              <p class="font-mono text-[10px] text-muted mb-1">{{ fmtDate(h.date) }}</p>
              <p style="font:500 13px/1.35 'Hanken Grotesk';color:#0F2E44;">{{ h.title }} <span class="arr" style="color:#1F6FB2;">→</span></p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Not sure panel -->
    <div class="mx-auto" style="max-width:1240px;padding:0 40px 80px;">
      <div class="rounded-[16px]" style="background:#F3EEE4;padding:48px;display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap;">
        <div>
          <h2 style="font:700 26px 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;">Not sure which tool fits your workflow?</h2>
          <p style="font:400 15px/1.55 'Hanken Grotesk';color:#5C6E78;max-width:480px;margin:0;">We can help you find the right platform for your data, compute needs, or research workflow.</p>
        </div>
        <NuxtLink to="/contact#technical" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold flex-none" style="font:600 15px 'Hanken Grotesk';padding:14px 24px;">
          Technical help <span class="arr">→</span>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style>
.card-lift { transition: transform .18s ease, box-shadow .18s ease; }
.card-lift:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(15,46,68,.35); }
.arrow-row:hover .arr { transform: translateX(5px); }
.arr { transition: transform .18s ease; display: inline-block; }
</style>
