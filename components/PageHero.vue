<script setup lang="ts">
// The banner at the top of a page: a gradient band holding a container with, in this order, an optional
// line above (slot "before": a breadcrumb or a row of chips), a kicker label (slot "kicker"), the page
// heading (slot "title"), a lead paragraph (slot "lead") and anything after the lead (the default slot).
// Slot "below" sits under the container inside the band, for example a sub-nav row.
// The kicker, heading and lead elements are drawn only when their slot is given (a slot that is given
// but empty still draws an empty element), so a hero without a lead simply leaves #lead out.
//
// Extracted from the pages (roadmap task 3, heroes). The band, the kicker and the order of the parts are
// the pages' own. The pages differ in spacing and in heading and lead styles, so each page passes its own
// exact values in unchanged and the rendered HTML stays the same; making them consistent would change what
// visitors see and is a separate change.
defineProps<{
  sectionClass?: string     // e.g. "hero-section"
  containerClass?: string   // e.g. "mx-auto", "mx-auto site-container", "mx-auto rgrid rgrid-split"
  containerStyle?: string
  titleStyle?: string
  leadStyle?: string
}>()
</script>

<template>
  <section :class="sectionClass" style="background:linear-gradient(180deg,#FBFAF7,#F3EEE4);border-bottom:1px solid rgba(15,33,43,.08);">
    <div :class="containerClass" :style="containerStyle">
      <slot name="before" />
      <span v-if="$slots.kicker" class="font-mono font-bold tracking-[.14em] uppercase text-clay" style="font-size:12px;"><slot name="kicker" /></span>
      <h1 v-if="$slots.title" :style="titleStyle"><slot name="title" /></h1>
      <p v-if="$slots.lead" :style="leadStyle"><slot name="lead" /></p>
      <slot />
    </div>
    <slot name="below" />
  </section>
</template>
