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

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">

      <!-- Hero -->
      <section class="rgrid rgrid-split" style="display:grid;gap:40px;padding:48px 0 40px;border-bottom:0.5px solid #f3f4f6;align-items:start;--cols:minmax(0,1fr) 260px;">
        <div>
          <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
            <NuxtLink to="/community" style="text-decoration:none;color:#9ca3af;">Get involved</NuxtLink> / Bring CUAHSI to your campus
          </p>
          <h1 style="font-size:28px;font-weight:500;line-height:1.25;margin-bottom:14px;">
            Bring CUAHSI to your campus
          </h1>
          <p style="font-size:15px;color:#6b7280;line-height:1.7;margin-bottom:12px;">
            CUAHSI staff are available for free seminars, hands-on workshops, and consultations at
            universities, colleges, and research institutions — in person or virtual.
          </p>
          <p style="font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:24px;">
            These visits introduce water scientists and students to CUAHSI programs and tools, support
            data-ready research practices, and help us connect with new communities. We welcome requests
            from member institutions, prospective members, and the broader water science community.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a href="mailto:connect@cuahsi.org?subject=Campus visit request"
              style="font-size:13px;font-weight:500;padding:10px 20px;background:#111827;color:white;border-radius:8px;text-decoration:none;">
              Request a visit
            </a>
            <a href="/cuahsi-campus-visit-flyer.pdf" target="_blank" rel="noopener"
              style="font-size:13px;padding:10px 18px;border:0.5px solid #d1d5db;border-radius:8px;text-decoration:none;color:inherit;">
              Download one-pager ↗
            </a>
          </div>
        </div>

        <!-- Recent visits sidebar -->
        <div style="background:#f9fafb;border-radius:12px;padding:18px;">
          <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:14px;">Recent visits</p>
          <div v-for="(v, i) in recentVisits" :key="v.inst"
            :style="`padding-bottom:10px;margin-bottom:10px;${i < recentVisits.length-1 ? 'border-bottom:0.5px solid #e5e7eb;' : ''}`">
            <p style="font-size:13px;font-weight:500;margin-bottom:2px;">{{ v.inst }}</p>
            <p style="font-size:12px;color:#6b7280;margin-bottom:1px;">{{ v.type }}</p>
            <p style="font-size:11px;color:#9ca3af;">{{ v.context }}</p>
          </div>
        </div>
      </section>

      <!-- Menu of options -->
      <section style="padding:40px 0;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">Menu of options</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.65;max-width:560px;margin-bottom:24px;">
          Most visits combine elements — a seminar followed by a hands-on session, or a lab consultation
          after a department talk. We tailor content to your audience and needs.
        </p>
        <div class="rgrid rgrid-split" style="display:grid;gap:14px;--cols:repeat(2,minmax(0,1fr));">
          <div v-for="o in offerings" :key="o.title"
            style="border:0.5px solid #e5e7eb;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:0;">
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
              <span style="font-size:22px;flex-shrink:0;margin-top:2px;">{{ o.icon }}</span>
              <div>
                <p style="font-size:14px;font-weight:500;line-height:1.3;margin-bottom:4px;">{{ o.title }}</p>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <span style="font-size:11px;padding:1px 8px;border-radius:99px;background:#f3f4f6;color:#6b7280;">{{ o.duration }}</span>
                  <span style="font-size:11px;padding:1px 8px;border-radius:99px;background:#E1F5EE;color:#0F6E56;">{{ o.format }}</span>
                </div>
              </div>
            </div>
            <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:12px;flex:1;">{{ o.desc }}</p>
            <div style="border-top:0.5px solid #f3f4f6;padding-top:10px;">
              <p style="font-size:11px;color:#9ca3af;margin-bottom:5px;">Works well for</p>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                <span v-for="g in o.goodFor" :key="g"
                  style="font-size:11px;padding:2px 8px;border-radius:99px;border:0.5px solid #e5e7eb;color:#6b7280;">
                  {{ g }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Included with membership vs. Fee-for-service -->
      <section style="padding:40px 0;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;">What's included, and what isn't</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.65;max-width:560px;margin-bottom:20px;">
          Campus visits above are free for member institutions. Larger, ongoing, or highly customized engagements
          are fee-for-service work through Hire CUAHSI.
        </p>
        <div class="rgrid rgrid-split" style="display:grid;gap:14px;--cols:repeat(2,minmax(0,1fr));">
          <div style="border:0.5px solid #e5e7eb;border-radius:12px;padding:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#1D9E75;margin-bottom:12px;">Included with membership</p>
            <div v-for="item in [
              'One seminar, workshop, or consultation visit per year',
              'Standard curriculum from the menu above',
              'Half-day to full-day formats, in-person or virtual',
              'Follow-up email support after the visit'
            ]" :key="item" style="display:flex;gap:8px;font-size:13px;color:#374151;padding:6px 0;">
              <span style="color:#1D9E75;flex-shrink:0;">✓</span> {{ item }}
            </div>
          </div>
          <div style="border:0.5px solid #e5e7eb;border-radius:12px;padding:20px;">
            <p style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#C0603C;margin-bottom:12px;">Fee-for-service</p>
            <div v-for="item in [
              'Multi-day or recurring engagements',
              'Custom software or platform integrations',
              'Dedicated dataset curation and publishing',
              'Work scoped to a specific grant or contract'
            ]" :key="item" style="display:flex;gap:8px;font-size:13px;color:#374151;padding:6px 0;">
              <span style="color:#C0603C;flex-shrink:0;">$</span> {{ item }}
            </div>
            <NuxtLink to="/hire-cuahsi" style="display:inline-block;font-size:13px;font-weight:500;color:#1F6FB2;margin-top:10px;text-decoration:none;">
              Need something beyond the standard visit? See Hire CUAHSI →
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Who we want to reach -->
      <section style="padding:40px 0;border-bottom:0.5px solid #f3f4f6;">
        <p style="font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;">Who we especially want to reach</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;max-width:600px;margin-bottom:20px;">
          We are actively working to connect with institutions and communities that have not yet engaged
          deeply with CUAHSI programs. We prioritize building new relationships in year one.
        </p>
        <div class="rgrid rgrid-split" style="display:grid;gap:10px;--cols:repeat(2,minmax(0,1fr));">
          <div v-for="t in targets" :key="t.label"
            style="display:flex;gap:12px;align-items:flex-start;padding:14px;border:0.5px solid #e5e7eb;border-radius:10px;">
            <span style="width:6px;height:6px;border-radius:50%;background:#1D9E75;flex-shrink:0;margin-top:5px;"></span>
            <div>
              <p style="font-size:13px;font-weight:500;margin-bottom:3px;">{{ t.label }}</p>
              <p style="font-size:12px;color:#6b7280;line-height:1.55;">{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Request + Download CTA -->
      <section class="rgrid rgrid-split" style="display:grid;gap:16px;padding:40px 0 48px;--cols:minmax(0,1fr) minmax(0,1fr);">
        <div style="background:#f9fafb;border-radius:12px;padding:24px;">
          <p style="font-size:14px;font-weight:500;margin-bottom:8px;">Request a visit</p>
          <p style="font-size:13px;color:#6b7280;line-height:1.65;margin-bottom:14px;">
            Email us with your institution, audience, preferred format, and available dates.
            We respond within one week and can typically schedule within 3–4 weeks.
          </p>
          <p style="font-size:12px;color:#374151;font-weight:500;margin-bottom:6px;">Include in your request:</p>
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:18px;">
            <div v-for="item in [
              'Your institution and department',
              'Expected audience (students, faculty, mixed)',
              'Preferred format from the menu above',
              'Preferred dates or semester window',
              'In-person or virtual preference'
            ]" :key="item" style="display:flex;gap:8px;font-size:12px;color:#6b7280;">
              <span style="color:#1D9E75;flex-shrink:0;">✓</span> {{ item }}
            </div>
          </div>
          <a href="mailto:connect@cuahsi.org?subject=Campus visit request"
            style="display:inline-block;font-size:13px;font-weight:500;padding:9px 18px;background:#111827;color:white;border-radius:8px;text-decoration:none;">
            Email connect@cuahsi.org
          </a>
        </div>

        <div style="border:0.5px solid #e5e7eb;border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:10px;">
          <p style="font-size:14px;font-weight:500;">Share this with a colleague</p>
          <p style="font-size:13px;color:#6b7280;line-height:1.65;">
            A one-page PDF summarizing what CUAHSI offers — designed for attaching to outreach emails,
            sharing at conferences, and distributing to faculty who host our visits.
          </p>
          <div style="background:#f9fafb;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;flex:1;">
            <span style="font-size:28px;">📄</span>
            <div>
              <p style="font-size:12px;font-weight:500;margin-bottom:1px;">CUAHSI Campus Engagement</p>
              <p style="font-size:11px;color:#9ca3af;">One-page overview · PDF</p>
            </div>
          </div>
          <a href="/cuahsi-campus-visit-flyer.pdf" target="_blank" rel="noopener"
            style="display:inline-block;font-size:13px;font-weight:500;padding:9px 18px;border:0.5px solid #d1d5db;border-radius:8px;text-decoration:none;color:inherit;width:fit-content;">
            Download PDF ↗
          </a>
        </div>
      </section>

    </div>
  </div>
</template>
