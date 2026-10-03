<script setup lang="ts">
// A pill button used in filter rows. The page keeps its own filter logic and passes @click, which falls
// through to the button. The four looks are the ones the pages had before (roadmap task 3, filter chips):
//   navy      about/membership, learn-train/cyberseminars
//   gray      community/jobs, community/events
//   category  about/impact, the category row (needs `color`, the chip's own colour)
//   year      about/impact, the year row
// The style strings are the pages' own, unchanged, so the rendered HTML does not change.
const props = defineProps<{
  active: boolean
  variant: 'navy' | 'gray' | 'category' | 'year'
  color?: string
}>()

const style = computed(() => {
  const a = props.active
  switch (props.variant) {
    case 'navy':
      return `font:600 12.5px 'Hanken Grotesk';padding:6px 13px;border-radius:22px;border:1px solid ${a ? '#0F2E44' : 'rgba(15,33,43,.18)'};background:${a ? '#0F2E44' : 'transparent'};color:${a ? '#fff' : '#3a4d57'};cursor:pointer;`
    case 'gray':
      return `font-size:12px;padding:5px 12px;border-radius:99px;cursor:pointer;border:0.5px solid ${a ? '#111827' : '#d1d5db'};background:${a ? '#111827' : 'transparent'};color:${a ? 'white' : '#6b7280'};`
    case 'category':
      return `border:1px solid ${a ? props.color : 'rgba(15,33,43,.18)'};background:${a ? props.color : 'transparent'};color:${a ? '#fff' : '#3a4d57'};cursor:pointer;font:600 13px 'Hanken Grotesk';padding:8px 15px;border-radius:22px;`
    case 'year':
      return `border:1px solid ${a ? '#0F2E44' : 'rgba(15,33,43,.18)'};background:${a ? '#0F2E44' : 'transparent'};color:${a ? '#fff' : '#3a4d57'};cursor:pointer;font:600 12px 'Space Mono',monospace;padding:7px 12px;border-radius:6px;`
  }
})
</script>

<template>
  <button :style="style"><slot /></button>
</template>
