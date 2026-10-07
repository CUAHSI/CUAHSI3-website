---
title: "HydroShare Rebuilds Its Storage Layer After MinIO Ends Its Open-Source Edition"
slug: hydroshare-storage-rebuild-2026
date: 2026-09-29
year: 2026
category: data-infrastructure
tags: [HydroShare, cloud, storage, open-source, sustainability]
people_mentioned: []
partners: [Utah State University]
funding: "NSF EAR-2535162"
published: true
excerpt: "When MinIO ended development of its community edition, the object storage software under HydroShare, CUAHSI rebuilt quota management, external storage and direct S3 access on Google Cloud Storage, removing a component that accounted for roughly a quarter of HydroShare's compute costs, and the effect on costs is still being measured."
---

In 2026 HydroShare's object storage software, MinIO, ended active development and distribution of its open-source community edition and pointed users to a commercially licensed product. HydroShare relied on it for three things: per-user storage quotas, external storage with lifecycle policies, and direct S3 access governed by HydroShare's access controls. Running an unmaintained component at the center of the repository would have carried growing security and reliability risk, and licensing the replacement would have added a recurring cost, so CUAHSI rebuilt those capabilities on an architecture that uses Google Cloud Storage directly.

What changed:

- **Quota management** (the 20 GB per-user allocation) moved into HydroShare's Django backend, with configuration added for external storage and lifecycle policies.
- **A new S3 authentication proxy**, deployed on Google Cloud Run, keeps direct S3 access while enforcing HydroShare's application-level access controls. A dedicated proxy can run alongside each external bucket, which keeps its traffic and billing separate from the rest of HydroShare and makes it possible to bundle egress costs with the bucket.
- **MinIO was replaced**, which removes a component that accounted for roughly a quarter of HydroShare's compute costs. CUAHSI has built a cost-tracking dashboard and will report the trend against a baseline once it is complete. The same work supports the external storage mounts piloted with the Cooperative Institute for Research to Operations in Hydrology (CIROH).
- **Operations stayed stable.** HydroShare had five minor releases through August 2026, backups ran on schedule, and 351 resources were published between January 1 and August 31, 2026 (the report's award table counts 325 issued permanent DOIs). The full application was deployed on Cloud Run, a managed serverless platform, on September 29, 2026, instead of self-managed Kubernetes, and CUAHSI will evaluate the cost savings with daily data after the move.

The work was carried out with Utah State University developers, who contributed through a subaward and code review. HydroShare's code and issues are tracked publicly on [GitHub](https://github.com/hydroshare/hydroshare). It was supported by [NSF award 2535162](https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2535162), "Sustained Resources: Advancing Water Science Through Integrated Water Data Management and Community Support" (January 2026 to December 2028).
