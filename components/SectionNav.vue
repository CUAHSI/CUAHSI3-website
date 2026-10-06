<script setup lang="ts">
// A quiet second row of tabs under the page heading, one list per section,
// so a section can hold more pages without adding anything to the header. It extends the sub-nav that the
// About page and the Impact page already had (hard-coded, with in-page jumps); here the list lives in one
// place and every page of the section shows it. The header itself is unchanged (five items).
// `fixed`: the page above uses a hard-coded 40px side padding (most pages do), so the row uses the same, to line up with the heading.
// Without it the row uses the responsive site-container padding (the new pages and the archive page).
const props = defineProps<{ section: 'about' | 'learn' | 'data'; fixed?: boolean }>()
const route = useRoute()

type Tab = { t: string; h: string; match?: string; exact?: boolean }
const SECTIONS: Record<string, { label: string; tabs: Tab[] }> = {
  about: {
    label: 'About sections',
    tabs: [
      { t: 'Overview', h: '/about', exact: true },
      { t: 'Team', h: '/about/team' },
      { t: 'Governance', h: '/about/governance' },
      { t: 'Membership', h: '/about/membership' },
      { t: 'Impact', h: '/about/impact' },
      { t: 'Documents & policies', h: '/about/documents' },
    ],
  },
  data: {
    label: 'Data & Computing sections',
    tabs: [
      { t: 'Overview', h: '/data-platforms', exact: true },
      { t: 'Water data portals', h: '/data-platforms/portals' },
    ],
  },
  learn: {
    label: 'Learn & Train sections',
    tabs: [
      { t: 'Overview', h: '/learn-train', exact: true },
      { t: 'Programs', h: '/learn-train#programs', match: '/learn-train/programs' },
      { t: 'Cyberseminars', h: '/learn-train/cyberseminars' },
      { t: 'Archive', h: '/learn-train/archive' },
      { t: 'Graduate programs', h: '/learn-train/graduate-programs' },
    ],
  },
}
const cfg = computed(() => SECTIONS[props.section])
function isActive(tab: Tab) {
  const path = route.path.replace(/\/+$/, '') || '/'   // the deployed address may end in a slash
  const base = tab.match ?? tab.h
  return tab.exact ? path === base : path === base || path.startsWith(base + '/')
}

// on a phone, bring the current tab into view when the page opens
const navEl = ref<HTMLElement | null>(null)
const showFade = ref(false)   // only when the row is wider than the screen and not scrolled to its end
function updateFade() {
  const n = navEl.value
  showFade.value = !!n && n.scrollWidth - n.clientWidth - n.scrollLeft > 4
}
onMounted(() => {
  const el = navEl.value?.querySelector('[aria-current]') as HTMLElement | null
  if (el && navEl.value) navEl.value.scrollLeft = Math.max(0, el.offsetLeft - 24)
  updateFade()
  window.addEventListener('resize', updateFade)
  document.fonts?.ready.then(updateFade)   // the row can get wider when the web fonts arrive
})
onBeforeUnmount(() => window.removeEventListener('resize', updateFade))
</script>

<template>
  <div class="relative mx-auto max-w-site" :class="fixed ? 'p-[0_40px]' : 'site-container'">
    <nav ref="navEl" :aria-label="cfg.label" class="relative flex gap-0 border-t border-t-[rgba(15,33,43,.08)] overflow-x-auto" @scroll.passive="updateFade">
      <NuxtLink v-for="tab in cfg.tabs" :key="tab.h" :to="tab.h"
        class="transition-colors font-['Hanken_Grotesk'] text-[13px] leading-[normal] p-[14px_18px_12px_0] no-underline whitespace-nowrap border-b-2"
        :class="isActive(tab) ? 'font-semibold text-navy border-b-water' : 'font-medium text-muted border-b-transparent'"
        :aria-current="isActive(tab) ? 'page' : undefined">
        {{ tab.t }}
      </NuxtLink>
    </nav>
    <!-- on a phone the row scrolls sideways: a soft edge shows that there is more -->
    <div v-if="showFade" aria-hidden="true" class="pointer-events-none absolute top-[1px] bottom-0 w-[44px] bg-[linear-gradient(90deg,rgba(243,238,228,0),#F3EEE4)]" :class="fixed ? 'right-[40px]' : 'right-0'"></div>
  </div>
</template>
