# nostalgia-archive

Static archive of [jiehong.org](https://jiehong.org) — two decades of public blog posts, served as a plain markdown reader with optional nostalgia skins.

| Site | Role |
| --- | --- |
| [jiehong.org](https://jiehong.org) | Personal landing |
| [archive.jiehong.org](https://archive.jiehong.org) | Full post archive + skins |

## Skins

| Skin | Vibe |
| --- | --- |
| **plain** (default) | Readable markdown |
| **win95** | Windows 95 explorer chrome |
| **geocities** | HTML 3.2 / under-construction |
| **winamp** | Classic Winamp 2 player |

Switch with `?skin=` or the on-page switcher. Your choice is saved in `localStorage`.

## Layout

```text
frontend/   landing page
archive/    reader, posts, media, skins
scripts/    scrape + manifest rebuild
tests/      static checks
```

## Quick start

```bash
git clone https://github.com/jiehonglim/nostalgia-archive.git
cd nostalgia-archive
bash tests/run.sh

# Preview the archive reader
cd archive && python3 -m http.server 8765
# → http://127.0.0.1:8765
```

## Rebuilding content

To refresh posts from a live WordPress site:

```bash
bash scripts/scrape.sh
bash scripts/build-manifest.sh
```

See [`scripts/README.md`](scripts/README.md) for details.

## Missing media

Some older images no longer exist at their original URLs. Broken references are listed in `archive/broken-images.json` and render as `archive/media/_missing.svg`.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for what belongs in this public repo.
