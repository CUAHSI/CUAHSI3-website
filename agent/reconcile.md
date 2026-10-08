# Reconcile: establish what the repo actually contains

Roadmap task 1. Read-only. You change no code and no content. The output is a report
at `agent/reports/YYMMDD_reconcile.md` and a short summary to Jordan.

Why this exists: the site was built in a sandbox and copied into the repo by hand as
zip files. At least two fixes were delivered and not copied. Every statement in
`CLAUDE.md` and `agent/content-model.md` about what a file contains is a claim until
this report confirms it.

Branch: `task/reconcile`. The only files in the diff are the report, the roadmap
status and the eval log.

## Part A. The seven checks

For each, record: the command you ran or the file and lines you read; what you
found; and one of `confirmed`, `not as described`, or `could not determine`. Quote
the relevant lines. Do not fix anything.

1. **News filter.** Does `pages/community/news/index.vue` filter on
   `_path?.startsWith('/news/')`? Also check `pages/community/news/[slug].vue` and
   the homepage for any `queryContent('news')`.
2. **Header.** Does `components/AppHeader.vue` have a mobile hamburger at the `md`
   breakpoint, and exactly these five nav items: About, Data & Computing, Learn &
   Train, Community, Hire CUAHSI?
3. **Filename migration.** List every file in `content/newsletter/` and
   `content/cyberseminars/` whose name does not match `YYMMDD-slug.md`. Give counts
   with denominators for each directory. Then do the same for every other dated
   collection (`events`, `research`, `news`, `jobs`).
4. **impactTag values.** Find the `impactTag` values on the Data & Computing page.
   Collect every distinct tag in `content/research/` frontmatter (parse the YAML; do
   not regex across lines). For each `impactTag`, report how many research entries
   carry it, matching case exactly as the code does. A count of zero means that
   strip renders empty.
5. **Stale route.** Does `pages/programs/` exist? If so, list its files and say
   whether anything links to `/programs/...`.
6. **Global CSS.** Does `assets/css/global.css` exist, is it referenced in
   `nuxt.config.ts`, and do the `.rgrid` rules match the Layout section of
   `CLAUDE.md`, including the compound selector at 900px? Quote the rules.
7. **Build.** Run `./scripts/verify.sh --build`. Record every FAIL and WARN, and
   every prerender warning or 404 in the build output, with the route.

## Part B. Inventory

The roadmap tasks need these numbers as a baseline. Counts only; no changes.

- **Routes.** Every file under `pages/`, with its route. Mark any not in the page
  tree below, and any in the tree that are missing.
- **Components.** Every file under `components/`, with size and where it is used.
  Say whether `CommunityHero.vue` exists.
- **queryContent calls.** Every call, with file, line, the collection queried, and
  whether a prefix collision is possible given the directories in `content/`.
- **Inline styles.** Per file: number of `style="` attributes, and number of
  `.rgrid` uses. Total across the repo. This is the denominator for task 4.
- **`<component :is>`** uses, with file and line.
- **`v-for` over elements containing `<img>`**, with file, line and what the key is.
- **Content.** File count per collection. For each collection, the set of
  frontmatter keys actually in use and how many files use each ("`featured`: 12 of
  43"). Compare against `agent/content-model.md` and list keys that are documented
  but unused, and used but undocumented. This is the input to task 2.
- **Tooling.** Whether ESLint, Prettier, any test runner, any CI workflow, a
  `content.config.ts`, a `netlify.toml` and a `.gitignore` entry for `.agent/` exist.
  Node and Nuxt versions from `package.json` and the lockfile.

Expected page tree, from the previous agent's memory:

```
/                          /about                     /about/governance
/about/membership          /about/impact              /about/impact/[slug]
/about/team                /about/team/[slug]         /data-platforms
/learn-train               /learn-train/cyberseminars /learn-train/programs/[slug]
/learn-train/archive       /community                 /community/campus-visits
/community/events          /community/events/[slug]   /community/jobs
/community/news            /community/news/[slug]     /community/newsletter
/community/newsletter/[slug]  /hire-cuahsi            /contact
/support                   /member-portal             /highlights (301 stubs)
```

## Part C. Corrections to the instructions

List every statement in `CLAUDE.md`, `agent/content-model.md` or `agent/roadmap.md`
that the repo contradicts. Propose the corrected wording. Do not edit those files in
this task; Jordan approves the corrections first.

## Report format

```
# Reconcile report, YYMMDD
Commit examined: <hash>

## Summary
N of 7 checks confirmed; N not as described; N could not determine.
The three findings that matter most, one line each.

## Part A  (one section per check: evidence, finding, status)
## Part B  (tables)
## Part C  (corrections proposed)
## Proposed fix tasks  (one line each, smallest first; Jordan decides)
## Sample  (which files you opened in full to confirm the bulk counts)
```

Then tell Jordan the Summary and the proposed fix tasks, and stop.
