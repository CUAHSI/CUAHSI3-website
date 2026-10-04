<script setup lang="ts">
useHead({
  title: 'Newsletter archive',
  meta: [{ name: 'description', content: 'Monthly CUAHSI e-newsletters covering water science research, program updates, community spotlights, and events.' }]
})

const { data: issues } = await useAsyncData('newsletter-archive', () =>
  queryContent('newsletter').where({ published: true }).sort({ date: -1 }).find()
)

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">
      <div style="padding:36px 0 28px;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
          <NuxtLink to="/community" style="text-decoration:none;color:#9ca3af;">Get involved</NuxtLink> / Newsletter
        </p>
        <h1 style="font-size:28px;font-weight:500;margin-bottom:10px;">e-Newsletter archive</h1>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;max-width:520px;margin-bottom:6px;">
          The monthly digest — assembled from <NuxtLink to="/community/news" style="color:#1D9E75;text-decoration:none;">News</NuxtLink>
          and <NuxtLink to="/about/impact" style="color:#1D9E75;text-decoration:none;">Impact</NuxtLink> entries plus a short editor's note.
          Nothing is written for the newsletter alone.
          <a href="https://visitor.r20.constantcontact.com/manage/optin?v=001XoGmI4OI3FKlGtL0BKRQ2DLNR2Q0bEzBhUSqYIzWgk0n8Oi3KvkbXGVL2E5kLnQHq-F3OY7xAs%3D" target="_blank" rel="noopener" style="color:#1D9E75;text-decoration:none;">Subscribe ↗</a>
        </p>
      </div>

      <div style="margin-bottom:48px;">
        <NuxtLink v-for="issue in issues" :key="issue._path"
          :to="`/community/newsletter/${issue.slug}`"
          style="display:flex;gap:24px;align-items:baseline;padding:18px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
          <span style="font-size:12px;color:#9ca3af;min-width:96px;flex-shrink:0;">{{ fmtDate(issue.date) }}</span>
          <div style="flex:1;">
            <p style="font-size:14px;font-weight:500;margin-bottom:4px;line-height:1.35;">{{ issue.title }}</p>
            <p style="font-size:13px;color:#6b7280;line-height:1.55;">{{ issue.summary }}</p>
          </div>
          <span style="font-size:12px;color:#9ca3af;flex-shrink:0;">Read →</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
