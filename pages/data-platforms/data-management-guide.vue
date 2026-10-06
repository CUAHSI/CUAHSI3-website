<script setup lang="ts">
// The research data management guide: one markdown file, content/data-management/guide.md (pinned by path, so a second file in the
// folder cannot replace it). Until the file exists (or while it is not published) the page says the guide is being added. The
// body is rendered with .guide-prose (the profile prose rules plus numbered lists, tables, h4 and images).
useHead({
  title: 'Research data management guide',
  meta: [{ name: 'description', content: 'CUAHSI guidance on data collection plans and data management plans, and how to store, describe and share research data.' }]
})
const { data: guide } = await useAsyncData('data-management-guide', () =>
  queryContent('data-management').where({ _path: '/data-management/guide', published: true }).findOne().catch(() => null)
)
const hasBody = computed(() => Boolean(guide.value?.body?.children?.length))
</script>

<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[620px]">
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/data-platforms" class="text-muted">Data &amp; Computing</NuxtLink> / Data management guide</p></template>
      <template #kicker>Data &amp; Computing · Data management guide</template>
      <template #title>Planning for your data.</template>
      <template #lead>CUAHSI's guidance on data collection plans and data management plans, and how to store, describe and share your data.</template>
      <template #below><SectionNav section="data" fixed /></template>
    </PageHero>

    <div class="mx-auto max-w-[1024px] p-[40px_40px_80px]">
      <div v-if="hasBody">
        <ContentRenderer :value="guide" class="guide-prose" />
      </div>
      <p v-else class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57] max-w-[560px]">The guide is being added and will appear here soon.</p>
    </div>
  </div>
</template>
