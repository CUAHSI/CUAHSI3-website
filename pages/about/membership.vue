<script setup lang="ts">
useHead({ title: 'Membership' })

// Member institutions: the registry (content/members/institutions.json), through composables/useMembers.ts. Listed by
// category in the order of the chips below, then A to Z.
const { institutions } = await useMembers()
const categoryOrder = ['gi', 'pui', 'nonprofit', 'intl']
const memberInstitutions = computed(() => [...institutions.value].sort((a, b) =>
  categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)))   // not localeCompare: the build and the browser may sort differently and the page then fails to hydrate

const categories = [
  { key: 'all', label: 'All' },
  { key: 'gi', label: 'Graduate Institution' },
  { key: 'pui', label: 'Primarily Undergraduate' },
  { key: 'nonprofit', label: 'Non-Profit Affiliate' },
  { key: 'intl', label: 'International Affiliate' },
]

const activeCategory = ref('all')
const query = ref('')

const filtered = computed(() => {
  let items = memberInstitutions.value
  if (activeCategory.value !== 'all') items = items.filter(i => i.category === activeCategory.value)
  if (query.value.trim()) {
    const q = query.value.toLowerCase()
    items = items.filter(i => i.name.toLowerCase().includes(q))
  }
  return items
})

function categoryLabel(key: string) {
  return categories.find(c => c.key === key)?.label ?? key
}
</script>
<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[560px] mb-[24px]">
      <template #kicker>About · Membership</template>
      <template #title>Join the water science consortium.</template>
      <template #lead>CUAHSI membership connects your institution to shared infrastructure, training programs, governance, and a network of {{ memberInstitutions.length }} member institutions advancing water science together.</template>
      <a href="mailto:membership@cuahsi.org" class="arrow-row inline-flex items-center gap-2 bg-navy text-white rounded-btn font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] p-[13px_22px]">Get in touch <span class="arr">→</span></a>
      <template #top><SectionNav section="about" fixed /></template>
    </PageHero>

    <div class="mx-auto site-container max-w-site pt-[52px] pb-[24px]">
      <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.65] text-[#3a4d57] max-w-[640px] mb-[20px]">HydroShare, JupyterHub, and MATLAB Online are free and open to the whole water science community — but membership comes with tangible advantages layered on top:</p>
      <ul class="flex flex-col gap-[10px] list-none p-0 m-0 max-w-[640px]">
        <li class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57]">
          <span class="rounded-full flex-none mt-[7px] w-[6px] h-[6px] bg-water-bright"></span>
          <span><strong class="text-ink">Priority support</strong> on HydroShare, JupyterHub, and MATLAB Online — faster turnaround on feature requests, storage upgrades, and account needs.</span>
        </li>
        <li class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57]">
          <span class="rounded-full flex-none mt-[7px] w-[6px] h-[6px] bg-water-bright"></span>
          <span><strong class="text-ink">20% off</strong> CUAHSI-run trainings and events where CUAHSI collects registration.</span>
        </li>
        <li class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57]">
          <span class="rounded-full flex-none mt-[7px] w-[6px] h-[6px] bg-water-bright"></span>
          <span><strong class="text-ink">4.2% off</strong> hourly rates on <NuxtLink to="/hire-cuahsi" class="text-water">Hire CUAHSI</NuxtLink> fee-for-service work.</span>
        </li>
        <li class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57]">
          <span class="rounded-full flex-none mt-[7px] w-[6px] h-[6px] bg-water-bright"></span>
          <span><strong class="text-ink">Representation in CUAHSI governance</strong> and priority access to new programs and pilots.</span>
        </li>
      </ul>
      <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.65] text-[#3a4d57] max-w-[640px] mb-[16px]">Member universities can also start with a free <NuxtLink to="/community/campus-visits" class="text-water">campus visit</NuxtLink> before considering fee-for-service work.</p>
      <div class="rounded-[10px] bg-sand p-[16px_20px] max-w-[640px] mb-[40px]">
        <p class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.6] text-[#3a4d57] m-0">Over the last ten years, member institutions have received <strong class="text-navy">more than $100,000</strong> in benefits and student grants through CUAHSI membership.</p>
      </div>
    </div>

    <!-- Member institution list -->
    <div class="mx-auto site-container max-w-site pb-[80px]">
      <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px]">Member institutions</p>
        <input v-model="query" type="text" aria-label="Search member institutions" placeholder="Search institutions…"
          class="border border-[rgba(15,33,43,.15)] rounded-[8px] p-[9px_12px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] w-[240px]" />
      </div>

      <div class="flex gap-[6px] flex-wrap mb-5">
        <FilterChip v-for="c in categories" :key="c.key" variant="navy" :active="activeCategory === c.key" @click="activeCategory = c.key">
          {{ c.label }}
        </FilterChip>
      </div>

      <p class="font-mono text-[11px] text-muted mb-4">{{ filtered.length }} institution{{ filtered.length === 1 ? '' : 's' }}</p>

      <div class="grid grid-cols-[1fr] min-[641px]:grid-cols-[1fr_1fr] min-[901px]:grid-cols-[repeat(3,1fr)] gap-[1px] bg-[rgba(15,33,43,.08)] rounded-[10px] overflow-hidden">
        <div v-for="m in filtered" :key="m.name" class="bg-paper p-[14px_16px]">
          <p class="font-['Hanken_Grotesk'] font-medium text-[13.5px] leading-[normal] text-ink m-[0_0_2px]">{{ m.name }}</p>
          <p v-if="activeCategory === 'all'" class="font-mono text-[10px] text-muted">{{ categoryLabel(m.category) }}</p>
        </div>
      </div>
      <p v-if="!filtered.length" class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-muted p-[20px_0]">No institutions match "{{ query }}".</p>
    </div>
  </div>
</template>
