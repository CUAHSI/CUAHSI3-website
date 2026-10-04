<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { useCategoryColor } = await import('~/composables/useCategoryColor')
const { data: item } = await useAsyncData(`highlight-${slug}`, () =>
  queryContent('research').where({ slug, published: true }).findOne().catch(() => null)
)
const notFound = computed(() => !item.value || !item.value._path?.startsWith('/research/'))
useHead({ title: computed(() => item.value?.title ?? 'Not found') })
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
</script>
<template>
  <div>
    <div v-if="notFound" class="mx-auto text-center max-w-[720px] p-[80px_40px]">
      <NuxtLink to="/about/impact" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water">← Back to Impact</NuxtLink>
    </div>
    <div v-else-if="item">
      <PageHero container-class="mx-auto max-w-site p-[52px_40px_48px]"
        title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-.018em] text-navy max-w-[760px] m-[0_0_16px]"
        lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[640px]">
        <template #before>
          <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about/impact" class="text-muted">← Impact</NuxtLink></p>
          <div class="flex items-center gap-3 mb-4">
            <span class="font-mono font-bold text-white rounded-[5px]" :style="`font-size:11px;background:${useCategoryColor(item.category).color};padding:5px 11px;`">{{ useCategoryColor(item.category).label.toUpperCase() }}</span>
            <span class="font-mono text-[11px] text-muted">{{ fmtDate(item.date) }}</span>
          </div>
        </template>
        <template #title>{{ item.title }}</template>
        <template #lead>{{ item.excerpt }}</template>
      </PageHero>
      <div class="mx-auto max-w-[760px] p-[52px_40px_80px]">
        <ContentRenderer v-if="item.body?.children?.length" :value="item" class="program-prose" />
        <p v-else class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.75] text-[#3a4d57]">{{ item.excerpt }}</p>
        <div class="mt-10 pt-8 border-t border-t-[rgba(15,33,43,.08)]">
          <NuxtLink to="/about/impact" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water"><span class="[transform:scaleX(-1)] inline-block">→</span> All impact stories</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
