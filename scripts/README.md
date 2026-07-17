# Scripts

| Script | Role |
| --- | --- |
| `scrape.sh` | Download posts, pages, and media via WordPress REST API |
| `build-manifest.sh` | Rewrite image URLs; emit `manifest.json` and `broken-images.json` |
| `public-copy-check.sh` | Gate: public-facing docs must not mention internal ops |

Typical rebuild:

```bash
bash scripts/scrape.sh
bash scripts/build-manifest.sh
```

Set `SCRAPE_BASE` to override the default WordPress URL.
