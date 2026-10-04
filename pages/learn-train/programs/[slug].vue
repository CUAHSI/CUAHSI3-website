<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { data: program } = await useAsyncData(`program-${slug}`, () =>
  queryContent('programs').where({ slug, published: true }).findOne().catch(() => null)
)
const notFound = computed(() => !program.value)
useHead({ title: computed(() => program.value ? program.value.title : 'Not found') })
</script>
<template>
  <div>
    <div v-if="notFound" class="mx-auto text-center" style="max-width:720px;padding:80px 40px;">
      <NuxtLink to="/learn-train#programs" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;">← Back to Learn & Train</NuxtLink>
    </div>
    <div v-else-if="program">
      <PageHero container-class="mx-auto site-container" container-style="max-width:1240px;padding-top:52px;padding-bottom:48px;"
        lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:600px;margin-bottom:16px;">
        <template #before>
          <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/learn-train#programs" style="color:#5C6E78;">← Learn &amp; Train</NuxtLink></p>
          <div class="flex items-baseline gap-3 mb-3 flex-wrap">
            <h1 style="font:700 clamp(28px,3.5vw,44px)/1.1 'Schibsted Grotesk';letter-spacing:-.018em;color:#0F2E44;">{{ program.title }}</h1>
            <span v-if="program.abbreviation" class="font-mono text-[15px] text-muted">{{ program.abbreviation }}</span>
          </div>
        </template>
        <template #lead>{{ program.excerpt }}</template>
        <div class="flex gap-2 flex-wrap">
          <span v-if="program.season" class="font-mono text-[11px] rounded-[5px]" style="background:rgba(15,33,43,.07);color:#5C6E78;padding:5px 10px;">{{ program.season }}</span>
          <span v-for="a in program.audience" :key="a" class="font-mono text-[11px] rounded-[5px]" style="background:rgba(31,111,178,.09);color:#1F6FB2;padding:5px 10px;">{{ a.replace(/-/g,' ') }}</span>
        </div>
      </PageHero>
      <div class="mx-auto site-container" style="max-width:1240px;padding-top:52px;padding-bottom:80px;">
        <div class="rgrid rgrid-split" style="display:grid;gap:48px;--cols:minmax(0,1fr) 240px;">
          <div>
            <ContentRenderer :value="program" class="program-prose" />
          </div>
          <div>
            <div class="rounded-[12px] mb-4" style="border:1px solid rgba(15,33,43,.1);padding:20px;">
              <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-4" style="font-size:10px;">Program details</p>
              <div class="flex flex-col gap-4">
                <div v-if="program.season"><p class="font-mono text-[10px] text-muted mb-1">WHEN</p><p style="font:400 13.5px 'Hanken Grotesk';color:#3a4d57;">{{ program.season }}</p></div>
                <div v-if="program.partners?.length"><p class="font-mono text-[10px] text-muted mb-1">PARTNERS</p><p style="font:400 13px/1.5 'Hanken Grotesk';color:#3a4d57;">{{ program.partners.join(' · ') }}</p></div>
                <div v-if="program.funding"><p class="font-mono text-[10px] text-muted mb-1">FUNDING</p><p style="font:400 13px/1.5 'Hanken Grotesk';color:#3a4d57;">{{ program.funding }}</p></div>
                <div v-if="program.contact"><p class="font-mono text-[10px] text-muted mb-1">CONTACT</p><a :href="`mailto:${program.contact}`" style="font:400 13px 'Hanken Grotesk';color:#1F6FB2;">{{ program.contact }}</a></div>
              </div>
            </div>
            <div class="rounded-[12px]" style="border:1px solid rgba(15,33,43,.1);padding:20px;">
              <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3" style="font-size:10px;">See also</p>
              <NuxtLink to="/about/impact" class="block py-2 arrow-row" style="font:500 13.5px 'Hanken Grotesk';color:#1F6FB2;border-bottom:1px solid rgba(15,33,43,.06);">Program highlights →</NuxtLink>
              <NuxtLink to="/learn-train/archive" class="block py-2 arrow-row" style="font:500 13.5px 'Hanken Grotesk';color:#1F6FB2;border-bottom:1px solid rgba(15,33,43,.06);">Workshop archive →</NuxtLink>
              <NuxtLink to="/community/newsletter" class="block py-2 arrow-row" style="font:500 13.5px 'Hanken Grotesk';color:#1F6FB2;">Newsletter archive →</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
