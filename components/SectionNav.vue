<script setup lang="ts">
// The second level of navigation for a section (About, Data & Computing, Learn & Train, Community): one list per
// section, drawn as a row of pills inside the page's banner, under the heading, so a visitor sees the other pages
// of the section as part of the page and not as a second bar under the header. The pills wrap onto more lines on
// a phone, so every page of the section is visible without scrolling the row. The header itself is unchanged
// (five items). (This replaced a row of small grey text tabs at the bottom of the banner, whose last tabs
// were hidden behind a faint fade on a phone.)
// `fixed`: the page above uses a hard-coded 40px side padding (most pages do), so the row uses the same, to line up with the heading.
// Without it the row uses the responsive site-container padding (the archive page).
// `bare`: no container or banner spacing at all, for a page that sets its own width (the Community page).
const props = defineProps<{ section: 'about' | 'learn' | 'data' | 'community'; fixed?: boolean; bare?: boolean }>()
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
</script>

<template>
  <!-- in a banner the row is pulled up under the heading block (banners have 44 to 52px of space below it) -->
  <div :class="bare ? 'mt-[24px]' : ['mx-auto max-w-site -mt-[24px] pb-[36px]', fixed ? 'px-[40px]' : 'site-container']">
    <nav :aria-label="cfg.label" class="flex flex-wrap gap-[10px]">
      <NuxtLink v-for="tab in cfg.tabs" :key="tab.h" :to="tab.h"
        class="transition-colors font-['Hanken_Grotesk'] text-[14.5px] leading-[normal] no-underline whitespace-nowrap rounded-full border p-[9px_18px]"
        :class="isActive(tab)
          ? 'font-semibold bg-navy text-white border-navy'
          : 'font-medium bg-white text-navy border-[rgba(15,33,43,.4)] hover:border-water hover:text-water'"
        :aria-current="isActive(tab) ? 'page' : undefined">
        {{ tab.t }}
      </NuxtLink>
    </nav>
  </div>
</template>
