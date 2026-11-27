# Critical Zone section: where each claim comes from (epic CUAHSI/CUAHSI3-website#62, ticket T9)

27 November 2026. Read-only audit; nothing on the site is changed by it. Jordan asked for it on 27 November 2026 ("yes" to step 1 of
the T9 plan). It covers T9's first "done when" (each factual claim traceable to a source) and its fourth (the agent's editorial
choices labelled, C7), for the text on today's organisation `main` (7c977d1).

What was read: `pages/critical-zone-science/index.vue`, `about.vue`, `network.vue`, `observatories/[slug].vue` (all text in them),
the ten files `content/critical-zone/<slug>.md`, the T4 claims report (`agent/reports/261028_cz-cuahsi-role-claims.md`), the award
registry entry `nsf-2012893`, and the saved legacy pages named below. `datasets.vue` and `papers.vue` hold only a heading and a lead
over the product table, and were read for those. The products table, the highlights and the suggestion box (components) were not
audited: their text is the product records' own.

Source keys: **T4-n** is claim n of the T4 report, with Jordan's decision on it (31 October 2026, recorded in the comment at the top of
`about.vue`). **L** is a saved legacy page from the October 2026 crawl (`.agent/crawl*/html/`). **NSF** is the NSF award API record for
2012893, fetched 27 November 2026. **P** is computed from `content/critical-zone/products.json` on the page itself. **J** is Jordan in
chat, with the date.

## 1. Findings that need a decision

