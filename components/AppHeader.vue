<script setup lang="ts">
const route = useRoute()
const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Data & Computing', to: '/data-platforms' },
  { label: 'Learn & Train', to: '/learn-train' },
  { label: 'Community', to: '/community' },
  { label: 'Hire CUAHSI', to: '/hire-cuahsi' },
]
function isActive(to: string) {
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}

const mobileOpen = ref(false)
watch(() => route.path, () => { mobileOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-50" style="background:rgba(251,250,247,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(15,33,43,.10);">
    <!-- Utility bar (hidden on mobile) -->
    <div class="bg-navy hidden md:block" style="color:#aecbe0;">
      <div class="mx-auto flex items-center justify-between site-container" style="max-width:1240px;height:36px;">
        <span class="font-mono text-[11px] tracking-[.04em] truncate">An NSF-supported consortium · advancing water science since 2001</span>
        <div class="flex gap-[22px] flex-none" style="font:500 12.5px 'Hanken Grotesk';">
          <NuxtLink to="/support" class="hover:text-white transition-colors">Support CUAHSI</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-white transition-colors">Contact</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main bar -->
    <div class="mx-auto flex items-center justify-between gap-4 site-container" style="max-width:1240px;height:66px;">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 flex-none">
        <span class="relative flex-none" style="width:34px;height:34px;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(15,46,68,.18);">
          <span class="absolute inset-0 bottom-1/2" style="background:#2A86C9;"></span>
          <span class="absolute inset-0 top-1/2" style="background:#0F2E44;"></span>
          <span class="absolute left-0 right-0" style="top:50%;height:2px;background:#FBFAF7;transform:translateY(-1px);"></span>
        </span>
        <span class="hidden sm:flex flex-col items-start leading-none">
          <span style="font:800 20px 'Schibsted Grotesk';letter-spacing:.01em;color:#0F2E44;">CUAHSI</span>
          <span class="font-mono text-[9px] tracking-[.06em] text-muted mt-[3px]">HYDROLOGIC SCIENCE</span>
        </span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex gap-0 flex-1 min-w-0 justify-center">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="transition-colors"
          :style="`border:none;font:600 13px 'Hanken Grotesk';padding:7px 9px;border-radius:7px;background:${isActive(item.to) ? 'rgba(31,111,178,.12)' : 'transparent'};color:${isActive(item.to) ? '#0F2E44' : '#3a4d57'};text-decoration:none;white-space:nowrap;`">
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Desktop actions -->
      <div class="hidden md:flex gap-2 items-center flex-none">
        <ClientOnly><SiteSearch /></ClientOnly>
        <NuxtLink to="/member-portal"
          class="bg-navy text-white text-sm font-semibold rounded-btn flex-none"
          style="padding:9px 14px;font-family:'Hanken Grotesk';font-size:13px;white-space:nowrap;">
          Member Portal
        </NuxtLink>
      </div>

      <!-- Mobile hamburger -->
      <button type="button" class="md:hidden flex-none flex items-center justify-center" @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'" :aria-expanded="mobileOpen ? 'true' : 'false'" aria-controls="mobile-menu"
        style="width:38px;height:38px;border-radius:8px;border:1px solid rgba(15,33,43,.15);background:white;">
        <svg v-if="!mobileOpen" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2E44" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        <svg v-else aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2E44" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>

    <!-- Mobile menu panel -->
    <div v-if="mobileOpen" id="mobile-menu" class="md:hidden" style="border-top:1px solid rgba(15,33,43,.08);background:#FBFAF7;">
      <nav class="flex flex-col site-container" style="padding-top:12px;padding-bottom:16px;">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          :style="`display:block;font:600 15px 'Hanken Grotesk';padding:12px 6px;border-radius:8px;color:${isActive(item.to) ? '#0F2E44' : '#3a4d57'};background:${isActive(item.to) ? 'rgba(31,111,178,.10)' : 'transparent'};text-decoration:none;`">
          {{ item.label }}
        </NuxtLink>
        <div class="flex flex-col gap-2 mt-3 pt-3" style="border-top:1px solid rgba(15,33,43,.08);">
          <NuxtLink to="/member-portal" class="text-center bg-navy text-white rounded-btn" style="font:600 14px 'Hanken Grotesk';padding:12px;">Member Portal</NuxtLink>
          <NuxtLink to="/support" style="font:500 13.5px 'Hanken Grotesk';color:#5C6E78;padding:8px 6px;">Support CUAHSI</NuxtLink>
          <NuxtLink to="/contact" style="font:500 13.5px 'Hanken Grotesk';color:#5C6E78;padding:8px 6px;">Contact</NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
