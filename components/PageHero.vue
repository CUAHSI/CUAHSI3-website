<script setup lang="ts">
// The banner at the top of a page: a gradient band holding a container with, in this order, an optional
// line above (slot "before": a breadcrumb or a row of chips), a kicker label (slot "kicker"), the page
// heading (slot "title"), a lead paragraph (slot "lead") and anything after the lead (the default slot).
// Slot "top" sits above the container inside the band, for example a sub-nav row: at the top it is in the same place on every page of a section.
// Slot "below" sits under the container inside the band.
// The kicker, heading and lead elements are drawn only when their slot is given (a slot that is given
// but empty still draws an empty element), so a hero without a lead simply leaves #lead out.
//
// Extracted from the pages (roadmap task 3, heroes). The band, the kicker and the order of the parts are
// the pages' own. The pages differ in spacing and in heading and lead styles, so each page passes its own
// exact values in unchanged and the rendered HTML stays the same; making them consistent would change what
// visitors see and is a separate change.
//
// Pages pass Tailwind classes (containerClass, titleClass, leadClass); there are no style props.
defineProps<{
  sectionClass?: string     // e.g. "hero-section"
  containerClass?: string   // e.g. "mx-auto", "mx-auto site-container max-w-site pt-[64px]"
  titleClass?: string
  leadClass?: string
}>()
</script>

<template>
  <section class="bg-[linear-gradient(180deg,#FBFAF7,#F3EEE4)] border-b border-b-[rgba(15,33,43,.08)]" :class="sectionClass">
    <slot name="top" />
    <div :class="containerClass">
      <slot name="before" />
      <span v-if="$slots.kicker" class="font-mono font-bold tracking-[.14em] uppercase text-clay text-[12px]"><slot name="kicker" /></span>
      <h1 v-if="$slots.title" :class="titleClass"><slot name="title" /></h1>
      <p v-if="$slots.lead" :class="leadClass"><slot name="lead" /></p>
      <slot />
    </div>
    <slot name="below" />
  </section>
</template>
