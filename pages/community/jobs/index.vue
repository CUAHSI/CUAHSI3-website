<script setup lang="ts">
useHead({
  title: 'Job board · CUAHSI',
  meta: [{ name: 'description', content: 'Find and share water science job opportunities — postdocs, permanent positions, fellowships, and internships — through the CUAHSI community job board.' }]
})

const { data: jobs } = await useAsyncData('jobs', () =>
  queryContent('jobs').where({ published: true }).sort({ posted: -1 }).find()
)

const typeFilters = ['all', 'permanent', 'post-doc', 'fellowship', 'internship', 'graduate-assistantship']
const activeFilter = ref('all')
const showPast = ref(false)

const today = new Date()

function isExpired(deadline: string | null) {
  if (!deadline) return false
  return new Date(deadline) < today
}

const filtered = computed(() => {
  let items = jobs.value ?? []
  if (activeFilter.value !== 'all') items = items.filter(j => j.type === activeFilter.value)
  if (!showPast.value) items = items.filter(j => !isExpired(j.deadline))
  return items
})

const expiredCount = computed(() =>
  (jobs.value ?? []).filter(j => isExpired(j.deadline)).length
)

const typeLabels: Record<string, string> = {
  permanent: 'Permanent position',
  'post-doc': 'Postdoc',
  fellowship: 'Fellowship',
  internship: 'Internship',
  'graduate-assistantship': 'Graduate assistantship',
}

const typeColors: Record<string, {bg: string; text: string}> = {
  permanent:               { bg: '#EFF6FF', text: '#1E40AF' },
  'post-doc':              { bg: '#EDE9FE', text: '#5B21B6' },
  fellowship:              { bg: '#DCFCE7', text: '#15803D' },
  internship:              { bg: '#FFF7ED', text: '#C2410C' },
  'graduate-assistantship':{ bg: '#FEF9C3', text: '#854D0E' },
}

function typeStyle(type: string) {
  const c = typeColors[type] ?? { bg: '#F3F4F6', text: '#6B7280' }
  return `font-size:11px;padding:2px 9px;border-radius:99px;font-weight:500;white-space:nowrap;background:${c.bg};color:${c.text};`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'Closes today'
  if (diff === 1) return 'Closes tomorrow'
  if (diff <= 7) return `Closes in ${diff} days`
  return null
}
</script>

<template>
  <div>

    <div style="max-width:1024px;margin:0 auto;padding:0 24px;">

      <!-- Header -->
      <div class="rgrid rgrid-split" style="display:grid;gap:24px;align-items:end;padding:36px 0 28px;border-bottom:0.5px solid #f3f4f6;margin-bottom:28px;--cols:minmax(0,1fr) auto;">
        <div>
          <p style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
            <NuxtLink to="/community" style="text-decoration:none;color:#9ca3af;">Get involved</NuxtLink> / Job board
          </p>
          <h1 style="font-size:28px;font-weight:500;margin-bottom:10px;">Job board</h1>
          <p style="font-size:14px;color:#6b7280;line-height:1.65;max-width:520px;">
            Find and share water science opportunities — postdocs, permanent positions, fellowships,
            and internships. Postings remain active for 60 days. Open to the full water science community.
          </p>
        </div>
        <a href="https://cuahsi.jotform.com/222235514170142" target="_blank" rel="noopener"
          style="flex-shrink:0;font-size:13px;font-weight:500;padding:10px 18px;background:#111827;color:white;border-radius:8px;text-decoration:none;white-space:nowrap;">
          Post a job →
        </a>
      </div>

      <!-- Filters -->
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:24px;">
        <span style="font-size:12px;color:#9ca3af;margin-right:4px;">Type</span>
        <FilterChip v-for="f in typeFilters" :key="f" variant="gray" :active="activeFilter===f" @click="activeFilter=f">
          {{ f === 'all' ? 'All types' : typeLabels[f] ?? f }}
        </FilterChip>
      </div>

      <!-- Listings -->
      <div style="margin-bottom:32px;">
        <div v-if="filtered?.length">
          <a v-for="job in filtered" :key="job._path"
            :href="job.url" target="_blank" rel="noopener"
            style="display:block;padding:20px 0;border-bottom:0.5px solid #f3f4f6;text-decoration:none;color:inherit;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap;">
                  <p style="font-size:15px;font-weight:500;line-height:1.3;">{{ job.title }}</p>
                  <span :style="typeStyle(job.type)">{{ typeLabels[job.type] ?? job.type }}</span>
                  <span v-if="job.deadline && daysUntil(job.deadline)"
                    style="font-size:11px;padding:2px 8px;border-radius:99px;background:#FEF2F2;color:#DC2626;border:0.5px solid #FECACA;">
                    {{ daysUntil(job.deadline) }}
                  </span>
                </div>
                <p style="font-size:13px;color:#374151;font-weight:500;margin-bottom:4px;">{{ job.organization }}</p>
                <div style="display:flex;gap:12px;font-size:12px;color:#9ca3af;margin-bottom:8px;flex-wrap:wrap;">
                  <span v-if="job.location">📍 {{ job.location }}</span>
                  <span>Posted {{ fmtDate(job.posted) }}</span>
                  <span v-if="job.deadline">Deadline {{ fmtDate(job.deadline) }}</span>
                </div>
                <p style="font-size:13px;color:#6b7280;line-height:1.55;">{{ job.body?.children?.[0]?.children?.[0]?.value ?? '' }}</p>
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;">
                  <span v-for="t in job.tags" :key="t"
                    style="font-size:11px;padding:2px 7px;border-radius:99px;background:#f3f4f6;color:#6b7280;">
                    {{ t.replace(/-/g,' ') }}
                  </span>
                </div>
              </div>
              <span style="font-size:13px;color:#d1d5db;flex-shrink:0;padding-top:2px;">↗</span>
            </div>
          </a>
        </div>
        <p v-else style="font-size:14px;color:#9ca3af;padding:24px 0;">No current listings match this filter.</p>
      </div>

      <!-- Show/hide expired toggle -->
      <div v-if="expiredCount > 0" style="margin-bottom:48px;">
        <button @click="showPast=!showPast"
          style="font-size:12px;color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;">
          {{ showPast ? 'Hide' : 'Show' }} {{ expiredCount }} expired listing{{ expiredCount === 1 ? '' : 's' }}
        </button>
      </div>

      <!-- Post a job CTA -->
      <div class="rgrid rgrid-split" style="background:#f9fafb;border-radius:12px;padding:22px 24px;margin-bottom:48px;display:grid;gap:20px;align-items:center;--cols:minmax(0,1fr) auto;">
        <div>
          <p style="font-size:14px;font-weight:500;margin-bottom:4px;">Have a position to share?</p>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;">
            CUAHSI welcomes job postings relevant to the water science community — faculty positions,
            postdocs, fellowships, internships, and industry roles. Postings are free and remain active for 60 days.
          </p>
        </div>
        <a href="https://cuahsi.jotform.com/222235514170142" target="_blank" rel="noopener"
          style="flex-shrink:0;font-size:13px;font-weight:500;padding:9px 18px;border:0.5px solid #d1d5db;border-radius:8px;text-decoration:none;color:inherit;white-space:nowrap;">
          Submit a listing →
        </a>
      </div>

    </div>
  </div>
</template>
