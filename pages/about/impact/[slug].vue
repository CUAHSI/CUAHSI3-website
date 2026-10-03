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
    <div v-if="notFound" class="mx-auto text-center" style="max-width:720px;padding:80px 40px;">
      <NuxtLink to="/about/impact" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;">← Back to Impact</NuxtLink>
    </div>
    <div v-else-if="item">
      <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:52px 40px 48px;"
        title-style="font:700 clamp(28px,3.5vw,44px)/1.1 'Schibsted Grotesk';letter-spacing:-.018em;color:#0F2E44;max-width:760px;margin:0 0 16px;"
        lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:640px;">
        <template #before>
          <p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about/impact" style="color:#5C6E78;">← Impact</NuxtLink></p>
          <div class="flex items-center gap-3 mb-4">
            <span class="font-mono font-bold text-white rounded-[5px]" :style="`font-size:11px;background:${useCategoryColor(item.category).color};padding:5px 11px;`">{{ useCategoryColor(item.category).label.toUpperCase() }}</span>
            <span class="font-mono text-[11px] text-muted">{{ fmtDate(item.date) }}</span>
          </div>
        </template>
        <template #title>{{ item.title }}</template>
        <template #lead>{{ item.excerpt }}</template>
      </PageHero>
      <div class="mx-auto" style="max-width:760px;padding:52px 40px 80px;">
        <ContentRenderer v-if="item.body?.children?.length" :value="item" class="program-prose" />
        <p v-else style="font:400 15px/1.75 'Hanken Grotesk';color:#3a4d57;">{{ item.excerpt }}</p>
        <div class="mt-10 pt-8" style="border-top:1px solid rgba(15,33,43,.08);">
          <NuxtLink to="/about/impact" class="arrow-row inline-flex items-center gap-2" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;"><span style="transform:scaleX(-1);display:inline-block;">→</span> All impact stories</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
