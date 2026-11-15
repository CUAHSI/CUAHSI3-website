<script setup lang="ts">
useHead({ title: 'Governance' })
// Board and officers as listed on the legacy governance page (snapshot of 6 November 2026)
const directors = [
  { name: 'Hoori Ajami', org: 'University of California - Riverside' },
  { name: 'Amy Burgin', org: 'Iowa State University' },
  { name: 'Jon Duncan', org: 'Penn State University' },
  { name: 'Darren Ficklin', org: 'Indiana University' },
  { name: 'JP Gannon', org: 'Virginia Tech', role: 'Chair' },
  { name: 'Drew Guswa', org: 'Smith College' },
  { name: 'Paul C. Hanson', org: 'University of Wisconsin' },
  { name: 'Melissa A. Kenney', org: 'University of Minnesota' },
  { name: 'Safeeq Khan', org: 'University of California - Merced' },
  { name: 'Sarah Ledford', org: 'Georgia State University' },
  { name: 'Marco Maneta', org: 'First Street, Inc.' },
  { name: 'Ashley Matheny', org: 'University of Texas - Austin' },
  { name: 'Jennifer Merrill', org: 'Stroud Water Research Center' },
  { name: 'Diego Riveros-Iregui', org: 'University of North Carolina - Chapel Hill' },
  { name: 'Tao Wen', org: 'Syracuse University' },
]
const officers = [
  { name: 'Jordan Read', org: 'CUAHSI', role: 'President' },
  { name: 'Salli Dymond', org: 'Northern Arizona University', role: 'Secretary' },
  { name: 'Steve Architzel', org: 'University of California - San Francisco', role: 'Treasurer' },
]
</script>
<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-[-.02em] text-navy m-[14px_0_14px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[560px]">
      <template #kicker>About · Governance</template>
      <template #title>Board, committees, and bylaws.</template>
      <template #lead>CUAHSI is governed by a Board of Directors elected by its member institutions, with input from advisory committees open to any interested water scientist.</template>
      <template #top><SectionNav section="about" fixed /></template>
    </PageHero>
    <div class="mx-auto max-w-site p-[52px_40px_80px]">
      <section id="board" class="mb-[52px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Board of Directors</p>
        <div class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <div v-for="m in directors" :key="m.name" class="rounded-card border border-[rgba(15,33,43,.1)] p-[20px]">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[4px]">{{ m.name }}</p>
            <p v-if="m.role" class="font-mono font-bold tracking-[.1em] uppercase text-water mb-[4px] text-[10.5px]">{{ m.role }}</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-muted">{{ m.org }}</p>
          </div>
        </div>
      </section>
      <section id="officers" class="mb-[52px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Officers</p>
        <div class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <div v-for="m in officers" :key="m.name" class="rounded-card border border-[rgba(15,33,43,.1)] p-[20px]">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[4px]">{{ m.name }}</p>
            <p v-if="m.role" class="font-mono font-bold tracking-[.1em] uppercase text-water mb-[4px] text-[10.5px]">{{ m.role }}</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-muted">{{ m.org }}</p>
          </div>
        </div>
      </section>
      <section id="advisory-committees" class="mb-[52px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Advisory committees</p>
        <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.65] text-[#3a4d57] max-w-[580px] mb-[24px]">Advisory committees on informatics, education and outreach, and instrumentation are open to any interested individual regardless of membership status. Committees meet virtually throughout the year and inform CUAHSI's strategic direction.</p>
        <a href="mailto:connect@cuahsi.org" class="font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-water">Contact us to get involved →</a>
      </section>
      <section class="mb-[52px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Documents</p>
        <div class="grid grid-cols-[1fr] gap-[12px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <a v-for="d in [{t:'Bylaws',d:'CUAHSI governing bylaws, last updated July 2024.',h:'https://www.cuahsi.org/uploads/library/doc/2024-07-24-Bylaws_Final.docx.pdf'},{t:'Strategic Plan 2023–2028',d:'CUAHSI strategic direction for building a sustainable organization.',h:'https://www.cuahsi.org/uploads/pages/img/Strategic-Plan-2023-Final.1.pdf'},{t:'2025 Annual Report',d:'Progress across HydroShare, training programs, and research in 2025.',h:'https://www.cuahsi.org/uploads/pages/img/2025-Annual-Report_Final_reduced.pdf'}]"
            :key="d.t" :href="d.h" target="_blank" class="card-lift rounded-card border border-[rgba(15,33,43,.1)] p-[20px] no-underline">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[normal] text-navy mb-[6px]">{{ d.t }}</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.5] text-muted mb-[10px]">{{ d.d }}</p>
            <span class="font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water">Download PDF ↗</span>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
