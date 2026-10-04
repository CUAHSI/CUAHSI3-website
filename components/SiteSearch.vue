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
      style="display:flex;align-items:center;gap:6px;padding:4px 10px;border:0.5px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;color:#5C6E78;font-size:12px;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <span>Search</span>
      <span style="font-size:10px;color:#d1d5db;margin-left:2px;">⌘K</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen"
        @click.self="close"
        style="position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;background:rgba(0,0,0,.3);">
        <div ref="panelEl" role="dialog" aria-modal="true" aria-label="Search the site" style="width:100%;max-width:560px;background:white;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.15);overflow:hidden;margin:0 16px;">

          <!-- Input -->
          <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:0.5px solid #f3f4f6;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink:0;">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref="searchEl"
              v-model="query"
              @input="search"
              aria-label="Search the site"
              placeholder="Search highlights, news, team, events…"
              style="flex:1;border:none;font-size:15px;color:#111827;background:transparent;" />
            <button type="button" aria-label="Close search" @click="close"
              style="font-size:11px;color:#5C6E78;border:0.5px solid #e5e7eb;border-radius:4px;padding:2px 6px;background:white;cursor:pointer;">
              Esc
            </button>
          </div>

          <!-- Results -->
          <div v-if="results.length" style="max-height:400px;overflow-y:auto;">
            <button v-for="r in results" :key="r.url"
              @click="navigate(r.url)"
              style="width:100%;text-align:left;padding:12px 16px;border:none;border-bottom:0.5px solid #f9fafb;background:white;cursor:pointer;display:block;">
              <p style="font-size:13px;font-weight:500;color:#111827;margin-bottom:3px;line-height:1.3;">
                {{ r.meta?.title ?? r.url }}
              </p>
              <p v-if="r.excerpt" style="font-size:12px;color:#6b7280;line-height:1.5;" v-html="r.excerpt" />
            </button>
          </div>

          <!-- No results -->
          <div v-else-if="query.length > 1" style="padding:24px 16px;text-align:center;">
            <p style="font-size:13px;color:#5C6E78;">
              No results for <strong style="color:#374151;">{{ query }}</strong>
            </p>
          </div>

          <!-- Idle: quick links -->
          <div v-else style="padding:16px;display:flex;flex-wrap:wrap;gap:6px;">
            <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to" @click="reset"
              style="font-size:12px;padding:4px 10px;border-radius:99px;background:#f3f4f6;color:#5C6E78;text-decoration:none;">
              {{ link.label }}
            </NuxtLink>
          </div>

          <div style="padding:8px 16px;border-top:0.5px solid #f3f4f6;display:flex;justify-content:flex-end;">
            <span style="font-size:11px;color:#d1d5db;">Powered by Pagefind</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
