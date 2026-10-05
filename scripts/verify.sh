#!/usr/bin/env bash
# Verification suite for the CUAHSI website. Run before every commit.
#   ./scripts/verify.sh            static checks only (seconds)
#   ./scripts/verify.sh --build    static checks, then npm run build:search
# FAIL blocks a commit. WARN must be read and either fixed or explained in the PR.
# A clean run does not mean the pages look right. See CLAUDE.md rule 2.

BASE="${VERIFY_BASE:-main}"
CODE_DIRS=()
for d in pages components layouts; do [ -d "$d" ] && CODE_DIRS+=("$d"); done
[ -f app.vue ] && CODE_DIRS+=("app.vue")

fails=0; warns=0
fail() { echo "FAIL  $1"; fails=$((fails+1)); }
warn() { echo "WARN  $1"; warns=$((warns+1)); }
ok()   { echo "ok    $1"; }
need() { if [ -n "$CI" ]; then fail "$1"; else warn "$1"; fi; }   # a missing prerequisite: FAIL in CI, WARN locally

if [ ${#CODE_DIRS[@]} -eq 0 ]; then echo "Run from the repo root (no pages/ or components/ here)."; exit 2; fi

# 1. Unbalanced backticks: a mangled template literal from a bulk edit (footgun 9)
out=$(find "${CODE_DIRS[@]}" -name '*.vue' -print0 | while IFS= read -r -d '' f; do
  n=$(grep -o '`' "$f" | wc -l); [ $((n % 2)) -ne 0 ] && echo "      $f ($n backticks)"
done)
[ -n "$out" ] && { fail "unbalanced backticks:"; echo "$out"; } || ok "backticks balanced"

# 2. (removed) The apostrophe-in-static-style check flagged every font-family quote,
#    231 lines in 21 files that all build. See CLAUDE.md, footgun 3.

# 3. grid-template-columns inside a style attribute, static or bound (Layout section)
out=$(grep -rnE --include='*.vue' 'style="[^"]*grid-template-columns' "${CODE_DIRS[@]}")
[ -n "$out" ] && { fail "grid-template-columns in a style attribute:"; echo "$out" | sed 's/^/      /'; } || ok "no inline grid-template-columns"

# 4. Component resolved by string name between a link and NuxtLink (footgun 2)
out=$(grep -rnE --include='*.vue' ":is=\"[^\"]*'(a|NuxtLink|nuxt-link)'" "${CODE_DIRS[@]}")
[ -n "$out" ] && { fail "<component :is> with a string tag name; renders but does not navigate:"; echo "$out" | sed 's/^/      /'; } || ok "no string-resolved link components"

# 5. JSON validity in content/
if [ -d content ]; then
  out=$(find content -name '*.json' -print0 | while IFS= read -r -d '' f; do
    node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$f" 2>/dev/null || echo "      $f"
  done)
  [ -n "$out" ] && { fail "invalid JSON in content/:"; echo "$out"; } || ok "content JSON parses"
fi

# 6. queryContent prefix collisions (footgun 1). For every pair of content
#    directories where one name is a prefix of another (news / newsletter), each
#    file that queries the shorter one must filter on '/name/'.
if [ -d content ]; then
  dirs=$(find content -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)
  hit=0
  for a in $dirs; do for b in $dirs; do
    [ "$a" != "$b" ] && case "$b" in "$a"*)
      files=$(grep -rlE "queryContent\(\s*['\"]/?$a/?['\"]" "${CODE_DIRS[@]}" composables 2>/dev/null)
      for f in $files; do
        grep -q "startsWith(['\"]/$a/['\"])" "$f" || { warn "$f queries '$a' with no startsWith('/$a/') filter; it will also return '$b'"; hit=1; }
      done ;;
    esac
  done; done
  [ $hit -eq 0 ] && ok "no unfiltered prefix-colliding queryContent calls"
fi

# 7. findOne() with no .catch nearby (footgun 5). Heuristic: read each hit.
out=$(grep -rn -A2 'findOne()' "${CODE_DIRS[@]}" composables 2>/dev/null | awk '
  /findOne\(\)/ { if (pending != "") print pending; pending=$0; next }
  /\.catch/     { pending="" }
  /^--$/        { if (pending != "") print pending; pending="" }
  END           { if (pending != "") print pending }' | grep -v '\.catch')
[ -n "$out" ] && { warn "findOne() with no .catch within two lines:"; echo "$out" | sed 's/^/      /'; } || ok "findOne() calls have .catch"

# 8. createError in pages (footgun 6). Heuristic.
if [ -d pages ]; then
  out=$(grep -rn 'throw createError' pages)
  [ -n "$out" ] && { warn "throw createError in a page; breaks client-side navigation in dev:"; echo "$out" | sed 's/^/      /'; } || ok "no throw createError in pages"
fi

# 8b. public/robots.txt (footgun 11): the @nuxtjs/robots module moves it to public/_robots.txt on every build (and then serves
#     both /robots.txt and /_robots.txt). The source lives at assets/robots.txt.
[ -e public/robots.txt ] && fail "public/robots.txt exists; a build would move it. Keep the source at assets/robots.txt (CLAUDE.md, footgun 11)." || ok "no public/robots.txt"
[ -e public/_robots.txt ] && warn "public/_robots.txt exists (left by a build from before the move); delete it"

# 9-11. Git state
if git rev-parse --git-dir >/dev/null 2>&1; then
  branch=$(git branch --show-current)
  dirty=$(git status --porcelain)
  if [ "$branch" = "$BASE" ] && [ -n "$dirty" ]; then
    fail "uncommitted changes on $BASE. Work on a task/ branch (rule 4)."
  else ok "branch: $branch"; fi

  # Every PR targets main (CLAUDE.md rule 4). In CI the base of the PR is GITHUB_BASE_REF.
  if [ -n "$GITHUB_BASE_REF" ] && [ "$GITHUB_BASE_REF" != "main" ]; then
    fail "this PR targets '$GITHUB_BASE_REF'; every PR targets main (rule 4). No stacked PRs: wait for the base to merge, then open this one against main."
  fi
  if git rev-parse --verify -q origin/main >/dev/null && ! git merge-base --is-ancestor origin/main HEAD 2>/dev/null; then
    warn "this branch does not contain the current origin/main (fetch and merge it before opening the PR; rule 4)"
  fi

  if git rev-parse --verify -q "$BASE" >/dev/null; then
    mb=$(git merge-base "$BASE" HEAD)
    # Branch kind, decided from the diff (rule 3); also the name against the diff, deletions, slugs, people_mentioned, known-failures list.
    if [ -f scripts/check-content-branch.mjs ] && [ -d node_modules/yaml ]; then
      while IFS= read -r line; do
        case "$line" in
          ok:*)   ok "${line#ok: }" ;;
          FAIL:*) fail "${line#FAIL: }" ;;
          WARN:*) warn "${line#WARN: }" ;;
          INFO:*) echo "      ${line#INFO: }" ;;
          *)      [ -n "$line" ] && echo "      $line" ;;
        esac
      done < <(node scripts/check-content-branch.mjs "$BASE" 2>&1)
    else need "branch checks skipped (scripts/check-content-branch.mjs or node_modules/yaml missing; run npm ci)"; fi
    if [ -f agent/eval-log.md ]; then
      del=$(git diff --numstat "$mb" -- agent/eval-log.md | awk '{print $2}')
      [ -n "$del" ] && [ "$del" != "0" ] && fail "agent/eval-log.md lost $del line(s); it is append-only (rule 10)" || ok "eval log append-only"
    fi
  else
    need "no '$BASE' ref; skipped the branch checks and the eval-log check (rules 3 and 10)"
  fi
