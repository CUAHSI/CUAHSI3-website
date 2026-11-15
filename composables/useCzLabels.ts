// Display names for the slugs used in content/critical-zone/products.json (`sites`) and helpers shared by the Critical Zone Science pages.
// The slugs are defined in scripts/content-schemas.mjs (CZ_SITES); the names here are labels for display only.
export const CZ_SITE_NAMES: Record<string, string> = {
  national: 'National (cross-CZO)',
  boulder: 'Boulder Creek',
  calhoun: 'Calhoun',
  'catalina-jemez': 'Catalina-Jemez',
  christina: 'Christina River Basin',
  eel: 'Eel River',
  iml: 'Intensively Managed Landscapes',
  luquillo: 'Luquillo',
  reynolds: 'Reynolds Creek',
  'shale-hills': 'Shale Hills',
  sierra: 'Southern Sierra',
  hub: 'CZNet Hub',
  bedrock: 'CZNet Bedrock',
  bigdata: 'CZNet Big Data',
  cinet: 'CZNet CINet',
  coastal: 'CZNet Coastal',
  drylands: 'CZNet Drylands',
  dust2: 'CZNet Dust',
  'dynamic-water': 'CZNet Dynamic Water',
  geomicrobiology: 'CZNet Geomicrobiology',
  urban: 'CZNet Urban',
}

// The CZNet cluster (or the Hub) an NSF award belongs to, read from the cluster named in the award's registry title ("Network Cluster:
// Dust in the Critical Zone ...", "Network Hub: ..."). The records carry no cluster tag on papers, so this is how a paper is placed in a
// cluster. It is an inference from the title, not a field of the data; '' when the title names none.
const CZ_CLUSTER_TITLES: [string, string][] = [
  ['hub', 'Network Hub'], ['bedrock', 'Bedrock controls'], ['dust2', 'Dust in the Critical Zone'], ['geomicrobiology', 'Geomicrobiology'],
  ['drylands', 'pedogenic carbonate'], ['dynamic-water', 'dynamic storage'], ['coastal', 'Coastal Critical Zone'], ['urban', 'Urban Critical Zone'],
  ['bigdata', 'Big Data approaches'], ['cinet', 'CINet'],
]
export function czClusterOfAward(text?: string): string {
  return CZ_CLUSTER_TITLES.find(([, pat]) => (text ?? '').includes(pat))?.[0] ?? ''
}

// The "Where" column of the long lists (components/CzProductList.vue) for a paper with a DOI: the publisher that registered the DOI's
// prefix, so the column names who holds the paper and not just "DOI". Names are Crossref's (api.crossref.org/prefixes/<prefix>, read 5
// November 2026), shortened where Crossref gives a legal form ("Elsevier BV" is "Elsevier"; "Informa UK Limited" is shown as "Taylor &
// Francis" and "Springer Science and Business Media LLC" as "Springer Nature", the agent's choice). The 78 prefixes the 1,565 papers
// with a DOI use are here except three that Crossref does not hold (10.3965, 10.5066, 10.25394); a prefix missing from this table shows "DOI".
export const CZ_PUBLISHERS: Record<string, string> = {
  '10.1002': 'Wiley',
  '10.1007': 'Springer Nature',
  '10.1016': 'Elsevier',
  '10.1017': 'Cambridge University Press (CUP)',
  '10.1021': 'American Chemical Society (ACS)',
  '10.1029': 'American Geophysical Union (AGU)',
  '10.1038': 'Springer Nature',
  '10.1039': 'Royal Society of Chemistry (RSC)',
  '10.1061': 'American Society of Civil Engineers (ASCE)',
  '10.1063': 'AIP Publishing',
  '10.1071': 'CSIRO Publishing',
  '10.1073': 'National Academy of Sciences',
  '10.1080': 'Taylor & Francis',
  '10.1086': 'University of Chicago Press',
  '10.1088': 'IOP Publishing',
  '10.1089': 'Mary Ann Liebert',
  '10.1093': 'Oxford University Press (OUP)',
  '10.1097': 'Ovid Technologies (Wolters Kluwer Health)',
  '10.1098': 'The Royal Society',
  '10.1101': 'Cold Spring Harbor Laboratory',
  '10.1103': 'American Physical Society (APS)',
  '10.1109': 'Institute of Electrical and Electronics Engineers (IEEE)',
  '10.1111': 'Wiley',
  '10.1126': 'American Association for the Advancement of Science (AAAS)',
  '10.1127': 'Schweizerbart',
  '10.1128': 'American Society for Microbiology',
  '10.1130': 'Geological Society of America',
  '10.1139': 'Canadian Science Publishing',
  '10.1144': 'Geological Society of London',
  '10.1146': 'Annual Reviews',
  '10.1155': 'Hindawi',
  '10.1175': 'American Meteorological Society',
  '10.1177': 'SAGE Publications',
  '10.1180': 'Mineralogical Society',
  '10.1186': 'Springer Nature',
  '10.1190': 'Society of Exploration Geophysicists',
  '10.1215': 'Duke University Press',
  '10.12952': 'BioOne',
  '10.13031': 'American Society of Agricultural and Biological Engineers (ASABE)',
  '10.1306': 'American Association of Petroleum Geologists AAPG/Datapages',
  '10.1346': 'Clay Minerals Society',
  '10.1371': 'Public Library of Science (PLoS)',
  '10.1525': 'University of California Press',
  '10.1643': 'American Society of Ichthyologists and Herpetologists (ASIH)',
  '10.1657': 'Institute of Arctic and Alpine Research (INSTAAR)',
  '10.1785': 'Seismological Society of America (SSA)',
  '10.1890': 'Wiley',
  '10.1899': 'Society for Freshwater Science',
  '10.2110': 'Society for Sedimentary Geology',
  '10.2111': 'Elsevier',
  '10.2113': 'GeoScienceWorld',
  '10.2134': 'Wiley',
  '10.2136': 'Wiley',
  '10.2138': 'Mineralogical Society of America',
  '10.22541': 'Authorea',
  '10.2307': 'JSTOR',
  '10.2475': 'American Journal of Science (AJS)',
  '10.2489': 'Soil and Water Conservation Society',
  '10.3133': 'US Geological Survey',
  '10.3189': 'International Glaciological Society',
  '10.3354': 'Inter-Research Science Center',
  '10.33548': 'Science Diffusion',
  '10.3389': 'Frontiers',
  '10.3390': 'MDPI',
  '10.3733': 'University of California Agriculture and Natural Resources (UC ANR)',
  '10.3808': 'International Society for Environmental Information Science (ISEIS)',
  '10.3844': 'Science Publications',
  '10.3897': 'Pensoft Publishers',
  '10.4172': 'OMICS Publishing Group',
  '10.4209': 'Taiwan Association for Aerosol Research',
  '10.4319': 'Wiley',
  '10.5194': 'Copernicus GmbH',
  '10.5334': 'Ubiquity Press',
  '10.5408': 'Taylor & Francis',
  '10.5772': 'IntechOpen',
}
export const czPublisher = (doi?: string): string => CZ_PUBLISHERS[(doi ?? '').split('/')[0]] ?? ''

// Repository names that appear under more than one spelling in the datasets' `repository` field; the "Where" column shows one.
const CZ_REPOSITORY_SPELLINGS: Record<string, string> = {
  AMERIFLUX: 'AmeriFlux', Ameriflux: 'AmeriFlux', 'figshare Academic Research System': 'figshare',
}
export const czRepositoryName = (repository?: string): string => CZ_REPOSITORY_SPELLINGS[repository ?? ''] ?? repository ?? ''
