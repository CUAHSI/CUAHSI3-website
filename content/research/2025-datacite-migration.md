---
title: "HydroShare Migrates DOI Registration to DataCite, Simplifying NSF Public Access Reporting"
slug: datacite-doi-migration-2025
date: 2025-12-01
year: 2025
category: data-infrastructure
tags: [HydroShare, DOI, DataCite, NSF-PAR, FAIR, metadata, open-science]
people_mentioned: [lindsay-platt, martin-seul]
partners: [DataCite, Crossref]
funding: NSF EAR-1849458
awards: [nsf-1849458]
published: true
excerpt: "HydroShare completed migration of all DOI registration from Crossref to DataCite, a registry better suited for data publication, with a direct benefit for researchers: NSF Public Access Repository submissions can now be auto-populated from a HydroShare DOI, importing author, title, and abstract without manual re-entry."
---

HydroShare completed a full migration of its digital object identifier (DOI) registration from Crossref to DataCite, the leading metadata registry for research data. DataCite's richer metadata schema is better aligned with data publication than Crossref, which was originally designed for journal articles.

The migration involved a new publishing workflow, development of bulk migration tooling to move existing DOIs registered under Crossref, coordination with both DataCite and Crossref for the transfer of the CUAHSI DOI prefix, and successful staging and testing in HydroShare's beta environment before the production release in version 3.13.0.

The most immediate practical benefit for researchers: NSF Public Access Repository (PAR) submissions can now be auto-populated using only a HydroShare DOI: metadata including author, title, and abstract import directly into the PAR submission form, eliminating manual re-entry. This directly reduces the compliance burden on PIs whose NSF grants require public access reporting.

A longer-term benefit is improved alignment with FAIR data principles, particularly in the Findable and Interoperable dimensions, as DataCite's schema supports richer, more structured metadata than what Crossref offered for HydroShare resources.

HydroShare's release notes are on [GitHub](https://github.com/hydroshare/hydroshare/releases), and DataCite is at [datacite.org](https://datacite.org/). Covered in the [CUAHSI 2025 Annual Report](/documents/annual-reports/annual-report-2025.pdf).
