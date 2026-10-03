<script setup lang="ts">
useHead({
  title: 'Support CUAHSI · CUAHSI',
  meta: [{ name: 'description', content: 'Your donation helps CUAHSI sustain free data infrastructure, training, and fellowships for the water science community beyond what federal grants can fund.' }]
})
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero section-class="hero-section" container-class="mx-auto site-container" container-style="max-width:1240px;padding-top:64px;padding-bottom:44px;"
      title-style="font:700 clamp(36px,4.4vw,54px)/1.04 'Schibsted Grotesk';letter-spacing:-.022em;color:#0F2E44;margin:16px 0 16px;max-width:700px;"
      lead-style="font:400 19px/1.55 'Hanken Grotesk';color:#3a4d57;max-width:600px;">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#C0603C;">Support CUAHSI</span>
      </template>
      <template #title>
        Help sustain the water science community.
      </template>
      <template #lead>
        Your donation supports ongoing programming, continuity of services, and the seeds for growth beyond what our federal grants can fund.
      </template>
    </PageHero>

    <div class="mx-auto site-container" style="max-width:1240px;padding-top:56px;">

      <!-- Testimonial -->
      <div class="rgrid rgrid-split" style="display:grid;gap:48px;align-items:center;margin-bottom:56px;--cols:1fr 1fr;">
        <div>
          <div class="rounded-[16px]" style="background:#0F2E44;padding:36px 32px;">
            <p style="font:400 18px/1.6 'Schibsted Grotesk';color:#fff;font-style:italic;margin:0 0 18px;">
              "CUAHSI has been an invaluable resource to me as a graduate student, connecting me to funding opportunities, research experiences, and a network of colleagues. This includes wonderful summers in Tuscaloosa at the Summer Institute, dissertation research in Delft, the Netherlands through the Pathfinder Fellowship, and meet-and-greets at AGU."
            </p>
            <p class="font-mono text-[12px] tracking-[.04em]" style="color:#7fc0ee;">— Lauren Grimley, Ph.D.</p>
            <p class="font-mono text-[11px]" style="color:#7fa4bf;margin-top:2px;">Postdoctoral Associate, University of North Carolina at Chapel Hill</p>
          </div>
        </div>
        <div>
          <p style="font:700 20px 'Schibsted Grotesk';color:#0F2E44;margin:0 0 14px;">Where your gift goes.</p>
          <p style="font:400 15px/1.7 'Hanken Grotesk';color:#3a4d57;margin:0 0 16px;">Federal grants fund most of CUAHSI's work — but not all of it, and not always reliably. Donations fill that gap, supporting:</p>
          <ul class="flex flex-col gap-[10px]" style="list-style:none;padding:0;margin:0;">
            <li v-for="pt in [
              'Salaries for the full-time staff who keep CUAHSI running',
              'Fellowships and research grants for students and early-career researchers',
              'Free data storage, management, and publishing through HydroShare',
              'Education through the CUAHSI Virtual University and HydroLearn',
              'Cyberseminars, workshops, and community meetings',
              'Continuity of services during a government shutdown or funding disruption',
            ]" :key="pt" class="flex items-start gap-3" style="font:400 14.5px 'Hanken Grotesk';color:#3a4d57;">
              <span class="rounded-full flex-none mt-[6px]" style="width:7px;height:7px;background:#2A86C9;"></span>
              {{ pt }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Donate form -->
      <div class="rounded-[16px]" style="background:#F3EEE4;padding:40px;margin-bottom:56px;">
        <div style="text-align:center;margin-bottom:28px;">
          <p style="font:700 24px 'Schibsted Grotesk';color:#0F2E44;margin:0 0 10px;">Donate to CUAHSI</p>
          <p style="font:400 15px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:520px;margin:0 auto;">
            Donations are processed securely through Zeffy, at no cost to CUAHSI — 100% of your gift goes directly to our programs.
            Please review <a href="https://www.cuahsi.org/uploads/pages/img/Zeffy-Donor-Information.pdf" target="_blank" style="color:#1F6FB2;">donor information</a> before completing your transaction.
          </p>
        </div>
        <div class="rounded-[12px] overflow-hidden" style="background:#fff;border:1px solid rgba(15,33,43,.1);max-width:640px;margin:0 auto;">
          <iframe
            title="Donation form powered by Zeffy"
            src="https://www.zeffy.com/en-US/embed/donation-form/1d9a8cef-4275-4db4-8461-5de35d048ebb"
            style="width:100%;height:1200px;border:none;display:block;"
            allowpaymentrequest="true"
            allowtransparency="true">
          </iframe>
        </div>
      </div>

      <!-- Contact -->
      <div class="rounded-card" style="border:1px solid rgba(15,33,43,.1);padding:24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:80px;">
        <div>
          <p style="font:600 15px 'Hanken Grotesk';color:#0F2E44;margin:0 0 4px;">Questions about giving?</p>
          <p style="font:400 13.5px 'Hanken Grotesk';color:#5C6E78;">We're glad to talk through options, matching gifts, or planned giving.</p>
        </div>
        <a href="mailto:donate@cuahsi.org" class="arrow-row inline-flex items-center gap-2 rounded-btn font-semibold flex-none" style="font:600 14px 'Hanken Grotesk';color:#0F2E44;padding:11px 20px;border:1.5px solid rgba(15,46,68,.22);">
          donate@cuahsi.org <span class="arr">→</span>
        </a>
      </div>
    </div>
  </div>
</template>
