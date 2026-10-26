<script setup lang="ts">
// The home page's USGS gage card. Server-rendered as the default gage with no numbers (so nothing made-up is ever shown as a
// reading); in the browser it picks a gage near the visitor (composables/useGageCard.ts), loads the last 48 hours of flow from
// USGS and shows the real value and a bar for each 2-hour block. If a gage is in flood (National Weather Service category, minor or
// worse) that gage is shown instead, with its category. The card links to the gage's USGS monitoring page. A small pencil in the corner lets a
// visitor set their own gage by its USGS number (kept in this browser, see composables/useGageCard.ts); Clear, inside that panel, goes back to the automatic gage.
import type { Pick, Reading } from '~/composables/useGageCard'
const gage = ref<{ id: string; name: string; state: string }>(DEFAULT_GAGE)
const how = ref<'location' | 'timezone' | 'default'>('default')
const km = ref<number | null>(null)
const flood = ref<Pick['flood']>(null)
const byActivity = ref(false)
const reading = ref<Reading | null>(null)
const status = ref<'loading' | 'ok' | 'unavailable'>('loading')
const preferred = ref(false) // the visitor's own gage is showing
const iconic = ref(false) // a famous gage, for a visitor outside the US
const saved = ref(false) // one is saved in this browser (known from the start; the card may still be loading it)
const editing = ref(false)
const code = ref('')
const error = ref('')
const busy = ref(false)
const codeInput = ref<HTMLInputElement | null>(null)
const pencil = ref<HTMLButtonElement | null>(null)

// The chosen gage and its reading are set together, so the card does not flip from the default gage's name to another's while it
// is still loading (the default shows, with "Loading", until the reading is back).
// Results that arrive after something newer has started are dropped: a page load still waiting on USGS must not overwrite a gage
// the visitor has just saved, and a save the visitor cancelled must not go through.
let loadId = 0
let saveId = 0
async function load() {
  const me = ++loadId
  const pick = await pickCard()
  if (me !== loadId) return
  gage.value = pick.gage; how.value = pick.how; km.value = pick.km; flood.value = pick.flood; byActivity.value = pick.byActivity
  preferred.value = !!pick.preferred; iconic.value = !!pick.iconic
  saved.value = !!getPreferred() // false again if the saved gage was dropped as decommissioned
  reading.value = pick.reading
  status.value = pick.reading ? 'ok' : 'unavailable'
}
onMounted(() => { saved.value = !!getPreferred(); load() })

function openEditor() {
  code.value = ''; error.value = ''; editing.value = true
  nextTick(() => codeInput.value?.focus())
}
function closeEditor() {
  saveId++; busy.value = false; editing.value = false // a check still running is dropped
  nextTick(() => pencil.value?.focus())
}
async function save() {
  if (busy.value) return
  // "05407000" or "USGS-05407000"; anything else is not a gage number
  const m = code.value.trim().match(/^(?:USGS[- ]?)?(\d{8,15})$/i)
  if (!m) { error.value = 'A USGS gage number is 8 to 15 digits, like 05407000.'; return }
  const me = ++saveId
  busy.value = true; error.value = ''
  const found = await lookUpGage(m[1])
  if (me !== saveId) return
  busy.value = false
  if (typeof found === 'string') { error.value = found; return }
  if (!setPreferred(found.gage)) { error.value = 'This browser would not save it (private mode or blocked storage).'; return }
  loadId++ // a page load still waiting must not replace it
  saved.value = true
  gage.value = found.gage; reading.value = found.reading; status.value = 'ok'
  how.value = 'default'; km.value = null; flood.value = null; byActivity.value = false; preferred.value = true; iconic.value = false
  editing.value = false
  nextTick(() => pencil.value?.focus())
}
function clear() {
  clearPreferred()
  saveId++; busy.value = false
  saved.value = false; preferred.value = false; editing.value = false
  // back to the default gage with "Loading" until the automatic pick is ready (not the cleared gage's name and link)
  gage.value = DEFAULT_GAGE; iconic.value = false; reading.value = null; flood.value = null; how.value = 'default'; km.value = null; byActivity.value = false
  status.value = 'loading'
  load()
  nextTick(() => pencil.value?.focus())
}

