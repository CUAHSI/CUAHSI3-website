<script setup lang="ts">
// The home page's USGS gage card. Server-rendered as the default gage with no numbers (so nothing made-up is ever shown as a
// reading); in the browser it picks a gage near the visitor (composables/useGageCard.ts), loads the last 24 hours of flow from
// USGS and shows the real value and a bar for each 2-hour block. The whole card links to the gage's USGS monitoring page.
import type { Gage, Reading } from '~/composables/useGageCard'
const gage = ref<Gage>(DEFAULT_GAGE)
const how = ref<'location' | 'timezone' | 'default'>('default')
const km = ref<number | null>(null)
const reading = ref<Reading | null>(null)
const status = ref<'loading' | 'ok' | 'unavailable'>('loading')

// The chosen gage and its reading are set together, so the card does not flip from the default gage's name to another's while it
// is still loading (the default shows, with "Loading", until the reading is back).
onMounted(async () => {
  const pick = await pickGage()
  const r = await fetchReading(pick.gage.id)
  gage.value = pick.gage; how.value = pick.how; km.value = pick.km
  reading.value = r
  status.value = r ? 'ok' : 'unavailable'
})

const ageHours = computed(() => (reading.value ? (Date.now() - reading.value.time.getTime()) / 3600000 : null))
const isLive = computed(() => status.value === 'ok' && ageHours.value !== null && ageHours.value <= 3)
const label = computed(() => (isLive.value ? 'LIVE' : status.value === 'ok' ? 'LATEST' : 'GAGE'))
const near = computed(() => how.value === 'location' && km.value !== null && km.value <= 500)
const when = computed(() => {
  if (!reading.value) return ''
  const t = reading.value.time
  const sameDay = t.toDateString() === new Date().toDateString()
  const time = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
  return sameDay ? time : `${t.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
})
const valueText = computed(() => (reading.value ? formatFlow(reading.value.value) : ''))
const aria = computed(() => {
  const base = `${gage.value.name}, ${gage.value.state}.`
  const r = reading.value
  const flow = r ? ` ${valueText.value} ${unitLabel(r.unit) === 'cfs' ? 'cubic feet per second' : r.unit}, ${when.value}. Over the last 24 hours it ranged from ${formatFlow(r.low)} to ${formatFlow(r.high)}.` : ''
  return `${label.value}, USGS ${gage.value.id}. ${base}${flow} Opens the USGS monitoring page for this gage in a new tab.`
})
</script>

<template>
  <a :href="monitoringUrl(gage.id)" target="_blank" rel="noopener" :aria-label="aria"
    class="absolute block no-underline bg-white rounded-[12px] gauge-card left-[-22px] bottom-[-24px] p-[16px_18px] [box-shadow:0_20px_40px_-18px_rgba(15,46,68,.4)] border border-[rgba(15,33,43,.08)] w-[236px] card-lift">
    <div class="flex items-center gap-[7px] mb-[10px]">
      <span class="w-[8px] h-[8px] rounded-[50%] inline-block" :class="isLive ? 'animate-livePulse bg-[#1f9d55]' : 'bg-[#9aa8b1]'"></span>
      <span class="font-mono font-bold tracking-[.1em] text-muted text-[10.5px]">{{ label }} · USGS {{ gage.id }}</span>
    </div>
    <div v-if="status === 'ok' && reading" class="font-['Schibsted_Grotesk'] font-bold text-[26px] text-navy leading-[1]">{{ valueText }} <span class="font-mono text-[13px] text-muted">{{ unitLabel(reading.unit) }}</span></div>
    <div v-else-if="status === 'loading'" class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[26px] text-muted">Loading the latest reading…</div>
    <div v-else class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.3] text-muted">Reading unavailable right now</div>
    <div class="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[normal] text-muted m-[3px_0_12px]">{{ gage.name }}, {{ gage.state }}<template v-if="near"> · near you</template></div>
    <div v-if="status === 'ok' && reading" class="flex items-end gap-[3px] h-[34px]" aria-hidden="true">
      <span v-for="(h, i) in reading.bars" :key="i" class="flex-1 rounded-sm" :style="`height:${h}%;background:${i < 4 ? '#cfe0ee' : i < 8 ? '#9cc4e2' : '#2A86C9'};`"></span>
    </div>
    <div v-else class="h-[34px] rounded-sm bg-[rgba(15,33,43,.05)]" aria-hidden="true"></div>
    <div class="font-mono text-[10px] leading-[normal] text-muted m-[8px_0_0]">
      <template v-if="status === 'ok'">Updated {{ when }}<template v-if="reading?.provisional"> · provisional</template> · USGS ↗</template>
      <template v-else>View this gage on USGS ↗</template>
    </div>
  </a>
</template>
