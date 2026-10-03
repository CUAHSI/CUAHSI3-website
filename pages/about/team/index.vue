<script setup lang="ts">
useHead({ title: 'Our Team · CUAHSI' })
const { data: teamData } = await useAsyncData('team', () =>
  queryContent('team').where({ _extension: 'json' }).findOne().catch(() => null)
)
const people = computed<any[]>(() =>
  Array.isArray(teamData.value?.body) ? teamData.value.body : []
)
const deptOrder = ['Leadership','Research','Engineering','Programs','Communications','Operations']
const byDept = computed(() => {
  const map: Record<string,any[]> = {}
  for (const p of people.value) {
    if (!map[p.department]) map[p.department] = []
    map[p.department].push(p)
  }
  return map
})
function initials(name: string) { return name.split(' ').map((n:string)=>n[0]).join('').slice(0,2) }
</script>
<template>
  <div>
    <PageHero container-class="mx-auto" container-style="max-width:1240px;padding:64px 40px 48px;"
      title-style="font:700 clamp(32px,4vw,48px)/1.05 'Schibsted Grotesk';letter-spacing:-.02em;color:#0F2E44;margin:14px 0 0;">
      <template #kicker>About · Team</template>
      <template #title>The people behind CUAHSI.</template>
    </PageHero>
    <div class="mx-auto" style="max-width:1240px;padding:48px 40px 80px;">
      <div v-for="dept in deptOrder" :key="dept">
        <div v-if="byDept[dept]?.length" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <span style="font:700 13px/1 'Schibsted Grotesk';color:#0F2E44;">{{ dept }}</span>
            <span class="font-mono text-[11px] text-muted">{{ byDept[dept].length }} people</span>
          </div>
          <div class="rgrid rgrid-multi" style="display:grid;gap:16px;--cols:repeat(4,1fr);">
            <div v-for="person in byDept[dept]" :key="person.slug"
              class="card-lift bg-white rounded-card overflow-hidden"
              style="border:1px solid rgba(15,33,43,.1);"
              :style="person.has_profile ? 'cursor:pointer;' : ''"
              @click="person.has_profile ? $router.push(`/about/team/${person.slug}`) : null">
              <!-- Photo -->
              <div class="relative" style="height:200px;background:#F3EEE4;overflow:hidden;">
                <img v-if="person.photo" :src="person.photo" :alt="`${person.name}`"
                  :key="`img-${person.slug}`"
                  style="width:100%;height:100%;object-fit:cover;object-position:center top;" />
                <div v-else class="w-full h-full flex items-center justify-center" style="font:700 32px 'Schibsted Grotesk';color:#5C6E78;">{{ initials(person.name) }}</div>
                <div v-if="person.has_profile" class="absolute rounded-full" style="top:10px;right:10px;background:rgba(255,255,255,.9);padding:3px 10px;font:600 10.5px 'Hanken Grotesk';color:#0F2E44;">profile →</div>
              </div>
              <!-- Info -->
              <div style="padding:14px;">
                <div class="flex items-baseline gap-2 flex-wrap mb-1">
                  <span style="font:700 14px 'Schibsted Grotesk';color:#0F2E44;">{{ person.name }}</span>
                  <span v-if="person.pronouns" class="font-mono text-[10px] text-muted">{{ person.pronouns }}</span>
                </div>
                <p style="font:400 12.5px/1.4 'Hanken Grotesk';color:#5C6E78;">{{ person.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
