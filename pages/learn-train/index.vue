<script setup lang="ts">
useHead({ title: 'Learn & Train' })

const { data: programs } = await useAsyncData('lt-programs', () =>
  queryContent('programs').where({ published: true }).sort({ title: 1 }).find()
)

const extras = [
  { tag: 'ONLINE MODULES', name: 'HydroLearn', desc: '60+ peer-reviewed learning modules on hydrology and water resources, free and open-access.', cta: 'Explore HydroLearn', to: 'https://www.hydrolearn.org', external: true },
  { tag: 'FELLOWSHIPS', name: 'HydroInformatics Innovation Fellowship', desc: 'Seed funding for graduate students and postdocs developing innovative water informatics tools and datasets.', cta: 'See funding opportunities', to: '/community/jobs', external: false },
  { tag: 'WORKSHOPS', name: 'Campus Visits & Workshops', desc: 'Bring CUAHSI tools, training, and expertise to your institution through a structured engagement program.', cta: 'Learn about campus visits', to: '/community/campus-visits', external: false },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[560px]">
      <template #kicker>Learn &amp; Train</template>
      <template #title>Training for every stage of a water science career.</template>
      <template #lead>From first-year graduate students to senior faculty, CUAHSI offers field schools, online courses, summer institutes, fellowships, and free recordings — open to all.</template>
      <template #below><SectionNav section="learn" fixed /></template>
    </PageHero>

    <StatsBand />

    <p class="mx-auto site-container max-w-site pt-[20px] font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[normal] text-muted">
      Training content lives here first. Scheduled instances (dates, registration) also appear on
      <NuxtLink to="/community/events" class="text-water">Community → Events</NuxtLink> — same session, one canonical page.
    </p>

    <!-- Featured cyberseminar -->
    <section class="mx-auto max-w-site p-[64px_40px_0]">
      <div class="grid grid-cols-[1fr] gap-[56px] items-center min-[900px]:grid-cols-[1fr_1fr]">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Cyberseminar archive</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(26px,3vw,36px)] leading-[1.1] text-navy tracking-[-.016em] m-[14px_0_14px]">350+ free recordings on water science.</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.65] text-[#3a4d57] m-[0_0_24px]">Virtual presentations, panels, and hands-on demos on timely topics — from USGS water data APIs to machine learning for streamflow forecasting. All free, all archived.</p>
          <NuxtLink to="/learn-train/cyberseminars" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold font-['Hanken_Grotesk'] text-[15px] leading-[normal] p-[13px_22px]">
            Browse the archive <span class="arr">→</span>
          </NuxtLink>
        </div>
        <!-- The whole picture is a link to the archive, same as the button beside it (it used to be a dead picture with a play button) -->
        <NuxtLink to="/learn-train/cyberseminars" aria-label="Browse the cyberseminar archive"
          class="card-lift relative rounded-[14px] overflow-hidden flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white h-[300px] bg-[linear-gradient(155deg,#10324c,#1F6FB2)]">
          <div class="rounded-full bg-white flex items-center justify-center w-[60px] h-[60px] opacity-[.9]">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20"><polygon points="7,4 17,10 7,16" fill="#0F2E44"/></svg>
          </div>
          <span class="absolute font-mono font-bold tracking-[.1em] left-[18px] top-[16px] text-[10px] text-[rgba(255,255,255,.85)] bg-[rgba(0,0,0,.22)] p-[6px_10px] rounded-[5px]">CYBERSEMINAR ARCHIVE</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Programs (structured, recurring — content-driven) -->
    <section id="programs" class="mx-auto max-w-site p-[72px_40px_0]">
      <div class="flex justify-between items-end gap-6 mb-9 flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Programs</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.2vw,40px)] leading-[1.08] text-navy tracking-[-.018em] m-[14px_0_0]">Structured, recurring opportunities.</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.6] text-muted max-w-[560px] mt-[10px]">Annual cohort-based programs with their own application cycle, eligibility, and track record.</p>
        </div>
        <NuxtLink to="/learn-train/archive" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] text-water">Full workshop archive <span class="arr">→</span></NuxtLink>
      </div>
      <div class="grid grid-cols-[1fr] gap-[18px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
        <NuxtLink v-for="p in programs" :key="p.slug" :to="`/learn-train/programs/${p.slug}`"
          class="card-lift arrow-row bg-white flex flex-col rounded-card border border-[rgba(15,33,43,.1)] p-[24px_22px_22px] no-underline">
          <span class="font-mono font-bold tracking-[.06em] uppercase text-clay text-[11px]">{{ p.abbreviation }}</span>
          <span class="font-['Schibsted_Grotesk'] font-bold text-[20px] leading-[normal] text-navy m-[12px_0_8px] block">{{ p.title }}</span>
          <span class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.55] text-muted flex-1 block mb-[16px]">{{ p.excerpt }}</span>
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] text-muted">{{ p.season }}</span>
            <span class="arrow-row inline-flex items-center gap-1 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">Learn more <span class="arr">→</span></span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Other ways to learn -->
    <section class="mx-auto max-w-site p-[64px_40px_80px]">
      <div class="mb-9">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">Also from CUAHSI</span>
        <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(26px,3vw,34px)] leading-[1.08] text-navy tracking-[-.016em] m-[14px_0_0]">Open-access learning and support.</h2>
      </div>
      <div class="grid grid-cols-[1fr] gap-[18px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
        <template v-for="e in extras" :key="e.name">
          <a v-if="e.external" :href="e.to" target="_blank" rel="noopener"
            class="card-lift arrow-row bg-white flex flex-col rounded-card border border-[rgba(15,33,43,.1)] p-[24px_22px_22px] no-underline">
            <span class="font-mono font-bold tracking-[.06em] uppercase text-clay text-[11px]">{{ e.tag }}</span>
            <span class="font-['Schibsted_Grotesk'] font-bold text-[18px] leading-[normal] text-navy m-[12px_0_8px] block">{{ e.name }}</span>
            <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.55] text-muted flex-1 block mb-[16px]">{{ e.desc }}</span>
            <span class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water">{{ e.cta }} <span class="arr">→</span></span>
          </a>
          <NuxtLink v-else :to="e.to"
            class="card-lift arrow-row bg-white flex flex-col rounded-card border border-[rgba(15,33,43,.1)] p-[24px_22px_22px] no-underline">
            <span class="font-mono font-bold tracking-[.06em] uppercase text-clay text-[11px]">{{ e.tag }}</span>
            <span class="font-['Schibsted_Grotesk'] font-bold text-[18px] leading-[normal] text-navy m-[12px_0_8px] block">{{ e.name }}</span>
            <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.55] text-muted flex-1 block mb-[16px]">{{ e.desc }}</span>
            <span class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water">{{ e.cta }} <span class="arr">→</span></span>
          </NuxtLink>
        </template>
      </div>
    </section>
  </div>
</template>
