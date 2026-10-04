<script setup lang="ts">
useHead({
  title: 'Member Portal · CUAHSI',
  meta: [{ name: 'description', content: 'Member representative directory and resources for CUAHSI member institutions.' }]
})

// This page is intentionally NOT gated in the frontend — a client-side password
// check cannot actually protect the data below, since static-generated pages ship
// all content in the build regardless of any JS gate. Access to this route should
// be restricted at the edge (e.g. Cloudflare Access) before this page is public.

const { data: repsData } = await useAsyncData('member-reps', () =>
  queryContent('members/reps').findOne().catch(() => null)
)

const reps = computed<any[]>(() => {
  const body = repsData.value?.body
  return Array.isArray(body) ? body : []
})

const query = ref('')

const filtered = computed(() => {
  if (!query.value.trim()) return reps.value
  const q = query.value.toLowerCase()
  return reps.value.filter(r =>
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
    r.institution.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q)
  )
})

// Group filtered reps by institution, alphabetically
const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const r of filtered.value) {
    if (!map[r.institution]) map[r.institution] = []
    map[r.institution].push(r)
  }
  return Object.keys(map).sort().map(inst => ({ institution: inst, reps: map[inst] }))
})

const institutionCount = computed(() => new Set(reps.value.map(r => r.institution)).size)

const resources = [
  { title: 'Meeting minutes', desc: 'Notes from CUAHSI Membership Meetings and Board sessions.', status: 'coming soon' },
  { title: 'Governance documents', desc: 'Bylaws, committee charters, and election procedures.', status: 'coming soon' },
  { title: 'Change your representatives', desc: 'Forms to update your institution\u2019s designated CUAHSI representatives.', status: 'coming soon' },
  { title: 'Member-only mailing list', desc: 'Sign up for representative-only announcements and discussion.', status: 'coming soon' },
]
</script>

<template>
  <div>
    <PageHero section-class="hero-section" container-class="mx-auto site-container" container-style="max-width:1240px;padding-top:64px;padding-bottom:44px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:16px 0 14px;"
      lead-style="font:400 17px/1.6 'Hanken Grotesk';color:#3a4d57;max-width:600px;">
      <template #before>
        <span class="font-mono font-bold tracking-[.14em] uppercase" style="font-size:12px;color:#C0603C;">Member Portal</span>
      </template>
      <template #title>
        For CUAHSI member representatives.
      </template>
      <template #lead>
        A directory of member representatives and resources for the {{ institutionCount }} institutions that make up CUAHSI.
      </template>
    </PageHero>

    <div class="mx-auto site-container" style="max-width:1240px;padding-top:52px;">

      <!-- Resources -->
      <div class="mb-12">
        <p class="font-mono font-bold tracking-[.1em] uppercase text-muted mb-4" style="font-size:11px;">Member resources</p>
        <div class="rg-4">
          <div v-for="r in resources" :key="r.title" class="rounded-card" style="border:1px solid rgba(15,33,43,.1);padding:18px;">
            <p style="font:600 14px 'Hanken Grotesk';color:#0F2E44;margin:0 0 6px;">{{ r.title }}</p>
            <p style="font:400 12.5px/1.5 'Hanken Grotesk';color:#5C6E78;margin:0 0 10px;">{{ r.desc }}</p>
            <span class="font-mono text-[10px]" style="color:#C2410C;background:#FFF7ED;padding:2px 8px;border-radius:99px;">{{ r.status }}</span>
          </div>
        </div>
      </div>

      <!-- Rep directory -->
      <div style="padding-bottom:80px;">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
          <p class="font-mono font-bold tracking-[.1em] uppercase text-muted" style="font-size:11px;">Member representative directory</p>
          <input v-model="query" type="text" aria-label="Search member representatives" placeholder="Search name, institution, or email…"
            style="border:1px solid rgba(15,33,43,.15);border-radius:8px;padding:9px 12px;font:400 13px 'Hanken Grotesk';width:280px;" />
        </div>
        <p class="font-mono text-[11px] text-muted mb-5">{{ filtered.length }} representative{{ filtered.length === 1 ? '' : 's' }} across {{ grouped.length }} institution{{ grouped.length === 1 ? '' : 's' }}</p>

        <div class="flex flex-col gap-6">
          <div v-for="group in grouped" :key="group.institution">
            <p style="font:600 13.5px 'Hanken Grotesk';color:#0F2E44;margin-bottom:8px;">{{ group.institution }}</p>
            <div class="rg-2" style="gap:1px;background:rgba(15,33,43,.08);border-radius:8px;overflow:hidden;">
              <div v-for="rep in group.reps" :key="rep.email" class="bg-paper" style="padding:12px 14px;">
                <p style="font:500 13px 'Hanken Grotesk';color:#15212B;margin:0 0 2px;">{{ rep.first_name }} {{ rep.last_name }}</p>
                <a :href="`mailto:${rep.email}`" class="font-mono text-[11px]" style="color:#1F6FB2;">{{ rep.email }}</a>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!filtered.length" style="font:400 13.5px 'Hanken Grotesk';color:#5C6E78;padding:24px 0;">No representatives match "{{ query }}".</p>
      </div>
    </div>
  </div>
</template>
