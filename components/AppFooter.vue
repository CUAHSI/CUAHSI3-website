<template>
  <footer class="bg-navy-deep text-[#bcd4e6]">
    <div class="mx-auto site-container max-w-site pt-[60px]">
      <div class="footer-grid grid grid-cols-1 gap-[40px] pb-[48px] sm:grid-cols-2 min-[900px]:grid-cols-[1.4fr_1fr_1fr_1fr]">

        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-5">
            <span class="relative flex-none w-[32px] h-[32px] rounded-[50%] overflow-hidden">
              <span class="absolute inset-0 bottom-1/2 bg-water-bright"></span>
              <span class="absolute inset-0 top-1/2 bg-navy"></span>
              <span class="absolute left-0 right-0 top-[50%] h-[2px] bg-navy-deep [transform:translateY(-1px)]"></span>
            </span>
            <span class="font-['Schibsted_Grotesk'] font-extrabold text-[18px] leading-[normal] text-white">CUAHSI</span>
          </div>
          <p class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[1.6] text-[#7fa4bf] max-w-[280px] mb-[20px]">
            A consortium of 100+ universities advancing water science through shared infrastructure and community.
          </p>
          <div class="flex gap-4">
            <a href="https://bsky.app/profile/cuahsi.bsky.social" target="_blank" class="font-mono text-[11px] tracking-[.06em] transition-colors text-[#6a8ea9]">BLUESKY</a>
            <a href="https://www.youtube.com/CUAHSI" target="_blank" class="font-mono text-[11px] tracking-[.06em] transition-colors text-[#6a8ea9]">YOUTUBE</a>
            <a href="https://www.linkedin.com/company/consortium-of-universities-for-the-advancement-of-hydrologic-science-inc-cuahsi-" target="_blank" class="font-mono text-[11px] tracking-[.06em] transition-colors text-[#6a8ea9]">LINKEDIN</a>
          </div>
        </div>

        <!-- Explore -->
        <div>
          <p class="font-mono text-[11px] tracking-[.1em] uppercase mb-5 text-[#6a8ea9]">Explore</p>
          <div class="flex flex-col gap-3">
            <NuxtLink v-for="l in [{t:'Data & Computing',h:'/data-platforms'},{t:'Learn & Train',h:'/learn-train'},{t:'Community',h:'/community'},{t:'Hire CUAHSI',h:'/hire-cuahsi'},{t:'About',h:'/about'},{t:'Impact',h:'/about/impact'}]"
              :key="l.h" :to="l.h" class="transition-colors font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-[#7fa4bf] no-underline">
              {{ l.t }}
            </NuxtLink>
          </div>
        </div>

        <!-- Tools -->
        <div>
          <p class="font-mono text-[11px] tracking-[.1em] uppercase mb-5 text-[#6a8ea9]">Tools</p>
          <div class="flex flex-col gap-3">
            <a v-for="l in [{t:'HydroShare',h:'https://www.hydroshare.org'},{t:'JupyterHub',h:'https://jupyter.cuahsi.org'},{t:'Water Services',h:'https://data.cuahsi.org/'},{t:'MATLAB Online',h:'https://www.cuahsi.org/matlab'}]"
              :key="l.h" :href="l.h" target="_blank" class="transition-colors font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-[#7fa4bf] no-underline">
              {{ l.t }}
            </a>
          </div>
        </div>

        <!-- Connect -->
        <div>
          <p class="font-mono text-[11px] tracking-[.1em] uppercase mb-5 text-[#6a8ea9]">Connect</p>
          <div class="flex flex-col gap-3">
            <NuxtLink v-for="l in [{t:'Newsletter',h:'/community/newsletter'},{t:'Events',h:'/community/events'},{t:'Job board',h:'/community/jobs'},{t:'News',h:'/community/news'},{t:'Campus visits',h:'/community/campus-visits'}]"
              :key="l.h" :to="l.h" class="transition-colors font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-[#7fa4bf] no-underline">
              {{ l.t }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-t-[rgba(255,255,255,.08)]">
      <div class="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 site-container max-w-site pt-[16px] pb-[16px]">
        <span class="font-mono text-[11px] tracking-[.04em] text-center text-[#6a8ea9]">© 2026 CUAHSI · A 501(c)(3) nonprofit</span>
        <span class="font-mono text-[11px] tracking-[.04em] text-center text-[#6a8ea9]">Supported by the National Science Foundation</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr !important; }
}
</style>
