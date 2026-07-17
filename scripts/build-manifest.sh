#!/usr/bin/env bash
# scripts/build-manifest.sh — normalize scraped content -> manifest.json + sitemap
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/archive"

python3 - "$OUT" <<'PY'
import json, re, pathlib, datetime
from html import unescape

out = pathlib.Path(__file__) if False else pathlib.Path(__import__("sys").argv[1])
content = out / "content"
posts_dir = content / "posts"
pages_dir = content / "pages"

FM_RE = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.S)

def parse_fm(text: str) -> tuple[dict, str]:
    m = FM_RE.match(text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            try:
                v = json.loads(v.replace("'", '"') if v.startswith("'") else v)
            except Exception:
                v = v.strip("\"'")
        meta[k.strip()] = v
    return meta, m.group(2).lstrip()

def collect(kind_dir: pathlib.Path, kind: str) -> list[dict]:
    items = []
    if not kind_dir.exists():
        return items
    for p in sorted(kind_dir.glob("*.md")):
        meta, body = parse_fm(p.read_text(encoding="utf-8"))
        path = meta.get("path") or ""
        if not path.endswith("/"):
            path = path + "/" if path else "/"
        items.append({
            "id": int(meta["id"]) if str(meta.get("id", "")).isdigit() else meta.get("id"),
            "title": meta.get("title") or p.stem,
            "date": meta.get("date") or "",
            "slug": meta.get("slug") or p.stem,
            "type": kind,
            "path": path,
            "file": str(p.relative_to(out)).replace("\\", "/"),
            "excerpt": re.sub(r"\s+", " ", body)[:180].strip(),
        })
    if kind == "post":
        items.sort(key=lambda x: x.get("date") or "", reverse=True)
    else:
        items.sort(key=lambda x: x.get("slug") or "")
    return items

posts = collect(posts_dir, "post")
pages = collect(pages_dir, "page")

broken_path = out / "broken-images.json"
broken = {"count": 0, "items": []}
if broken_path.exists():
    broken = json.loads(broken_path.read_text())

manifest = {
    "generated_at": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    "site": "archive.jiehong.org",
    "defaults": {"skin": "plain"},
    "skins": ["plain", "win95", "geocities", "winamp"],
    "counts": {
        "posts": len(posts),
        "pages": len(pages),
        "broken_images": broken.get("count", 0),
    },
    "posts": posts,
    "pages": pages,
    "routes": {p["path"]: p["file"] for p in posts + pages if p.get("path")},
}

(out / "content" / "manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

# archive sitemap
urls = ["https://archive.jiehong.org/"]
for p in posts:
    urls.append("https://archive.jiehong.org" + p["path"])
for p in pages:
    urls.append("https://archive.jiehong.org" + p["path"])

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]
for u in urls:
    lines.append("  <url>")
    lines.append(f"    <loc>{u}</loc>")
    lines.append("  </url>")
lines.append("</urlset>")
(out / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(f"manifest: posts={len(posts)} pages={len(pages)} broken={broken.get('count', 0)}")
print(f"  -> {out / 'content' / 'manifest.json'}")
print(f"  -> {out / 'sitemap.xml'}")
PY

# ensure discoverability stubs on archive
if [[ ! -f "$OUT/robots.txt" ]]; then
  cat > "$OUT/robots.txt" <<'EOF'
User-agent: *
Allow: /

Sitemap: https://archive.jiehong.org/sitemap.xml
EOF
fi

if [[ ! -f "$OUT/llms.txt" ]]; then
  cat > "$OUT/llms.txt" <<'EOF'
# jiehong archive

> Static archive of the jiehong.org blog. Default view is plain markdown; optional nostalgia skins available.

## Pages

- [Archive home](https://archive.jiehong.org/): Post index
- [Personal site](https://jiehong.org/): Apex landing
EOF
fi

# missing image placeholder
if [[ ! -f "$OUT/media/_missing.svg" ]]; then
  cat > "$OUT/media/_missing.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320" role="img" aria-label="Missing image">
  <rect width="480" height="320" fill="#e8e4dc"/>
  <rect x="24" y="24" width="432" height="272" fill="none" stroke="#8a8478" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="240" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#5c564c">Image unavailable</text>
  <text x="240" y="178" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#8a8478">Recovered archive · placeholder</text>
</svg>
EOF
fi

echo "OK"
