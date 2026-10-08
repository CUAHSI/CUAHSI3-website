<script setup lang="ts">
/**
 * Pagefind search modal.
 *
 * IMPORTANT — why the loading logic looks odd:
 * A plain `await import('/pagefind/pagefind.js')` CANNOT be used here. Vite's
 * import-analysis runs statically at build time, tries to resolve that path, fails
 * (the file only exists after `pagefind` runs post-build), and breaks the dev server
 * outright. The `/* @vite-ignore *\/` comment does not reliably suppress it.
 *
 * So pagefind is loaded at runtime by a path Vite never sees as an import:
 *   1. inject a <script type="module"> tag and check for window.pagefind
 *   2. if that doesn't populate, fetch the file and import it via a blob URL
 *
 * Search only works against a production build:
 *   npm run build:search && npx serve .output/public -l 4000
 * In `npm run dev` the button renders and the modal opens, but there is no index,
 * so queries return nothing. That is expected, not a bug.
 */

const query = ref('')
const results = ref<any[]>([])
const isOpen = ref(false)
const searchEl = ref<HTMLInputElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

let pagefind: any = null
let loadAttempted = false

const PAGEFIND_URL = '/pagefind/pagefind.js'

async function loadViaScriptTag(): Promise<any> {
  // Already injected by a previous attempt?
  if ((window as any).pagefind) return (window as any).pagefind

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAGEFIND_URL}"]`)
    if (existing) { resolve(); return }
    const s = document.createElement('script')
    s.type = 'module'
    s.src = PAGEFIND_URL
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('pagefind script failed to load'))
    document.head.appendChild(s)
  })

  return (window as any).pagefind ?? null
}

async function loadViaBlob(): Promise<any> {
  const res = await fetch(PAGEFIND_URL)
  if (!res.ok) return null
  const src = await res.text()
  const blobUrl = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }))
  try {
    return await import(/* @vite-ignore */ blobUrl)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

async function loadPagefind() {
  if (pagefind || loadAttempted) return
  loadAttempted = true
  try {
    pagefind = await loadViaScriptTag()
    if (!pagefind) pagefind = await loadViaBlob()
    if (pagefind?.init) await pagefind.init()
  } catch {
    pagefind = null   // dev mode, or no index built yet — fail quietly
  }
}

async function search() {
  if (!query.value.trim()) { results.value = []; return }
  await loadPagefind()
  if (!pagefind) return
  try {
    const res = await pagefind.search(query.value)
    results.value = await Promise.all(
      res.results.slice(0, 8).map((r: any) => r.data())
    )
  } catch {
    results.value = []
  }
}

// Whatever had focus when the dialog opened (the Search button, or any element if it was opened with Ctrl/Cmd+K).
let returnTo: HTMLElement | null = null

function open() {
  returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  isOpen.value = true
  nextTick(() => searchEl.value?.focus())
}

function reset() {
  isOpen.value = false
  query.value = ''
  results.value = []
}

// Closing without going anywhere (Esc, the Esc button, a click outside): give focus back to where it was, if that
// element is still on the page and visible, otherwise to the Search button (which is hidden on phones).
function close() {
  reset()
  const target = returnTo && document.contains(returnTo) && returnTo.offsetParent !== null ? returnTo : triggerEl.value
  returnTo = null
  nextTick(() => target?.focus())
}

// Keep Tab and Shift+Tab inside the dialog while it is open.
function trapTab(e: KeyboardEvent) {
  const panel = panelEl.value
  if (!panel) return
  const items = [...panel.querySelectorAll<HTMLElement>('a[href],button,input,[tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (e.shiftKey && (active === first || !panel.contains(active))) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && (active === last || !panel.contains(active))) { e.preventDefault(); first.focus() }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
  if (e.key === 'Tab' && isOpen.value) trapTab(e)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const router = useRouter()
function navigate(url: string) {
  reset()
  router.push(url)
}

const quickLinks = [
  { label: 'Impact',       to: '/about/impact' },
  { label: 'Learn & Train', to: '/learn-train' },
  { label: 'Events',       to: '/community/events' },
  { label: 'Newsletter',   to: '/community/newsletter' },
  { label: 'News',         to: '/community/news' },
  { label: 'Team',         to: '/about/team' },
  { label: 'Jobs',         to: '/community/jobs' },
]
</script>

<template>
  <div>
    <!-- Trigger -->
    <button ref="triggerEl" type="button" aria-haspopup="dialog" @click="open"
      class="flex items-center gap-[6px] p-[4px_10px] border-[0.5px] border-[#e5e7eb] rounded-[6px] bg-white cursor-pointer text-muted text-[12px]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <span>Search</span>
      <span class="text-[10px] text-[#6b7280] ml-[2px]">⌘K</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen"
        @click.self="close"
        class="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px] bg-[rgba(0,0,0,.3)]">
        <div ref="panelEl" role="dialog" aria-modal="true" aria-label="Search the site" class="w-full max-w-[560px] bg-white rounded-[12px] [box-shadow:0_20px_60px_rgba(0,0,0,.15)] overflow-hidden m-[0_16px]">

          <!-- Input -->
          <div class="flex items-center gap-[10px] p-[14px_16px] border-b-[0.5px] border-b-[#f3f4f6]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" class="shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref="searchEl"
              v-model="query"
              @input="search"
              aria-label="Search the site"
              placeholder="Search highlights, news, team, events…"
              class="flex-1 text-[15px] text-[#111827] bg-transparent" />
            <button type="button" aria-label="Close search" @click="close"
              class="text-[11px] text-muted border-[0.5px] border-[#e5e7eb] rounded-[4px] p-[2px_6px] bg-white cursor-pointer">
              Esc
            </button>
          </div>

          <!-- Results -->
          <div v-if="results.length" class="max-h-[400px] overflow-y-auto">
            <button v-for="r in results" :key="r.url"
              @click="navigate(r.url)"
              class="w-full text-left p-[12px_16px] border-b-[0.5px] border-b-[#f9fafb] bg-white cursor-pointer block">
              <p class="text-[13px] font-medium text-[#111827] mb-[3px] leading-[1.3]">
                {{ r.meta?.title ?? r.url }}
              </p>
              <p v-if="r.excerpt" class="text-[12px] text-[#6b7280] leading-[1.5]" v-html="r.excerpt" />
            </button>
          </div>

          <!-- No results -->
          <div v-else-if="query.length > 1" class="p-[24px_16px] text-center">
            <p class="text-[13px] text-muted">
              No results for <strong class="text-[#374151]">{{ query }}</strong>
            </p>
          </div>

          <!-- Idle: quick links -->
          <div v-else class="p-[16px] flex flex-wrap gap-[6px]">
            <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to" @click="reset"
              class="text-[12px] p-[4px_10px] rounded-[99px] bg-[#f3f4f6] text-muted no-underline">
              {{ link.label }}
            </NuxtLink>
          </div>

          <div class="p-[8px_16px] border-t-[0.5px] border-t-[#f3f4f6] flex justify-end">
            <span class="text-[11px] text-[#d1d5db]">Powered by Pagefind</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
