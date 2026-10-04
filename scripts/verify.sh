#!/usr/bin/env bash
# Verification suite for the CUAHSI website. Run before every commit.
#   ./scripts/verify.sh            static checks only (seconds)
#   ./scripts/verify.sh --build    static checks, then npm run build:search
# FAIL blocks a commit. WARN must be read and either fixed or explained in the PR.
# A clean run does not mean the pages look right. See CLAUDE.md rule 2.

PHASE=1            # 1 = content/ is frozen. Change only when Jordan opens Phase 2.
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

# 9-11. Git state
if git rev-parse --git-dir >/dev/null 2>&1; then
  branch=$(git branch --show-current)
  dirty=$(git status --porcelain)
  if [ "$branch" = "$BASE" ] && [ -n "$dirty" ]; then
    fail "uncommitted changes on $BASE. Work on a task/ branch (rule 4)."
  else ok "branch: $branch"; fi

  if git rev-parse --verify -q "$BASE" >/dev/null; then
    mb=$(git merge-base "$BASE" HEAD)
    if [ "$PHASE" = "1" ]; then
      changed=$( { git diff --name-only "$mb" -- content/; git ls-files --others --exclude-standard content/; } | sort -u)
      [ -n "$changed" ] && { fail "content/ differs from $BASE (rule 3):"; echo "$changed" | sed 's/^/      /'; } || ok "content/ untouched"
    fi
    if [ -f agent/eval-log.md ]; then
      del=$(git diff --numstat "$mb" -- agent/eval-log.md | awk '{print $2}')
      [ -n "$del" ] && [ "$del" != "0" ] && fail "agent/eval-log.md lost $del line(s); it is append-only (rule 10)" || ok "eval log append-only"
    fi
  else
    need "no '$BASE' ref; skipped the content/ and eval-log checks (rules 3 and 10)"
  fi
fi

# 11b. Content validator (roadmap task 5). content/ is frozen in Phase 1, so its known failures cannot be fixed;
#      they stay visible as a WARN. A failing file that is not in scripts/validate-content.known-failures.txt, any
#      cross-reference problem and any skipped check group is a FAIL. Edit the list only when the failing files
#      are fixed (Phase 2) or Jordan decides the schema is wrong. In CI (CI is set) a missing prerequisite is a FAIL.
if [ -f scripts/validate-content.mjs ] && [ -d node_modules/zod ] && [ -d node_modules/yaml ]; then
  vout=$(node scripts/validate-content.mjs 2>&1); vcode=$?
  vline=$(echo "$vout" | grep -E '^(FAILED|OK):' | tail -1)
  if [ $vcode -eq 0 ]; then ok "content validator passes"
  else
    cur=$(echo "$vout" | sed '/^== Cross-references/q' | grep -E '^ {0,2}content/[^ ]+' | awk '{print $1}' | sort -u)
    newf=$(comm -13 <(sort -u scripts/validate-content.known-failures.txt) <(echo "$cur"))
    x=$(echo "$vline" | sed -n 's/.* \([0-9]*\) cross-reference problem.*/\1/p')
    if [ -z "$vline" ] || [ -z "$x" ]; then fail "content validator failed and its summary line could not be read: $vline"
    elif [ -n "$newf" ]; then fail "content validator: failing file(s) not in the known list:"; echo "$newf" | sed 's/^/      /'
    elif [ "$x" -gt 0 ]; then fail "content validator: $x cross-reference problem(s). Run npm run validate:content."
    elif echo "$vline" | grep -q SKIPPED; then fail "content validator: a cross-reference check group was skipped. Run npm run validate:content."
    else warn "content validator: $(echo "$cur" | grep -c .) known failing file/entry(ies), none new (scripts/validate-content.known-failures.txt). Frozen content; run npm run validate:content for the list."; fi
  fi
else need "content validator skipped (scripts/validate-content.mjs, node_modules/zod or node_modules/yaml missing; run npm ci)"; fi

# 11c. ESLint over the Vue templates (roadmap task 5; template-only, see eslint.config.mjs)
if [ -d node_modules/eslint ] && [ -d node_modules/eslint-plugin-vue ] && [ -d node_modules/vue-eslint-parser ]; then
  eout=$(npx eslint . 2>&1) && ok "eslint: no problems in the Vue templates" || { fail "eslint:"; echo "$eout" | sed 's/^/      /'; }
else need "eslint skipped (node_modules/eslint or eslint-plugin-vue missing; run npm ci)"; fi

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
