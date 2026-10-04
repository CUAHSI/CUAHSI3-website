<script setup lang="ts">
useHead({ title: 'Membership · CUAHSI' })

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
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 52px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:14px 0 14px;"
      lead-style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;margin-bottom:24px;">
      <template #before><p class="font-mono text-[11px] text-muted mb-3"><NuxtLink to="/about" style="color:#5C6E78;">About</NuxtLink> / Membership</p></template>
      <template #kicker>About · Membership</template>
      <template #title>Join the water science consortium.</template>
      <template #lead>CUAHSI membership connects your institution to shared infrastructure, training programs, governance, and a network of 101 member institutions advancing water science together.</template>
      <a href="mailto:membership@cuahsi.org" class="arrow-row inline-flex items-center gap-2 bg-navy text-white rounded-btn" style="font:600 15px 'Hanken Grotesk';padding:13px 22px;">Get in touch <span class="arr">→</span></a>
    </PageHero>

    <div class="mx-auto site-container" style="max-width:1240px;padding-top:52px;padding-bottom:24px;">
      <p style="font:400 15px/1.65 'Hanken Grotesk';color:#3a4d57;max-width:640px;margin-bottom:20px;">HydroShare, JupyterHub, and MATLAB Online are free and open to the whole water science community — but membership comes with tangible advantages layered on top:</p>
      <ul class="flex flex-col gap-[10px] mb-6" style="list-style:none;padding:0;margin:0;max-width:640px;">
        <li class="flex items-start gap-3" style="font:400 15px/1.6 'Hanken Grotesk';color:#3a4d57;">
          <span class="rounded-full flex-none mt-[7px]" style="width:6px;height:6px;background:#2A86C9;"></span>
          <span><strong style="color:#15212B;">Priority support</strong> on HydroShare, JupyterHub, and MATLAB Online — faster turnaround on feature requests, storage upgrades, and account needs.</span>
        </li>
        <li class="flex items-start gap-3" style="font:400 15px/1.6 'Hanken Grotesk';color:#3a4d57;">
          <span class="rounded-full flex-none mt-[7px]" style="width:6px;height:6px;background:#2A86C9;"></span>
          <span><strong style="color:#15212B;">20% off</strong> CUAHSI-run trainings and events where CUAHSI collects registration.</span>
        </li>
        <li class="flex items-start gap-3" style="font:400 15px/1.6 'Hanken Grotesk';color:#3a4d57;">
          <span class="rounded-full flex-none mt-[7px]" style="width:6px;height:6px;background:#2A86C9;"></span>
          <span><strong style="color:#15212B;">4.2% off</strong> hourly rates on <NuxtLink to="/hire-cuahsi" style="color:#1F6FB2;">Hire CUAHSI</NuxtLink> fee-for-service work.</span>
        </li>
        <li class="flex items-start gap-3" style="font:400 15px/1.6 'Hanken Grotesk';color:#3a4d57;">
          <span class="rounded-full flex-none mt-[7px]" style="width:6px;height:6px;background:#2A86C9;"></span>
          <span><strong style="color:#15212B;">Representation in CUAHSI governance</strong> and priority access to new programs and pilots.</span>
        </li>
      </ul>
      <p style="font:400 15px/1.65 'Hanken Grotesk';color:#3a4d57;max-width:640px;margin-bottom:16px;">Member universities can also start with a free <NuxtLink to="/community/campus-visits" style="color:#1F6FB2;">campus visit</NuxtLink> before considering fee-for-service work.</p>
      <div class="rounded-[10px]" style="background:#F3EEE4;padding:16px 20px;max-width:640px;margin-bottom:40px;">
        <p style="font:400 13.5px/1.6 'Hanken Grotesk';color:#3a4d57;margin:0;">Over the last ten years, member institutions have received <strong style="color:#0F2E44;">more than $100,000</strong> in benefits and student grants through CUAHSI membership.</p>
      </div>
    </div>

    <!-- Member institution list -->
    <div class="mx-auto site-container" style="max-width:1240px;padding-bottom:80px;">
      <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted" style="font-size:11px;">Member institutions · as of July 2026</p>
        <input v-model="query" type="text" aria-label="Search member institutions" placeholder="Search institutions…"
          style="border:1px solid rgba(15,33,43,.15);border-radius:8px;padding:9px 12px;font:400 13px 'Hanken Grotesk';width:240px;" />
      </div>

      <div class="flex gap-[6px] flex-wrap mb-5">
        <FilterChip v-for="c in categories" :key="c.key" variant="navy" :active="activeCategory === c.key" @click="activeCategory = c.key">
          {{ c.label }}
        </FilterChip>
      </div>

      <p class="font-mono text-[11px] text-muted mb-4">{{ filtered.length }} institution{{ filtered.length === 1 ? '' : 's' }}</p>

      <div class="rg-3" style="gap:1px;background:rgba(15,33,43,.08);border-radius:10px;overflow:hidden;">
        <div v-for="m in filtered" :key="m.name" class="bg-paper" style="padding:14px 16px;">
          <p style="font:500 13.5px 'Hanken Grotesk';color:#15212B;margin:0 0 2px;">{{ m.name }}</p>
          <p v-if="activeCategory === 'all'" class="font-mono text-[10px]" style="color:#9ca3af;">{{ categoryLabel(m.category) }}</p>
        </div>
      </div>
      <p v-if="!filtered.length" style="font:400 13.5px 'Hanken Grotesk';color:#5C6E78;padding:20px 0;">No institutions match "{{ query }}".</p>
    </div>
  </div>
</template>
