# Journal names, recovered DOIs, and papers with nothing lasting to point to

16 November 2026. Epic CUAHSI/CUAHSI3-website#62. **Applied** on this branch to `content/critical-zone/products.json`, after Jordan approved the plan and answered its questions, and after three reviews. Written first as a proposal; the figures below are the applied ones.

This puts into practice your decisions of 16 November:
- **Where shows the journal for papers** (revising the 5 November rule of publisher, not journal), **and the data repository for datasets.** It goes in the existing `repository` field. For a chapter, Where names the book. For a whole book it names the publisher, and for a thesis the repository that holds it.
- **A paper stays only if it points somewhere that will outlive the archive:** a DOI, or a page for the work itself. Pages at university repositories and ADS that refuse automated requests count as live. The rest are **deleted, not flagged**.
- **Preprints count**, unless the journal version is on the list too.
- **The reports and other files the archive hosts are kept for later retrieval** (retirement checklist, item 1). Their records come off the list here.
- **The OpenAlex search was run by your data-citation-analysis session with your API key**, at your direction and with your approval there.

The code changes follow in a separate PR: Where reads `repository`, the line under the title goes, the network page's columns get fixed widths, and award titles lose their preambles.

## In one table

All 2,062 papers on the list (1,568 with a DOI, 494 without):

| What happens | Papers | Section |
|---|---|---|
| Journal name put in `repository` (5 of them named by me) | 1,045 | A |
| Journal name already right, no change | 511 | |
| No journal name in any source; current text kept (the OpenAlex names were not journals) | 4 | |
| DOI recovered: `doi`, address, Where and, for near-misses, the published title and year | 130 (6 of them decided by you, E) | B |
| Preprint pointed at its journal version, or recovered as one | 4 | G |
| Kept with a page of their own, mostly theses in university repositories | 103 | D |
| Deleted: an earlier version of a paper already on the list, or the same work listed twice | 11 | C |
| Deleted: a preprint whose journal version is on the list | 6 | G |
| Deleted: nothing lasting to point to | 248 | F |

**265 papers are deleted** (248 + 11 + 6). The list goes from **2,062 papers to 1,797**; records in the file from 2,889 to 2,624. Datasets and software do not change.

Of the 494 without a DOI: 132 get one, 103 keep a page of their own, and 259 are deleted (248 in F, 11 in C). Of the 1,568 with a DOI: 1,045 get a journal name, 511 already have it, 4 have no journal name in any source and keep their text, 6 preprints are deleted and 2 become their journal version.

## How each part was found

- **Journal names.** Crossref (`container-title`) for each of the 1,568 DOIs. A chapter or proceedings paper takes the book or volume, the last container title, not the series. Preprint servers come from Crossref's `institution`. OpenAlex's names were dropped: none of them was a journal.
- **DOI recovery, first pass.** Crossref by title for each of the 494, keeping the best of 3:
  - **Exact** means the same title, the year within one, and the first author on the archive page among the DOI's authors. The author check was added after review, when 3 exact matches turned out to be book reviews.
  - **Near-misses** (title similarity of 0.7 or more) were accepted only when the first author matched. Three were read by hand.
