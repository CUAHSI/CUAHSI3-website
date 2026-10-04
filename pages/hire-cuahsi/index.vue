<script setup lang="ts">
useHead({
  title: 'Hire CUAHSI',
  meta: [{ name: 'description', content: 'Computing environment setup, data wrangling, workshop logistics, and custom software integrations from CUAHSI staff — for grantees, agencies, and partners.' }]
})

// Issue 9: institution lookup replaces the plain toggle.
// Placeholder member list — swap for the real member roster from About > Membership.
const memberInstitutions = [
  { name: 'University of Vermont', since: 2004 },
  { name: 'Utah State University', since: 2001 },
  { name: 'University of Virginia', since: 2005 },
  { name: 'Colorado State University', since: 2001 },
  { name: 'University of Alabama', since: 2008 },
  { name: 'Syracuse University', since: 2007 },
  { name: 'Princeton University', since: 2010 },
]

const institutionQuery = ref('')
const matchedInstitution = ref<{ name: string; since: number } | null>(null)
const showLookupResults = ref(false)
const useLegacyToggle = ref(false) // no-JS fallback path
const isMember = ref(false) // drives the legacy toggle only

const lookupMatches = computed(() => {
  if (!institutionQuery.value.trim()) return []
  const q = institutionQuery.value.toLowerCase()
  return memberInstitutions.filter(i => i.name.toLowerCase().includes(q)).slice(0, 6)
})

const isMemberConfirmed = computed(() => !!matchedInstitution.value || (useLegacyToggle.value && isMember.value))

function selectInstitution(inst: { name: string; since: number }) {
  matchedInstitution.value = inst
  institutionQuery.value = inst.name
  showLookupResults.value = false
}
function clearInstitution() {
  matchedInstitution.value = null
  institutionQuery.value = ''
}

const selectedService = ref('DevOps & infrastructure')

const serviceDefs = [
  {
    tag: 'DEVOPS & INFRASTRUCTURE',
    accent: 'oklch(0.55 0.13 245)',
    title: 'DevOps & computing environment setup',
    desc: 'Get running on the specific model versions, environments, and datasets your research needs — including large-domain modeling frameworks and multi-terabyte datasets with real compute and storage demands.',
    bullets: ['NOAA NextGen Water Model setup & configuration', 'Large dataset access: NOAA AORC, USGS CONUS404', 'Cloud compute environment provisioning'],
    rate: 175,
    range: '$4,000 – $25,000 per engagement',
    label: 'DevOps & infrastructure',
  },
  {
    tag: 'DATA WRANGLING',
    accent: 'oklch(0.53 0.12 200)',
    title: 'Data wrangling, munging & publication formatting',
    desc: 'Hands-on help cleaning, restructuring, and formatting datasets so they meet funder sharing requirements and are genuinely ready to publish.',
    bullets: ['Format conversion & schema alignment', 'Metadata & FAIR-compliance review', 'QC on large observational records'],
    rate: 128,
    range: '$800 – $8,000 per dataset',
    label: 'Data wrangling',
  },
  {
    tag: 'EVENTS & LOGISTICS',
    accent: 'oklch(0.54 0.12 150)',
    title: 'Training workshop setup & logistics',
    desc: 'End-to-end support running a workshop or training event — recruiting participants, handling registration, and managing day-of logistics.',
    bullets: ['Participant recruiting & outreach', 'Registration & communications', 'On-site or virtual event logistics'],
    rate: 77,
    range: '$1,200 – $6,000 per workshop',
    label: 'Events & logistics',
  },
  {
    tag: 'SOFTWARE ENGINEERING',
    accent: 'oklch(0.52 0.13 290)',
    title: 'Custom software integrations',
    desc: 'Extend CUAHSI platforms or connect your systems to our data services, drawing on our software engineering team and cloud DevOps engineer.',
    bullets: ['WaterOneFlow / WaterML integrations', 'HydroShare or JupyterHub extensions', 'Rate depends on staff assigned to the project'],
    rate: 189,
    range: '$5,000 – $40,000 per project',
    label: 'Software engineering',
  },
]

function displayRate(rate: number) {
  return isMemberConfirmed.value ? Math.round(rate * 0.958) : rate
}

function selectService(label: string) {
  selectedService.value = label
}

const budgetOptions = ['Under $2,000', '$2,000 – $10,000', '$10,000 – $40,000', 'Over $40,000']

