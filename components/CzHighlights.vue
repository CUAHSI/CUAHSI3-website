<script setup lang="ts">
// The records marked `highlight: true` in content/critical-zone/products.json (epic CUAHSI/CUAHSI3-website#62, ticket T12; the choice is
// in agent/reports/261031_cz-highlights-selection.md), shown as a sample of the full lists, not as an inventory: Jordan found the earlier
// grid of cards by observatory read as the whole of the program's output (16 November 2026, layout A). Each list shows its first few and
// folds the rest in a <details>, so all of them are in the page (and the site search) without JavaScript.
//
// Order: `highlight_rank` (1 = most used, from the report's usage figures), then title; a highlight with no rank goes after the ranked
// ones. Papers are split into the observatories and the network by the site a paper is shown under: its first tag other than "national"
// (every record crediting a CZNet cluster or Hub award has carried that cluster's tag since jordansread/CUAHSI3-website#248), else the
// cluster its award names (czClusterOfAward).
//
// The data comes from a bare JSON array that Nuxt Content wraps in `body` (footgun 7); `transform` keeps only the marked rows, the fields
// shown and the two totals, so the page payload does not carry the whole file.
type Row = { title: string; type: string; doi?: string; url?: string; repository?: string; sites?: string[]; awards?: string[]; year?: number; rank?: number }
type Award = { id: string; text: string }

const { data: file } = await useAsyncData('cz-highlights', () =>
  queryContent('critical-zone').where({ _extension: 'json' }).findOne().catch(() => null),
  {
    transform: (f: any) => {
      const all: any[] = f?._path === '/critical-zone/products' && Array.isArray(f?.body) ? f.body : []
      return {
        rows: all.filter(r => r.highlight === true).map(r => ({
          title: r.title, type: r.type, doi: r.doi, url: r.url, repository: r.repository, sites: r.sites, awards: r.awards, year: r.year, rank: r.highlight_rank,
        })) as Row[],
        papers: all.filter(r => r.type === 'paper').length,
        datasets: all.filter(r => r.type === 'dataset').length,
      }
    },
  }
)
const { data: awardFile } = await useAsyncData('cz-highlights-awards', () =>
  queryContent('awards').where({ _extension: 'json' }).findOne().catch(() => null),
  { transform: (f: any) => (f?._path === '/awards/awards' && Array.isArray(f?.body) ? f.body : []) as Award[] }
)

// The Hub and the nine clusters (the slugs of scripts/content-schemas.mjs CZ_SITES after the observatories).
const NETWORK = new Set(['hub', 'bedrock', 'bigdata', 'cinet', 'coastal', 'drylands', 'dust2', 'dynamic-water', 'geomicrobiology', 'urban'])
const awardText = computed(() => new Map((awardFile.value ?? []).map(a => [a.id, a.text])))
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
const link = (r: Row) => (r.doi ? `https://doi.org/${r.doi}` : r.url ?? '')
const where = (r: Row) => ((r.url ?? '').includes('hydroshare.org') ? 'HydroShare' : czRepositoryName(r.repository))
const nf = (n: number) => n.toLocaleString('en-US')

// The slug a row is shown under: its first site other than the cross-CZO "national" tag, else the cluster its award names, else its first
// site. A paper naming awards of two clusters goes under the first of its awards that names one (the Big Data paper 10.1029/2022gb007351
// names a Dynamic Water award too).
function slugOf(r: Row): string {
  const s = (r.sites ?? []).find(x => x !== 'national')
  if (s) return s
  for (const id of r.awards ?? []) {
    const c = czClusterOfAward(awardText.value.get(id))
    if (c) return c
  }
  return (r.sites ?? [])[0] ?? ''
}
const byRank = (a: Row, b: Row) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || cmp(a.title, b.title)
const meta = (r: Row) => [where(r), r.year, CZ_SITE_NAMES[slugOf(r)]].filter(Boolean).join(' · ')

type List = { id: string; label: string; show: number; items: Row[] }
const highlighted = computed(() => [...(file.value?.rows ?? [])].sort(byRank))
// The note says "ranked", and the lists number their items, only when every highlight has a rank (the validator allows all or none);
// before the ranks were added the lists were in title order, and a number beside a title would read as a rank.
const ranked = computed(() => highlighted.value.every(r => r.rank !== undefined))
const papers = computed(() => highlighted.value.filter(r => r.type === 'paper'))
// Datasets only, to match the total they are counted against (no software or model is a highlight today; one would need its own list).
const datasets = computed(() => highlighted.value.filter(r => r.type === 'dataset'))
const columns = computed(() => [
  {
    id: 'papers', heading: 'Papers', of: `${nf(papers.value.length)} of ${nf(file.value?.papers ?? 0)}`,
    lists: [
      { id: 'papers-observatories', label: 'Observatories, 2007 to 2020', show: 3, items: papers.value.filter(r => !NETWORK.has(slugOf(r))) },
      { id: 'papers-network', label: 'The network, 2020 on', show: 3, items: papers.value.filter(r => NETWORK.has(slugOf(r))) },
    ] as List[],
  },
  {
    id: 'datasets', heading: 'Datasets', of: `${nf(datasets.value.length)} of ${nf(file.value?.datasets ?? 0)}`,
    lists: [{ id: 'datasets-all', label: '', show: 5, items: datasets.value }] as List[],
  },
].map(c => ({ ...c, lists: c.lists.filter(l => l.items.length) })).filter(c => c.lists.length))
</script>

