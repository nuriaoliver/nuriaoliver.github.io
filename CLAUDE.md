# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server with live reload (http://localhost:8080)
npm run build      # build to _site/
python fetch_orcid.py  # compare Nuria's ORCID works with data/nuriabib.bib
python fetch_orcid.py --add 1,3  # add individually validated candidates via bibtexparser
```

## Architecture

This is an [Eleventy (11ty)](https://www.11ty.dev/) static site for Nuria Oliver's personal academic website.

**Input → Output:** `content/` (Markdown) → `_site/` (built HTML). Never edit `_site/` directly.

**Key directories:**
- `content/` — all pages as Markdown with YAML front matter. Input root for Eleventy.
- `_includes/` — Nunjucks templates: `base.njk` (HTML shell), `nav.njk`, `layouts/default.njk`, `layouts/publications.njk`
- `_data/` — global data: `nav.json` (navigation links), `publications.json` (auto-generated from ORCID)
- `assets/css/` — stylesheets, copied to `/css/` in output
- `static/` — copied verbatim to output root (favicons, images)

**Layout chain:** `content page` → `layouts/default.njk` (default for all pages) → `base.njk` (HTML shell with Bootstrap 5 + nav). The `publications` layout alias maps to `layouts/publications.njk`.

**Publications system:** `data/nuriabib.bib` is the canonical source. `_data/bib.mjs` parses it for the publications and patents layouts. `fetch_orcid.py` downloads Nuria's ORCID works, compares them by DOI and normalized title, quarantines possible preprint/venue duplicates, and can add only explicitly selected candidates through `bibtexparser`.

**Navigation:** Driven entirely by `_data/nav.json`. To add/remove nav items, edit that file.

**Project pages** live under `content/projects/<name>/index.md` (page bundle pattern). Images/PDFs co-located in the bundle are passed through to output automatically.

**`.eleventyignore`** excludes `content/_index.md` and `content/projects/_index.md` (Hugo legacy files kept for reference).
