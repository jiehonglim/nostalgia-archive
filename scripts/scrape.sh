#!/usr/bin/env bash
# scripts/scrape.sh — capture jiehong.org WordPress while ASO is still live.
# Writes raw JSON + markdown drafts + media. Run build-manifest.sh after.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="${SCRAPE_BASE:-https://jiehong.org}"
OUT="$ROOT/archive"
RAW="$ROOT/scripts/.cache/raw"
UA="${SCRAPE_UA:-Mozilla/5.0 (compatible; nostalgia-archive-scrape/1.0; +https://archive.jiehong.org/)}"

mkdir -p "$RAW/posts" "$RAW/pages" "$RAW/media" "$OUT/content/posts" "$OUT/content/pages" "$OUT/media"

echo "==> Scrape from $BASE"
echo "    raw cache: $RAW"

# --- helpers ---
wp_get() {
  local url="$1"
  local out="$2"
  local tries=0
  while [[ "$tries" -lt 4 ]]; do
    if curl -fsSL -A "$UA" -H "Accept: application/json" "$url" -o "$out"; then
      return 0
    fi
    tries=$((tries + 1))
    echo "    retry $tries: $url" >&2
    sleep $((tries * 2))
  done
  return 1
}

# --- inventory totals ---
wp_total() {
  curl -fsSI -A "$UA" "$1" 2>/dev/null \
    | awk -F': ' 'tolower($1)=="x-wp-total"{print $2}' \
    | tr -dc '0-9' | head -1
}
post_total="$(wp_total "$BASE/wp-json/wp/v2/posts?per_page=1")"
page_total="$(wp_total "$BASE/wp-json/wp/v2/pages?per_page=1")"
media_total="$(wp_total "$BASE/wp-json/wp/v2/media?per_page=1")"
post_total="${post_total:-0}"
page_total="${page_total:-0}"
media_total="${media_total:-0}"

echo "    REST totals: posts=$post_total pages=$page_total media=$media_total"

# --- paginated fetch ---
fetch_collection() {
  local kind="$1"   # posts|pages|media|comments
  local total="${2:-0}"
  total="$(printf '%s' "$total" | tr -dc '0-9')"
  total="${total:-0}"
  local per=20
  # media endpoint on some hosts 500s at high per_page
  if [[ "$kind" == "media" ]]; then
    per=10
  fi
  local page_count=1
  if [[ "$total" -gt 0 ]]; then
    page_count=$(( (total + per - 1) / per ))
  fi
  [[ "$total" -eq 0 ]] && { echo "[]" > "$RAW/${kind}.json"; return; }
  local page=1
  local tmpdir="$RAW/$kind"
  rm -f "$tmpdir"/page-*.json
  mkdir -p "$tmpdir"
  while [[ "$page" -le "$page_count" ]]; do
    echo "    fetching $kind page $page/$page_count..."
    if ! wp_get "$BASE/wp-json/wp/v2/${kind}?per_page=${per}&page=${page}&orderby=date&order=asc" \
      "$tmpdir/page-${page}.json"; then
      # fallback: try without orderby for flaky media
      if [[ "$kind" == "media" ]]; then
        wp_get "$BASE/wp-json/wp/v2/${kind}?per_page=${per}&page=${page}" \
          "$tmpdir/page-${page}.json" || echo "[]" > "$tmpdir/page-${page}.json"
      else
        return 1
      fi
    fi
    page=$((page + 1))
  done
  # merge pages into one array
  python3 - "$tmpdir" "$RAW/${kind}.json" <<'PY'
import json, sys, pathlib
d = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
items = []
for p in sorted(d.glob("page-*.json")):
    items.extend(json.loads(p.read_text()))
out.write_text(json.dumps(items, ensure_ascii=False, indent=2))
print(f"    merged {len(items)} -> {out}")
PY
}

fetch_collection posts "$post_total"
fetch_collection pages "$page_total"
fetch_collection media "$media_total"

# optional comments (strip PII later / omit bodies with email)
echo "    fetching comments (for PII strip / omit)..."
if curl -fsSI -A "$UA" "$BASE/wp-json/wp/v2/comments?per_page=1" >/tmp/na-comments-h.txt 2>/dev/null; then
  ctot="$(awk -F': ' 'tolower($1)=="x-wp-total"{print $2}' /tmp/na-comments-h.txt | tr -d '\r')"
  ctot="${ctot:-0}"
  echo "    comments total=$ctot (v1: strip PII, do not publish raw)"
  if [[ "$ctot" -gt 0 ]]; then
    fetch_collection comments "$ctot" || true
  else
    echo "[]" > "$RAW/comments.json"
  fi
else
  echo "[]" > "$RAW/comments.json"
  echo "    comments endpoint unavailable — skipping"
fi

# --- convert posts/pages to markdown + download media ---
echo "==> Converting + downloading media"
python3 "$ROOT/scripts/_scrape_convert.py" \
  --base "$BASE" \
  --raw "$RAW" \
  --out "$OUT" \
  --ua "$UA"

echo ""
echo "==> Scrape summary"
python3 - <<PY
import json, pathlib
raw = pathlib.Path("$RAW")
out = pathlib.Path("$OUT")
posts = json.loads((raw/"posts.json").read_text())
pages = json.loads((raw/"pages.json").read_text())
media = json.loads((raw/"media.json").read_text())
md_posts = list((out/"content/posts").glob("*.md"))
md_pages = list((out/"content/pages").glob("*.md"))
files = [p for p in (out/"media").rglob("*") if p.is_file() and p.name != "_missing.svg"]
print(f"  posts REST={len(posts)} md={len(md_posts)}")
print(f"  pages REST={len(pages)} md={len(md_pages)}")
print(f"  media REST={len(media)} files_on_disk={len(files)}")
print(f"  next: bash scripts/build-manifest.sh")
PY
