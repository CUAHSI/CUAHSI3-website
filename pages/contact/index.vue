<script setup lang="ts">
useHead({
  title: 'Contact',
  meta: [{ name: 'description', content: 'Get in touch with CUAHSI — technical help, membership questions, paid work inquiries, or press.' }]
})

const routes = [
  {
    tag: 'TECHNICAL HELP',
    accent: 'oklch(0.55 0.13 245)',
    id: 'technical',
    title: 'Platform issues, accounts & data',
    desc: 'HydroShare, JupyterHub, HIS, Water Data Services, MATLAB Online — account issues, data questions, or something not working as expected.',
    who: 'Answered by CUAHSI engineering & support staff',
    time: 'Typical response: 1–2 business days',
    email: 'help@cuahsi.org',
  },
  {
    tag: 'MEMBERSHIP',
    accent: 'oklch(0.54 0.12 150)',
    id: 'membership',
    title: 'Joining, benefits & invoicing',
    desc: 'Questions about becoming a member institution, current benefits, dues, or invoicing for an existing membership.',
    who: 'Answered by CUAHSI membership staff',
    time: 'Typical response: 2–3 business days',
    email: 'membership@cuahsi.org',
    extraLink: { text: 'See membership benefits →', to: '/about/membership' },
  },
  {
    tag: 'PAID WORK',
    accent: 'oklch(0.52 0.13 290)',
    id: 'paid-work',
    title: 'Consulting, training & custom development',
    desc: 'Looking to hire CUAHSI staff for consulting, custom training, software development, or data curation work.',
    who: 'Routed directly to the Hire CUAHSI team',
    time: 'Typical response: 2–3 business days',
    cta: { text: 'Go to the quote form →', to: '/hire-cuahsi' },
  },
  {
    tag: 'PRESS & GENERAL',
    accent: 'oklch(0.53 0.12 200)',
    id: 'general',
    title: 'Everything else',
    desc: 'Press inquiries, partnership proposals, speaking requests, or anything that doesn\'t fit the categories above.',
    who: 'Answered by CUAHSI communications staff',
    time: 'Typical response: 3–5 business days',
    email: 'connect@cuahsi.org',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero section-class="hero-section" container-class="mx-auto site-container max-w-site pt-[64px] pb-[40px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[19px] leading-[1.55] text-[#3a4d57] max-w-[600px]">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-clay">Contact</span>
      </template>
      <template #title>
        Get in touch.
      </template>
      <template #lead>
        Pick the option below that matches what you need — it routes to the right team and the fastest response.
      </template>
    </PageHero>

    <!-- Routing cards -->
    <div class="mx-auto site-container max-w-site pt-[56px] pb-[80px]">
      <div class="grid grid-cols-[1fr] gap-[18px] min-[641px]:grid-cols-[1fr_1fr]">
        <div v-for="r in routes" :key="r.id" :id="r.id"
          class="bg-white flex flex-col"
          :style="`border:1px solid rgba(15,33,43,.1);border-top:3px solid ${r.accent};border-radius:14px;padding:26px 24px;`">
          <span class="font-mono font-bold tracking-[.06em] uppercase" :style="`font-size:11px;color:${r.accent};`">{{ r.tag }}</span>
          <h2 class="font-['Schibsted_Grotesk'] font-bold text-[21px] leading-[normal] text-navy m-[12px_0_10px]">{{ r.title }}</h2>
          <p class="font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[1.5] text-muted m-[0_0_16px] flex-1">{{ r.desc }}</p>

          <div class="flex flex-col gap-1 mb-4 pt-[16px] border-t border-t-[rgba(15,33,43,.1)]">
            <span class="font-['Hanken_Grotesk'] font-normal text-[12.5px] leading-[normal] text-muted">{{ r.who }}</span>
            <span class="font-mono text-[11px] text-muted">{{ r.time }}</span>
          </div>

          <a v-if="r.email" :href="`mailto:${r.email}`"
            class="inline-flex items-center gap-2"
            :style="`font:600 14px 'Hanken Grotesk';color:${r.accent};text-decoration:none;`">
            {{ r.email }}
          </a>
          <NuxtLink v-if="r.cta" :to="r.cta.to"
            :style="`font:600 14px 'Hanken Grotesk';color:${r.accent};text-decoration:none;`">
            {{ r.cta.text }}
          </NuxtLink>
          <NuxtLink v-if="r.extraLink" :to="r.extraLink.to"
            class="font-['Hanken_Grotesk'] font-medium text-[12.5px] leading-[normal] text-water no-underline mt-[8px]">
            {{ r.extraLink.text }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
