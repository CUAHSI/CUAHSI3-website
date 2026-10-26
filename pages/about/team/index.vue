<script setup lang="ts">
useHead({ title: 'Our Team' })
const { data: teamData } = await useAsyncData('team', () =>
  queryContent('team').where({ _extension: 'json' }).findOne().catch(() => null)
)
const people = computed<any[]>(() =>
  Array.isArray(teamData.value?.body) ? teamData.value.body : []
)
const deptOrder = ['Leadership','Research','Engineering','Programs','Communications','Operations']
const byDept = computed(() => {
  const map: Record<string,any[]> = {}
  for (const p of people.value) {
    if (!map[p.department]) map[p.department] = []
    map[p.department].push(p)
  }
  return map
})
function initials(name: string) { return name.split(' ').map((n:string)=>n[0]).join('').slice(0,2) }
</script>
<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_48px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_0]">
      <template #kicker>About · Team</template>
      <template #title>The people behind CUAHSI.</template>
      <template #top><SectionNav section="about" fixed /></template>
    </PageHero>
    <div class="mx-auto max-w-site p-[48px_40px_80px]">
      <div v-for="dept in deptOrder" :key="dept">
        <div v-if="byDept[dept]?.length" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <span class="font-['Schibsted_Grotesk'] font-bold text-[13px] leading-none text-navy">{{ dept }}</span>
            <span class="font-mono text-[11px] text-muted">{{ byDept[dept].length }} people</span>
          </div>
          <div class="grid grid-cols-[1fr] gap-[16px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(4,1fr)]">
            <div v-for="person in byDept[dept]" :key="person.slug"
              class="card-lift relative bg-white rounded-card overflow-hidden border border-[rgba(15,33,43,.1)]">
              <!-- The whole card is the link: an empty link stretched over it, so keyboard and screen-reader users can open the profile -->
              <NuxtLink v-if="person.has_profile" :to="`/about/team/${person.slug}`" :aria-label="`${person.name}, view profile`"
                class="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-water"></NuxtLink>
              <!-- Photo -->
              <div class="relative h-[200px] bg-sand overflow-hidden">
                <img v-if="person.photo" :src="person.photo" :alt="`${person.name}`"
                  :key="`img-${person.slug}`"
                  class="w-full h-full object-cover object-[center_top]" />
                <div v-else class="w-full h-full flex items-center justify-center font-['Schibsted_Grotesk'] font-bold text-[32px] leading-[normal] text-muted">{{ initials(person.name) }}</div>
                <div v-if="person.has_profile" class="absolute rounded-full top-[10px] right-[10px] bg-[rgba(255,255,255,.9)] p-[3px_10px] font-['Hanken_Grotesk'] font-semibold text-[10.5px] leading-[normal] text-navy">profile →</div>
              </div>
              <!-- Info -->
              <div class="p-[14px]">
                <div class="flex items-baseline gap-2 flex-wrap mb-1">
                  <span class="font-['Schibsted_Grotesk'] font-bold text-[14px] leading-[normal] text-navy">{{ person.name }}</span>
                  <span v-if="person.pronouns" class="font-mono text-[10px] text-muted">{{ person.pronouns }}</span>
                </div>
                <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.4] text-muted">{{ person.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