fi

# 11b. Content validator (roadmap task 5). Its known failures stay visible as a WARN until the files are fixed
#      (Phase 2 content tasks). A failing file that is not in scripts/validate-content.known-failures.txt, any
#      cross-reference problem and any skipped check group is a FAIL. The list only shrinks: a fix removes its line
#      (check-content-branch.mjs fails an added line). Once the list is empty or the file is gone, the validator must
#      exit 0 (C1). In CI (CI is set) a missing prerequisite is a FAIL.
if [ -f scripts/validate-content.mjs ] && [ -d node_modules/zod ] && [ -d node_modules/yaml ]; then
  vout=$(node scripts/validate-content.mjs 2>&1); vcode=$?
  vline=$(echo "$vout" | grep -E '^(FAILED|OK):' | tail -1)
  if [ $vcode -eq 0 ]; then ok "content validator passes"
  else
    cur=$(echo "$vout" | sed '/^== Cross-references/q' | grep -E '^ {0,2}content/[^ ]+' | awk '{print $1}' | sort -u)
    KF=scripts/validate-content.known-failures.txt   # a missing or empty file is an empty list
    if [ -s "$KF" ]; then known=$(sort -u "$KF"); else known=""; fi
    newf=$(comm -13 <(echo "$known") <(echo "$cur"))
    x=$(echo "$vline" | sed -n 's/.* \([0-9]*\) cross-reference problem.*/\1/p')
    if [ -z "$vline" ] || [ -z "$x" ]; then fail "content validator failed and its summary line could not be read: $vline"
    elif [ -n "$newf" ]; then fail "content validator: failing file(s) not in the known-failures list:"; echo "$newf" | sed 's/^/      /'
    elif [ ! -s "$KF" ]; then fail "content validator exits non-zero and the known-failures list is empty (or missing): once it is empty the validator must exit 0 (C1). Run npm run validate:content."
    elif [ "$x" -gt 0 ]; then fail "content validator: $x cross-reference problem(s). Run npm run validate:content."
    elif echo "$vline" | grep -q SKIPPED; then fail "content validator: a cross-reference check group was skipped. Run npm run validate:content."
    else warn "content validator: $(echo "$cur" | grep -c .) known failing file/entry(ies), none new (scripts/validate-content.known-failures.txt). Run npm run validate:content for the list; fix them in a content task and remove them from the list."; fi
  fi
