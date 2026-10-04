<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { data: teamData } = await useAsyncData('team-profile', () =>
  queryContent('team').where({ _extension: 'json' }).findOne().catch(() => null)
)
const person = computed(() => {
  const all: any[] = Array.isArray(teamData.value?.body) ? teamData.value.body : []
  return all.find(p => p.slug === slug) ?? null
})
const notFound = computed(() => !person.value)
useHead({ title: computed(() => person.value ? person.value.name : 'Not found') })
const { data: extendedProfile } = await useAsyncData(`team-md-${slug}`, () =>
  queryContent('team').where({ slug, _extension: 'md' }).findOne().catch(() => null)
)
const { data: relatedHighlights } = await useAsyncData(`team-hi-${slug}`, () =>
  queryContent('research').where({ published: true, people_mentioned: { $contains: slug } }).sort({ date: -1 }).limit(4).find().catch(() => [])
)
const { data: relatedNewsletters } = await useAsyncData(`team-nl-${slug}`, () =>
  queryContent('newsletter').where({ published: true, people_mentioned: { $contains: slug } }).sort({ date: -1 }).limit(4).find().catch(() => [])
)
const { data: seminars } = await useAsyncData('team-seminars', () =>
  queryContent('cyberseminars').where({ published: true }).find().catch(() => [])
)
const firstName = computed(() => person.value?.name?.split(' ')[0] ?? '')
const lastName  = computed(() => person.value?.name?.split(' ').slice(-1)[0] ?? '')
const relatedSeminars = computed(() =>
  (seminars.value ?? []).filter((s: any) =>
    s.speakers?.some((sp: string) => sp.includes(firstName.value) && sp.includes(lastName.value))
  )
)
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }
</script>
<template>
  <div>
    <div v-if="notFound" class="mx-auto text-center max-w-[720px] p-[80px_40px]">
      <p class="font-mono text-muted mb-3 text-[14px]">404</p>
      <NuxtLink to="/about/team" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water">← Back to team</NuxtLink>
    </div>
    <div v-else-if="person">
      <PageHero container-class="mx-auto max-w-site p-[52px_40px_48px] grid grid-cols-[1fr] gap-[40px] [align-items:start] min-[900px]:grid-cols-[auto_1fr]">
        <div class="rounded-full overflow-hidden flex-none w-[120px] h-[120px] bg-sand">
          <img v-if="person.photo" :src="person.photo" :alt="person.name" class="w-full h-full object-cover object-[center_top]" />
          <div v-else class="w-full h-full flex items-center justify-center font-['Schibsted_Grotesk'] font-bold text-[36px] leading-[normal] text-muted">{{ person.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2) }}</div>
        </div>
        <div>
          <p class="font-mono text-[11px] text-muted mb-2"><NuxtLink to="/about/team" class="text-muted">← Team</NuxtLink></p>
          <div class="flex items-baseline gap-3 flex-wrap">
            <h1 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(28px,3.5vw,42px)] leading-[1.1] text-navy tracking-[-.018em]">{{ person.name }}</h1>
            <span v-if="person.pronouns" class="font-mono text-[12px] text-muted">{{ person.pronouns }}</span>
          </div>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[normal] text-muted m-[4px_0_14px]">{{ person.role }}</p>
          <div class="flex gap-3 flex-wrap">
            <a v-if="person.links?.orcid" :href="person.links.orcid" target="_blank" class="font-mono font-bold text-[10px] rounded text-[#A6CE39] border border-[#A6CE39] p-[3px_8px]">iD</a>
            <a v-if="person.links?.google_scholar" :href="person.links.google_scholar" target="_blank" class="font-['Hanken_Grotesk'] font-medium text-[12px] leading-[normal] text-[#2563C4]">Scholar</a>
            <a v-if="person.links?.github" :href="person.links.github" target="_blank" class="font-['Hanken_Grotesk'] font-medium text-[12px] leading-[normal] text-muted">GitHub</a>
            <a v-if="person.links?.linkedin" :href="person.links.linkedin" target="_blank" class="font-['Hanken_Grotesk'] font-medium text-[12px] leading-[normal] text-[#0A66C2]">LinkedIn</a>
          </div>
        </div>
      </PageHero>
      <div class="mx-auto max-w-[1024px] p-[48px_40px_80px] grid grid-cols-[1fr] gap-[48px] min-[900px]:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.75] text-[#3a4d57] mb-[24px]">{{ person.bio }}</p>
          <p v-if="person.fun_fact" class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-muted mb-[24px] p-[16px] bg-sand rounded-[8px]"><strong class="text-ink">Fun fact:</strong> {{ person.fun_fact }}</p>
          <div v-if="extendedProfile?.body?.children?.length" class="mb-[24px]">
            <ContentRenderer :value="extendedProfile" class="profile-prose" />
          </div>
          <!-- Related highlights -->
          <div v-if="relatedHighlights?.length" class="mt-8">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Research highlights</p>
            <div class="flex flex-col gap-3">
              <NuxtLink v-for="h in relatedHighlights" :key="h.slug" :to="`/highlights/${h.slug}`"
                class="arrow-row flex items-baseline gap-3 rounded-[8px] p-[12px_14px] border border-[rgba(15,33,43,.08)] no-underline">
                <span class="font-mono text-[10px] text-muted flex-none">{{ h.year }}</span>
                <span class="font-['Hanken_Grotesk'] font-semibold text-[13.5px] text-navy flex-1 leading-[1.3]">{{ h.title }}</span>
                <span class="arr text-water text-[14px]">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
        <!-- Sidebar -->
        <div>
          <div v-if="relatedNewsletters?.length" class="rounded-[10px] mb-4 border border-[rgba(15,33,43,.1)] p-[16px]">
            <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3 text-[10px]">Newsletter appearances</p>
            <NuxtLink v-for="n in relatedNewsletters" :key="n.slug" :to="`/community/newsletter/${n.slug}`"
              class="block py-2 arrow-row font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[normal] text-water no-underline border-b border-b-[rgba(15,33,43,.06)]">
              {{ n.title }}
            </NuxtLink>
          </div>
          <div v-if="relatedSeminars?.length" class="rounded-[10px] border border-[rgba(15,33,43,.1)] p-[16px]">
            <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3 text-[10px]">Cyberseminars</p>
            <NuxtLink v-for="s in relatedSeminars" :key="s.slug" :to="`/learn-train/cyberseminars`"
              class="block py-2 font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[normal] text-water no-underline border-b border-b-[rgba(15,33,43,.06)]">
              {{ s.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
