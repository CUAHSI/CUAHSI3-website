# Proposal: the Women Advancing River Research (WARR) lectures as cyberseminar items

Content task from audit A3g (org issue 108), 6 November 2026. **Nothing is applied: this is the proposal ("Propose, then apply", more than five items). Jordan approves, changes or refuses each part below.** Branch `content/cyberseminars-warr` (cut from the fork's main at 01e32c0); only `agent/` has changed so far.

## Why

The legacy site's six yearly WARR pages are the only recording archive it holds: 63 lectures, each with a date, a title linked to its YouTube video, and the speakers with their institutions. The new site has none of them (A3g, finding 1), although `warr-archive-cuahsi-2026` says CUAHSI took over the archive in 2026.

## Part 1. Add 63 items to `content/cyberseminars/` (new)

- **Source of every fact (C2):** the six legacy pages `/cyberseminars/<year>-women-advancing-river-research-lecture-series`, saved in the 6 November 2026 snapshot. Nothing else was used except for the two spelling fixes below.
- **Counts (denominators):** 63 lectures: 2021 11, 2022 11, 2023 11, 2024 11, 2025 11, 2026 8. 63 of 63 have a video id; 63 distinct ids; **63 of 63 answered 200** on YouTube's oEmbed (public, on the CUAHSI channel); **62 of 63** page titles equal YouTube's title (the 63rd is listed below). 118 speakers, **118 of 118 with an institution**. No video id is already in `content/` (0 duplicates, C4); 63 distinct slugs. Run through `npm run validate:content` in a trial: 88 cyberseminar files (25 existing + 63), 0 failures; the trial files were then removed.
- **File names** (C13: `YYYY-slug.md`): `2021-warr-<short title>.md`. Slugs `warr-YYYY-MM-<first words of the title>` (they drive identity, never change once published).
- **Fields:** `title` as on the page; `slug`; `series: Women Advancing River Research (WARR)`; `series_slug: women-advancing-river-research-lecture-series` (the legacy series address); `date` the lecture date on the page; `youtube_id`; `speakers` and `speaker_orgs` as listed on the page; `tags: [women-advancing-river-research]`; `published: true`; `description` one factual sentence (see judgment calls). No transcript flag, no speaker emails.
- **One by hand (rule: more than ten items):** the first, a middle and the last of the 63 are in the "Example files" section; the generator is `agent/audit/warr-build.mjs` (it reads the snapshot and writes the files; `--preview` shows three, `--write` writes all).

### Agent's judgment calls (C7), each yours to change

1. **`description`** is required by the schema and the page gives none. I wrote one sentence from the facts only: "A Women Advancing River Research webinar on February 25, 2021, with Berit Arheimer (Swedish Meteorological & Hydrological Institute)." The alternative is to leave these items out until someone writes real descriptions, or to make `description` optional (a schema change, its own code PR).
2. **Two spelling fixes to the legacy page's text:** "llison Pfeiffer" to **Allison Pfeiffer** (22 September 2022; a geologist at Western Washington University, checked against the department's page) and "The Nature Conservatory" to **The Nature Conservancy** (19 September 2024). Both are in the CSV; if you would rather keep the source's spelling, say so.
3. **One title differs from YouTube's** (17 March 2022): the page says "The Hard Science of “Soft” Geomorphology: Flow Vegetation Organic Carbon Feedback in Rivers & Floodplains"; YouTube holds "…Flow Vegetation-Organic-Carbon in Rivers & Floodplains". I used the page's title, as for the other 62.
4. **Series name and tag:** one series chip, "Women Advancing River Research (WARR)", and one tag. The page adds a series chip and a tag chip, and the list grows from 21 published cards to 84.
5. **No pagination:** `/learn-train/cyberseminars` renders every published item as a card, so 84 cards with a thumbnail each; whether that is acceptable on a phone needs a human look on the deploy preview.

### To verify (C3; not guessed)

