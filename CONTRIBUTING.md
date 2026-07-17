# Contributing

This repo is **public**. Commits should contain the archive product only.

## OK to commit

- `frontend/` — landing page
- `archive/` — posts, media, reader, skins
- `scripts/` — scrape and manifest rebuild (not `scripts/.cache/`)
- `tests/` — static checks
- Public docs: `README.md`, this file, `scripts/README.md`

## Do not commit

- Secrets: `.env`, keys, certificates, credentials
- Hosting or deploy tooling
- Internal plans, agent harness, or studio-only notes
- Scrape scratch data under `scripts/.cache/`

When editing public docs (`README.md`, `CONTRIBUTING.md`, `scripts/README.md`, `*/llms.txt`), keep copy user-facing. Do not document internal paths, hosting providers, or tooling that is not in the repo.

Run before opening a PR:

```bash
bash tests/run.sh
```
