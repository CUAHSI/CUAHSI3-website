<script setup lang="ts">
useHead({ title: 'Governance' })
</script>
<template>
  <div>
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 52px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:14px 0 14px;"
      lead-style="font:400 16px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:560px;">
      <template #kicker>About · Governance</template>
      <template #title>Board, committees, and bylaws.</template>
      <template #lead>CUAHSI is governed by a Board of Directors elected by its member institutions, with input from advisory committees open to any interested water scientist.</template>
    </PageHero>
    <div class="mx-auto" style="max-width:1240px;padding:52px 40px 80px;">
      <section id="advisory-committees" style="margin-bottom:52px;">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">Advisory committees</p>
        <p style="font:400 15px/1.65 'Hanken Grotesk';color:#3a4d57;max-width:580px;margin-bottom:24px;">Advisory committees on informatics, education and outreach, and instrumentation are open to any interested individual regardless of membership status. Committees meet virtually throughout the year and inform CUAHSI's strategic direction.</p>
        <a href="mailto:connect@cuahsi.org" style="font:600 14px 'Hanken Grotesk';color:#1F6FB2;">Contact us to get involved →</a>
      </section>
      <section style="margin-bottom:52px;">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">Documents</p>
        <div class="rgrid rgrid-multi" style="display:grid;gap:12px;--cols:repeat(3,1fr);">
          <a v-for="d in [{t:'Bylaws',d:'CUAHSI governing bylaws, last updated July 2024.',h:'https://www.cuahsi.org/uploads/library/doc/2024-07-24-Bylaws_Final.docx.pdf'},{t:'Strategic Plan 2023–2028',d:'CUAHSI strategic direction for building a sustainable organization.',h:'https://www.cuahsi.org/uploads/pages/img/Strategic-Plan-2023-Final.1.pdf'},{t:'2025 Annual Report',d:'Progress across HydroShare, training programs, and research in 2025.',h:'https://www.cuahsi.org/uploads/pages/img/2025-Annual-Report_Final_reduced.pdf'}]"
            :key="d.t" :href="d.h" target="_blank" class="card-lift rounded-card" style="border:1px solid rgba(15,33,43,.1);padding:20px;text-decoration:none;">
            <p style="font:700 15px 'Schibsted Grotesk';color:#0F2E44;margin-bottom:6px;">{{ d.t }}</p>
            <p style="font:400 13px/1.5 'Hanken Grotesk';color:#5C6E78;margin-bottom:10px;">{{ d.d }}</p>
            <span style="font:600 13px 'Hanken Grotesk';color:#1F6FB2;">Download PDF ↗</span>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