- Allison Pfeiffer and The Nature Conservancy (above), by someone who knows the lecture.
- That the 63 lecture dates are the lecture dates and not the date the videos were published: the legacy pages give the lecture date; the channel's feed shows 11 of the videos published on 19 October 2026, so the upload date is not the lecture date, and the pages' dates were used.
- The 2026 page lists 8 lectures with videos. The WARR session announced for 19 November 2026 has no video yet and is not included.
- **Two more misspellings copied from the legacy page** (found by the reviewer; not fixed, because only two fixes were approved): "Pacific Northwestern National Laboratory" (2025, probably Pacific Northwest National Laboratory) and "Vrije University of Amsterdam" (2026, the institution is usually written Vrije Universiteit Amsterdam). Kept as the source has them; say if you want them fixed.
- Whether `Tulane University, U.S.` (the page's wording for one speaker's institution) should lose the ", U.S."; kept as the source has it.

## Part 2. Two existing unpublished items with malformed video ids (change)

`nav-beyond-academic-ai-2025` (`GMeAjRTsM`, 9 characters) and `nav-beyond-academic-broader-impacts-2025` (`Y483oWkQ`, 8): both ids cannot be real (YouTube ids have 11). Proposal: set `youtube_id` to an empty string in both (the schema allows empty and the card then has no embed); they stay `published: false`; the right ids go in when the channel list is in. 2 files, one line each. Alternative: leave them until the Studio export arrives.

## Part 3. Two published items whose videos have no public thumbnail (decision)

`intro-compute-services-july-2024` (`h3Lsyc8duHI`) and `intro-hydroshare-may-2024` (`0sJVFohvhBQ`): oEmbed did not answer 200 and the thumbnail answers 404 (A3g, finding 4). Options: **(a)** leave both as they are until someone with channel access says whether the videos are private, deleted or embed-disabled (recommended; nothing visible changes); **(b)** set `youtube_id` empty so each card shows as text with no broken picture; **(c)** unpublish both (`published: false`). I recommend (a), then (b) if the channel check takes more than a week.

## Not in this proposal (code, separate PRs, each with its reason)

- A check that `youtube_id` is empty or 11 characters from `A-Z a-z 0-9 _ -` in `scripts/content-schemas.mjs`. It must follow Part 2, or the validator would fail on the two malformed ids (C1).
- The page's hero says "350+ free recordings on water science"; the site publishes 21 items today (84 with this batch) and the legacy site claims "over 150". Which number is true needs the channel's list (A3g, "What I need"). The claim is in `pages/learn-train/cyberseminars/index.vue`, which is code, so it is a separate PR, and it is unchanged here.

## The 63 lectures

