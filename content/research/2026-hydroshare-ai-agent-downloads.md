---
title: "AI Agents Become a New Kind of HydroShare User"
slug: hydroshare-ai-agent-downloads-2026
date: 2026-09-29
year: 2026
category: data-infrastructure
tags: [HydroShare, AI, data-access, metadata, schema.org]
people_mentioned: []
partners: []
funding: "NSF EAR-2535162"
awards: [nsf-2535162]
published: true
excerpt: "Downloads of HydroShare data by self-identified AI agents rose from 29 between March and December 2025 to 936 between January and August 2026, and the number of agent families active each month grew from one to seven, shaping where CUAHSI invests."
---

How researchers reach data is changing. CUAHSI's download records show that **self-identified AI agents** now pull data from [HydroShare](https://www.hydroshare.org/): 29 downloads between March and December 2025, and 936 between January and August 2026. Over the same period the number of agent families (distinct AI tools or services, identified by the names they report) active each month grew from one to seven. These counts only include agents that identify themselves, and download tracking was about 90% complete when the report was written.

CUAHSI is using the signal to guide where it invests:

- **Metadata that machines can read.** Schema.org metadata is generated automatically and stored alongside each resource, which makes HydroShare data easier for search tools and AI systems to interpret (see [the new Discover interface](/about/impact/hydroshare-discover-schema-org-2026)).
- **Direct programmatic access.** The rebuilt storage layer keeps S3 access and is expected to lower operating costs (see [the storage rebuild](/about/impact/hydroshare-storage-rebuild-2026)). In the final quarter CUAHSI plans to add S3 authentication and connection setup to its Python client, [hsclient](https://github.com/hydroshare/hsclient), so researchers can stream data into analysis libraries such as xarray and GeoPandas without downloading large files first.
- **Resource pages built from schemas,** so the platform can adapt to new self-describing data types without custom development.
- **Reassessing an R client.** CUAHSI paused development of a new R client after finding no clear evidence of demand, and noted that researchers increasingly turn to AI coding assistants, which tend to give more reliable help in Python than in R.

CUAHSI is also leading a community conversation on how AI changes water science and the skills it needs, including a Water Data Forum panel on November 4, 2026.