<template>
  <section v-if="highlighted.length" aria-labelledby="cz-sample" class="mx-auto site-container max-w-site pt-[56px]">
    <h2 id="cz-sample" class="font-['Schibsted_Grotesk'] font-bold text-[28px] leading-[1.1] text-navy tracking-[-.016em] m-[0_0_8px]">The most used: a sample</h2>
    <p class="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[1.6] text-[#3a4d57] max-w-[640px] m-[0_0_8px]">
      {{ nf(papers.length) }} of the {{ nf(file?.papers ?? 0) }} papers and {{ nf(datasets.length) }} of the {{ nf(file?.datasets ?? 0) }} datasets,
      <template v-if="ranked">ranked by how much each has been used, from figures gathered on 30 and 31 October 2026.</template>
      <template v-else>chosen by how much each has been used, from figures gathered on 30 and 31 October 2026, and listed by title.</template>
      Dataset downloads are counted from 2019, when most were added to HydroShare. The full lists above hold everything.
    </p>
    <details class="max-w-[640px] m-[0_0_28px]">
      <summary class="font-['Hanken_Grotesk'] text-[14px] leading-[normal] text-water font-medium cursor-pointer">How they were chosen</summary>
      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.6] text-[#3a4d57] m-[10px_0_8px]">
        Papers: at each observatory, the two with the most citations per year; at each network cluster and the Hub, the one with the most.
        Datasets: the ten with the highest score, which is downloads per year plus 100 times citations per year, among datasets at least three
        years old (603 of the 796 then in the list could be scored). Downloads are HydroShare's, counted from 2019, when most were added there;
        citations are DataCite's for datasets and OpenAlex's for papers.
      </p>
      <p class="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[1.6] text-muted m-0">
        A network paper is placed in the cluster whose NSF award it credits (the cluster is named in the award's title), and is never one
        already chosen for an observatory.
      </p>
    </details>

    <div class="grid grid-cols-[1fr] gap-[40px] min-[900px]:grid-cols-[repeat(2,minmax(0,1fr))]">
      <div v-for="c in columns" :key="c.id">
        <h3 class="font-['Schibsted_Grotesk'] font-bold text-[20px] leading-[1.2] text-navy m-[0_0_12px]">
          {{ c.heading }}
          <span class="align-middle ml-[6px] font-mono font-normal text-[11.5px] leading-[normal] tracking-[.02em] text-water bg-[rgba(31,111,178,.09)] rounded-[4px] p-[2px_7px]">{{ c.of }}</span>
        </h3>
        <div v-for="l in c.lists" :key="l.id" class="mb-[24px] last:mb-0">
          <h4 v-if="l.label" class="font-mono font-bold tracking-[.1em] uppercase text-muted text-[11px] leading-[normal] m-[0_0_6px]">{{ l.label }}</h4>
          <ol role="list" class="list-none p-0 m-0">
            <li v-for="(r, n) in l.items.slice(0, l.show)" :key="r.doi || r.url || r.title" class="flex gap-[10px] py-[9px] border-t border-t-[rgba(15,33,43,.1)]">
              <span v-if="ranked" class="font-mono text-[11.5px] leading-[1.7] text-muted min-w-[16px]" aria-hidden="true">{{ n + 1 }}</span>
              <span>
                <a :href="link(r)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] text-[14.5px] leading-[1.4] text-navy font-medium rounded-[2px] hover:text-water hover:underline focus-visible:text-water focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water">{{ r.title }}<span aria-hidden="true" class="font-mono text-[11.5px] text-muted">&nbsp;&#8599;</span><span class="sr-only"> (opens in a new tab)</span></a>
                <span class="block font-mono text-[11.5px] leading-[1.5] text-muted mt-[2px]">{{ meta(r) }}</span>
              </span>
            </li>
          </ol>
          <details v-if="l.items.length > l.show" class="border-t border-t-[rgba(15,33,43,.1)]">
            <summary class="font-['Hanken_Grotesk'] text-[14px] leading-[normal] text-water font-medium cursor-pointer py-[10px]">Show the other {{ l.items.length - l.show }}</summary>
            <ol role="list" :start="l.show + 1" class="list-none p-0 m-0">
              <li v-for="(r, n) in l.items.slice(l.show)" :key="r.doi || r.url || r.title" class="flex gap-[10px] py-[9px] border-t border-t-[rgba(15,33,43,.1)]">
                <span v-if="ranked" class="font-mono text-[11.5px] leading-[1.7] text-muted min-w-[16px]" aria-hidden="true">{{ l.show + n + 1 }}</span>
                <span>
                  <a :href="link(r)" target="_blank" rel="noopener" class="font-['Hanken_Grotesk'] text-[14.5px] leading-[1.4] text-navy font-medium rounded-[2px] hover:text-water hover:underline focus-visible:text-water focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water">{{ r.title }}<span aria-hidden="true" class="font-mono text-[11.5px] text-muted">&nbsp;&#8599;</span><span class="sr-only"> (opens in a new tab)</span></a>
                  <span class="block font-mono text-[11.5px] leading-[1.5] text-muted mt-[2px]">{{ meta(r) }}</span>
                </span>
              </li>
            </ol>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>