| date | title | speakers | slug (after `warr-`) |
|---|---|---|---|
| 2021-02-25 | River Flow in Catchment Modelling Using HYPE for Water Management, Open Science & Global Dev… | Berit Arheimer | `2021-02-river-flow-in-catchment-modelling-hype` |
| 2021-03-24 | Multi-variable Ensemble-based Parameter and Uncertainty Estimation for a Global Hydrological… | Petra Döll | `2021-03-multi-variable-ensemble-based-parameter-uncertainty` |
| 2021-04-28 | Surface Water-Groundwater Connectivity Controls on Critical Zone Processes | Kamini Singha | `2021-04-surface-water-groundwater-connectivity-controls` |
| 2021-05-18 | Integrating Place-based, Indigenous and Situated Knowledges in the Study of Glaciated Waters… | Michèle Koppes | `2021-05-integrating-place-based-indigenous-situated-knowledges` |
| 2021-06-15 | The Importance of Plants for River Geomorphology | Angela Gurnell | `2021-06-importance-of-plants-river-geomorphology` |
| 2021-07-20 | Streambed Tapestries: Stream-Groundwater Mixing & Relationships with Morphology, Metals, & M… | Audrey Sawyer | `2021-07-streambed-tapestries-stream-groundwater-mixing-relationships` |
| 2021-08-13 | Riverine Invasive Species Management – Thinking Outside the Box | Tanya Doody | `2021-08-riverine-invasive-species-management-thinking-outside` |
| 2021-09-15 | Transport Mechanisms Across Geomorphic Transitions | Paola Passalacqua | `2021-09-transport-mechanisms-geomorphic-transitions` |
| 2021-10-20 | How Turbulence, Jamming, and Bed Structure Explain Variations in the Onset of Sediment Motio… | Elowyn Yager | `2021-10-turbulence-jamming-bed-structure-explain-variations` |
| 2021-11-08 | River Processes in Landscape Evolution Models: Possibilities for the Next Decade | Nicole Gasparini | `2021-11-river-processes-in-landscape-evolution-models` |
| 2021-12-10 | Modification of Waves and Water Flows Through the Presence of Coastal Wetlands | Iris Moeller | `2021-12-modification-of-waves-water-flows-through` |
| 2022-02-17 | From Soils to Streams: The Structure and Function of the Critical Zone in the Anthropocene | Pamela Sullivan | Li Li | `2022-02-soils-to-streams-structure-function` |
| 2022-03-17 | The Hard Science of “Soft” Geomorphology: Flow Vegetation Organic Carbon Feedback in Rivers … | Katherine Lininger | Laurel Larsen | `2022-03-hard-science-of-soft-geomorphology-flow` |
| 2022-04-14 | From Mountains to Deserts: Changes in Snow and Flood Intensity and Intermittence | Adrienne Marshall | Efrat Morin | `2022-04-mountains-to-deserts-changes-in-snow` |
| 2022-05-19 | Connectivity Between Landscapes & Riverscapes and Management | Josie Geris | Dörthe Tetzlaff | `2022-05-connectivity-between-landscapes-riverscapes-management` |
| 2022-06-02 | River Sediments, Nutrients and Microbe Interactions in Flat Landscapes | Judy Yang | Genevieve Ali | `2022-06-river-sediments-nutrients-microbe-interactions` |
| 2022-07-21 | Exploring River ‘Memory’ Under a Changing Hydrological Regime | Annie Ockelford | Kristin Jaeger | `2022-07-exploring-river-memory-changing-hydrological-regime` |
| 2022-08-25 | Recharge and Water Management: A Case Study of Riobamba Aquifer in the Tropical Andes | Carla Manciati | Xiaofan Yang | `2022-08-recharge-water-management-case-study` |
| 2022-09-22 | The Origin and Fate of Volcanic Sediments in Fluvial Systems | Allison Pfeiffer | Karen Gran | `2022-09-origin-fate-of-volcanic-sediments` |
| 2022-10-13 | Understanding a River’s Legacy for Restoration | Virginia Ruiz-Villanueva | Lina Polvi Sjöberg | `2022-10-understanding-river-legacy-restoration` |
| 2022-11-10 | Groundwater and Surface Water Chemistry Across Multiple Scales | Anna Lintern | Ilja van Meerveld | `2022-11-groundwater-surface-water-chemistry-multiple-scales` |
| 2022-12-08 | Channel-Bed Erosion in River Systems and Mitigation Measures | Elli Papangelakis | Astrid Blom | `2022-12-channel-bed-erosion-in-river-systems` |
| 2023-01-26 | Rivers without Biology | Annegret Larsen | Janine Castro | `2023-01-rivers-without-biology` |
| 2023-02-16 | Disturbed Rivers and their Recovery | Sarah Schanz | Ellen Wohl | `2023-02-disturbed-rivers-their-recovery` |
| 2023-03-16 | River Networks as Bioreactors from the Mediterranean to the Poles | Arial Shogren | Susana Bernal | `2023-03-river-networks-as-bioreactors-mediterranean` |
| 2023-04-20 | Urban Stream Flow and Quality Across Scales: The Importance of Infrastructure | Aditi Bhaskar | Sarah Ledford | `2023-04-urban-stream-flow-quality-scales-importance` |
| 2023-05-18 | Connecting River Patterns with Watershed and Landscape Processes | Julia Perdrial | Diana Karwan | `2023-05-connecting-river-patterns-watershed-landscape-processes` |
| 2023-06-15 | Large- and Small-Scale Controls on Sediment Transport Processes | Rebecca Hodge | Desiree Tullos | `2023-06-large-small-scale-controls-on-sediment` |
| 2023-07-20 | Climate Change, Water Quality, and the Future of Our Rivers | Erin Seybold | Nandita Basu | `2023-07-climate-change-water-quality-future` |
| 2023-08-17 | Hydrological Data Synthesis to Understand Streamflows | Kendra Kaiser | Hilary McMillan | `2023-08-hydrological-data-synthesis-to-understand-streamflows` |
| 2023-09-21 | Confronting the Ghosts of Nutrients Past, Present and Future in Water Quality Management | Kim Van Meter | Jana Compton | `2023-09-confronting-ghosts-of-nutrients-past-present` |
| 2023-10-19 | Beavers: The Original Log Transformation | Emily Fairfax | Cherie Westbrook | `2023-10-beavers-original-log-transformation` |
| 2023-11-16 | Water Quality Across Watersheds in the U.S. and Australia | Danlu Guo | Charuleka Varadharajan | `2023-11-water-quality-watersheds-in-australia` |
| 2024-01-18 | State of the Art and New Developments in Drought Research | Lena M. Tallaksen | Anne van Loon | `2024-01-state-of-art-new-developments` |
| 2024-02-15 | Fire and Water | Sheila Murphy | Gabrielle Boisrame | `2024-02-fire-water` |
| 2024-03-21 | Integrating Hydrologic Modeling and Field Data with Local Knowledge Holders | Kendra Kaiser | Gene-Hua Crystal Ng | `2024-03-integrating-hydrologic-modeling-field-data-local` |
| 2024-04-18 | Greenhouse Gas Emissions from Inland Waters: Reach Through Global Scale | Amanda G. DelVecchia | Taylor Maavara | `2024-04-greenhouse-gas-emissions-inland-waters-reach` |
| 2024-05-16 | Catalyzing Change in the Geosciences | Rebecca Barnes | Rocío Paola Caballero-Gill | `2024-05-catalyzing-change-in-geosciences` |
| 2024-06-20 | Unravelling Water Pathways and their Impact on Water Quality Dynamics | Julia L. A. Knapp | Catalina Segura | `2024-06-unravelling-water-pathways-their-impact` |
| 2024-07-18 | Landscape Disturbance and River Water Quality: Long- and Short-Term Impacts | Christa Kelleher | Heather Golden | `2024-07-landscape-disturbance-river-water-quality-long` |
| 2024-08-15 | Salty Waters: Understanding De-icer Dynamics and Impacts from Source to Stream | Lauren McPhillips | Claire Oswald | `2024-08-salty-waters-understanding-de-icer-dynamics` |
| 2024-09-19 | Braided and Meandering: Making a Career in Water and Rivers Outside Academia | Kate Brauman | Robin Abell | Michele Thieme | Ingrid Timboe | `2024-09-braided-meandering-making-career-in-water` |
| 2024-10-17 | Non-Perennial Streams Over Space and Time | Julianne Scamardo | Sarah Godsey | `2024-10-non-perennial-streams-over-space-time` |
| 2024-11-21 | Energy Fluxes in Streams and Rivers | Joanna Blaszczak | Erin Hotchkiss | `2024-11-energy-fluxes-in-streams-rivers` |
| 2025-01-16 | Hot Water: Integrated Modeling for Watershed Fire Impacts and in Stream Thermal Habitats | Xingyuan Chen | Alison Appling | `2025-01-hot-water-integrated-modeling-watershed-fire` |
| 2025-02-20 | Climate, Water, and Society: Unraveling Complex Interactions Through Decision-Relevant Clima… | Antonia Hadjimichael | Penelope Mitchell | `2025-02-climate-water-society-unraveling-complex-interactions` |
| 2025-03-20 | Navigating Smooth and Choppy Waters: Collaboration Stories and Strategies | Julia Perdrial | Lixin Jin | Lauren Lowman | `2025-03-navigating-smooth-choppy-waters-collaboration-stories` |
| 2025-04-17 | (Reverse) Water System Justice | J. (Joyeeta) Gupta | Marguerite A. Xenopoulos | `2025-04-reverse-water-system-justice` |
| 2025-05-15 | Hydrologic Extremes and Their Impacts on Water Quality | Manuela Brunner | Jenny Druhan | `2025-05-hydrologic-extremes-their-impacts-on-water` |
| 2025-06-18 | Key Drivers of Carbon Fluxes in Watersheds: Hydro-biogeochemistry, Weathering, and Extreme E… | Bryn Stewart | Bhavna Arora | `2025-06-key-drivers-of-carbon-fluxes` |
| 2025-07-17 | Collaborating Across Disciplines and Methods to Understand Non-perennial Streams | Margaret Zimmer | Amy Burgin | `2025-07-collaborating-disciplines-methods-to-understand` |
| 2025-08-21 | Water and Infectious Diseases | Avriel Diaz | Anna Stewart Ibarra | `2025-08-water-infectious-diseases` |
| 2025-09-18 | Dynamic Urban Streams | Beth Herndon | Anne Jefferson | `2025-09-dynamic-urban-streams` |
| 2025-10-16 | Geomorphic Process Drivers in Unconfined, Alluvial River Corridors at Varying Temporal Scale… | Sara Rathburn | Anna Marshall | `2025-10-geomorphic-process-drivers-in-unconfined-alluvial` |
| 2025-11-20 | Water Above- and Below-Ground | Holly Barnard | Theresa Blume | `2025-11-water-above-below-ground` |
| 2026-01-15 | Navigating Funding Uncertainties | Laura Lautz | Kathleen Boomer | `2026-01-navigating-funding-uncertainties` |
| 2026-02-19 | Troubled Waters: Hidden Challenges for Water Quality | Carolin Winter | Ashley Helton | `2026-02-troubled-waters-hidden-challenges-water-quality` |
| 2026-03-19 | Climate Impacts on Weathering and Flow | Sara Warix | Jennifer McIntosh | `2026-03-climate-impacts-on-weathering-flow` |
| 2026-04-16 | Water at the Top of the World | Joanmarie Del Vecchio | Anastasia Piliouras | `2026-04-water-at-top-of-world` |
| 2026-04-30 | Managing for Water Scarcity in the Western United States | Debra Perrone | Elizabeth Koebele | `2026-04-managing-water-scarcity-in-western` |
| 2026-05-21 | Carbon Transport and Processing Across Land-Ocean Continuum | Suzanne Tank | Jorien Vonk | `2026-05-carbon-transport-processing-land-ocean-continuum` |
| 2026-06-18 | Water Quality and Water Scarcity | Michelle T.H. van Vliet | Maryna Strokal | `2026-06-water-quality-water-scarcity` |
| 2026-07-16 | Riparian Wetlands as River Modulators Across Landscapes | Lijing Wang | Amy Hansen | `2026-07-riparian-wetlands-as-river-modulators-landscapes` |

## Example files

The first, a middle and the last file the generator would write are in `agent/audit/warr-example-files.md` (printed with `--preview`).

## Decision and result (added 6 November 2026, after Jordan's reply)

Jordan approved Parts 1 and 2 and chose option (c) for Part 3 (unpublish both). Applied: 63 files added, `youtube_id` emptied in the two malformed items, `published: false` in `intro-compute-services-july-2024` and `intro-hydroshare-may-2024`. Correction to this proposal: the page lists **82** published cards (21 - 2 + 63), not 84; checked in the built page (82 thumbnails, 64 mentions of the series name: 63 cards and the filter chip). `verify.sh --build`: 0 FAIL; the validator passes on 88 cyberseminar files.

Slugs and descriptions were refined before anything was applied (reviewer, cosmetic): the slug keeps words of 2 letters ("de-icer") and takes up to 6 words without ending on a preposition; a description with three or more speakers reads "A (x), B (y) and C (z)". The table above is the final set.
