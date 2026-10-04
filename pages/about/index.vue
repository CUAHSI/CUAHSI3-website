<script setup lang="ts">
useHead({ title: 'About CUAHSI' })

const timeline = [
  { year: '1984', text: 'NSF Hydrology and Hydraulics Program discontinued, catalyzing community organizing' },
  { year: '1987', text: 'Committee on Hydrologic Sciences established by the National Research Council' },
  { year: '1991', text: 'Opportunities in Hydrologic Sciences (the "blue book") published by the National Academies' },
  { year: '1992', text: 'NSF-GEO establishes a core program in hydrologic sciences with $2M initial funding' },
  { year: '2001', text: 'CUAHSI incorporated in Washington D.C. with 33 founding member universities' },
  { year: '2003', text: 'Cyberseminar program launched, now 350+ recordings on YouTube' },
  { year: '2026', text: '25th anniversary: 100+ members, 25,000+ HydroShare users' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero container-class="mx-auto max-w-site p-[64px_40px_52px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[580px] mb-[24px]">
      <template #kicker>About CUAHSI</template>
      <template #title>Advancing water science through shared infrastructure and community.</template>
      <template #lead>The Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI) is a 501(c)(3) research organization representing 101 U.S. universities and international water science organizations.</template>
      <div class="flex gap-3 flex-wrap">
        <a href="https://www.cuahsi.org/uploads/pages/doc/2025-About-CUAHSI-Flyer-2.pdf" target="_blank" class="arrow-row inline-flex items-center gap-2 rounded-btn font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-navy p-[11px_18px] border-[1.5px] border-[rgba(15,46,68,.22)]">Download brochure <span class="arr">→</span></a>
        <a href="https://www.cuahsi.org/uploads/pages/img/2025-Annual-Report_Final_reduced.pdf" target="_blank" class="arrow-row inline-flex items-center gap-2 rounded-btn font-['Hanken_Grotesk'] font-semibold text-[14px] leading-[normal] text-navy p-[11px_18px] border-[1.5px] border-[rgba(15,46,68,.22)]">2025 Annual Report <span class="arr">→</span></a>
      </div>
      <template #below>
        <!-- Sub-nav -->
        <div class="mx-auto max-w-site p-[0_40px]">
          <div class="flex gap-0 border-t border-t-[rgba(15,33,43,.08)] overflow-x-auto">
            <a v-for="l in [{t:'Mission & values',h:'#mission'},{t:'What we do',h:'#what-we-do'},{t:'History',h:'#history'},{t:'Our team',h:'/about/team'},{t:'Governance',h:'/about/governance'},{t:'Membership',h:'/about/membership'},{t:'Impact',h:'/about/impact'},{t:'Contact',h:'#contact'}]"
              :key="l.h" :href="l.h"
              class="transition-colors font-['Hanken_Grotesk'] font-medium text-[13px] leading-[normal] text-muted p-[14px_16px_14px_0] no-underline whitespace-nowrap">
              {{ l.t }}
            </a>
          </div>
        </div>
      </template>
    </PageHero>

    <div class="mx-auto max-w-site p-[0_40px]">

      <!-- Mission / Vision / Values -->
      <section id="mission" class="py-[60px] border-b border-b-[rgba(15,33,43,.08)]">
        <div class="grid grid-cols-[1fr] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[1fr_1fr_1fr] gap-[18px] border border-[rgba(15,33,43,.1)] rounded-[12px] overflow-hidden">
          <div class="p-[24px] border-r border-r-[rgba(15,33,43,.08)]">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] mb-[10px]">Mission</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-[#3a4d57]">To empower the water community and advance science through collaboration, infrastructure, and education.</p>
          </div>
          <div class="p-[24px] border-r border-r-[rgba(15,33,43,.08)]">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] mb-[10px]">Vision</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-[#3a4d57]">A thriving water community — enabled by shared resources — developing an integrated understanding of water, earth, ecosystems, and society.</p>
          </div>
          <div class="p-[24px]">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[10px] mb-[10px]">Values</p>
            <div class="flex flex-col gap-[6px]">
              <div v-for="v in [['Strategic collaborators','connecting people and institutions across water science'],['Innovative catalysts','making high-value tools and ideas accessible to all'],['Impactful leaders','delivering lasting change for the greater good']]" :key="v[0]">
                <span class="font-['Hanken_Grotesk'] font-medium text-[13px] leading-[normal] text-ink">{{ v[0] }}</span>
                <span class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[normal] text-muted"> — {{ v[1] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What we do -->
      <section id="what-we-do" class="py-[60px] border-b border-b-[rgba(15,33,43,.08)]">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">What we do</span>
        <h2 class="font-['Schibsted_Grotesk'] font-bold text-[clamp(26px,3vw,36px)] leading-[1.1] text-navy tracking-[-.016em] m-[14px_0_14px]">Three core capabilities.</h2>
        <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.65] text-[#3a4d57] max-w-[620px] mb-[32px]">CUAHSI fosters a diverse and dynamic water science community enabled by shared scientific infrastructure. Our programs are available to everyone — students, educators, agencies, and community scientists.</p>
        <div class="grid grid-cols-[1fr] gap-[24px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <div v-for="w in [
            {icon:'🗄️',bg:'#E1F5EE',title:'Data infrastructure',desc:'We operate HydroShare, the water science community platform for publishing, sharing, and collaborating on data, models, and code. We build software that makes it easier to find, manage, and publish data following FAIR principles.',cta:'Explore tools & platforms',to:'/data-platforms'},
            {icon:'🎓',bg:'#EDE9FE',title:'Training & community',desc:'We deliver field workshops, virtual university courses, cyberseminars, fellowships, and summer institutes that build skills and connect water scientists at every career stage.',cta:'Browse training',to:'/learn-train'},
            {icon:'🔬',bg:'#EFF6FF',title:'Cyberinfrastructure & data innovation',desc:'Our research team develops new software, standards, and frameworks that advance the way water data is collected, modeled, and shared — including cloud computing tools and model evaluation frameworks.',cta:'Browse highlights',to:'/highlights'},
          ]" :key="w.title">
            <div>
              <div class="rounded-[8px] flex items-center justify-center mb-3" :style="`width:36px;height:36px;background:${w.bg};font-size:18px;`">{{ w.icon }}</div>
              <h3 class="font-['Schibsted_Grotesk'] font-bold text-[17px] leading-[normal] text-navy m-[0_0_10px]">{{ w.title }}</h3>
              <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.65] text-muted m-[0_0_12px]">{{ w.desc }}</p>
              <NuxtLink :to="w.to" class="arrow-row inline-flex items-center gap-2 font-['Hanken_Grotesk'] font-semibold text-[13.5px] leading-[normal] text-water">{{ w.cta }} <span class="arr">→</span></NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- History -->
      <section id="history" class="py-[60px] border-b border-b-[rgba(15,33,43,.08)]">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]">History</span>
        <div class="grid grid-cols-[1fr] gap-[48px] mt-[24px] min-[900px]:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.75] text-[#3a4d57] mb-[14px]">CUAHSI was incorporated in June 2001 following recognition of the need for the water science community to organize and extend the national and international research portfolio — particularly to develop shared infrastructure for investigating the behavior and effect of water in large and complex environmental systems.</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.75] text-[#3a4d57] mb-[14px]">The path to CUAHSI began two decades earlier. Following a reorganization at NSF in 1984 that discontinued the Hydrology and Hydraulics Program, the community spent years building the case for renewed investment. In 1991, the National Academies published <em>Opportunities in Hydrologic Sciences</em> — widely known as the "blue book" — establishing the case for a coordinated national infrastructure investment in hydrologic science.</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.75] text-[#3a4d57]">2026 marks CUAHSI's 25th anniversary. From 33 founding members to 101 today, the organization has grown alongside the field.</p>
          </div>
          <div class="flex flex-col gap-0">
            <div v-for="(t, i) in timeline" :key="t.year" class="flex gap-0 pb-[16px]">
              <div class="flex flex-col items-center mr-3 flex-none">
                <div class="rounded-full" :style="`width:8px;height:8px;flex-shrink:0;margin-top:4px;background:${i === timeline.length - 1 ? '#1F6FB2' : '#d1d5db'};`"></div>
                <div v-if="i < timeline.length - 1" class="w-[1px] bg-[#e5e7eb] flex-1 mt-[4px]"></div>
              </div>
              <div>
                <p class="font-mono text-[11px] text-muted mb-1">{{ t.year }}</p>
                <p class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[1.5] text-[#3a4d57]">{{ t.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- More about -->
      <section class="p-[48px_0_60px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">More about CUAHSI</p>
        <div class="grid grid-cols-[1fr] gap-[14px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(3,1fr)]">
          <NuxtLink v-for="l in [{t:'Our team',d:'20+ staff and contractors across research, engineering, programs, operations, and communications.',cta:'Meet the team',to:'/about/team'},{t:'Governance',d:'Board of Directors elected by membership, advisory committees, and organizational bylaws.',cta:'View governance',to:'/about/governance'},{t:'Membership',d:'Join a network of 100+ universities and organizations advancing water science together.',cta:'Learn about membership',to:'/about/membership'}]"
            :key="l.to" :to="l.to" class="card-lift rounded-card flex flex-col gap-2 border border-[rgba(15,33,43,.1)] p-[22px] no-underline">
            <p class="font-['Schibsted_Grotesk'] font-bold text-[16px] leading-[normal] text-navy">{{ l.t }}</p>
            <p class="font-['Hanken_Grotesk'] font-normal text-[13px] leading-[1.55] text-muted flex-1">{{ l.d }}</p>
            <span class="arrow-row inline-flex items-center gap-2 mt-2 font-['Hanken_Grotesk'] font-semibold text-[13px] leading-[normal] text-water">{{ l.cta }} <span class="arr">→</span></span>
          </NuxtLink>
        </div>
      </section>

      <!-- Contact -->
      <section id="contact" class="pb-[80px]">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4 text-[11px]">Contact us</p>
        <div class="rounded-card border border-[rgba(15,33,43,.1)] p-[24px] flex items-center justify-between gap-[20px] flex-wrap">
          <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.6] text-muted max-w-[440px]">Technical help, membership, paid work, or press — one page routes you to the right team.</p>
          <NuxtLink to="/contact" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold flex-none font-['Hanken_Grotesk'] text-[14px] leading-[normal] p-[12px_20px]">
            Get in touch <span class="arr">→</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
