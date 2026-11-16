# Proposal: tag Critical Zone products with their CZNet cluster

16 November 2026. **A proposal. Nothing in `content/` was changed.** Epic CUAHSI/CUAHSI3-website#62. Jordan asked why `/critical-zone-science/network` shows only datasets and chose to fix it by tagging the records (option 1), before the next organisation package.

## Why the page shows only datasets

Each of the network page's ten sections lists the products whose `sites` include that cluster (`CzProductList`, `site`). The 188 products tagged with a cluster are all datasets, from the Data Discovery harvest. The cluster papers came from Crossref (29 October) and NSF PAR (2 November); both proposals loaded them with no `sites` tag, so no section picks them up. They show on `/critical-zone-science/papers` only.

## What this would change

| | Now | After |
|---|---|---|
| Products with no `sites` tag | 615 of 2,889 | 180 |
| Rows on the network page | 188 (all datasets) | 640: the 188, plus 452 rows for 435 records (405 papers, 28 datasets, 2 software; 17 records show in two sections) |
| Papers in the papers page's "Observatory or cluster" filter for a cluster | 0 | 405 papers across the ten |

By section of the network page (a record with two clusters counts in both):

| Section | Now | Added | After |
|---|---|---|---|
| CZNet Hub | 1 | 24 | 25 |
| Bedrock | 8 | 38 | 46 |
| Big Data | 8 | 60 | 68 |
| CINet | 24 | 33 | 57 |
| Coastal | 24 | 54 | 78 |
| Drylands | 27 | 12 | 39 |
| Dust | 16 | 64 | 80 |
| Dynamic Water | 32 | 87 | 119 |
| Geomicrobiology | 5 | 45 | 50 |
| Urban | 43 | 35 | 78 |
| **Total** | **188** | **452** | **640** |

The edit: add a `sites` array to 435 records in `content/critical-zone/products.json`, nothing else. No record already tagged changes (0 of 2,274 would gain a tag). No page code changes, but the pages will look different in these ways:

