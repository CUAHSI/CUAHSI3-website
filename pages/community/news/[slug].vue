<script setup lang="ts">
const route = useRoute()
const { data: item } = await useAsyncData(`news-${route.params.slug}`, () =>
  queryContent('news')
    .where({ slug: route.params.slug, published: true })
    .findOne()
    .catch(() => null)
)

const notFound = computed(() =>
  !item.value || !item.value._path?.startsWith('/news/')
)

useHead({
  title: computed(() => notFound.value ? 'Not found' : `${item.value?.title} · News`),
  meta: [{ name: 'description', content: computed(() => item.value?.excerpt ?? '') }]
})
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>
    <!-- Not found state -->
    <div v-if="notFound" class="max-w-[720px] m-[80px_auto] p-[0_24px] text-center">
      <p class="text-[14px] text-muted mb-[12px]">404</p>
      <h1 class="text-[22px] font-medium mb-[12px]">Page not found</h1>
      <p class="text-[14px] text-[#6b7280] mb-[24px]">That news item doesn't exist.</p>
      <NuxtLink to="/community/news" class="text-[13px] text-[#0F7A57] no-underline">← Back to news</NuxtLink>
    </div>

    <div v-else-if="item">

    <div class="max-w-[720px] m-[0_auto] p-[0_24px]">
      <div class="p-[36px_0_12px]">
        <p class="text-[11px] text-muted mb-[8px]">
          <NuxtLink to="/community/news" class="no-underline text-muted">← News</NuxtLink>
        </p>
        <div class="flex gap-[6px] flex-wrap mb-[12px]">
          <span v-for="tag in item.tags" :key="tag"
            class="text-[11px] p-[2px_8px] rounded-[99px] bg-[#f3f4f6] text-muted">
            {{ tag }}
          </span>
        </div>
        <h1 class="text-[26px] font-medium leading-[1.3] mb-[10px]">{{ item.title }}</h1>
        <p class="text-[13px] text-muted mb-[0]">
          {{ fmtDate(item.date) }}
          <span v-if="item.author"> · {{ item.author }}</span>
        </p>
      </div>

      <hr class="border-0 border-t-[0.5px] border-t-[#f3f4f6] m-[0_0_28px]" />

      <!-- Body content -->
      <div v-if="item.body?.children?.length" class="mb-[32px]">
        <ContentRenderer :value="item" class="news-prose" />
      </div>
      <div v-else class="mb-[32px]">
        <p class="text-[15px] text-[#374151] leading-[1.75]">{{ item.excerpt }}</p>
      </div>

      <!-- External link if present -->
      <div v-if="item.source_url" class="mb-[48px] p-[16px_20px] bg-[#f9fafb] rounded-[10px] flex items-center justify-between gap-[16px]">
        <p class="text-[13px] text-[#6b7280]">Originally published on cuahsi.org</p>
        <a :href="item.source_url" target="_blank" rel="noopener"
          class="text-[13px] font-medium text-[#0F7A57] no-underline whitespace-nowrap">
          Read full article ↗
        </a>
      </div>

      <div class="p-[24px_0] border-t-[0.5px] border-t-[#f3f4f6] mb-[48px]">
        <NuxtLink to="/community/news" class="text-[13px] text-[#0F7A57] no-underline">← Back to news</NuxtLink>
      </div>
    </div>
    </div>
  </div>
</template>
