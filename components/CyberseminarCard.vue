<script setup lang="ts">
// One cyberseminar card. Extracted from pages/learn-train/cyberseminars/index.vue (roadmap task 3);
// the collapsed card's markup, classes and inline styles are exactly the page's. The page keeps the
// "which card is expanded" state and passes it in; clicking the thumbnail asks the page to toggle.
//
// Open state (task A): the card spans the whole grid row and shows a large player in place of the
// thumbnail, with a Close button. That new markup uses Tailwind classes only, no inline styles.
// A card with no video id never opens (its click still asks the page to toggle, so it closes any other
// open card, as before). While open the card drops the hover lift, so the player does not move under the mouse.
const props = defineProps<{ seminar: any; expanded: boolean }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const isOpen = computed(() => props.expanded && !!props.seminar.youtube_id)

function ytThumb(id: string) { return `https://img.youtube.com/vi/${id}/mqdefault.jpg` }

// When a card opens it can move to a row of its own, so bring it to the top of the screen
// (below the sticky header, see scroll-mt on the root). Client only; never runs during the build.
const root = ref<HTMLElement | null>(null)

// Keyboard: the thumbnail is a button (Enter or Space opens it). Opening replaces the thumbnail with the player,
// so focus moves to the Close button; closing with that button puts focus back on the thumbnail. Focus is only
// put back when this card was closed with its own Close button (not when another card opened).
const thumbEl = ref<HTMLElement | null>(null)
const closeEl = ref<HTMLButtonElement | null>(null)
let restoreFocus = false
function closeVideo() { restoreFocus = true; emit('toggle') }

watch(isOpen, (open) => {
  if (!open) {
    if (restoreFocus) { restoreFocus = false; nextTick(() => thumbEl.value?.focus()) }
    return
  }
  nextTick(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    root.value?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
    closeEl.value?.focus({ preventScroll: true })
  })
})
</script>

<template>
  <div ref="root" :class="isOpen ? 'bg-white rounded-card overflow-hidden flex flex-col col-span-full scroll-mt-28' : 'card-lift bg-white rounded-card overflow-hidden flex flex-col'" style="border:1px solid rgba(15,33,43,.1);">
    <!-- Thumbnail or placeholder (replaced by the large player while open) -->
    <div v-if="!isOpen" ref="thumbEl" class="relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-water" style="height:160px;" @click="$emit('toggle')"
      :role="seminar.youtube_id ? 'button' : undefined" :tabindex="seminar.youtube_id ? 0 : undefined" :aria-label="seminar.youtube_id ? `Play video: ${seminar.title}` : undefined"
      @keydown.enter.prevent="$emit('toggle')" @keydown.space.prevent="$emit('toggle')">
      <img v-if="seminar.youtube_id" :src="ytThumb(seminar.youtube_id)" :alt="seminar.title" style="width:100%;height:100%;object-fit:cover;" />
      <div v-else class="w-full h-full flex items-center justify-center" style="background:linear-gradient(150deg,#10324c,#1F6FB2);">
        <span class="font-mono font-bold tracking-[.1em]" style="font-size:11px;color:rgba(255,255,255,.7);">NO VIDEO YET</span>
      </div>
      <!-- Play overlay -->
      <div v-if="seminar.youtube_id && !expanded" class="absolute inset-0 flex items-center justify-center" style="background:rgba(0,0,0,.25);">
        <div class="rounded-full bg-white flex items-center justify-center" style="width:44px;height:44px;opacity:.9;">
          <svg width="16" height="16" viewBox="0 0 20 20"><polygon points="6,4 16,10 6,16" fill="#0F2E44"/></svg>
        </div>
      </div>
      <span v-if="seminar.has_transcript" class="absolute font-mono font-bold text-white rounded-[4px]" style="right:10px;top:10px;font-size:9.5px;background:rgba(31,159,85,.9);padding:3px 7px;">TRANSCRIPT ✓</span>
    </div>
    <!-- Large player when open -->
    <div v-if="isOpen" class="bg-black">
      <div class="mx-auto aspect-video w-full max-w-[880px]">
        <iframe :src="`https://www.youtube-nocookie.com/embed/${seminar.youtube_id}?autoplay=1&rel=0`" :title="seminar.title" class="h-full w-full border-0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="flex flex-col flex-1" style="padding:16px;">
      <div class="flex items-center gap-2 mb-2 flex-wrap">
        <span class="font-mono text-[10px] text-muted">{{ seminar.date }}</span>
        <span v-if="seminar.series" class="font-mono text-[10px] rounded-[4px]" style="background:rgba(31,111,178,.09);color:#1F6FB2;padding:2px 7px;">{{ seminar.series }}</span>
      </div>
      <h2 style="font:700 15px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 8px;flex:1;">{{ seminar.title }}</h2>
      <p v-if="seminar.speakers?.length" class="font-mono text-[10px] text-muted">{{ seminar.speakers.join(' · ') }}</p>
      <button v-if="isOpen" ref="closeEl" type="button" class="inline-flex min-h-[44px] items-center self-start font-mono text-[11px] font-bold uppercase tracking-[.08em] text-water hover:underline" @click="closeVideo">Close video ✕</button>
    </div>
  </div>
</template>
