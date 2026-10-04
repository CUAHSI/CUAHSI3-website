<script setup lang="ts">
useHead({
  title: 'Support CUAHSI',
  meta: [{ name: 'description', content: 'Your donation helps CUAHSI sustain free data infrastructure, training, and fellowships for the water science community beyond what federal grants can fund.' }]
})
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero section-class="hero-section" container-class="mx-auto site-container max-w-site pt-[64px] pb-[44px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(36px,4.4vw,54px)] leading-[1.04] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[700px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[19px] leading-[1.55] text-[#3a4d57] max-w-[600px]">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase text-[12px] text-clay">Support CUAHSI</span>
      </template>
      <template #title>
        Help sustain the water science community.
      </template>
      <template #lead>
        Your donation supports ongoing programming, continuity of services, and the seeds for growth beyond what our federal grants can fund.
      </template>
    </PageHero>

    <div class="mx-auto site-container max-w-site pt-[56px]">

      <!-- Testimonial -->
      <div class="grid grid-cols-[1fr] gap-[48px] items-center mb-[56px] min-[900px]:grid-cols-[1fr_1fr]">
        <div>
          <div class="rounded-[16px] bg-navy p-[36px_32px]">
            <p class="font-['Schibsted_Grotesk'] font-normal text-[18px] leading-[1.6] text-white italic m-[0_0_18px]">
              "CUAHSI has been an invaluable resource to me as a graduate student, connecting me to funding opportunities, research experiences, and a network of colleagues. This includes wonderful summers in Tuscaloosa at the Summer Institute, dissertation research in Delft, the Netherlands through the Pathfinder Fellowship, and meet-and-greets at AGU."
            </p>
            <p class="font-mono text-[12px] tracking-[.04em] text-water-soft">— Lauren Grimley, Ph.D.</p>
            <p class="font-mono text-[11px] text-[#7fa4bf] mt-[2px]">Postdoctoral Associate, University of North Carolina at Chapel Hill</p>
          </div>
        </div>
        <div>
          <p class="font-['Schibsted_Grotesk'] font-bold text-[20px] leading-[normal] text-navy m-[0_0_14px]">Where your gift goes.</p>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.7] text-[#3a4d57] m-[0_0_16px]">Federal grants fund most of CUAHSI's work — but not all of it, and not always reliably. Donations fill that gap, supporting:</p>
          <ul class="flex flex-col gap-[10px] list-none p-0 m-0">
            <li v-for="pt in [
              'Salaries for the full-time staff who keep CUAHSI running',
              'Fellowships and research grants for students and early-career researchers',
              'Free data storage, management, and publishing through HydroShare',
              'Education through the CUAHSI Virtual University and HydroLearn',
              'Cyberseminars, workshops, and community meetings',
              'Continuity of services during a government shutdown or funding disruption',
            ]" :key="pt" class="flex items-start gap-3 font-['Hanken_Grotesk'] font-normal text-[14.5px] leading-[normal] text-[#3a4d57]">
              <span class="rounded-full flex-none mt-[6px] w-[7px] h-[7px] bg-water-bright"></span>
              {{ pt }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Donate form -->
      <div class="rounded-[16px] bg-sand p-[40px] mb-[56px]">
        <div class="text-center mb-[28px]">
          <p class="font-['Schibsted_Grotesk'] font-bold text-[24px] leading-[normal] text-navy m-[0_0_10px]">Donate to CUAHSI</p>
          <p class="font-['Hanken_Grotesk'] font-normal text-[15px] leading-[1.6] text-[#3a4d57] max-w-[520px] m-[0_auto]">
            Donations are processed securely through Zeffy, at no cost to CUAHSI — 100% of your gift goes directly to our programs.
            Please review <a href="https://www.cuahsi.org/uploads/pages/img/Zeffy-Donor-Information.pdf" target="_blank" class="text-water">donor information</a> before completing your transaction.
          </p>
        </div>
        <div class="rounded-[12px] overflow-hidden bg-white border border-[rgba(15,33,43,.1)] max-w-[640px] m-[0_auto]">
          <iframe
            title="Donation form powered by Zeffy"
            src="https://www.zeffy.com/en-US/embed/donation-form/1d9a8cef-4275-4db4-8461-5de35d048ebb"
            class="w-full h-[1200px] block"
            allowpaymentrequest="true"
            allowtransparency="true">
          </iframe>
        </div>
      </div>

      <!-- Contact -->
      <div class="rounded-card border border-[rgba(15,33,43,.1)] p-[24px] flex items-center justify-between gap-[20px] flex-wrap mb-[80px]">
        <div>
          <p class="font-['Hanken_Grotesk'] font-semibold text-[15px] leading-[normal] text-navy m-[0_0_4px]">Questions about giving?</p>
          <p class="font-['Hanken_Grotesk'] font-normal text-[13.5px] leading-[normal] text-muted">We're glad to talk through options, matching gifts, or planned giving.</p>
        </div>
        <a href="mailto:donate@cuahsi.org" class="arrow-row inline-flex items-center gap-2 rounded-btn font-semibold flex-none font-['Hanken_Grotesk'] text-[14px] leading-[normal] text-navy p-[11px_20px] border-[1.5px] border-[rgba(15,46,68,.22)]">
          donate@cuahsi.org <span class="arr">→</span>
        </a>
      </div>
    </div>
  </div>
</template>
