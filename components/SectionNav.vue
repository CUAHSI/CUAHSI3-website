<script setup lang="ts">
// The second row of tabs for a section (About, Data & Computing, Learn & Train, Community), one list per section.
// app.vue draws it once, under the header, on every page whose address starts with the section's path, so a
// section can hold more pages without adding anything to the header and a visitor on any of them can see where
// they are and what else the section has. (It used to sit at the bottom of each page's banner, in small grey
// text, on some pages only; on a phone the last tabs were hidden behind a faint fade.) The header itself is
// unchanged (five items).
const props = defineProps<{ section: 'about' | 'learn' | 'data' | 'community' }>()
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
      { t: 'Data management guide', h: '/data-platforms/data-management-guide' },
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
  community: {
    label: 'Community sections',
    tabs: [
      { t: 'Overview', h: '/community', exact: true },
      { t: 'Events', h: '/community/events' },
      { t: 'News', h: '/community/news' },
      { t: 'Newsletter', h: '/community/newsletter' },
      { t: 'Jobs', h: '/community/jobs' },
      { t: 'Campus visits', h: '/community/campus-visits' },
    ],
  },
}
const cfg = computed(() => SECTIONS[props.section])
function isActive(tab: Tab) {
  const path = route.path.replace(/\/+$/, '') || '/'   // the deployed address may end in a slash
  const base = tab.match ?? tab.h
  return tab.exact ? path === base : path === base || path.startsWith(base + '/')
}

// on a phone the row scrolls sideways: bring the current tab into view, and show an arrow while more tabs are off to the right
const navEl = ref<HTMLElement | null>(null)
const showMore = ref(false)   // only when the row is wider than the screen and not scrolled to its end
function updateMore() {
  const n = navEl.value
  showMore.value = !!n && n.scrollWidth - n.clientWidth - n.scrollLeft > 4
}
function scrollToCurrent() {
  const el = navEl.value?.querySelector('[aria-current]') as HTMLElement | null
  // scroll only as far as it takes to show the whole current tab, so the first tabs stay in view where they can
  if (el && navEl.value) {
    const n = navEl.value
    const right = el.getBoundingClientRect().right - n.getBoundingClientRect().left + n.scrollLeft   // the tab's right edge, from the row's left edge
    n.scrollLeft = Math.max(0, right - n.clientWidth + 48)
  }
  updateMore()
}
function scrollMore() {
  navEl.value?.scrollBy({ left: 160, behavior: 'smooth' })
}
onMounted(() => {
  scrollToCurrent()
  window.addEventListener('resize', updateMore)
  document.fonts?.ready.then(updateMore)   // the row can get wider when the web fonts arrive
})
watch(() => route.path, () => nextTick(scrollToCurrent))
onBeforeUnmount(() => window.removeEventListener('resize', updateMore))
</script>

<template>
  <div class="relative bg-white border-b border-b-[rgba(15,33,43,.10)]">
    <div class="relative mx-auto max-w-site site-container">
      <nav ref="navEl" :aria-label="cfg.label" class="flex gap-0 overflow-x-auto" @scroll.passive="updateMore">
        <NuxtLink v-for="tab in cfg.tabs" :key="tab.h" :to="tab.h"
          class="transition-colors font-['Hanken_Grotesk'] text-[15px] leading-[normal] p-[15px_22px_13px_0] no-underline whitespace-nowrap border-b-[3px]"
          :class="isActive(tab) ? 'font-semibold text-navy border-b-water' : 'font-medium text-[#3a4d57] border-b-transparent hover:text-navy'"
          :aria-current="isActive(tab) ? 'page' : undefined">
          {{ tab.t }}
        </NuxtLink>
      </nav>
      <!-- on a phone the row scrolls sideways: an arrow on a white edge shows that there is more, and moves along when pressed -->
      <button v-if="showMore" type="button" aria-label="Show more sections" @click="scrollMore"
        class="absolute top-0 bottom-0 right-0 w-[56px] flex items-center justify-end pr-[20px] bg-[linear-gradient(90deg,rgba(255,255,255,0),#fff_55%)] text-water text-[20px] leading-none border-0 cursor-pointer min-[900px]:hidden">
        <span aria-hidden="true">›</span>
      </button>
    </div>
  </div>
</template>
