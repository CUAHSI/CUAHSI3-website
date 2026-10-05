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
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
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

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">
      <div class="p-[36px_0_28px] border-b-[0.5px] border-b-[#f3f4f6] mb-[28px]">
        <p class="text-[11px] text-muted mb-[8px]">
          <NuxtLink to="/community" class="no-underline text-muted">Get involved</NuxtLink> / News
        </p>
        <h1 class="text-[28px] font-medium mb-[10px]">News</h1>
        <p class="text-[14px] text-[#6b7280] leading-[1.65] max-w-[520px]">
          Platform updates, announcements, and time-sensitive news from CUAHSI.
          For deeper program coverage, see the <NuxtLink to="/community/newsletter" class="text-[#0F7A57] no-underline">monthly newsletter</NuxtLink>
          and <NuxtLink to="/highlights" class="text-[#0F7A57] no-underline">program highlights</NuxtLink>.
        </p>
      </div>

      <div class="mb-[48px]">
        <NuxtLink v-for="item in items" :key="item._path"
          :to="`/community/news/${item.slug}`"
          class="block p-[20px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
          <div class="flex gap-[8px] items-center mb-[6px] flex-wrap">
            <span v-for="tag in item.tags" :key="tag"
              :style="`font-size:11px;padding:1px 8px;border-radius:99px;font-weight:500;background:${tagColors[tag]?.bg ?? '#F3F4F6'};color:${tagColors[tag]?.text ?? '#374151'};`">
              {{ tag }}
            </span>
            <span class="text-[11px] text-muted">{{ fmtDate(item.date) }}</span>
          </div>
          <p class="text-[15px] font-medium mb-[5px] leading-[1.3]">{{ item.title }} <span class="text-[12px] text-[#0F7A57]">→</span></p>
          <p class="text-[13px] text-[#6b7280] leading-[1.6]">{{ item.excerpt }}</p>
        </NuxtLink>

        <div v-if="!items?.length" class="p-[32px_0]">
          <p class="text-[13px] text-muted">No news items yet.</p>
        </div>
      </div>

      <!-- Cross-links -->
      <div class="grid gap-[12px] mb-[48px] grid-cols-[1fr] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[1fr_1fr]">
        <NuxtLink to="/community/newsletter"
          class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[16px] no-underline text-inherit">
          <p class="text-[13px] font-medium mb-[3px]">Monthly newsletter</p>
          <p class="text-[12px] text-[#6b7280] mb-[6px]">In-depth coverage of programs, community, and events.</p>
          <p class="text-[12px] text-[#0F7A57]">Browse issues →</p>
        </NuxtLink>
        <NuxtLink to="/highlights"
          class="border-[0.5px] border-[#e5e7eb] rounded-[10px] p-[16px] no-underline text-inherit">
          <p class="text-[13px] font-medium mb-[3px]">Program highlights</p>
          <p class="text-[12px] text-[#6b7280] mb-[6px]">Research outcomes, infrastructure work, and training impact.</p>
          <p class="text-[12px] text-[#0F7A57]">Browse highlights →</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>