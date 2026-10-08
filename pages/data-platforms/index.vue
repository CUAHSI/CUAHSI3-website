<script setup lang="ts">
useHead({
  title: 'Data & Computing',
  meta: [{ name: 'description', content: 'HydroShare, JupyterHub, and the water data tools built for the water science community.' }]
})

// Query all impact entries once, filter per-tool by matching tag below
const { data: allImpact } = await useAsyncData('data-related-impact', () =>
  queryContent('research').where({ published: true }).sort({ date: -1 }).find()
)
function relatedImpact(impactTag: string) {
  return (allImpact.value ?? []).filter(h => h.tags?.includes(impactTag)).slice(0, 2)
}
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }

const tools = [
  {
    name: 'HydroShare',
    impactTag: 'hydroshare',
    kicker: 'DATA REPOSITORY',
    tagline: 'Publish, share, and collaborate on water data and models with a citable DOI.',
    points: ['Mint DOIs for datasets and models', 'Group spaces for labs and courses', 'Versioning and granular access control'],
    tags: ['Repository', 'DOI', 'Open data'],
    cta: 'Open HydroShare',
    href: 'https://www.hydroshare.org',
  },
  {
    name: 'CUAHSI JupyterHub',
    impactTag: 'jupyterhub',
    kicker: 'CLOUD COMPUTE',
    tagline: 'Cloud notebooks for water science analysis — no local setup, ready in seconds.',
    points: ['Pre-built water science environments', 'Large-memory options for big runs', 'Share notebooks as HydroShare resources'],
    tags: ['Python', 'R', 'Cloud'],
    cta: 'Launch compute',
    href: 'https://jupyterhub.cuahsi.org',
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
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[560px]">
      <template #kicker>Data &amp; Computing</template>
      <template #title>Tools built for water science.</template>
      <template #lead>CUAHSI operates open infrastructure for the water science community — from data publication and cloud computing to national data discovery.</template>
      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[normal] text-muted m-[22px_0_0]">Also here:
        <NuxtLink to="/data-platforms/portals" class="text-water font-medium">Water data portals</NuxtLink> &nbsp;·&nbsp;
        <NuxtLink to="/data-platforms/data-management-guide" class="text-water font-medium">Data management guide</NuxtLink>
      </p>
    </PageHero>

    <!-- Stats band -->
    <StatsBand />

    <!-- Tool rows -->
    <div class="mx-auto max-w-site p-[0_40px]">
      <div v-for="(t, i) in tools" :key="t.name" class="grid grid-cols-[1fr] min-[900px]:grid-cols-[1fr_1fr] gap-[64px] items-center py-[72px]"
        :class="i < tools.length - 1 ? 'border-b border-b-[rgba(15,33,43,.08)]' : ''">
        <!-- Left: content -->
        <div :class="i % 2 === 1 ? 'order-2' : ''">
          <div class="font-mono font-bold tracking-[.12em] uppercase text-water text-[11px] mb-[14px]">{{ t.kicker }}</div>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3vw,38px)] leading-[1.1] text-navy tracking-[-.016em] m-[0_0_14px]">{{ t.name }}</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] m-[0_0_24px]">{{ t.tagline }}</p>
          <ul class="flex flex-col gap-[10px] list-none p-0 m-0">
            <li v-for="pt in t.points" :key="pt" class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal] text-[#3a4d57]">
              <span class="rounded-full flex-none mt-[6px] w-[7px] h-[7px] bg-water-bright"></span>
              {{ pt }}
            </li>
          </ul>
          <div class="flex gap-[8px] flex-wrap mb-6">
            <span v-for="tag in t.tags" :key="tag" class="font-mono text-[11px] text-[#1A5F9A] bg-[rgba(31,111,178,.09)] p-[5px_10px] rounded-[5px]">{{ tag }}</span>
          </div>
          <div v-if="t.deprecation" class="rounded-[10px] mb-6 bg-[#FFF7ED] border border-[#FDBA74] p-[14px_16px]">
            <p class="font-mono font-bold tracking-[.06em] uppercase text-[10px] text-[#C2410C] mb-[6px]">Service transition planned</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.55] text-[#7C2D12] m-0">{{ t.deprecation }}</p>
          </div>
          <a :href="t.href" target="_blank" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold font-['Hanken_Grotesk'] text-[15px] leading-[normal] p-[13px_22px]">
            {{ t.cta }} <span class="arr">→</span>
          </a>
        </div>
        <!-- Right: screenshot placeholder -->
        <div :class="i % 2 === 1 ? 'order-1' : ''">
          <div class="relative rounded-[12px] overflow-hidden h-[330px] bg-[repeating-linear-gradient(135deg,#e7eef3_0_14px,#dfe8ee_14px_28px)] [box-shadow:0_20px_48px_-24px_rgba(15,46,68,.22)] border border-[rgba(15,33,43,.08)]">
            <span class="absolute font-mono tracking-[.06em] left-[14px] bottom-[14px] text-[10px] text-[#43657c] bg-[rgba(255,255,255,.9)] p-[6px_10px] rounded-[5px]">SCREENSHOT — {{ t.name.toUpperCase() }}</span>
          </div>
          <!-- Related impact -->
          <div v-if="relatedImpact(t.impactTag).length" class="grid grid-cols-[1fr] gap-[18px] min-[641px]:grid-cols-[1fr_1fr] mt-[16px]">
            <NuxtLink v-for="h in relatedImpact(t.impactTag)" :key="h.slug" :to="`/about/impact/${h.slug}`"
              class="arrow-row border border-[rgba(15,33,43,.1)] rounded-[10px] p-[14px_16px] no-underline block">
              <p class="font-mono text-[10px] text-muted mb-1">{{ fmtDate(h.date) }}</p>
              <p class="font-['Hanken_Grotesk'] font-medium text-[13px] leading-[1.35] text-navy">{{ h.title }} <span class="arr text-water">→</span></p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Not sure panel -->
    <div class="mx-auto max-w-site p-[0_40px_80px]">
      <div class="rounded-[16px] bg-sand p-[48px] flex items-center justify-between gap-[32px] flex-wrap">
        <div>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[26px] leading-[normal] text-navy m-[0_0_10px]">Not sure which tool fits your workflow?</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.55] text-muted max-w-[480px] m-0">We can help you find the right platform for your data, compute needs, or research workflow.</p>
        </div>
        <NuxtLink to="/contact#technical" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold flex-none font-['Hanken_Grotesk'] text-[15px] leading-[normal] p-[14px_24px]">
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
