# Project Rules and Instructions

## Legacy Files (Do Not Touch)
- **`ffvi-mods.html`**: This is a legacy page and must **never** be edited, deleted, or modified under any circumstances unless explicitly instructed by the user. Treat it as read-only / frozen.

## Architectural Guidelines & Transparency
- **No Pseudo-Dynamic Components**: Do NOT wrap static data into pseudo-dynamic Web Components or claim an architecture is "dynamic" when it relies on hardcoded static JS arrays.
- **Direct & Transparent Answers**: Always tell the user directly and plainly whether an asset or block is hardcoded static HTML, static JS, or truly fetched from an external source/API.
- **Avoid Unnecessary Abstractions**: Do not create or introduce custom element wrappers unless explicitly requested. Keep the code straightforward and avoid over-engineering.
- **Unreferenced Does Not Mean Redundant**: Never treat unreferenced files, images, or folders as redundant just because they are not currently linked in code. Only treat true duplicates or obsolete redirect/scratch files as redundant when asked.
## Forbidden Assets (Do Not Ever Use)
- **`assets/logus.png` and `assets/logus (Custom).png`**: This asset displays "FFVI ART OMNIA" and must **NEVER** be used anywhere on the website (especially never for Suikoden, Project Kyaro, or general project cards). Under no circumstances should this image be referenced, linked, or embedded.

## Static Search Index & Minified Asset Maintenance
- **Always Rebuild `assets/search-index.json`**: Whenever a new HTML page, project guide, mod entry (in `components.js`), or blog post (in `assets/blog/blog_data.js`) is added or substantially updated, **always run `npm run build-search`** (`node scripts/build-search-index.mjs`) before finishing so the static site-wide search index stays in sync.
- **Always Rebuild Minified Assets & Bump Cache Query Strings (`tools\site_build.bat`)**: All active HTML pages load `assets/obsidian.min.css?v=...` and `components.min.js?v=...`. Whenever `assets/obsidian.css` or `components.js` is edited, **always run `tools\site_build.bat`** (or `npm run site-build`) so minified assets, `?v=` cache-busting query strings, `sw.js`, `sitemap.xml`, and `assets/search-index.json` are all updated in one step.

## CLI Automation Toolkit (`tools/`)
Consult `tools/starthere.md` and use the existing Python CLI tools instead of ad-hoc scripts:
- **`tools\site_build.bat`** (`python tools/site_build.py`): One-step cache-busting `?v=` bump across active HTML files, `sw.js` & `sitemap.xml` sync, and `npm run build`.
- **`tools\asset_tool.bat`** (`python tools/asset_tool.py`): Optimizes/converts screenshots to `.webp`/`.png` and updates `<img>` `width`/`height` and `og:image` in target HTML pages.
- **`tools\mod_sync.bat`** (`python tools/mod_sync.py`): Parses saved Nexus Mods "My Content" HTML exports, copies new thumbnails to `assets/mods/`, and generates clean, concise Discord announcement posts.
- **`tools\site_audit.bat`** (`python tools/site_audit.py`): Fast (<100ms) sanity check for stray characters before `<!DOCTYPE html>`, forbidden assets (`logus.png`, `forup_291x.png` in meta tags), invalid Nexus slugs (`finalfantasyix`), missing local images, inconsistent `?v=` query strings, and `.card-top-bar` tag clutter.


