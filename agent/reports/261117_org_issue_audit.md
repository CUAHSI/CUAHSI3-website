# Open issues on the organisation repository: what is done

17 November 2026. For Jordan. Read only: nothing on GitHub was changed.

## Why nothing was closing

CUAHSI/CUAHSI3-website had 62 issues, 46 of them open. Work is merged on the fork first and reaches the organisation
in packages. GitHub closes an issue only when a pull request in the same repository says "Closes #N" and is merged
into its main branch. Fork pull requests cannot close organisation issues, and no package description has ever listed the
issues it finished. So every issue stayed open unless someone closed it by hand. 16 were closed that way.

## Method

Three read-only checks, one per epic, read each open issue's "Done when" list and looked for the evidence on the
organisation's main (`upstream/main` 8c169b3). For every path the evidence uses, the fork's main (9bb23c0) is the same.
The two mains differ in 4 files, all logs or the Noticed list. So everything counted as done here is already on
the organisation. A check did not take a pull request's description as proof without opening the file it names. The
guard-hook tests and the log checker were re-run. No build, visual comparison or smoke test was re-run; where a
verdict rests on a pull request's own report, the detail files say so.

Detail, one line per "Done when" item with its evidence: `.agent/issue-audit/site-audit.md`, `code-quality.md`,
`critical-zone.md` (scratch, not committed).

Six verdicts were checked again by hand:
- **3 called done:**
  - #120: `scripts/verify.sh:71-73` fails on `throw createError`, and none is left in `pages/` or `components/`.
  - #104: `agent/reports/261109_audit-parity-news.md` is there.
  - #79: `content/research/2026-cznet-preferential-flow.md` links the section.
- **3 called not done:**
  - #126: `package.json` has no `postinstall`.
  - #108: `raw/youtube/` does not exist.
  - #98: there are no site coordinates in `content/critical-zone/`.

All six agree.

## Counts

| Epic | Open | Done | Partly | Waiting on a decision | Not started |
|---|---|---|---|---|---|
| Site audit (#99 to #113) | 15 | 12 | 3 | 0 | 0 |
| Code quality (#117 to #134) | 17 | 6 | 2 | 0 | 9 |
| Critical Zone (#62 to #141) | 14 | 2 | 4 | 4 | 4 |
| **All** | **46** | **20** | **9** | **4** | **13** |

## Done: proposed to close (20)

Each has every "Done when" item met. Some items were met with a stated limit, given in brackets.

- **Site audit (12):**
  - #100 A1 (navigation and footer links are counted with other page links, not as separate routes)
  - #101 A2 (the hand checks were HTTP requests, not a browser)
  - #102 A3a, #103 A3b, #104 A3c (6 control rows corrected after the script ran), #105 A3d
  - #106 A3e (a comment's request for a list of documents the legacy library never held was not done; it is not a "Done when" item)
  - #107 A3f, #109 A4, #110 A5 (Jordan named four control functions, the agent a fifth), #111 A6
  - #113 A8 (the link was read, not clicked)
- **Code quality (6):**
  - #118 CQ-A1 (137 of 137 hook tests pass; the hook test is not in `verify.sh` or CI)
  - #119 CQ-A2 (60 of 60 at the time; one image renders two ways and some runs flake; not re-run today)
  - #120 CQ-A3 ("rendered HTML unchanged" rests on fork PR 230's own report)
  - #121 CQ-B1 ("shown failing" rests on fork PR 232's own report)
  - #123 CQ-B3
  - #124 CQ-C1 ("numbers and titles unchanged" rests on fork PR 237's report and a spot check)
- **Critical Zone (2):**
  - #79 T13b. Its 6 November comment says "not started", but fork PR 167 did it. The closing comment should say so.
  - #85 T19. Its two items are met by the issue itself. The data stewardship epic it points to does not exist yet, so closing it now or when that epic opens is your call.

## Partly done (9): what is left

| Issue | Left |
|---|---|
| #99 site-audit epic | #108 and #112; a ranked gap list across the audit reports (none exists); your decisions on it |
| #108 A3g cyberseminars | The YouTube channel's full video list (export never received); then the "over 150" count, gaps by series and year, levels for the 20 series pages, a recording check for 45 unmatched event pages, and a plan for the 8 legacy-linked videos still missing |
| #112 A7 cut-over | Owners named for the registrar, DNS, legacy hosting and the Netlify accounts (A7 report, section 3); a staging name; a rollback test; the reconciliation written onto #81, #82, #84 |
| #117 code-quality epic | 10 open tasks; the measures report; the outside reviewer's cold start; decisions 3 to 8 |
| #126 CQ-D1 editor setup | `postinstall: nuxt prepare` (rule 8, yours); an editor check from a fresh clone |
| #62 Critical Zone epic | 13 open tickets (11 once #79 and #85 close); reviewer names, snapshot depositor, DNS owner, go-live address |
| #69 T7 page shell | Only the sitemap entry, which waits on lifting noindex. Could close with that item moved to #70 |
| #81 T15 redirect map | Map drafted; the method and DNS owner (yours), then the rules and their check |
| #82 T16 retirement | Checklist written; all four checks happen at retirement (by July 2027); the DNS owner; your approval of the cutover plan |

## Waiting on a decision (4)

- **#70 T7b index-readiness:** the site address and lifting noindex (rule 8). Also: structured data was skipped by the agent, not by you. Keep it or drop it?
- **#74 T9 narrative pages:** built. Waiting on the reviewers' sign-off, and your answers on the claim 12 wording and the public "August 2027" date.
- **#77 T12 highlights:** you approved the selection. Do you close it on your approval alone, or wait for reviewers (asked on 6 November)?
- **#84 T18 go-live gate:** your visual review, reviewer sign-off, and the go-live address.

## Not started (13)

- **Code quality:**
  - #122 CQ-B2 scenario tests, #125 CQ-C2 procedures as skills, #127 CQ-D2 type check, #128 CQ-D3 Prettier
  - #130 CQ-D5 developer guide, #131 CQ-E1 and #132 CQ-E2 data layer, #133 CQ-E3 utils/types, #134 CQ-E4 Vitest
  - Several need your rule 8 approval for a dependency.
- **Critical Zone:**
  - #65 T3 snapshot (you deferred it; due before August 2027)
  - #83 T17 page-level redirects (after go-live by design)
  - #98 T20 map (you have not picked an option)
  - #141 T21 missing papers (step 0 done; needs the archive's report PDFs saved, about 80 downloads)

## Proposal

1. **Close the 20** (or 19 without #85) through package 7: its description carries one `Closes CUAHSI/CUAHSI3-website#N`
   line for each issue you approve, so they close when you merge it. Each closing line names the fork PR that did the work.
2. **For the 9 partly-done issues**, a comment on each saying what is left (the table above), posted by you or by me
   with your OK. #79 also gets a comment correcting its 6 November progress note.
3. **Stop it recurring:** the package procedure in `docs/procedures.md` lists, in every package description, the
   organisation issues the package finishes, as `Closes` lines. That is a separate PR.
