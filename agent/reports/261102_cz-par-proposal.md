# Critical Zone: proposed products from the NSF PAR export (epic #96)

2 November 2026. **A proposal. Nothing in `content/` was changed.** Source: one PAR search for all 44 CZNet awards (393 rows, `par-cznet-all.csv`, exported by Jordan on 2 November 2026; the search and the checks are in CUAHSI/CUAHSI3-website#96). The records are in `261102_cz-par-proposal.json`; this file is the readable version for review.

## Counts

| | Count | Of |
|---|---|---|
| Rows in the export | 393 | |
| Rows the reader made records of | 377 (376 in its output list: one merged into another, not traced) | 393 |
| Rows skipped for no DOI or address | 16 (listed below) | 393 |
| Records already in the products list (same DOI) | 84 | 376 |
| **Proposed (new)** | **292** | 376 |
| Proposed that pass the product schema | 292 | 292 |
| Proposed whose DOI is registered (doi.org handle `responseCode` 1) | 292 | 292 |
| Types | 288 papers, 4 datasets | 292 |
| PAR resource types | 282 journal article, 2 conference paper, 2 posted content, 4 dataset, 2 book chapter | 292 |
| Years | 2020: 4, 2021: 40, 2022: 59, 2023: 59, 2024: 63, 2025: 54, 2026: 13 | 292 |
| Credit only awards that are in the registry | 164 | 292 |
| Also credit award numbers outside the registry | 128 (1 outside award: 68; 2: 28; 3: 15; 4: 3; 5: 7; 6 or more: 7) | 292 |
| Credit awards of more than one cluster | 13 (listed under their first cluster below) | 292 |

Method: the reader (`scripts/cz-harvest.mjs --only par`) on the export; records whose DOI is in `content/critical-zone/products.json` (compared in lower case) removed; each remaining record checked with the product schema and, for its DOI, with `https://doi.org/api/handles/<doi>` (all 292 answered 1; this says the DOI is registered, not that the paper is about the critical zone). Duplicate check by title against the whole list: see "Same title in the list" below.

## What I need from you (the scope call)

PAR credits every award a paper names, so a paper in this export is one that **credits a CZNet award**; it is not necessarily Critical Zone science. The rule in CLAUDE.md for a suggested product is: in scope if it carries a CZO or CZNet award, comes from an observatory or cluster, or is a dataset linked to a CZ paper; scope is yours.

**Agent's choice (C7): propose all 292**, because each carries a CZNet award, and mark the 128 that also credit other awards so you can strike any by title. I could not judge relevance from the award list alone; the number of outside awards is a signal, not a verdict. Options:

- **A.** Load all 292 (my choice).
- **B.** Load only the 164 that credit only registry awards.
- **C.** Load the 164 plus the 68 that credit exactly one outside award (232).
- **D.** Your own strike list from the tables below.

What each record would look like (same shape as the existing CZNet papers): `title`, `type`, `doi`, `url` (the DOI address), `repository` (PAR's journal or publisher text), `awards` (registry ids only), `year`, `source: par`, `source_url`, `date_added: 2026-11-02`. No `sites` or `era` (the 113 CZNet-award papers already in the list have neither). The outside award numbers are kept in the JSON for review and are **not** written to the list.

## Judgement calls and things to look at

- **Preprints (2 posted content):** kept in, per your 31 October ruling. Not checked whether a final version is already in the list. They are `10.22541/essoar.176590620.05979262/v1` (ESS Open Archive, 2025) and `10.22541/au.171799893.36954583/v1` (Authorea, 2024).
- **Book chapters and conference papers (2 and 2):** the two conference papers are chapters of the book *Biogeochemistry of the Critical Zone* (Springer, 2022); the two book chapters are `10.1016/B978-0-323-99762-1.00042-5` and `10.1007/978-3-031-69076-1_2`. Typed `paper`, as the reader does. "All types count" (your 29 October ruling).
- **Datasets (4):** two ESS-DIVE records (Coal Creek, `10.15485/...`) and two Zenodo records. Typed `dataset`. All four have DOIs; whether each is open was not checked.
- **Same title in the list (1):** "The Long-term Development of Wetland Plant Communities with Water Delivery..." (paper, `10.1007/s13157-025-02000-z`, 2025) has the same title as a HydroShare *dataset* already in the list (`10.4211/hs.83de61ef19c34547b55cf0a463b4c6fe`, 2026). Different works (a paper and, probably, its data): not a duplicate, and a candidate for a `related` link, which I did not make.
- **Earliest records:** 4 are from 2020. The CZNet awards started on 1 September 2020.

## The 16 rows the reader skipped (no DOI in the file; for a manual look)

| # | PAR type | Year | Title (cut) | PAR id |
|---|---|---|---|---|
| 1 | Dataset | 2025 | Data from Tucker et al. (2026). Bridging single-tree processes and regional-scale patterns | 10711958 |
| 2 | Journal Article | 2025 | On the role of inherited rock fabric in critical zone porosity development | 10641443 |
| 3 | Journal Article | 2025 | Exploring the connection between critical zone structure and tree distribution in a semiarid... | 10641442 |
| 4 | Conference Proceeding | 2024 | Rapid Changes In Soil Development Of Previously Glaciated Soils Driven By Roots | 10632109 |
| 5 | Conference Proceeding | 2024 | A refinement to the MIcrobial-MIneral Carbon Stabilization (MIMICS) model utilizing field... | 10632106 |
| 6 | Conference Proceeding | 2024 | Bottom-up Controls on Critical Zone Connectivity | 10632104 |
| 7 | Conference Proceeding | 2024 | Shaping the Future of Critical Zone Science: Advancing Transdisciplinary and Interagency... | 10632107 |
| 8 | Conference Proceeding | 2024 | Soil connectivity as a driver of microbial community structure and function... | 10632108 |
| 9 | Conference Proceeding | 2024 | Seasonal Snowmelt Drives Hydrologic Connectivity, Microbial Activity, Oxygen Depletion... | 10632105 |
| 10 | Data Paper | 2024 | Depth profiles of soil temperature, moisture, and concentrations of CO2 and O2 | 10632101 |
| 11 | Book Chapter | 2024 | Groundwater—The Dynamic Base of the CZ | 10629338 |
| 12 | Journal Article | 2024 | Response of marginal and intrinsic water-use efficiency to changing aridity using FLUXNET... | 10520710 |
| 13 | Journal Article | 2024 | 2D Near-Surface Full-Waveform Tomography Reveals Bedrock Controls on Critical Zone Architecture | 10641444 |
| 14 | Dataset | 2023 | DWCZ-CO-MEF-Data from Warix et al. (2024), Water-rock interactions drive chemostasis... | 10711959 |
| 15 | Dissertation | 2023 | On the Importance of Roots to Eco-hydrology: The Effect of Plant Accessible Water Storage | 10719235 |
| 16 | Journal Article | 2020 | Life Teems Below the Surface (Eos) | 10232393 |

Rows 1, 10 and 14 are HydroShare resources whose address sits in the publisher cell of the file, which the reader does not read: `2424579caa904330bd99da9d29daeb96` (already in the list), `9c53ab378b604a8e867cdda0d3ab72fb` and `c4b384a77a0f43cbb2de2d6eae9cf901` (not in the list; both landing pages answered 200 on 2 November 2026). They are not in the proposal: adding them is by hand (C3) once you say so, or a small change to the reader. Rows 4 to 9 are AGU abstracts (conference proceedings); talks and posters stay out of the list.

## Not checked

- Whether the papers are about the critical zone (see the scope call).
- Whether the two preprints have a final version already in the list.
- PAR's "results found" number for the search (not recorded), so a cut-off file is ruled out only by the three control exports.
- Whether any of the proposed items is a duplicate of a list item under a different DOI and a different title (only an exact-title check was made).
- Whether the datasets are openly accessible.

## The proposed records, by cluster

Titles link to the DOI. **Out** = award numbers the paper also credits that are not in the registry (0 = only registry awards). A paper that credits awards of several clusters is listed once, under the first cluster in this order: Hub, Bedrock, Dust, Geomicrobiology, Ecohydrology and CO2, Dynamic Water, Coastal, Urban, Big Data, CINet.

### Hub (16)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Bioclimatic Reorganization of Carbon–Water–Energy Coupling Revealed by Eddy Covariance and Interpretable Machine Learning](https://doi.org/10.1002/gcb4.70012) | Global Change Biology Communications |  | 1 |
| 2 | 2026 | article | [Dominant Controls on Preferential Flow and Their Implications for Future Soil Water Fluxes](https://doi.org/10.1029/2026EF008296) | Earth's Future |  | 0 |
| 3 | 2025 | posted content | [Advancing reproducible and transparent research with practical skills in data and code management](https://doi.org/10.22541/essoar.176590620.05979262/v1) | ESS |  | 0 |
| 4 | 2025 | article | [Climate change has increased global evaporative demand except in South Asia](https://doi.org/10.1038/s43247-025-02959-x) | Communications Earth & Environment |  | 0 |
| 5 | 2025 | article | [Incorporating Catchment Attributes Grouping into Model Parameter Regionalization To Enhance Root Zone Soil Moisture Estimation](https://doi.org/10.1007/s11269-025-04156-z) | Water Resources Management |  | 0 |
| 6 | 2025 | article | [Remote Sensing-Based Assessment of Evapotranspiration Patterns in a UNESCO World Heritage Site Under Increasing Water Competition](https://doi.org/10.3390/rs17142339) | Remote Sensing |  | 0 |
| 7 | 2025 | article | [Spatiotemporal dynamics of soil moisture and the occurrence of hysteresis during seasonal transitions in a headwater catchment](https://doi.org/10.1016/j.geoderma.2025.117169) | Geoderma |  | 0 |
| 8 | 2025 | article | [Ubiquity and Causes of Soil Water Preferential Flow Across 17 Ecoregions](https://doi.org/10.1029/2025GL118045) | Geophysical Research Letters | Dynamic Water | 2 |
| 9 | 2024 | article | [Improved Streamflow Simulation by Assimilating In Situ Soil Moisture in Lumped and Distributed Approaches of a Hydrological Model in a Headwater Catch](https://doi.org/10.1007/s11269-024-03895-9) | Water Resources Management |  | 0 |
| 10 | 2024 | article | [Increasing phosphorus loss despite widespread concentration decline in US rivers](https://doi.org/10.1073/pnas.2402028121) | Proceedings of the National Academy of Scienc |  | 1 |
| 11 | 2024 | article | [Responses of Marginal and Intrinsic Water‐Use Efficiency to Changing Aridity Using FLUXNET Observations](https://doi.org/10.1029/2023JG007875) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 12 | 2024 | article | [The hydrologic nature of swales uncovers remarkable influence of non-topographic factors on catchment-scale soil moisture variation](https://doi.org/10.1016/j.jhydrol.2024.131196) | Journal of Hydrology |  | 0 |
| 13 | 2022 | article | [Freshwater unionid mussels threatened by predation of Round Goby (Neogobius melanostomus)](https://doi.org/10.1038/s41598-022-16385-y) | Scientific Reports |  | 0 |
| 14 | 2022 | article | [Preferential flow patterns in forested hillslopes of east Tibetan Plateau revealed by dye tracing and soil moisture network](https://doi.org/10.1111/ejss.13294) | European Journal of Soil Science |  | 0 |
| 15 | 2022 | article | [Smoke deposition to water surfaces drives hydrochemical changes](https://doi.org/10.1002/hyp.14626) | Hydrological Processes |  | 0 |
| 16 | 2022 | article | [Wildfire and hydrological processes](https://doi.org/10.1002/hyp.14640) | Hydrological Processes |  | 0 |

### Bedrock (27)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Active-Source Environmental Seismology](https://doi.org/10.1785/0220260046) | Seismological Research Letters |  | 0 |
| 2 | 2026 | article | [Bridging Single‐Tree Processes and Regional‐Scale Patterns to Explain Vegetation Drought Resistance and Resilience in a Sierra Nevada Headwater Catchm](https://doi.org/10.1029/2025JG009585) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 3 | 2026 | article | [Role of tectonic rock damage in erosional processes: A global analysis](https://doi.org/10.1126/science.ady9857) | Science |  | 1 |
| 4 | 2025 | article | [A Null Model for Global Root Depth Distributions: Analytical Solution and Comparison to Data](https://doi.org/10.1002/eco.70023) | Ecohydrology |  | 0 |
| 5 | 2025 | article | [Unraveling the Connection Between Subsurface Stress and Geomorphic Features](https://doi.org/10.1029/2025GL116798) | Geophysical Research Letters |  | 1 |
| 6 | 2025 | dataset | [Unraveling the Connection between Subsurface Stress and Geomorphic Features: Dataset](https://doi.org/10.5281/zenodo.12620524) | Zenodo |  | 1 |
| 7 | 2024 | article | [2D Near‐Surface Full‐Waveform Tomography Reveals Bedrock Controls on Critical Zone Architecture](https://doi.org/10.1029/2023EA003248) | Earth and Space Science |  | 0 |
| 8 | 2024 | article | [Catchment Coevolution and the Geomorphic Origins of Variable Source Area Hydrology](https://doi.org/10.1029/2023WR034647) | Water Resources Research |  | 1 |
| 9 | 2024 | dataset | [Data and model output for "Evidence of subsurface control on the coevolution of hillslope morphology and runoff generation"](https://doi.org/10.5281/zenodo.13852023) | Zenodo |  | 1 |
| 10 | 2024 | article | [Evidence of Subsurface Control on the Coevolution of Hillslope Morphology and Runoff Generation](https://doi.org/10.1029/2024WR037301) | Water Resources Research |  | 1 |
| 11 | 2024 | article | [Geophysics as a hypothesis‐testing tool for critical zone hydrogeology](https://doi.org/10.1002/wat2.1732) | WIREs Water | Dynamic Water | 2 |
| 12 | 2024 | article | [Low V p /V s Values as an Indicator for Fractures in the Critical Zone](https://doi.org/10.1029/2023GL105946) | Geophysical Research Letters |  | 0 |
| 13 | 2024 | article | [Similarities in Storage and Transport of Sulfate in Forested and Suburban Watersheds, Despite Anthropogenically Elevated Suburban Sulfate](https://doi.org/10.1029/2023JG007588) | Journal of Geophysical Research: Biogeoscienc | Urban | 1 |
| 14 | 2024 | article | [The grain size of sediments delivered to steep debris‐flow prone channels prior to and following wildfire](https://doi.org/10.1002/esp.5819) | Earth Surface Processes and Landforms |  | 2 |
| 15 | 2023 | article | [Examining the influence of disequilibrium landscape on millennial-scale erosion rates in the San Bernardino Mountains, California, USA](https://doi.org/10.1130/B36734.1) | Geological Society of America Bulletin |  | 4 |
| 16 | 2023 | article | [Mapping bedrock topography: a seismic refraction survey and landscape analysis in the Laramie Range, Wyoming](https://doi.org/10.3389/frwa.2023.1057725) | Frontiers in Water |  | 0 |
| 17 | 2023 | article | [Sand, Gravel, Cobbles, and Boulders: Detrital Thermochronology Shows that One Size Does Not Tell All](https://doi.org/10.1029/2023JF007192) | Journal of Geophysical Research: Earth Surfac |  | 0 |
| 18 | 2023 | article | [The geophysical toolbox applied to forest ecosystems – A review](https://doi.org/10.1016/j.scitotenv.2023.165503) | Science of The Total Environment | Dynamic Water | 1 |
| 19 | 2022 | article | [Forest vulnerability to drought controlled by bedrock composition](https://doi.org/10.1038/s41561-022-01012-2) | Nature Geoscience |  | 0 |
| 20 | 2022 | article | [Groundwater Affects the Geomorphic and Hydrologic Properties of Coevolved Landscapes](https://doi.org/10.1029/2021JF006239) | Journal of Geophysical Research: Earth Surfac |  | 3 |
| 21 | 2022 | article | [What Do P-Wave Velocities Tell Us About the Critical Zone?](https://doi.org/10.3389/frwa.2021.772185) | Frontiers in Water |  | 0 |
| 22 | 2021 | article | [3D Seismic Anatomy of a Watershed Reveals Climate‐Topography Coupling That Drives Water Flowpaths and Bedrock Weathering](https://doi.org/10.1029/2021JF006281) | Journal of Geophysical Research: Earth Surfac |  | 1 |
| 23 | 2021 | article | [Anisovolumetric weathering in granitic saprolite controlled by climate and erosion rate](https://doi.org/10.1130/G48191.1) | Geology |  | 0 |
| 24 | 2021 | article | [Matrix Diffusion as a Mechanism Contributing to Fractal Stream Chemistry and Long‐Tailed Transit Time Distributions](https://doi.org/10.1029/2021GL094292) | Geophysical Research Letters |  | 0 |
| 25 | 2021 | article | [Quantitative analysis of hillshed geomorphology and critical zone function: Raising the hillshed to watershed status](https://doi.org/10.1130/B35724.1) | GSA Bulletin |  | 1 |
| 26 | 2021 | article | [Sediment size on talus slopes correlates with fracture spacing on bedrock cliffs: implications for predicting initial sediment size distributions on h](https://doi.org/10.5194/esurf-9-1073-2021) | Earth Surface Dynamics |  | 0 |
| 27 | 2021 | article | [Seismic Imaging of a Shale Landscape Under Compression Shows Limited Influence of Topography‐Induced Fracturing](https://doi.org/10.1029/2021GL093372) | Geophysical Research Letters |  | 1 |

### Dust (35)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Core microbiomes as a potential fingerprinting method of Western USA dust sources](https://doi.org/10.3389/fmicb.2026.1856083) | Frontiers in Microbiology |  | 0 |
| 2 | 2026 | article | [Mineral dust and the global critical zone](https://doi.org/10.1016/j.ecz.2025.100052) | Earth Critical Zone |  | 0 |
| 3 | 2025 | article | [Combining modeling and isotopic signatures to track Aeolian dust from source to sink in the Wasatch Front, Utah, USA](https://doi.org/10.1016/j.aeolia.2024.100954) | Aeolian Research |  | 0 |
| 4 | 2025 | article | [Dust on Snow Radiative Forcing and Contribution to Melt in the Colorado River Basin](https://doi.org/10.1029/2024GL112757) | Geophysical Research Letters |  | 0 |
| 5 | 2025 | article | [Halogen Production from Playa Dust Emitted from the Great Salt Lake: Implications of the Shrinking Great Salt Lake on Regional Air Quality](https://doi.org/10.1021/acsearthspacechem.4c00258) | ACS Earth and Space Chemistry |  | 0 |
| 6 | 2025 | article | [Mixing of natural and urban dust along the Wasatch Front of northern Utah, USA](https://doi.org/10.1038/s41598-025-88529-9) | Scientific Reports |  | 0 |
| 7 | 2025 | article | [Potential planetary health impacts of the airborne plastisphere](https://doi.org/10.1016/j.oneear.2025.101446) | One Earth |  | 1 |
| 8 | 2025 | article | [Quantifying Dust Nutrient Mobility Through an Alpine Watershed](https://doi.org/10.1029/2024JG008175) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 9 | 2025 | article | [Water chemistry of Alaskan glacial rivers is affected by glacier coverage, bedrock type, and groundwater inputs](https://doi.org/10.3389/frwa.2025.1569267) | Frontiers in Water |  | 0 |
| 10 | 2024 | article | [A cold laboratory hyperspectral imaging system to map grain size and ice layer distributions in firn cores](https://doi.org/10.5194/tc-18-1925-2024) | The Cryosphere |  | 1 |
| 11 | 2024 | article | [Assessing the oxidative potential of dust from great salt Lake](https://doi.org/10.1016/j.atmosenv.2024.120728) | Atmospheric Environment |  | 0 |
| 12 | 2024 | article | [Characterizing variability in geochemistry and mineralogy of western US dust sources](https://doi.org/10.1016/j.aeolia.2024.100941) | Aeolian Research |  | 1 |
| 13 | 2024 | article | [Dust in the Critical Zone: North American case studies](https://doi.org/10.1016/j.earscirev.2024.104942) | Earth-Science Reviews | Ecohydrology and CO2 | 1 |
| 14 | 2024 | article | [Ground-penetrating radar investigation of regolith thickness on a periglacial alpine summit flat, Uinta Mountains, Utah, USA](https://doi.org/10.1080/15230430.2024.2322334) | Arctic, Antarctic, and Alpine Research |  | 0 |
| 15 | 2024 | article | [Mineral dust and pedogenesis in the alpine critical zone](https://doi.org/10.5194/soil-10-167-2024) | SOIL |  | 0 |
| 16 | 2024 | article | [Synoptic Analysis and WRF‐Chem Model Simulation of Dust Events in the Southwestern United States](https://doi.org/10.1029/2023JD040650) | Journal of Geophysical Research: Atmospheres |  | 0 |
| 17 | 2024 | article | [Toxic elements in benthic lacustrine sediments of Utah’s Great Salt Lake following a historic low in elevation](https://doi.org/10.3389/fsoil.2024.1445792) | Frontiers in Soil Science |  | 0 |
| 18 | 2024 | article | [Trace element chemistry and strontium isotope ratios of atmospheric particulate matter reveal air quality impacts from mineral dust, urban pollution, ](https://doi.org/10.1016/j.apgeochem.2024.105906) | Applied Geochemistry |  | 0 |
| 19 | 2024 | article | [Using mercury and lead stable isotopes to assess mercury, lead, and trace metal source contributions to Great Salt Lake, Utah, USA](https://doi.org/10.1016/j.scitotenv.2024.177374) | Science of The Total Environment |  | 1 |
| 20 | 2023 | article | [Growth of grasses and forbs, nutrient concentration, and microbial activity in soil treated with microbeads](https://doi.org/10.1016/j.envpol.2023.121326) | Environmental Pollution |  | 0 |
| 21 | 2023 | article | [Multivariate receptor modeling with widely dispersed Lichens as bioindicators of air quality](https://doi.org/10.1002/env.2785) | Environmetrics |  | 0 |
| 22 | 2023 | article | [Regional sources control dust in the mountain critical zone of the Great Basin and Rocky Mountains, USA](https://doi.org/10.1088/1748-9326/acfb26) | Environmental Research Letters |  | 0 |
| 23 | 2023 | article | [UAV hyperspectral imaging for multiscale assessment of Landsat 9 snow grain size and albedo](https://doi.org/10.3389/frsen.2022.1038287) | Frontiers in Remote Sensing |  | 0 |
| 24 | 2022 | article | [Heavy metal levels and sources in suspended particulate matters of the glacier watersheds in Northeast Tibetan Plateau](https://doi.org/10.3389/fenvs.2022.918514) | Frontiers in Environmental Science |  | 0 |
| 25 | 2022 | article | [Mapping liquid water content in snow at the millimeter scale: an intercomparison of mixed-phase optical property models using hyperspectral imaging an](https://doi.org/10.5194/tc-16-43-2022) | The Cryosphere |  | 0 |
| 26 | 2022 | article | [Microplastics and nanoplastics in the marine-atmosphere environment](https://doi.org/10.1038/s43017-022-00292-x) | Nature Reviews Earth & Environment |  | 1 |
| 27 | 2022 | article | [Relation between regional drought and mountain dust deposition revealed by a 10-year record from an alpine critical zone](https://doi.org/10.1016/j.scitotenv.2022.156999) | Science of The Total Environment |  | 0 |
| 28 | 2022 | article | [Sources and fate of atmospheric microplastics revealed from inverse and dispersion modelling: From global emissions to deposition](https://doi.org/10.1016/j.jhazmat.2022.128585) | Journal of Hazardous Materials |  | 1 |
| 29 | 2022 | article | [Strontium isotope dynamics reveal streamflow contributions from shallow flow paths during snowmelt in a montane watershed, Provo River, Utah, USA](https://doi.org/10.1002/hyp.14458) | Hydrological Processes |  | 0 |
| 30 | 2022 | article | [Uranium isotopes of aeolian dust deposited in northern Tibetan Plateau glaciers: Implications for tracing aeolian dust provenance](https://doi.org/10.1016/j.fmre.2022.01.026) | Fundamental Research |  | 0 |
| 31 | 2022 | article | [Uranium Isotopic Composition and Constraints on the Provenance of the Qinghai‐Tibet Plateau's Surface Dust](https://doi.org/10.1029/2021JF006480) | Journal of Geophysical Research: Earth Surfac |  | 0 |
| 32 | 2021 | article | [Constraining the atmospheric limb of the plastic cycle](https://doi.org/10.1073/pnas.2020719118) | Proceedings of the National Academy of Scienc |  | 1 |
| 33 | 2021 | article | [In situ effective snow grain size mapping using a compact hyperspectral imager](https://doi.org/10.1017/jog.2020.68) | Journal of Glaciology |  | 0 |
| 34 | 2020 | article | [Trace Element Export From the Critical Zone Triggered by Snowmelt Runoff in a Montane Watershed, Provo River, Utah, USA](https://doi.org/10.3389/frwa.2020.578677) | Frontiers in Water |  | 0 |
| 35 | 2020 | article | [Using strontium isotopes to trace dust from a drying Great Salt Lake to adjacent urban areas and mountain snowpack](https://doi.org/10.1088/1748-9326/abbfc4) | Environmental Research Letters |  | 0 |

### Geomicrobiology (42)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2025 | article | [Diversity of sulfur cycling halophiles within the Salton Sea, California’s largest lake](https://doi.org/10.1186/s12866-025-03839-2) | BMC Microbiology |  | 0 |
| 2 | 2024 | article | [Expanding the Spatial Reach and Human Impacts of Critical Zone Science](https://doi.org/10.1029/2023EF003971) | Earth's Future | Dynamic Water | 4 |
| 3 | 2024 | article | [Leafcutter ants enhance microbial drought resilience in tropical forest soil](https://doi.org/10.1111/1758-2229.13251) | Environmental Microbiology Reports |  | 0 |
| 4 | 2024 | article | [Microbial community structure in recovering forests of Mount St. Helens](https://doi.org/10.3389/frmbi.2024.1399416) | Frontiers in Microbiomes |  | 0 |
| 5 | 2024 | article | [Persistent biogeochemical signals of land use-driven, deep root losses illuminated by C and O isotopes of soil CO2 and O2](https://doi.org/10.1007/s10533-024-01177-5) | Biogeochemistry |  | 0 |
| 6 | 2024 | article | [Quantifying soil accumulation of atmospheric mercury using fallout radionuclide chronometry](https://doi.org/10.1038/s41467-024-49789-7) | Nature Communications |  | 5 |
| 7 | 2024 | book chapter | [The CZ as an Ecological Problem: How the Interplay of Biotic and Abiotic Actors Determines the Functioning of Earth’s Living Skin](https://doi.org/10.1007/978-3-031-69076-1_2) | Springer Nature Switzerland |  | 2 |
| 8 | 2024 | article | [The effect of repeated hurricanes on the age of organic carbon in humid tropical forest soil](https://doi.org/10.1111/gcb.17265) | Global Change Biology |  | 1 |
| 9 | 2023 | article | [Climatic controls on soil and saprock nitrogen distribution and persistence in the Sierra Nevada](https://doi.org/10.1002/jpln.202200218) | Journal of Plant Nutrition and Soil Science |  | 0 |
| 10 | 2023 | article | [Dissolved Organic Carbon Mobilization Across a Climate Transect of Mesic Boreal Forests Is Explained by Air Temperature and Snowpack Duration](https://doi.org/10.1007/s10021-022-00741-0) | Ecosystems |  | 0 |
| 11 | 2023 | article | [Effects of experimental nitrogen deposition on soil organic carbon storage in Southern California drylands](https://doi.org/10.1111/gcb.16563) | Global Change Biology |  | 2 |
| 12 | 2023 | article | [Is macroporosity controlled by complexed clay and soil organic carbon?](https://doi.org/10.1016/j.geoderma.2023.116565) | Geoderma |  | 5 |
| 13 | 2023 | article | [Leaf-cutter ants – mycorrhizal fungi: observations and research questions from an unexpected mutualism](https://doi.org/10.3389/ffunb.2023.1241916) | Frontiers in Fungal Biology |  | 0 |
| 14 | 2023 | article | [Mineral weathering is linked to microbial priming in the critical zone](https://doi.org/10.1038/s41467-022-35671-x) | Nature Communications |  | 0 |
| 15 | 2023 | article | [Reconciling critical zone science with ecosystem and soil science—a personal-scientist perspective](https://doi.org/10.3389/frwa.2023.1196465) | Frontiers in Water |  | 0 |
| 16 | 2023 | article | [Root distributions, precipitation, and soil structure converge to govern soil organic carbon depth distributions](https://doi.org/10.1016/j.geoderma.2023.116569) | Geoderma |  | 5 |
| 17 | 2023 | article | [Root endophytic bacterial and fungal communities in a natural hot desert are differentially regulated in dry and wet seasons by stochastic processes a](https://doi.org/10.1016/j.scitotenv.2023.165524) | Science of The Total Environment |  | 0 |
| 18 | 2023 | article | [Soil NH3 emissions across an aridity, soil pH, and N deposition gradient in southern California](https://doi.org/10.1525/elementa.2022.00123) | Elem Sci Anth |  | 2 |
| 19 | 2023 | article | [Standardized Data to Improve Understanding and Modeling of Soil Nitrogen at Continental Scale](https://doi.org/10.1029/2022EF003224) | Earth's Future |  | 3 |
| 20 | 2023 | article | [Topographic Correction of Visible Near‐Infrared Reflectance Spectra for Horizon‐Scale Soil Organic Carbon Mapping](https://doi.org/10.1002/saj2.20612) | Soil Science Society of America Journal |  | 2 |
| 21 | 2023 | article | [Wetting‐induced soil CO 2 emission pulses are driven by interactions among soil temperature, carbon, and nitrogen limitation in the Colorado Desert](https://doi.org/10.1111/gcb.16669) | Global Change Biology |  | 1 |
| 22 | 2022 | article | [Climate Warming Alters Nutrient Storage in Seasonally Dry Forests: Insights From a 2,300 m Elevation Gradient](https://doi.org/10.1029/2022GB007429) | Global Biogeochemical Cycles |  | 0 |
| 23 | 2022 | article | [Context dependence in a tropical forest: Repeated disturbance reduces soil nitrate response but increases phosphate](https://doi.org/10.1002/ecs2.4068) | Ecosphere |  | 2 |
| 24 | 2022 | article | [Embracing the dynamic nature of soil structure: A paradigm illuminating the role of life in critical zones of the Anthropocene](https://doi.org/10.1016/j.earscirev.2021.103873) | Earth-Science Reviews | Dynamic Water | 13 |
| 25 | 2022 | article | [Extreme rainstorms drive exceptional organic carbon export from forested humid-tropical rivers in Puerto Rico](https://doi.org/10.1038/s41467-022-29618-5) | Nature Communications |  | 1 |
| 26 | 2022 | article | [From Soils to Streams: Connecting Terrestrial Carbon Transformation, Chemical Weathering, and Solute Export Across Hydrological Regimes](https://doi.org/10.1029/2022WR032314) | Water Resources Research |  | 7 |
| 27 | 2022 | article | [Impacts of climate and forest management on suspended sediment source and transport in montane headwater catchments](https://doi.org/10.1002/hyp.14684) | Hydrological Processes |  | 0 |
| 28 | 2022 | article | [Landscape Topography and Regional Drought Alters Dust Microbiomes in the Sierra Nevada of California](https://doi.org/10.3389/fmicb.2022.856454) | Frontiers in Microbiology |  | 1 |
| 29 | 2022 | article | [Lithological Control of Stream Chemistry in the Luquillo Mountains, Puerto Rico](https://doi.org/10.3389/feart.2022.779459) | Frontiers in Earth Science |  | 1 |
| 30 | 2022 | article | [Low Redox Decreases Potential Phosphorus Limitation on Soil Biogeochemical Cycling Along a Tropical Rainfall Gradient](https://doi.org/10.1007/s10021-021-00662-4) | Ecosystems |  | 1 |
| 31 | 2022 | article | [Microbiome interactions and their ecological implications at the Salton Sea](https://doi.org/10.3733/ca.2022a0002) | California Agriculture |  | 1 |
| 32 | 2022 | article | [Optimizing process-based models to predict current and future soil organic carbon stocks at high-resolution](https://doi.org/10.1038/s41598-022-14224-8) | Scientific Reports |  | 2 |
| 33 | 2022 | article | [Spatial and Temporal Patterns in Atmospheric Deposition of Dissolved Organic Carbon](https://doi.org/10.1029/2022GB007393) | Global Biogeochemical Cycles |  | 5 |
| 34 | 2022 | article | [Utilizing Novel Field and Data Exploration Methods to Explore Hot Moments in High-Frequency Soil Nitrous Oxide Emissions Data: Opportunities and Chall](https://doi.org/10.3389/ffgc.2022.674348) | Frontiers in Forests and Global Change |  | 2 |
| 35 | 2021 | article | [Biological Soil Crust Bacterial Communities Vary Along Climatic and Shrub Cover Gradients Within a Sagebrush Steppe Ecosystem](https://doi.org/10.3389/fmicb.2021.569791) | Frontiers in Microbiology |  | 0 |
| 36 | 2021 | article | [From DNA sequences to microbial ecology: Wrangling NEON soil microbe data with the neonMicrobe R package](https://doi.org/10.1002/ecs2.3842) | Ecosphere |  | 3 |
| 37 | 2021 | article | [Harnessing the NEON data revolution to advance open environmental science with a diverse and data‐capable community](https://doi.org/10.1002/ecs2.3833) | Ecosphere |  | 9 |
| 38 | 2021 | article | [Hydrological Mapping in the Luquillo Experimental Forest: New Local Datum Improves Watershed Ecological Knowledge](https://doi.org/10.3390/hydrology8010054) | Hydrology |  | 2 |
| 39 | 2021 | article | [Interactive effects of temperature and redox on soil carbon and iron cycling](https://doi.org/10.1016/j.soilbio.2021.108235) | Soil Biology and Biochemistry |  | 1 |
| 40 | 2021 | article | [Landslides, hurricanes, and sediment sourcing impact basin-scale erosion estimates in Luquillo, Puerto Rico](https://doi.org/10.1016/j.epsl.2021.116821) | Earth and Planetary Science Letters |  | 6 |
| 41 | 2021 | article | [SoDaH: the SOils DAta Harmonization database, an open-source synthesis of soil data from research networks, version 1.0](https://doi.org/10.5194/essd-13-1843-2021) | Earth System Science Data |  | 10 |
| 42 | 2021 | article | [The future low-temperature geochemical data-scape as envisioned by the U.S. geochemical community](https://doi.org/10.1016/j.cageo.2021.104933) | Computers & Geosciences |  | 1 |

### Ecohydrology and CO2 (3)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Dates and rates of loess deposition and soil formation on the Snake River Plain, Idaho, USA](https://doi.org/10.1130/B38703.1) | Geological Society of America Bulletin |  | 0 |
| 2 | 2025 | article | [The Long-term Development of Wetland Plant Communities with Water Deliveries in a Created Wetland in the Desert Southwest](https://doi.org/10.1007/s13157-025-02000-z) | Wetlands |  | 0 |
| 3 | 2024 | article | [Uranium-series and strontium isotope systematics in soil carbonates from dryland Critical Zones: Implications for soil inorganic carbon storage and tr](https://doi.org/10.1016/j.gca.2024.05.020) | Geochimica et Cosmochimica Acta |  | 5 |

### Dynamic Water (49)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [When Snowpacks Shrink: Declining Weathering and Export Rates but Rising Stream Solute Concentrations in Warming Mountains](https://doi.org/10.1002/hyp.70539) | Hydrological Processes |  | 0 |
| 2 | 2025 | article | [Animating the critical zone: beavers as critical zone engineers](https://doi.org/10.3389/frwa.2025.1547094) | Frontiers in Water |  | 0 |
| 3 | 2025 | article | [Concentration-discharge relations and transient metal loads reveal spatiotemporal variability in solute-generation mechanisms in a mine-affected water](https://doi.org/10.1016/j.jconhyd.2025.104513) | Journal of Contaminant Hydrology |  | 0 |
| 4 | 2025 | article | [Controls From Above and Below: Snow, Soil, and Steepness Drive Diverging Trends of Subsurface Water and Streamflow Dynamics](https://doi.org/10.1002/hyp.70120) | Hydrological Processes |  | 5 |
| 5 | 2025 | article | [Critical zone controls on stream chemistry: Lessons from multiple machine learning methods and irregular data across large watersheds](https://doi.org/10.1016/j.jhydrol.2025.133319) | Journal of Hydrology |  | 2 |
| 6 | 2025 | article | [Forest regrowth impacts on high-resolution snowpack modeling: A proof-of-concept in a Mediterranean montane catchment](https://doi.org/10.1016/j.jhydrol.2025.133426) | Journal of Hydrology | Big Data | 0 |
| 7 | 2025 | dataset | [Geochemistry and Strontium Isotopes for Coal Creek Watershed, Colorado, 2021-2022](https://doi.org/10.15485/2473235) | Environmental System Science Data Infrastruct |  | 0 |
| 8 | 2025 | article | [GlASS - Global Aggregation of Stream Silica](https://doi.org/10.1038/s41597-025-05937-2) | Scientific Data |  | 6 |
| 9 | 2025 | article | [Groundwater dominates snowmelt runoff and controls streamflow efficiency in the western United States](https://doi.org/10.1038/s43247-025-02303-3) | Communications Earth & Environment |  | 1 |
| 10 | 2025 | article | [Hidden Features: How Subsurface and Landscape Heterogeneity Govern Hydrologic Connectivity and Stream Chemistry in a Montane Watershed](https://doi.org/10.1002/hyp.70085) | Hydrological Processes |  | 0 |
| 11 | 2025 | article | [Identifying Canopy Snow in Subalpine Forests: A Comparative Study of Methods](https://doi.org/10.1029/2023WR036996) | Water Resources Research |  | 0 |
| 12 | 2025 | article | [Insights Into Heterogeneous Streamflow Generation Processes and Water Contribution in Forested Headwaters](https://doi.org/10.1002/hyp.70241) | Hydrological Processes |  | 2 |
| 13 | 2025 | article | [James Buttle Review: Dynamic Water Storage Shapes Critical Zone Function in Snow‐Dominated Mountain Watersheds](https://doi.org/10.1002/hyp.70325) | Hydrological Processes | Big Data | 1 |
| 14 | 2025 | article | [Measuring tree sway frequency with videos for ecohydrologic applications: Assessing the efficacy of Eulerian processing algorithms](https://doi.org/10.1016/j.agrformet.2025.110751) | Agricultural and Forest Meteorology |  | 1 |
| 15 | 2025 | article | [Restoring Historic Forest Disturbance Frequency Would Partially Mitigate Droughts in the Central Sierra Nevada Mountains](https://doi.org/10.1029/2024WR039227) | Water Resources Research | Big Data | 0 |
| 16 | 2025 | article | [State shifts in the deep Critical Zone drive landscape evolution in volcanic terrains](https://doi.org/10.1073/pnas.2415155122) | Proceedings of the National Academy of Scienc |  | 2 |
| 17 | 2025 | article | [Subsurface Storage Drives Hydrologic Connectivity and Spatial Variability in Stream Chemistry](https://doi.org/10.1002/hyp.70228) | Hydrological Processes |  | 4 |
| 18 | 2025 | article | [Tracing metal sources and groundwater flow paths in the Upper Animas River watershed using rare earth elements and stable isotopes](https://doi.org/10.1144/geochem2024-023) | Geochemistry: Exploration, Environment, Analy |  | 0 |
| 19 | 2024 | article | [Assessing controls on sedimentation rates and sediment organic carbon accretion in beaver ponds](https://doi.org/10.1016/j.scitotenv.2024.174951) | Science of The Total Environment |  | 0 |
| 20 | 2024 | article | [Climate, Hydrology, and Nutrients Control the Seasonality of Si Concentrations in Rivers](https://doi.org/10.1029/2024JG008141) | Journal of Geophysical Research: Biogeoscienc |  | 5 |
| 21 | 2024 | article | [Digital twins of the Earth: can they keep up?](https://doi.org/10.3389/fsci.2024.1371049) | Frontiers in Science |  | 0 |
| 22 | 2024 | article | [Evaluation of Dual Domain Mass Transfer in Porous Media at the Pore Scale](https://doi.org/10.1111/gwat.13328) | Groundwater |  | 0 |
| 23 | 2024 | article | [Hydrology Outweighs Temperature in Driving Production and Export of Dissolved Carbon in a Snowy Mountain Catchment](https://doi.org/10.1029/2023WR036077) | Water Resources Research |  | 2 |
| 24 | 2024 | article | [Mercury cycling in the U.S. Rocky Mountains: a review of past research and future priorities](https://doi.org/10.1007/s10533-023-01108-w) | Biogeochemistry |  | 1 |
| 25 | 2024 | article | [Metal-oxide precipitation influences microbiome structure in hyporheic zones receiving acid rock drainage](https://doi.org/10.1128/aem.01987-23) | Applied and Environmental Microbiology |  | 0 |
| 26 | 2024 | article | [Relationships between snowpack, low flows and stream temperature in mountain watersheds of the US west coast](https://doi.org/10.1002/hyp.15157) | Hydrological Processes | Big Data | 0 |
| 27 | 2024 | article | [River water quality shaped by land–river connectivity in a changing climate](https://doi.org/10.1038/s41558-023-01923-x) | Nature Climate Change | Big Data | 2 |
| 28 | 2024 | article | [Stream chemical response is mediated by hydrologic connectivity and fire severity in a Pacific Northwest forest](https://doi.org/10.1002/hyp.15231) | Hydrological processes |  | 1 |
| 29 | 2024 | article | [Water‐rock interactions drive chemostasis](https://doi.org/10.1002/hyp.15078) | Hydrological Processes |  | 0 |
| 30 | 2023 | article | [Antecedent Snowpack Cold Content Alters the Hydrologic Response to Extreme Rain-on-Snow Events](https://doi.org/10.1175/JHM-D-22-0090.1) | Journal of Hydrometeorology |  | 0 |
| 31 | 2023 | article | [Bark Beetle Effects on Fire Regimes Depend on Underlying Fuel Modifications in Semiarid Systems](https://doi.org/10.1029/2022MS003073) | Journal of Advances in Modeling Earth Systems |  | 1 |
| 32 | 2023 | article | [Critical zone science in the Western US—Too much information?](https://doi.org/10.3389/frwa.2023.1226612) | Frontiers in Water |  | 0 |
| 33 | 2023 | article | [Geomorphic complexity influences coarse particulate organic matter transport and storage in headwater streams](https://doi.org/10.3389/frwa.2023.1227167) | Frontiers in Water |  | 0 |
| 34 | 2023 | dataset | [Radon Isotopes and Stable Water Isotopes from Coal Creek Watershed, Colorado (2021)](https://doi.org/10.15485/2283437) | Environmental System Science Data Infrastruct |  | 0 |
| 35 | 2023 | article | [Recent advances in integrated hydrologic models: Integration of new domains](https://doi.org/10.1016/j.jhydrol.2023.129515) | Journal of Hydrology |  | 1 |
| 36 | 2022 | article | [Climate Controls on River Chemistry](https://doi.org/10.1029/2021EF002603) | Earth's Future | Big Data | 1 |
| 37 | 2022 | article | [Decadal trends in solute concentrations, mass flux, and discharge reveal variable hydrologic and geochemical response to climate change in two alpine ](https://doi.org/10.1016/j.apgeochem.2022.105402) | Applied Geochemistry |  | 2 |
| 38 | 2022 | article | [Diel streamflow cycles suggest more sensitive snowmelt-driven streamflow to climate change than land surface modeling does](https://doi.org/10.5194/hess-26-3393-2022) | Hydrology and Earth System Sciences |  | 1 |
| 39 | 2022 | article | [Identification of hyporheic extent and functional zonation during seasonal streamflow recession by unsupervised clustering of time‐lapse electrical re](https://doi.org/10.1002/hyp.14713) | Hydrological Processes |  | 2 |
| 40 | 2022 | article | [Spruce Beetle Outbreak Increases Streamflow From Snow‐Dominated Basins in Southwest Colorado, USA](https://doi.org/10.1029/2021WR029964) | Water Resources Research |  | 0 |
| 41 | 2022 | article | [The bedrock of forest drought](https://doi.org/10.1038/s41561-022-01015-z) | Nature Geoscience |  | 0 |
| 42 | 2022 | article | [The Importance of Groundwater in Critical Zone Science](https://doi.org/10.1111/gwat.13143) | Groundwater |  | 2 |
| 43 | 2021 | article | [A low-to-no snow future and its impacts on water resources in the western United States](https://doi.org/10.1038/s43017-021-00219-y) | Nature Reviews Earth & Environment |  | 0 |
| 44 | 2021 | article | [Exploring Environmental Factors That Drive Diel Variations in Tree Water Storage Using Wavelet Analysis](https://doi.org/10.3389/frwa.2021.682285) | Frontiers in Water |  | 0 |
| 45 | 2021 | article | [Integrating observations and models to determine the effect of seasonally frozen ground on hydrologic partitioning in alpine hillslopes in the Colorad](https://doi.org/10.1002/hyp.14374) | Hydrological Processes |  | 1 |
| 46 | 2021 | article | [Summer runoff generation in foothill catchments of the Colorado Front Range](https://doi.org/10.1016/j.jhydrol.2020.125672) | Journal of Hydrology |  | 0 |
| 47 | 2021 | article | [Unraveling the Controls on Snow Disappearance in Montane Conifer Forests Using Multi‐Site Lidar](https://doi.org/10.1029/2020WR027522) | Water Resources Research |  | 0 |
| 48 | 2021 | article | [Visualization and ecohydrologic models: Opening the box](https://doi.org/10.1002/hyp.13991) | Hydrological Processes |  | 0 |
| 49 | 2020 | article | [Groundwater–Stream Connectivity Mediates Metal(loid) Geochemistry in the Hyporheic Zone of Streams Impacted by Historic Mining and Acid Rock Drainage](https://doi.org/10.3389/frwa.2020.600409) | Frontiers in Water |  | 1 |

### Coastal (25)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Investigating Coastal Vegetation Dynamics and Ecosystem Impacts Under Elevated CO 2 and Temperature: A Process‐Based Approach](https://doi.org/10.1029/2025JG009305) | Journal of Geophysical Research: Biogeoscienc |  | 0 |
| 2 | 2026 | article | [Sea-level-driven land conversion amplified by coastal agriculture](https://doi.org/10.1038/s41893-026-01835-6) | Nature Sustainability |  | 0 |
| 3 | 2026 | article | [Seasonal Hydrology at the Salt Marsh‐Upland Interface](https://doi.org/10.1029/2025JG009297) | Journal of Geophysical Research: Biogeoscienc |  | 2 |
| 4 | 2025 | article | [Ecosystem structure and salinity thresholds in retreating coastal forests along the Mid-Atlantic, USA](https://doi.org/10.1007/s10584-025-03948-x) | Climatic Change |  | 1 |
| 5 | 2025 | article | [Feedbacks Regulating the Salinization of Coastal Landscapes](https://doi.org/10.1146/annurev-marine-070924-031447) | Annual Review of Marine Science |  | 1 |
| 6 | 2025 | article | [Mudflat Biostabilization Alters Coastal Landscape Sediment Connectivity](https://doi.org/10.1029/2024JG008500) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 7 | 2025 | book chapter | [Salinization of inland waters](https://doi.org/10.1016/B978-0-323-99762-1.00042-5) | Elsevier |  | 1 |
| 8 | 2024 | article | [Early detection of invasive Phragmites australis at the tidal marsh-forest ecotone with airborne LiDAR](https://doi.org/10.1016/j.ecolind.2024.112651) | Ecological Indicators |  | 1 |
| 9 | 2024 | article | [Evapotranspiration and Rainfall Effects on Post‐Storm Salinization of Coastal Forests: Soil Characteristics as Important Factor for Salt‐Intolerant Tr](https://doi.org/10.1029/2024WR037907) | Water Resources Research |  | 1 |
| 10 | 2024 | article | [Litter Decomposition in Retreating Coastal Forests](https://doi.org/10.1007/s12237-024-01358-3) | Estuaries and Coasts |  | 2 |
| 11 | 2024 | article | [Marine Transgression in Modern Times](https://doi.org/10.1146/annurev-marine-022123-103802) | Annual Review of Marine Science |  | 3 |
| 12 | 2024 | article | [Saltwater intrusion and sea level rise threatens U.S. rural coastal landscapes and communities](https://doi.org/10.1016/j.ancene.2024.100427) | Anthropocene |  | 0 |
| 13 | 2024 | article | [Shifts in light availability driven by dieback across a marsh‐forest gradient](https://doi.org/10.1002/ecs2.70021) | Ecosphere |  | 0 |
| 14 | 2024 | article | [Storm Surges and Sea Level Rise Cluster Hydrological Variables Across a Coastal Forest Bordering a Salt Marsh](https://doi.org/10.1029/2022WR033931) | Water Resources Research |  | 1 |
| 15 | 2023 | article | [Biophysical Drivers of Coastal Treeline Elevation](https://doi.org/10.1029/2023JG007525) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 16 | 2023 | article | [Climate-driven tradeoffs between landscape connectivity and the maintenance of the coastal carbon sink](https://doi.org/10.1038/s41467-023-36803-7) | Nature Communications |  | 2 |
| 17 | 2023 | article | [Experimentally simulated sea level rise destabilizes carbon-mineral associations in temperate tidal marsh soil](https://doi.org/10.1007/s10533-023-01024-z) | Biogeochemistry |  | 1 |
| 18 | 2023 | article | [Frequent Storm Surges Affect the Groundwater of Coastal Ecosystems](https://doi.org/10.1029/2022GL100191) | Geophysical Research Letters |  | 3 |
| 19 | 2023 | article | [Geomorphic and ecological constraints on the coastal carbon sink](https://doi.org/10.1038/s43017-023-00429-6) | Nature Reviews Earth & Environment |  | 3 |
| 20 | 2023 | article | [Shoreface erosion counters blue carbon accumulation in transgressive barrier-island systems](https://doi.org/10.1038/s41467-023-42942-8) | Nature Communications |  | 3 |
| 21 | 2022 | article | [A phenology- and trend-based approach for accurate mapping of sea-level driven coastal forest retreat](https://doi.org/10.1016/j.rse.2022.113229) | Remote Sensing of Environment |  | 1 |
| 22 | 2022 | article | [Hidden levees: Small-scale flood defense on rural coasts](https://doi.org/10.1016/j.ancene.2022.100350) | Anthropocene |  | 1 |
| 23 | 2022 | article | [Processes and mechanisms of coastal woody‐plant mortality](https://doi.org/10.1111/gcb.16297) | Global Change Biology |  | 1 |
| 24 | 2022 | article | [Variability in marsh migration potential determined by topographic rather than anthropogenic constraints in the Chesapeake Bay region](https://doi.org/10.1002/lol2.10262) | Limnology and Oceanography Letters |  | 2 |
| 25 | 2022 | article | [Vertical Saltwater Intrusion in Coastal Aquifers Driven by Episodic Flooding: A Review](https://doi.org/10.1029/2022WR032614) | Water Resources Research |  | 0 |

### Urban (21)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2025 | article | [A “Golden Moment” for Soils and Society Presents Challenges and Opportunities for Soil Science](https://doi.org/10.1111/ejss.70035) | European Journal of Soil Science |  | 1 |
| 2 | 2025 | article | [Ancient clays support contemporary biogeochemical activity in the Critical Zone](https://doi.org/10.5194/bg-22-3357-2025) | Biogeosciences |  | 0 |
| 3 | 2025 | article | [Environmental conditions explain variability in concentrations of nutrients but not emerging contaminants](https://doi.org/10.1002/ecs2.70225) | Ecosphere |  | 1 |
| 4 | 2025 | article | [Evaluating Trends Using Total Impervious Cover as a Metric for Degree of Urbanisation](https://doi.org/10.1002/hyp.70219) | Hydrological Processes |  | 0 |
| 5 | 2025 | article | [Regional high-frequency monitoring revealed chloride concentrations in exceedance of ecological benchmarks in urban streams across the Delaware River ](https://doi.org/10.1007/s10661-025-14485-6) | Environmental Monitoring and Assessment |  | 0 |
| 6 | 2024 | article | [Dissimilatory Nitrate Reduction to Ammonium (DNRA) Can Undermine Nitrogen Removal Effectiveness of Persistently Reducing Riparian Sediments](https://doi.org/10.1021/acsestwater.4c00185) | ACS ES&T Water |  | 3 |
| 7 | 2024 | article | [Long‐term changes in riparian connectivity and groundwater chemistry in an urban watershed](https://doi.org/10.1002/jeq2.20654) | Journal of Environmental Quality |  | 2 |
| 8 | 2024 | article | [Predictive Modeling Reveals Elevated Conductivity Relative to Background Levels in Freshwater Tributaries within the Chesapeake Bay Watershed, USA](https://doi.org/10.1021/acsestwater.4c00589) | ACS ES&T Water |  | 0 |
| 9 | 2024 | article | [Riparian Groundwater Nitrogen (N) Isotopes Reveal Human Imprints of Dams and Road Salt Salinization](https://doi.org/10.1029/2023GL106888) | Geophysical Research Letters |  | 3 |
| 10 | 2023 | article | [Balancing Upland Green Infrastructure and Stream Restoration to Recover Urban Stormwater and Nitrate Load Retention](https://doi.org/10.1016/j.jhydrol.2023.130364) | Journal of Hydrology |  | 2 |
| 11 | 2023 | article | [Hydro-bio-geo-socio-chemical interactions and the sustainability of residential landscapes](https://doi.org/10.1093/pnasnexus/pgad316) | PNAS Nexus |  | 2 |
| 12 | 2023 | article | [Long-term trends in nitrate and chloride in streams in an exurban watershed](https://doi.org/10.1007/s11252-023-01340-0) | Urban Ecosystems |  | 2 |
| 13 | 2023 | article | [Mapping Variations in Bedrock Weathering With Slope Aspect Under a Sedimentary Ridge‐Valley System Using Near‐Surface Geophysics and Drilling](https://doi.org/10.1029/2023JF007254) | Journal of Geophysical Research: Earth Surfac |  | 0 |
| 14 | 2023 | article | [Metal accumulation patterns in Pittsburgh, PA (United States) green infrastructure soils: road connections and legacy soil inputs](https://doi.org/10.3389/fenvs.2023.1155789) | Frontiers in Environmental Science |  | 1 |
| 15 | 2023 | article | [Spatial and Temporal Patterns of Nitrogen Mobilization in Residential Lawns](https://doi.org/10.1007/s10021-023-00848-y) | Ecosystems |  | 3 |
| 16 | 2023 | article | [Spatial Heterogeneity and Temporal Stability of Baseflow Stream Chemistry in an Urban Watershed](https://doi.org/10.1029/2021WR031804) | Water Resources Research |  | 2 |
| 17 | 2023 | article | [Symmetry in Hillslope Steepness and Saprolite Thickness Between Hillslopes With Opposing Aspects](https://doi.org/10.1029/2023JF007076) | Journal of Geophysical Research: Earth Surfac |  | 1 |
| 18 | 2022 | article | [Saturated, Suffocated, and Salty: Human Legacies Produce Hot Spots of Nitrogen in Riparian Zones](https://doi.org/10.1029/2022JG007138) | Journal of Geophysical Research: Biogeoscienc |  | 3 |
| 19 | 2021 | article | [Bayesian Seismic Refraction Inversion for Critical Zone Science and Near‐Surface Applications](https://doi.org/10.1029/2020GC009172) | Geochemistry, Geophysics, Geosystems |  | 0 |
| 20 | 2021 | article | [Draining the Landscape: How Do Nitrogen Concentrations in Riparian Groundwater and Stream Water Change Following Milldam Removal?](https://doi.org/10.1029/2021JG006444) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 21 | 2021 | article | [Ghosts of landuse past: legacy effects of milldams for riparian nitrogen (N) processing and water quality functions](https://doi.org/10.1088/1748-9326/abd9f5) | Environmental Research Letters |  | 3 |

### Big Data (42)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2026 | article | [Reservoir releases and land cover interact to drive event-scale nitrate export in a large agricultural basin](https://doi.org/10.1016/j.jhydrol.2026.136177) | Journal of Hydrology |  | 0 |
| 2 | 2025 | article | [TransNAS-TSAD: harnessing transformers for multi-objective neural architecture search in time series anomaly detection](https://doi.org/10.1007/s00521-024-10759-1) | Neural Computing and Applications |  | 0 |
| 3 | 2024 | article | [A Flood of New Water Cycle Resources](https://doi.org/10.1525/abt.2024.86.4.242) | The American Biology Teacher |  | 0 |
| 4 | 2024 | article | [An automated machine learning approach for detecting anomalous peak patterns in time series data from a research watershed in the northeastern United ](https://doi.org/10.1016/j.mlwa.2024.100543) | Machine Learning with Applications |  | 0 |
| 5 | 2024 | article | [Assessing changes in global fire regimes](https://doi.org/10.1186/s42408-023-00237-9) | Fire Ecology |  | 1 |
| 6 | 2024 | article | [CAMELS-Chem: augmenting CAMELS (Catchment Attributes and Meteorology for Large-sample Studies) with atmospheric and stream water chemistry data](https://doi.org/10.5194/hess-28-611-2024) | Hydrology and Earth System Sciences |  | 0 |
| 7 | 2024 | article | [Illuminating the “Invisible”: Substantial Deep Respiration and Lateral Export of Dissolved Carbon From Beneath Soil](https://doi.org/10.1029/2023WR035940) | Water Resources Research |  | 0 |
| 8 | 2024 | article | [Impact of Peat Extraction on Downstream Concentrations and Attenuation of Dissolved Organic Carbon and Nutrients](https://doi.org/10.1029/2024WR037397) | Water Resources Research |  | 0 |
| 9 | 2024 | posted content | [Lidar-Derived Forest Metrics Predict Snow Accumulation and Ablation in the Central Sierra Nevada, USA](https://doi.org/10.22541/au.171799893.36954583/v1) | Authorea Inc. |  | 0 |
| 10 | 2024 | article | [Soil temperature and moisture as key controls of phosphorus export in mountain watersheds](https://doi.org/10.1016/j.scitotenv.2024.170958) | Science of The Total Environment |  | 0 |
| 11 | 2024 | article | [Solute export patterns across the contiguous USA](https://doi.org/10.1002/hyp.15197) | Hydrological Processes |  | 1 |
| 12 | 2023 | article | [Catchment concentration–discharge relationships across temporal scales: A review](https://doi.org/10.1002/wat2.1702) | WIREs Water |  | 6 |
| 13 | 2023 | article | [Complex Drivers of Riparian Soil Oxygen Variability Revealed Using Self‐Organizing Maps](https://doi.org/10.1029/2022WR034022) | Water Resources Research |  | 0 |
| 14 | 2023 | article | [Deep denitrification: Stream and groundwater biogeochemistry reveal contrasted but connected worlds above and below](https://doi.org/10.1016/j.scitotenv.2023.163178) | Science of The Total Environment |  | 0 |
| 15 | 2023 | article | [Disentangling the responses of dissolved organic carbon and nitrogen concentrations to overlapping drivers in a northeastern United States forested wa](https://doi.org/10.3389/frwa.2023.1065300) | Frontiers in Water |  | 0 |
| 16 | 2023 | article | [Equity, Diversity, and Community as the Basis for Critical Zone Science and Education](https://doi.org/10.1029/2022EF002812) | Earth's Future |  | 0 |
| 17 | 2023 | article | [Low hyporheic denitrification in headwater streams revealed by nutrient injections and in situ gas measurements](https://doi.org/10.1016/j.jhydrol.2023.130328) | Journal of Hydrology |  | 0 |
| 18 | 2023 | article | [Machine‐Learning Reveals Equifinality in Drivers of Stream DOC Concentration at Continental Scales](https://doi.org/10.1029/2021WR030551) | Water Resources Research |  | 0 |
| 19 | 2023 | article | [Model-Based Clustering of Trends and Cycles of Nitrate Concentrations in Rivers Across France](https://doi.org/10.1007/s13253-022-00513-2) | Journal of Agricultural, Biological and Envir |  | 0 |
| 20 | 2023 | article | [Overshooting tipping points: Thresholds and impacts](https://doi.org/10.1016/j.oneear.2023.11.015) | One Earth |  | 0 |
| 21 | 2023 | article | [Physical and biogeochemical drivers of solute mobilization and flux through the critical zone after wildfire](https://doi.org/10.3389/frwa.2023.1148298) | Frontiers in Water |  | 0 |
| 22 | 2023 | article | [Revisiting the Origins of the Power‐Law Analysis for the Assessment of Concentration‐Discharge Relationships](https://doi.org/10.1029/2023WR034910) | Water Resources Research |  | 3 |
| 23 | 2023 | article | [The meanings of the Critical Zone](https://doi.org/10.1016/j.ancene.2023.100377) | Anthropocene |  | 0 |
| 24 | 2023 | article | [The Music of Rivers: The Mathematics of Waves Reveals Global Structure and Drivers of Streamflow Regime](https://doi.org/10.1029/2023WR034484) | Water Resources Research |  | 3 |
| 25 | 2022 | article | [Illuminating the ‘invisible water crisis’ to address global water pollution challenges](https://doi.org/10.1002/hyp.14525) | Hydrological Processes |  | 0 |
| 26 | 2022 | article | [Improving sustainable agriculture promotion: an explorative analysis of NRCS assistance programs and farmer perspectives](https://doi.org/10.1080/14735903.2022.2056997) | International Journal of Agricultural Sustain |  | 0 |
| 27 | 2022 | article | [Organizational Principles of Hyporheic Exchange Flow and Biogeochemical Cycling in River Networks Across Scales](https://doi.org/10.1029/2021WR029771) | Water Resources Research |  | 3 |
| 28 | 2022 | article | [Soil type modifies the impacts of warming and snow exclusion on leachate carbon and nutrient losses](https://doi.org/10.1007/s10533-022-00949-1) | Biogeochemistry |  | 0 |
| 29 | 2022 | article | [Streams as Mirrors: Reading Subsurface Water Chemistry From Stream Chemistry](https://doi.org/10.1029/2021WR029931) | Water Resources Research |  | 1 |
| 30 | 2022 | article | [Tandem Use of Multiple Tracers and Metrics to Identify Dynamic and Slow Hydrological Flowpaths](https://doi.org/10.3389/frwa.2022.841144) | Frontiers in Water |  | 0 |
| 31 | 2022 | article | [Using dissolved organic matter fluorescence to predict total mercury and methylmercury in forested headwater streams, Sleepers River, Vermont USA](https://doi.org/10.1002/hyp.14572) | Hydrological Processes |  | 0 |
| 32 | 2022 | article | [Winter runoff events pose an unquantified continental-scale risk of high wintertime nutrient export](https://doi.org/10.1088/1748-9326/ac8be5) | Environmental Research Letters |  | 0 |
| 33 | 2021 | article | [Diné citizen science: Phytoremediation of uranium and arsenic in the Navajo Nation](https://doi.org/10.1016/j.scitotenv.2021.148665) | Science of The Total Environment |  | 0 |
| 34 | 2021 | article | [Drivers of Dissolved Organic Carbon Mobilization From Forested Headwater Catchments: A Multi Scaled Approach](https://doi.org/10.3389/frwa.2021.578608) | Frontiers in Water |  | 1 |
| 35 | 2021 | article | [Event Scale Relationships of DOC and TDN Fluxes in Throughfall and Stemflow Diverge From Stream Exports in a Forested Catchment](https://doi.org/10.1029/2021JG006281) | Journal of Geophysical Research: Biogeoscienc |  | 0 |
| 36 | 2021 | article | [Fire, water, and biodiversity in the Sierra Nevada: a possible triple win](https://doi.org/10.1088/2515-7620/ac17e2) | Environmental Research Communications |  | 0 |
| 37 | 2021 | article | [Hydrological benefits of restoring wildfire regimes in the Sierra Nevada persist in a warming climate](https://doi.org/10.1016/j.jhydrol.2020.125808) | Journal of Hydrology |  | 0 |
| 38 | 2021 | article | [Limited progress in nutrient pollution in the U.S. caused by spatially persistent nutrient sources](https://doi.org/10.1371/journal.pone.0258952) | PLOS ONE |  | 0 |
| 39 | 2021 | article | [Long‐Term Nitrate Trajectories Vary by Season in Western European Catchments](https://doi.org/10.1029/2021GB007050) | Global Biogeochemical Cycles |  | 0 |
| 40 | 2021 | article | [Megafire affects stream sediment flux and dissolved organic matter reactivity, but land use dominates nutrient dynamics in semiarid watersheds](https://doi.org/10.1371/journal.pone.0257733) | PLOS ONE |  | 0 |
| 41 | 2021 | article | [Scientists' warning on extreme wildfire risks to water supply](https://doi.org/10.1002/hyp.14086) | Hydrological Processes |  | 0 |
| 42 | 2021 | article | [Spatial Persistence of Water Chemistry Patterns Across Flow Conditions in a Mesoscale Agricultural Catchment](https://doi.org/10.1029/2020WR029053) | Water Resources Research |  | 0 |

### CINet (32)

| # | Year | Type | Title | Journal or publisher | Also credits | Out |
|---|---|---|---|---|---|---|
| 1 | 2025 | article | [Empirical Evidence of Dynamic Hydrogeomorphic Feature Inundation in a Lowland Floodplain](https://doi.org/10.1002/hyp.70043) | Hydrological Processes |  | 0 |
| 2 | 2025 | article | [Evaluating Change in the Prevalence of River Anabranching Before and After Agricultural Development in the Upper Midwest, United States](https://doi.org/10.1080/24694452.2025.2502630) | Annals of the American Association of Geograp |  | 0 |
| 3 | 2025 | article | [Evaluation of Human Impact on Sediment Dynamics in an Intensively Managed Agricultural Watershed Using Distributed Modeling](https://doi.org/10.1002/rra.4458) | River Research and Applications |  | 0 |
| 4 | 2025 | article | [Form and Function of Floodplain Secondary Channels in a Lowland Meandering River System](https://doi.org/10.1029/2024JF007871) | Journal of Geophysical Research: Earth Surfac |  | 0 |
| 5 | 2025 | article | [Impacts of geographic variability and geologic history on the distribution of post-settlement alluvium (PSA) across the upper Midwest, USA](https://doi.org/10.1016/j.catena.2025.108939) | CATENA |  | 0 |
| 6 | 2025 | article | [Improving Stream Solute Predictions With a Modified LSTM Model Incorporating Solute Interdependences and Hysteresis Patterns](https://doi.org/10.1029/2024JH000383) | Journal of Geophysical Research: Machine Lear |  | 0 |
| 7 | 2025 | article | [Molecular-level exploration of spatiotemporal dynamics of fluvial particulate organic carbon sources during storm events: Using a high-temporal resolu](https://doi.org/10.1016/j.scitotenv.2025.178447) | Science of The Total Environment |  | 0 |
| 8 | 2025 | article | [Spatial heterogeneity of agricultural evapotranspiration as quantified by satellite and flux tower sources](https://doi.org/10.1016/j.agrformet.2025.110608) | Agricultural and Forest Meteorology |  | 0 |
| 9 | 2025 | article | [Timescales of Drainage Network Evolution Revealed: Spatiotemporal Variability in Drainage Density in the Post-Glacial Central Lowlands, USA](https://doi.org/10.2475/001c.129219) | American Journal of Science |  | 0 |
| 10 | 2024 | article | [Complex Connections: How Information Flow Networks Can Quantify Ecohydrological Interactions](https://doi.org/10.33548/SCIENTIA1137) | Scientia |  | 0 |
| 11 | 2024 | article | [Sensitivity of a meandering lowland river to intensive landscape management: Lateral migration rates before and after watershed-scale agricultural dev](https://doi.org/10.1016/j.ancene.2024.100429) | Anthropocene |  | 0 |
| 12 | 2023 | article | [Causal interaction in high frequency turbulence at the biosphere–atmosphere interface: Structure–function coupling](https://doi.org/10.1063/5.0131469) | Chaos: An Interdisciplinary Journal of Nonlin |  | 0 |
| 13 | 2023 | article | [Emergent role of critical interfaces in the dynamics of intensively managed landscapes](https://doi.org/10.1016/j.earscirev.2023.104543) | Earth-Science Reviews |  | 0 |
| 14 | 2023 | article | [Estimation of hydraulic conductivity in a watershed using sparse multi-source data via Gaussian process regression and Bayesian experimental design](https://doi.org/10.1016/j.advwatres.2023.104489) | Advances in Water Resources |  | 0 |
| 15 | 2023 | article | [Inside the flux footprint: The role of organized land cover heterogeneity on the dynamics of observed land-atmosphere exchange fluxes](https://doi.org/10.3389/frwa.2023.1033973) | Frontiers in Water |  | 0 |
| 16 | 2023 | article | [Storm pulse responses of fluvial organic carbon to seasonal source supply and transport controls in a midwestern agricultural watershed](https://doi.org/10.1016/j.scitotenv.2023.161647) | Science of The Total Environment |  | 0 |
| 17 | 2022 | conference paper | [Advances in Biogeochemical Modeling for Intensively Managed Landscapes](https://doi.org/10.1007/978-3-030-95921-0_6) | Biogeochemistry of the Critical Zone |  | 0 |
| 18 | 2022 | article | [An information theory-based approach to characterize drivers of upstream salmon migration](https://doi.org/10.1371/journal.pone.0269193) | PLOS ONE |  | 0 |
| 19 | 2022 | article | [Antecedent Conditions Control Thresholds of Tile‐Runoff Generation and Nitrogen Export in Intensively Managed Landscapes](https://doi.org/10.1029/2021WR030507) | Water Resources Research |  | 0 |
| 20 | 2022 | article | [Big Pine Creek Ditch revisited: Planform recovery to channelization and the timescale of river meandering](https://doi.org/10.1016/j.geomorph.2022.108140) | Geomorphology |  | 0 |
| 21 | 2022 | conference paper | [Eroded Critical Zone Carbon and Where to Find It: Examples from the IML-CZO](https://doi.org/10.1007/978-3-030-95921-0_5) | Biogeochemistry of the Critical Zone |  | 0 |
| 22 | 2022 | article | [REWTCrunch: A Modeling Framework for Vegetation Induced Reactive Zone Processes in the Critical Zone](https://doi.org/10.1029/2021JG006562) | Journal of Geophysical Research: Biogeoscienc |  | 1 |
| 23 | 2022 | article | [Soil health: Meaning, measurement, and value through a critical zone lens](https://doi.org/10.2489/jswc.2022.00042) | Journal of Soil and Water Conservation |  | 0 |
| 24 | 2022 | article | [Source Relationships and Model Structures Determine Information Flow Paths in Ecohydrologic Models](https://doi.org/10.1029/2021WR031164) | Water Resources Research |  | 0 |
| 25 | 2022 | article | [Thermodynamic basis for the demarcation of Arctic and alpine treelines](https://doi.org/10.1038/s41598-022-16462-2) | Scientific Reports |  | 0 |
| 26 | 2022 | article | [Virtual laboratory for understanding impact of heterogeneity on ecohydrologic processes across scales](https://doi.org/10.1016/j.envsoft.2021.105283) | Environmental Modelling & Software |  | 1 |
| 27 | 2021 | article | [Chains of Spatial and Temporal Precipitation Occurrence Predictability Across the Continental U.S.](https://doi.org/10.3389/fclim.2021.780879) | Frontiers in Climate |  | 0 |
| 28 | 2021 | article | [Convergent Hydraulic Redistribution and Groundwater Access Supported Facilitative Dependency Between Trees and Grasses in a Semi‐Arid Environment](https://doi.org/10.1029/2020WR028103) | Water Resources Research |  | 0 |
| 29 | 2021 | article | [Impacts of Landscape Evolution on Heterotrophic Carbon Loss in Intensively Managed Landscapes](https://doi.org/10.3389/frwa.2021.666278) | Frontiers in Water |  | 0 |
| 30 | 2021 | article | [Magnetic Fly Ash as a Chronological Marker in Post-Settlement Alluvial and Lacustrine Sediment: Examples from North Carolina and Illinois](https://doi.org/10.3390/min11050476) | Minerals |  | 0 |
| 31 | 2021 | article | [The Spatiotemporal Evolution of Storm Pulse Particulate Organic Carbon in a Low Gradient, Agriculturally Dominated Watershed](https://doi.org/10.3389/frwa.2021.600649) | Frontiers in Water |  | 0 |
| 32 | 2020 | article | [“It’s Raining Bits”: Patterns in Directional Precipitation Persistence across the United States](https://doi.org/10.1175/JHM-D-20-0134.1) | Journal of Hydrometeorology |  | 1 |

## Addendum: three records added after the search for the rows with no DOI

Jordan approved these on 2 November 2026 ("add the three sweep records"). They are not in the 292 above or in the JSON file; they were found by searching the 16 skipped rows by title and first author (Crossref, OpenAlex) and by reading two HydroShare landing pages. The products list therefore grows by 295.

| Record | Type | How found | Awards (registry) | Out |
|---|---|---|---|---|
| [Groundwater—The Dynamic Base of the CZ](https://doi.org/10.1007/978-3-031-69076-1_5), *Advances in Critical Zone Science*, 2024 | paper (book chapter) | Crossref title and first author (Sullivan) match PAR's row exactly; the year matches; **high-probability, not certain** | 2012669 | 0 |
| [Depth profiles of soil temperature, moisture, and concentrations of CO2 and O2](https://www.hydroshare.org/resource/9c53ab378b604a8e867cdda0d3ab72fb/), HydroShare, 2024 | dataset | the HydroShare address is in PAR's publisher cell; the landing page answered 200 and its title matches; no DOI is registered for it (`10.4211/hs.<id>` answers `responseCode` 100) | 2012878 | 0 |
| [DWCZ-CO-MEF-Data from Warix et al. (2024), Water-rock interactions drive chemostasis](https://www.hydroshare.org/resource/c4b384a77a0f43cbb2de2d6eae9cf901/), HydroShare, 2023 | dataset | same | 2012730 | 1 (1824330) |

Not matched: the dissertation (Heckman, 2023) and the Eos article ("Life Teems Below the Surface", Chorover, 2020). The best Crossref and OpenAlex candidates were look-alikes (a preprint chapter; a 1925 Science article), so no DOI is proposed.
