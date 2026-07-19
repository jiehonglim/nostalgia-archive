# nostalgia-archive

Static archive of the [jiehong.org](https://jiehong.org) blog — two decades of public posts, served as a plain markdown reader with optional nostalgia skins.

Live at [archive.jiehong.org](https://archive.jiehong.org). The personal landing at jiehong.org is a separate site.

## Skins

| Skin | Vibe |
| --- | --- |
| **plain** (default) | Clean docs-style reading view |
| **win95** | Windows 95 explorer chrome |
| **geocities** | HTML 3.2 / under-construction |
| **winamp** | Classic Winamp 2 player |

Switch with the top nav links or `?skin=`. Your choice is saved in `localStorage`.

## Layout

```text
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