const ageHours = computed(() => (reading.value ? (Date.now() - reading.value.time.getTime()) / 3600000 : null))
const isLive = computed(() => status.value === 'ok' && ageHours.value !== null && ageHours.value <= 3)
const label = computed(() => (isLive.value ? 'LIVE' : status.value === 'ok' ? 'LATEST' : 'GAGE'))
const near = computed(() => how.value === 'location' && km.value !== null && km.value <= 500)
const FLOOD_LABEL = { minor: 'Minor flood', moderate: 'Moderate flood', major: 'Major flood' } as const
const FLOOD_STYLE = { minor: 'bg-[#FFF1C2] text-[#6B4E00]', moderate: 'bg-[#FFD9B8] text-[#7A3300]', major: 'bg-[#F6C7D4] text-[#6E0E33]' } as const
const floodWhen = computed(() => (flood.value ? stamp(new Date(flood.value.time)) : ''))
const context = computed(() => {
  if (preferred.value) return ' · your gage'
  if (iconic.value) return ' · a classic USGS gage'
  if (flood.value?.where === 'national' && gage.value.state) return ` · flood in ${gage.value.state}`
  if (near.value) return ' · near you'
  return byActivity.value ? ' · most active nearby' : ''
})
// a time of day, with the date when it is not today
const stamp = (t: Date) => {
  const sameDay = t.toDateString() === new Date().toDateString()
  const time = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
  return sameDay ? time : `${t.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}
const when = computed(() => (reading.value ? stamp(reading.value.time) : ''))
const valueText = computed(() => (reading.value ? formatReading(reading.value.value, reading.value.unit) : ''))
// The link's accessible name is its visible text (so voice-control users can say what they see); this extra text, read only by screen
// readers, adds what the bars show and where the link goes.
const srNote = computed(() => {
  const r = reading.value
  const range = r ? ` Over the last 48 hours it ranged from ${formatReading(r.low, r.unit)} to ${formatReading(r.high, r.unit)}.` : ''
  const fl = flood.value && r ? ` ${FLOOD_LABEL[flood.value.category]} according to the National Weather Service.` : ''
  return `${fl}${range} Opens the USGS monitoring page for this gage in a new tab.`
})
</script>

<template>
  <div class="absolute bg-white rounded-[12px] gauge-card left-[-22px] bottom-[-24px] [box-shadow:0_20px_40px_-18px_rgba(15,46,68,.4)] border border-[rgba(15,33,43,.08)] w-[236px] card-lift">
  <a :href="monitoringUrl(gage.id)" target="_blank" rel="noopener" :inert="editing || undefined" class="block no-underline rounded-[12px] p-[16px_18px]">
    <div class="flex items-center gap-[7px] mb-[10px] pr-[24px]"><!-- room for the pencil in the corner -->
      <span class="w-[8px] h-[8px] rounded-[50%] inline-block" :class="isLive ? 'animate-livePulse bg-[#1f9d55]' : 'bg-[#9aa8b1]'"></span>
      <span class="font-mono font-bold tracking-[.1em] text-muted text-[10.5px]">{{ label }} · USGS {{ gage.id }}</span>
    </div>
    <span v-if="status === 'ok' && flood" class="inline-block rounded-[99px] font-mono font-bold tracking-[.06em] uppercase text-[10px] leading-[normal] p-[3px_9px] mb-[8px]" :class="FLOOD_STYLE[flood.category]">{{ FLOOD_LABEL[flood.category] }} · NWS</span>
    <div v-if="status === 'ok' && reading" class="font-['Schibsted_Grotesk'] font-bold text-[26px] text-navy leading-[1]">{{ valueText }} <span class="font-mono text-[13px] text-muted">{{ flood ? 'ft · river stage' : unitLabel(reading.unit) }}</span></div>
    <div v-else-if="status === 'loading'" class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[26px] text-muted">Loading the latest reading…</div>
    <div v-else class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.3] text-muted">Reading unavailable right now</div>
    <div class="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[normal] text-muted m-[3px_0_12px]">{{ gage.name }}<template v-if="gage.state">, {{ gage.state }}</template>{{ context }}</div>
    <template v-if="status === 'ok' && reading">
      <div class="flex items-end gap-[2px] h-[34px]" aria-hidden="true">
        <span v-for="(h, i) in reading.bars" :key="i" class="flex-1 rounded-sm" :style="`height:${h}%;background:${i < 8 ? '#cfe0ee' : i < 16 ? '#9cc4e2' : '#2A86C9'};`"></span>
      </div>
      <div class="flex justify-between font-mono text-[9px] leading-[normal] text-muted m-[3px_0_0]" aria-hidden="true"><span>48 H AGO</span><span>{{ isLive ? 'NOW' : 'LATEST' }}</span></div>
    </template>
    <div v-else class="h-[34px] rounded-sm bg-[rgba(15,33,43,.05)]" aria-hidden="true"></div>
    <div class="font-mono text-[10px] leading-[normal] text-muted m-[8px_0_0]">
      <template v-if="status === 'ok'">Updated {{ when }}<template v-if="reading?.provisional"> · provisional</template> · USGS ↗<template v-if="flood"><br>Flood category: NWS, {{ floodWhen }}</template></template>
      <template v-else>View this gage on USGS ↗</template>
      <span class="sr-only">{{ srNote }}</span>
    </div>
  </a>
    <!-- outside the link (a button inside a link is not valid): set or clear the visitor's own gage -->
    <div class="absolute right-[6px] top-[6px] flex" :inert="editing || undefined">
      <button ref="pencil" type="button" class="w-[24px] h-[24px] font-mono text-[14px] leading-[normal] text-muted opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6FB2] rounded-[4px]" title="Set my preferred gage" aria-label="Set my preferred gage" @click="openEditor">✎</button>
    </div>
    <form v-if="editing" class="absolute inset-x-0 top-0 min-h-full z-10 bg-white rounded-[12px] p-[14px_16px] flex flex-col gap-[7px] [box-shadow:0_20px_40px_-18px_rgba(15,46,68,.4)] border border-[rgba(15,33,43,.08)]" aria-label="Set my preferred gage" @submit.prevent="save" @keydown.esc="closeEditor">
      <label for="gage-code" class="font-mono font-bold tracking-[.1em] text-muted text-[10.5px]">MY USGS GAGE NUMBER</label>
      <input id="gage-code" ref="codeInput" v-model="code" type="text" inputmode="numeric" autocomplete="off" maxlength="24" placeholder="e.g. 05407000" class="border border-[rgba(15,33,43,.2)] rounded-[6px] p-[5px_8px] font-mono text-[13px] text-ink w-full">
      <p v-if="error" role="alert" class="font-['Hanken_Grotesk'] text-[11.5px] leading-[1.3] text-[#9a3412] m-0">{{ error }}</p>
      <p v-else class="font-['Hanken_Grotesk'] text-[11.5px] leading-[1.3] text-muted m-0">{{ saved ? `You have a gage saved${preferred ? ', ' + gage.id : ''}. Enter another number to change it, or clear it to go back to the automatic gage.` : 'Shown here on your future visits. Saved in this browser only.' }}</p>
      <div class="flex items-center gap-[12px] font-mono text-[11px] leading-[normal] mt-auto">
        <button type="submit" :disabled="busy" class="font-bold text-water underline">{{ busy ? 'Checking…' : 'Save' }}</button>
        <button type="button" class="text-muted underline" @click="closeEditor">Cancel</button>
        <button v-if="saved" type="button" class="text-muted underline ml-auto" @click="clear">Clear</button>
      </div>
    </form>
  </div>
</template>
