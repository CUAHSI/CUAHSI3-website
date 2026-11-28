# Critical Zone section: proposed narrative text (epic CUAHSI/CUAHSI3-website#62, ticket T9)

27 November 2026. **Approved and built.** Jordan, 27 November 2026: "yes, build it; drop 'who did the work'". Built on
`task/cz-narrative`; the text below is what the pages say, and the brackets are its sources. "August 2027" (C5) is unchanged; Jordan
confirmed it on 28 November 2026 ("August 2027 is fine"). Written first as a proposal: Jordan said yes on 27 November 2026 to step 2 of the T9 plan: draft
what T9 asks for and the site lacks (what the critical zone is; the CZO program, 2007 to 2020; CZNet, 2020 on), every sentence sourced.
He also decided the observatory count: "reword to ten over the program's life". Gap found in `261127_cz-t9-traceability.md`, finding 2.

The wording is mine (C8), kept to what the sources say (C3). Sources were read in the October 2026 crawl of the legacy sites
(`.agent/crawl*/html/`) and the NSF award API (fetched 27 November 2026). Each sentence lists its source in brackets; the brackets are
not part of the text.

Sources:
- **CZ** `https://czo-archive.criticalzone.org/national/research/the-critical-zone-1national/` (the archive's "The Critical Zone" page)
- **NA** `https://czo-archive.criticalzone.org/national/about/`
- **AH** the archive home, `https://czo-archive.criticalzone.org/`
- **OB** `https://czo-archive.criticalzone.org/national/infrastructure/observatories-1national/` (the archive's observatories page)
- **EST** each observatory's `/<slug>/about/` page, which carries "Established YYYY": Boulder, Shale Hills, Sierra 2007; Catalina-Jemez,
  Christina, Luquillo 2009; Calhoun, Eel, IML 2013; Reynolds 2014
- **SI** `https://czo-archive.criticalzone.org/sierra/` (the note to colleagues: "the CZO program officially ended in Nov 2020")
- **CN** the CZNet home, `https://criticalzone.org/`
- **NSF** the abstract of award 2012893
- **T4-5** the T4 claim Jordan confirmed: the Hub is housed at CUAHSI

## 1. What the critical zone is (front page, a new short section under the numbers)

> The critical zone is Earth's outer skin: the permeable layer from the tops of the trees to the bottom of the groundwater, where rock,
> soil, water, air and living things interact and shape the land surface [CZ; CN and NSF say "bedrock to treetop"]. It supports all
> life on land [CZ; NSF], and its processes run on time scales from seconds to geologic time [CZ: "second-to-eon timescales"].

## 2. The observatories, 2007 to 2020 (front page, the same section)

> From 2007 the National Science Foundation funded Critical Zone Observatories to study how the parts of the critical zone interact,
> shape Earth's surface and support life [AH: the AGU 2018 title "a Decade of the U.S. CZO Program (2007-2018)"; NA]. Ten observatories
> took part over the program's life, from California to Puerto Rico: three established in 2007, three in 2009, three in 2013 and one in
> 2014 [EST; OB: "from California to Puerto Rico"]. The program's own pages describe it as nine observatories [NA: "a
> collective of 9 U.S. environmental observatories"; CN]. It ended in November 2020 and was succeeded by the Critical Zone Collaborative
> Network [SI; AH: "In December 2020, the CZO program was succeeded by the Critical Zone Collaborative Network"].

## 3. The network, 2020 on (front page, the same section; and the lead of the network page)

> The Critical Zone Collaborative Network (CZNet) is the next phase of NSF's critical zone research [CN]. It has nine thematic
> clusters, research collaborations working in a wide range of geological, climatic and land-use settings [CN; NSF], and a Coordinating
> Hub, housed at CUAHSI, that provides cyberinfrastructure, data management and community services to the clusters [NSF; T4-5].

## 4. One line per cluster (network page, under each cluster's heading)

From the cluster's own line on the CZNet home [CN], reworded.

| Cluster | Proposed line |
|---|---|
| Hub | Enabling, supporting and communicating critical zone science (the Hub's own words, "Enabling, Supporting, and Communicating Critical Zone Science", in sentence case; not shown as a quotation). |
| Bedrock | The deep critical zone, and how it feeds back on processes at the surface. |
| Big Data | How the critical zone responds to disturbance, using field observations, existing data and statistical and process-based tools. |
| CINet | How critical interfaces regulate the storage and transport of water, sediment, carbon and nutrients. |
| Coastal | The processes that transform landscapes, and the fluxes between land and sea. |
| Drylands | Measuring and predicting carbon budgets in drylands across gradients of land use and climate. |
| Dust² | The dust system of the southwestern United States, from source to sink, as part of the critical zone. |
| Dynamic Water | How changing water storage, critical zone processes and water supply interact in mountain ecosystems of the western United States. |
| GeoMicro | How soil microbes, roots, minerals and soil organic matter interact to drive biogeochemistry and soil formation. |
| Urban | How the geologic template and the urban footprint interact, and what that does to critical zone processes along the Eastern Seaboard. |

## 5. Wording changes that follow (front page)

| Now | Proposed |
|---|---|
| Band: "10" / "Critical Zone Observatories" | "10" / "Critical Zone Observatories over the program's life" (Jordan, 27 November) |
| Archive card: "The archive of the ten NSF observatories, 2007 to 2020" | "The archive of the NSF Critical Zone Observatories, 2007 to 2020" (the count is now in section 2) |
| "The datasets, papers and reports listed for each of the ten Critical Zone Observatories." | unchanged: ten is now sourced (EST) |
| Lead: "what they were, who did the work, and where ..." | "what they were, and where ..." ("who did the work" dropped; Jordan, 27 November) |
| "August 2027 at the latest" (4 places) | unchanged; decision C5: Jordan, 28 November 2026, "August 2027 is fine" |

## 6. How it would be built (mine, C7; Jordan's yes needed, it is code)

- **Sections 1 to 3** are written into `pages/critical-zone-science/index.vue` (and section 3 into `network.vue`'s lead), as the rest of
  those pages' text is. One code PR, with the reviewer, the log file and the screenshot comparison (rule 3).
- **Section 4** goes in the same PR, as a `line` field on each entry of the `clusters` list in `network.vue`. Alternative: one content
  file per cluster, like the observatories (`content/critical-zone/<cluster>.md`), so staff can edit them by the content route; that adds
  ten files and a query to the page. I would start with the list in the page and move it only if the clusters get longer texts.
- The traceability report gets the new sentences added to its tables in the same PR. Not done: that report is in
  CUAHSI/CUAHSI3-website#168, not yet merged, and a PR may not build on another (rule 4); this file is the record of the sources instead.
- As built: sections 1 to 3 under a new heading, "What the critical zone is", after the numbers on the front page (section 1 as its
  text, sections 2 and 3 as two cards); section 3 as the network page's lead, followed by a sentence of mine that was not in the
  approved text: "Below are the datasets, papers and software listed for the Hub and each cluster, with links to where they live
  today." (it keeps what the old lead said; Jordan, 28 November 2026: "keep it").

## Not checked

- Whether the saved pages still say this today.
- When the one observatory that makes ten, against the program's nine, joined or left: the saved pages give the start years only, so
  the text does not say which one or when.
- A science reviewer's view of any sentence (reviewers not yet named).
