<script setup lang="ts">
useHead({
  title: 'Member Portal',
  meta: [{ name: 'description', content: 'Member representative directory and resources for CUAHSI member institutions.' }]
})

// This page is intentionally NOT gated in the frontend — a client-side password
// check cannot actually protect the data below, since static-generated pages ship
// all content in the build regardless of any JS gate. Access to this route should
// be restricted at the edge (e.g. Cloudflare Access) before this page is public.

const { data: repsData } = await useAsyncData('member-reps', () =>
  queryContent('members/reps').findOne().catch(() => null)
)

const reps = computed<any[]>(() => {
  const body = repsData.value?.body
  return Array.isArray(body) ? body : []
})

const query = ref('')

const filtered = computed(() => {
  if (!query.value.trim()) return reps.value
  const q = query.value.toLowerCase()
  return reps.value.filter(r =>
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
    r.institution.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q)
  )
})

// Group filtered reps by institution, alphabetically
const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const r of filtered.value) {
    if (!map[r.institution]) map[r.institution] = []
    map[r.institution].push(r)
  }
  return Object.keys(map).sort().map(inst => ({ institution: inst, reps: map[inst] }))
})

const institutionCount = computed(() => new Set(reps.value.map(r => r.institution)).size)

const resources = [
  { title: 'Meeting minutes', desc: 'Notes from CUAHSI Membership Meetings and Board sessions.', status: 'coming soon' },
  { title: 'Governance documents', desc: 'Bylaws, committee charters, and election procedures.', status: 'coming soon' },
  { title: 'Change your representatives', desc: 'Forms to update your institution\u2019s designated CUAHSI representatives.', status: 'coming soon' },
  { title: 'Member-only mailing list', desc: 'Sign up for representative-only announcements and discussion.', status: 'coming soon' },
]
</script>

<template>
  <div>
    <PageHero section-class="hero-section" container-class="mx-auto site-container max-w-site pt-[64px] pb-[44px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[16px_0_14px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[600px]">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-clay">Member Portal</span>
      </template>
      <template #title>
        For CUAHSI member representatives.
      </template>
      <template #lead>
        A directory of member representatives and resources for the {{ institutionCount }} institutions that make up CUAHSI.
      </template>
    </PageHero>

    <div class="mx-auto site-container max-w-site pt-[52px]">

      <!-- Resources -->
      <div class="mb-12">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Member resources</p>
        <div class="grid grid-cols-[1fr] gap-[18px] min-[641px]:grid-cols-[1fr_1fr] min-[901px]:grid-cols-[repeat(4,1fr)]">
          <div v-for="r in resources" :key="r.title" class="rounded-card border border-[rgba(15,33,43,.1)] p-[18px]">
            <p class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-navy m-[0_0_6px]">{{ r.title }}</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.5] text-muted m-[0_0_10px]">{{ r.desc }}</p>
            <span class="font-mono text-[10px] text-[#C2410C] bg-[#FFF7ED] p-[2px_8px] rounded-[99px]">{{ r.status }}</span>
          </div>
        </div>
      </div>

      <!-- Rep directory -->
      <div class="pb-[80px]">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
          <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px]">Member representative directory</p>
          <input v-model="query" type="text" aria-label="Search member representatives" placeholder="Search name, institution, or email…"
            class="border border-[rgba(15,33,43,.15)] rounded-[8px] p-[9px_12px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] w-[280px]" />
        </div>
        <p class="font-mono text-[11px] text-muted mb-5">{{ filtered.length }} representative{{ filtered.length === 1 ? '' : 's' }} across {{ grouped.length }} institution{{ grouped.length === 1 ? '' : 's' }}</p>

        <!-- One compact row per institution: the name on the left, its representatives flowing across on the right
             (on a phone the name sits above them). Was a heading plus a card per representative. -->
        <ul v-if="grouped.length" role="list" class="list-none p-0 m-0 border border-[rgba(15,33,43,.1)] rounded-[8px] overflow-hidden">
          <li v-for="group in grouped" :key="group.institution"
            class="p-[8px_14px] border-b border-b-[rgba(15,33,43,.08)] last:border-b-0 odd:bg-[rgba(15,33,43,.025)] min-[641px]:grid min-[641px]:grid-cols-[240px_minmax(0,1fr)] min-[641px]:gap-x-[16px] min-[641px]:items-baseline">
            <p class="font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[1.35] text-navy m-0">{{ group.institution }}</p>
            <ul role="list" class="list-none p-0 m-[2px_0_0] min-[641px]:m-0 flex flex-wrap gap-x-[22px] gap-y-[2px]">
              <li v-for="rep in group.reps" :key="rep.email" class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.45] text-ink">
                {{ rep.first_name }} {{ rep.last_name }}
                <a :href="`mailto:${rep.email}`" class="font-mono text-[11px] text-water break-all">{{ rep.email }}</a>
              </li>
            </ul>
          </li>
        </ul>

        <p v-if="!filtered.length" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-muted p-[24px_0]">No representatives match "{{ query }}".</p>
      </div>
    </div>
  </div>
</template>
