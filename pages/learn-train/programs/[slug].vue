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
    <div v-if="notFound" class="mx-auto text-center max-w-[720px] p-[80px_40px]">
      <NuxtLink to="/learn-train#programs" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water">← Back to Learn & Train</NuxtLink>
    </div>
    <div v-else-if="program">
      <PageHero container-class="mx-auto site-container max-w-site pt-[52px] pb-[48px]"
        lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[600px] mb-[16px]">
        <template #before>
          <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/learn-train#programs" class="text-muted">← Learn &amp; Train</NuxtLink></p>
          <div class="flex items-baseline gap-3 mb-3 flex-wrap">
            <h1 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-.018em] text-navy">{{ program.title }}</h1>
            <span v-if="program.abbreviation" class="font-mono text-[15px] text-muted">{{ program.abbreviation }}</span>
          </div>
        </template>
        <template #lead>{{ program.excerpt }}</template>
        <div class="flex gap-2 flex-wrap">
          <span v-if="program.season" class="font-mono text-[11px] rounded-[5px] bg-[rgba(15,33,43,.07)] text-muted p-[5px_10px]">{{ program.season }}</span>
          <span v-for="a in program.audience" :key="a" class="font-mono text-[11px] rounded-[5px] bg-[rgba(31,111,178,.09)] text-[#1A5F9A] p-[5px_10px]">{{ a.replace(/-/g,' ') }}</span>
        </div>
      </PageHero>
      <div class="mx-auto site-container max-w-site pt-[52px] pb-[80px]">
        <div class="grid grid-cols-[1fr] gap-[48px] min-[900px]:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <ContentRenderer :value="program" class="program-prose" />
          </div>
          <div>
            <div class="rounded-[12px] mb-4 border border-[rgba(15,33,43,.1)] p-[20px]">
              <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-4 text-[10px]">Program details</p>
              <div class="flex flex-col gap-4">
                <div v-if="program.season"><p class="font-mono text-[10px] text-muted mb-1">WHEN</p><p class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-[#3a4d57]">{{ program.season }}</p></div>
                <div v-if="program.partners?.length"><p class="font-mono text-[10px] text-muted mb-1">PARTNERS</p><p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-[#3a4d57]">{{ program.partners.join(' · ') }}</p></div>
                <div v-if="program.funding"><p class="font-mono text-[10px] text-muted mb-1">FUNDING</p><p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-[#3a4d57]">{{ program.funding }}</p></div>
                <div v-if="program.contact"><p class="font-mono text-[10px] text-muted mb-1">CONTACT</p><a :href="`mailto:${program.contact}`" class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] text-water">{{ program.contact }}</a></div>
              </div>
            </div>
            <div class="rounded-[12px] border border-[rgba(15,33,43,.1)] p-[20px]">
              <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3 text-[10px]">See also</p>
              <NuxtLink to="/about/impact" class="block py-2 arrow-row font-['Hanken_Grotesk'] font-medium text-[13.5px] leading-[normal] text-water border-b border-b-[rgba(15,33,43,.06)]">Program highlights →</NuxtLink>
              <NuxtLink to="/learn-train/archive" class="block py-2 arrow-row font-['Hanken_Grotesk'] font-medium text-[13.5px] leading-[normal] text-water border-b border-b-[rgba(15,33,43,.06)]">Workshop archive →</NuxtLink>
              <NuxtLink to="/community/newsletter" class="block py-2 arrow-row font-['Hanken_Grotesk'] font-medium text-[13.5px] leading-[normal] text-water">Newsletter archive →</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
