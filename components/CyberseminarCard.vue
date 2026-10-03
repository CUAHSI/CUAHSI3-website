<script setup lang="ts">
// One cyberseminar card. Extracted unchanged from pages/learn-train/cyberseminars/index.vue
// (roadmap task 3): markup, classes and inline styles are exactly the page's. The page keeps the
// "which card is expanded" state and passes it in; clicking the thumbnail asks the page to toggle.
defineProps<{ seminar: any; expanded: boolean }>()
defineEmits<{ (e: 'toggle'): void }>()

function ytThumb(id: string) { return `https://img.youtube.com/vi/${id}/mqdefault.jpg` }
</script>

<template>
  <div class="card-lift bg-white rounded-card overflow-hidden flex flex-col" style="border:1px solid rgba(15,33,43,.1);">
    <!-- Thumbnail or placeholder -->
    <div class="relative cursor-pointer" style="height:160px;" @click="$emit('toggle')">
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
    <!-- Embed when expanded -->
    <div v-if="expanded && seminar.youtube_id" style="aspect-ratio:16/9;">
      <iframe :src="`https://www.youtube-nocookie.com/embed/${seminar.youtube_id}?autoplay=1&rel=0`" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
    </div>
    <div class="flex flex-col flex-1" style="padding:16px;">
      <div class="flex items-center gap-2 mb-2 flex-wrap">
        <span class="font-mono text-[10px] text-muted">{{ seminar.date }}</span>
        <span v-if="seminar.series" class="font-mono text-[10px] rounded-[4px]" style="background:rgba(31,111,178,.09);color:#1F6FB2;padding:2px 7px;">{{ seminar.series }}</span>
      </div>
      <h3 style="font:700 15px/1.3 'Schibsted Grotesk';color:#0F2E44;margin:0 0 8px;flex:1;">{{ seminar.title }}</h3>
      <p v-if="seminar.speakers?.length" class="font-mono text-[10px] text-muted">{{ seminar.speakers.join(' · ') }}</p>
    </div>
  </div>
</template>
