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
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 52px;"
      title-style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;"
      lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">
      <template #kicker>Learn &amp; Train</template>
      <template #title>Training for every stage of a water science career.</template>
      <template #lead>From first-year graduate students to senior faculty, CUAHSI offers field schools, online courses, summer institutes, fellowships, and free recordings — open to all.</template>
    </PageHero>

    <StatsBand />

    <p class="mx-auto site-container" style="max-width:1240px;padding-top:20px;font:400 12.5px 'Hanken Grotesk';color:#9ca3af;">
      Training content lives here first. Scheduled instances (dates, registration) also appear on
      <NuxtLink to="/community/events" style="color:#1F6FB2;">Community → Events</NuxtLink> — same session, one canonical page.
    </p>

    <!-- Featured cyberseminar -->
    <section class="mx-auto" style="max-width:1240px;padding:64px 40px 0;">
      <div class="rgrid rgrid-split" style="display:grid;gap:56px;align-items:center;--cols:1fr 1fr;">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Cyberseminar archive</span>
          <h2 style="font:700 clamp(26px,3vw,36px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:14px 0 14px;">350+ free recordings on water science.</h2>
          <p style="font:400 15px/1.65 'Hanken Grotesk';color:#3a4d57;margin:0 0 24px;">Virtual presentations, panels, and hands-on demos on timely topics — from USGS water data APIs to machine learning for streamflow forecasting. All free, all archived.</p>
          <NuxtLink to="/learn-train/cyberseminars" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold" style="font:600 15px 'Hanken Grotesk';padding:13px 22px;">
            Browse the archive <span class="arr">→</span>
          </NuxtLink>
        </div>
        <!-- The whole picture is a link to the archive, same as the button beside it (it used to be a dead picture with a play button) -->
        <NuxtLink to="/learn-train/cyberseminars" aria-label="Browse the cyberseminar archive"
          class="card-lift relative rounded-[14px] overflow-hidden flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white" style="height:300px;background:linear-gradient(155deg,#10324c,#1F6FB2);">
          <div class="rounded-full bg-white flex items-center justify-center" style="width:60px;height:60px;opacity:.9;">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20"><polygon points="7,4 17,10 7,16" fill="#0F2E44"/></svg>
          </div>
          <span class="absolute font-mono font-bold tracking-[.1em]" style="left:18px;top:16px;font-size:10px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.22);padding:6px 10px;border-radius:5px;">CYBERSEMINAR ARCHIVE</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Programs (structured, recurring — content-driven) -->
    <section id="programs" class="mx-auto" style="max-width:1240px;padding:72px 40px 0;">
      <div class="flex justify-between items-end gap-6 mb-9 flex-wrap">
        <div>
          <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Programs</span>
          <h2 style="font:700 clamp(28px,3.2vw,40px)/1.08 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.018em;margin:14px 0 0;">Structured, recurring opportunities.</h2>
          <p style="font:400 14.5px/1.6 'Hanken Grotesk';color:#5C6E78;max-width:560px;margin-top:10px;">Annual cohort-based programs with their own application cycle, eligibility, and track record.</p>
        </div>
        <NuxtLink to="/learn-train/archive" class="arrow-row inline-flex items-center gap-2" style="font:600 15px 'Hanken Grotesk';color:#1F6FB2;">Full workshop archive <span class="arr">→</span></NuxtLink>
      </div>
      <div class="rgrid rgrid-multi" style="display:grid;gap:18px;--cols:repeat(3,1fr);">
        <NuxtLink v-for="p in programs" :key="p.slug" :to="`/learn-train/programs/${p.slug}`"
          class="card-lift arrow-row bg-white flex flex-col rounded-card"
          style="border:1px solid rgba(15,33,43,.1);padding:24px 22px 22px;text-decoration:none;">
          <span class="font-mono font-bold tracking-[.06em] uppercase text-clay" style="font-size:11px;">{{ p.abbreviation }}</span>
          <span style="font:700 20px 'Schibsted Grotesk';color:#0F2E44;margin:12px 0 8px;display:block;">{{ p.title }}</span>
          <span style="font:400 14px/1.55 'Hanken Grotesk';color:#5C6E78;flex:1;display:block;margin-bottom:16px;">{{ p.excerpt }}</span>
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] text-muted">{{ p.season }}</span>
            <span class="arrow-row inline-flex items-center gap-1" style="font:600 13.5px 'Hanken Grotesk';color:#1F6FB2;">Learn more <span class="arr">→</span></span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Other ways to learn -->
    <section class="mx-auto" style="max-width:1240px;padding:64px 40px 80px;">
      <div class="mb-9">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">Also from CUAHSI</span>
        <h2 style="font:700 clamp(26px,3vw,34px)/1.08 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:14px 0 0;">Open-access learning and support.</h2>
      </div>
      <div class="rgrid rgrid-multi" style="display:grid;gap:18px;--cols:repeat(3,1fr);">
        <template v-for="e in extras" :key="e.name">
          <a v-if="e.external" :href="e.to" target="_blank" rel="noopener"
            class="card-lift arrow-row bg-white flex flex-col rounded-card"
            style="border:1px solid rgba(15,33,43,.1);padding:24px 22px 22px;text-decoration:none;">
            <span class="font-mono font-bold tracking-[.06em] uppercase text-clay" style="font-size:11px;">{{ e.tag }}</span>
            <span style="font:700 18px 'Schibsted Grotesk';color:#0F2E44;margin:12px 0 8px;display:block;">{{ e.name }}</span>
            <span style="font:400 13.5px/1.55 'Hanken Grotesk';color:#5C6E78;flex:1;display:block;margin-bottom:16px;">{{ e.desc }}</span>
            <span class="arrow-row inline-flex items-center gap-2" style="font:600 13px 'Hanken Grotesk';color:#1F6FB2;">{{ e.cta }} <span class="arr">→</span></span>
          </a>
          <NuxtLink v-else :to="e.to"
            class="card-lift arrow-row bg-white flex flex-col rounded-card"
            style="border:1px solid rgba(15,33,43,.1);padding:24px 22px 22px;text-decoration:none;">
            <span class="font-mono font-bold tracking-[.06em] uppercase text-clay" style="font-size:11px;">{{ e.tag }}</span>
            <span style="font:700 18px 'Schibsted Grotesk';color:#0F2E44;margin:12px 0 8px;display:block;">{{ e.name }}</span>
            <span style="font:400 13.5px/1.55 'Hanken Grotesk';color:#5C6E78;flex:1;display:block;margin-bottom:16px;">{{ e.desc }}</span>
            <span class="arrow-row inline-flex items-center gap-2" style="font:600 13px 'Hanken Grotesk';color:#1F6FB2;">{{ e.cta }} <span class="arr">→</span></span>
          </NuxtLink>
        </template>
      </div>
    </section>
  </div>
</template>