else need "content validator skipped (scripts/validate-content.mjs, node_modules/zod or node_modules/yaml missing; run npm ci)"; fi

# 11c. ESLint over the Vue files (template and TypeScript script) and the .ts files (roadmap task 5; see eslint.config.mjs)
if [ -d node_modules/eslint ] && [ -d node_modules/eslint-plugin-vue ] && [ -d node_modules/vue-eslint-parser ] && [ -d node_modules/@typescript-eslint/parser ] && [ -d node_modules/typescript ]; then
  eout=$(npx eslint . 2>&1) && ok "eslint: no problems in the Vue and TypeScript files" || { fail "eslint:"; echo "$eout" | sed 's/^/      /'; }
else need "eslint skipped (node_modules/eslint, eslint-plugin-vue, vue-eslint-parser, @typescript-eslint/parser or typescript missing; run npm ci)"; fi

# 12. Build
if [ "$1" = "--build" ]; then
  echo "----  npm run build:search"
  if npm run build:search; then
    ok "build passed"
    # 13. Every internal link in the built site resolves to a file (roadmap task 5). Not a click.
    lout=$(node scripts/check-links.mjs 2>&1) && ok "$(echo "$lout" | head -1)" || { fail "built-site link check:"; echo "$lout" | sed 's/^/      /'; }
  else fail "build failed"; fi
else
  echo "      (build not run; use --build before a PR)"
fi

echo "----  $fails FAIL, $warns WARN"
[ $fails -eq 0 ]
