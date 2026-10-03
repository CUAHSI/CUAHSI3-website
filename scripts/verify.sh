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

if [ ${#CODE_DIRS[@]} -eq 0 ]; then echo "Run from the repo root (no pages/ or components/ here)."; exit 2; fi

# 1. Unbalanced backticks: a mangled template literal from a bulk edit (footgun 9)
out=$(find "${CODE_DIRS[@]}" -name '*.vue' -print0 | while IFS= read -r -d '' f; do
  n=$(grep -o '`' "$f" | wc -l); [ $((n % 2)) -ne 0 ] && echo "      $f ($n backticks)"
done)
[ -n "$out" ] && { fail "unbalanced backticks:"; echo "$out"; } || ok "backticks balanced"

# 2. Apostrophe inside a static style attribute: hard compile error (footgun 3)
out=$(grep -rn --include='*.vue' ' style="[^"]*'"'" "${CODE_DIRS[@]}")
[ -n "$out" ] && { fail "apostrophe inside static style attribute:"; echo "$out" | sed 's/^/      /'; } || ok "no apostrophes in static style attributes"

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
    warn "no local '$BASE' branch; skipped the content/ and eval-log checks"
  fi
fi

# 12. Build
if [ "$1" = "--build" ]; then
  echo "----  npm run build:search"
  if npm run build:search; then ok "build passed"; else fail "build failed"; fi
else
  echo "      (build not run; use --build before a PR)"
fi

echo "----  $fails FAIL, $warns WARN"
[ $fails -eq 0 ]
