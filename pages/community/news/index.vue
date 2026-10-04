<script setup lang="ts">
useHead({
  title: 'News',
  meta: [{ name: 'description', content: 'Announcements, platform updates, and time-sensitive news from CUAHSI.' }]
})

const { data: allItems } = await useAsyncData('news', () =>
  queryContent('news').where({ published: true }).sort({ date: -1 }).find()
)

// queryContent('news') matches by path PREFIX, and '/newsletter/...' also starts
// with the string '/news' — so without this filter, every newsletter issue leaks
// into the news list too. The trailing slash disambiguates '/news/' from '/newsletter/'.
const items = computed(() =>
  (allItems.value ?? []).filter(item => item._path?.startsWith('/news/'))
)

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const tagColors: Record<string, { bg: string, text: string }> = {
  'announcements':  { bg: '#EFF6FF', text: '#1E40AF' },
  'platforms':      { bg: '#EDE9FE', text: '#5B21B6' },
  'hydroshare':     { bg: '#DCFCE7', text: '#15803D' },
  'incident':       { bg: '#FEF2F2', text: '#991B1B' },
}
</script>

<template>
  <div>

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">
      <div style="padding:36px 0 28px;border-bottom:0.5px solid #f3f4f6;margin-bottom:28px;">
        <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
          <NuxtLink to="/community" style="text-decoration:none;color:#9ca3af;">Get involved</NuxtLink> / News
        </p>
        <h1 style="font-size:28px;font-weight:500;margin-bottom:10px;">News</h1>
        <p style="font-size:14px;color:#6b7280;line-height:1.65;max-width:520px;">
          Platform updates, announcements, and time-sensitive news from CUAHSI.
          For deeper program coverage, see the <NuxtLink to="/community/newsletter" style="color:#1D9E75;text-decoration:none;">monthly newsletter</NuxtLink>
          and <NuxtLink to="/highlights" style="color:#1D9E75;text-decoration:none;">program highlights</NuxtLink>.
        </p>
      </div>

      <div style="margin-bottom:48px;">
        <NuxtLink v-for="item in items" :key="item._path"
          :to="`/community/news/${item.slug}`"
          style="display:block;padding:20px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">
            <span v-for="tag in item.tags" :key="tag"
              :style="`font-size:11px;padding:1px 8px;border-radius:99px;font-weight:500;background:${tagColors[tag]?.bg ?? '#F3F4F6'};color:${tagColors[tag]?.text ?? '#374151'};`">
              {{ tag }}
            </span>
            <span style="font-size:11px;color:#9ca3af;">{{ fmtDate(item.date) }}</span>
          </div>
          <p style="font-size:15px;font-weight:500;margin-bottom:5px;line-height:1.3;">{{ item.title }} <span style="font-size:12px;color:#1D9E75;">→</span></p>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;">{{ item.excerpt }}</p>
        </NuxtLink>

        <div v-if="!items?.length" style="padding:32px 0;">
          <p style="font-size:13px;color:#9ca3af;">No news items yet.</p>
        </div>
      </div>

      <!-- Cross-links -->
      <div class="rgrid rgrid-multi" style="display:grid;gap:12px;--cols:1fr 1fr;margin-bottom:48px;">
        <NuxtLink to="/community/newsletter"
          style="border:0.5px solid #e5e7eb;border-radius:10px;padding:16px;text-decoration:none;color:inherit;">
          <p style="font-size:13px;font-weight:500;margin-bottom:3px;">Monthly newsletter</p>
          <p style="font-size:12px;color:#6b7280;margin-bottom:6px;">In-depth coverage of programs, community, and events.</p>
          <p style="font-size:12px;color:#1D9E75;">Browse issues →</p>
        </NuxtLink>
        <NuxtLink to="/highlights"
          style="border:0.5px solid #e5e7eb;border-radius:10px;padding:16px;text-decoration:none;color:inherit;">
          <p style="font-size:13px;font-weight:500;margin-bottom:3px;">Program highlights</p>
          <p style="font-size:12px;color:#6b7280;margin-bottom:6px;">Research outcomes, infrastructure work, and training impact.</p>
          <p style="font-size:12px;color:#1D9E75;">Browse highlights →</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>