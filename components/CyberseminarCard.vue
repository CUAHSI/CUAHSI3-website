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

// Opening with Enter: the key may still be held down (and auto-repeating) when the card opens. If focus moved to
// the Close button right away, the repeats would press it and the video would close again. So the thumbnail
// ignores repeats, and when a key is still held the move to Close waits for the key to be released.
let keyHeld = false
let focusCloseOnKeyup = false
function onThumbKey(e: KeyboardEvent) {
  if (e.repeat) return
  keyHeld = true
  window.addEventListener('keyup', () => {
    keyHeld = false
    if (focusCloseOnKeyup) { focusCloseOnKeyup = false; closeEl.value?.focus({ preventScroll: true }) }
  }, { once: true })
  emit('toggle')
}

watch(isOpen, (open) => {
  if (!open) {
    if (restoreFocus) { restoreFocus = false; nextTick(() => thumbEl.value?.focus()) }
    return
  }
  nextTick(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    root.value?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
    if (keyHeld) focusCloseOnKeyup = true
    else closeEl.value?.focus({ preventScroll: true })
  })
})
</script>

<template>
  <div ref="root" :class="isOpen ? 'bg-white rounded-card overflow-hidden flex flex-col col-span-full scroll-mt-28' : 'card-lift bg-white rounded-card overflow-hidden flex flex-col'" class="border border-[rgba(15,33,43,.1)]">
    <!-- Thumbnail or placeholder (replaced by the large player while open) -->
    <div v-if="!isOpen" ref="thumbEl" class="relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-water h-[160px]" @click="$emit('toggle')"
      :role="seminar.youtube_id ? 'button' : undefined" :tabindex="seminar.youtube_id ? 0 : undefined" :aria-label="seminar.youtube_id ? `Play video: ${seminar.title}` : undefined"
      @keydown.enter.prevent="onThumbKey" @keydown.space.prevent="onThumbKey">
      <img v-if="seminar.youtube_id" :src="ytThumb(seminar.youtube_id)" :alt="seminar.title" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center bg-[linear-gradient(150deg,#10324c,#1F6FB2)]">
        <span class="font-mono font-bold tracking-[.1em] text-[11px] text-[rgba(255,255,255,.7)]">NO VIDEO YET</span>
      </div>
      <!-- Play overlay -->
      <div v-if="seminar.youtube_id && !expanded" class="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,.25)]">
        <div class="rounded-full bg-white flex items-center justify-center w-[44px] h-[44px] opacity-90">
          <svg width="16" height="16" viewBox="0 0 20 20"><polygon points="6,4 16,10 6,16" fill="#0F2E44"/></svg>
        </div>
      </div>
      <span v-if="seminar.has_transcript" class="absolute font-mono font-bold text-white rounded-[4px] right-[10px] top-[10px] text-[9.5px] bg-[#1B7F46] p-[3px_7px]">TRANSCRIPT ✓</span>
    </div>
    <!-- Large player when open -->
    <div v-if="isOpen" class="bg-black">
      <div class="mx-auto aspect-video w-full max-w-[880px]">
        <iframe :src="`https://www.youtube-nocookie.com/embed/${seminar.youtube_id}?autoplay=1&rel=0`" :title="seminar.title" class="h-full w-full border-0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="flex flex-col flex-1 p-[16px]">
      <div class="flex items-center gap-2 mb-2 flex-wrap">
        <span class="font-mono text-[10px] text-muted">{{ seminar.date }}</span>
        <span v-if="seminar.series" class="font-mono text-[10px] rounded-[4px] bg-[rgba(31,111,178,.09)] text-[#1A5F9A] p-[2px_7px]">{{ seminar.series }}</span>
      </div>
      <h2 class="font-['Schibsted_Grotesk'] font-bold text-[15px] leading-[1.3] text-navy m-[0_0_8px] flex-1">{{ seminar.title }}</h2>
      <p v-if="seminar.speakers?.length" class="font-mono text-[10px] text-muted">{{ seminar.speakers.join(' · ') }}</p>
      <button v-if="isOpen" ref="closeEl" type="button" class="inline-flex min-h-[44px] items-center self-start font-mono text-[11px] font-bold uppercase tracking-[.08em] text-water hover:underline" @click="closeVideo">Close video ✕</button>
    </div>
  </div>
</template>
