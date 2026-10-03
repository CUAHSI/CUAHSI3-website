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
    <section style="background:linear-gradient(180deg,#FBFAF7,#F3EEE4);border-bottom:1px solid rgba(15,33,43,.08);">
      <div class="mx-auto" style="max-width:1240px;padding:64px 40px 52px;">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">About CUAHSI</span>
        <h1 style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;max-width:700px;">Advancing water science through shared infrastructure and community.</h1>
        <p style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:580px;margin-bottom:24px;">The Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI) is a 501(c)(3) research organization representing 101 U.S. universities and international water science organizations.</p>
        <div class="flex gap-3 flex-wrap">
          <a href="https://www.cuahsi.org/uploads/pages/doc/2025-About-CUAHSI-Flyer-2.pdf" target="_blank" class="arrow-row inline-flex items-center gap-2 rounded-btn" style="font:600 14px 'Hanken Grotesk';color:#0F2E44;padding:11px 18px;border:1.5px solid rgba(15,46,68,.22);">Download brochure <span class="arr">→</span></a>
          <a href="https://www.cuahsi.org/uploads/pages/img/2025-Annual-Report_Final_reduced.pdf" target="_blank" class="arrow-row inline-flex items-center gap-2 rounded-btn" style="font:600 14px 'Hanken Grotesk';color:#0F2E44;padding:11px 18px;border:1.5px solid rgba(15,46,68,.22);">2025 Annual Report <span class="arr">→</span></a>
        </div>
      </div>

      <!-- Sub-nav -->
      <div class="mx-auto" style="max-width:1240px;padding:0 40px;">
        <div class="flex gap-0" style="border-top:1px solid rgba(15,33,43,.08);overflow-x:auto;">
          <a v-for="l in [{t:'Mission & values',h:'#mission'},{t:'What we do',h:'#what-we-do'},{t:'History',h:'#history'},{t:'Our team',h:'/about/team'},{t:'Governance',h:'/about/governance'},{t:'Membership',h:'/about/membership'},{t:'Impact',h:'/about/impact'},{t:'Contact',h:'#contact'}]"
            :key="l.h" :href="l.h" style="font:500 13px 'Hanken Grotesk';color:#5C6E78;padding:14px 16px 14px 0;text-decoration:none;white-space:nowrap;"
            class="hover:text-navy transition-colors">
            {{ l.t }}
          </a>
        </div>
      </div>
    </section>

    <div class="mx-auto" style="max-width:1240px;padding:0 40px;">

      <!-- Mission / Vision / Values -->
      <section id="mission" style="padding:60px 0;border-bottom:1px solid rgba(15,33,43,.08);">
        <div class="rgrid rgrid-multi" style="display:grid;border:1px solid rgba(15,33,43,.1);border-radius:12px;overflow:hidden;--cols:1fr 1fr 1fr;">
          <div style="padding:24px;border-right:1px solid rgba(15,33,43,.08);">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted" style="font-size:10px;margin-bottom:10px;">Mission</p>
            <p style="font:400 14px/1.65 'Hanken Grotesk';color:#3a4d57;">To empower the water community and advance science through collaboration, infrastructure, and education.</p>
          </div>
          <div style="padding:24px;border-right:1px solid rgba(15,33,43,.08);">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted" style="font-size:10px;margin-bottom:10px;">Vision</p>
            <p style="font:400 14px/1.65 'Hanken Grotesk';color:#3a4d57;">A thriving water community — enabled by shared resources — developing an integrated understanding of water, earth, ecosystems, and society.</p>
          </div>
          <div style="padding:24px;">
            <p class="font-mono font-bold tracking-[.1em] uppercase text-muted" style="font-size:10px;margin-bottom:10px;">Values</p>
            <div class="flex flex-col gap-[6px]">
              <div v-for="v in [['Strategic collaborators','connecting people and institutions across water science'],['Innovative catalysts','making high-value tools and ideas accessible to all'],['Impactful leaders','delivering lasting change for the greater good']]" :key="v[0]">
                <span style="font:500 13px 'Hanken Grotesk';color:#15212B;">{{ v[0] }}</span>
                <span style="font:400 13px 'Hanken Grotesk';color:#5C6E78;"> — {{ v[1] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What we do -->
      <section id="what-we-do" style="padding:60px 0;border-bottom:1px solid rgba(15,33,43,.08);">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">What we do</span>
        <h2 style="font:700 clamp(26px,3vw,36px)/1.1 'Schibsted Grotesk';color:#0F2E44;letter-spacing:-.016em;margin:14px 0 14px;">Three core capabilities.</h2>
        <p style="font:400 15px/1.65 'Hanken Grotesk';color:#3a4d57;max-width:620px;margin-bottom:32px;">CUAHSI fosters a diverse and dynamic water science community enabled by shared scientific infrastructure. Our programs are available to everyone — students, educators, agencies, and community scientists.</p>
        <div class="rgrid rgrid-multi" style="display:grid;gap:24px;--cols:repeat(3,1fr);">
          <div v-for="w in [
            {icon:'🗄️',bg:'#E1F5EE',title:'Data infrastructure',desc:'We operate HydroShare, the water science community platform for publishing, sharing, and collaborating on data, models, and code. We build software that makes it easier to find, manage, and publish data following FAIR principles.',cta:'Explore tools & platforms',to:'/data-platforms'},
            {icon:'🎓',bg:'#EDE9FE',title:'Training & community',desc:'We deliver field workshops, virtual university courses, cyberseminars, fellowships, and summer institutes that build skills and connect water scientists at every career stage.',cta:'Browse training',to:'/learn-train'},
            {icon:'🔬',bg:'#EFF6FF',title:'Cyberinfrastructure & data innovation',desc:'Our research team develops new software, standards, and frameworks that advance the way water data is collected, modeled, and shared — including cloud computing tools and model evaluation frameworks.',cta:'Browse highlights',to:'/highlights'},
          ]" :key="w.title">
            <div>
              <div class="rounded-[8px] flex items-center justify-center mb-3" :style="`width:36px;height:36px;background:${w.bg};font-size:18px;`">{{ w.icon }}</div>
              <h3 style="font:700 17px 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;">{{ w.title }}</h3>
              <p style="font:400 14px/1.65 'Hanken Grotesk';color:#5C6E78;margin:0 0 12px;">{{ w.desc }}</p>
              <NuxtLink :to="w.to" class="arrow-row inline-flex items-center gap-2" style="font:600 13.5px 'Hanken Grotesk';color:#1F6FB2;">{{ w.cta }} <span class="arr">→</span></NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- History -->
      <section id="history" style="padding:60px 0;border-bottom:1px solid rgba(15,33,43,.08);">
        <span class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;">History</span>
        <div class="rgrid rgrid-split" style="display:grid;gap:48px;margin-top:24px;--cols:minmax(0,1fr) 260px;">
          <div>
            <p style="font:400 15px/1.75 'Hanken Grotesk';color:#3a4d57;margin-bottom:14px;">CUAHSI was incorporated in June 2001 following recognition of the need for the water science community to organize and extend the national and international research portfolio — particularly to develop shared infrastructure for investigating the behavior and effect of water in large and complex environmental systems.</p>
            <p style="font:400 15px/1.75 'Hanken Grotesk';color:#3a4d57;margin-bottom:14px;">The path to CUAHSI began two decades earlier. Following a reorganization at NSF in 1984 that discontinued the Hydrology and Hydraulics Program, the community spent years building the case for renewed investment. In 1991, the National Academies published <em>Opportunities in Hydrologic Sciences</em> — widely known as the "blue book" — establishing the case for a coordinated national infrastructure investment in hydrologic science.</p>
            <p style="font:400 15px/1.75 'Hanken Grotesk';color:#3a4d57;">2026 marks CUAHSI's 25th anniversary. From 33 founding members to 101 today, the organization has grown alongside the field.</p>
          </div>
          <div class="flex flex-col gap-0">
            <div v-for="(t, i) in timeline" :key="t.year" style="display:flex;gap:0;padding-bottom:16px;">
              <div class="flex flex-col items-center mr-3 flex-none">
                <div class="rounded-full" :style="`width:8px;height:8px;flex-shrink:0;margin-top:4px;background:${i === timeline.length - 1 ? '#1F6FB2' : '#d1d5db'};`"></div>
                <div v-if="i < timeline.length - 1" style="width:1px;background:#e5e7eb;flex:1;margin-top:4px;"></div>
              </div>
              <div>
                <p class="font-mono text-[11px] text-muted mb-1">{{ t.year }}</p>
                <p style="font:400 12.5px/1.5 'Hanken Grotesk';color:#3a4d57;">{{ t.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- More about -->
      <section style="padding:48px 0 60px;">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">More about CUAHSI</p>
        <div class="rgrid rgrid-multi" style="display:grid;gap:14px;--cols:repeat(3,1fr);">
          <NuxtLink v-for="l in [{t:'Our team',d:'20+ staff and contractors across research, engineering, programs, operations, and communications.',cta:'Meet the team',to:'/about/team'},{t:'Governance',d:'Board of Directors elected by membership, advisory committees, and organizational bylaws.',cta:'View governance',to:'/about/governance'},{t:'Membership',d:'Join a network of 100+ universities and organizations advancing water science together.',cta:'Learn about membership',to:'/about/membership'}]"
            :key="l.to" :to="l.to" class="card-lift rounded-card flex flex-col gap-2" style="border:1px solid rgba(15,33,43,.1);padding:22px;text-decoration:none;">
            <p style="font:700 16px 'Schibsted Grotesk';color:#0F2E44;">{{ l.t }}</p>
            <p style="font:400 13px/1.55 'Hanken Grotesk';color:#5C6E78;flex:1;">{{ l.d }}</p>
            <span class="arrow-row inline-flex items-center gap-2 mt-2" style="font:600 13px 'Hanken Grotesk';color:#1F6FB2;">{{ l.cta }} <span class="arr">→</span></span>
          </NuxtLink>
        </div>
      </section>

      <!-- Contact -->
      <section id="contact" style="padding-bottom:80px;">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">Contact us</p>
        <div class="rounded-card" style="border:1px solid rgba(15,33,43,.1);padding:24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
          <p style="font:400 14px/1.6 'Hanken Grotesk';color:#5C6E78;max-width:440px;">Technical help, membership, paid work, or press — one page routes you to the right team.</p>
          <NuxtLink to="/contact" class="arrow-row inline-flex items-center gap-[9px] bg-navy text-white rounded-btn font-semibold flex-none" style="font:600 14px 'Hanken Grotesk';padding:12px 20px;">
            Get in touch <span class="arr">→</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
