<script setup lang="ts">
useHead({
  title: 'Newsletter archive',
  meta: [{ name: 'description', content: 'Monthly CUAHSI e-newsletters covering water science research, program updates, community spotlights, and events.' }]
})

const { data: issues } = await useAsyncData('newsletter-archive', () =>
  queryContent('newsletter').where({ published: true }).sort({ date: -1 }).find()
)

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div>

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">
      <div class="p-[36px_0_28px] border-b-[0.5px] border-b-[#f3f4f6]">
        <p class="text-[11px] text-muted mb-[8px]">
          <NuxtLink to="/community" class="no-underline text-muted">Get involved</NuxtLink> / Newsletter
        </p>
        <h1 class="text-[28px] font-medium mb-[10px]">e-Newsletter archive</h1>
        <p class="text-[14px] text-[#6b7280] leading-[1.6] max-w-[520px] mb-[6px]">
          The monthly digest — assembled from <NuxtLink to="/community/news" class="text-[#0F7A57] no-underline">News</NuxtLink>
          and <NuxtLink to="/about/impact" class="text-[#0F7A57] no-underline">Impact</NuxtLink> entries plus a short editor's note.
          Nothing is written for the newsletter alone.
          <a href="https://visitor.r20.constantcontact.com/manage/optin?v=001XoGmI4OI3FKlGtL0BKRQ2DLNR2Q0bEzBhUSqYIzWgk0n8Oi3KvkbXGVL2E5kLnQHq-F3OY7xAs%3D" target="_blank" rel="noopener" class="text-[#0F7A57] no-underline">Subscribe ↗</a>
        </p>
      </div>

      <div class="mb-[48px]">
        <NuxtLink v-for="issue in issues" :key="issue._path"
          :to="`/community/newsletter/${issue.slug}`"
          class="flex gap-[24px] items-baseline p-[18px_0] border-b-[0.5px] border-b-[#f3f4f6] no-underline text-inherit">
          <span class="text-[12px] text-muted min-w-[96px] shrink-0">{{ fmtDate(issue.date) }}</span>
          <div class="flex-1">
            <p class="text-[14px] font-medium mb-[4px] leading-[1.35]">{{ issue.title }}</p>
            <p class="text-[13px] text-[#6b7280] leading-[1.55]">{{ issue.summary }}</p>
          </div>
          <span class="text-[12px] text-muted shrink-0">Read →</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
