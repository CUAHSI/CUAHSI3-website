<script setup lang="ts">
// A story's or an event's picture (the `image` block in a content/research/ or content/events/ file), filling its box: the parent is `relative` with a fixed height or aspect
// ratio. `fit: contain` shows a diagram whole (cover would crop its labels); `position` moves the crop. The parent keeps its placeholder
// background underneath, so a story with no picture looks as it always did.
// `decorative` gives the picture an empty alt: on a card the title beside it already says what the story is, and a link that contains the picture's
// description would read it out before every title. The story page shows the picture with its alt text.
defineProps<{ image: { src: string; alt: string; fit?: string; position?: string }; eager?: boolean; decorative?: boolean }>()
</script>
<template>
  <img :src="image.src" :alt="decorative ? '' : image.alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" class="absolute inset-0 h-full w-full"
    :style="`object-fit:${image.fit ?? 'cover'};object-position:${image.position ?? 'center'};`" />
</template>
