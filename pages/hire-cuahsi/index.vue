<script setup lang="ts">
useHead({
  title: 'Hire CUAHSI · CUAHSI',
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
    accent: 'oklch(0.56 0.12 200)',
    title: 'Data wrangling, munging & publication formatting',
    desc: 'Hands-on help cleaning, restructuring, and formatting datasets so they meet funder sharing requirements and are genuinely ready to publish.',
    bullets: ['Format conversion & schema alignment', 'Metadata & FAIR-compliance review', 'QC on large observational records'],
    rate: 128,
    range: '$800 – $8,000 per dataset',
    label: 'Data wrangling',
  },
  {
    tag: 'EVENTS & LOGISTICS',
    accent: 'oklch(0.55 0.12 150)',
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
    <PageHero container-class="mx-auto site-container hero-section" container-style="max-width:1240px;padding-top:64px;padding-bottom:40px;"
      title-style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;max-width:760px;"
      lead-style="font:400 19px/1.55 'Hanken Grotesk';color:#3a4d57;max-width:620px;">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#C0603C;">Hire CUAHSI</span>
      </template>
      <template #title>
        Put our staff on your project.
      </template>
      <template #lead>
        DevOps, data wrangling, workshop logistics, and software integration work from our science and engineering staff — for grantees, agencies, and partners. Revenue sustains the free tools and data CUAHSI provides the whole community.
      </template>
    </PageHero>

    <!-- Intro + institution lookup -->
    <div class="mx-auto site-container" style="max-width:1240px;padding-top:56px;padding-bottom:24px;">
      <div class="rg-intro" style="background:#F3EEE4;border-radius:16px;padding:28px;margin-bottom:24px;">
        <p style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;margin:0;">
          Engagements are scoped individually and typically support grant-funded research, but we're open to work with agencies and partner organizations too.
        </p>
        <div class="bg-white" style="border:1px solid rgba(15,33,43,.12);border-radius:10px;padding:14px 16px;position:relative;">
          <p style="font:700 13.5px 'Hanken Grotesk';color:#0F2E44;margin:0 0 4px;">Member institution rates</p>

          <!-- Confirmed state -->
          <div v-if="matchedInstitution" class="flex items-center justify-between gap-2">
            <p style="font:400 12.5px 'Hanken Grotesk';color:#1f9d55;margin:0;">✓ {{ matchedInstitution.name }} — member since {{ matchedInstitution.since }}</p>
            <button @click="clearInstitution" style="font:500 11.5px 'Hanken Grotesk';color:#9ca3af;background:none;border:none;cursor:pointer;text-decoration:underline;">Change</button>
          </div>

          <!-- Lookup input -->
          <div v-else>
            <input v-model="institutionQuery" @focus="showLookupResults = true" @input="showLookupResults = true"
              @blur="setTimeout(() => showLookupResults = false, 150)"
              type="text" placeholder="Find your institution…"
              style="width:100%;border:1px solid rgba(15,33,43,.15);border-radius:6px;padding:8px 10px;font:400 13px 'Hanken Grotesk';outline:none;" />
            <div v-if="showLookupResults && lookupMatches.length" class="bg-white" style="position:absolute;left:16px;right:16px;top:100%;margin-top:4px;border:1px solid rgba(15,33,43,.15);border-radius:8px;box-shadow:0 8px 20px rgba(15,33,43,.12);z-index:10;overflow:hidden;">
              <button v-for="m in lookupMatches" :key="m.name" @click="selectInstitution(m)"
                class="block w-full text-left" style="padding:9px 12px;font:400 13px 'Hanken Grotesk';color:#15212B;background:white;border:none;border-bottom:1px solid rgba(15,33,43,.06);cursor:pointer;">
                {{ m.name }}
              </button>
            </div>
            <p v-if="institutionQuery && !lookupMatches.length" style="font:400 12px 'Hanken Grotesk';color:#5C6E78;margin:6px 0 0;">
              Not a member? <NuxtLink to="/about/membership" style="color:#1F6FB2;">Your institution can join →</NuxtLink>
            </p>
          </div>

          <!-- No-JS / plain toggle fallback -->
          <noscript>
            <div class="flex items-center gap-3 mt-2">
              <span style="font:400 12px 'Hanken Grotesk';color:#5C6E78;">Member university? Rates are automatically discounted 4.2% once confirmed by our team.</span>
            </div>
          </noscript>
        </div>
      </div>

      <!-- Issue 4: eligibility banner — free campus visits vs. paid work -->
      <div style="background:#F3EEE4;border-radius:12px;padding:16px 22px;margin-bottom:32px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="font:400 13.5px 'Hanken Grotesk';color:#3a4d57;">
          <strong style="color:#0F2E44;">Member university?</strong> Many training and consultation needs are covered free by a campus visit — check that first.
        </span>
        <NuxtLink to="/community/campus-visits" style="font:600 13.5px 'Hanken Grotesk';color:#1F6FB2;text-decoration:none;">Campus visits →</NuxtLink>
      </div>

      <!-- Service category cards -->
      <div class="rg-2">
        <div v-for="s in serviceDefs" :key="s.label"
          class="card-lift bg-white flex flex-col cursor-pointer"
          :style="`border:1px solid rgba(15,33,43,.1);border-top:3px solid ${s.accent};border-radius:14px;padding:26px 24px;`"
          @click="selectService(s.label)">
          <span class="font-mono font-bold tracking-[.06em] uppercase" :style="`font-size:11px;color:${s.accent};`">{{ s.tag }}</span>
          <h3 style="font:700 21px 'Schibsted Grotesk';color:#0F2E44;margin:12px 0 4px;">{{ s.title }}</h3>
          <p v-if="s.qualifier" style="font:500 12px 'Hanken Grotesk';color:#9ca3af;margin:0 0 10px;">{{ s.qualifier }}</p>
          <p style="font:400 14.5px/1.5 'Hanken Grotesk';color:#5C6E78;margin:0 0 16px;">{{ s.desc }}</p>
          <ul class="flex flex-col gap-2 mb-5" style="list-style:none;padding:0;margin:0;">
            <li v-for="b in s.bullets" :key="b" class="flex items-start gap-[10px]">
              <span class="rounded-full flex-none mt-[6px]" :style="`width:6px;height:6px;background:${s.accent};`"></span>
              <span style="font:400 13.5px/1.45 'Hanken Grotesk';color:#3a4d57;">{{ b }}</span>
            </li>
          </ul>
          <div class="flex items-center justify-between" style="margin-top:auto;padding-top:16px;border-top:1px solid rgba(15,33,43,.1);">
            <span style="font:700 19px 'Schibsted Grotesk';color:#0F2E44;">${{ displayRate(s.rate) }}/hr</span>
            <span class="font-mono text-[12px]" style="color:#5C6E78;">{{ s.range }}</span>
          </div>
        </div>
      </div>

      <!-- Writing a proposal -->
      <div class="rounded-[14px]" style="background:#F3EEE4;padding:28px 32px;margin-top:32px;">
        <p style="font:700 16px 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;">Writing a grant proposal that involves CUAHSI?</p>
        <p style="font:400 14px/1.65 'Hanken Grotesk';color:#3a4d57;margin:0 0 14px;max-width:720px;">
          The services above are exactly what most proposals should budget for CUAHSI as a consultant or contractor line item — whether you already have funds in hand or are writing them into a proposal now. That's the most common and straightforward way to bring us onto a project, in either case.
        </p>
        <p style="font:400 14px/1.65 'Hanken Grotesk';color:#3a4d57;margin:0 0 14px;max-width:720px;">
          Two narrower situations call for something different:
        </p>
        <div class="rg-2">
          <div>
            <p style="font:600 13.5px 'Hanken Grotesk';color:#0F2E44;margin:0 0 4px;">Letters of Collaboration</p>
            <p style="font:400 13px/1.55 'Hanken Grotesk';color:#5C6E78;margin:0;">If your proposal asks CUAHSI to commit to something we already have dedicated funding to support, we can provide a letter of collaboration at no cost — there's no fee-for-service need here, since the work is already funded on our end.</p>
          </div>
          <div>
            <p style="font:600 13.5px 'Hanken Grotesk';color:#0F2E44;margin:0 0 4px;">Named collaborator on your grant</p>
            <p style="font:400 13px/1.55 'Hanken Grotesk';color:#5C6E78;margin:0;">This is <em>not</em> a lighter-weight option — naming a CUAHSI staff member as a collaborator requires staffing a PI, with more proposal prep and ongoing project oversight than a scoped engagement. We reserve this for projects where CUAHSI's intellectual leadership on genuinely new work is actually needed.</p>
          </div>
        </div>
        <p style="font:400 12.5px/1.6 'Hanken Grotesk';color:#5C6E78;margin:14px 0 0;">
          Not sure which fits your proposal? <NuxtLink to="/contact" style="color:#1F6FB2;">Ask us</NuxtLink> — most of the time, the answer is simply to line-item us above.
        </p>
      </div>
    </div>

    <!-- Quote form -->
    <div class="mx-auto site-container" style="max-width:1240px;padding-top:24px;padding-bottom:80px;">
      <div class="quote-panel" style="background:#0F2E44;border-radius:16px;">
        <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#e0a384;">Get a quote</span>
        <h2 style="font:700 28px/1.1 'Schibsted Grotesk';color:#fff;letter-spacing:-.018em;margin:14px 0 28px;">
          Tell us what you need — {{ selectedService }} and other work welcome.
        </h2>
        <form @submit.prevent>
          <div class="rg-2" style="margin-bottom:16px;">
            <input type="text" placeholder="Name" style="border:none;border-radius:8px;padding:13px 15px;font:400 14.5px 'Hanken Grotesk';outline:none;" />
            <input type="text" :value="matchedInstitution?.name" placeholder="Organization / institution" style="border:none;border-radius:8px;padding:13px 15px;font:400 14.5px 'Hanken Grotesk';outline:none;" />
            <input type="email" placeholder="Email" style="border:none;border-radius:8px;padding:13px 15px;font:400 14.5px 'Hanken Grotesk';outline:none;" />
            <select style="border:none;border-radius:8px;padding:13px 15px;font:400 14.5px 'Hanken Grotesk';outline:none;color:#5C6E78;">
              <option value="" disabled selected>Budget range</option>
              <option v-for="b in budgetOptions" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
          <textarea rows="3" placeholder="Briefly describe what you need"
            style="width:100%;border:none;border-radius:8px;padding:13px 15px;font:400 14.5px 'Hanken Grotesk';outline:none;margin-bottom:20px;resize:vertical;"></textarea>
          <button type="submit" style="background:#C0603C;color:white;font:600 15px 'Hanken Grotesk';border:none;border-radius:8px;padding:14px 26px;cursor:pointer;">
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
