<script setup lang="ts">
// The second level of navigation for the About section: a quiet row of small links at the top of the page's banner, above the
// heading, in the same place on every About page (the banner slot "top", see PageHero). The links wrap onto more
// lines on a phone, so every page of the section is visible without scrolling the row. The header itself is
// unchanged (five items). (Data & Computing, Learn & Train and Community do not use it: Data & Computing links its
// two sub-pages from its own banner; Learn & Train's overview page links the archive, cyberseminars and programs, but Graduate programs
// is linked only from the footer; Community is reached from its overview cards.)
// `fixed`: the page above uses a hard-coded 40px side padding (most pages do), so the row uses the same, to line up with the heading.
const props = defineProps<{ section: 'about'; fixed?: boolean }>()
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
}
const cfg = computed(() => SECTIONS[props.section])
function isActive(tab: Tab) {
  const path = route.path.replace(/\/+$/, '') || '/'   // the deployed address may end in a slash
  const base = tab.match ?? tab.h
  return tab.exact ? path === base : path === base || path.startsWith(base + '/')
}
</script>

<template>
  <!-- in a banner the row sits at the very top, above the heading (slot "top"), so it is in the same place on every page of the section; the
       negative bottom margin takes up some of the 64px of space the banner leaves above its heading -->
  <div :class="['mx-auto max-w-site pt-[28px] -mb-[24px]', fixed ? 'px-[40px]' : 'site-container']">
    <nav :aria-label="cfg.label" class="flex flex-wrap gap-[4px_4px] -ml-[10px]">
      <NuxtLink v-for="tab in cfg.tabs" :key="tab.h" :to="tab.h"
        class="transition-colors font-['Hanken_Grotesk'] text-[13.5px] leading-[normal] no-underline whitespace-nowrap rounded-full p-[6px_10px]"
        :class="isActive(tab)
          ? 'font-semibold text-navy bg-[rgba(15,33,43,.08)]'
          : 'font-medium text-[#4b5d68] hover:text-navy hover:bg-[rgba(15,33,43,.05)]'"
        :aria-current="isActive(tab) ? 'page' : undefined">
        {{ tab.t }}
      </NuxtLink>
    </nav>
  </div>
</template>
