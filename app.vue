<template>
  <div class="min-h-screen flex flex-col bg-paper font-body text-ink [-webkit-font-smoothing:antialiased]">
    <!-- Skip link: hidden until it gets keyboard focus, then jumps past the header navigation -->
    <a href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:bg-navy focus:text-white focus:font-semibold focus:rounded-btn focus:px-4 focus:py-2 focus:text-sm">
      Skip to main content
    </a>
    <AppHeader />
    <!-- the second row of tabs: one list per section, shown on every page under that section's path. It sits before <main> so the skip link goes past it too -->
    <SectionNav v-if="section" :key="section" :section="section" />
    <main id="main-content" tabindex="-1" class="flex-1 focus:outline-none">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const SECTIONS = [
  { path: '/about', section: 'about' },
  { path: '/data-platforms', section: 'data' },
  { path: '/learn-train', section: 'learn' },
  { path: '/community', section: 'community' },
] as const
const section = computed(() => {
  const p = route.path.replace(/\/+$/, '') || '/'
  return SECTIONS.find(s => p === s.path || p.startsWith(s.path + '/'))?.section ?? null
})
</script>
