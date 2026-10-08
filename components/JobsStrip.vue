<script setup lang="ts">
// A slim band on the home page that points at the job board: how many listings are open, the newest one, and a link.
// "Open" is the board's own rule (pages/community/jobs/index.vue): published, and no deadline or a deadline that has not passed.
// With nothing open it still shows, as a plain link to the board, so the way in is always there.
// The count is worked out again in the browser (the page's build can be days old); renderedAt is the same value the home page
// uses for its upcoming events, so the server and the first browser render agree.
const { data: jobs } = await useAsyncData('home-jobs', () =>
  queryContent('jobs').where({ published: true }).sort({ posted: -1 }).find()
)
const renderedAt = useState('home-rendered-at', () => Date.now())
onMounted(() => { renderedAt.value = Date.now() })
const open = computed(() => {
  const now = new Date(renderedAt.value)
  return (jobs.value ?? []).filter(j => !j.deadline || new Date(j.deadline) >= now)
})
const newest = computed(() => open.value[0] ?? null)
</script>

<template>
  <section aria-label="Job board" class="bg-sand border-b border-b-[rgba(15,33,43,.08)]">
    <div class="mx-auto max-w-site p-[18px_40px] flex flex-wrap items-center gap-x-[22px] gap-y-[10px]">
      <span class="font-mono font-bold tracking-[.14em] uppercase text-[#9A4524] text-[12px]">Jobs</span>
      <p v-if="newest" class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-[#3a4d57] m-0 flex-1 min-w-[240px]">
        <strong class="font-semibold text-navy">{{ open.length }} open {{ open.length === 1 ? 'position' : 'positions' }}</strong> in water science. Newest:
        <span class="text-ink">{{ newest.title }}</span>, {{ newest.organization.split(',')[0] }}.
      </p>
      <p v-else class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-[#3a4d57] m-0 flex-1 min-w-[240px]">
        Postdocs, permanent positions, fellowships and internships in water science, collected from the community.
      </p>
      <NuxtLink to="/community/jobs" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water flex-none">
        Browse the job board <span class="arr">→</span>
      </NuxtLink>
    </div>
  </section>
</template>
