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
  title: computed(() => notFound.value ? 'Not found · CUAHSI' : `${item.value?.title} · News · CUAHSI`),
  meta: [{ name: 'description', content: computed(() => item.value?.excerpt ?? '') }]
})
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Not found state -->
    <div v-if="notFound" style="max-width:720px;margin:80px auto;padding:0 24px;text-align:center;">
      <p style="font-size:14px;color:#9ca3af;margin-bottom:12px;">404</p>
      <h1 style="font-size:22px;font-weight:500;margin-bottom:12px;">Page not found</h1>
      <p style="font-size:14px;color:#6b7280;margin-bottom:24px;">That news item doesn't exist.</p>
      <NuxtLink to="/community/news" style="font-size:13px;color:#1D9E75;text-decoration:none;">← Back to news</NuxtLink>
    </div>

    <div v-else-if="item">

    <div style="max-width:720px;margin:0 auto;padding:0 24px;">
      <div style="padding:36px 0 12px;">
        <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
          <NuxtLink to="/community/news" style="text-decoration:none;color:#9ca3af;">← News</NuxtLink>
        </p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
          <span v-for="tag in item.tags" :key="tag"
            style="font-size:11px;padding:2px 8px;border-radius:99px;background:#f3f4f6;color:#6b7280;">
            {{ tag }}
          </span>
        </div>
        <h1 style="font-size:26px;font-weight:500;line-height:1.3;margin-bottom:10px;">{{ item.title }}</h1>
        <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">
          {{ fmtDate(item.date) }}
          <span v-if="item.author"> · {{ item.author }}</span>
        </p>
      </div>

      <hr style="border:none;border-top:0.5px solid #f3f4f6;margin:0 0 28px;" />

      <!-- Body content -->
      <div v-if="item.body?.children?.length" style="margin-bottom:32px;">
        <ContentRenderer :value="item" class="news-prose" />
      </div>
      <div v-else style="margin-bottom:32px;">
        <p style="font-size:15px;color:#374151;line-height:1.75;">{{ item.excerpt }}</p>
      </div>

      <!-- External link if present -->
      <div v-if="item.source_url" style="margin-bottom:48px;padding:16px 20px;background:#f9fafb;border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <p style="font-size:13px;color:#6b7280;">Originally published on cuahsi.org</p>
        <a :href="item.source_url" target="_blank" rel="noopener"
          style="font-size:13px;font-weight:500;color:#1D9E75;text-decoration:none;white-space:nowrap;">
          Read full article ↗
        </a>
      </div>

      <div style="padding:24px 0;border-top:0.5px solid #f3f4f6;margin-bottom:48px;">
        <NuxtLink to="/community/news" style="font-size:13px;color:#1D9E75;text-decoration:none;">← Back to news</NuxtLink>
      </div>
    </div>
    </div>
  </div>
</template>
