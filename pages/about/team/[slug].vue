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
useHead({ title: computed(() => person.value ? `${person.value.name} · CUAHSI` : 'Not found') })
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
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
</script>
<template>
  <div>
    <div v-if="notFound" class="mx-auto text-center" style="max-width:720px;padding:80px 40px;">
      <p class="font-mono text-muted mb-3" style="font-size:14px;">404</p>
      <NuxtLink to="/about/team" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;">← Back to team</NuxtLink>
    </div>
    <div v-else-if="person">
      <PageHero container-class="mx-auto rgrid rgrid-split" container-style="max-width:1240px;padding:52px 40px 48px;display:grid;gap:40px;align-items:start;--cols:auto 1fr;">
        <div class="rounded-full overflow-hidden flex-none" style="width:120px;height:120px;background:#F3EEE4;">
          <img v-if="person.photo" :src="person.photo" :alt="person.name" style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
          <div v-else class="w-full h-full flex items-center justify-center" style="font:700 36px 'Schibsted Grotesk';color:#5C6E78;">{{ person.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2) }}</div>
        </div>
        <div>
          <p class="font-mono text-[11px] text-muted mb-2"><NuxtLink to="/about/team" style="color:#5C6E78;">← Team</NuxtLink></p>
          <div class="flex items-baseline gap-3 flex-wrap">
            <h1 style="font:700 clamp(28px,3.5vw,42px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.018em;">{{ person.name }}</h1>
            <span v-if="person.pronouns" class="font-mono text-[12px] text-muted">{{ person.pronouns }}</span>
          </div>
          <p style="font:400 15px 'Hanken Grotesk';color:#5C6E78;margin:4px 0 14px;">{{ person.role }}</p>
          <div class="flex gap-3 flex-wrap">
            <a v-if="person.links?.orcid" :href="person.links.orcid" target="_blank" class="font-mono font-bold text-[10px] rounded" style="color:#A6CE39;border:1px solid #A6CE39;padding:3px 8px;">iD</a>
            <a v-if="person.links?.google_scholar" :href="person.links.google_scholar" target="_blank" style="font:500 12px 'Hanken Grotesk';color:#4285F4;">Scholar</a>
            <a v-if="person.links?.github" :href="person.links.github" target="_blank" style="font:500 12px 'Hanken Grotesk';color:#5C6E78;">GitHub</a>
            <a v-if="person.links?.linkedin" :href="person.links.linkedin" target="_blank" style="font:500 12px 'Hanken Grotesk';color:#0A66C2;">LinkedIn</a>
          </div>
        </div>
      </PageHero>
      <div class="mx-auto rgrid rgrid-split" style="max-width:1024px;padding:48px 40px 80px;display:grid;gap:48px;--cols:minmax(0,1fr) 220px;">
        <div>
          <p style="font:400 15px/1.75 'Hanken Grotesk';color:#3a4d57;margin-bottom:24px;">{{ person.bio }}</p>
          <p v-if="person.fun_fact" style="font:400 14px/1.65 'Hanken Grotesk';color:#5C6E78;margin-bottom:24px;padding:16px;background:#F3EEE4;border-radius:8px;"><strong style="color:#15212B;">Fun fact:</strong> {{ person.fun_fact }}</p>
          <div v-if="extendedProfile?.body?.children?.length" style="margin-bottom:24px;">
            <ContentRenderer :value="extendedProfile" class="profile-prose" />
          </div>
          <!-- Related highlights -->
          <div v-if="relatedHighlights?.length" class="mt-8">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">Research highlights</p>
            <div class="flex flex-col gap-3">
              <NuxtLink v-for="h in relatedHighlights" :key="h.slug" :to="`/highlights/${h.slug}`"
                class="arrow-row flex items-baseline gap-3 rounded-[8px]" style="padding:12px 14px;border:1px solid rgba(15,33,43,.08);text-decoration:none;">
                <span class="font-mono text-[10px] text-muted flex-none">{{ h.year }}</span>
                <span style="font:600 13.5px 'Hanken Grotesk';color:#0F2E44;flex:1;line-height:1.3;">{{ h.title }}</span>
                <span class="arr text-water" style="font-size:14px;">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
        <!-- Sidebar -->
        <div>
          <div v-if="relatedNewsletters?.length" class="rounded-[10px] mb-4" style="border:1px solid rgba(15,33,43,.1);padding:16px;">
            <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3" style="font-size:10px;">Newsletter appearances</p>
            <NuxtLink v-for="n in relatedNewsletters" :key="n.slug" :to="`/community/newsletter/${n.slug}`"
              class="block py-2 arrow-row" style="font:400 12.5px 'Hanken Grotesk';color:#1F6FB2;text-decoration:none;border-bottom:1px solid rgba(15,33,43,.06);">
              {{ n.title }}
            </NuxtLink>
          </div>
          <div v-if="relatedSeminars?.length" class="rounded-[10px]" style="border:1px solid rgba(15,33,43,.1);padding:16px;">
            <p class="font-mono font-bold tracking-[.08em] uppercase text-muted mb-3" style="font-size:10px;">Cyberseminars</p>
            <NuxtLink v-for="s in relatedSeminars" :key="s.slug" :to="`/learn-train/cyberseminars`"
              class="block py-2" style="font:400 12.5px 'Hanken Grotesk';color:#1F6FB2;text-decoration:none;border-bottom:1px solid rgba(15,33,43,.06);">
              {{ s.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