</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto site-container hero-section max-w-site pt-[64px] pb-[40px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[760px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[19px] leading-[1.55] text-[#3a4d57] max-w-[620px]">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-clay">Hire CUAHSI</span>
      </template>
      <template #title>
        Put our staff on your project.
      </template>
      <template #lead>
        DevOps, data wrangling, workshop logistics, and software integration work from our science and engineering staff — for grantees, agencies, and partners. Revenue sustains the free tools and data CUAHSI provides the whole community.
      </template>
    </PageHero>

    <!-- Intro + institution lookup -->
    <div class="mx-auto site-container max-w-site pt-[56px] pb-[24px]">
      <div class="grid grid-cols-1 gap-[32px] items-center min-[901px]:grid-cols-[1.3fr_.7fr] bg-sand rounded-[16px] p-[28px] mb-[24px]">
        <p class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] m-0">
          Engagements are scoped individually and typically support grant-funded research, but we're open to work with agencies and partner organizations too.
        </p>
        <div class="bg-white border border-[rgba(15,33,43,.12)] rounded-[10px] p-[14px_16px] relative">
          <p class="font-['Hanken_Grotesk'] font-bold text-[13.5px] leading-[normal] text-navy m-[0_0_4px]">Member institution rates</p>

          <!-- Confirmed state -->
          <div v-if="matchedInstitution" class="flex items-center justify-between gap-2">
            <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[normal] text-[#0F7A57] m-0">✓ {{ matchedInstitution.name }} — member since {{ matchedInstitution.since }}</p>
            <button @click="clearInstitution" class="font-['Hanken_Grotesk'] font-medium text-[11.5px] leading-[normal] text-muted cursor-pointer underline">Change</button>
          </div>

          <!-- Lookup input -->
          <div v-else>
            <input v-model="institutionQuery" @focus="showLookupResults = true" @input="showLookupResults = true"
              @blur="setTimeout(() => showLookupResults = false, 150)"
              type="text" aria-label="Find your institution" placeholder="Find your institution…"
              class="w-full border border-[rgba(15,33,43,.15)] rounded-[6px] p-[8px_10px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal]" />
            <div v-if="showLookupResults && lookupMatches.length" class="bg-white absolute left-[16px] right-[16px] top-full mt-[4px] border border-[rgba(15,33,43,.15)] rounded-[8px] [box-shadow:0_8px_20px_rgba(15,33,43,.12)] z-10 overflow-hidden">
              <button v-for="m in lookupMatches" :key="m.name" @click="selectInstitution(m)"
                class="block w-full text-left p-[9px_12px] font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] text-ink bg-white border-b border-b-[rgba(15,33,43,.06)] cursor-pointer">
                {{ m.name }}
              </button>
            </div>
            <p v-if="institutionQuery && !lookupMatches.length" class="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[normal] text-muted m-[6px_0_0]">
              Not a member? <NuxtLink to="/about/membership" class="text-water">Your institution can join →</NuxtLink>
            </p>
          </div>

          <!-- No-JS / plain toggle fallback -->
          <noscript>
            <div class="flex items-center gap-3 mt-2">
              <span class="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[normal] text-muted">Member university? Rates are automatically discounted 4.2% once confirmed by our team.</span>
            </div>
          </noscript>
        </div>
      </div>

      <!-- Issue 4: eligibility banner — free campus visits vs. paid work -->
      <div class="bg-sand rounded-[12px] p-[16px_22px] mb-[32px] flex items-center gap-[10px] flex-wrap">
        <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-[#3a4d57]">
          <strong class="text-navy">Member university?</strong> Many training and consultation needs are covered free by a campus visit — check that first.
        </span>
        <NuxtLink to="/community/campus-visits" class="font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water no-underline">Campus visits →</NuxtLink>
      </div>

      <!-- Service category cards -->
      <div class="grid grid-cols-1 gap-[18px] min-[641px]:grid-cols-2" role="group" aria-label="Service type">
        <div v-for="s in serviceDefs" :key="s.label"
          class="card-lift relative bg-white flex flex-col"
          :style="`border:1px solid rgba(15,33,43,.1);border-top:3px solid ${s.accent};border-radius:14px;padding:26px 24px;`">
          <!-- The whole card selects this service: an empty button stretched over it, so the card keeps its headings and list for screen readers -->
          <button type="button" :aria-pressed="selectedService === s.label ? 'true' : 'false'" :aria-label="`Choose ${s.title}`" @click="selectService(s.label)"
            class="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-water rounded-[14px]"></button>
          <span class="font-mono font-bold tracking-[.06em] uppercase" :style="`font-size:11px;color:${s.accent};`">{{ s.tag }}</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[21px] leading-[normal] text-navy m-[12px_0_4px]">{{ s.title }}</h2>
          <p v-if="s.qualifier" class="font-['Hanken_Grotesk'] font-medium text-[12px] leading-[normal] text-muted m-[0_0_10px]">{{ s.qualifier }}</p>
          <p class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-muted m-[0_0_16px]">{{ s.desc }}</p>
          <ul class="flex flex-col gap-2 list-none p-0 m-0">
            <li v-for="b in s.bullets" :key="b" class="flex items-start gap-[10px]">
              <span class="rounded-full flex-none mt-[6px]" :style="`width:6px;height:6px;background:${s.accent};`"></span>
              <span class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.45] text-[#3a4d57]">{{ b }}</span>
            </li>
          </ul>
          <div class="flex items-center justify-between mt-auto pt-[16px] border-t border-t-[rgba(15,33,43,.1)]">
            <span class="font-['Schibsted_Grotesk'] font-bold text-[19px] leading-[normal] text-navy">${{ displayRate(s.rate) }}/hr</span>
            <span class="font-mono text-[12px] text-muted">{{ s.range }}</span>
          </div>
        </div>
      </div>

      <!-- Writing a proposal -->
      <div class="rounded-[14px] bg-sand p-[28px_32px] mt-[32px]">
        <p class="font-['Schibsted_Grotesk'] font-bold text-[16px] leading-[normal] text-navy m-[0_0_10px]">Writing a grant proposal that involves CUAHSI?</p>
        <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-[#3a4d57] m-[0_0_14px] max-w-[720px]">
          The services above are exactly what most proposals should budget for CUAHSI as a consultant or contractor line item — whether you already have funds in hand or are writing them into a proposal now. That's the most common and straightforward way to bring us onto a project, in either case.
        </p>
        <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-[#3a4d57] m-[0_0_14px] max-w-[720px]">
          Two narrower situations call for something different:
        </p>
        <div class="grid grid-cols-1 gap-[18px] min-[641px]:grid-cols-2">
          <div>
            <p class="font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-navy m-[0_0_4px]">Letters of Collaboration</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.55] text-muted m-0">If your proposal asks CUAHSI to commit to something we already have dedicated funding to support, we can provide a letter of collaboration at no cost — there's no fee-for-service need here, since the work is already funded on our end.</p>
          </div>
          <div>
            <p class="font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-navy m-[0_0_4px]">Named collaborator on your grant</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.55] text-muted m-0">This is <em>not</em> a lighter-weight option — naming a CUAHSI staff member as a collaborator requires staffing a PI, with more proposal prep and ongoing project oversight than a scoped engagement. We reserve this for projects where CUAHSI's intellectual leadership on genuinely new work is actually needed.</p>
          </div>
        </div>
        <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.6] text-muted m-[14px_0_0]">
          Not sure which fits your proposal? <NuxtLink to="/contact" class="text-water">Ask us</NuxtLink> — most of the time, the answer is simply to line-item us above.
        </p>
      </div>
    </div>

    <!-- Quote form -->
    <div class="mx-auto site-container max-w-site pt-[24px] pb-[80px]">
      <div class="quote-panel bg-navy rounded-[16px]">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-[#e0a384]">Get a quote</span>
        <h2 class="font-['Schibsted_Grotesk'] font-bold text-[28px] leading-[1.1] text-white tracking-[-.018em] m-[14px_0_28px]">
          Tell us what you need — {{ selectedService }} and other work welcome.
        </h2>
        <form @submit.prevent>
          <div class="grid grid-cols-1 gap-[18px] min-[641px]:grid-cols-2 mb-[16px]">
            <input type="text" aria-label="Name" placeholder="Name" class="rounded-[8px] p-[13px_15px] font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal]" />
            <input type="text" aria-label="Organization or institution" :value="matchedInstitution?.name" placeholder="Organization / institution" class="rounded-[8px] p-[13px_15px] font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal]" />
            <input type="email" aria-label="Email" placeholder="Email" class="rounded-[8px] p-[13px_15px] font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal]" />
            <select aria-label="Budget range" class="rounded-[8px] p-[13px_15px] font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal] text-muted">
              <option value="" disabled selected>Budget range</option>
              <option v-for="b in budgetOptions" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
          <textarea rows="3" aria-label="Briefly describe what you need" placeholder="Briefly describe what you need"
            class="w-full rounded-[8px] p-[13px_15px] font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal] mb-[20px] resize-y"></textarea>
          <button type="submit" class="bg-clay text-white font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] rounded-[8px] p-[14px_26px] cursor-pointer">
            Send request
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quote-panel { padding: 44px 48px; }
@media (max-width: 640px) {
  .quote-panel { padding: 28px 22px; }
}
</style>
