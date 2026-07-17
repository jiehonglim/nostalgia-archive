#!/usr/bin/env python3
"""Convert WP REST dump → markdown + download media. Called by scrape.sh."""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote


class HTMLToText(HTMLParser):
    """Minimal HTML → markdown-ish text (ponytail: good enough for archive)."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip = 0
        self._href: str | None = None
        self._li = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = dict(attrs)
        if tag in ("script", "style"):
            self._skip += 1
            return
        if self._skip:
            return
        if tag in ("p", "div", "section", "article", "br", "hr"):
            self.parts.append("\n\n" if tag != "br" else "\n")
            if tag == "hr":
                self.parts.append("---\n\n")
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            level = int(tag[1])
            self.parts.append("\n\n" + "#" * level + " ")
        elif tag == "li":
            self._li = True
            self.parts.append("\n- ")
        elif tag == "blockquote":
            self.parts.append("\n\n> ")
        elif tag in ("strong", "b"):
            self.parts.append("**")
        elif tag in ("em", "i"):
            self.parts.append("*")
        elif tag == "code":
            self.parts.append("`")
        elif tag == "pre":
            self.parts.append("\n\n```\n")
        elif tag == "a":
            self._href = ad.get("href")
            self.parts.append("[")
        elif tag == "img":
            src = ad.get("src") or ""
            alt = ad.get("alt") or ""
            self.parts.append(f"![{alt}]({src})")

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style"):
            self._skip = max(0, self._skip - 1)
            return
        if self._skip:
            return
        if tag in ("strong", "b"):
            self.parts.append("**")
        elif tag in ("em", "i"):
            self.parts.append("*")
        elif tag == "code":
            self.parts.append("`")
        elif tag == "pre":
            self.parts.append("\n```\n\n")
        elif tag == "a":
            href = self._href or ""
            self.parts.append(f"]({href})")
            self._href = None
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "div"):
            self.parts.append("\n\n")

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        self.parts.append(data)

    def text(self) -> str:
        t = "".join(self.parts)
        t = html.unescape(t)
        t = re.sub(r"\n{3,}", "\n\n", t)
        return t.strip() + "\n"


def html_to_md(raw_html: str) -> str:
    p = HTMLToText()
    try:
        p.feed(raw_html or "")
        p.close()
    except Exception:
        return re.sub(r"<[^>]+>", "", raw_html or "") + "\n"
    return p.text()


def strip_title(t: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", t or "")).strip()


def yaml_escape(s: str) -> str:
    if s is None:
        return '""'
    if re.search(r'[:#\[\]{}"\n]', s) or s.startswith(("*", "&", "!", "|", ">", "%", "@", "`")):
        return json.dumps(s, ensure_ascii=False)
    return s or '""'


def post_path(date_iso: str, slug: str) -> str:
    # /YYYY/MM/DD/slug/
    try:
        dt = datetime.fromisoformat(date_iso.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime(1970, 1, 1)
    return f"{dt.year:04d}/{dt.month:02d}/{dt.day:02d}/{slug}"


def media_local_name(url: str, media_id: int | None = None) -> str:
    path = urlparse(url).path
    # strip photon /blog/ prefixes and query-ish
    path = re.sub(r"^/blog/", "/", path)
    name = unquote(path.rsplit("/", 1)[-1]) or f"media-{media_id or 'x'}"
    name = re.sub(r"[^\w.\-]+", "_", name)
    if media_id is not None:
        return f"{media_id}-{name}"
    return name


def download(url: str, dest: Path, ua: str, ctx: ssl.SSLContext) -> tuple[bool, str]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return True, "cached"
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            data = resp.read()
        if not data:
            return False, "empty"
        dest.write_bytes(data)
        return True, "ok"
    except Exception as e:
        return False, str(e)


def rewrite_photon(url: str, base: str) -> list[str]:
    """Return candidate download URLs (direct upload first, then as-is)."""
    candidates = [url]
    # iN.wp.com/jiehong.org/... photon
    m = re.match(r"https?://i\d*\.wp\.com/([^/]+)(/.+?)(?:\?.*)?$", url)
    if m:
        host, path = m.group(1), m.group(2)
        candidates.insert(0, f"https://{host}{path}")
        if "jiehong.org" in host or host.endswith("jiehong.org"):
            candidates.insert(0, f"{base.rstrip('/')}{path}")
    # relative
    if url.startswith("/"):
        candidates = [base.rstrip("/") + url] + candidates
    # blog path rewrite
    if "/blog/wp-content/" in url:
        candidates.insert(0, url.replace("/blog/wp-content/", "/wp-content/"))
    return list(dict.fromkeys(candidates))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True)
    ap.add_argument("--raw", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--ua", required=True)
    args = ap.parse_args()

    ctx = ssl.create_default_context()
    posts = json.loads((args.raw / "posts.json").read_text())
    pages = json.loads((args.raw / "pages.json").read_text())
    media = json.loads((args.raw / "media.json").read_text())

    url_map: dict[str, str] = {}  # remote url → /media/local
    broken: list[dict] = []

    # download media library
    media_dir = args.out / "media"
    media_dir.mkdir(parents=True, exist_ok=True)
    print(f"  downloading {len(media)} media items…")
    for i, m in enumerate(media, 1):
        src = (m.get("source_url") or "").strip()
        if not src:
            continue
        mid = m.get("id")
        local_name = media_local_name(src, mid)
        dest = media_dir / local_name
        ok = False
        last_err = ""
        for cand in rewrite_photon(src, args.base):
            ok, last_err = download(cand, dest, args.ua, ctx)
            if ok:
                break
        local_path = f"/media/{local_name}"
        if ok:
            url_map[src] = local_path
            # also map photon variants
            for cand in rewrite_photon(src, args.base):
                url_map[cand] = local_path
        else:
            broken.append({"type": "media", "id": mid, "url": src, "error": last_err})
            url_map[src] = "/media/_missing.svg"
        if i % 10 == 0 or i == len(media):
            print(f"    media {i}/{len(media)}")

    def rewrite_body_urls(md: str) -> str:
        def repl(match: re.Match[str]) -> str:
            alt, url = match.group(1), match.group(2)
            # try exact + without query
            base_url = url.split("?")[0]
            mapped = url_map.get(url) or url_map.get(base_url)
            if mapped:
                return f"![{alt}]({mapped})"
            # external flickr keep
            if "flickr.com" in url or "staticflickr.com" in url:
                return match.group(0)
            # unknown remote image — mark for later download attempt
            return f"![{alt}]({url})"

        return re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", repl, md)

    def write_entry(item: dict, kind: str) -> None:
        slug = item.get("slug") or f"id-{item.get('id')}"
        date = item.get("date") or "1970-01-01T00:00:00"
        title = strip_title((item.get("title") or {}).get("rendered", ""))
        raw_html = (item.get("content") or {}).get("rendered", "")
        md_body = rewrite_body_urls(html_to_md(raw_html))
        route = post_path(date, slug) if kind == "posts" else f"pages/{slug}"
        cats = []
        tags = []
        # REST embed-less: leave empty; taxonomies optional
        fm = (
            "---\n"
            f"id: {item.get('id')}\n"
            f"title: {yaml_escape(title)}\n"
            f"date: {date}\n"
            f"slug: {yaml_escape(slug)}\n"
            f"type: {kind.rstrip('s')}\n"
            f"path: /{route}/\n"
            f"link: {yaml_escape(item.get('link') or '')}\n"
            "---\n\n"
            f"# {title}\n\n"
            f"{md_body}"
        )
        if kind == "posts":
            out = args.out / "content" / "posts" / f"{date[:10]}_{slug}.md"
        else:
            out = args.out / "content" / "pages" / f"{slug}.md"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(fm, encoding="utf-8")

        # collect img urls still remote for inline download
        for m in re.finditer(r"!\[([^\]]*)\]\((https?://[^)]+)\)", md_body):
            url = m.group(2)
            if url.startswith("/media/") or "flickr.com" in url or "staticflickr.com" in url:
                continue
            if url in url_map:
                continue
            local_name = media_local_name(url)
            dest = media_dir / local_name
            ok = False
            last_err = ""
            for cand in rewrite_photon(url, args.base):
                ok, last_err = download(cand, dest, args.ua, ctx)
                if ok:
                    break
            if ok:
                url_map[url] = f"/media/{local_name}"
            else:
                broken.append({"type": "inline", "url": url, "post": slug, "error": last_err})
                url_map[url] = "/media/_missing.svg"

        # rewrite again with newly fetched
        md_body2 = rewrite_body_urls(html_to_md(raw_html))
        fm2 = (
            "---\n"
            f"id: {item.get('id')}\n"
            f"title: {yaml_escape(title)}\n"
            f"date: {date}\n"
            f"slug: {yaml_escape(slug)}\n"
            f"type: {kind.rstrip('s')}\n"
            f"path: /{route}/\n"
            f"link: {yaml_escape(item.get('link') or '')}\n"
            "---\n\n"
            f"# {title}\n\n"
            f"{md_body2}"
        )
        out.write_text(fm2, encoding="utf-8")

    print(f"  writing {len(posts)} posts…")
    for p in posts:
        write_entry(p, "posts")
    print(f"  writing {len(pages)} pages…")
    for p in pages:
        write_entry(p, "pages")

    # strip comments PII → sanitized sidecar (not published in reader v1)
    comments_path = args.raw / "comments.json"
    if comments_path.exists():
        comments = json.loads(comments_path.read_text())
        clean = []
        for c in comments:
            author = c.get("author_name") or ""
            content = (c.get("content") or {}).get("rendered", "")
            # drop email/IP fields entirely
            clean.append(
                {
                    "id": c.get("id"),
                    "post": c.get("post"),
                    "date": c.get("date"),
                    "author_name": author,
                    "content": re.sub(
                        r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}",
                        "[email]",
                        content,
                        flags=re.I,
                    ),
                }
            )
        (args.raw / "comments.sanitized.json").write_text(
            json.dumps(clean, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"  comments sanitized={len(clean)} (not embedded in reader v1)")

    (args.raw / "url-map.json").write_text(json.dumps(url_map, indent=2), encoding="utf-8")
    (args.out / "broken-images.json").write_text(
        json.dumps({"count": len(broken), "items": broken}, indent=2), encoding="utf-8"
    )
    print(f"  broken images: {len(broken)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
