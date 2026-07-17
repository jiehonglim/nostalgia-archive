#!/usr/bin/env bash
# scripts/public-copy-check.sh — public copy security gate
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() { echo "PUBLIC COPY FAIL: $*" >&2; exit 1; }

DENY=(
  'database:sqlite|postgres|mysql|mongodb|data\.db'
  'stack:php-fpm|[[:<:]]nginx[[:>:]]|[[:<:]]php[[:>:]]'
  'api:index\.php|/backend/|webhook'
  'provider:stripe|sk_live_|sk_test_'
  'architecture:server-side|client-side|[[:<:]]MVP[[:>:]]'
  'secrets:CLIENT_SECRET|STRIPE_SECRET'
  'internal:minitcp|studioplaybook|AGENTS\.md|SPEC\.md|deploy\.sh|\.deploy/|Alwaysdata|[[:<:]]ASO[[:>:]]|~/ai/|\.agents/|\.beads/|\.grok/|[[:<:]]VPS[[:>:]]|rsync'
)

collect_files() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  for f in "$dir/llms.txt" "$dir/robots.txt"; do
    [[ -f "$f" ]] && printf '%s\n' "$f"
  done
  find "$dir" -type f -name '*.html' \
    ! -path '*/vendor/*' ! -path '*/content/*' ! -path '*/media/*' \
    2>/dev/null | sort -u
}

collect_docs() {
  for f in README.md CONTRIBUTING.md scripts/README.md; do
    [[ -f "$f" ]] && printf '%s\n' "$f"
  done
}

FILES="$(
  {
    collect_files frontend
    collect_files archive
    collect_docs
  } | sort -u
)"

if [[ -z "$FILES" ]]; then
  echo "No public copy files — skip"
  exit 0
fi

FILE_COUNT="$(echo "$FILES" | wc -l | tr -d ' ')"
echo "==> Public copy security ($FILE_COUNT files)"

HITS=0
for entry in "${DENY[@]}"; do
  category="${entry%%:*}"
  pattern="${entry#*:}"
  targets="$FILES"
  if [[ "$category" == "api" ]]; then
    targets="$(echo "$FILES" | grep -v 'robots\.txt$' || true)"
  fi
  [[ -z "$targets" ]] && continue
  if out=$(echo "$targets" | xargs grep -inE "$pattern" 2>/dev/null || true); then
    if [[ -n "$out" ]]; then
      echo "$out" | sed "s/^/  [$category] /" >&2
      HITS=$((HITS + 1))
    fi
  fi
done

if [[ "$HITS" -gt 0 ]]; then
  fail "$HITS denylist pattern(s) matched"
fi

echo "PUBLIC COPY PASS"