- **Second pass, by your data-citation session.** It searched OpenAlex with your key for the 348 records the first pass left (the first pass's OpenAlex searches had been rate-limited, and had kept only matches with a DOI). It ran three searches per record where needed: title; title and first author; full text with the year within three. I accepted a candidate when:
  - the title similarity was 0.9 or more, or 0.6 with the first author matching;
  - and the year was within two.

  I then rejected five by reading them: three book reviews, a library catalogue record and an aggregator page (dissem.in). A second review found that my first-author comparison had failed on names written "First Last", on two-letter surnames, on hyphens and on umlauts, so 17 good matches had been dropped without a note; the comparison was fixed and they are back. One more rule was added after that review: a candidate whose authors and year agree and whose journal is the one the citation names counts even when the title is rendered differently (OpenAlex writes "S ierra N evada"); three papers came back that way.
- **Pages of its own.** Either a link on the archive page that no other record's page carries (so an observatory's general pages don't count), or a repository page from OpenAlex. OpenAlex pages in the first batch were requested on 16 November: 37 answered, and 44 refused a scripted request, nearly all at university repositories and ADS, and count as live by your rule. The pages added after the second review were not requested and count as live by the same rule. Five records whose only page was a retired Forest Service address or a personal page stay deleted, and so do Patton's thesis, whose only page was an AGU abstract on a related topic (third review), and a Penn State MFA thesis whose only page was a Georgia Tech conference paper on the same subject (final review).
- **Duplicates.** A recovered DOI already on the list means the record is an earlier version of a listed paper: a draft, a meeting paper or a thesis under a different title (section C).
- **Preprints.** Crossref's `is-preprint-of`, arXiv's DataCite record, or a title and first-author match names the journal version (section G).

## Not checked

- I did not read every one of the 1,045 journal changes. 25 were spot-read, and the 5 agent's-choice names are listed in A.
- The kind given to each deleted record in F is a keyword match on its citation text, so it is approximate.
- Pages that refused a scripted request were not opened. They count as live by your rule.
- Papers that no title search finds are left for CUAHSI/CUAHSI3-website#141. The reviewer named five more in F that look findable but have no good candidate in the OpenAlex results (Brantley and White 2009, Chen et al. 2014, Pearson and Pizzuto 2015, Stromberg et al. 2017, Schwabedissen et al. 2018); they belong to that search.
- USGS reports take their series as Where ("Circular", "Open-File Report", "Fact Sheet", "Professional Paper"): that is how USGS publishes them.
- The 2009 HESS Discussions preprint (B) has no final HESS version in Crossref, so it stays a preprint.

## Rules applied that the tables rely on

- **Where for a record kept with a page of its own** names the repository that holds it, for example "eScholarship (University of California)", "Penn State Electronic Theses and Dissertations" or "NASA ADS (AGU Fall Meeting abstract)". The names come from a table of hosts in the apply script (agent's choice), and section D shows each new value with the text it replaces. Five were named by hand from their own citation: a JSTOR journal, the Journal of the Iowa Academy of Science, two conference proceedings and a workshop report.
- **Year.** A record that becomes a different work takes that work's year: a thesis or draft that became a paper, or a preprint that became its journal version. A near-miss takes Crossref's `issued` year, which is the earliest date of publication and so often the online-first year. That moved 10 years, by one year in most cases (for example Hydrological Processes 27, printed 2013, issued online in 2012).
- **Journal names** are written as Crossref writes them (PLOS ONE, CATENA), except that one all-capitals variant (BIOTROPICA) takes the spelling the rest of the list uses.
- **Deleting records.** Products carry no `slug` and no `published` field, so C5's "set `published: false`" cannot apply and no check guards the deletion. The authority is your rule of 16 November: "delete the records rather than flag them".

## Decided (16 November)

Jordan answered the three questions ("Yes to all three, make those calls"):
1. **The six in E** each became the published paper. Four are the same paper (same journal and year, the title a little changed). Two were published later by the same first author: Stanbery's 2016 thesis as a CATENA paper in 2023, and Lohse's 2018 cross-CZO piece as a 2024 chapter in *Critical Zone and Ecosystem Dynamics*.
2. **The GradWorks dissertation** stays (section D).
3. **The 5 names I chose** stand (section A).

## The records
### A. Journal names for papers that have a DOI: 1045 changes

Source: 1033 crossref, 5 agent's choice, 4 crossref (preprint server), 3 Crossref (book of vol. 19, not the series). For a chapter or a proceedings paper, the book or volume (not the series). What the field held before, by kind:

| Before | Records |
|---|---|
| a citation with volume or pages | 754 |
| a publisher name | 204 |
| other text | 86 |
| empty | 1 |

The 25 most common journal names after the change:

| Journal | Papers |
|---|---|
| Water Resources Research | 114 |
| Hydrological Processes | 30 |
| Vadose Zone Journal | 30 |
| Journal of Geophysical Research: Biogeosciences | 28 |
| Journal of Geophysical Research: Earth Surface | 26 |
| Biogeochemistry | 24 |
| Ecohydrology | 23 |
| Earth Surface Processes and Landforms | 21 |
| Geophysical Research Letters | 21 |
| Soil Biology and Biochemistry | 19 |
| Soil Science Society of America Journal | 19 |
| Hydrology and Earth System Sciences | 18 |
| Scientific Reports | 16 |
| Chemical Geology | 16 |
| Journal of Hydrology | 15 |
| Proceedings of the National Academy of Sciences | 14 |
| Ecosphere | 14 |
| Applied Geochemistry | 14 |
| Environmental Science & Technology | 13 |
| Geomorphology | 13 |
| Geoderma | 13 |
| Geochimica et Cosmochimica Acta | 13 |
| Biogeosciences | 12 |
| Global Change Biology | 10 |
| Science | 9 |

**Agent's choice (5):** no source names a journal, so the name comes from the DOI: the `essoar` DOIs are ESS Open Archive preprints, and 10.3965 is the journal the record already names, without its volume.

| Record | DOI | Before | After |
|---|---|---|---|
| Defining Soil and Water Assessment Tool (SWAT) hydrologic response units (HRUs) | 10.3965/j.ijabe.20150803.951 | International Journal of Agricultural and Biological Engineering 8 (3) | International Journal of Agricultural and Biological Engineering |
| Critical Zone Measurements: Development of Novel Experimental Deployments to Fur | 10.1002/essoar.10502137.1 | Wiley | ESS Open Archive |
| Global-scale shifts in Anthropocene rooting depths pose unexamined consequences | 10.1002/essoar.10505751.1 | Wiley | ESS Open Archive |
| Meeting the Needs of Interdisciplinary Critical Zone Scientists by Leveraging an | 10.1002/essoar.10509220.1 | Wiley | ESS Open Archive |
| Advancing reproducible and transparent research with practical skills in data an | 10.22541/essoar.176590620.05979262/v1 | ESS | ESS Open Archive |

Every change is in `agent/reports/cz_paper_journals_plan.json` (record index, before, after, source).

### B. DOIs recovered: 130

Each gets `doi`, `url` (the DOI address) and `repository` (its journal; a chapter's book; a whole book's publisher). How matched:
- **exact**: the same title, the year within one, and (checked for all) the first author on the archive page among the DOI's authors.
- **accept**: a near-miss title (similarity 0.7 or more) whose first author matches; the record takes the published title and year. **accept (author written differently)**: the same, with the names compared by hand.
- **openalex match / near**: from the OpenAlex search the data-citation session ran with Jordan's key (title similarity 0.9 or more, or 0.6 with the first author matching; year within two).
- **link** and the rest: a link on the archive page, or a correction named in the row.

| # | Match | Year | Title on the list | Published as (if different) | DOI | Where |
|---|---|---|---|---|---|---|
| 1 | E, Jordan 16 Nov: a 2016 thesis later published by its first author (CATENA 2023; the SSRN preprint of 2022 is the same work) | 2016 | Controls on the Presence, Concentration, Storage, and Variability of Soil Inorganic Carbon | Controls on the presence and storage of soil inorganic carbon in a semi-arid watershed | 10.1016/j.catena.2023.106980 | CATENA |
| 2 | E, Jordan 16 Nov: a 2018 cross-CZO piece later published by its first author as a 2024 chapter | 2018 | Critical zone science informs landscape management through quantification of slow and ofte | Critical Zone Science Informs Landscape Management Through Quantification of Slow Episodic | 10.1007/978-3-031-69076-1_12 | Critical Zone and Ecosystem Dynamics |
| 3 | E, Jordan 16 Nov: same journal and year, fuller title | 2016 | Simulating maize production, water and surface energy balance, and canopy temperature unde | Simulating Maize Production, Water and Surface Energy Balance, Canopy Temperature, and Wat | 10.13031/trans.59.11067 | Transactions of the ASABE |
| 4 | E, Jordan 16 Nov: same journal and year; published as a "Debates" piece | 2017 | Hypothesis testing in hydrology: A view from the field: The value of hydrologic hypotheses | Debates—Hypothesis testing in hydrology: A view from the field: The value of hydrologic hy | 10.1002/2016wr020050 | Water Resources Research |
| 5 | E, Jordan 16 Nov: same journal, year and title; the archive names a different first author | 2016 | The Wabash sampling blitz: A case study on the effectiveness of citizen science | The Wabash Sampling Blitz: A Study on the Effectiveness of Citizen Science | 10.5334/cstp.1 | Citizen Science: Theory and Practice |
| 6 | E, Jordan 16 Nov: same journal, year and title; the archive names the author Litwin, OpenAlex Litwin Miller (the same person) | 2014 | Generalized sorting profile for alluvial fans | Generalized sorting profile of alluvial fans | 10.1002/2014gl060991 | Geophysical Research Letters |
| 7 | accept | 1993 | Biomass and Nutrient Content of the Bisley Experimental Watersheds, Luquillo Experimental | Biomass and Nutrient Content of the Bisley Experimental Watersheds, Luquillo Experimental | 10.2307/2388975 | Biotropica |
| 8 | accept | 1997 | Organic matter dynamics in White Clay Creek, Pennsylvania, U.S.A. | Organic Matter Dynamics in White Clay Creek, Pennsylvania, USA | 10.2307/1468231 | Journal of the North American Benthological Society |
| 9 | accept | 1998 | Three decades of observed soil acidification at the Calhoun Experimental Forest: Has acid | Three Decades of Observed Soil Acidification in the Calhoun Experimental Forest: Has Acid | 10.2136/sssaj1998.03615995006200050040x | Soil Science Society of America Journal |
| 10 | accept | 1999 | A nitrogen budget for late-successional hill slope tabonuco forest, Puerto Rico | A nitrogen budget for late-successional hillslope tabonuco forest, Puerto Rico | 10.1007/978-94-011-4645-6_5 | New Perspectives on Nitrogen Cycling in the Temperate and Tropical Americas |
| 11 | accept | 1999 | Modeling rainfall interception by a lowland tropical rain forest in northeastern Puerto Ri | Modelling rainfall interception by a lowland tropical rain forest in northeastern Puerto R | 10.1016/s0022-1694(99)00157-2 | Journal of Hydrology |
| 12 | accept | 2000 | Variation in below ground carbon storage and soil CO2 flux rates along a wet tropical clim | Variations in Belowground Carbon Storage and Soil CO2 Flux Rates along a Wet Tropical Clim | 10.1646/0006-3606(2000)032[0614:vibcsa]2.0.co;2 | Biotropica |
| 13 | accept | 2002 | Soil phosphorus fractionation during forest development on landslide scars in the Luquillo | Soil Phosphorus Fractionation during Forest Development on Landslide Scars in the Luquillo | 10.1111/j.1744-7429.2002.tb00238.x | Biotropica |
| 14 | accept | 2004 | Stormflow generation in a small rain-forest catchment in the Luquillo Experimental Forest, | Stormflow generation in a small rainforest catchment in the Luquillo Experimental Forest, | 10.1002/hyp.1335 | Hydrological Processes |
| 15 | accept | 2008 | Vegetation-Hydrology Dynamics in Complex Terrain of Semiarid Areas: II. Energy-Water Contr | Vegetation-hydrology dynamics in complex terrain of semiarid areas: 2. Energy-water contro | 10.1029/2006wr005595 | Water Resources Research |
| 16 | accept | 2009 | SOM dynamics and erosion in an agricultural test field of the Clear Creek, Iowa, watershed | SOM dynamics and erosion in an agricultural test field of the Clear Creek, IA watershed | 10.5194/hessd-6-1581-2009 | Hydrology and Earth System Sciences Discussions (no source names one; current text kept) |
| 17 | accept | 2011 | Streams of the Montane Humid Tropics |  | 10.1016/b978-0-12-374739-6.00256-6 | Treatise on Geomorphology |
| 18 | accept | 2013 | Coupling of the simultaneous heat and water model with a distributed hydrological model an | Coupling of a simultaneous heat and water model with a distributed hydrological model and | 10.1002/hyp.9514 | Hydrological Processes |
| 19 | accept | 2015 | The Geochemical Transformation of Soils by Agriculture and Its Dependence on Soil Erosion: | The geochemical transformation of soils by agriculture and its dependence on soil erosion: | 10.1016/j.scitotenv.2015.03.084 | Science of The Total Environment |
| 20 | accept | 2015 | Modeling Temperature and Humidity Profiles withing Forest Canopies. | Modeling temperature and humidity profiles within forest canopies | 10.1016/j.agrformet.2015.07.007 | Agricultural and Forest Meteorology |
| 21 | accept | 2015 | Effect of conservation practice implementation by USDA programs at field and watershed sca | Effect of conservation practices implemented by USDA programs at field and watershed scale | 10.2489/jswc.71.3.249 | Journal of Soil and Water Conservation |
| 22 | accept | 2015 | Porescale Geochemical Processes, Chapter 10: How porosity increases during incipient weath | How Porosity Increases During Incipient Weathering of Crystalline Silicate Rocks | 10.1515/9781501502071-010 | Pore Scale Geochemical Processes |
| 23 | accept | 2017 | Impacts of increasing aridity and wildfires on aerosol loading in the intermountain wester | Impacts of increasing aridity and wildfires on aerosol loading in the intermountain Wester | 10.1088/1748-9326/aa510a | Environmental Research Letters |
| 24 | accept | 2018 | The role of soil physical properties for determining biogeochemical responses to soil warm | The role of the physical properties of soil in determining biogeochemical responses to soi | 10.1016/b978-0-12-813493-1.00010-7 | Ecosystem Consequences of Soil Warming |
| 25 | accept | 2019 | Chapter 19. Long-term forest soils research: lessons learned from the US experience. | Long-term forest soils research: lessons learned from the US experience | 10.1016/b978-0-444-63998-1.00019-7 | Global Change and Forest Soils |
| 26 | accept | 2019 | Chapter 4. History of forest soils knowledge and research | History of forest soils knowledge and research | 10.1016/b978-0-444-63998-1.00004-5 | Global Change and Forest Soils |
| 27 | accept | 2019 | Soil fauna and their potential responses to warmer soil | Soil fauna and their potential responses to warmer soils | 10.1016/b978-0-12-813493-1.00012-0 | Ecosystem Consequences of Soil Warming |
| 28 | accept | 2019 | Poised to Hindcast and Earthcast the Effect of Climate on the Critical Zone: Shale Hills a | Poised to Hindcast and Earthcast the Effect of Climate on the Critical Zone | 10.1002/9781119413332.ch10 | Biogeochemical Cycles |
| 29 | accept (author written differently) | 2002 | Prediction of Master Recession Curves and Baseflow Recessions in the Luquillo Mountains of |  | 10.1111/j.1752-1688.2002.tb00990.x | JAWRA Journal of the American Water Resources Association |
| 30 | accept (author written differently) | 2012 | Wepp: Model use, calibration, validation | WEPP: Model Use, Calibration, and Validation | 10.13031/2013.42254 | Transactions of the ASABE |
| 31 | accept (original chapter; the first match was IGI's 2014 reprint in "K-12 Education") | 2013 | Developing a web application for the integration of real-world, scientific, problem-solvin |  | 10.4018/978-1-4666-3676-7.ch009 | Cases on Educational Technology Implementation for Facilitating Learning |
| 32 | arXiv preprint, no journal version | 2018 | Reinforcement of climate hiatus by decadal modulation of daily cloud cycle |  | 10.48550/arxiv.1803.01752 | arXiv |
| 33 | citation names Geomorphology; the earlier match was the GSA abstract | 2016 | Gophers as geomorphic agents in the Colorado Front Range. | Gophers as geomorphic agents in the Colorado Front Range subalpine zone | 10.1016/j.geomorph.2016.04.003 | Geomorphology |
| 34 | exact | 1958 | The Calhoun Experimental Forest |  | 10.5962/bhl.title.115583 | US Forest Service Southeastern Forest Experiment Station, June 1958 (no source names one; current text kept) |
| 35 | exact | 1992 | Streamside forests and the physical, chemical, and trophic characteristics of piedmont str |  | 10.2166/wst.1992.0367 | Water Science and Technology |
| 36 | exact | 1995 | Measurement of streamwater biodegradable dissolved organic carbon with a plug-flow bioreac |  | 10.1016/0043-1354(95)00135-8 | Water Research |
| 37 | exact | 1995 | Geomorphology, disturbance, and the soil and vegetation of two subtropical wet steepland w |  | 10.1016/0169-555x(95)00021-v | Geomorphology |
| 38 | exact | 1995 | Soil carbon turnover in a recovering temperate forest |  | 10.1029/95gb02380 | Global Biogeochemical Cycles |
| 39 | exact | 1999 | Chemical weathering in a tropical watershed, Luquillo Mountains, Puerto Rico III: Quartz d |  | 10.1016/s0016-7037(99)00056-3 | Geochimica et Cosmochimica Acta |
| 40 | exact | 1999 | Soil oxygen availability and biogeochemistry along rainfall and topographic gradients in u |  | 10.1023/a:1006034126698 | Biogeochemistry |
| 41 | exact | 2000 | Surface and subsurface dissolved organic carbon |  | 10.1016/b978-012389845-6/50011-9 | Streams and Ground Waters |
| 42 | exact | 2000 | Effects of hurricane disturbance on stream water concentrations and fluxes in eight tropic |  | 10.1017/s0266467400001358 | Journal of Tropical Ecology |
| 43 | exact | 2000 | Long-term soil potassium availability from a Kanhapludult to an aggrading loblolly pine ec |  | 10.1016/s0378-1127(99)00175-9 | Forest Ecology and Management |
| 44 | exact | 2002 | Riparian forest restoration: Increasing success by reducing plant competition and herbivor |  | 10.1046/j.1526-100x.2002.02036.x | Restoration Ecology |
| 45 | exact | 2003 | A mixing model analysis of stream solute dynamics and the contribution of a hyporheic zone |  | 10.1046/j.1365-2427.2003.01062.x | Freshwater Biology |
| 46 | exact | 2003 | The role of monomers in stream ecosystem metabolism |  | 10.1016/b978-012256371-3/50005-6 | Aquatic Ecosystems |
| 47 | exact | 2004 | Riparian Deforestation, Stream Narrowing, and Loss of Stream Ecosystem Services |  | 10.1073/pnas.0405895101 | Proceedings of the National Academy of Sciences |
| 48 | exact | 2006 | Biodegradable dissolved organic matter in a temperate and a tropical stream determined fro |  | 10.4319/lo.2006.51.2.1054 | Limnology and Oceanography |
| 49 | exact | 2006 | Ecosystem metabolism in Piedmont streams: reach geomorphology modulates the influence of r |  | 10.1007/s10021-005-0086-6 | Ecosystems |
| 50 | exact | 2006 | Primary productivity and community respiration |  | 10.1016/b978-012332908-0.50040-1 | Methods in Stream Ecology |
| 51 | exact | 2006 | State of the Watershed: Water Quality of Boulder Creek, Colorado |  | 10.3133/cir1284 | Circular |
| 52 | exact | 2006 | Characteristics of fog and fogwater fluxes in a Puerto Rican elfin cloud forest. |  | 10.1016/j.agrformet.2006.07.008 | Agricultural and Forest Meteorology |
| 53 | exact | 2007 | How planting method, weed abatement, and herbivory affect afforestation success |  | 10.1093/sjaf/31.2.85 | Southern Journal of Applied Forestry |
| 54 | exact | 2007 | Physical and Chemical Controls on the Critical Zone |  | 10.2113/gselements.3.5.315 | Elements |
| 55 | exact | 2007 | CUAHSI WaterML |  | 10.62973/07-041r1 | Open Geospatial Consortium Discussion Paper, OGC 07-041r1 (no source names one; current text kept) |
| 56 | exact | 2008 | Seasonal reassembly of a river food web: floods, droughts, and impacts of fish |  | 10.1890/06-0902.1 | Ecological Monographs |
| 57 | exact | 2008 | Untangling the complex issue of dissolved organic carbon uptake: a stable isotope approach |  | 10.1111/j.1365-2427.2007.01941.x | Freshwater Biology |
| 58 | exact | 2008 | Observations of soils at the hillslope scale in the Clear Creek watershed in Iowa, USA |  | 10.2136/sh2008.4.0083 | Soil Survey Horizons |
| 59 | exact | 2008 | Comparison of total mercury and methylmercury cycling at five sites using the small waters |  | 10.1016/j.envpol.2007.12.031 | Environmental Pollution |
| 60 | exact | 2008 | Weathering of the Rio Blanco quartz diorite, Luquillo mountains, Puerto Rico: Coupling oxi |  | 10.1016/j.gca.2008.06.020 | Geochimica et Cosmochimica Acta |
| 61 | exact | 2008 | A Relational Model for Environmental and Water Resources Data |  | 10.1029/2007wr006392 | Water Resources Research |
| 62 | exact | 2008 | An efficient domain decomposition framework for accurate representation of geodata in dist |  | 10.1080/13658810802344143 | International Journal of Geographical Information Science |
| 63 | exact | 2009 | Algal mats and insect emergence in rivers under Mediterranean climates: Towards photogramm |  | 10.1111/j.1365-2427.2008.02163.x | Freshwater Biology |
| 64 | exact | 2009 | Temporal dynamics of seston: A recurring nighttime peak and seasonal shifts in composition |  | 10.4319/lo.2009.54.1.0344 | Limnology and Oceanography |
| 65 | exact | 2009 | High-intensity soil survey and hydropedologic functional map units. |  | 10.2136/sh2009.3.0079 | Soil Survey Horizons |
| 66 | exact | 2010 | Halloysite Nanotubes and Bacteria at the Saprolite–Bedrock Interface, Rio Icacos Watershed |  | 10.2136/sssaj2010.0126nps | Soil Science Society of America Journal |
| 67 | exact | 2010 | Riparian indicators of flow frequency in a tropical montane stream network |  | 10.1016/j.jhydrol.2009.12.019 | Journal of Hydrology |
| 68 | exact | 2010 | Comments on Energy-based Pedogenic Models by Field and Minasny (2008) and Rasmussen (2008) |  | 10.2136/sssaj2009.0261l | Soil Science Society of America Journal |
| 69 | exact | 2010 | Repeated Electromagnetic Induction Surveys for Improved Soil Mapping in an Agricultural La |  | 10.2136/sssaj2010.0056 | Soil Science Society of America Journal |
| 70 | exact | 2010 | Soil Architecture and Preferential Flow across Scales. |  | 10.1016/j.jhydrol.2010.07.026 | Journal of Hydrology |
| 71 | exact | 2011 | Landsat-5 TM and LiDAR fusion for sub-pixel Juniper tree cover estimates in a western rang |  | 10.14358/pers.77.12.1241 | Photogrammetric Engineering & Remote Sensing |
| 72 | exact | 2011 | Snow measurement by GPS interferometric reflectometry: an evaluation at Niwot Ridge, Color |  | 10.1002/hyp.8329 | Hydrological Processes |
| 73 | exact | 2011 | Impact of Soil Physicochemical and Biological Reactions on Transport of Nutrients and Poll |  | 10.1201/b11268-16 | Handbook of Soil Sciences |
| 74 | exact | 2011 | Landscape response to tipping points in granite weathering: The case of stepped topography |  | 10.1016/j.apgeochem.2011.03.026 | Applied Geochemistry |
| 75 | exact | 2012 | Biological lability of streamwater fluorescent dissolved organic matter |  | 10.4319/lo.2012.57.5.1347 | Limnology and Oceanography |
| 76 | exact | 2012 | Landscape scale linkages in critical zone evolution |  | 10.1016/j.crte.2012.10.008 | Comptes Rendus. Géoscience |
| 77 | exact | 2012 | Water chemistry of surface waters affected by the Fourmile Canyon wildfire, Colorado, 2010 |  | 10.3133/ofr20121104 | Open-File Report |
| 78 | exact | 2012 | Wildfire Effects on Source-Water Quality—Lessons from Fourmile Canyon Fire, Colorado, and |  | 10.3133/fs20123095 | Fact Sheet |
| 79 | exact | 2012 | Effects of two-century land use changes on soil iron crystallinity and accumulation in Sou |  | 10.1016/j.geoderma.2011.12.021 | Geoderma |
| 80 | exact | 2012 | A New Method for Segmenting Individual Trees from the Lidar Point Cloud. |  | 10.14358/pers.78.1.75 | Photogrammetric Engineering & Remote Sensing |
| 81 | exact | 2014 | Process dominance shift in solute chemistry as revealed by long-term high-frequency water |  | 10.1016/j.gca.2014.05.011 | Geochimica et Cosmochimica Acta |
| 82 | exact | 2014 | Spatially variable water table recharge and the hillslope hydrologic response: Analytical |  | 10.1002/2013wr015144 | Water Resources Research |
| 83 | exact | 2014 | Subcanopy solar radiation model: predicting solar radiation across a heavily vegetated lan |  | 10.1016/j.rse.2014.01.028 | Remote Sensing of Environment |
| 84 | exact | 2014 | Modeling evapotranspiration and energy balance in a wheat-maize cropping system using the |  | 10.1016/j.agrformet.2014.04.009 | Agricultural and Forest Meteorology |
| 85 | exact | 2014 | Fluorescence Indices and their Interpretation. |  | 10.1017/cbo9781139045452.015 | Aquatic Organic Matter Fluorescence |
| 86 | exact | 2014 | Snow temperature changes within a seasonal snowpack and their relationship to turbulent fl |  | 10.1175/jhm-d-13-026.1 | Journal of Hydrometeorology |
| 87 | exact | 2014 | Topography alters tree growth–climate relationships in a semi-arid forested catchment |  | 10.1890/es14-00296.1 | Ecosphere |
| 88 | exact | 2014 | Differential effects of canopy trimming and litter deposition on litterfall and nutrient d |  | 10.1016/j.foreco.2014.05.018 | Forest Ecology and Management |
| 89 | exact | 2014 | NEON and STREON: opportunities and challenges for the aquatic sciences. |  | 10.1086/679489 | Freshwater Science |
| 90 | exact | 2014 | Tracking evolution of urban biogeochemical cycles: past,present, and future |  | 10.1007/s10533-014-0014-y | Biogeochemistry |
| 91 | exact | 2015 | Beryllium-7 wet deposition variation with storm height, synoptic classification, and tree |  | 10.1002/hyp.10571 | Hydrological Processes |
| 92 | exact | 2015 | Multi-elemental scanning transmission X-ray microscopy–near edge X-ray absorption fine str |  | 10.1071/en14042 | Environmental Chemistry |
| 93 | exact | 2015 | Aboveground Biomass Estimates of Sagebrush Using Terrestrial and Airborne LiDAR Data in a |  | 10.1016/j.agrformet.2015.06.005 | Agricultural and Forest Meteorology |
| 94 | exact | 2015 | Spatial variability of saturated hydraulic conductivity at the hillslope scale: Understand |  | 10.1016/j.geoderma.2014.12.010 | Geoderma |
| 95 | exact | 2015 | Spatial and temporal variations in meteoric 10Be inventories and long-term deposition rate |  | 10.1016/j.quascirev.2014.11.003 | Quaternary Science Reviews |
| 96 | exact | 2016 | Experimental Geomicrobiology: From Field to Laboratory. |  | 10.1128/9781555818821.ch5.2.2 | Manual of Environmental Microbiology |
| 97 | exact | 2016 | Postfire grazing management effects on mesic sagebrush-steppe vegetation: spring grazing. |  | 10.1016/j.jaridenv.2015.10.022 | Journal of Arid Environments |
| 98 | exact | 2016 | Dynamic Assessment of Current Management in an Intensively Managed Agroecosystem |  | 10.1111/j.1936-704x.2016.03225.x | Journal of Contemporary Water Research & Education |
| 99 | exact | 2016 | Assessing the effect of a major storm on 10Be concentrations and inferred basin-averaged d |  | 10.1016/j.quageo.2016.03.006 | Quaternary Geochronology |
| 100 | exact | 2016 | Snowmelt Rate Dictates Streamflow. |  | 10.1002/2016gl069690 | Geophysical Research Letters |
| 101 | exact | 2016 | Carbon, nitrogen, and water stable isotopes in plant tissue and soils across a moisture gr |  | 10.1002/hyp.11041 | Hydrological Processes |
| 102 | exact | 2016 | Effects of Hurricane-Felled Tree Trunks on Soil Carbon, Nitrogen, Microbial Biomass, and R |  | 10.3390/f7110264 | Forests |
| 103 | exact | 2016 | Physical, Chemical, and Biological Properties of Soil under Decaying Wood in a Tropical We |  | 10.3390/f7080168 | Forests |
| 104 | exact | 2016 | Hydrogeologic influence on changes in snowmelt runoff with climate warming: Numerical expe |  | 10.1016/j.jhydrol.2015.12.010 | Journal of Hydrology |
| 105 | exact | 2017 | Critical zone properties control the fate of nitrogen during experimental rainfall in mont |  | 10.1007/s10533-017-0299-8 | Biogeochemistry |
| 106 | exact | 2017 | Sources of streamflow along a headwater catchment elevational gradient |  | 10.1016/j.jhydrol.2017.03.044 | Journal of Hydrology |
| 107 | exact | 2018 | Fire, flood, and drought—Extreme climate events alter flow paths and stream chemistry |  | 10.1029/2017jg004349 | Journal of Geophysical Research: Biogeosciences |
| 108 | exact | 2018 | A global atlas of the dominant bacteria found in soil. |  | 10.1126/science.aap9516 | Science |
| 109 | exact | 2018 | Alpine catena response to nitrogen deposition and its effect on the aquatic system |  | 10.1016/j.catena.2018.06.004 | CATENA |
| 110 | exact | 2018 | Erosion and channel changes due to extreme flooding in the Fourmile Creek catchment, Color |  | 10.1016/j.geomorph.2017.03.030 | Geomorphology |
| 111 | exact | 2018 | State dependent jump processes: Ito–Stratonovich interpretations, potential, and transient |  | 10.1103/physreve.98.052132 | Physical Review E |
| 112 | exact | 2019 | Chemical reactions, porosity, and microfracturing in shale during weathering: the effect o |  | 10.1016/j.gca.2019.09.044 | Geochimica et Cosmochimica Acta |
| 113 | exact | 2019 | Modeling phenological controls on carbon dynamics in dryland sagebrush ecosystems |  | 10.1016/j.agrformet.2019.04.003 | Agricultural and Forest Meteorology |
| 114 | exact | 2019 | Harnessing emerging technologies to reduce Gulf hypoxia |  | 10.1038/s41893-019-0381-4 | Nature Sustainability |
| 115 | exact | 2019 | Inorganic nitrogen wet deposition gradients in the Denver-Boulder metropolitan area and Co |  | 10.1016/j.scitotenv.2019.06.528 | Science of The Total Environment |
| 116 | exact | 2019 | African dust deposition in Puerto Rico; analysis of a 20 year rainfall chemistry record an |  | 10.1016/j.atmosenv.2019.116907 | Atmospheric Environment |
| 117 | exact | 2019 | A correlative bimodal surface imaging method to assess hyphae-rock interactions |  | 10.1017/s1431927619012911 | Microscopy and Microanalysis |
| 118 | exact | 2020 | Atmospheric dust deposition varies by season and elevation in the Colorado Front Range, US |  | 10.1029/2019jf005436 | Journal of Geophysical Research: Earth Surface |
| 119 | exact | 2020 | Linear layout of multiple flow-direction networks for landscape-evolution simulations |  | 10.1016/j.envsoft.2020.104804 | Environmental Modelling & Software |
| 120 | link | 2012 | Water quality and landscape processes of four watersheds in eastern Puerto Rico |  | 10.3133/pp1789 | Professional Paper |
| 121 | link | 2019 | Smart Sensor Technology and Infrastructure Safety |  | 10.1007/978-3-030-27928-8_91 | Human Systems Engineering and Design II |
| 122 | openalex match | 1964 | Common trees of Puerto Rico and the Virgin Islands |  | 10.5962/bhl.title.4135 | U.S. Department of Agriculture, Forest Service |
| 123 | openalex match | 1995 | Tropical Forests: Management and Ecology |  | 10.1007/978-1-4612-2498-3 | Springer |
| 124 | openalex match | 2010 | Geomorphology: The Mechanics and Chemistry of Landscapes. |  | 10.1017/cbo9780511794827 | Cambridge University Press |
| 125 | openalex match | 2013 | Freezing and Thawing Processes. |  | 10.1016/b978-0-12-409548-9.05173-3 | Reference Module in Earth Systems and Environmental Sciences |
| 126 | openalex match | 2014 | Prediction of Saturated Hydraulic Conductivity Dynamics in an Iowan Agriculture Watershed |  | 10.5281/zenodo.1091149 | International Journal of Biological, Veterinary, Agricultural, and Food Engineering |
| 127 | openalex match | 2016 | Nitrogen Availability and Loss from Managed and Unmanaged Ecosystems. |  | 10.7301/z0fn14mr | Brown Digital Repository |
| 128 | openalex: authors, year and journal agree (title written differently) | 2005 | Contribution of dissolved organic carbon to stream metabolism estimated with 13C-enriched |  | 10.1899/0887-3593(2005)024<0048:codoct>2.0.co;2 | Journal of the North American Benthological Society |
| 129 | openalex: authors, year and journal agree (title written differently) | 2006 | Redox fluctuations in a humid tropical forest soil impact N-cycling rates by framing the c |  | 10.1007/s10533-006-9032-8 | Biogeochemistry |
| 130 | openalex: authors, year and journal agree (title written differently) | 2017 | Concentration-discharge relationships in headwater streams of the Sierra Nevada, Californi |  | 10.1002/2016wr019693 | Water Resources Research |

### C. Duplicates deleted: 11

The archive record is an earlier version (a draft, a meeting paper, a thesis) of a paper already on the list under its published title. The record already on the list stays.

| Deleted (year, title) | Kept (year, title) | DOI |
|---|---|---|
| 2016 Drainage from the critical zone: lithologic, aspect, and vegetation controls on | 2018 Drainage from the Critical Zone: Lithologic Controls on the Persistence and Spat | 10.1029/2017wr021903 |
| 2012 Punctuated incision of streams bounding the Colorado Front Range from measuremen | 2012 Unsteady late Pleistocene incision of streams bounding the Colorado Front Range | 10.1029/2011jf002232 |
| 2011 Occurrence of halloysite nanotubes and bacteria at the interface between saproli | 2010 Halloysite Nanotubes and Bacteria at the Saprolite–Bedrock Interface, Rio Icacos | 10.2136/sssaj2010.0126nps |
| 2009 Effects of Land-Use History on Soil Macro- and Trace Elements in the Southern Pi | 2010 Effects of land-use history on soil spatial heterogeneity of macro- and trace el | 10.1016/j.geoderma.2010.01.008 |
| 2014 The Effects of Climate and Landscape Position on Mineral Weathering and Soil Car | 2011 The effects of climate and landscape position on chemical denudation and mineral | 10.1016/j.apgeochem.2011.03.036 |
| 2011 The influence of snow cover duration on evaporation and soil respiration in mixe | 2014 Influence of snow cover duration on soil evaporation and respiration efflux in m | 10.1002/eco.1425 |
| 2013 Polymictic pool behavior in a montane meadow, Sierra Nevada, CA | 2016 Polymictic pool behaviour in a montane meadow, Sierra Nevada, CA | 10.1002/hyp.10834 |
| 2015 87Sr/86Sr, Ca/Sr, And Ge/Si Ratios As Tracers Of Solute Sources At A Temperate F | 2016 87Sr/86Sr, Ca/Sr, and Ge/Si ratios as tracers of solute sources and biogeochemic | 10.1016/j.chemgeo.2016.04.026 |
| 2017 A record of coupled hillslope and channel response to Pleistocene periglacial er | 2018 Record of coupled hillslope and channel response to Pleistocene erosion and depo | 10.1130/b31912.1 |
| 2016 FULLY-COUPLED HYDROLOGICAL AND MORPHOLOGICAL PROCESSES FOR MODELING LANDSCAPE EV | 2016 Fully-Coupled Hydrologic Processes for Modeling Landscape Evolution | 10.1016/j.envsoft.2016.04.014 |
| 2012 Controls and dynamics of canopy-derived dissolved organic matter from co-dominan | 2012 Controls & dynamics of canopy-derived dissolved organic matter from co-dominant |  |

### D. Kept with a page of their own: 103

No DOI, but a page for the work itself, mostly a thesis in a university repository. Found on the archive page (a link no other record carries) or by the OpenAlex search. The record's `url` moves to it. Checked on 16 November: "answered" means it answered a scripted request; pages at university repositories and ADS that refuse scripts are counted as live (Jordan, 16 November); the retired Forest Service addresses, a personal page and a login-only file were not counted.

| Year | Title | New address | Where (was) | Found by | Check |
|---|---|---|---|---|---|
| 2019 | The Multiscale Signature of Ecohydrological Fluctuations on Soil Biogeochemical Cycle | https://dataspace.princeton.edu/bitstream/88435/dsp016m311s21s/1/Calabrese_princeton_0181D_13175.pdf | DataSpace (Princeton University) (was: PhD dissertation, Princeton University) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2009 | Development of a Community Hydrologic Information System | https://digitalcommons.usu.edu/cee_facpub/2534 | Modelling and Simulation Society of Australia and New Zealand and International Association for Mathematics and Computers in Simulation (was: Modelling and Simulation Society of Australia and ) | OpenAlex (data-citation session) | answered |
| 2011 | Observations and Measurements - XML Implementation | https://docs.ogc.org/is/10-025r1/10-025r1/pdf | Open Geospatial Consortium (was: OGC Document 10-025r1) | archive page link | answered |
| 2011 | The Initial Design of Data Sharing Infrastructure for the Critical Zone Observatory | https://eim.ecoinformatics.org/eim2011/eim-proceedings-2011/at_download/file | Proceedings of the Environmental Information Management Conference 2011 (was: Proceedings of the Environmental Information Manag) | archive page link | answered |
| 2012 | A cyber-infrastructure for the measurement and estimation of large-scale hydrologic p | https://escholarship.org/uc/item/1f83k6nf | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | The Ecology of Benthic Toxigenic Anabaena and Phormidium (Cyanobacteria) in the Eel R | https://escholarship.org/uc/item/1z3313kj | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2016 | Evaporation and groundwater patterns in montane meadows of the Sierra Nevada, CA. | https://escholarship.org/uc/item/4gd3g2hg | eScholarship (University of California) (was: University of California, Merced) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Dynamics of Redox Reactions Structure Decomposition and Greenhouse Gas Fluxes in Humi | https://escholarship.org/uc/item/5vq4c372 | eScholarship (University of California) (was: University of California - Berkeley) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2018 | Evolutionary Ecology of Partial Migration: A Case Study from a Pacific Salmonid Fish, | https://escholarship.org/uc/item/63b9r39q | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2020 | Food, Phenology, and Flow—How Prey Phenology and Streamflow Dynamics Affect the Behav | https://escholarship.org/uc/item/7640c4sw | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2014 | Climate controls on ecosystem production, biomass, and water cycling | https://escholarship.org/uc/item/7wr2v9vk | eScholarship (University of California) (was: Climate controls on ecosystem production, biomass,) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2014 | Origin of eroded soil organic matter in low-order catchments of the southern Sierra N | https://escholarship.org/uc/item/82q3917b | eScholarship (University of California) (was: University of California, Merced) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2016 | Spatial and temporal linkage of stream-riparian food webs by seasonal migration of ma | https://escholarship.org/uc/item/9645x8q3 | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2012 | Estimating the spatial and temporal distribution of snow in mountainous terrain | https://escholarship.org/uc/item/9bp1f6z7 | eScholarship (University of California) (was: University of California) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2019 | Critical Zone Ecohydrology of the Northern California Coast Ranges | https://escholarship.org/uc/item/9g8492jx | eScholarship (University of California) (was: University of California, Berkeley) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Snow distribution over an elevation gradient and forest snow hydrology of the Souther | https://escholarship.org/uc/item/9zn1c1mk | eScholarship (University of California) (was: UC Merced PhD Dissertation) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2010 | Implementing the Shale Hills Watershed Model in Application of PIHM, | https://etda.libraries.psu.edu/catalog/10373 | Penn State Electronic Theses and Dissertations (was: Master of Science, Civil Engineering, The Pennslyv) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2009 | Static and Dynamic Controls of Soil Moisture Variability in the Shale Hills Catchment | https://etda.libraries.psu.edu/catalog/10402 | Penn State Electronic Theses and Dissertations (was: Master of Science, Soil Science, The Pennsylvania ) | OpenAlex (data-citation session) | answered |
| 2010 | Tree species distribution in relation to stem hydraulic traits and soil moisture in a | https://etda.libraries.psu.edu/catalog/10712 | Penn State Electronic Theses and Dissertations (was: Master of Science, Horticulture, The Pennsylvania ) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2011 | Coupling Dissolved Organic Carbon and Hydropedology in the Shale Hills Critical Zone | https://etda.libraries.psu.edu/catalog/11350 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Soil Science, The Pennsylvan) | OpenAlex (data-citation session) | answered |
| 2010 | Laboratory, Field, and Modeling Analysis of Solute Transport Behavior at the Shale Hi | https://etda.libraries.psu.edu/catalog/11576 | Penn State Electronic Theses and Dissertations (was: Master of Science, Geosciences, The Pennsylvania S) | OpenAlex (data-citation session) | answered |
| 2011 | Usings δ2H AND δ18O To Determine The Flowpaths and Timescales of Water at the Susqueh | https://etda.libraries.psu.edu/catalog/11904 | Penn State Electronic Theses and Dissertations (was: Master of Science, Civil Engineering, The Pennsylv) | OpenAlex (data-citation session) | answered |
| 2011 | Integrated Approach to Identifying Subsurface Flow in a Forest Catchment | https://etda.libraries.psu.edu/catalog/12113 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Soil Science, The Pennsylvan) | OpenAlex (data-citation session) | answered |
| 2011 | Catchment-Scale Soil Water Retention Characteristics and Delineation of Hydropedologi | https://etda.libraries.psu.edu/catalog/12365 | Penn State Electronic Theses and Dissertations (was: Master of Science, Soil Science, The Pennsylvania ) | OpenAlex (data-citation session) | answered |
| 2011 | MULTI-SCALE LIDAR-BASED APPROACHES TO CHARACTERIZING STREAM NETWORKS, SURFACE ROUGHNE | https://etda.libraries.psu.edu/catalog/12424 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Forest Resources, The Pennsy) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2016 | VARIATION IN SOIL NITROGEN RETENTION ACROSS LAND USES, LANDSCAPES, AND LANDFORMS IN C | https://etda.libraries.psu.edu/catalog/13210jnw142 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Soil Science and Biogeochemi) | OpenAlex (data-citation session) | answered |
| 2016 | TOPOGRAPHIC CONTROLS ON ROOT PARTITIONING PATTERNS IN A TEMPERATE FOREST | https://etda.libraries.psu.edu/catalog/13549aso124 | Penn State Electronic Theses and Dissertations (was: Master of Science, Ecology, The Pennsylvania State) | OpenAlex (data-citation session) | answered |
| 2012 | Development of a land surface hydrologic modeling and data assimilation system for th | https://etda.libraries.psu.edu/catalog/15355 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Meteorology, The Pennsylvani) | OpenAlex (data-citation session) | answered |
| 2018 | SURFACE WATER-SEDIMENT INTERACTIONS: EXAMPLES FROM PRISTINE AND CONTAMINATED CATCHMEN | https://etda.libraries.psu.edu/catalog/15944neh137 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Geosciences and Biogeochemis) | OpenAlex (data-citation session) | answered |
| 2012 | Biogeochemistry of manganese contamination in a temperate forested watershed | https://etda.libraries.psu.edu/catalog/16048 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Geosciences and Biogeochemis) | OpenAlex (data-citation session) | answered |
| 2018 | UNDERSTANDING THE EFFECTS OF HYDROLOGIC CONNECTIVITY, LAND USE, AND LITHOLOGY ON WATE | https://etda.libraries.psu.edu/catalog/16062crw5269 | Penn State Electronic Theses and Dissertations (was: Master of Science, Geosciences, The Pennsylvania S) | OpenAlex (data-citation session) | answered |
| 2013 | Spatial and Temporal Patterns of Water Stable Isotope Compositions at the Susquehanna | https://etda.libraries.psu.edu/catalog/18718 | Penn State Electronic Theses and Dissertations (was: Master of Science, Civil Engineering, The Pennsylv) | OpenAlex (data-citation session) | answered |
| 2013 | Exploring a 60-year record of manganese deposition in Marietta Ohio using soil chemis | https://etda.libraries.psu.edu/catalog/19069 | Penn State Electronic Theses and Dissertations (was: Master of Science, Geosciences, The Pennsylvania S) | OpenAlex (data-citation session) | answered |
| 2014 | SPATIAL AND TEMPORAL EVOLUTION OF THE NOCTURNAL SURFACE LAYER IN A SMALL, STEEP WATER | https://etda.libraries.psu.edu/catalog/21292 | Penn State Electronic Theses and Dissertations (was: Master of Science, Meteorology, The Pennsylvania S) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2014 | CHEMICAL AND PHYSICAL WEATHERING IN REGOLITH: AN INVESTIGATION OF THREE DIFFERENT FE- | https://etda.libraries.psu.edu/catalog/21557 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Geosciences, The Pennsylvani) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2014 | MODELING, PARAMETER OPTIMIZATION, AND ECOHYDROLOGIC ASSESSMENT OF WATERSHED SYSTEMS | https://etda.libraries.psu.edu/catalog/22128 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Civil and Environmental Engi) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2014 | The anatomy of weathering profiles on different lithologies in the tropical forest of | https://etda.libraries.psu.edu/catalog/22669 | Penn State Electronic Theses and Dissertations (was: M.S. Thesis. The Pennsylvania State University) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2015 | FOREST ECOHYDROLOGY IN A CENTRAL PENNSYLVANIA CATCHMENT: A STABLE ISOTOPE APPROACH | https://etda.libraries.psu.edu/catalog/24851 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Ecology, The Pennsylvania St) | OpenAlex (data-citation session) | answered |
| 2016 | UNDERSTANDING HYDROLOGICAL AND GEOCHEMICAL CONTROLS ON SOLUTE CONCENTRATIONS AT LARGE | https://etda.libraries.psu.edu/catalog/28679 | Penn State Electronic Theses and Dissertations (was: Doctor of Philosophy, Petroleum and Natural Gas En) | OpenAlex (data-citation session) | answered |
| 2008 | Cyberinfrastructure for Environmental Observation Networks (CEON) Workshop Report | https://feon.wdfiles.com/local--files/start/Feb2008WorkshopFinalReport.pdf | CEON Workshop report (2008) (was: Cyberinfrastructure for Environmental Observation ) | archive page link | answered |
| 2012 | Hillslope Scale Hydrologic Spatial Patterns in a Patchy Ponderosa Pine Landscape: Ins | https://gradworks.umi.com/35/05/3505694.html | ProQuest GradWorks (was: PhD Thesis in Geological Sciences, Arizona State U) | archive page link | answered |
| 2011 | Aqueous phase tracers of chemical weathering in a semi-arid critical zone. | https://hdl.handle.net/10150/144594 | University of Arizona Repository (was: MS Thesis in Hydrology and Water Resources. Univer) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2012 | Quantifying the role of hydrologic variability in soil carbon flux | https://hdl.handle.net/10150/238914 | University of Arizona Repository (was: MS Thesis in Hydrology and Water Resources. Univer) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | On the Variability of Hydrologic Catchment Response: Inherent and External Controls | https://hdl.handle.net/10150/268575 | University of Arizona Repository (was: Disertation in Hydrology and Water Resources. Univ) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2013 | Quantifying catchment scale soil variability in Marshall Gulch, Santa Catalina Mounta | https://hdl.handle.net/10150/294023 | University of Arizona Repository (was: MS Thesis in Soil, Water & Environmental Science. ) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Quantifying Catchment-Scale Particulate Organic Matter (POM) Loss Following Fire, Rel | https://hdl.handle.net/10150/301557 | University of Arizona Repository (was: MS Thesis in Hydrology. University of Arizona, Tuc) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Coupled Transport, Fractionation and Stabilization of Dissolved Organic Matter and Ra | https://hdl.handle.net/10150/301696 | University of Arizona Repository (was: Disertation in Soil, Water & Environmental Science) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2013 | Characterizing U-series Isotope Signatures in Soils and Headwater Streams in a Comple | https://hdl.handle.net/10150/305863 | University of Arizona Repository (was: MS Thesis in Hydrology. University of Arizona, Tuc) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Improving Distributed Hydrologic Modeling and Global Land Cover Data | https://hdl.handle.net/10150/307009 | University of Arizona Repository (was: Disertation in Hydrology and Water Resources. Univ) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2013 | Cordilleran Forest Scaling Dynamics And Disturbance Regimes Quantified By Aerial LiDA | https://hdl.handle.net/10150/311231 | University of Arizona Repository (was: Disertation in Natural Resources and the Environme) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2014 | The frequency and magnitude of flood discharges and post-wildfire erosion in the sout | https://hdl.handle.net/10150/333119 | University of Arizona Repository (was: Disertation in Geosiences. University of Arizona, ) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2015 | The Influence of Climate and Landscape on Hydrological Processes, Vegetation Dynamics | https://hdl.handle.net/10150/555944 | University of Arizona Repository (was: Disertation in Hydrology. University of Arizona, T) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2015 | Examining the Impacts of Wildfire on Throughfall and Stemflow Chemistry and Flux at P | https://hdl.handle.net/10150/595818 | University of Arizona Repository (was: MS Thesis in Hydrology. University of Arizona, Tuc) | OpenAlex (data-citation session) | answered |
| 2016 | Interactions of Wildfire, Landscape Position, and Soil Depth in Structuring Post-Fire | https://hdl.handle.net/10150/621017 | University of Arizona Repository (was: MS Thesis, Soil, Water & Environmental Science, Un) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | Evaluation of passive capillary wick samplers for measuring deep infiltration in the | https://hdl.handle.net/10150/626383 | University of Arizona Repository (was: MS Thesis, Hydrology and Atmospheric Sciences, Uni) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | Quantifying biomass from point clouds by connecting representations of ecosystem stru | https://hdl.handle.net/10150/627688 | University of Arizona Repository (was: MS Thesis, Natural Resources, University of Arizon) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2018 | Understanding Quaternary Soil Formation Using a Synthesis of Soil Chronosequences | https://hdl.handle.net/10150/628004 | University of Arizona Repository (was: Disertation in Soil, Water & Environmental Science) | OpenAlex (data-citation session) | answered |
| 2018 | Patterns of Primary Productivity in a Semiarid Montane Forest | https://hdl.handle.net/10150/630129 | University of Arizona Repository (was: MS Thesis, Geography, University of Arizona, Tucso) | OpenAlex (data-citation session) | answered |
| 2016 | A Mean Field Approach to Watershed Hydrology | https://hdl.handle.net/10161/13370 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2017 | Understanding the Role of Model Structure and Watershed Properties on Streamflow Resp | https://hdl.handle.net/10161/16265 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2018 | Macro to Micro Legacies of Landuse at the Calhoun Critical Zone Observatory | https://hdl.handle.net/10161/16894 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2018 | Analysis and Modeling of Landscape Topography: Statistical Description and Evolution | https://hdl.handle.net/10161/17495 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2019 | Impacts of Climate Variation and Change on Hydrologic and Vegetation Dynamics | https://hdl.handle.net/10161/18714 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University) | OpenAlex (data-citation session) | answered |
| 2020 | Hydrologic Functioning of Low-Relief, Deep Soil Watersheds and Hydrologic Legacies of | https://hdl.handle.net/10161/20983 | DukeSpace (Duke University) (was: PhD Dissertation, Nicholas School of the Environme) | archive page link | answered |
| 2020 | Ansichten der Calzone: Views of the Calhoun Critical Zone Observatory | https://hdl.handle.net/10161/21401 | DukeSpace (Duke University) (was: In: Critical Zones: The Science and Politics of La) | OpenAlex (data-citation session) | answered |
| 2020 | Land-use legacy dynamics in decades- and centuries-old soils | https://hdl.handle.net/10161/21472 | DukeSpace (Duke University) (was: PhD Dissertation, Nicholas School of the Environme) | archive page link | answered |
| 2011 | An Ecosystem Approach to Dead Plant Carbon over 50 years of Old-Field Forest Developm | https://hdl.handle.net/10161/4992 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2014 | Pedogenesis and Anthropedogenesis on the Southern Piedmont | https://hdl.handle.net/10161/8727 | DukeSpace (Duke University) (was: PhD Dissertation, Duke University, Durham, North C) | archive page link | answered |
| 2012 | Nutrient Hot Spots in a Sierra Nevada Soil: Physical Assessments and Contributing Fac | https://hdl.handle.net/11714/3698 | ScholarWolf (University of Nevada, Reno) (was: University of Nevada, Reno.) | OpenAlex (data-citation session) | answered |
| 2017 | Temperature responses of microbial soil organic matter decomposition and associated r | https://hdl.handle.net/1808/26940 | KU ScholarWorks (University of Kansas) (was: PhD Dissertation, University of Kansas) | OpenAlex (data-citation session) | answered |
| 2008 | Transport, sources, and quality of seston in a piedmont headwater stream | https://hdl.handle.net/1903/8455 | DRUM (University of Maryland) (was: Ph.D. dissertation. University of Maryland) | OpenAlex (data-citation session) | answered |
| 2019 | Linkages between fluid flow paths, reactive gases, and chemical weathering across a s | https://hdl.handle.net/2142/105930 | IDEALS (University of Illinois) (was: University of Illinois at Urbana-Champaign) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2011 | Upper Sangamon River watershed monitoring data for the USEPA targeted watershed study | https://hdl.handle.net/2142/39554 | IDEALS (University of Illinois) (was: Illinois State Water Survey, Contract Report 2011-) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2010 | Hydrologic and nutrient monitoring of the Lake Decatur Watershed: Final Report 1993–2 | https://hdl.handle.net/2142/99787 | IDEALS (University of Illinois) (was: Illinois State Water Survey, Contract Report in Re) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | Influence of Linked Hydrologic and Geomorphic Processes on the Terrestrial Carbon Cyc | https://repository.gatech.edu/entities/publication/6f51d104-f112-47fb-ac35-dc4469d8e326 | Georgia Tech Repository (was: Doctoral dissertation, School of Civil and Environ) | archive page link | answered |
| 2017 | A modeling study of land surface processes and surface energy budgets using the maxim | https://repository.gatech.edu/entities/publication/98cd37d9-4334-4137-89b6-3856c379d3b1 | Georgia Tech Repository (was: PhD Dissertation, Civil Engineering, Georgia Insti) | archive page link | answered |
| 2008 | Spatial and temporal variation in streambed bacterial community composition and corre | https://repository.upenn.edu/dissertations/AAI3346130 | University of Pennsylvania Repository (was: Ph.D. dissertation. University of Pennsylvania, Ph) | OpenAlex (data-citation session) | answered |
| 2012 | The Impact of Terrestrial Dissolved Organic Carbon on Stream Ecosystems Through an In | https://repository.upenn.edu/dissertations/AAI3542927 | University of Pennsylvania Repository (was: A Dissertation in Biology Presented to the Faculti) | OpenAlex (data-citation session) | answered |
| 2014 | Soil microbial communities and soil organic matter: composition and ecological functi | https://repository.upenn.edu/edissertations/1459 | University of Pennsylvania Repository (was: University of Pennsylvania) | OpenAlex (data-citation session) | answered |
| 2014 | The Causes and Consequences of Particle Size Change in Fluvial Systems | https://repository.upenn.edu/handle/20.500.14332/28175 | University of Pennsylvania Repository (was: University of Pennsylvania) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2012 | Testing the Soil Carbon Saturation Theory: Maximal Carbon Stabilization at Soil Organ | https://repository.upenn.edu/items/bc420b74-a859-479d-b7b3-c14737534566 | University of Pennsylvania Repository (was: A Dissertation in Earth and Environmental Science,) | archive page link | answered |
| 2013 | A spectroscopic investigation of the chemistry of organic matter during biogeochemica | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/1n79h4320 | CU Scholar (University of Colorado Boulder) (was: PhD dissertation, Environmental Studies, Universit) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2014 | The torrential and the mundane: Climate controls on hillslope weathering, channel bed | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/37720c82b | CU Scholar (University of Colorado Boulder) (was: Ph.D. dissertation, Dept. of Geological Sciences, ) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2012 | Subsurface Evolution: Characterizing the physical and geochemical changes in weathere | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/bc386j53w | CU Scholar (University of Colorado Boulder) (was: Thesis submitted to the Faculty of the Graduate Sc) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2010 | Climatological and elevational controls on organic and inorganic nutrients in stream | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/cf95jb79w | CU Scholar (University of Colorado Boulder) (was: Thesis, University of Colorado, Master of Arts, De) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2014 | Hillslope Dissolved Organic Matter Transport and Transformation in a Semi-Arid Headwa | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/d791sg501 | CU Scholar (University of Colorado Boulder) (was: MA thesis, Dept. of Geography, University of Color) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2015 | Advances in reactive transport modeling of geochemical systems: Applications to acid | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/ft848q90c | CU Scholar (University of Colorado Boulder) (was: Pd.D. dissertation, Dept. of Civil and Environment) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2018 | The response of streamflow and evapotranspiration to changes in snowmelt across the w | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/fx719m526 | CU Scholar (University of Colorado Boulder) (was: Ph.D. dissertation, Dept. of Geography, University) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | Understanding the geomorphic imprint of the Northern Pocket Gopher on the subalpine z | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/jd472w54s | CU Scholar (University of Colorado Boulder) (was: Ph.D. dissertation, Dept. of Geological Sciences, ) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2010 | The Hydrology of Headwater Catchments from the Plains to the Continental Divide, Boul | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/qb98mf759 | CU Scholar (University of Colorado Boulder) (was: Thesis, University of Colorado, Master of Arts Dep) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2011 | Removal of benthic algae in swift-flowing streams: the significance of spatial and te | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/r494vk42v | CU Scholar (University of Colorado Boulder) (was: A thesis submitted to the Faculty of the Graduate ) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2011 | Landscape-Scale Variation in Soil Microbial Communities Across a Forested Watershed. | https://scholar.colorado.edu/concern/graduate_thesis_or_dissertations/sx61dm626 | CU Scholar (University of Colorado Boulder) (was: Thesis, University of Colorado, Master of Arts, De) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2017 | Short-Term Wildfire Impacts in a Rocky Mountain Catchment: Searching for Evidence of | https://scholar.colorado.edu/concern/parent/br86b396p/file_sets/k643b162r | CU Scholar (University of Colorado Boulder) (was: Senior honors thesis, Environmental Studies, Unive) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2018 | Solifluction Lobes on Niwot Ridge: Using Drones, Time-lapse Cameras, and Weather Data | https://scholar.colorado.edu/honr_theses/1707 | CU Scholar (University of Colorado Boulder) (was: Senior honors thesis, Physical Geography, Universi) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 2013 | The Use of Water Sensors to Examine Water Chemistry Related to Marcellus Shale Natura | https://scholarsphere.psu.edu/resources/6fc17c8e-185f-4d11-88f2-d2b2f4a39b33/downloads/5322 | ScholarSphere (Penn State) (was: Bachelor of Science, Pennsylvania State University) | OpenAlex (data-citation session) | answered |
| 2018 | The effect of cultivation on soil chemistry in the Shale Hills Critical Zone Observat | https://scholarsphere.psu.edu/resources/e53152b3-a3ba-4427-90b7-173b07a26bfb | ScholarSphere (Penn State) (was: Bachelor of Science, Geosciences, The Pennsylvania) | OpenAlex (data-citation session) | answered |
| 2016 | Temperature impacts on soil organic carbon decomposition across and environmental gra | https://scholarworks.boisestate.edu/td/1162 | ScholarWorks (Boise State University) (was: Boise State University) | OpenAlex (data-citation session) | answered |
| 2009 | Soil quality in Clear Creek, IA: SOM loss and soil quality in the Clear Creek, IA, Ex | https://scholarworks.uni.edu/jias/vol116/iss1/5 | Journal of the Iowa Academy of Science (was: Journal of the Iowa Academy of Science 116(1–4):14) | OpenAlex (data-citation session) | answered |
| 2017 | DETECTING LANDSCAPE RESPONSE TO PERTURBATIONS BY CLIMATE AND BASE LEVEL IN CENTRAL PE | https://scholarworks.uvm.edu/graddis/723 | ScholarWorks (University of Vermont) (was: Master of Science, Geology, The University of Verm) | OpenAlex (data-citation session) | answered |
| 2006 | A sediment composite fingerprinting tool: A field-based quantification method of the | https://ui.adsabs.harvard.edu/abs/2006AGUFM.H21F1425P/abstract | NASA ADS (AGU Fall Meeting abstract) (was: Iowa Department of Natural Resources) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2007 | Spatial modeling of coupled hydrologic-biogeochemical processes for the Southern Sier | https://ui.adsabs.harvard.edu/abs/2007AGUFM.H53A0957T/abstract | NASA ADS (AGU Fall Meeting abstract) (was: Research Gate) | OpenAlex (data-citation session) | refused a script; counted live (university repository or ADS, Jordan 16 Nov) |
| 2012 | Controls & dynamics of canopy-derived dissolved organic matter from co-dominant broad | https://works.bepress.com/john_vanstan/8/ | SelectedWorks (bepress) (was: Ph.D. Dissertation, University of Delaware) | OpenAlex (data-citation session) | not requested; university repository page counted live (Jordan, 16 Nov) |
| 1993 | Effects of streamside vegetation on macroinvertebrate communities of White Clay Creek | https://www.jstor.org/stable/4065013 | Proceedings of the Academy of Natural Sciences of Philadelphia (was: Proceedings of The Academy of Natural Sciences of ) | OpenAlex (data-citation session) | answered |

### E. For you to decide: 0

The six asked about were decided by Jordan on 16 November ("make those calls"): each became the published paper. They are in B, where the Match column begins "E,".

### F. Deleted, nothing lasting to point to: 248

No DOI or page for the work was found: not in Crossref or OpenAlex by title (searched twice, the second time by the data-citation session with title, first author and year), and the archive page links no live page for it. By kind (a keyword match on the citation text, approximate):

| Kind | Records |
|---|---|
| report | 101 |
| journal citation or other | 68 |
| thesis | 58 |
| book or chapter | 14 |
| meeting abstract or proceedings | 6 |
| submitted or in review | 1 |

All of them (a note says why when a candidate was rejected):

| # | Kind | Year | Title | Citation text on the list | Site | Note |
|---|---|---|---|---|---|---|
| 1 | book or chapter | 1969 | Quaternary landscapes in Iowa | Iowa State University Press, Ames, Iowa | iml | OpenAlex page is a library catalogue record, not the work |
| 2 | book or chapter | 1993 | Sources and biogeochemistry of terrestrial dissolved organic carbon entering streams | pp. 139 - 165 in T. E. Ford, ed. Aquatic microbiology: an ecological a | christina |  |
| 3 | book or chapter | 1996 | The Food Web of a Tropical Rain Forest | University of Chicago Press, Chicago, Illinois | luquillo | OpenAlex match is a review of the book in an ornithology journal (first author Smith) |
| 4 | book or chapter | 2001 | Understanding Soil Change: Soil Sustainability over Millennia, Centuries, and Decades | Cambridge University Press, New York, 255 p | calhoun | OpenAlex match is a 2003 Restoration Ecology review of the book |
| 5 | book or chapter | 2012 | The Agricultural BMP Handbook for Minnesota | Minnesota Department of Agricultural | iml |  |
| 6 | book or chapter | 2012 | Effects of flow regimes on stream turbidity and suspended solids after wildfire, Colorado | IAHS Publ. 354. IAHS Press. Wallingford, UK | boulder |  |
| 7 | book or chapter | 2012 | Effects of wildfire on source-water quality and aquatic ecosystems, Colorado Front Range. | IAHS Publ. 354. IAHS Press. Wallingford, UK | boulder |  |
| 8 | book or chapter | 2012 | A Caribbean Forestry Tapestry | Oxford University Press ISBN 978-0-19-533469-2 | luquillo |  |
| 9 | book or chapter | 2016 | California’s River Ecosystems | In H. Mooney & E. Zavaleta (Eds.), Ecosystems of California (p. 1008). | eel |  |
| 10 | book or chapter | 2017 | Chapter 65: Channel Erosion and Sediment Transport. | Handbook of Applied Hydrology, Second Edition | iml |  |
| 11 | book or chapter | 2017 | Fundamentals of Soil Ecology, 3rd Edition | Academic Press, London, 369 pp. | calhoun |  |
| 12 | book or chapter | 2018 | Interdisciplinary Teaching about Earth and the Environment for a Sustainable Future. Book | Springer Cross-CZO | catalina-jemez, luquillo, national, shale-hills, sierra |  |
| 13 | book or chapter | 2019 | Chapter 9: The Role of Management and Landscape on Aggregate Characteristics with the Soil | Tools for Soil Management and Restoration: Strategies, Practices, and | iml |  |
| 14 | book or chapter | 2020 | Working across scales to project soil biogeochemical responses to climate | In: Yang, Y., Keiluweit, M., Senesi, N., Xing, B., eds. Multi-Scale Bi | calhoun |  |
| 15 | journal citation or other | 1970 | A Tropical Rain Forest: A Study Of Irradiation and Ecology at El Verde, Puerto Rico | National Technical Information Service, Springfield, Virginia | luquillo | OpenAlex match is a Journal of Ecology review of the book (first author Ashton) |
| 16 | journal citation or other | 1996 | GIS prediction of rainfall and runoff volumes in eastern Puerto Rico | American Water Resources Association | luquillo |  |
| 17 | journal citation or other | 2000 | Paired comparisons of effects of type of riparian vegetation on stream fishes: implication | American Water Resources Association 197-202 | christina |  |
| 18 | journal citation or other | 2003 | Where rivers are born: The scientific imperative for defending small streams and wetlands | Sierra Club and American Rivers | christina |  |
| 19 | journal citation or other | 2007 | The Critical Zone: Where Rock Meets Life | Elements, v 3. n. 5 | shale-hills |  |
| 20 | journal citation or other | 2008 | Protecting Headwaters: The scientific basis for safeguarding stream and river ecosystems | Stroud Water Research Center | christina |  |
| 21 | journal citation or other | 2009 | Approaches to Modeling Weathered Regolith in Thermodynamics and Kinetics of Water-Rock Int | Reviews in Mineralogy and Geochemistry, v. 70, p. 435-484. | shale-hills |  |
| 22 | journal citation or other | 2010 | Future Directions for Critical Zone Observatory (CZO) Science | CZO Community, December 29, 2010 Cross-CZO | boulder, catalina-jemez, christina, luquillo, national, shale-hills, sierra |  |
| 23 | journal citation or other | 2010 | Hydrologic Control of the Nuisance Diatom, Didymosphenia germinata. | Colorado Water 2 (3) 4-6 | boulder |  |
| 24 | journal citation or other | 2010 | Mountain Permafrost - a valid archive to study climate change? Examples from the Rocky Mou | Nova acta Leopoldina, v. 112: 281-289.k | boulder |  |
| 25 | journal citation or other | 2011 | Shear resistance of the nuisance diatom Didymosphenia geminate | Colorado Water 28(2): 5-8. | boulder |  |
| 26 | journal citation or other | 2011 | Mineralogy of Soils Overlying the Two Main Geologic Provinces of the El Yunque National Fo | University of Pennsylvania | luquillo |  |
| 27 | journal citation or other | 2011 | CZO Display File Specification | CZO Central Data Management Project | national |  |
| 28 | journal citation or other | 2012 | Common Critical Zone Observatory Infrastructure and Measurements | A Guide Prepared By CZO PIs, September 27, 2012 Cross-CZO | boulder, catalina-jemez, christina, luquillo, national, shale-hills, sierra |  |
| 29 | journal citation or other | 2012 | Climatic and biotic controls on silt production and accumulation of loess | Nature Education Knowledge | iml |  |
| 30 | journal citation or other | 2012 | Caribbean Water Science Center Bibliographic Reference | USGS | luquillo |  |
| 31 | journal citation or other | 2012 | Luquillo Experimental Forest: Research History and Opportunities | Washington, DC: U.S. Department of Agriculture. | luquillo |  |
| 32 | journal citation or other | 2012 | Luquillo Experimental Forest: Research History and Opportunities. Experimental Forests and | USDA Forest Service | luquillo |  |
| 33 | journal citation or other | 2012 | Critical Zone Observatory: Snowline Processes in the Southern Sierra Nevada | Mountain Research Initiative Newsletter no. 7, November 2012 | sierra |  |
| 34 | journal citation or other | 2012 | Data Infrastructure for the Critical Zone Observatories CZOData: an EarthCube Design Proto | EarthCube white paper | national |  |
| 35 | journal citation or other | 2013 | Graduate Research Group White Paper: Cross-CZO Research Potential | Internal CZO publication Cross-CZO | boulder, catalina-jemez, christina, luquillo, national, shale-hills, sierra |  |
| 36 | journal citation or other | 2013 | Sustaining Earth's Critical Zone - Basic Science and Interdisciplinary Solutions for Globa | The University of Sheffield, United Kingdom, ISBN: 978-0-9576890-0-8 C | boulder, catalina-jemez, christina, luquillo, national, shale-hills, sierra |  |
| 37 | journal citation or other | 2013 | Ecological Gradient Analyses in a Tropical Landscape: Ecological Bulletins 54 | Wiley | luquillo |  |
| 38 | journal citation or other | 2013 | AGI LiDAR Handout | AGI 2013 handout | national |  |
| 39 | journal citation or other | 2013 | Discoveries in the Critical Zone: Where Life meets Rock | National Science Foundation Discovery Articles | national |  |
| 40 | journal citation or other | 2013 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 | shale-hills |  |
| 41 | journal citation or other | 2014 | Common questions of the US NSF–supported Critical Zone Observatories | A Guide Prepared By CZO PIs Cross-CZO | boulder, calhoun, catalina-jemez, eel, iml, luquillo, national, reynolds, shale-hills, sierra |  |
| 42 | journal citation or other | 2014 | Quantitative understating of daily streamflow peak timing and its seasonal variations in a | Water Resources Research | reynolds |  |
| 43 | journal citation or other | 2014 | Forest Assessment Plan El Yunque National Forest | USDA Forest Service | luquillo |  |
| 44 | journal citation or other | 2014 | The Control of Grain-Scale Mechanincs on Channel Form Landscape Dynamics, and Climatic Per | Earth and Environmental Science, University of Pennsylvania | luquillo |  |
| 45 | journal citation or other | 2014 | Rates and Mechanisms of Shale Weathering Across a Latitudinal Climosequence | Doctor of Philosophy, Geosciences, Pennsylvania State University, p 32 | shale-hills |  |
| 46 | journal citation or other | 2014 | Summary Results for Shale Hills Critical Zone Unit, Spring/Summer 2012 Benthic Macroinvert | Internal SSHCZO publication | shale-hills |  |
| 47 | journal citation or other | 2014 | Topographic Fingerprints of Hillslope Erosion in the Central Appalachians Revealed by Mete | Doctor of Philosophy, Geosciences, Pennsylvania State University, p. 1 | shale-hills |  |
| 48 | journal citation or other | 2015 | Common Critical Zone Observatory (CZO) Infrastructure and Measurements | A Guide Prepared By CZO PIs, May 05, 2015 Cross-CZO | boulder, calhoun, catalina-jemez, christina, eel, iml, luquillo, national, reynolds, shale-hills, sierra |  |
| 49 | journal citation or other | 2015 | Nutrient spiraling and transport in streams -- The importance of instream biological proce | In Jones, J.W., and Stanley, E. H., editors. Streams Ecosystems in a C | christina |  |
| 50 | journal citation or other | 2015 | Run-of-river impoundments pass bed material and establish equilibrium bed morphology while | Geomorphology | christina |  |
| 51 | journal citation or other | 2015 | Climate and landscape as drivers of carbon storage in forested headwater catchments: Insig | Global Change Biology | reynolds |  |
| 52 | journal citation or other | 2015 | Ecohydrologic Dynamics and Social Impacts of Western Juniper in Snow-Dominated Sagebrush S | University of Idaho | reynolds |  |
| 53 | journal citation or other | 2015 | The Sensitivity of Mountain Snowpack to Warming. | Idaho State University | reynolds |  |
| 54 | journal citation or other | 2015 | Variable Groundwater Contributions Influence Nutrient Cycling in Montane Headwater Catchme | Water Resources Research | reynolds |  |
| 55 | journal citation or other | 2015 | Force of nature: A monumental flood gives CU-Boulder researchers a rare opportunity to stu | Research and creative work 2014–15, PG.3-5 | boulder |  |
| 56 | journal citation or other | 2015 | Creating deep soil core monoliths: Beyond the solum | Southeastern Geology 51(2): 85-96 | calhoun |  |
| 57 | journal citation or other | 2016 | Climatic and Grazing Controls on Nitrogen Fixation by Biological Soil Crusts Utilizing a C | Idaho State University | reynolds |  |
| 58 | journal citation or other | 2016 | Influences of Climate Change on Water Availability in Complex Terrain: Understanding Earth | University of Idaho | reynolds |  |
| 59 | journal citation or other | 2016 | Saprolite genesis in complex terrain: hydrologic, lithologic, biologic, and microclimatic | Geomorphology | reynolds |  |
| 60 | journal citation or other | 2016 | Topographic Controls on Total Mobile Regolith and Total Soil Organic Carbon in Complex Ter | Idaho State University | reynolds | OpenAlex's page is an AGU abstract on a related topic, not this thesis (third review) |
| 61 | journal citation or other | 2016 | Understanding the rain-to-snow transition zone: modeling snowmelt and the spatial distribu | Idaho State University | reynolds |  |
| 62 | journal citation or other | 2016 | Building a Collaborative Network to Understand Regional Forest Dynamics and Advance Forest | Caribbean Naturalist | luquillo |  |
| 63 | journal citation or other | 2016 | Drought in the Critical Zone: Engaging Students in Authentic Inquiry Through Data Jam | The Earth Scientist XXXII, no. 3 (Fall 2016): 19–21 Cross-CZO | luquillo, national |  |
| 64 | journal citation or other | 2016 | Introduction: Caribbean Forest Dynamics and Regional Forestry Initiatives | Caribbean Naturalist | luquillo |  |
| 65 | journal citation or other | 2016 | Monarchs and the Critical Zone: A new spin on the study of butterflies | The Earth Scientist XXXII, no. 3 (Fall 2016): 4–6 Cross-CZO | luquillo, national |  |
| 66 | journal citation or other | 2016 | Special issue of The Earth Scientist about the Critical Zone and the US NSF Critical Zone | The Earth Scientist, Volume XXXII, Issue 3, Fall 2016 Cross-CZO | calhoun, luquillo, national, sierra |  |
| 67 | journal citation or other | 2016 | Learning from the "deep changes in the land": The Critical Zone perspective in environment | The Earth Scientist 32 (3): 25-27 Cross-CZO | calhoun, national |  |
| 68 | journal citation or other | 2016 | Managing forests in an era of drought. | Graduate Research Advocacy Day. Sacramento, California. | sierra |  |
| 69 | journal citation or other | 2016 | Using Scientist-Teacher Partnerships to Create Student-Driven Environmental Field Research | The Earth Scientist XXXII, no. 3 (Fall 2016): 28–32 Cross-CZO | national, sierra |  |
| 70 | journal citation or other | 2016 | Critical Zone Science and Observatories and Related Education and Outreach Activities and | The Earth Scientist XXXII, no. 3 (Fall 2016): 7–10 | national |  |
| 71 | journal citation or other | 2016 | Critical Zone Science, Interdisciplinarity and the NGSS | The Earth Scientist XXXII, no. 3 (Fall 2016): 15–18 | national |  |
| 72 | journal citation or other | 2016 | International Cooperation in Critical Zone (CZ) Science and Education | The Earth Scientist XXXII, no. 3 (Fall 2016): 11–14 | national |  |
| 73 | journal citation or other | 2016 | Earth Surface Processes in the Critical Zone: An Introductory Course Designed for Teachers | The Earth Scientist XXXII, no. 3 (Fall 2016): 22–24 Cross-CZO | national, shale-hills |  |
| 74 | journal citation or other | 2017 | Effects of long-term experimental manipulations of precipitation and vegetation on carbon | Idaho State University | reynolds |  |
| 75 | journal citation or other | 2017 | Riparian Vegetation of Ephermeral Streams. | Journal of Arid Environments | reynolds |  |
| 76 | journal citation or other | 2017 | Extreme storms drive riverine particulate organic matter export from tropical mountians of |  | luquillo |  |
| 77 | journal citation or other | 2017 | Iron-Carbon Complexation at the Critical Zone: Impacts of Metal Speciation and Ligand Stru | University of Pennsylvania | luquillo |  |
| 78 | journal citation or other | 2017 | Cultivating a sense of place in the southern Piedmont using Esri Story Maps | In The Trenches, Volume 7, Oct 2017 | calhoun |  |
| 79 | journal citation or other | 2017 | Quantifying and Managing Soil Functions in Earth's Critical Zone Combining Experimentation | Advances in Agronomy, Volume 142, Pages 2-423 (2017) | national |  |
| 80 | journal citation or other | 2017 | ONLINE EXTRA: Bringing the Outdoors In: Application of Hydrogeology Education Tools | In The Trenches, 7(4):online | shale-hills |  |
| 81 | journal citation or other | 2018 | CZO Network Attributes Table | CZO National Office Cross-CZO | boulder, calhoun, catalina-jemez, christina, eel, iml, luquillo, national, reynolds, shale-hills, sierra |  |
| 82 | journal citation or other | 2018 | Relative Abundance of Nitrogen-Fixing Bacteria in Biological Soil Crusts in Sagebrush Step | FEMS Microbial Ecology | reynolds |  |
| 83 | meeting abstract or proceedings | 2008 | Inaugural International Conference on Hydropedology Offers Outlooks on Synergistic Studies | IUSS Bulletin 113:51-54. | shale-hills |  |
| 84 | meeting abstract or proceedings | 2012 | Rock snot and Dry Valleys: Interactions between river hydraulics and stream ecosystems. | 16th SANCIAHS National Hydrology Symposium, Pretoria, Republic of Sout | boulder |  |
| 85 | meeting abstract or proceedings | 2012 | Sediment loads and erosion in forest headwater streams of the Sierra Nevada, California | Proceedings of a Workshop held during the XXV IUGG General Assembly in | sierra |  |
| 86 | meeting abstract or proceedings | 2016 | A Strategy for Advancing Critical Zone Science - February 2016 | CZO Strategy Meeting, Boulder, Colorado. 3-5 February 2016 | national |  |
| 87 | meeting abstract or proceedings | 2017 | New Opportunities for Critical Zone Science | 2017 CZO Arlington Meeting White Booklet Cross-CZO | boulder, calhoun, catalina-jemez, christina, eel, iml, luquillo, national, reynolds, shale-hills, sierra |  |
| 88 | meeting abstract or proceedings | 2017 | A HYDRUS 2D evaluation of altered depths to the argillic horizon due to erosion: What impa | Proceedings of the 2017 Georgia Water Resources Conference | calhoun |  |
| 89 | report | 2006 | Frontiers in Exploration of the Critical Zone: Report of a workshop sponsored by the Natio | Newark, DE, 30 pp. | national |  |
| 90 | report | 2008 | Boulder Creek Critical Zone Observatory Annual Report 2008 | Boulder Creek CZO, University of Colorado | boulder |  |
| 91 | report | 2008 | Southern Sierra Critical Zone Observatory: 2007-2008 Annual Report to National Science Fou | NSF Award 0725097 | sierra |  |
| 92 | report | 2008 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award # 0725019 | shale-hills |  |
| 93 | report | 2009 | Mitigation of agricultural nonpoint pollution by a reforested riparian buffer in the Mid-A | Stroud Preserve Watersheds National Monitoring Project. Final report. | christina |  |
| 94 | report | 2009 | Boulder Creek Critical Zone Observatory Annual Report 2009 | Boulder Creek CZO, University of Colorado Boulder, NSF Award #724960 | boulder |  |
| 95 | report | 2009 | Southern Sierra Critical Zone Observatory: 2008-2009 Annual Report to National Science Fou | NSF Award 0725097 | sierra |  |
| 96 | report | 2009 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award # 0725019 | shale-hills |  |
| 97 | report | 2010 | Boulder Creek Critical Zone Observatory Annual Report 2010 | Boulder Creek CZO, University of Colorado Boulder | boulder, eel |  |
| 98 | report | 2010 | 2010 CRB-CZO Annual Report to National Science Foundation | NSF Award #0724971 | christina |  |
| 99 | report | 2010 | 2010 Annual Report CZO: Luquillo Critical Zone Observatory | University of Pennsylvania | luquillo |  |
| 100 | report | 2010 | First Annual Report for NSF EAR‐0724958 entitled “Transformative Behavior of Water, Energy | Jemez-Catalina CZO | catalina-jemez |  |
| 101 | report | 2010 | Southern Sierra Critical Zone Observatory: 2009-2010 Annual Report to National Science Fou | NSF Award 0725097 | sierra |  |
| 102 | report | 2010 | Report of the Steering Committee | Critical Zone Observatories 2010 Annual Meeting | national |  |
| 103 | report | 2010 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award # 0725019 | shale-hills |  |
| 104 | report | 2011 | 2011 CRB-CZO Annual Report to National Science Foundation | NSF Award #0724971 | christina |  |
| 105 | report | 2011 | Boulder Creek Critical Zone Observatory Annual Report 2011 | Boulder Creek CZO, University of Colorado | boulder |  |
| 106 | report | 2011 | 2011 Interim Report CZO: Luquillo Critical Zone Observatory | University of Pennsylvania | luquillo |  |
| 107 | report | 2011 | Second Annual Report for NSF EAR-0724958 entitled “Transformative Behavior of Water, Energ | Jemez-Catalina CZO | catalina-jemez |  |
| 108 | report | 2011 | Southern Sierra Critical Zone Observatory: 2010-2011 Annual Report to National Science Fou | NSF Award 0725097 | sierra |  |
| 109 | report | 2011 | Report of the Steering Committee | Critical Zone Observatory All Hands Meeting, May 8-12, 2011, Tucson, A | national |  |
| 110 | report | 2011 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award # 0725019 | shale-hills |  |
| 111 | report | 2012 | 2012 CRB-CZO Annual Report to National Science Foundation | NSF Award #0724971 | christina |  |
| 112 | report | 2012 | Boulder Creek Critical Zone Observatory Annual report 2012 | Boulder Creek CZO, University of Colorado | boulder |  |
| 113 | report | 2012 | 2012 Annual Report CZO: Luquillo Critical Zone Observatory | University of Pennsylvania | luquillo |  |
| 114 | report | 2012 | NSF Workshop Report: Towards a Unifying Theory of Critical Zone Structure, Function and Ev | JRB-SCM CZO, pp. 22. Cross-CZO | catalina-jemez, national |  |
| 115 | report | 2012 | Third Annual Report for NSF EAR-0724958 entitled “Transformative Behavior of Water, Energy | Jemez-Catalina CZO | catalina-jemez |  |
| 116 | report | 2012 | Southern Sierra Critical Zone Observatory: 2011-2012 Annual Report to National Science Fou | NSF Award 0725097 | sierra |  |
| 117 | report | 2012 | Critical Zone Observatory Steering Committee Report, June, 25 2012 | Critical Zone Observatory Annual Meeting, May 29 to June 1, 2012, San | national |  |
| 118 | report | 2012 | Sustaining Earth's Critical Zone | Report of the International Critical Zone Observatory Workshop. 8th-11 | national |  |
| 119 | report | 2012 | Monitoring time‐lapse changes in soil moisture during artificial infiltration with geophys | Bachelor of Science, Temple University | shale-hills |  |
| 120 | report | 2012 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award # 0725019 | shale-hills |  |
| 121 | report | 2013 | Annual Report 2013. How Critical Zone Processes differ in Landscapes with Contrasting Lith | University of Pennsylvania | luquillo |  |
| 122 | report | 2013 | Fourth Annual Report for NSF EAR-0724958 entitled “Transformative Behavior of Water, Energ | Jemez-Catalina CZO | catalina-jemez |  |
| 123 | report | 2013 | Outcomes Report for Southern Sierra Critical Zone Observatory 2007-2013 | SSCZO Outcomes Report 2013 | sierra |  |
| 124 | report | 2013 | Southern Sierra Critical Zone Observatory: 2007-2013 Final Report to National Science Foun | NSF Award 0725097 | sierra |  |
| 125 | report | 2013 | Southern Sierra Critical Zone Observatory: 2012-2013 Annual Report to National Science Fou | NSF Award 1239521 | sierra |  |
| 126 | report | 2013 | Year 1 Project Report for EAR-1332257: Integrated Data Management System for Critical Zone | NSF Annual Project Report | national |  |
| 127 | report | 2013 | Susquehanna/Shale Hills Critical Zone Observatory: Annual Report to National Science Found | NSF Award #1239285 | shale-hills |  |
| 128 | report | 2014 | Boulder Creek Critical Zone Observatory (BcCZO-II) Annual report 2014 | Boulder Creek CZO, University of Colorado | boulder |  |
| 129 | report | 2014 | Annual Report 2014. Luquillo CZO: The role of hot spots and hot moments in tropical landsc | University of New Hampshire | luquillo |  |
| 130 | report | 2014 | 2014 Catalina-Jemez CZO Annual Report for NSF EAR-1331408 entitled "Transformative Behavio | Jemez-Catalina CZO, University of Arizona | catalina-jemez |  |
| 131 | report | 2014 | Report on Drilling, Sampling, and Imaging the Depths of the Critical Zone, an NSF Workshop | Open Project Report to the Critical Zone Community Cross-CZO | catalina-jemez, national, sierra |  |
| 132 | report | 2014 | Southern Sierra Critical Zone Observatory: 2013-2014 Annual Report to National Science Fou | NSF Award 1331939 | sierra |  |
| 133 | report | 2014 | Steering Committee Report on the All-Hands meeting at the Southern Sierra Critical Zone Ob | CZO Steering Committee | national |  |
| 134 | report | 2014 | Year 2 Project Report for EAR-1332257: Integrated Data Management System for Critical Zone | NSF Annual Project Report | national |  |
| 135 | report | 2014 | An Accomplishment-Based Request for Renewal of the Susquehanna-Shale Hills Critical Zone O | NSF Award # 1239285 Project Outcomes Report | shale-hills |  |
| 136 | report | 2014 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 1 | shale-hills |  |
| 137 | report | 2015 | Eel River Critical Zone Observatory Annual Report 2015 | Eel River CZO, UC Berkeley | eel |  |
| 138 | report | 2015 | Frontiers in International Critical Zone Science - Beijing, China Workshop Report | Beijing Workshop Report, May 21-23, 2014 Cross-CZO | boulder, calhoun, catalina-jemez, christina, eel, iml, luquillo, national, reynolds, shale-hills, sierra |  |
| 139 | report | 2015 | Reynolds Creek Critical Zone Observatory Annual Report 2015 | Reynolds Creek CZO, University of Idaho | reynolds |  |
| 140 | report | 2015 | Critical Zone Observatory for Intensively Managed Landscapes (IML-CZO) Annual Report 2015 | NSF Award #1331906 | iml |  |
| 141 | report | 2015 | Boulder Creek Critical Zone Observatory (BcCZO-II) Annual report 2015 | Boulder Creek CZO, University of Colorado | boulder |  |
| 142 | report | 2015 | Annual Report 2015. Luquillo CZO: The role of hot spots and hot moments in tropical landsc | University of New Hampshire | luquillo |  |
| 143 | report | 2015 | Annual Report 2015: Human and Natural Forcings of Critical Zone Dynamics and Evolution at | NSF Award #1331846 | calhoun |  |
| 144 | report | 2015 | 2015 Catalina-Jemez CZO Annual Report for NSF EAR-1331408 entitled "Transformative Behavio | Jemez-Catalina CZO, University of Arizona | catalina-jemez |  |
| 145 | report | 2015 | Southern Sierra Critical Zone Observatory: 2014-2015 Annual Report to National Science Fou | NSF Award 1331939 | sierra |  |
| 146 | report | 2015 | CZO National Office Annual Report 2015 | CZO National Office, Cornell University | national |  |
| 147 | report | 2015 | Progress and Timeline for Deliverables Report for the Integrated Data Management System fo | Interim Progress Report to NSF | national |  |
| 148 | report | 2015 | Report of the Critical Zone Observatory (CZO) Network Science Steering Committee (SSC) of | CZO Steering Committee | national |  |
| 149 | report | 2015 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 2 | shale-hills |  |
| 150 | report | 2016 | Critical Zone Observatory for Intensively Managed Landscapes (IML­CZO) Annual Report 2016 | NSF Award #1331906 | eel, iml |  |
| 151 | report | 2016 | Eel River Critical Zone Observatory Annual Report 2016 | Eel River CZO, UC Berkeley | eel |  |
| 152 | report | 2016 | Reynolds Creek Critical Zone Observatory Annual Report 2016 | Reynolds Creek CZO, University of Idaho | reynolds |  |
| 153 | report | 2016 | Boulder Creek Critical Zone Observatory (BcCZO-II) Annual report 2016 | Boulder Creek CZO, University of Colorado | boulder |  |
| 154 | report | 2016 | Annual Report 2016. Luquillo CZO: The role of hot spots and hot moments in tropical landsc | University of New Hampshire | luquillo |  |
| 155 | report | 2016 | Steering Committee report for Reynolds Creek CZO site visit and PI meeting | CZO Steering Committee Cross-CZO | luquillo, national |  |
| 156 | report | 2016 | Annual Report 2016: Human and Natural Forcings of Critical Zone Dynamics and Evolution at | NSF Award #1331846 | calhoun |  |
| 157 | report | 2016 | 2016 Catalina-Jemez CZO Annual Report for NSF EAR-1331408 entitled "Transformative Behavio | Catalina-Jemez CZO, University of Arizona | catalina-jemez |  |
| 158 | report | 2016 | Southern Sierra Critical Zone Observatory: 2015-2016 Annual Report to National Science Fou | NSF Award #1331939 | sierra |  |
| 159 | report | 2016 | CZO National Office Annual Report 2016 | CZO National Office, Cornell University | national |  |
| 160 | report | 2016 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 3 | shale-hills |  |
| 161 | report | 2017 | Eel River Critical Zone Observatory Annual Report 2017 | NSF Award #1331940 | eel |  |
| 162 | report | 2017 | Reynolds Creek Critical Zone Observatory Annual Report 2017 | Reynolds Creek CZO, University of Idaho | reynolds |  |
| 163 | report | 2017 | Intensively Managed Landscapes ­CZO Annual Report 2017 | IML CZO, NSF Award #1331906 | iml |  |
| 164 | report | 2017 | Boulder Creek Critical Zone Observatory Annual report 2017 | Boulder Creek CZO, University of Colorado | boulder |  |
| 165 | report | 2017 | Annual Report 2017 Luquillo CZO: The role of hot spots and hot moments in tropical landsca | University of New Hampshire | luquillo |  |
| 166 | report | 2017 | Annual Report 2017: Human and Natural Forcings of Critical Zone Dynamics and Evolution at | NSF Award #1331846 | calhoun |  |
| 167 | report | 2017 | Catalina-Jemez CZO Annual Report 2017 | Catalina-Jemez CZO, University of Arizona | catalina-jemez |  |
| 168 | report | 2017 | Southern Sierra Critical Zone Observatory: 2016-2017 Annual Report to National Science Fou | NSF Award #1331939 | sierra |  |
| 169 | report | 2017 | CZO National Office Annual Report 2017 | CZO National Office, Cornell University | national |  |
| 170 | report | 2017 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 4 | shale-hills |  |
| 171 | report | 2018 | Eel River Critical Zone Observatory Annual Report 2018 | NSF Award #1331940 | eel |  |
| 172 | report | 2018 | Reynolds Creek Critical Zone Observatory Annual Report 2018 | Reynolds Creek CZO, University of Idaho | reynolds |  |
| 173 | report | 2018 | Intensively Managed Landscapes ­CZO Annual Report 2018 | IML CZO, NSF Award #1331906 | iml |  |
| 174 | report | 2018 | Boulder Creek Critical Zone Observatory Annual report 2018 | Boulder Creek CZO, University of Colorado | boulder |  |
| 175 | report | 2018 | Luquillo Critical Zone Observatory Annual Report 2018 | University of New Hampshire | luquillo |  |
| 176 | report | 2018 | Calhoun CZO Annual Report 2018 | NSF Award #1331846 | calhoun |  |
| 177 | report | 2018 | Catalina-Jemez CZO Annual Report 2018 | Catalina-Jemez CZO, University of Arizona | catalina-jemez |  |
| 178 | report | 2018 | Southern Sierra Critical Zone Observatory: 2017-2018 Annual Report to National Science Fou | NSF Award #1331939 | sierra |  |
| 179 | report | 2018 | CZO National Office Annual Report 2018 | CZO National Office, Cornell University | national |  |
| 180 | report | 2018 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 5 | shale-hills |  |
| 181 | report | 2019 | Eel River Critical Zone Observatory Annual Report 2019 | NSF Award #1331940 | eel |  |
| 182 | report | 2019 | Intensively Managed Landscapes ­CZO Annual Report 2019 | IML CZO, NSF Award #1331906 | iml |  |
| 183 | report | 2019 | Boulder Creek Critical Zone Observatory Annual report 2019 | NSF Award #1331828 | boulder |  |
| 184 | report | 2019 | Luquillo Critical Zone Observatory Annual Report 2019 | University of New Hampshire | luquillo |  |
| 185 | report | 2019 | Calhoun CZO Annual Report 2019 | NSF Award #1331846 | calhoun |  |
| 186 | report | 2019 | Catalina-Jemez CZO Annual Report 2019 | University of Arizona | catalina-jemez |  |
| 187 | report | 2019 | Southern Sierra Critical Zone Observatory: 2018-2019 Annual Report to National Science Fou | NSF Award #1331939 | sierra |  |
| 188 | report | 2019 | CZO National Office Annual Report 2019 | NSF Award #1360760 | national |  |
| 189 | report | 2019 | Using the Susquehanna - Shale Hills CZO to Project from the Geological Past to the Anthrop | NSF Award # 1331726 - Annual Report: Year 6 | shale-hills |  |
| 190 | submitted or in review | 2013 | The Effect Of Particle Storage On Time-Averaged Suspended Sediment Transport Velocities Al | In Review, University of Delaware | christina |  |
| 191 | thesis | 1996 | Soil acidification, soil potassium availability, and biogeochemistry of aluminum and silic | PhD Dissertation, Duke University | calhoun |  |
| 192 | thesis | 2009 | Characterization of water chemistry and Didymosphenia geminata growth in Boulder Creek. | A thesis submitted to the Faculty of the Graduate School of the Univer | boulder |  |
| 193 | thesis | 2009 | Getting water into the ground and to the channel, Gordon Gulch, Colorado. | Thesis, Degree of Bachelor of Arts, Geosciences, Williams College 2009 | boulder |  |
| 194 | thesis | 2009 | Investigating the growth of didymosphenia geminata and the impact on benthic macroinverteb | Thesis, University of Colorado, Master of Science Department of Enviro | boulder |  |
| 195 | thesis | 2009 | Comparison of in-stream sediment sources and assessment of a bank migration model for head | UC Merced M.S. thesis | sierra |  |
| 196 | thesis | 2009 | Characterizing the Lithologic Controls on Flow in the Shale Hills Critical Zone Observator | Bachelor of Science, Pennsylvania State University. | shale-hills |  |
| 197 | thesis | 2010 | Applied geophysical characterization of the shallow subsurface: Towards quantifying recent | Thesis, University of Colorado, Master of Science, Department of Geolo | boulder |  |
| 198 | thesis | 2010 | The Distribution of Tors in Gordon Gulch, Front Range, Colorado. | Thesis. Degree of Bachelor of Arts with Honors in Geosciences. William | boulder |  |
| 199 | thesis | 2010 | Clay Mineralogy, Geochemistry and Weathering Characteristics of Clinton Group Shales in Ce | Bachelor of Arts Geology, Colgate University | shale-hills |  |
| 200 | thesis | 2010 | Rates and Mechanisms of Soil Carbon Sequestration at the Shale Hills Critical Zone Observa | Bachelor of Science, Pennsylvania State University, p. 51. | shale-hills |  |
| 201 | thesis | 2011 | Sagebrush Steppe Shrub Height and Canopy Cover Estimation Using LiDAR and Landsat 5 TM Dat | Idaho State University Graduate Thesis | reynolds |  |
| 202 | thesis | 2011 | Assessing eolian contributions to soils in the Boulder Creek Catchment, Colorado, | Thesis submitted in partial fulfillment of the requirements for the De | boulder, catalina-jemez |  |
| 203 | thesis | 2011 | Examining knickpoints in the Middle Boulder Creek Catchment, Colorado | A thesis Submitted in partial fulfillment of the requirements for the | boulder |  |
| 204 | thesis | 2011 | Meteoric 10Be in Gordon Gulch, Colorado soils: Implications for hillslope processes and de | Honors thesis, Geology, Amherst College, 100 pp. | boulder |  |
| 205 | thesis | 2011 | Reconstructing Pinedale (latest Pleistocene) ice in the Green Lakes Valley and adjacent ar | Thesis submitted in partial fulfillment of the requirements for the De | boulder |  |
| 206 | thesis | 2011 | Regolith stirring by biological processes, Gordon Gulch, Colorado. | An Independent Study Submitted in partial fulfillment of the requireme | boulder |  |
| 207 | thesis | 2011 | Geochemical Model of Redox Reactions in a Tropical Rain Forest Stream Riparian Zone: DOC O | Master's Capstone and Thesis. University of Pennsylvania | luquillo |  |
| 208 | thesis | 2011 | A Quantitative Analysis of Deep Shale Weathering at the Shale Hills Critical Zone Observat | Bachelor of Science, Pennsylvania State University, p. 38 | shale-hills |  |
| 209 | thesis | 2011 | Critical Zone Studies of Shale Weathering in Lares, Puerto Rico | Bachelor of Science, University of Puerto Rico - Mayaguez | shale-hills |  |
| 210 | thesis | 2012 | Spring of Gordon Gulch: A groundwater analysis. | Honors thesis, Environmental Studies, University of Colorado, 53 pp. | boulder |  |
| 211 | thesis | 2012 | The Geochemical Impact of Wildfire and Mining on the Fourmile Creek Watershed, Colorado | Submitted to the Department of Geology of Amherst College in partial f | boulder |  |
| 212 | thesis | 2012 | Solute inputs to soil and stream waters in a seasonally snow-covered mountain catchment de | MS Thesis in Hydrology and Water Resources. University of Arizona, Tuc | catalina-jemez |  |
| 213 | thesis | 2012 | Composition and stabilization mechanisms of organic matter in soils and sediments eroded f | UC Merced MS Thesis | sierra |  |
| 214 | thesis | 2012 | Insight into the weathering of the Marcellus Shale through Sulfur and Carbon Analyses | Bachelor of Science, Pennsylvania State University, p. 72. | shale-hills |  |
| 215 | thesis | 2013 | Hydrological Regulation on Dissolved Organic Carbon Transport from Agricultural and Forest | Vanderbilt University Ph.D. dissertation | christina |  |
| 216 | thesis | 2013 | Investigating Organic Matter-Mineral Interactions at the Molecular Scale: An Integrated Fi | University of Delaware Ph.D. dissertation | christina |  |
| 217 | thesis | 2013 | Bedrock composition regulates ecosystems and landscape evolution in the sierra Nevada Bath | University of Wyoming M.Sc. Thesis | sierra |  |
| 218 | thesis | 2013 | Aboverground Carbon Distribution across a temperate watershed. | Master of Science, Ecology, The Pennsylvania State University, p. 72 | shale-hills |  |
| 219 | thesis | 2013 | C, N, and Mn in Shale Soil Profiles along a Climate Gradient | Bachelor of Science, Pennsylvania State University. | shale-hills |  |
| 220 | thesis | 2013 | Characterizing the Recent Cenozoic Erosional History of the Appalachian Mountains through | Bachelor of Science, Pennsylvania State University. | shale-hills |  |
| 221 | thesis | 2013 | Rose Hill Shale Weathering Across a Climate Gradient in the Appalachian Mountains | Bachelor of Science, Pennsylvania State University | shale-hills |  |
| 222 | thesis | 2014 | Linking topography, hydrology, climate and ecoloty in semi-arid forests: Within catchment | MA thesis, Dept. of Geography, University of Colorado, Boulder. | boulder |  |
| 223 | thesis | 2014 | Impact of Oil and Gas Industry Wastewater on Water and Sediment Chemistry in One Stream in | Bachelor of Science, The Pennsylvania State University | shale-hills |  |
| 224 | thesis | 2014 | Investigating Pennsylvania Water Quality Impacts Due to Shale Gas Development | Bachelor of Science, The Pennsylvania State University | shale-hills |  |
| 225 | thesis | 2014 | Reading Atmospheric and Biotic Influences in Soils: The relationship between soil gas and | Bachelor of Science, The Pennsylvania State University | shale-hills |  |
| 226 | thesis | 2015 | Dissolved organic matter sorption to soil minerals: Role of DOM composition, microorganism | University of Delaware Ph.D. dissertation | christina |  |
| 227 | thesis | 2015 | Bedrock incision and gravel deposition along the rivers in the High Plains. | Senior thesis, Geography, University of Colorado, 31 pp. | boulder |  |
| 228 | thesis | 2015 | Assessing the Subsurface Geology of Garner Run Through the Relationship Between Seismic Ve | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 229 | thesis | 2015 | Elucidating the Effects of Reservoir Filling on Watershed Hydrodynamics and Shallow Ground | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 230 | thesis | 2015 | Isotopic data sonification: Shale Hills Critical Zone Observatory | Master of Fine Arts, Arts and Architecture, The Pennsylvania State Uni | shale-hills | OpenAlex's page is a Georgia Tech conference paper on the same subject, not this Penn State MFA thesis (final review) |
| 231 | thesis | 2015 | Seismic Refraction for Subsurface Analysis of Garner Run | Senior Thesis, Geosciences, The Pennsylvania State University | shale-hills |  |
| 232 | thesis | 2015 | Thick soil formation on Orthoquartzite since the Wisconsinan in Huntingdon County | Senior Thesis, Geosciences, The Pennsylvania State University | shale-hills |  |
| 233 | thesis | 2017 | Runoff generation in Betasso catchment: Investigation of Hortonian overland flow. | Senior honors thesis, Physical Geography, University of Colorado. | boulder |  |
| 234 | thesis | 2017 | Depth to the Argillic Horizon on Historically Farmed Soil in the Southeastern USA Piedmont | Master's Thesis, University of Georgia | calhoun |  |
| 235 | thesis | 2017 | Drivers and Variability of Iron Reduction in Upland Soils | M.S. Thesis, Department of Crop & Soil Sciences, University of Georgia | calhoun |  |
| 236 | thesis | 2017 | Lithological controls on soil properties of temperate forest ecosystems in central Pennsyl | Master of Science, Ecology, The Pennsylvania State University, p. 89 | shale-hills |  |
| 237 | thesis | 2018 | Biogeochemical cycling of iron and carbon in humid (sub)tropical forest soils under fluctu | PhD Dissertation, Department of Crop and Soil Sciences, University of | calhoun, luquillo |  |
| 238 | thesis | 2018 | An Observational and Modeling Study of the Energy, Water, and Carbon Cycle at Calhoun Crit | PhD Dissertation, Civil Engineering, Georgia Institute of Technology, | calhoun |  |
| 239 | thesis | 2018 | Distribution and diversity of semiaquatic Sparganophilidae earthworms in the Southern Appa | MS Thesis, University of Georgia | calhoun |  |
| 240 | thesis | 2018 | Eroded Landscapes: Agricultural and Environmental Change in the United States Piedmont, 17 | MA Thesis, University of Georgia, Department of Anthropology | calhoun |  |
| 241 | thesis | 2018 | The deep Critical Zone as a source of mineral nutrients to montane, temperate forest ecosy | PhD Dissertation for Freien Universität Berlin | sierra |  |
| 242 | thesis | 2018 | Analysis of the Subsurface Structure of Swales in the Shale Hills Watershed Using Electric | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 243 | thesis | 2018 | Surface and shallow subsurface nutrient transport within an agriculturally active central | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 244 | thesis | 2018 | Using S-wave Models to Image the Subsurface at Shale Hills Observatory | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 245 | thesis | 2019 | Characterising the Shallow Subsurface of the Critical Zone Using Seismic Refraction in the | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 246 | thesis | 2019 | Ground-truthing Subsurface Variations in Seismic Velocities and Electrical Resistivity usi | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 247 | thesis | 2019 | Using Seismic Refraction to Examine the Formation and Weathering Processes of the Critical | Bachelor of Science, Geosciences, The Pennsylvania State University | shale-hills |  |
| 248 | thesis | 2020 | Geology of the Calhoun Critical Zone Observatory | Master's Thesis, University of Georgia | calhoun |  |

### G. Preprints: 10

Preprints stay on the list unless the journal version is on it too (Jordan, 31 October and 16 November). Each of these is linked to its journal version by Crossref (`is-preprint-of`), arXiv (DataCite) or a title and first-author match. Other preprints in the plan have no journal version and stay as preprints.

| Preprint (year, title) | Preprint DOI | Change | Journal version |
|---|---|---|---|
| 2020 Understanding the effect of fire on vegetation composition and gross primary pro | 10.5194/bg-2019-510 | the record becomes the journal version (DOI, title, year, journal) | 10.5194/bg-18-2027-2021 (Biogeosciences, 2021) |
| 2014 Dynamics and mechanics of tracer particles | 10.5194/esurfd-2-429-2014 | deleted; the journal version on the list stays | 10.5194/esurf-2-513-2014 |
| 2017 Developing and evaluating a theory for the lateral erosion of bedrock channels f | 10.5194/esurf-2017-28 | deleted; the journal version on the list stays | 10.5194/esurf-6-1-2018 |
| 2025 Identification of Dust-Dominated Periods and a PM 2.5 Correction Based Solely on | 10.5194/egusphere-2025-5063 | deleted; the journal version on the list stays | 10.5194/amt-19-1077-2026 |
| 2022 Measurement Report: An Exploratory Study of Fluorescence and CCN Activity of Urb | 10.5194/acp-2021-991 | deleted; the journal version on the list stays | 10.5194/acp-22-9647-2022 |
| 2015 Orographic and vegetation effects on snow accumulation in the southern Sierra Ne | 10.5194/tcd-9-4377-2015 | deleted; the journal version on the list stays | 10.5194/tc-10-257-2016 |
| 2025 Soils signal key mechanisms driving greater protection of organic carbon under a | 10.5194/egusphere-2025-70 | deleted; the journal version on the list stays | 10.5194/bg-22-6097-2025 |
| 2016 Analyzing cloud base at local and regional scales to understand tropical montane | 10.5194/acp-2016-1166 | the record becomes the journal version (DOI, title, year, journal) | 10.5194/acp-17-7245-2017 (Atmospheric Chemistry and Physics, 2017) |
| 2018 Radiative effects of daily cloud cycle: general methodology and application to c | 10.48550/arxiv.1803.01742 | the record becomes the journal version (DOI, title, year, journal) | 10.1007/s00382-019-05077-5 (Climate Dynamics, 2019) |
| 2024 Lidar-Derived Forest Metrics Predict Snow Accumulation and Ablation in the Centr | 10.22541/au.171799893.36954583/v1 | the record becomes the journal version (DOI, title, year, journal) | 10.1002/eco.70109 (Ecohydrology, 2025) |