1. **"10" / "ten" observatories, where the archive says nine.** The front page's band says "10 Critical Zone Observatories" and the
   archive card says "the ten NSF observatories"; the observatory list has ten. The archive's own pages say nine:
   "Our nine U.S. environmental observatories" (archive home), "Our Nine Observatories" (its quick link), and "The U.S. National
   CZO Program is centered on nine observatories" (`/national/infrastructure/observatories-1national/`). The archive's observatory
   menu lists ten (Boulder, Calhoun, Catalina-Jemez, Christina, Eel, IML, Luquillo, Reynolds, Shale Hills, Sierra). Both can be true
   (ten over the program's life, nine at one time), but no page I read says so, and which one ended or began when is not in what I
   read. **Ask:** keep "10" with the menu as its source and a reviewer's check, or reword (for example "ten observatories over the
   program's life"), which needs a source for the dates.
2. **T9's "what" is not on the site yet.** The ticket asks for "what the critical zone is; the CZO program (2007 to 2020); CZNet
   (2020 on)". The site has no definition of the critical zone, and the program and network are each named in one line with dates;
   `network.vue` says in its own comment that its narrative "is not written yet". Sources exist for a short text, all read for this
   audit: the NSF abstract of award 2012893 ("loosely defined as the region of Earth from the top of the bedrock to the top of the
   treetops"); the CZNet home page ("Earth's outer skin, but often defined from bedrock to treetop"; CZNet "is the next phase of NSF's
   Critical Zone research program, comprised of nine Thematic Clusters"); the archive home ("In December 2020, the CZO program was
   succeeded by the Critical Zone Collaborative Network"; the AGU 2018 town hall title "a Decade of the U.S. CZO Program (2007-2018)").
   **Ask:** shall I draft that text (a proposal, then a PR)?
3. **"August 2027 at the latest"**, in 4 places: `index.vue` twice (the archive card; "Where the work lives today"), `network.vue`
   once, `observatories/[slug].vue` once. Source: J, 28 October 2026 (decision 7 of the plan). Open as decision C5 in
   `agent/reports/261031_cz-golive-approvals.md`: keep only if confirmed for public text.
4. **"who did the work"** in the front page's lead and meta description. The section names no people (people names were left out of
   the observatory texts on purpose, C7) and attributes work only through the awards table and product records. **Mine (C7):** either
   say "which observatories and clusters did the work" or drop the phrase.

## 2. Front page (`index.vue`)

| Text | Source | Holds? |
|---|---|---|
| NSF Critical Zone Observatories, 2007 to 2020 | L archive home: "Decade of the U.S. CZO Program (2007-2018)"; "In December 2020, the CZO program was succeeded by" CZNet | yes |
| CZNet, 2020 on; "the network that followed the observatories" | same; L CZNet home: "the next phase of NSF's Critical Zone research program" | yes |
| 9 CZNet thematic clusters, plus the Hub | L CZNet home: "nine Thematic Clusters"; the network page's list | yes |
| 10 observatories / "the ten NSF observatories" | L archive menu (ten); the archive's text says nine | **see finding 1** |
| N datasets and papers, N papers, N datasets, N software or model entries; "last addition" date | P | yes (counted, not typed) |
| Datasets "mostly in HydroShare" | P: 678 of 821 datasets have a HydroShare id (83%) | yes |
| Papers: "journal articles, books, reports and theses" | P has no paper-type field; titles and venues show 38 theses or dissertations, 28 reports, 5 books or chapters among 1,797 papers | yes, by title search only |
| Archive holds "data, publications, news and people" | L archive menu: Data, Publications, People, News | yes |
| Discover: "a search over Critical Zone datasets" | plan decision 7 (J, 28 October 2026); Discover itself is a JavaScript app and was not read | J only |
| All three sites "being retired", the last "by August 2027 at the latest" | J, 28 October 2026 | **see finding 3** |
| "who did the work" | none | **see finding 4** |

## 3. About page (`about.vue`)

Every sentence of "CUAHSI's role" maps to a T4 claim Jordan confirmed. None is unsourced.

| Text | Source |
|---|---|
| CUAHSI is the Coordinating Hub for CZNet, "the next phase of NSF Critical Zone research" | T4-1; L CZNet home |
| The Hub team: CUAHSI, EarthChem, the Powell Center, Utah State, Penn State, RENCI | T4-2 (Jordan, PR 141 comment, 29 October 2026) |
| NSF award 2012893, its title and dates, awarded to CUAHSI | T4-3, registry `nsf-2012893`; **checked against NSF today**: title, 1 September 2020 to 31 August 2027, awardee CUAHSI all match (T4 had left this unchecked) |
| Utah State and Lamont on the Hub team under their own awards | T4-3 addition (Jordan, PR 141). That Lamont is NSF 2012593 (Columbia) is T4's inference; the page does not state the number |
| The Hub is housed at CUAHSI; CUAHSI staff on the Hub team | T4-5, T4-6 |
| The Hub funds synthesis projects at the Powell Center | T4-5 |
| One of four objectives, quoted | T4-4; L `criticalzone.org/hub/about`. The NSF abstract words it "enhance and integrate existing data services operated by ... CUAHSI and EarthChem"; the quote is the Hub page's, as cited |
| CUAHSI operates criticalzone.org and hosts the archive site | T4-7, T4-8: Jordan's word (28 October 2026), no written source |
| Listed as a partner of the CZO network | T4-15 |
| 2011 and 2012 cyberseminars on Shale Hills and the western observatories | T4-13 (events of 11 November 2011 and 6 April 2012) |
| REU and RET students at the 2016 Biennial Colloquium; the 2011 joint USGS and CUAHSI workshop | T4-14 |
| National datasets via CUAHSI Water Data Center web services, 1968 to 2015 | T4-11 |
| The 2019 partnership to move the catalog to HydroShare | T4-9 (an announcement; it does not itself show the move finished) |
| HydroShare is a CUAHSI service; N of N datasets have a HydroShare page | T4-18; P |
| About 133 million values from 7 observatories (1,602 series, 1968 to 2015) in HIS | T4-12, the October 2026 footprint analysis, a secondary source not re-derived; Jordan confirmed it, without the "almost entirely open but unpublished" clause (decision C6, open) |
| "Where the lists come from", the counts by source | P |
| The awards table | the registry and P |

## 4. Network page and observatory page template

| Text | Source | Holds? |
|---|---|---|
| Network: the Hub and nine thematic clusters, each linked to its pages on criticalzone.org | L CZNet home and menu | yes |
| Observatory page lead, when a file has no summary | generic, no claim | n/a |
| "being retired, August 2027 at the latest" | J | see finding 3 |

## 5. The ten observatory texts

Each claim in each `summary` and body (numbers, dates, places, institutions and counts separately) was checked against the pages the
file itself lists under `sources`, all 14 of them saved in the October 2026 crawl. The check was done by a subagent; I re-read three of
its findings in the saved HTML (christina: neither "Delaware" nor "Pennsylvania" is on the page; reynolds: "Idaho" only in news links;
iml: "among the most rapidly incising rivers in the world" is on the page, unattributed).

**55 claims: 49 supported, 4 partly, 2 not found in the cited sources, 0 contradicted.** (Counted from the appendix rows; the
subagent's own summary said 52 and 46, which its table does not bear out.)

Not supported by the file's own sources (each needs a source added, or the words removed):

| File | Words | What the cited page says |
|---|---|---|
| christina | "in Delaware and Pennsylvania" | no state is named |
| reynolds | "in Idaho" (summary) | no location stated; Idaho only in news items (the page does say it is sited in the USDA-ARS Reynolds Creek Experimental Watershed) |
| luquillo | the Luquillo Mountains "include El Yunque National Forest" | El Yunque appears in a photo caption and a partner listing, not as part of the mountains |
| catalina-jemez | "in the arid and semi-arid landscapes of the U.S. Southwest" (summary) | "arid/semi-arid southwestern landscapes" is attached to the sensor-array sentence; "U.S." is not on the page |
| boulder | "The observatory also followed the effects of" the 2010 fire | the fire is listed as an event that affects the Critical Zone, with a link; the page does not say the observatory monitored it |

An observatory's claim or aim written as fact (C3 and the plan's rule that their claims stay theirs):

| File | Words | Suggested fix (mine, C7) |
|---|---|---|
| iml | the Minnesota River Basin "(among the most rapidly incising rivers in the world)" | "which the observatory describes as among the most rapidly incising rivers in the world" |
| boulder | "It ran outreach programs from kindergarten to graduate fellows and the general public" | the page says the programs "seek to reach out" at those levels: "It described outreach programs aimed at ..." |

Already attributed, no change: luquillo ("the observatory's own account says" most rapidly eroding), christina ("described by the
observatory as" best studied), catalina-jemez ("a stated aim"). Small and not wrong: shale-hills joins two pages' facts ("established
in 2007 around an 8-hectare forested catchment"); boulder's 26 square kilometres matches the cited line, though the same page also says
"about 6,000 acres" (about 24 square kilometres) in a news item.

The per-claim table, with the source line for each, is the appendix.

**What was done about them** (branch `content/cz-observatory-sources`, Jordan's yes of 27 November 2026). A wider search of the saved
archive found sources for three of the five: the archive's observatory menu on `/christina/about/` reads "Christina River Basin CZO
Delaware/Pennsylvania", on `/reynolds/about/` "REYNOLDS (ID)", and `/luquillo/infrastructure/` says the Luquillo Mountains area
"Includes El Yunque National Forest"; those pages were added to the files' `sources` and the words kept. Catalina-Jemez: "U.S. Southwest"
left the summary and "arid and semi-arid southwestern landscapes" went to the sensor sentence, as the page has it. Boulder: the fire
sentence now says the pages list it among events that affect the Critical Zone, and the outreach sentence says "described outreach
programs at several levels". IML: "which the observatory describes as" added. A new conflict came with the new Christina source: its
home page says "half a million people" rely on the basin, its about page "a million+" and "a million people"; the file keeps the home
page's figure, which is the one it cited, and the conflict is listed for the reviewers.

## 6. Editorial choices that are mine (C7)

- The section's structure (front, about, network, ten observatory pages) was approved on CUAHSI/CUAHSI3-website#147, option C; not mine to relabel.
- The observatory texts: one sentence of summary and two or three of body; people and "spotlight" names left out; "learn more" calls
  left out; an observatory's own claims kept as its own ("by its own account", "the archive says").
- Front page: "Two decades of critical zone research, and where to find it" (title); the full lists placed before the highlights was
  Jordan's (16 November 2026), not mine.
- About page: the awards split by start year (before 2020, 2020 or later) is mine; the registry has no era field.
- Finding 4's phrase, "who did the work", is mine.

## Not checked

- Whether each legacy page still says today what the October 2026 crawl saved.
- Discover's own text.
- The products table, highlights and suggestion box text (components).
- A science reviewer's reading of any sentence (T9's second "done when"; reviewers not yet named).

## Appendix: the 55 observatory claims

Source pages: `/<site>/` is `https://czo-archive.criticalzone.org/<site>/`; `luq/about` and `luq/partners` are Luquillo's `/about/` and
`/about/partner-organizations-luquillo/`; `sh/about` and `sh/infra` are Shale Hills' `/about/` and `/infrastructure/`. All read from the
October 2026 crawl.

| File | Claim | Verdict | Source line (short) | Page |
|---|---|---|---|---|
| boulder | erosion and weathering control CZ architecture and evolution; slope, climate, ecosystems, rock | supported | "how erosion and weathering control Critical Zone architecture and evolution" | /boulder/ |
| boulder | the 2010 Fourmile Canyon Fire | supported | "Fourmile Canyon Fire burned 26 sq km in 2010" | /boulder/ |
| boulder | burned 26 square kilometres | supported | same line (a news item says "about 6,000 acres") | /boulder/ |
| boulder | changed ecosystems and water and sediment delivery downstream | supported | "changing ecosystems as well as water and sediment delivery downstream" | /boulder/ |
| boulder | the observatory "followed the effects" | partly | listed under events that impact the Critical Zone | /boulder/ |
| boulder | "ran" outreach programs, kindergarten to graduate fellows and public | partly (an aim) | "seek to reach out with programs operating at multiple levels" | /boulder/ |
| calhoun | heavily degraded by over a century of farming | supported | "highly degraded by over a century of farming" | /calhoun/ |
| calhoun | people and land across space and time | supported | "human/landscape interactions across space and time" | /calhoun/ |
| calhoun | decades of soil and biomass studies, pine ecosystems of the Southeast | supported | "increased our knowledge of biogeochemical cycles in pine ecosystems" | /calhoun/ |
| catalina-jemez | geomorphic, hydrologic, biogeochemical interactions drive theory and models | supported | "drive theory and modeling of critical zone evolution" | /catalina-jemez/ |
| catalina-jemez | "arid and semi-arid landscapes of the U.S. Southwest" | partly | "in arid/semi-arid southwestern landscapes" (another sentence; no "U.S.") | /catalina-jemez/ |
| catalina-jemez | sensor and sampler arrays: water, carbon, lithogenic elements | supported | "measure fluxes and fate of water, carbon and lithogenic elements" | /catalina-jemez/ |
| catalina-jemez | stated aim: natural laboratories; students and public | supported (as an aim) | "The principal intent is to establish natural laboratories" | /catalina-jemez/ |
| christina | water, mineral, carbon cycles; human effect on carbon sequestration; soils to sea | supported | "quantify human impact on Critical Zone carbon sequestration - from soils to sea" | /christina/ |
| christina | "in Delaware and Pennsylvania" | not found | no state named | /christina/ |
| christina | Brandywine, White Clay, Red Clay Creeks | supported | "Brandywine, White Clay and Red Clay Creeks" | /christina/ |
| christina | agricultural and early industrial history | supported | "a rich agricultural and early industrial history" | /christina/ |
| christina | best-studied watersheds (attributed) | supported | "some the best studied watersheds in the nation" | /christina/ |
| christina | half a million people rely on it | supported | "half a million people relying on the CRB" | /christina/ |
| eel | Eel River, Northern California | supported | "Located in Northern California along the Eel River" | /eel/ |
| eel | CZ "currencies" change, interact, propagate | supported | "how critical zone currencies change, interact, and propagate" | /eel/ |
| eel | Rivendell, Angelo Coast Range Reserve, Eel River watershed | supported | "Explore our field sites: Rivendell, Angelo Coast Range Reserve" | /eel/ |
| eel | four departments at UC Berkeley | supported | "We span four different departments" | /eel/ |
| iml | prosperity, but change can degrade the environment | supported | "a cradle for our economic prosperity, but ... deterioration of the environment" | /iml/ |
| iml | three basins | supported | Clear Creek, Sangamon, Minnesota listed | /iml/ |
| iml | Clear Creek, Iowa: agriculture, drainage, wetland loss, urbanization | supported | "Intensive agriculture, artificial drainage, wetland loss, and urbanization" | /iml/ |
| iml | Sangamon, Illinois: farmed since the 1800s, from tallgrass prairie | supported | "Converted to agriculture from tallgrass prairie in the 1800s" | /iml/ |
| iml | Sangamon: drainage changes altered hydrology and biogeochemistry | supported | "altered the hydrology and biogeochemistry of the region" | /iml/ |
| iml | Minnesota River among the most rapidly incising in the world | supported, unattributed | "among the most rapidly incising rivers in the world" | /iml/ |
| luquillo | contrasting bedrock, similar climate and history | supported | "landscapes with contrasting bedrock but similar climatic and environmental histories" | /luquillo/ |
| luquillo | Luquillo Mountains, northeastern Puerto Rico | supported | "located in Luquillo Mountains of northeastern Puerto Rico" | luq/about |
| luquillo | the mountains include El Yunque National Forest | partly | photo caption and partner listing only | luq/about, luq/partners |
| luquillo | three rock types | supported | "granodiorites, volcaniclastics, and their associated contact metamorphic rocks" | luq/about |
| luquillo | most rapidly eroding (attributed) | supported | "some of the most rapidly eroding watersheds in the world" | luq/about |
| luquillo | the projects listed | supported | "deep weathering, soil formation and soil carbon accumulation, riparian zone dynamics" | luq/about |
| luquillo | the institutions named | supported | "researchers and students ... are from the University of Pennsylvania" and others | luq/about |
| luquillo | Luquillo LTER among partners | supported | partner page lists "Luquillo LTER" | luq/partners |
| reynolds | an observatory for soil carbon, intermediate watershed scale | supported | "soil carbon observation, experimentation, and modeling at the intermediate watershed scale" | /reynolds/ |
| reynolds | "in Idaho" | not found | Idaho in news items only | /reynolds/ |
| reynolds | in the USDA-ARS Reynolds Creek Experimental Watershed | supported | "is the location of the Reynolds Creek CZO" | /reynolds/ |
| reynolds | climate, vegetation, topography, rock and regolith control soil carbon | supported | "control and modulate the distribution of soil carbon" | /reynolds/ |
| reynolds | land management (prescribed fire) and climate change on carbon | supported | "land management practices such as prescribed fire affect carbon stores" | /reynolds/ |
| shale-hills | quantitative prediction; water, solutes, sediment | supported | "quantitative prediction of Critical Zone creation and structure" | /shale-hills/ |
| shale-hills | established in 2007 | supported | "a nationally funded Critical Zone Observatory established in 2007" | sh/about |
| shale-hills | 8 hectares, central Pennsylvania, Rose Hill shale | supported | "an 8-hectare watershed in central Pennsylvania developed entirely on the Rose Hill shale" | sh/infra |
| shale-hills | forested | supported | "a forested, first-order catchment of shale bedrock" | sh/about |
| shale-hills | minutes to millennia; water and element budgets | supported | "minutes (meteorological) to millennia (geological)" | sh/about |
| shale-hills | studied since 1958 with Leading Ridge | supported | "the focus of long-term studies since 1958" | sh/about |
| shale-hills | seven satellite sites, the Shale Transect, and where | supported | "7 satellite sites referred to as the Shale Transect" | sh/infra |
| shale-hills | three colleges at Penn State | supported | "spans three colleges within PSU" | sh/about |
| sierra | the water cycle drives CZ processes; water balance, nutrient cycling | supported | "how the water cycle drives Critical Zone processes" | /sierra/ |
| sierra | Providence Creek: four catchments, rain-snow transition, 1700 to 2000 m | supported | "Four instrumented headwater catchments ... 1700-2000 meters" | /sierra/ |
| sierra | Wolverton Basin, Sequoia National Park | supported | "the Wolverton basin watershed located in Sequoia National Park" | /sierra/ |
| sierra | program ended November 2020; Providence continues under USFS PSW | supported | "With the CZO program officially ended in Nov 2020" | /sierra/ |
| sierra | San Joaquin and Soaproot continue under NEON | supported | "continue as part of NEON" | /sierra/ |
