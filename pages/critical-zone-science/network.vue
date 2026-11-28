<script setup lang="ts">
// The Critical Zone Collaborative Network (CZNet): the Hub and the nine thematic clusters on one page, as sections with anchors
// (epic CUAHSI/CUAHSI3-website#62; page structure option C, approved on #147). Each section lists the products tagged with the cluster
// (CzProductList, `site`) and links to the cluster's pages on criticalzone.org. The lead and each cluster's `line` are ticket T9's
// narrative (approved by Jordan, 27 November 2026): the lines are reworded from each cluster's own line on the criticalzone.org home
// (the Hub's keeps its words, in sentence case); sources in agent/reports/261127_cz-narrative-proposal.md.
useHead({
  title: 'The Critical Zone Collaborative Network · Critical Zone Science',
  meta: [{ name: 'description', content: 'Datasets, papers and software listed for the Critical Zone Collaborative Network Hub and its nine thematic clusters, each linked to where it lives.' }]
})

// slug in products.json -> address segment on criticalzone.org (the legacy site writes dynamic_water with an underscore)
const clusters = [
  { slug: 'hub', path: 'hub', line: 'Enabling, supporting and communicating critical zone science.' },
  { slug: 'bedrock', path: 'bedrock', line: 'The deep critical zone, and how it feeds back on processes at the surface.' },
  { slug: 'bigdata', path: 'bigdata', line: 'How the critical zone responds to disturbance, using field observations, existing data and statistical and process-based tools.' },
  { slug: 'cinet', path: 'cinet', line: 'How critical interfaces regulate the storage and transport of water, sediment, carbon and nutrients.' },
  { slug: 'coastal', path: 'coastal', line: 'The processes that transform landscapes, and the fluxes between land and sea.' },
  { slug: 'drylands', path: 'drylands', line: 'Measuring and predicting carbon budgets in drylands across gradients of land use and climate.' },
  { slug: 'dust2', path: 'dust2', line: 'The dust system of the southwestern United States, from source to sink, as part of the critical zone.' },
  { slug: 'dynamic-water', path: 'dynamic_water', line: 'How changing water storage, critical zone processes and water supply interact in mountain ecosystems of the western United States.' },
  { slug: 'geomicrobiology', path: 'geomicrobiology', line: 'How soil microbes, roots, minerals and soil organic matter interact to drive biogeochemistry and soil formation.' },
  { slug: 'urban', path: 'urban', line: 'How the geologic template and the urban footprint interact, and what that does to critical zone processes along the Eastern Seaboard.' },
].map(c => ({ ...c, name: CZ_SITE_NAMES[c.slug], id: `cluster-${c.slug}` }))
</script>

<template>
  <div>
    <PageHero container-class="mx-auto max-w-site p-[40px_40px_44px]"
      title-class="font-['Schibsted_Grotesk'] font-bold text-[clamp(30px,3.6vw,44px)] leading-[1.06] tracking-[-.022em] text-navy m-[16px_0_16px] max-w-[720px]"
      lead-class="font-['Hanken_Grotesk'] font-normal text-[17px] leading-[1.6] text-[#3a4d57] max-w-[680px]">
      <template #before>
        <p class="font-mono text-[12px] leading-[normal] text-muted m-[0_0_28px]">
          <NuxtLink to="/critical-zone-science" class="text-water">Critical Zone Science</NuxtLink> / The network
        </p>
      </template>
      <template #kicker>Critical Zone Science</template>
      <template #title>The Critical Zone Collaborative Network</template>
      <template #lead>The Critical Zone Collaborative Network (CZNet) is the next phase of NSF's critical zone research. It has nine thematic clusters, research collaborations working in a wide range of geological, climatic and land-use settings, and a Coordinating Hub, housed at CUAHSI, that provides cyberinfrastructure, data management and community services to the clusters. Below are the datasets, papers and software listed for the Hub and each cluster, with links to where they live today.</template>
      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[normal] text-muted m-[22px_0_0]">
        Also: <a href="https://criticalzone.org" target="_blank" rel="noopener" class="text-water font-medium">criticalzone.org ↗</a> (the network's site, being retired, August 2027 at the latest)
        &nbsp;·&nbsp; <NuxtLink to="/critical-zone-science/datasets" class="text-water font-medium">All datasets</NuxtLink>
        &nbsp;·&nbsp; <NuxtLink to="/critical-zone-science/papers" class="text-water font-medium">All papers</NuxtLink>
      </p>
    </PageHero>

    <div class="mx-auto site-container max-w-site py-[48px]">
      <nav aria-label="Jump to a cluster" class="mb-[40px]">
        <ul class="list-none p-0 m-0 flex flex-wrap gap-[8px]">
          <li v-for="c in clusters" :key="c.slug">
            <a :href="`#${c.id}`" class="inline-block font-['Hanken_Grotesk'] text-[13px] leading-[normal] text-navy bg-[rgba(31,111,178,.09)] rounded-[999px] p-[5px_12px] no-underline">{{ c.name }}</a>
          </li>
        </ul>
      </nav>

      <section v-for="c in clusters" :id="c.id" :key="c.slug" class="mb-[64px] scroll-mt-[96px]">
        <h2 class="font-['Schibsted_Grotesk'] font-bold text-[30px] leading-[1.1] text-navy tracking-[-.016em] m-[0_0_8px]">{{ c.name }}</h2>
        <p class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[640px] m-[0_0_8px]">{{ c.line }}</p>
        <p class="font-['Hanken_Grotesk'] text-[14px] leading-[normal] text-muted m-[0_0_24px]">
          <a :href="`https://criticalzone.org/${c.path}/`" target="_blank" rel="noopener" class="text-water font-medium">This cluster's pages on criticalzone.org ↗</a>
        </p>
        <CzProductList :site="c.slug" :id-prefix="c.slug" :label="c.name" compact />
      </section>

      <CzSuggest />
    </div>
  </div>
</template>
