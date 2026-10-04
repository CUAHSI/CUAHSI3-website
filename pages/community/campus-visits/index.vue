<script setup lang="ts">
useHead({
  title: 'Bring CUAHSI to your campus',
  meta: [{ name: 'description', content: 'CUAHSI staff are available for free seminars, hands-on workshops, and consultations at universities, colleges, and research institutions — in person or virtual.' }]
})

const offerings = [
  {
    icon: '🎤',
    duration: '1 hour',
    format: 'Seminar or webinar',
    title: 'Introduction to CUAHSI',
    desc: 'An overview of CUAHSI programs, data tools, and services — what HydroShare is, what training programs exist, how to get involved, and what membership means. Tailored to your department and audience.',
    goodFor: ['Department seminars', 'New grad student orientation', 'Faculty meetings', 'Virtual delivery'],
  },
  {
    icon: '💻',
    duration: '1–2 hours',
    format: 'Hands-on workshop',
    title: 'Water data tools workshop',
    desc: 'A practical session introducing HydroShare and cloud computing tools. Participants explore finding data, uploading and sharing datasets, and running analyses in JupyterHub. Ideal for courses or research groups starting a project.',
    goodFor: ['Graduate courses', 'Research lab groups', 'Data science courses', 'In-person or virtual'],
  },
  {
    icon: '🔬',
    duration: '2–3 hours',
    format: 'Workshop',
    title: 'FAIR data practices and reproducible workflows',
    desc: 'In-depth workshop on data management planning, FAIR and CARE principles, and reproducible workflow design using HydroShare and Jupyter. Designed for researchers preparing to publish data or comply with NSF public access requirements.',
    goodFor: ['Advanced grad students', 'Postdocs', 'Research groups', 'In-person or virtual'],
  },
  {
    icon: '🤝',
    duration: 'Flexible',
    format: 'Consultation',
    title: 'One-on-one or small group consultation',
    desc: 'Direct support from a CUAHSI data scientist. Useful for lab groups at the start of a project, preparing a data management plan, navigating a specific data challenge, or getting HydroShare set up for a course or field campaign.',
    goodFor: ['PIs and research groups', 'Grant preparation support', 'Data publishing help', 'Remote'],
  },
  {
    icon: '🏫',
    duration: '1–2 hours',
    format: 'Faculty or leadership meeting',
    title: 'Integrating CUAHSI learning resources into your curriculum',
    desc: 'A conversation for faculty, department chairs, and deans about how CUAHSI learning resources can strengthen existing course offerings — with no new infrastructure required. Topics include: how the CUAHSI Virtual University works and how students earn credit at their home institution; using HydroLearn modules in existing hydrology and water resources courses; hosting or drawing on instructional materials through the Water Content Portal; and setting up JupyterHub for classroom use so students can run data and code examples without local environment or package installation headaches.',
    goodFor: ['Faculty', 'Department chairs', 'Deans and curriculum committees', 'Program coordinators'],
  },
]

const recentVisits = [
  { inst: 'Hamilton College', type: 'HydroShare workshop', context: 'Dr. Heather Kropp course' },
  { inst: 'University of Florida', type: 'Water data services session', context: 'Water Institute Student Showcase' },
  { inst: 'University of Iowa', type: 'CUAHSI vision seminar', context: 'Iowa Flood Center' },
  { inst: 'Iowa State University', type: 'CUAHSI vision seminar', context: 'Water Resilience Collaborative' },
  { inst: 'University of Nebraska', type: 'Department presentation', context: 'Campus visit series' },
]

const targets = [
  { label: 'Prospective member institutions', desc: 'Universities not yet in CUAHSI membership who work in water science — like departments we know through existing collaborations.' },
  { label: 'New member institutions', desc: 'Recently joined members whose faculty and students may not yet know what CUAHSI offers.' },
  { label: 'Primarily undergraduate institutions', desc: 'PUIs where CUAHSI tools and training can have outsized impact on student research readiness at lower resource cost.' },
  { label: 'Professional society partners', desc: 'Discipline-adjacent communities at AGU, AWRA, ASCE, ESIP, and ecological science conferences where CUAHSI can build new connections.' },
]
</script>

