<script setup lang="ts">
const stats = [
  { n: '96',     l: 'Member institutions' },
  { n: '16K+',   l: 'HydroShare users' },
  { n: '350+',   l: 'Cyberseminars archived' },
  { n: '4,000+', l: 'Community subscribers' },
]
</script>

<template>
  <section class="bg-navy text-white">
    <div class="mx-auto stats-grid site-container max-w-site pt-[36px] pb-[36px] grid grid-cols-[1fr] gap-[20px] sm:grid-cols-[repeat(2,1fr)] min-[900px]:grid-cols-[repeat(4,1fr)]">
      <div v-for="(s, i) in stats" :key="s.l"
        class="stats-item"
        :style="`padding:6px 28px;border-left:1px solid rgba(255,255,255,${i === 0 ? '0' : '.14'});`">
        <div class="font-['Schibsted_Grotesk'] font-bold text-[clamp(34px,3.6vw,46px)] leading-[1] text-water-soft">{{ s.n }}</div>
        <div class="font-mono text-[13px] tracking-[.04em] mt-2 text-[#bcd4e6]">{{ s.l }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  .stats-item { border-left: none !important; padding-left: 0 !important; }
}
</style>
