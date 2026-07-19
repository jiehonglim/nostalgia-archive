#!/usr/bin/env bash
# tests/run.sh — nostalgia-archive static checks (must exit 0)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> nostalgia-archive test runner"

echo "==> Public copy security"
bash scripts/public-copy-check.sh
echo "OK public-copy-check"

echo "==> Required tree"
for p in \
  archive/index.html \
  archive/banner.css \
  archive/app.js \
  archive/lib.js \
  archive/content/manifest.json \
  archive/media/_missing.svg \
  archive/skins/plain/skin.css \
  archive/skins/win95/skin.css \
  archive/skins/geocities/skin.css \
  archive/skins/winamp/skin.css
do
  [[ -f "$p" ]] || { echo "FAIL: missing $p" >&2; exit 1; }
done
echo "OK required files"

if git rev-parse --git-dir >/dev/null 2>&1 && git ls-files --error-unmatch SPEC.md >/dev/null 2>&1; then
  echo "FAIL: SPEC.md must not be tracked (internal only)" >&2
  exit 1
fi

echo "==> Deploy tooling (studio checkout only)"
if [[ -f deploy.sh ]]; then
  [[ -f deploy/nginx-config.sh ]] || { echo "FAIL: deploy.sh present but missing deploy/nginx-config.sh" >&2; exit 1; }
  echo "OK deploy tooling"
else
  echo "  (skip — public clone has no deploy.sh)"
fi

echo "==> Manifest sanity"
python3 - <<'PY'
import json, pathlib, sys
m = json.loads(pathlib.Path("archive/content/manifest.json").read_text())
posts = m.get("posts") or []
pages = m.get("pages") or []
routes = m.get("routes") or {}
assert len(posts) >= 100, f"expected ~115 posts, got {len(posts)}"
assert len(pages) >= 1, f"expected pages, got {len(pages)}"
assert len(routes) == len(posts) + len(pages)
# date path shape
bad = [p["path"] for p in posts if not __import__("re").match(r"^/\d{4}/\d{2}/\d{2}/[^/]+/$", p["path"])]
assert not bad, f"bad post paths: {bad[:3]}"
skins = set(m.get("skins") or [])
for s in ("plain", "win95", "geocities", "winamp"):
    assert s in skins
assert "angelfire" not in skins
print(f"  posts={len(posts)} pages={len(pages)} broken={m['counts'].get('broken_images',0)}")
PY
echo "OK manifest"

echo "==> Broken-images report present"
python3 - <<'PY'
import json, pathlib
p = pathlib.Path("archive/broken-images.json")
assert p.exists()
d = json.loads(p.read_text())
assert "count" in d and "items" in d
print(f"  broken_images={d['count']}")
PY
echo "OK broken-images"

echo "==> Node smoke (if node present)"
if command -v node >/dev/null 2>&1 && compgen -G "tests/*.test.mjs" >/dev/null; then
  node --test tests/*.test.mjs
  echo "OK node tests"
else
  echo "  (skip node — no tests or no node)"
fi

echo ""
echo "ALL PASS"