<template>
  <div>

    <div class="max-w-[1024px] m-[0_auto] p-[0_24px]">

      <!-- Hero -->
      <section class="grid grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_260px] gap-[40px] p-[48px_0_40px] border-b-[0.5px] border-b-[#f3f4f6] [align-items:start]">
        <div>
          <p class="text-[11px] text-muted mb-[8px]">
            <NuxtLink to="/community" class="no-underline text-muted">Get involved</NuxtLink> / Bring CUAHSI to your campus
          </p>
          <h1 class="text-[28px] font-medium leading-[1.25] mb-[14px]">
            Bring CUAHSI to your campus
          </h1>
          <p class="text-[15px] text-[#6b7280] leading-[1.7] mb-[12px]">
            CUAHSI staff are available for free seminars, hands-on workshops, and consultations at
            universities, colleges, and research institutions — in person or virtual.
          </p>
          <p class="text-[14px] text-[#6b7280] leading-[1.7] mb-[24px]">
            These visits introduce water scientists and students to CUAHSI programs and tools, support
            data-ready research practices, and help us connect with new communities. We welcome requests
            from member institutions, prospective members, and the broader water science community.
          </p>
          <div class="flex gap-[10px] flex-wrap">
            <a href="mailto:connect@cuahsi.org?subject=Campus visit request"
              class="text-[13px] font-medium p-[10px_20px] bg-[#111827] text-white rounded-[8px] no-underline">
              Request a visit
            </a>
            <a href="/cuahsi-campus-visit-flyer.pdf" target="_blank" rel="noopener"
              class="text-[13px] p-[10px_18px] border-[0.5px] border-[#d1d5db] rounded-[8px] no-underline text-inherit">
              Download one-pager ↗
            </a>
          </div>
        </div>

        <!-- Recent visits sidebar -->
        <div class="bg-[#f9fafb] rounded-[12px] p-[18px]">
          <p class="text-[11px] font-medium tracking-[.06em] uppercase text-muted mb-[14px]">Recent visits</p>
          <div v-for="(v, i) in recentVisits" :key="v.inst"
            :style="`padding-bottom:10px;margin-bottom:10px;${i < recentVisits.length-1 ? 'border-bottom:0.5px solid #e5e7eb;' : ''}`">
            <p class="text-[13px] font-medium mb-[2px]">{{ v.inst }}</p>
            <p class="text-[12px] text-[#6b7280] mb-[1px]">{{ v.type }}</p>
            <p class="text-[11px] text-muted">{{ v.context }}</p>
          </div>
        </div>
      </section>

      <!-- Menu of options -->
      <section class="p-[40px_0] border-b-[0.5px] border-b-[#f3f4f6]">
        <p class="text-[11px] font-medium tracking-[.07em] uppercase text-muted mb-[6px]">Menu of options</p>
        <p class="text-[14px] text-[#6b7280] leading-[1.65] max-w-[560px] mb-[24px]">
          Most visits combine elements — a seminar followed by a hands-on session, or a lab consultation
          after a department talk. We tailor content to your audience and needs.
        </p>
        <div class="grid grid-cols-[1fr] min-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] gap-[14px]">
          <div v-for="o in offerings" :key="o.title"
            class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[20px] flex flex-col gap-[0]">
            <div class="flex items-start gap-[12px] mb-[10px]">
              <span class="text-[22px] shrink-0 mt-[2px]">{{ o.icon }}</span>
              <div>
                <p class="text-[14px] font-medium leading-[1.3] mb-[4px]">{{ o.title }}</p>
                <div class="flex gap-[5px] flex-wrap">
                  <span class="text-[11px] p-[1px_8px] rounded-[99px] bg-[#f3f4f6] text-muted">{{ o.duration }}</span>
                  <span class="text-[11px] p-[1px_8px] rounded-[99px] bg-[#E1F5EE] text-[#0F6E56]">{{ o.format }}</span>
                </div>
              </div>
            </div>
            <p class="text-[13px] text-[#6b7280] leading-[1.6] mb-[12px] flex-1">{{ o.desc }}</p>
            <div class="border-t-[0.5px] border-t-[#f3f4f6] pt-[10px]">
              <p class="text-[11px] text-muted mb-[5px]">Works well for</p>
              <div class="flex flex-wrap gap-[4px]">
                <span v-for="g in o.goodFor" :key="g"
                  class="text-[11px] p-[2px_8px] rounded-[99px] border-[0.5px] border-[#e5e7eb] text-[#6b7280]">
                  {{ g }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Included with membership vs. Fee-for-service -->
      <section class="p-[40px_0] border-b-[0.5px] border-b-[#f3f4f6]">
        <p class="text-[11px] font-medium tracking-[.07em] uppercase text-muted mb-[8px]">What's included, and what isn't</p>
        <p class="text-[14px] text-[#6b7280] leading-[1.65] max-w-[560px] mb-[20px]">
          Campus visits above are free for member institutions. Larger, ongoing, or highly customized engagements
          are fee-for-service work through Hire CUAHSI.
        </p>
        <div class="grid grid-cols-[1fr] min-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] gap-[14px]">
          <div class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-[#0F7A57] mb-[12px]">Included with membership</p>
            <div v-for="item in [
              'One seminar, workshop, or consultation visit per year',
              'Standard curriculum from the menu above',
              'Half-day to full-day formats, in-person or virtual',
              'Follow-up email support after the visit'
            ]" :key="item" class="flex gap-[8px] text-[13px] text-[#374151] p-[6px_0]">
              <span class="text-[#0F7A57] shrink-0">✓</span> {{ item }}
            </div>
          </div>
          <div class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[20px]">
            <p class="text-[11px] font-medium tracking-[.06em] uppercase text-clay mb-[12px]">Fee-for-service</p>
            <div v-for="item in [
              'Multi-day or recurring engagements',
              'Custom software or platform integrations',
              'Dedicated dataset curation and publishing',
              'Work scoped to a specific grant or contract'
            ]" :key="item" class="flex gap-[8px] text-[13px] text-[#374151] p-[6px_0]">
              <span class="text-clay shrink-0">$</span> {{ item }}
            </div>
            <NuxtLink to="/hire-cuahsi" class="inline-block text-[13px] font-medium text-water mt-[10px] no-underline">
              Need something beyond the standard visit? See Hire CUAHSI →
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Who we want to reach -->
      <section class="p-[40px_0] border-b-[0.5px] border-b-[#f3f4f6]">
        <p class="text-[11px] font-medium tracking-[.07em] uppercase text-muted mb-[8px]">Who we especially want to reach</p>
        <p class="text-[14px] text-[#6b7280] leading-[1.7] max-w-[600px] mb-[20px]">
          We are actively working to connect with institutions and communities that have not yet engaged
          deeply with CUAHSI programs. We prioritize building new relationships in year one.
        </p>
        <div class="grid grid-cols-[1fr] min-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] gap-[10px]">
          <div v-for="t in targets" :key="t.label"
            class="flex gap-[12px] items-start p-[14px] border-[0.5px] border-[#e5e7eb] rounded-[10px]">
            <span class="w-[6px] h-[6px] rounded-[50%] bg-[#1D9E75] shrink-0 mt-[5px]"></span>
            <div>
              <p class="text-[13px] font-medium mb-[3px]">{{ t.label }}</p>
              <p class="text-[12px] text-[#6b7280] leading-[1.55]">{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Request + Download CTA -->
      <section class="grid grid-cols-[1fr] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[16px] p-[40px_0_48px]">
        <div class="bg-[#f9fafb] rounded-[12px] p-[24px]">
          <p class="text-[14px] font-medium mb-[8px]">Request a visit</p>
          <p class="text-[13px] text-[#6b7280] leading-[1.65] mb-[14px]">
            Email us with your institution, audience, preferred format, and available dates.
            We respond within one week and can typically schedule within 3–4 weeks.
          </p>
          <p class="text-[12px] text-[#374151] font-medium mb-[6px]">Include in your request:</p>
          <div class="flex flex-col gap-[4px] mb-[18px]">
            <div v-for="item in [
              'Your institution and department',
              'Expected audience (students, faculty, mixed)',
              'Preferred format from the menu above',
              'Preferred dates or semester window',
              'In-person or virtual preference'
            ]" :key="item" class="flex gap-[8px] text-[12px] text-[#6b7280]">
              <span class="text-[#0F7A57] shrink-0">✓</span> {{ item }}
            </div>
          </div>
          <a href="mailto:connect@cuahsi.org?subject=Campus visit request"
            class="inline-block text-[13px] font-medium p-[9px_18px] bg-[#111827] text-white rounded-[8px] no-underline">
            Email connect@cuahsi.org
          </a>
        </div>

        <div class="border-[0.5px] border-[#e5e7eb] rounded-[12px] p-[24px] flex flex-col gap-[10px]">
          <p class="text-[14px] font-medium">Share this with a colleague</p>
          <p class="text-[13px] text-[#6b7280] leading-[1.65]">
            A one-page PDF summarizing what CUAHSI offers — designed for attaching to outreach emails,
            sharing at conferences, and distributing to faculty who host our visits.
          </p>
          <div class="bg-[#f9fafb] rounded-[8px] p-[14px] flex items-center gap-[12px] flex-1">
            <span class="text-[28px]">📄</span>
            <div>
              <p class="text-[12px] font-medium mb-[1px]">CUAHSI Campus Engagement</p>
              <p class="text-[11px] text-muted">One-page overview · PDF</p>
            </div>
          </div>
          <a href="/cuahsi-campus-visit-flyer.pdf" target="_blank" rel="noopener"
            class="inline-block text-[13px] font-medium p-[9px_18px] border-[0.5px] border-[#d1d5db] rounded-[8px] no-underline text-inherit w-[fit-content]">
            Download PDF ↗
          </a>
        </div>
      </section>

    </div>
  </div>
</template>
