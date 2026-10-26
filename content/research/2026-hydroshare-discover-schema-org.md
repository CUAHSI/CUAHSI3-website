---
title: "A New HydroShare Discover Interface, Built on schema.org Metadata"
slug: hydroshare-discover-schema-org-2026
date: 2026-09-29
year: 2026
category: data-infrastructure
tags: [HydroShare, discovery, schema.org, metadata, FAIR]
people_mentioned: []
partners: [DataONE]
funding: "NSF EAR-2535162"
awards: [nsf-2535162]
published: true
excerpt: "CUAHSI released a new HydroShare Discover interface in the second quarter of 2026, built on schema.org metadata that is generated automatically for each resource, and extended that metadata toward a DataCite-based profile ahead of a new FAIRness baseline scan."
---

In the second quarter of 2026 CUAHSI released a redesigned [HydroShare Discover interface](https://www.hydroshare.org/search/) to production. It incorporates the schema.org metadata model and comes with updated documentation, and it has been stable since release with only minor fixes.

Behind it:

- **A schema.org and JSON-LD implementation** was developed further and moved into production. It was extended to HydroShare's content types, and the metadata is generated from user- and system-created metadata and stored on disk alongside each resource. HydroShare's Python client was updated to work with the file-based metadata.
- **A DataCite-aligned extension.** The schema.org implementation was extended toward a more complete DataCite-based profile, capturing fields already in HydroShare that had not been exposed for FAIR scoring, so a before-and-after comparison is meaningful. Remaining gaps against the DataONE MetaDig test suite are documented.
- **A new baseline scan.** The report records a rescan of HydroShare resources by DataONE, described as completed at the end of the third quarter, to establish a FAIRness baseline that later efforts such as the data publishing cohorts can be measured against. The baseline itself is to be completed in the fourth quarter.
- **A prototype redesigned resource landing page** generated from the same metadata and schema, so supporting a different domain's metadata means changing the schema rather than rewriting the page. It was previewed at the June 24 Virtual Open House.

The earlier assessment is described in [the first FAIR assessment of HydroShare](/about/impact/hydrofair-fair-assessment-2025). The [schema.org](https://schema.org/) vocabulary is a community standard, and [DataONE](https://www.dataone.org/) provides the MetaDig framework.
