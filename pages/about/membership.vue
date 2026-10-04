<script setup lang="ts">
useHead({ title: 'Membership' })

// Canonical member institution list — current as of July 2026, sourced from cuahsi.org/about/about-membership.
// The Hire CUAHSI institution lookup (pages/hire-cuahsi/index.vue) should read from this same list;
// consider extracting to a shared content/members.json if both need to stay in sync going forward.
const memberInstitutions = [
  // Graduate Institution (GI) Members
  { name: 'Arizona State University', category: 'gi' },
  { name: 'Boise State University', category: 'gi' },
  { name: 'Brigham Young University', category: 'gi' },
  { name: 'Carnegie Mellon University', category: 'gi' },
  { name: 'Clemson University', category: 'gi' },
  { name: 'Colorado School of Mines', category: 'gi' },
  { name: 'Colorado State University', category: 'gi' },
  { name: 'Cornell University', category: 'gi' },
  { name: 'Drexel University', category: 'gi' },
  { name: 'Duke University', category: 'gi' },
  { name: 'Florida International University', category: 'gi' },
  { name: 'Georgia Institute of Technology', category: 'gi' },
  { name: 'Georgia State University', category: 'gi' },
  { name: 'Idaho State University', category: 'gi' },
  { name: 'Indiana University', category: 'gi' },
  { name: 'Iowa State University', category: 'gi' },
  { name: 'Johns Hopkins University', category: 'gi' },
  { name: 'Kansas State University', category: 'gi' },
  { name: 'Kent State University', category: 'gi' },
  { name: 'Marquette University', category: 'gi' },
  { name: 'Michigan State University', category: 'gi' },
  { name: 'Michigan Technological University', category: 'gi' },
  { name: 'Montana State University', category: 'gi' },
  { name: 'New Mexico State University', category: 'gi' },
  { name: 'Northeastern University', category: 'gi' },
  { name: 'Northern Arizona University', category: 'gi' },
  { name: 'Northwestern University', category: 'gi' },
  { name: 'Oregon State University', category: 'gi' },
  { name: 'Pennsylvania State University', category: 'gi' },
  { name: 'Portland State University', category: 'gi' },
  { name: 'Princeton University', category: 'gi' },
  { name: 'Purdue University', category: 'gi' },
  { name: 'Rensselaer Polytechnic Institute', category: 'gi' },
  { name: 'Rutgers University (SUNJ)', category: 'gi' },
  { name: 'Southern Illinois University', category: 'gi' },
  { name: 'Southern Methodist University', category: 'gi' },
  { name: 'Stanford University', category: 'gi' },
  { name: 'State University of New York - Buffalo', category: 'gi' },
  { name: 'State University of New York - ESF', category: 'gi' },
  { name: 'Stevens Institute of Technology', category: 'gi' },
  { name: 'Syracuse University', category: 'gi' },
  { name: 'Temple University', category: 'gi' },
  { name: 'Texas A&M University', category: 'gi' },
  { name: 'University of Alabama', category: 'gi' },
  { name: 'University of Arizona', category: 'gi' },
  { name: 'University of Arkansas', category: 'gi' },
  { name: 'University of California - Davis', category: 'gi' },
  { name: 'University of California - Irvine', category: 'gi' },
  { name: 'University of California - Merced', category: 'gi' },
  { name: 'University of California - Riverside', category: 'gi' },
  { name: 'University of Central Florida', category: 'gi' },
  { name: 'University of Colorado - Boulder', category: 'gi' },
  { name: 'University of Delaware', category: 'gi' },
  { name: 'University of Florida', category: 'gi' },
  { name: 'University of Georgia', category: 'gi' },
  { name: 'University of Hawaii', category: 'gi' },
  { name: 'University of Houston', category: 'gi' },
  { name: 'University of Idaho', category: 'gi' },
  { name: 'University of Illinois', category: 'gi' },
  { name: 'University of Iowa', category: 'gi' },
  { name: 'University of Kansas', category: 'gi' },
  { name: 'University of Louisiana - Lafayette', category: 'gi' },
  { name: 'University of Memphis', category: 'gi' },
  { name: 'University of Michigan', category: 'gi' },
  { name: 'University of Minnesota', category: 'gi' },
  { name: 'University of Missouri', category: 'gi' },
  { name: 'University of Nebraska - Lincoln', category: 'gi' },
  { name: 'University of Nevada - Reno', category: 'gi' },
  { name: 'University of New Hampshire', category: 'gi' },
  { name: 'University of New Mexico', category: 'gi' },
  { name: 'University of North Carolina System', category: 'gi' },
  { name: 'University of Pittsburgh', category: 'gi' },
  { name: 'University of Rhode Island', category: 'gi' },
  { name: 'University of South Florida', category: 'gi' },
  { name: 'University of Tennessee - Knoxville', category: 'gi' },
  { name: 'University of Texas - Arlington', category: 'gi' },
  { name: 'University of Texas - Austin', category: 'gi' },
  { name: 'University of Utah', category: 'gi' },
  { name: 'University of Vermont', category: 'gi' },
  { name: 'University of Virginia', category: 'gi' },
  { name: 'University of Wisconsin - Madison', category: 'gi' },
  { name: 'Utah State University', category: 'gi' },
  { name: 'Villanova University', category: 'gi' },
  { name: 'Virginia Tech', category: 'gi' },
  { name: 'Washington State University', category: 'gi' },
  { name: 'Yale University', category: 'gi' },
  // Primarily Undergraduate Institution (PUI) Members
  { name: 'Eastern Illinois University', category: 'pui' },
  { name: 'Prairie View A&M University', category: 'pui' },
  { name: 'Santa Clara University', category: 'pui' },
  { name: 'Smith College', category: 'pui' },
  { name: 'University of North Georgia', category: 'pui' },
  { name: 'Utah Valley University', category: 'pui' },
  // Non-Profit Affiliate Members
  { name: 'American Institute of Hydrology', category: 'nonprofit' },
  { name: 'EarthScope', category: 'nonprofit' },
  { name: 'Interstate Council on Water Policy', category: 'nonprofit' },
  { name: 'RTI International', category: 'nonprofit' },
  { name: 'Stroud Water Research Center', category: 'nonprofit' },
  // International Affiliate Members
  { name: 'Suez Canal University', category: 'intl' },
  { name: 'University of Ljubljana', category: 'intl' },
  { name: 'University of Sidi Mohamed ben Abdellah', category: 'intl' },
  { name: 'University of Zurich', category: 'intl' },
]

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
  let items = memberInstitutions
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
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about" class="text-muted">About</NuxtLink> / Membership</p></template>
      <template #kicker>About · Membership</template>
      <template #title>Join the water science consortium.</template>
      <template #lead>CUAHSI membership connects your institution to shared infrastructure, training programs, governance, and a network of 101 member institutions advancing water science together.</template>
      <a href="mailto:membership@cuahsi.org" class="arrow-row inline-flex items-center gap-2 bg-navy text-white rounded-btn font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] p-[13px_22px]">Get in touch <span class="arr">→</span></a>
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
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px]">Member institutions · as of July 2026</p>
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