- **Network page:** every section now mixes papers with datasets, so each gains a Type column (from 640px wide; on a phone the type joins the row's summary line). Papers show their publisher under Where. Rows stay newest first, so papers and datasets interleave. Dynamic Water becomes the longest section at 119 rows.
- **Papers page:** the "Observatory or cluster" column, blank for these 405 papers today, shows the cluster name, and sorting by that column orders them with the rest instead of last. The filter gains the ten clusters.
- **Datasets page:** 30 rows (28 datasets, 2 software) gain a cluster name, and the filter's counts rise: Dust +8, Dynamic Water +6, Big Data +5, Bedrock +4, Drylands +3, Urban +2, Geomicrobiology +2, Hub +1.
- **Search** on both pages matches cluster names for these records.
- **Highlights:** unchanged (see below).

Two code comments become out of date once the records are tagged: `components/CzHighlights.vue:4` ("no site tag (every CZNet paper)") and `composables/useCzLabels.ts:28` ("The records carry no cluster tag on papers"). Rule 3 keeps them out of a content branch, so a small code PR follows the tagging.

## How a record's cluster is decided

- **From the awards it credits.** 44 registry awards name a cluster or the Hub in their title ("Network Cluster: Dust in the Critical Zone ...", "Network Hub: ..."). The ten title patterns are the ones `czClusterOfAward` (`composables/useCzLabels.ts`) already uses to place untagged papers in Highlights, so the two agree.
- **Every cluster it credits.** 17 records credit awards of two clusters and get both tags (mostly Big Data with Dynamic Water).
- **In the order of its awards.** Highlights shows a record under its first tag; ordering the tags by award order keeps each of the 10 highlighted records in this batch where it is today.
- **The same rule for datasets and software.** 28 datasets and 2 software records with no tag credit a cluster award.
- **An inference, not a statement from the authors.** PAR and Crossref list a paper because it credits the award; this does not say the work was done at the cluster's sites. The same inference already places these papers in Highlights.

## Questions

1. **The Hub.** 24 records credit the Hub award (22 only the Hub). I'd tag them `hub`, so they list under "CZNet Hub". Yes?
2. **Two clusters.** I'd give the 17 records both tags, so they show in both sections. Yes?
3. **`era`.** The cluster datasets also carry `era: cznet`; these records have none. Nothing on the site reads `era`, so I'd leave it out of this edit. Yes?
4. **Observatories have the same gap.** 142 of the 180 left untagged credit only CZO observatory awards (for example 31 credit Shale Hills' 0725019), so they are missing from the observatory pages too. Placing them is less clean: some awards are cross-observatory, and the sample turned up a Puerto Rico weather dataset that credits the Shale Hills award. I'd make that a separate proposal after this one. Yes?

## Checked

- Sample (rule 12), read against the award registry: tagged records 1726 ("A grazing crab drives saltmarsh carbon storage", Coastal 2012670), 2654 (lichens as dust bioindicators, Dust 2012093), 2888 (karst watershed thermal regime, Hub 2012893); untagged records 1756 (AmeriFlux US-PeA, no award), 2097 (Puerto Rico weather station data, credits Shale Hills 0725019), 2581 (an R-script supplement, no award).
- Source of the counts: `content/critical-zone/products.json` and `content/awards/awards.json` on main at 9474d6a.

## Applying it

One file, 435 records, so the edit is scripted (Jordan's approval of this table first; then one record edited by hand as the worked example, the rest by script, three records read after). A `content/` branch; `npm run validate:content` and a build, then the network page and a cluster filter on the papers page for you to look at.

## The records

Grouped under each record's first cluster, so a record with two appears once (its second tag shown). Titles link to the DOI. Awards are NSF numbers.

### CZNet Hub (`hub`): 22

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | paper | [Bioclimatic Reorganization of Carbon–Water–Energy Coupling Revealed by Eddy Covariance and Interpretable Machine Learning](https://doi.org/10.1002/gcb4.70012) | `hub` | 2012893 |
| 2 | 2026 | paper | [Dominant Controls on Preferential Flow and Their Implications for Future Soil Water Fluxes](https://doi.org/10.1029/2026EF008296) | `hub` | 2012893 |
| 3 | 2026 | paper | [Evapotranspiration Everywhere, All the Time: Towards a Unified View From Earth Observation](https://doi.org/10.1111/gcb.70898) | `hub` | 2012893 |
| 4 | 2026 | paper | [Road salt impacts on streams and springs in a karstic watershed](https://doi.org/10.1088/2515-7620/ae6035) | `hub` | 2012893 |
| 5 | 2026 | paper | [Streamflow Dynamics Across an Urbanizing Karst Watershed in the Ridge and Valley Province](https://doi.org/10.1029/2025WR041126) | `hub` | 2012893 |
| 6 | 2026 | paper | [Thermal Regime Dynamics in a Karst Watershed Influenced by Groundwater and Urbanization](https://doi.org/10.1002/hyp.70689) | `hub` | 2012893 |
| 7 | 2025 | paper | [A novel approach to increase accuracy in remotely sensed evapotranspiration through basin water balance and flux tower constraints](https://doi.org/10.1016/j.jhydrol.2025.133824) | `hub` | 2012893 |
| 8 | 2025 | paper | [Advancing reproducible and transparent research with practical skills in data and code management](https://doi.org/10.22541/essoar.176590620.05979262/v1) | `hub` | 1849458, 2012893 |
| 9 | 2025 | paper | [Climate change has increased global evaporative demand except in South Asia](https://doi.org/10.1038/s43247-025-02959-x) | `hub` | 2012893 |
| 10 | 2025 | paper | [Incorporating Catchment Attributes Grouping into Model Parameter Regionalization To Enhance Root Zone Soil Moisture Estimation](https://doi.org/10.1007/s11269-025-04156-z) | `hub` | 2012893 |
| 11 | 2025 | paper | [Remote Sensing-Based Assessment of Evapotranspiration Patterns in a UNESCO World Heritage Site Under Increasing Water Competition](https://doi.org/10.3390/rs17142339) | `hub` | 2012893 |
| 12 | 2025 | paper | [Spatiotemporal dynamics of soil moisture and the occurrence of hysteresis during seasonal transitions in a headwater catchment](https://doi.org/10.1016/j.geoderma.2025.117169) | `hub` | 2012893 |
| 13 | 2024 | paper | [Challenges and Future Directions in Quantifying Terrestrial Evapotranspiration](https://doi.org/10.1029/2024wr037622) | `hub` | 2012893 |
| 14 | 2024 | paper | [Improved Streamflow Simulation by Assimilating In Situ Soil Moisture in Lumped and Distributed Approaches of a Hydrological Model in a Headwater Catchment](https://doi.org/10.1007/s11269-024-03895-9) | `hub` | 2012893 |
| 15 | 2024 | paper | [Increasing phosphorus loss despite widespread concentration decline in US rivers](https://doi.org/10.1073/pnas.2402028121) | `hub` | 2012893 |
| 16 | 2024 | paper | [Responses of Marginal and Intrinsic Water‐Use Efficiency to Changing Aridity Using FLUXNET Observations](https://doi.org/10.1029/2023JG007875) | `hub` | 2012893 |
| 17 | 2024 | paper | [The hydrologic nature of swales uncovers remarkable influence of non-topographic factors on catchment-scale soil moisture variation](https://doi.org/10.1016/j.jhydrol.2024.131196) | `hub` | 2012893 |
| 18 | 2022 | paper | [Freshwater unionid mussels threatened by predation of Round Goby (Neogobius melanostomus)](https://doi.org/10.1038/s41598-022-16385-y) | `hub` | 2012893 |
| 19 | 2022 | paper | [Preferential flow patterns in forested hillslopes of east Tibetan Plateau revealed by dye tracing and soil moisture network](https://doi.org/10.1111/ejss.13294) | `hub` | 2012893 |
| 20 | 2022 | paper | [Smoke deposition to water surfaces drives hydrochemical changes](https://doi.org/10.1002/hyp.14626) | `hub` | 2012893 |
| 21 | 2022 | paper | [Wildfire and hydrological processes](https://doi.org/10.1002/hyp.14640) | `hub` | 2012893 |
| 22 | 2021 | paper | [Meeting the Needs of Interdisciplinary Critical Zone Scientists by Leveraging and Linking Existing Domain Repositories](https://doi.org/10.1002/essoar.10509220.1) | `hub` | 2012593, 2012748, 2012893 |

### Bedrock (`bedrock`): 38

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | paper | [Active-Source Environmental Seismology](https://doi.org/10.1785/0220260046) | `bedrock` | 2012353 |
| 2 | 2026 | paper | [Bridging Single‐Tree Processes and Regional‐Scale Patterns to Explain Vegetation Drought Resistance and Resilience in a Sierra Nevada Headwater Catchment](https://doi.org/10.1029/2025JG009585) | `bedrock` | 2012408 |
| 3 | 2026 | paper | [Creating a Critical Zone: Feedbacks Between Bedrock Geology, Water Retention, and Vegetation on an Exposed Bedrock Surface, Panola Mountain, Georgia, USA](https://doi.org/10.1029/2025jf008424) | `bedrock` | 2012353 |
| 4 | 2026 | dataset | [Data from: Role of tectonic rock damage in erosional processes: A global analysis](https://doi.org/10.5061/dryad.tht76hfb0) | `bedrock` | 2012073 |
| 5 | 2026 | paper | [Deep critical zone controls on shallow landslides](https://doi.org/10.1073/pnas.2524542123) | `bedrock` | 2012073 |
| 6 | 2026 | paper | [Deep subsurface water can sustain giant sequoias](https://doi.org/10.1038/s43247-026-04034-5) | `bedrock` | 2012353, 2012357 |
| 7 | 2026 | paper | [Role of tectonic rock damage in erosional processes: A global analysis](https://doi.org/10.1126/science.ady9857) | `bedrock` | 2012073 |
| 8 | 2025 | paper | [A Null Model for Global Root Depth Distributions: Analytical Solution and Comparison to Data](https://doi.org/10.1002/eco.70023) | `bedrock` | 2012264, 2012353 |
| 9 | 2025 | paper | [Exploring the connection between critical zone structure and tree distribution in a semiarid eroding landscape with shallow seismic refraction](https://doi.org/10.1002/vzj2.70006) | `bedrock` | 2012227, 2012353, 2012357 |
| 10 | 2025 | paper | [On the role of inherited rock fabric in critical zone porosity development: Insights from seismic anisotropy measurements using surface waves](https://doi.org/10.1002/esp.70132) | `bedrock` | 2012227, 2012264, 2012316, 2012353, 2012357 |
| 11 | 2025 | dataset | [Panola Mountain critical zone development data](https://doi.org/10.5281/zenodo.16945014) | `bedrock` | 2012353 |
| 12 | 2025 | paper | [Unraveling the Connection Between Subsurface Stress and Geomorphic Features](https://doi.org/10.1029/2025GL116798) | `bedrock` | 2012073 |
| 13 | 2025 | dataset | [Unraveling the Connection between Subsurface Stress and Geomorphic Features: Dataset](https://doi.org/10.5281/zenodo.12620524) | `bedrock` | 2012073 |
| 14 | 2025 | paper | [Using Seismic Refraction Data to Estimate a Relationship Between Landscape Curvature and Deep Critical Zone Structure in the South Carolina Piedmont, USA](https://doi.org/10.1029/2025jf008346) | `bedrock` | 1331846, 2012073, 2012227, 2012353, 2012357 |
| 15 | 2024 | paper | [2D Near‐Surface Full‐Waveform Tomography Reveals Bedrock Controls on Critical Zone Architecture](https://doi.org/10.1029/2023EA003248) | `bedrock` | 2012353 |
| 16 | 2024 | paper | [Anatomy of a deep Piedmont critical zone: Evaluating hypotheses on regolith depth controls through comparison of ridge and valley boreholes](https://doi.org/10.1002/esp.6034) | `bedrock` | 2012316 |
| 17 | 2024 | paper | [Catchment Coevolution and the Geomorphic Origins of Variable Source Area Hydrology](https://doi.org/10.1029/2023WR034647) | `bedrock` | 2012264, 2012353 |
| 18 | 2024 | dataset | [Data and model output for "Evidence of subsurface control on the coevolution of hillslope morphology and runoff generation"](https://doi.org/10.5281/zenodo.13852023) | `bedrock` | 2012264 |
| 19 | 2024 | paper | [Evidence of Subsurface Control on the Coevolution of Hillslope Morphology and Runoff Generation](https://doi.org/10.1029/2024WR037301) | `bedrock` | 2012264 |
| 20 | 2024 | paper | [Geophysics as a hypothesis‐testing tool for critical zone hydrogeology](https://doi.org/10.1002/wat2.1732) | `bedrock`, `dynamic-water` | 2012353, 2012408, 2012730 |
| 21 | 2024 | paper | [Low V p /V s Values as an Indicator for Fractures in the Critical Zone](https://doi.org/10.1029/2023GL105946) | `bedrock` | 2012353 |
| 22 | 2024 | paper | [Similarities in Storage and Transport of Sulfate in Forested and Suburban Watersheds, Despite Anthropogenically Elevated Suburban Sulfate](https://doi.org/10.1029/2023JG007588) | `bedrock`, `urban` | 2012264, 2012313, 2012353 |
| 23 | 2024 | paper | [The grain size of sediments delivered to steep debris‐flow prone channels prior to and following wildfire](https://doi.org/10.1002/esp.5819) | `bedrock` | 2012073 |
| 24 | 2023 | paper | [Examining the influence of disequilibrium landscape on millennial-scale erosion rates in the San Bernardino Mountains, California, USA](https://doi.org/10.1130/B36734.1) | `bedrock` | 2012073, 2012353 |
| 25 | 2023 | paper | [Mapping bedrock topography: a seismic refraction survey and landscape analysis in the Laramie Range, Wyoming](https://doi.org/10.3389/frwa.2023.1057725) | `bedrock` | 2012227, 2012353 |
| 26 | 2023 | paper | [Sand, Gravel, Cobbles, and Boulders: Detrital Thermochronology Shows that One Size Does Not Tell All](https://doi.org/10.1029/2023JF007192) | `bedrock` | 2012353, 2012357 |
| 27 | 2023 | paper | [The geophysical toolbox applied to forest ecosystems – A review](https://doi.org/10.1016/j.scitotenv.2023.165503) | `bedrock`, `dynamic-water` | 2012353, 2012408, 2012730 |
| 28 | 2022 | paper | [Forest vulnerability to drought controlled by bedrock composition](https://doi.org/10.1038/s41561-022-01012-2) | `bedrock` | 2012357 |
| 29 | 2022 | paper | [Geostatistical Rock Physics Inversion for Predicting the Spatial Distribution of Porosity and Saturation in the Critical Zone](https://doi.org/10.1007/s11004-022-10006-0) | `bedrock` | 2012357 |
| 30 | 2022 | paper | [Groundwater Affects the Geomorphic and Hydrologic Properties of Coevolved Landscapes](https://doi.org/10.1029/2021JF006239) | `bedrock` | 2012264, 2012353 |
| 31 | 2022 | paper | [What Do P-Wave Velocities Tell Us About the Critical Zone?](https://doi.org/10.3389/frwa.2021.772185) | `bedrock` | 2012353 |
| 32 | 2021 | paper | [3D Seismic Anatomy of a Watershed Reveals Climate‐Topography Coupling That Drives Water Flowpaths and Bedrock Weathering](https://doi.org/10.1029/2021JF006281) | `bedrock` | 1239285, 1331726, 2012073 |
| 33 | 2021 | paper | [Anisovolumetric weathering in granitic saprolite controlled by climate and erosion rate](https://doi.org/10.1130/G48191.1) | `bedrock` | 2012316, 2012357 |
| 34 | 2021 | paper | [Matrix Diffusion as a Mechanism Contributing to Fractal Stream Chemistry and Long‐Tailed Transit Time Distributions](https://doi.org/10.1029/2021GL094292) | `bedrock` | 2012264, 2012353 |
| 35 | 2021 | paper | [Quantifying Depth‐Dependent Seismic Anisotropy in the Critical Zone Enhanced by Weathering of a Piedmont Schist](https://doi.org/10.1029/2021jf006289) | `bedrock` | 2012353 |
| 36 | 2021 | paper | [Quantitative analysis of hillshed geomorphology and critical zone function: Raising the hillshed to watershed status](https://doi.org/10.1130/B35724.1) | `bedrock` | 2012073, 2012353 |
| 37 | 2021 | paper | [Sediment size on talus slopes correlates with fracture spacing on bedrock cliffs: implications for predicting initial sediment size distributions on hillslopes](https://doi.org/10.5194/esurf-9-1073-2021) | `bedrock` | 2012353, 2012357 |
| 38 | 2021 | paper | [Seismic Imaging of a Shale Landscape Under Compression Shows Limited Influence of Topography‐Induced Fracturing](https://doi.org/10.1029/2021GL093372) | `bedrock` | 2012073 |

### Big Data (`bigdata`): 60

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | dataset | [Illilouette Creek Basin Distributed Shallow Soil Moisture 2014-2020](https://doi.org/10.4211/hs.f789950ed4af4434a7a256506fa3709c) | `bigdata` | 2011346 |
| 2 | 2026 | dataset | [Kansas River Flow Event Characteristics and Nitrate C-Q Responses](https://doi.org/10.4211/hs.d68fbf42b90f4ca2917c14b7e13f949f) | `bigdata` | 2012123 |
| 3 | 2026 | paper | [Landscape and Storm Characteristics Influence DOC and Nitrate Mobility and Riverine Export Magnitude in Two Arctic Catchments](https://doi.org/10.1029/2025jg009594) | `bigdata` | 2012123 |
| 4 | 2026 | paper | [Reservoir releases and land cover interact to drive event-scale nitrate export in a large agricultural basin](https://doi.org/10.1016/j.jhydrol.2026.136177) | `bigdata` | 2012080 |
| 5 | 2025 | paper | [Forest regrowth impacts on high-resolution snowpack modeling: A proof-of-concept in a Mediterranean montane catchment](https://doi.org/10.1016/j.jhydrol.2025.133426) | `bigdata`, `dynamic-water` | 2011346, 2012188, 2012310, 2012821 |
| 6 | 2025 | dataset | [Illilouette Creek Basin Weather Stations](https://doi.org/10.4211/hs.693e58d1f40b4b97bc942df56bb16077) | `bigdata` | 2011346 |
| 7 | 2025 | paper | [Improving model calibrations in a changing world: controlling for nonstationarity after mega disturbance reduces hydrological uncertainty](https://doi.org/10.5194/hess-29-6333-2025) | `bigdata`, `dynamic-water` | 2011346, 2012310 |
| 8 | 2025 | paper | [James Buttle Review: Dynamic Water Storage Shapes Critical Zone Function in Snow‐Dominated Mountain Watersheds](https://doi.org/10.1002/hyp.70325) | `bigdata`, `dynamic-water` | 2012188, 2012310, 2012669, 2012796, 2012821 |
| 9 | 2025 | dataset | [Measurements of Soil Moisture, Infiltration, and Hydrophobicity in Yosemite National Park Across Differing Fire Histories](https://doi.org/10.4211/hs.4022c4ec99224449b8c974657a332ac1) | `bigdata` | 2011346 |
| 10 | 2025 | paper | [Place as context, place as inquiry: A phenomenographic study of teachers’ conceptions of place-based education in the CZ-CREST program](https://doi.org/10.1080/10899995.2025.2530763) | `bigdata` | 2012080 |
| 11 | 2025 | paper | [Restoring Historic Forest Disturbance Frequency Would Partially Mitigate Droughts in the Central Sierra Nevada Mountains](https://doi.org/10.1029/2024WR039227) | `bigdata`, `dynamic-water` | 2012188, 2012310 |
| 12 | 2025 | paper | [TransNAS-TSAD: harnessing transformers for multi-objective neural architecture search in time series anomaly detection](https://doi.org/10.1007/s00521-024-10759-1) | `bigdata` | 2012123 |
| 13 | 2024 | paper | [A Flood of New Water Cycle Resources](https://doi.org/10.1525/abt.2024.86.4.242) | `bigdata` | 2011439 |
| 14 | 2024 | paper | [An automated machine learning approach for detecting anomalous peak patterns in time series data from a research watershed in the northeastern United States critical zone](https://doi.org/10.1016/j.mlwa.2024.100543) | `bigdata` | 2012123 |
| 15 | 2024 | paper | [Assessing changes in global fire regimes](https://doi.org/10.1186/s42408-023-00237-9) | `bigdata` | 2011439 |
| 16 | 2024 | software | [BrynStewart/BioRT-HBV_W9_20162017: BioRTHBV_W9_Files](https://doi.org/10.5281/zenodo.10583215) | `bigdata` | 2012123 |
| 17 | 2024 | paper | [CAMELS-Chem: augmenting CAMELS (Catchment Attributes and Meteorology for Large-sample Studies) with atmospheric and stream water chemistry data](https://doi.org/10.5194/hess-28-611-2024) | `bigdata` | 2012123, 2012188 |
| 18 | 2024 | paper | [Illuminating the “Invisible”: Substantial Deep Respiration and Lateral Export of Dissolved Carbon From Beneath Soil](https://doi.org/10.1029/2023WR035940) | `bigdata` | 2012123 |
| 19 | 2024 | paper | [Impact of Peat Extraction on Downstream Concentrations and Attenuation of Dissolved Organic Carbon and Nutrients](https://doi.org/10.1029/2024WR037397) | `bigdata` | 2011439 |
| 20 | 2024 | paper | [Lidar-Derived Forest Metrics Predict Snow Accumulation and Ablation in the Central Sierra Nevada, USA](https://doi.org/10.22541/au.171799893.36954583/v1) | `bigdata` | 2011346 |
| 21 | 2024 | paper | [Relationships between snowpack, low flows and stream temperature in mountain watersheds of the US west coast](https://doi.org/10.1002/hyp.15157) | `bigdata`, `dynamic-water` | 2011346, 2012188, 2012310, 2012821 |
| 22 | 2024 | paper | [River water quality shaped by land–river connectivity in a changing climate](https://doi.org/10.1038/s41558-023-01923-x) | `bigdata`, `dynamic-water` | 2012123, 2012669, 2012796 |
| 23 | 2024 | paper | [Soil temperature and moisture as key controls of phosphorus export in mountain watersheds](https://doi.org/10.1016/j.scitotenv.2024.170958) | `bigdata` | 2011439 |
| 24 | 2024 | paper | [Solute export patterns across the contiguous USA](https://doi.org/10.1002/hyp.15197) | `bigdata` | 2012080, 2012123 |
| 25 | 2023 | paper | [Catchment concentration–discharge relationships across temporal scales: A review](https://doi.org/10.1002/wat2.1702) | `bigdata` | 2012123 |
| 26 | 2023 | paper | [Complex Drivers of Riparian Soil Oxygen Variability Revealed Using Self‐Organizing Maps](https://doi.org/10.1029/2022WR034022) | `bigdata` | 2012123 |
| 27 | 2023 | paper | [Deep denitrification: Stream and groundwater biogeochemistry reveal contrasted but connected worlds above and below](https://doi.org/10.1016/j.scitotenv.2023.163178) | `bigdata` | 2011439, 2012123 |
| 28 | 2023 | paper | [Disentangling the responses of dissolved organic carbon and nitrogen concentrations to overlapping drivers in a northeastern United States forested watershed](https://doi.org/10.3389/frwa.2023.1065300) | `bigdata` | 2012080, 2012123 |
| 29 | 2023 | paper | [Equity, Diversity, and Community as the Basis for Critical Zone Science and Education](https://doi.org/10.1029/2022EF002812) | `bigdata` | 2012123 |
| 30 | 2023 | paper | [Low hyporheic denitrification in headwater streams revealed by nutrient injections and in situ gas measurements](https://doi.org/10.1016/j.jhydrol.2023.130328) | `bigdata` | 2011439 |
| 31 | 2023 | paper | [Machine‐Learning Reveals Equifinality in Drivers of Stream DOC Concentration at Continental Scales](https://doi.org/10.1029/2021WR030551) | `bigdata` | 2012123 |
| 32 | 2023 | paper | [Model-Based Clustering of Trends and Cycles of Nitrate Concentrations in Rivers Across France](https://doi.org/10.1007/s13253-022-00513-2) | `bigdata` | 2011439 |
| 33 | 2023 | paper | [Overshooting tipping points: Thresholds and impacts](https://doi.org/10.1016/j.oneear.2023.11.015) | `bigdata` | 2011439 |
| 34 | 2023 | paper | [Physical and biogeochemical drivers of solute mobilization and flux through the critical zone after wildfire](https://doi.org/10.3389/frwa.2023.1148298) | `bigdata` | 2012123 |
| 35 | 2023 | paper | [Revisiting the Origins of the Power‐Law Analysis for the Assessment of Concentration‐Discharge Relationships](https://doi.org/10.1029/2023WR034910) | `bigdata` | 2012123 |
| 36 | 2023 | paper | [Seeing the Disturbed Forest for the Trees: Remote Sensing Is Underutilized to Quantify Critical Zone Response to Unprecedented Disturbance](https://doi.org/10.1029/2022ef003314) | `bigdata`, `dynamic-water` | 2011346, 2012669 |
| 37 | 2023 | paper | [The meanings of the Critical Zone](https://doi.org/10.1016/j.ancene.2023.100377) | `bigdata` | 2011439 |
| 38 | 2023 | paper | [The Music of Rivers: The Mathematics of Waves Reveals Global Structure and Drivers of Streamflow Regime](https://doi.org/10.1029/2023WR034484) | `bigdata` | 2011439, 2012123 |
| 39 | 2022 | paper | [Climate Controls on River Chemistry](https://doi.org/10.1029/2021EF002603) | `bigdata`, `dynamic-water` | 2012123, 2012310 |
| 40 | 2022 | paper | [Fire return intervals explain different vegetation cover responses to wildfire restoration in two Sierra Nevada basins](https://doi.org/10.1016/j.foreco.2022.120429) | `bigdata` | 2011346 |
| 41 | 2022 | paper | [Illuminating the ‘invisible water crisis’ to address global water pollution challenges](https://doi.org/10.1002/hyp.14525) | `bigdata` | 2011439 |
| 42 | 2022 | paper | [Improving sustainable agriculture promotion: an explorative analysis of NRCS assistance programs and farmer perspectives](https://doi.org/10.1080/14735903.2022.2056997) | `bigdata` | 2011439 |
| 43 | 2022 | paper | [Organizational Principles of Hyporheic Exchange Flow and Biogeochemical Cycling in River Networks Across Scales](https://doi.org/10.1029/2021WR029771) | `bigdata` | 2011439 |
| 44 | 2022 | paper | [Soil CO 2 Controls Short‐Term Variation but Climate Regulates Long‐Term Mean of Riverine Inorganic Carbon](https://doi.org/10.1029/2022gb007351) | `bigdata`, `dynamic-water` | 2012123, 2012669 |
| 45 | 2022 | paper | [Soil type modifies the impacts of warming and snow exclusion on leachate carbon and nutrient losses](https://doi.org/10.1007/s10533-022-00949-1) | `bigdata` | 2012123 |
| 46 | 2022 | paper | [Streams as Mirrors: Reading Subsurface Water Chemistry From Stream Chemistry](https://doi.org/10.1029/2021WR029931) | `bigdata` | 2012123 |
| 47 | 2022 | paper | [Tandem Use of Multiple Tracers and Metrics to Identify Dynamic and Slow Hydrological Flowpaths](https://doi.org/10.3389/frwa.2022.841144) | `bigdata` | 2012123 |
| 48 | 2022 | paper | [Using dissolved organic matter fluorescence to predict total mercury and methylmercury in forested headwater streams, Sleepers River, Vermont USA](https://doi.org/10.1002/hyp.14572) | `bigdata` | 2012123 |
| 49 | 2022 | paper | [Winter runoff events pose an unquantified continental-scale risk of high wintertime nutrient export](https://doi.org/10.1088/1748-9326/ac8be5) | `bigdata` | 2012080, 2012123 |
| 50 | 2021 | paper | [Diné citizen science: Phytoremediation of uranium and arsenic in the Navajo Nation](https://doi.org/10.1016/j.scitotenv.2021.148665) | `bigdata` | 2011439 |
| 51 | 2021 | paper | [Drivers of Dissolved Organic Carbon Mobilization From Forested Headwater Catchments: A Multi Scaled Approach](https://doi.org/10.3389/frwa.2021.578608) | `bigdata` | 2012123 |
| 52 | 2021 | paper | [Event Scale Relationships of DOC and TDN Fluxes in Throughfall and Stemflow Diverge From Stream Exports in a Forested Catchment](https://doi.org/10.1029/2021JG006281) | `bigdata` | 2012123 |
| 53 | 2021 | paper | [Fire, water, and biodiversity in the Sierra Nevada: a possible triple win](https://doi.org/10.1088/2515-7620/ac17e2) | `bigdata` | 2011346 |
| 54 | 2021 | paper | [Hydrological benefits of restoring wildfire regimes in the Sierra Nevada persist in a warming climate](https://doi.org/10.1016/j.jhydrol.2020.125808) | `bigdata` | 2011346 |
| 55 | 2021 | paper | [Limited progress in nutrient pollution in the U.S. caused by spatially persistent nutrient sources](https://doi.org/10.1371/journal.pone.0258952) | `bigdata` | 2011439 |
| 56 | 2021 | paper | [Long‐Term Nitrate Trajectories Vary by Season in Western European Catchments](https://doi.org/10.1029/2021GB007050) | `bigdata` | 2011439 |
| 57 | 2021 | paper | [Megafire affects stream sediment flux and dissolved organic matter reactivity, but land use dominates nutrient dynamics in semiarid watersheds](https://doi.org/10.1371/journal.pone.0257733) | `bigdata` | 2011439 |
| 58 | 2021 | paper | [Scientists' warning on extreme wildfire risks to water supply](https://doi.org/10.1002/hyp.14086) | `bigdata` | 2011346 |
| 59 | 2021 | paper | [Spatial Persistence of Water Chemistry Patterns Across Flow Conditions in a Mesoscale Agricultural Catchment](https://doi.org/10.1029/2020WR029053) | `bigdata` | 2011439 |
| 60 | 2021 | paper | [What do we need to predict groundwater nitrate recovery trajectories?](https://doi.org/10.1016/j.scitotenv.2021.147661) | `bigdata` | 2011439 |

### CINet (`cinet`): 33

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2025 | paper | [Empirical Evidence of Dynamic Hydrogeomorphic Feature Inundation in a Lowland Floodplain](https://doi.org/10.1002/hyp.70043) | `cinet` | 2012850 |
| 2 | 2025 | paper | [Evaluating Change in the Prevalence of River Anabranching Before and After Agricultural Development in the Upper Midwest, United States](https://doi.org/10.1080/24694452.2025.2502630) | `cinet` | 2012850 |
| 3 | 2025 | paper | [Evaluation of Human Impact on Sediment Dynamics in an Intensively Managed Agricultural Watershed Using Distributed Modeling](https://doi.org/10.1002/rra.4458) | `cinet` | 2012850 |
| 4 | 2025 | paper | [Form and Function of Floodplain Secondary Channels in a Lowland Meandering River System](https://doi.org/10.1029/2024JF007871) | `cinet` | 2012850 |
| 5 | 2025 | paper | [Impacts of geographic variability and geologic history on the distribution of post-settlement alluvium (PSA) across the upper Midwest, USA](https://doi.org/10.1016/j.catena.2025.108939) | `cinet` | 2012850 |
| 6 | 2025 | paper | [Improving Stream Solute Predictions With a Modified LSTM Model Incorporating Solute Interdependences and Hysteresis Patterns](https://doi.org/10.1029/2024JH000383) | `cinet` | 2012850 |
| 7 | 2025 | paper | [Molecular-level exploration of spatiotemporal dynamics of fluvial particulate organic carbon sources during storm events: Using a high-temporal resolution multi-biomarker approach](https://doi.org/10.1016/j.scitotenv.2025.178447) | `cinet` | 2012850 |
| 8 | 2025 | paper | [Spatial heterogeneity of agricultural evapotranspiration as quantified by satellite and flux tower sources](https://doi.org/10.1016/j.agrformet.2025.110608) | `cinet` | 2012850 |
| 9 | 2025 | paper | [Timescales of Drainage Network Evolution Revealed: Spatiotemporal Variability in Drainage Density in the Post-Glacial Central Lowlands, USA](https://doi.org/10.2475/001c.129219) | `cinet` | 2012850 |
| 10 | 2024 | paper | [Causal Drivers of Land‐Atmosphere Carbon Fluxes From Machine Learning Models and Data](https://doi.org/10.1029/2023jg007815) | `cinet` | 2012850 |
| 11 | 2024 | paper | [Complex Connections: How Information Flow Networks Can Quantify Ecohydrological Interactions](https://doi.org/10.33548/SCIENTIA1137) | `cinet` | 2012850 |
| 12 | 2024 | paper | [Sensitivity of a meandering lowland river to intensive landscape management: Lateral migration rates before and after watershed-scale agricultural development](https://doi.org/10.1016/j.ancene.2024.100429) | `cinet` | 2012850 |
| 13 | 2023 | paper | [Causal interaction in high frequency turbulence at the biosphere–atmosphere interface: Structure–function coupling](https://doi.org/10.1063/5.0131469) | `cinet` | 2012850 |
| 14 | 2023 | paper | [Emergent role of critical interfaces in the dynamics of intensively managed landscapes](https://doi.org/10.1016/j.earscirev.2023.104543) | `cinet` | 2012850 |
| 15 | 2023 | paper | [Estimation of hydraulic conductivity in a watershed using sparse multi-source data via Gaussian process regression and Bayesian experimental design](https://doi.org/10.1016/j.advwatres.2023.104489) | `cinet` | 2012850 |
| 16 | 2023 | paper | [Inside the flux footprint: The role of organized land cover heterogeneity on the dynamics of observed land-atmosphere exchange fluxes](https://doi.org/10.3389/frwa.2023.1033973) | `cinet` | 2012850 |
| 17 | 2023 | paper | [Storm pulse responses of fluvial organic carbon to seasonal source supply and transport controls in a midwestern agricultural watershed](https://doi.org/10.1016/j.scitotenv.2023.161647) | `cinet` | 2012850 |
| 18 | 2022 | paper | [Advances in Biogeochemical Modeling for Intensively Managed Landscapes](https://doi.org/10.1007/978-3-030-95921-0_6) | `cinet` | 2012850 |
| 19 | 2022 | paper | [An information theory-based approach to characterize drivers of upstream salmon migration](https://doi.org/10.1371/journal.pone.0269193) | `cinet` | 2012850 |
| 20 | 2022 | paper | [Antecedent Conditions Control Thresholds of Tile‐Runoff Generation and Nitrogen Export in Intensively Managed Landscapes](https://doi.org/10.1029/2021WR030507) | `cinet` | 2012850 |
| 21 | 2022 | paper | [Big Pine Creek Ditch revisited: Planform recovery to channelization and the timescale of river meandering](https://doi.org/10.1016/j.geomorph.2022.108140) | `cinet` | 2012850 |
| 22 | 2022 | paper | [Eroded Critical Zone Carbon and Where to Find It: Examples from the IML-CZO](https://doi.org/10.1007/978-3-030-95921-0_5) | `cinet` | 2012850 |
| 23 | 2022 | paper | [REWTCrunch: A Modeling Framework for Vegetation Induced Reactive Zone Processes in the Critical Zone](https://doi.org/10.1029/2021JG006562) | `cinet` | 2012850 |
| 24 | 2022 | paper | [Soil health: Meaning, measurement, and value through a critical zone lens](https://doi.org/10.2489/jswc.2022.00042) | `cinet` | 2012850 |
| 25 | 2022 | paper | [Source Relationships and Model Structures Determine Information Flow Paths in Ecohydrologic Models](https://doi.org/10.1029/2021WR031164) | `cinet` | 2012850 |
| 26 | 2022 | paper | [Thermodynamic basis for the demarcation of Arctic and alpine treelines](https://doi.org/10.1038/s41598-022-16462-2) | `cinet` | 2012850 |
| 27 | 2022 | paper | [Virtual laboratory for understanding impact of heterogeneity on ecohydrologic processes across scales](https://doi.org/10.1016/j.envsoft.2021.105283) | `cinet` | 2012850 |
| 28 | 2021 | paper | [Chains of Spatial and Temporal Precipitation Occurrence Predictability Across the Continental U.S.](https://doi.org/10.3389/fclim.2021.780879) | `cinet` | 2012850 |
| 29 | 2021 | paper | [Convergent Hydraulic Redistribution and Groundwater Access Supported Facilitative Dependency Between Trees and Grasses in a Semi‐Arid Environment](https://doi.org/10.1029/2020WR028103) | `cinet` | 2012850 |
| 30 | 2021 | paper | [Impacts of Landscape Evolution on Heterotrophic Carbon Loss in Intensively Managed Landscapes](https://doi.org/10.3389/frwa.2021.666278) | `cinet` | 2012850 |
| 31 | 2021 | paper | [Magnetic Fly Ash as a Chronological Marker in Post-Settlement Alluvial and Lacustrine Sediment: Examples from North Carolina and Illinois](https://doi.org/10.3390/min11050476) | `cinet` | 2012850 |
| 32 | 2021 | paper | [The Spatiotemporal Evolution of Storm Pulse Particulate Organic Carbon in a Low Gradient, Agriculturally Dominated Watershed](https://doi.org/10.3389/frwa.2021.600649) | `cinet` | 2012850 |
| 33 | 2020 | paper | [“It’s Raining Bits”: Patterns in Directional Precipitation Persistence across the United States](https://doi.org/10.1175/JHM-D-20-0134.1) | `cinet` | 2012850 |

### Coastal (`coastal`): 54

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | paper | [Drivers of Spatial Change in Seagrass Carbon Stock Amid Shifting Species Dominance](https://doi.org/10.1007/s10021-026-01118-3) | `coastal` | 2012670 |
| 2 | 2026 | paper | [Identifying early-stage biogeochemical changes with IRIS films in coastal ecosystems impacted by sea-level rise and saltwater intrusion](https://doi.org/10.1016/j.jenvman.2026.130952) | `coastal` | 2012484 |
| 3 | 2026 | paper | [Investigating Coastal Vegetation Dynamics and Ecosystem Impacts Under Elevated CO 2 and Temperature: A Process‐Based Approach](https://doi.org/10.1029/2025JG009305) | `coastal` | 2012670 |
| 4 | 2026 | paper | [Land use influences dissolved organic matter composition in the U.S. Coastal Critical Zone Network](https://doi.org/10.1007/s00027-026-01311-5) | `coastal` | 2012484 |
| 5 | 2026 | paper | [Limited impacts of storms on mid-Atlantic coastal forests](https://doi.org/10.1016/j.agrformet.2026.111094) | `coastal` | 2012670 |
| 6 | 2026 | paper | [Marsh Migration Into Forests and Farms: Effects on Soil Biogeochemistry Along the Salinity Gradients](https://doi.org/10.1029/2025jg009149) | `coastal` | 2012484 |
| 7 | 2026 | paper | [Pre-storm hydrology buffers saltwater intrusion in coastal forests](https://doi.org/10.1016/j.jhydrol.2026.135315) | `coastal` | 2012322 |
| 8 | 2026 | paper | [Sea-level-driven land conversion amplified by coastal agriculture](https://doi.org/10.1038/s41893-026-01835-6) | `coastal` | 2012670 |
| 9 | 2026 | paper | [Seasonal Hydrology at the Salt Marsh‐Upland Interface](https://doi.org/10.1029/2025JG009297) | `coastal` | 2012670 |
| 10 | 2025 | paper | [Drivers of Elevation Change in a Retreating Coastal Forest](https://doi.org/10.1007/s12237-025-01624-y) | `coastal` | 2012484 |
| 11 | 2025 | paper | [Ecosystem structure and salinity thresholds in retreating coastal forests along the Mid-Atlantic, USA](https://doi.org/10.1007/s10584-025-03948-x) | `coastal` | 2012670 |
| 12 | 2025 | paper | [Feedbacks Regulating the Salinization of Coastal Landscapes](https://doi.org/10.1146/annurev-marine-070924-031447) | `coastal` | 2011941, 2012319 |
| 13 | 2025 | paper | [Implications of waterfowl impoundments as a response to sea-level driven saltwater intrusion](https://doi.org/10.1016/j.jenvman.2025.127567) | `coastal` | 2012484 |
| 14 | 2025 | paper | [Modeling the mechanisms of coastal vegetation dynamics and ecosystem responses to changing water levels](https://doi.org/10.5194/bg-22-6963-2025) | `coastal` | 2012670 |
| 15 | 2025 | paper | [Mudflat Biostabilization Alters Coastal Landscape Sediment Connectivity](https://doi.org/10.1029/2024JG008500) | `coastal` | 2012670 |
| 16 | 2025 | paper | [Plant competition dominates grass species interactions in a migrating marsh-forest ecotone](https://doi.org/10.1016/j.ecochg.2025.100095) | `coastal` | 2012319 |
| 17 | 2025 | paper | [Salinization of inland waters](https://doi.org/10.1016/B978-0-323-99762-1.00042-5) | `coastal` | 2011941 |
| 18 | 2025 | paper | [Terrestrial Groundwater Drives Coastal Ecosystem Shifts](https://doi.org/10.1029/2025gl116251) | `coastal` | 2012322, 2012484 |
| 19 | 2025 | paper | [The Ecohydrology of Coastal Ghost Forests](https://doi.org/10.1002/eco.70020) | `coastal` | 2012322, 2012484 |
| 20 | 2025 | paper | [Tradeoffs Between Vertical and Lateral Resilience in a Salt Marsh Restoration Model](https://doi.org/10.1029/2025jg009145) | `coastal` | 2012670 |
| 21 | 2024 | paper | [A grazing crab drives saltmarsh carbon storage and recovery](https://doi.org/10.1002/ecy.4385) | `coastal` | 2012670 |
| 22 | 2024 | paper | [Early detection of invasive Phragmites australis at the tidal marsh-forest ecotone with airborne LiDAR](https://doi.org/10.1016/j.ecolind.2024.112651) | `coastal` | 2012670 |
| 23 | 2024 | paper | [Evapotranspiration and Rainfall Effects on Post‐Storm Salinization of Coastal Forests: Soil Characteristics as Important Factor for Salt‐Intolerant Tree Survival](https://doi.org/10.1029/2024WR037907) | `coastal` | 2012322 |
| 24 | 2024 | paper | [Factors controlling spatiotemporal variability of soil carbon accumulation and stock estimates in a tidal salt marsh](https://doi.org/10.5194/bg-21-2367-2024) | `coastal` | 2012484 |
| 25 | 2024 | paper | [Initial soil moisture and soil texture control the impact of storm surges in coastal forests](https://doi.org/10.1016/j.scitotenv.2024.175911) | `coastal` | 2012322 |
| 26 | 2024 | paper | [Litter Decomposition in Retreating Coastal Forests](https://doi.org/10.1007/s12237-024-01358-3) | `coastal` | 2012670 |
| 27 | 2024 | paper | [Marine Transgression in Modern Times](https://doi.org/10.1146/annurev-marine-022123-103802) | `coastal` | 2012670 |
| 28 | 2024 | paper | [Microtopographic Variation as a Potential Early Indicator of Ecosystem State Change and Vulnerability in Salt Marshes](https://doi.org/10.1007/s12237-024-01368-1) | `coastal` | 2012670 |
| 29 | 2024 | paper | [Saltwater intrusion and sea level rise threatens U.S. rural coastal landscapes and communities](https://doi.org/10.1016/j.ancene.2024.100427) | `coastal` | 2011941 |
| 30 | 2024 | paper | [Shifts in light availability driven by dieback across a marsh‐forest gradient](https://doi.org/10.1002/ecs2.70021) | `coastal` | 2012322 |
| 31 | 2024 | paper | [Storm Surges and Sea Level Rise Cluster Hydrological Variables Across a Coastal Forest Bordering a Salt Marsh](https://doi.org/10.1029/2022WR033931) | `coastal` | 2012322 |
| 32 | 2023 | paper | [Biophysical Drivers of Coastal Treeline Elevation](https://doi.org/10.1029/2023JG007525) | `coastal` | 2012670 |
| 33 | 2023 | paper | [Climate-driven tradeoffs between landscape connectivity and the maintenance of the coastal carbon sink](https://doi.org/10.1038/s41467-023-36803-7) | `coastal` | 2012670 |
| 34 | 2023 | paper | [Compensatory Mechanisms Absorb Regional Carbon Losses Within a Rapidly Shifting Coastal Mosaic](https://doi.org/10.1007/s10021-023-00877-7) | `coastal` | 2012670 |
| 35 | 2023 | paper | [Experimentally simulated sea level rise destabilizes carbon-mineral associations in temperate tidal marsh soil](https://doi.org/10.1007/s10533-023-01024-z) | `coastal` | 2012484 |
| 36 | 2023 | paper | [Frequent Storm Surges Affect the Groundwater of Coastal Ecosystems](https://doi.org/10.1029/2022GL100191) | `coastal` | 2012322, 2012670 |
| 37 | 2023 | paper | [Geomorphic and ecological constraints on the coastal carbon sink](https://doi.org/10.1038/s43017-023-00429-6) | `coastal` | 2012670 |
| 38 | 2023 | paper | [Hidden vulnerability of US Atlantic coast to sea-level rise due to vertical land motion](https://doi.org/10.1038/s41467-023-37853-7) | `coastal` | 2012670 |
| 39 | 2023 | paper | [Modeling the mechanisms of conifer mortality under seawater exposure](https://doi.org/10.1111/nph.19076) | `coastal` | 2012670 |
| 40 | 2023 | paper | [Physiochemical Controls on the Horizontal Exchange of Blue Carbon Across the Salt Marsh‐Tidal Channel Interface](https://doi.org/10.1029/2023jg007404) | `coastal` | 2012484 |
| 41 | 2023 | paper | [Sediment Exchange Across Coastal Barrier Landscapes Alters Ecosystem Extents](https://doi.org/10.1029/2023gl103680) | `coastal` | 2012322 |
| 42 | 2023 | paper | [Shoreface erosion counters blue carbon accumulation in transgressive barrier-island systems](https://doi.org/10.1038/s41467-023-42942-8) | `coastal` | 2012670 |
| 43 | 2023 | paper | [Upland forest retreat lags behind sea‐level rise in the mid‐Atlantic coast](https://doi.org/10.1111/gcb.17081) | `coastal` | 2012670 |
| 44 | 2022 | paper | [A phenology- and trend-based approach for accurate mapping of sea-level driven coastal forest retreat](https://doi.org/10.1016/j.rse.2022.113229) | `coastal` | 2012670 |
| 45 | 2022 | paper | [Climate-driven decoupling of wetland and upland biomass trends on the mid-Atlantic coast](https://doi.org/10.1038/s41561-022-01041-x) | `coastal` | 2012670 |
| 46 | 2022 | paper | [Groundwater, soil moisture, light and weather data collected in a coastal forest bordering a salt marsh in the Delmarva Peninsula (VA)](https://doi.org/10.1016/j.dib.2022.108584) | `coastal` | 2012322 |
| 47 | 2022 | paper | [Hidden levees: Small-scale flood defense on rural coasts](https://doi.org/10.1016/j.ancene.2022.100350) | `coastal` | 2012670 |
| 48 | 2022 | paper | [Hyperspectral Reflectance for Measuring Canopy‐Level Nutrients and Photosynthesis in a Salt Marsh](https://doi.org/10.1029/2022jg007088) | `coastal` | 2012484 |
| 49 | 2022 | paper | [Influence of Climate and Coastal Flooding on Eastern Red Cedar Growth along a Marsh-Forest Ecotone](https://doi.org/10.3390/f13060862) | `coastal` | 2012484 |
| 50 | 2022 | paper | [Processes and mechanisms of coastal woody‐plant mortality](https://doi.org/10.1111/gcb.16297) | `coastal` | 2012670 |
| 51 | 2022 | paper | [RETRACTED: Temperature optimum for marsh resilience and carbon accumulation revealed in a whole‐ecosystem warming experiment](https://doi.org/10.1111/gcb.16149) | `coastal` | 2012670 |
| 52 | 2022 | paper | [Salinity increases with water table elevation at the boundary between salt marsh and forest](https://doi.org/10.1016/j.jhydrol.2022.127576) | `coastal` | 2012322 |
| 53 | 2022 | paper | [Variability in marsh migration potential determined by topographic rather than anthropogenic constraints in the Chesapeake Bay region](https://doi.org/10.1002/lol2.10262) | `coastal` | 2012670 |
| 54 | 2022 | paper | [Vertical Saltwater Intrusion in Coastal Aquifers Driven by Episodic Flooding: A Review](https://doi.org/10.1029/2022WR032614) | `coastal` | 2012484 |

### Drylands (`drylands`): 11

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | paper | [A Machine Learning‐Based High‐Resolution Inventory of Soil Inorganic Carbon Across the Contiguous United States](https://doi.org/10.1029/2025gl120355) | `drylands` | 2012475 |
| 2 | 2026 | dataset | [Data and imagery associated with "Mapping scytonemin pigment content and biocrust functional indicators using high-resolution multispectral imagery"](https://doi.org/10.5281/zenodo.19698293) | `drylands`, `hub` | 2012475, 2012893 |
| 3 | 2026 | paper | [Dates and rates of loess deposition and soil formation on the Snake River Plain, Idaho, USA](https://doi.org/10.1130/B38703.1) | `drylands` | 2012475 |
| 4 | 2026 | dataset | [Dryland critical zone project: Soil gas (CO2) data in an irrigated pecan orchard of western Texas](https://doi.org/10.4211/hs.3e57747f832947038fca701b24eaf536) | `drylands` | 2012475 |
| 5 | 2026 | dataset | [Soil CO2 and O2 exchange at a bajada shrubland site on the Jornada Experimental Range, 2021-2025](https://doi.org/10.4211/hs.5b3e057e9264427c9fafa5d6305498f1) | `drylands` | 2012475 |
| 6 | 2026 | paper | [Triple Oxygen and Hydrogen Isotopes of Soil Water Across Climates, Seasons, and Depths](https://doi.org/10.1029/2026gc012921) | `drylands` | 2012475 |
| 7 | 2025 | paper | [Multi-scale influences on the fertile island effect: Landscape-scale and patch-level processes drive patterns of soil fertility in the Chihuahuan Desert](https://doi.org/10.1017/dry.2025.10004) | `drylands` | 2012475 |
| 8 | 2025 | paper | [Organic acid concentration thresholds to mobilize phosphorus (P) in dryland soils](https://doi.org/10.1007/s10533-025-01298-5) | `drylands` | 2012475 |
| 9 | 2025 | paper | [The Long-term Development of Wetland Plant Communities with Water Deliveries in a Created Wetland in the Desert Southwest](https://doi.org/10.1007/s13157-025-02000-z) | `drylands` | 2012475 |
| 10 | 2024 | paper | [Uranium-series and strontium isotope systematics in soil carbonates from dryland Critical Zones: Implications for soil inorganic carbon storage and transformation](https://doi.org/10.1016/j.gca.2024.05.020) | `drylands` | 2012475 |
| 11 | 2023 | paper | [Consistent microbial and nutrient resource island patterns during monsoon rain in a Chihuahuan Desert bajada shrubland](https://doi.org/10.1002/ecs2.4475) | `drylands` | 2012475 |

### Dust (`dust2`): 64

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | dataset | [Chemical availability of metals associated with Great Salt Lake dust from Farmington Bay](https://doi.org/10.4211/hs.0b1dbe5279b841f69383cfb4f03dbba2) | `dust2` | 2011910 |
| 2 | 2026 | paper | [Core microbiomes as a potential fingerprinting method of Western USA dust sources](https://doi.org/10.3389/fmicb.2026.1856083) | `dust2` | 2011910 |
| 3 | 2026 | paper | [Correction of PM 2.5 underestimation in low-cost sensors under elevated dust loading using only sensor measurements](https://doi.org/10.5194/amt-19-1077-2026) | `dust2` | 2012091 |
| 4 | 2026 | paper | [Darkened Snow Triggers Different Snowmelt Responses Over Contrasting Water Years in Great Salt Lake Headwater Basins](https://doi.org/10.1029/2025wr041598) | `dust2` | 2012091 |
| 5 | 2026 | dataset | [Data from the DUST^2 Project, collectors DUST-1 through DUST-18, Fall 2022 to Fall 2023](https://doi.org/10.60520/ieda/113846) | `dust2` | 2012082 |
| 6 | 2026 | dataset | [Data from the DUST^2 Project, collectors DUST-1 through DUST-19, Fall 2023 to Fall 2024, and collectors DUST-19 through DUST-20, Fall 2022 to Fall 2024](https://doi.org/10.60520/ieda/113847) | `dust2` | 2012082 |
| 7 | 2026 | paper | [Dust emission predictions in a semi-arid region with improved characterization of vegetation and salt crust coverage](https://doi.org/10.1016/j.aeolia.2026.101071) | `dust2` | 2011910 |
| 8 | 2026 | dataset | [Geochemical composition of cabbage tissues exposed to Great Salt Lake dust in a greenhouse experiment](https://doi.org/10.4211/hs.e8b770643ce940a68f899447464a2dce) | `dust2` | 2011910 |
| 9 | 2026 | dataset | [Geochemistry of dust from MWAC samples in Utah](https://doi.org/10.60520/ieda/113809) | `dust2` | 2012093 |
| 10 | 2026 | paper | [Identifying and addressing long-term Alphasense OPC-N3 sensor degradation](https://doi.org/10.5194/egusphere-2026-5266) | `dust2` | 2012091 |
| 11 | 2026 | paper | [Metal mobility and bioaccessibility in Great Salt Lake dust and exposure risks for humans and food crops](https://doi.org/10.1016/j.atmosenv.2026.121845) | `dust2` | 2011910 |
| 12 | 2026 | paper | [Mineral dust and the global critical zone](https://doi.org/10.1016/j.ecz.2025.100052) | `dust2` | 2012082 |
| 13 | 2026 | paper | [Performance evaluation of Plantower’s PMSX003N: Laboratory and field analysis](https://doi.org/10.1080/02786826.2026.2716649) | `dust2` | 2012091 |
| 14 | 2026 | paper | [Physical and Geochemical Characterization of Mineral Dust Samples Collected by the DUST^2 Project and Precursors, 2011–2025](https://doi.org/10.5194/essd-2026-423) | `dust2` | 2012082 |
| 15 | 2026 | paper | [Promoting critical zone science literacy through education and outreach](https://doi.org/10.1088/2515-7620/ae5ede) | `dust2` | 2012082 |
| 16 | 2025 | paper | [Combining modeling and isotopic signatures to track Aeolian dust from source to sink in the Wasatch Front, Utah, USA](https://doi.org/10.1016/j.aeolia.2024.100954) | `dust2` | 2012091, 2012093 |
| 17 | 2025 | paper | [Combining Submicron Spectroscopy Techniques (AFM-IR and O-PTIR) To Detect and Quantify Microplastics and Nanoplastics in Snow from a Utah Ski Resort](https://doi.org/10.1021/acs.est.4c12170) | `dust2` | 2011910 |
| 18 | 2025 | dataset | [Dataset from the article "Diverse dust sources and warming trigger cyanobacteria abundance in freshwater ecosystems in the western United States"](https://doi.org/10.5281/zenodo.14795961) | `dust2` | 2011910 |
| 19 | 2025 | paper | [Diverse dust sources and warming trigger cyanobacteria abundance in freshwater ecosystems in the western United States](https://doi.org/10.1016/j.envres.2025.121663) | `dust2` | 2011910 |
| 20 | 2025 | paper | [Dust on Snow Radiative Forcing and Contribution to Melt in the Colorado River Basin](https://doi.org/10.1029/2024GL112757) | `dust2` | 2012091 |
| 21 | 2025 | paper | [Experimental evidence of dust‐driven shifts in production, chlorophyll a , and community composition in mountain lakes](https://doi.org/10.1002/lno.70061) | `dust2` | 2011910 |
| 22 | 2025 | paper | [Halogen Production from Playa Dust Emitted from the Great Salt Lake: Implications of the Shrinking Great Salt Lake on Regional Air Quality](https://doi.org/10.1021/acsearthspacechem.4c00258) | `dust2` | 2012091 |
| 23 | 2025 | paper | [Identification of Dust-Dominated Periods and a PM 2.5 Correction Based Solely on Plantower PMS Sensor Observations](https://doi.org/10.5194/egusphere-2025-5063) | `dust2` | 2012091 |
| 24 | 2025 | paper | [Improved endmember mixing analysis (EMMA): Application to a snowmelt-dominated stream in northern Utah](https://doi.org/10.5194/egusphere-2025-2053) | `dust2` | 2012093 |
| 25 | 2025 | paper | [Mixing of natural and urban dust along the Wasatch Front of northern Utah, USA](https://doi.org/10.1038/s41598-025-88529-9) | `dust2` | 2012082, 2012091 |
| 26 | 2025 | paper | [Potential planetary health impacts of the airborne plastisphere](https://doi.org/10.1016/j.oneear.2025.101446) | `dust2` | 2011910 |
| 27 | 2025 | paper | [Quantifying Dust Nutrient Mobility Through an Alpine Watershed](https://doi.org/10.1029/2024JG008175) | `dust2` | 2011910 |
| 28 | 2025 | paper | [Two Decades of Dust Radiative Forcing on Snow Cover Across the Great Salt Lake Basin](https://doi.org/10.1029/2024jf007957) | `dust2` | 2012091 |
| 29 | 2025 | paper | [Water chemistry of Alaskan glacial rivers is affected by glacier coverage, bedrock type, and groundwater inputs](https://doi.org/10.3389/frwa.2025.1569267) | `dust2` | 2012091, 2012093 |
| 30 | 2024 | paper | [A cold laboratory hyperspectral imaging system to map grain size and ice layer distributions in firn cores](https://doi.org/10.5194/tc-18-1925-2024) | `dust2` | 2012091 |
| 31 | 2024 | paper | [Airborne lidar intensity correction for mapping snow cover extent and effective grain size in mountainous terrain](https://doi.org/10.1080/15481603.2024.2427326) | `dust2` | 2012091 |
| 32 | 2024 | paper | [Assessing the oxidative potential of dust from great salt Lake](https://doi.org/10.1016/j.atmosenv.2024.120728) | `dust2` | 2012091 |
| 33 | 2024 | paper | [Characterizing variability in geochemistry and mineralogy of western US dust sources](https://doi.org/10.1016/j.aeolia.2024.100941) | `dust2` | 2012091, 2012093 |
| 34 | 2024 | dataset | [CO02_GLV_DustNutrients](https://doi.org/10.5281/zenodo.14553406) | `dust2` | 2011910 |
| 35 | 2024 | paper | [Dust in the Critical Zone: North American case studies](https://doi.org/10.1016/j.earscirev.2024.104942) | `dust2`, `drylands` | 2011910, 2012067, 2012082, 2012091, 2012475 |
| 36 | 2024 | paper | [Ground-penetrating radar investigation of regolith thickness on a periglacial alpine summit flat, Uinta Mountains, Utah, USA](https://doi.org/10.1080/15230430.2024.2322334) | `dust2` | 2012082 |
| 37 | 2024 | paper | [Harmful dust from drying lakes: Preserving Great Salt Lake (USA) water levels decreases ambient dust and racial disparities in population exposure](https://doi.org/10.1016/j.oneear.2024.05.006) | `dust2` | 2012091 |
| 38 | 2024 | paper | [Mineral dust and pedogenesis in the alpine critical zone](https://doi.org/10.5194/soil-10-167-2024) | `dust2` | 2012082 |
| 39 | 2024 | paper | [Synoptic Analysis and WRF‐Chem Model Simulation of Dust Events in the Southwestern United States](https://doi.org/10.1029/2023JD040650) | `dust2` | 2012091 |
| 40 | 2024 | paper | [Toxic elements in benthic lacustrine sediments of Utah’s Great Salt Lake following a historic low in elevation](https://doi.org/10.3389/fsoil.2024.1445792) | `dust2` | 2012091 |
| 41 | 2024 | paper | [Trace element chemistry and strontium isotope ratios of atmospheric particulate matter reveal air quality impacts from mineral dust, urban pollution, and fireworks in the Wasatch Front, Utah, USA](https://doi.org/10.1016/j.apgeochem.2024.105906) | `dust2` | 2012067, 2012091, 2012093 |
| 42 | 2024 | paper | [Using mercury and lead stable isotopes to assess mercury, lead, and trace metal source contributions to Great Salt Lake, Utah, USA](https://doi.org/10.1016/j.scitotenv.2024.177374) | `dust2` | 2012091 |
| 43 | 2024 | paper | [Wildfire smoke impacts lake ecosystems](https://doi.org/10.1111/gcb.17367) | `dust2` | 2011910 |
| 44 | 2023 | dataset | [Dataset from "Dust storms increase the tolerance of phytoplankton to thermal and pH changes"](https://doi.org/10.5281/zenodo.10081891) | `dust2` | 2011910 |
| 45 | 2023 | paper | [Dust storms increase the tolerance of phytoplankton to thermal and pH changes](https://doi.org/10.1111/gcb.17055) | `dust2` | 2011910 |
| 46 | 2023 | paper | [Growth of grasses and forbs, nutrient concentration, and microbial activity in soil treated with microbeads](https://doi.org/10.1016/j.envpol.2023.121326) | `dust2` | 2011910 |
| 47 | 2023 | paper | [Laboratory evaluation of the Alphasense OPC-N3, and the Plantower PMS5003 and PMS6003 sensors](https://doi.org/10.1016/j.jaerosci.2023.106181) | `dust2` | 2012091 |
| 48 | 2023 | paper | [Multivariate receptor modeling with widely dispersed Lichens as bioindicators of air quality](https://doi.org/10.1002/env.2785) | `dust2` | 2012093 |
| 49 | 2023 | paper | [Performance evaluation of the Alphasense OPC-N3 and Plantower PMS5003 sensor in measuring dust events in the Salt Lake Valley, Utah](https://doi.org/10.5194/amt-16-2455-2023) | `dust2` | 2012091 |
| 50 | 2023 | paper | [Regional sources control dust in the mountain critical zone of the Great Basin and Rocky Mountains, USA](https://doi.org/10.1088/1748-9326/acfb26) | `dust2` | 2012067, 2012082 |
| 51 | 2023 | paper | [The shrinking Great Salt Lake contributes to record high dust-on-snow deposition in the Wasatch Mountains during the 2022 snowmelt season](https://doi.org/10.1088/1748-9326/acd409) | `dust2` | 2012091 |
| 52 | 2023 | paper | [UAV hyperspectral imaging for multiscale assessment of Landsat 9 snow grain size and albedo](https://doi.org/10.3389/frsen.2022.1038287) | `dust2` | 2012091 |
| 53 | 2022 | paper | [Heavy metal levels and sources in suspended particulate matters of the glacier watersheds in Northeast Tibetan Plateau](https://doi.org/10.3389/fenvs.2022.918514) | `dust2` | 2011910 |
| 54 | 2022 | paper | [Mapping liquid water content in snow at the millimeter scale: an intercomparison of mixed-phase optical property models using hyperspectral imaging and in situ measurements](https://doi.org/10.5194/tc-16-43-2022) | `dust2` | 2012091 |
| 55 | 2022 | paper | [Microplastics and nanoplastics in the marine-atmosphere environment](https://doi.org/10.1038/s43017-022-00292-x) | `dust2` | 2011910 |
| 56 | 2022 | paper | [Relation between regional drought and mountain dust deposition revealed by a 10-year record from an alpine critical zone](https://doi.org/10.1016/j.scitotenv.2022.156999) | `dust2` | 2012082 |
| 57 | 2022 | paper | [Sources and fate of atmospheric microplastics revealed from inverse and dispersion modelling: From global emissions to deposition](https://doi.org/10.1016/j.jhazmat.2022.128585) | `dust2` | 2011910 |
| 58 | 2022 | paper | [Strontium isotope dynamics reveal streamflow contributions from shallow flow paths during snowmelt in a montane watershed, Provo River, Utah, USA](https://doi.org/10.1002/hyp.14458) | `dust2` | 2012091, 2012093 |
| 59 | 2022 | paper | [Uranium isotopes of aeolian dust deposited in northern Tibetan Plateau glaciers: Implications for tracing aeolian dust provenance](https://doi.org/10.1016/j.fmre.2022.01.026) | `dust2` | 2011910 |
| 60 | 2022 | paper | [Uranium Isotopic Composition and Constraints on the Provenance of the Qinghai‐Tibet Plateau's Surface Dust](https://doi.org/10.1029/2021JF006480) | `dust2` | 2011910 |
| 61 | 2021 | paper | [Constraining the atmospheric limb of the plastic cycle](https://doi.org/10.1073/pnas.2020719118) | `dust2` | 2011910 |
| 62 | 2021 | paper | [In situ effective snow grain size mapping using a compact hyperspectral imager](https://doi.org/10.1017/jog.2020.68) | `dust2` | 2012091 |
| 63 | 2020 | paper | [Trace Element Export From the Critical Zone Triggered by Snowmelt Runoff in a Montane Watershed, Provo River, Utah, USA](https://doi.org/10.3389/frwa.2020.578677) | `dust2` | 2012091, 2012093 |
| 64 | 2020 | paper | [Using strontium isotopes to trace dust from a drying Great Salt Lake to adjacent urban areas and mountain snowpack](https://doi.org/10.1088/1748-9326/abbfc4) | `dust2` | 2012093 |

### Dynamic Water (`dynamic-water`): 74

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | dataset | [BioRT_HBV_SagehenFiles_20260226](https://doi.org/10.5281/zenodo.17485933) | `dynamic-water` | 2012669 |
| 2 | 2026 | paper | [Decadal Shifts Towards Higher Riverine Silicon Relative to Nitrogen and Phosphorus Across High Latitudes](https://doi.org/10.1029/2025gb008926) | `dynamic-water` | 2012796 |
| 3 | 2026 | dataset | [EcoTram below-canopy shortwave radiation observations and Lidar-to-Radiation (CanRad L2R) model products for subalpine forest at Niwot Ridge, Colorado, USA](https://doi.org/10.5281/zenodo.18645738) | `dynamic-water` | 2012669 |
| 4 | 2026 | paper | [Ensemble-based data assimilation improves hyperresolution snowpack simulations in forests](https://doi.org/10.5194/tc-20-209-2026) | `dynamic-water` | 2012310 |
| 5 | 2026 | software | [Exudate-Extractable Phosphorus Dataset and R Code (RProj_ExudatePhos)](https://doi.org/10.5281/zenodo.17860454) | `dynamic-water` | 2012796 |
| 6 | 2026 | paper | [Geologic, Climate and Anthropogenic Influences on Long‐Term and Seasonal Nitrate Dynamics in Two Adjacent Montane Catchments](https://doi.org/10.1002/hyp.70743) | `dynamic-water` | 2012796 |
| 7 | 2026 | paper | [Quantifying Potential Nutrient Liberation Following Plant Investment in Root Exudates: Variation Across Soil Profiles and Ecosystems in the United States](https://doi.org/10.1029/2025jg009380) | `dynamic-water` | 2012796 |
| 8 | 2026 | paper | [Thinking Outside the Rocks: Subsurface Water Storage, Topography, and Land Cover Are Key Modulators of Large‐Scale Riverine Dissolved Silicon Dynamics](https://doi.org/10.1029/2025gl118853) | `dynamic-water` | 2012796 |
| 9 | 2026 | paper | [When Snowpacks Shrink: Declining Weathering and Export Rates but Rising Stream Solute Concentrations in Warming Mountains](https://doi.org/10.1002/hyp.70539) | `dynamic-water` | 2012669 |
| 10 | 2025 | paper | [Animating the critical zone: beavers as critical zone engineers](https://doi.org/10.3389/frwa.2025.1547094) | `dynamic-water` | 2012669 |
| 11 | 2025 | paper | [Concentration-discharge relations and transient metal loads reveal spatiotemporal variability in solute-generation mechanisms in a mine-affected watershed](https://doi.org/10.1016/j.jconhyd.2025.104513) | `dynamic-water` | 2012730 |
| 12 | 2025 | paper | [Controls From Above and Below: Snow, Soil, and Steepness Drive Diverging Trends of Subsurface Water and Streamflow Dynamics](https://doi.org/10.1002/hyp.70120) | `dynamic-water` | 2012669, 2012796 |
| 13 | 2025 | paper | [Critical zone controls on stream chemistry: Lessons from multiple machine learning methods and irregular data across large watersheds](https://doi.org/10.1016/j.jhydrol.2025.133319) | `dynamic-water` | 2012796 |
| 14 | 2025 | paper | [Data‐Model Integration to Unravel Critical Zone Dynamics: Challenges, Successes, and Future Directions](https://doi.org/10.1002/wat2.70040) | `dynamic-water` | 2012796 |
| 15 | 2025 | paper | [Differential snow depth in warm edges versus cold edges of forest gaps, and its potential implications for tree growth in a Sierra Nevada conifer forest](https://doi.org/10.1016/j.foreco.2025.123119) | `dynamic-water` | 2012310 |
| 16 | 2025 | paper | [Early Career Perspectives to Broaden the Scope of Critical Zone Science](https://doi.org/10.1029/2024ef005238) | `dynamic-water` | 2012669, 2012730, 2012796, 2012821 |
| 17 | 2025 | dataset | [Geochemistry and Strontium Isotopes for Coal Creek Watershed, Colorado, 2021-2022](https://doi.org/10.15485/2473235) | `dynamic-water` | 2012796 |
| 18 | 2025 | paper | [GlASS - Global Aggregation of Stream Silica](https://doi.org/10.1038/s41597-025-05937-2) | `dynamic-water` | 2012796 |
| 19 | 2025 | paper | [Groundwater dominates snowmelt runoff and controls streamflow efficiency in the western United States](https://doi.org/10.1038/s43247-025-02303-3) | `dynamic-water` | 2012669, 2012730 |
| 20 | 2025 | paper | [Hidden Features: How Subsurface and Landscape Heterogeneity Govern Hydrologic Connectivity and Stream Chemistry in a Montane Watershed](https://doi.org/10.1002/hyp.70085) | `dynamic-water` | 2012796 |
| 21 | 2025 | paper | [Identifying Canopy Snow in Subalpine Forests: A Comparative Study of Methods](https://doi.org/10.1029/2023WR036996) | `dynamic-water` | 2012669 |
| 22 | 2025 | paper | [Insights Into Heterogeneous Streamflow Generation Processes and Water Contribution in Forested Headwaters](https://doi.org/10.1002/hyp.70241) | `dynamic-water` | 2012796 |
| 23 | 2025 | paper | [Measuring tree sway frequency with videos for ecohydrologic applications: Assessing the efficacy of Eulerian processing algorithms](https://doi.org/10.1016/j.agrformet.2025.110751) | `dynamic-water` | 2012669 |
| 24 | 2025 | paper | [Runoff composition is insensitive to summer rain contributions in a montane headwater stream](https://doi.org/10.1016/j.ejrh.2025.102622) | `dynamic-water` | 2012669, 2012730, 2012796 |
| 25 | 2025 | paper | [Soil signals of key mechanisms driving greater protection of organic carbon under aspen compared to spruce forests in a North American montane ecosystem](https://doi.org/10.5194/bg-22-6097-2025) | `dynamic-water` | 2012669, 2012796 |
| 26 | 2025 | paper | [Soils signal key mechanisms driving greater protection of organic carbon under aspen compared to spruce forests in a North American montane ecosystem](https://doi.org/10.5194/egusphere-2025-70) | `dynamic-water` | 2012669, 2012796 |
| 27 | 2025 | paper | [State shifts in the deep Critical Zone drive landscape evolution in volcanic terrains](https://doi.org/10.1073/pnas.2415155122) | `dynamic-water` | 2012796 |
| 28 | 2025 | paper | [Subsurface Storage Drives Hydrologic Connectivity and Spatial Variability in Stream Chemistry](https://doi.org/10.1002/hyp.70228) | `dynamic-water` | 2012796 |
| 29 | 2025 | paper | [Tracing metal sources and groundwater flow paths in the Upper Animas River watershed using rare earth elements and stable isotopes](https://doi.org/10.1144/geochem2024-023) | `dynamic-water` | 2012730 |
| 30 | 2025 | paper | [Ubiquity and Causes of Soil Water Preferential Flow Across 17 Ecoregions](https://doi.org/10.1029/2025GL118045) | `dynamic-water`, `hub` | 2012796, 2012893 |
| 31 | 2025 | paper | [Wind and topography underlie correlation between seasonal snowpack, mountain glaciers, and late-summer streamflow](https://doi.org/10.5194/tc-19-3193-2025) | `dynamic-water` | 2012310 |
| 32 | 2024 | paper | [Assessing controls on sedimentation rates and sediment organic carbon accretion in beaver ponds](https://doi.org/10.1016/j.scitotenv.2024.174951) | `dynamic-water` | 2012669 |
| 33 | 2024 | paper | [Climate, Hydrology, and Nutrients Control the Seasonality of Si Concentrations in Rivers](https://doi.org/10.1029/2024JG008141) | `dynamic-water` | 2012796 |
| 34 | 2024 | paper | [Digital twins of the Earth: can they keep up?](https://doi.org/10.3389/fsci.2024.1371049) | `dynamic-water` | 2012821 |
| 35 | 2024 | paper | [Establishing fluvial silicon regimes and their stability across the Northern Hemisphere](https://doi.org/10.1002/lol2.10372) | `dynamic-water` | 2012796 |
| 36 | 2024 | paper | [Evaluation of Dual Domain Mass Transfer in Porous Media at the Pore Scale](https://doi.org/10.1111/gwat.13328) | `dynamic-water` | 2012730 |
| 37 | 2024 | paper | [Groundwater—The Dynamic Base of the CZ](https://doi.org/10.1007/978-3-031-69076-1_5) | `dynamic-water` | 2012669 |
| 38 | 2024 | paper | [Hydrology Outweighs Temperature in Driving Production and Export of Dissolved Carbon in a Snowy Mountain Catchment](https://doi.org/10.1029/2023WR036077) | `dynamic-water` | 2012796 |
| 39 | 2024 | paper | [Hyporheic Reaction Potential: A Framework for Predicting Reach Scale Solute Fate and Transport](https://doi.org/10.1021/acs.estlett.4c00035) | `dynamic-water` | 2012730 |
| 40 | 2024 | paper | [Mercury cycling in the U.S. Rocky Mountains: a review of past research and future priorities](https://doi.org/10.1007/s10533-023-01108-w) | `dynamic-water` | 2012669 |
| 41 | 2024 | paper | [Metal-oxide precipitation influences microbiome structure in hyporheic zones receiving acid rock drainage](https://doi.org/10.1128/aem.01987-23) | `dynamic-water` | 2012730 |
| 42 | 2024 | paper | [Shifting groundwater fluxes in bedrock fractures: Evidence from stream water radon and water isotopes](https://doi.org/10.1016/j.jhydrol.2024.131202) | `dynamic-water` | 2012796 |
| 43 | 2024 | paper | [Stream chemical response is mediated by hydrologic connectivity and fire severity in a Pacific Northwest forest](https://doi.org/10.1002/hyp.15231) | `dynamic-water` | 2012796 |
| 44 | 2024 | paper | [Water‐rock interactions drive chemostasis](https://doi.org/10.1002/hyp.15078) | `dynamic-water` | 2012730 |
| 45 | 2023 | paper | [A Second Order Accurate, Positivity Preserving Numerical Method for the Poisson–Nernst–Planck System and Its Convergence Analysis](https://doi.org/10.1007/s10915-023-02345-9) | `dynamic-water` | 2012669 |
| 46 | 2023 | paper | [Antecedent Snowpack Cold Content Alters the Hydrologic Response to Extreme Rain-on-Snow Events](https://doi.org/10.1175/JHM-D-22-0090.1) | `dynamic-water` | 2012310 |
| 47 | 2023 | paper | [Bark Beetle Effects on Fire Regimes Depend on Underlying Fuel Modifications in Semiarid Systems](https://doi.org/10.1029/2022MS003073) | `dynamic-water` | 2012821 |
| 48 | 2023 | paper | [Critical zone science in the Western US—Too much information?](https://doi.org/10.3389/frwa.2023.1226612) | `dynamic-water` | 2012821 |
| 49 | 2023 | paper | [Dominant source areas shift seasonally from longitudinal to lateral contributions in a montane headwater stream](https://doi.org/10.1016/j.jhydrol.2023.129134) | `dynamic-water` | 2012669, 2012796 |
| 50 | 2023 | dataset | DWCZ-CO-MEF-Data from Warix et al. (2024), Water-rock interactions drive chemostasis | `dynamic-water` | 2012730 |
| 51 | 2023 | paper | [Ecohydrologic Dynamics of Rock Moisture in a Montane Catchment of the Colorado Front Range](https://doi.org/10.1029/2022wr034117) | `dynamic-water` | 2012730 |
| 52 | 2023 | paper | [Geomorphic complexity influences coarse particulate organic matter transport and storage in headwater streams](https://doi.org/10.3389/frwa.2023.1227167) | `dynamic-water` | 2012669 |
| 53 | 2023 | paper | [Leveraging Groundwater Dynamics to Improve Predictions of Summer Low‐Flow Discharges](https://doi.org/10.1029/2023wr035126) | `dynamic-water` | 2012669, 2012796 |
| 54 | 2023 | paper | [Local Topography and Streambed Hydraulic Conductivity Influence Riparian Groundwater Age and Groundwater‐Surface Water Connection](https://doi.org/10.1029/2023wr035044) | `dynamic-water` | 2012730 |
| 55 | 2023 | paper | [Long‐Term Changes in Concentration and Yield of Riverine Dissolved Silicon From the Poles to the Tropics](https://doi.org/10.1029/2022gb007678) | `dynamic-water` | 1331841, 2012796 |
| 56 | 2023 | dataset | [Radon Isotopes and Stable Water Isotopes from Coal Creek Watershed, Colorado (2021)](https://doi.org/10.15485/2283437) | `dynamic-water` | 2012796 |
| 57 | 2023 | paper | [Recent advances in integrated hydrologic models: Integration of new domains](https://doi.org/10.1016/j.jhydrol.2023.129515) | `dynamic-water` | 2012821 |
| 58 | 2023 | paper | [The prediction of uneven snowpack response to forest thinning informs forest restoration in the central Sierra Nevada](https://doi.org/10.1002/eco.2580) | `dynamic-water` | 2012310 |
| 59 | 2022 | paper | [Can We Use the Water Budget to Infer Upland Catchment Behavior? The Role of Data Set Error Estimation and Interbasin Groundwater Flow](https://doi.org/10.1029/2021wr030966) | `dynamic-water` | 2012310 |
| 60 | 2022 | paper | [Decadal trends in solute concentrations, mass flux, and discharge reveal variable hydrologic and geochemical response to climate change in two alpine watersheds](https://doi.org/10.1016/j.apgeochem.2022.105402) | `dynamic-water` | 2012730 |
| 61 | 2022 | paper | [Diel streamflow cycles suggest more sensitive snowmelt-driven streamflow to climate change than land surface modeling does](https://doi.org/10.5194/hess-26-3393-2022) | `dynamic-water` | 2012310 |
| 62 | 2022 | paper | [Examining spatial variation in soil solutes and flowpaths in a semi-arid, montane catchment](https://doi.org/10.3389/frwa.2022.1003968) | `dynamic-water` | 2012796 |
| 63 | 2022 | paper | [Identification of hyporheic extent and functional zonation during seasonal streamflow recession by unsupervised clustering of time‐lapse electrical resistivity models](https://doi.org/10.1002/hyp.14713) | `dynamic-water` | 2012730 |
| 64 | 2022 | paper | [Spruce Beetle Outbreak Increases Streamflow From Snow‐Dominated Basins in Southwest Colorado, USA](https://doi.org/10.1029/2021WR029964) | `dynamic-water` | 2012310 |
| 65 | 2022 | paper | [The bedrock of forest drought](https://doi.org/10.1038/s41561-022-01015-z) | `dynamic-water` | 2012821 |
| 66 | 2022 | paper | [The Importance of Groundwater in Critical Zone Science](https://doi.org/10.1111/gwat.13143) | `dynamic-water` | 2012730 |
| 67 | 2021 | paper | [A low-to-no snow future and its impacts on water resources in the western United States](https://doi.org/10.1038/s43017-021-00219-y) | `dynamic-water` | 2012821 |
| 68 | 2021 | paper | [Convergence analysis of structure‐preserving numerical methods for nonlinear Fokker–Planck equations with nonlocal interactions](https://doi.org/10.1002/mma.8015) | `dynamic-water` | 2012669 |
| 69 | 2021 | paper | [Exploring Environmental Factors That Drive Diel Variations in Tree Water Storage Using Wavelet Analysis](https://doi.org/10.3389/frwa.2021.682285) | `dynamic-water` | 2012669, 2012730 |
| 70 | 2021 | paper | [Integrating observations and models to determine the effect of seasonally frozen ground on hydrologic partitioning in alpine hillslopes in the Colorado Rocky Mountains, USA](https://doi.org/10.1002/hyp.14374) | `dynamic-water` | 2012730 |
| 71 | 2021 | paper | [Summer runoff generation in foothill catchments of the Colorado Front Range](https://doi.org/10.1016/j.jhydrol.2020.125672) | `dynamic-water` | 2012669 |
| 72 | 2021 | paper | [Unraveling the Controls on Snow Disappearance in Montane Conifer Forests Using Multi‐Site Lidar](https://doi.org/10.1029/2020WR027522) | `dynamic-water` | 2012310 |
| 73 | 2021 | paper | [Visualization and ecohydrologic models: Opening the box](https://doi.org/10.1002/hyp.13991) | `dynamic-water` | 2012821 |
| 74 | 2020 | paper | [Groundwater–Stream Connectivity Mediates Metal(loid) Geochemistry in the Hyporheic Zone of Streams Impacted by Historic Mining and Acid Rock Drainage](https://doi.org/10.3389/frwa.2020.600409) | `dynamic-water` | 2012730 |

### Geomicrobiology (`geomicrobiology`): 45

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2025 | paper | [Contrasting Depth Dependencies of Plant Root Presence and Mass Across Biomes Underscore Prolific Root‐Regolith Interactions](https://doi.org/10.1029/2025av002072) | `geomicrobiology` | 2012633, 2012878 |
| 2 | 2025 | paper | [Diversity of sulfur cycling halophiles within the Salton Sea, California’s largest lake](https://doi.org/10.1186/s12866-025-03839-2) | `geomicrobiology` | 2012878 |
| 3 | 2025 | dataset | [Root data for cross-biome root presence analyses and associated R scripts](https://doi.org/10.5281/zenodo.16995489) | `geomicrobiology` | 2012633, 2012878 |
| 4 | 2024 | dataset | Depth profiles of soil temperature, moisture, and concentrations of CO2 and O2 | `geomicrobiology` | 2012878 |
| 5 | 2024 | paper | [Expanding the Spatial Reach and Human Impacts of Critical Zone Science](https://doi.org/10.1029/2023EF003971) | `geomicrobiology`, `dynamic-water` | 2012633, 2012796 |
| 6 | 2024 | paper | [Leafcutter ants enhance microbial drought resilience in tropical forest soil](https://doi.org/10.1111/1758-2229.13251) | `geomicrobiology` | 2012878 |
| 7 | 2024 | paper | [Microbial community structure in recovering forests of Mount St. Helens](https://doi.org/10.3389/frmbi.2024.1399416) | `geomicrobiology` | 2012878 |
| 8 | 2024 | paper | [Persistent biogeochemical signals of land use-driven, deep root losses illuminated by C and O isotopes of soil CO2 and O2](https://doi.org/10.1007/s10533-024-01177-5) | `geomicrobiology` | 2012633 |
| 9 | 2024 | paper | [Quantifying soil accumulation of atmospheric mercury using fallout radionuclide chronometry](https://doi.org/10.1038/s41467-024-49789-7) | `geomicrobiology` | 2012403 |
| 10 | 2024 | paper | [The CZ as an Ecological Problem: How the Interplay of Biotic and Abiotic Actors Determines the Functioning of Earth’s Living Skin](https://doi.org/10.1007/978-3-031-69076-1_2) | `geomicrobiology` | 2012878 |
| 11 | 2024 | paper | [The effect of repeated hurricanes on the age of organic carbon in humid tropical forest soil](https://doi.org/10.1111/gcb.17265) | `geomicrobiology` | 2012878 |
| 12 | 2023 | paper | [Climatic controls on soil and saprock nitrogen distribution and persistence in the Sierra Nevada](https://doi.org/10.1002/jpln.202200218) | `geomicrobiology` | 2012878 |
| 13 | 2023 | paper | [Dissolved Organic Carbon Mobilization Across a Climate Transect of Mesic Boreal Forests Is Explained by Air Temperature and Snowpack Duration](https://doi.org/10.1007/s10021-022-00741-0) | `geomicrobiology` | 2012878 |
| 14 | 2023 | paper | [Effects of experimental nitrogen deposition on soil organic carbon storage in Southern California drylands](https://doi.org/10.1111/gcb.16563) | `geomicrobiology` | 2012878 |
| 15 | 2023 | paper | [Is macroporosity controlled by complexed clay and soil organic carbon?](https://doi.org/10.1016/j.geoderma.2023.116565) | `geomicrobiology` | 2012633 |
| 16 | 2023 | paper | [Leaf-cutter ants – mycorrhizal fungi: observations and research questions from an unexpected mutualism](https://doi.org/10.3389/ffunb.2023.1241916) | `geomicrobiology` | 2012878 |
| 17 | 2023 | paper | [Mineral weathering is linked to microbial priming in the critical zone](https://doi.org/10.1038/s41467-022-35671-x) | `geomicrobiology` | 2012878 |
| 18 | 2023 | paper | [Reconciling critical zone science with ecosystem and soil science—a personal-scientist perspective](https://doi.org/10.3389/frwa.2023.1196465) | `geomicrobiology` | 2012878 |
| 19 | 2023 | paper | [Root distributions, precipitation, and soil structure converge to govern soil organic carbon depth distributions](https://doi.org/10.1016/j.geoderma.2023.116569) | `geomicrobiology` | 2012633 |
| 20 | 2023 | paper | [Root endophytic bacterial and fungal communities in a natural hot desert are differentially regulated in dry and wet seasons by stochastic processes and functional traits](https://doi.org/10.1016/j.scitotenv.2023.165524) | `geomicrobiology` | 2012878 |
| 21 | 2023 | paper | [Soil NH3 emissions across an aridity, soil pH, and N deposition gradient in southern California](https://doi.org/10.1525/elementa.2022.00123) | `geomicrobiology` | 2012878 |
| 22 | 2023 | paper | [Standardized Data to Improve Understanding and Modeling of Soil Nitrogen at Continental Scale](https://doi.org/10.1029/2022EF003224) | `geomicrobiology` | 2012878 |
| 23 | 2023 | paper | [Topographic Correction of Visible Near‐Infrared Reflectance Spectra for Horizon‐Scale Soil Organic Carbon Mapping](https://doi.org/10.1002/saj2.20612) | `geomicrobiology` | 2012633 |
| 24 | 2023 | paper | [Wetting‐induced soil CO 2 emission pulses are driven by interactions among soil temperature, carbon, and nitrogen limitation in the Colorado Desert](https://doi.org/10.1111/gcb.16669) | `geomicrobiology` | 2012878 |
| 25 | 2022 | paper | [Climate Warming Alters Nutrient Storage in Seasonally Dry Forests: Insights From a 2,300 m Elevation Gradient](https://doi.org/10.1029/2022GB007429) | `geomicrobiology` | 2012878 |
| 26 | 2022 | paper | [Context dependence in a tropical forest: Repeated disturbance reduces soil nitrate response but increases phosphate](https://doi.org/10.1002/ecs2.4068) | `geomicrobiology` | 2012878, 2217532 |
| 27 | 2022 | paper | [Embracing the dynamic nature of soil structure: A paradigm illuminating the role of life in critical zones of the Anthropocene](https://doi.org/10.1016/j.earscirev.2021.103873) | `geomicrobiology`, `dynamic-water` | 2012633, 2012669, 2012730, 2012796, 2012878 |
| 28 | 2022 | paper | [Extreme rainstorms drive exceptional organic carbon export from forested humid-tropical rivers in Puerto Rico](https://doi.org/10.1038/s41467-022-29618-5) | `geomicrobiology` | 2012878, 2217532 |
| 29 | 2022 | paper | [From Soils to Streams: Connecting Terrestrial Carbon Transformation, Chemical Weathering, and Solute Export Across Hydrological Regimes](https://doi.org/10.1029/2022WR032314) | `geomicrobiology` | 2012878 |
| 30 | 2022 | paper | [Impacts of climate and forest management on suspended sediment source and transport in montane headwater catchments](https://doi.org/10.1002/hyp.14684) | `geomicrobiology` | 2012878 |
| 31 | 2022 | paper | [Landscape Topography and Regional Drought Alters Dust Microbiomes in the Sierra Nevada of California](https://doi.org/10.3389/fmicb.2022.856454) | `geomicrobiology` | 2012878 |
| 32 | 2022 | paper | [Lithological Control of Stream Chemistry in the Luquillo Mountains, Puerto Rico](https://doi.org/10.3389/feart.2022.779459) | `geomicrobiology` | 2012878, 2217532 |
| 33 | 2022 | paper | [Low Redox Decreases Potential Phosphorus Limitation on Soil Biogeochemical Cycling Along a Tropical Rainfall Gradient](https://doi.org/10.1007/s10021-021-00662-4) | `geomicrobiology` | 2012878 |
| 34 | 2022 | paper | [Microbiome interactions and their ecological implications at the Salton Sea](https://doi.org/10.3733/ca.2022a0002) | `geomicrobiology` | 2012878 |
| 35 | 2022 | paper | [Optimizing process-based models to predict current and future soil organic carbon stocks at high-resolution](https://doi.org/10.1038/s41598-022-14224-8) | `geomicrobiology` | 2012878 |
| 36 | 2022 | paper | [Spatial and Temporal Patterns in Atmospheric Deposition of Dissolved Organic Carbon](https://doi.org/10.1029/2022GB007393) | `geomicrobiology` | 2012878, 2217532 |
| 37 | 2022 | paper | [Utilizing Novel Field and Data Exploration Methods to Explore Hot Moments in High-Frequency Soil Nitrous Oxide Emissions Data: Opportunities and Challenges](https://doi.org/10.3389/ffgc.2022.674348) | `geomicrobiology` | 2012878 |
| 38 | 2021 | paper | [Biological Soil Crust Bacterial Communities Vary Along Climatic and Shrub Cover Gradients Within a Sagebrush Steppe Ecosystem](https://doi.org/10.3389/fmicb.2021.569791) | `geomicrobiology` | 2012878 |
| 39 | 2021 | paper | [From DNA sequences to microbial ecology: Wrangling NEON soil microbe data with the neonMicrobe R package](https://doi.org/10.1002/ecs2.3842) | `geomicrobiology` | 2012878 |
| 40 | 2021 | paper | [Harnessing the NEON data revolution to advance open environmental science with a diverse and data‐capable community](https://doi.org/10.1002/ecs2.3833) | `geomicrobiology` | 2012878 |
| 41 | 2021 | paper | [Hydrological Mapping in the Luquillo Experimental Forest: New Local Datum Improves Watershed Ecological Knowledge](https://doi.org/10.3390/hydrology8010054) | `geomicrobiology` | 2012403 |
| 42 | 2021 | paper | [Interactive effects of temperature and redox on soil carbon and iron cycling](https://doi.org/10.1016/j.soilbio.2021.108235) | `geomicrobiology` | 2012878 |
| 43 | 2021 | paper | [Landslides, hurricanes, and sediment sourcing impact basin-scale erosion estimates in Luquillo, Puerto Rico](https://doi.org/10.1016/j.epsl.2021.116821) | `geomicrobiology` | 2012403 |
| 44 | 2021 | paper | [SoDaH: the SOils DAta Harmonization database, an open-source synthesis of soil data from research networks, version 1.0](https://doi.org/10.5194/essd-13-1843-2021) | `geomicrobiology` | 2012878 |
| 45 | 2021 | paper | [The future low-temperature geochemical data-scape as envisioned by the U.S. geochemical community](https://doi.org/10.1016/j.cageo.2021.104933) | `geomicrobiology` | 2012878 |

### Urban (`urban`): 34

| # | Year | Type | Title | Tags to add | Awards credited |
|---|---|---|---|---|---|
| 1 | 2026 | paper | [Urban soil metal contamination and geochemical phase distributions in Pittsburgh: a cross-city comparison with New York City and Los Angeles](https://doi.org/10.1007/s11356-025-37342-y) | `urban` | 2012409 |
| 2 | 2025 | paper | [A “Golden Moment” for Soils and Society Presents Challenges and Opportunities for Soil Science](https://doi.org/10.1111/ejss.70035) | `urban` | 2012336 |
| 3 | 2025 | paper | [Ancient clays support contemporary biogeochemical activity in the Critical Zone](https://doi.org/10.5194/bg-22-3357-2025) | `urban` | 2012336 |
| 4 | 2025 | paper | [Environmental conditions explain variability in concentrations of nutrients but not emerging contaminants](https://doi.org/10.1002/ecs2.70225) | `urban` | 2012336 |
| 5 | 2025 | paper | [Evaluating Trends Using Total Impervious Cover as a Metric for Degree of Urbanisation](https://doi.org/10.1002/hyp.70219) | `urban` | 2012313, 2012409 |
| 6 | 2025 | paper | [Microfluidic-electrochemical sensor utilizing statistical modeling for enhanced nitrate detection in surface water towards environmental monitoring](https://doi.org/10.1039/d5an00092k) | `urban` | 2012340 |
| 7 | 2025 | paper | [Regional high-frequency monitoring revealed chloride concentrations in exceedance of ecological benchmarks in urban streams across the Delaware River Basin, USA](https://doi.org/10.1007/s10661-025-14485-6) | `urban` | 2012313 |
| 8 | 2025 | paper | [Sustainable wood microfluidics for versatile electrochemical studies with proof-of-concept application towards environmental nitrate sensing](https://doi.org/10.1016/j.cplett.2025.142278) | `urban` | 2012340 |
| 9 | 2025 | paper | [Visualising High‐Frequency Stream Temperature Data Using an Automated Mapping Workflow](https://doi.org/10.1002/hyp.70279) | `urban` | 2012340 |
| 10 | 2024 | paper | [Dissimilatory Nitrate Reduction to Ammonium (DNRA) Can Undermine Nitrogen Removal Effectiveness of Persistently Reducing Riparian Sediments](https://doi.org/10.1021/acsestwater.4c00185) | `urban` | 2012336 |
| 11 | 2024 | paper | [Geospatial Variability of Fluorescent Dissolved Organic Matter in Urban Watersheds: Relationships with Land Cover and Wastewater Infrastructure](https://doi.org/10.1021/acs.est.3c07925) | `urban` | 2012340 |
| 12 | 2024 | paper | [Long‐term changes in riparian connectivity and groundwater chemistry in an urban watershed](https://doi.org/10.1002/jeq2.20654) | `urban` | 2012336 |
| 13 | 2024 | paper | [Predictive Modeling Reveals Elevated Conductivity Relative to Background Levels in Freshwater Tributaries within the Chesapeake Bay Watershed, USA](https://doi.org/10.1021/acsestwater.4c00589) | `urban` | 2012313 |
| 14 | 2024 | paper | [Riparian Groundwater Nitrogen (N) Isotopes Reveal Human Imprints of Dams and Road Salt Salinization](https://doi.org/10.1029/2023GL106888) | `urban` | 2012336 |
| 15 | 2024 | paper | [Spring water discharge and metal enrichment in urban soils](https://doi.org/10.1088/2515-7620/ad7f2d) | `urban` | 2012409 |
| 16 | 2023 | paper | [Balancing Upland Green Infrastructure and Stream Restoration to Recover Urban Stormwater and Nitrate Load Retention](https://doi.org/10.1016/j.jhydrol.2023.130364) | `urban` | 2012336 |
| 17 | 2023 | paper | [Hydro-bio-geo-socio-chemical interactions and the sustainability of residential landscapes](https://doi.org/10.1093/pnasnexus/pgad316) | `urban` | 2012336 |
| 18 | 2023 | paper | [Long-term trends in nitrate and chloride in streams in an exurban watershed](https://doi.org/10.1007/s11252-023-01340-0) | `urban` | 2012336 |
| 19 | 2023 | paper | [Mapping Variations in Bedrock Weathering With Slope Aspect Under a Sedimentary Ridge‐Valley System Using Near‐Surface Geophysics and Drilling](https://doi.org/10.1029/2023JF007254) | `urban` | 2012616 |
| 20 | 2023 | paper | [Metal accumulation patterns in Pittsburgh, PA (United States) green infrastructure soils: road connections and legacy soil inputs](https://doi.org/10.3389/fenvs.2023.1155789) | `urban` | 2012409 |
| 21 | 2023 | paper | [Pond Sediments Reveal the Increasing Importance of Road Runoff as a Source of Metal Contamination in Industrialized Urban Environments Downwind of Pittsburgh, Pennsylvania (USA)](https://doi.org/10.1021/acsestwater.2c00240) | `urban` | 2012409 |
| 22 | 2023 | paper | [Spatial and Temporal Patterns of Nitrogen Mobilization in Residential Lawns](https://doi.org/10.1007/s10021-023-00848-y) | `urban` | 2012336 |
| 23 | 2023 | paper | [Spatial Heterogeneity and Temporal Stability of Baseflow Stream Chemistry in an Urban Watershed](https://doi.org/10.1029/2021WR031804) | `urban` | 2012313, 2012340, 2012409 |
| 24 | 2023 | paper | [Symmetry in Hillslope Steepness and Saprolite Thickness Between Hillslopes With Opposing Aspects](https://doi.org/10.1029/2023JF007076) | `urban` | 2012616 |
| 25 | 2022 | paper | [An Ecosystem Services-Centric Land Use and Land Cover Classification for a Subbasin of the Tampa Bay Watershed](https://doi.org/10.3390/f13050745) | `urban` | 2012340 |
| 26 | 2022 | dataset | [Harmar Pond Sediment Core Metals](https://doi.org/10.26022/ieda/112281) | `urban` | 2012409 |
| 27 | 2022 | dataset | [Non-road, Non-dripline Soil Metal Concentrations for Pittsburgh, Pennsylvania, United States of America](https://doi.org/10.26022/ieda/112208) | `urban` | 2012409 |
| 28 | 2022 | paper | [Saturated, Suffocated, and Salty: Human Legacies Produce Hot Spots of Nitrogen in Riparian Zones](https://doi.org/10.1029/2022JG007138) | `urban` | 2012336 |
| 29 | 2022 | paper | [Urban soils in a historically industrial city: patterns of trace metals in Pittsburgh, Pennsylvania](https://doi.org/10.1088/2515-7620/ac7cc2) | `urban` | 2012409 |
| 30 | 2021 | paper | [Assessing urban rainfall‐runoff response to stormwater management extent](https://doi.org/10.1002/hyp.14287) | `urban` | 2012107, 2012340 |
| 31 | 2021 | paper | [Bayesian Seismic Refraction Inversion for Critical Zone Science and Near‐Surface Applications](https://doi.org/10.1029/2020GC009172) | `urban` | 2012616 |
| 32 | 2021 | paper | [Draining the Landscape: How Do Nitrogen Concentrations in Riparian Groundwater and Stream Water Change Following Milldam Removal?](https://doi.org/10.1029/2021JG006444) | `urban` | 2012336 |
| 33 | 2021 | paper | [Ghosts of landuse past: legacy effects of milldams for riparian nitrogen (N) processing and water quality functions](https://doi.org/10.1088/1748-9326/abd9f5) | `urban` | 2012336 |
| 34 | 2021 | paper | [Oil and gas wastewater as road treatment: radioactive material exposure implications at the residential lot and block scale](https://doi.org/10.1088/2515-7620/ac35be) | `urban` | 2012409 |

## Left untagged: 180

| Awards credited | Records | By type |
|---|---|---|
| (no award) | 38 | 37 dataset, 1 software |
| 0725019 | 31 | 1 paper, 30 dataset |
| 1331408 | 16 | 16 dataset |
| 1331841 | 14 | 11 paper, 3 dataset |
| 1331828 | 8 | 8 paper |
| 0724971, 1331856 | 8 | 2 dataset, 3 software, 3 paper |
| 0725019, 1239285, 1331726 | 8 | 8 dataset |
| 1239521, 1331939 | 6 | 6 paper |
| 1331726 | 6 | 3 paper, 3 dataset |
| 1331906 | 6 | 6 paper |
| 1331940 | 5 | 3 paper, 2 dataset |
| 0724958 | 5 | 5 dataset |
| 1331872 | 4 | 3 dataset, 1 paper |
| 0724958, 1331408 | 4 | 2 paper, 2 dataset |
| 0722476, 1331841 | 3 | 2 dataset, 1 paper |
| 1331846 | 3 | 3 paper |
| 1239285 | 3 | 2 dataset, 1 paper |
| 0722476 | 2 | 1 paper, 1 dataset |
| 1331408, 1331906 | 2 | 1 dataset, 1 paper |
| 1331841, 1331846 | 2 | 2 paper |
| 1331856 | 1 | 1 paper |
| 1239281, 1331828 | 1 | 1 paper |
| 0724971 | 1 | 1 paper |
| 0725097, 1331939 | 1 | 1 dataset |
| 1239285, 1331726 | 1 | 1 dataset |
| 1331828, 1331939 | 1 | 1 paper |

