# Den of Fao — CLI Automation Toolkit Guide (`tools/`)

This folder contains the Python CLI automation tools (and `.bat` wrappers) for **Den of Fao** (`denoffao.me`). Use these tools from the repository root (`e:\xampp\htdocs\denoffao`) instead of running manual one-off scripts.

---

## Quick Command Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Rebuild CSS/JS + bump `?v=` cache + rebuild search index** | `tools\site_build.bat` *(or `npm run site-build`)* |
| **Audit all HTML/JS for broken images, typos, or bad links** | `tools\site_audit.bat` *(or `npm run audit`)* |
| **Auto-fix stray text before `<!DOCTYPE html>` & `finalfantasyix` links** | `tools\site_audit.bat --fix` |
| **Convert a screenshot to `.webp` and update HTML `width`/`height`** | `tools\asset_tool.bat -i "shot.jpg" -o "assets/mods/new.webp" --html page.html` |
| **Parse a saved Nexus "My Content" HTML page & copy thumbnails** | `tools\mod_sync.bat --nexus-html "E:\Downloads\My Content.html" --copy-thumbs` |
| **Generate a clean Discord update announcement** | `tools\mod_sync.bat --discord --category suikoden --ids 14 18 17` |

---

## 1. `site_build.bat` ([site_build.py](site_build.py))
**Purpose:** One-step build pipeline whenever you edit `assets/obsidian.css`, `components.js`, `assets/blog/blog_data.js`, or add/edit an `.html` page.

### What It Does Automatically
1. **Bumps `?v=` Cache Query Strings:** Updates `assets/obsidian.min.css?v=...` and `components.min.js?v=...` across all active `.html` files to today's date (`YYYYMMDD`), or increments to `YYYYMMDD-2`, `YYYYMMDD-3`, etc. if you build multiple times on the same day. *(Never touches frozen `ffvi-mods.html`.)*
2. **Syncs `sw.js` & `sitemap.xml`:** Adds any newly created `.html` page to `CORE_ASSETS` in `sw.js` and `<urlset>` in `sitemap.xml`.
3. **Runs `npm run build`:** Minifies `components.js` → `components.min.js` and `assets/obsidian.css` → `assets/obsidian.min.css` via `esbuild`, and rebuilds `assets/search-index.json`.

### Options & Examples
```powershell
# Standard build (auto-bumps ?v=, syncs sw.js & sitemap.xml, minifies CSS/JS, rebuilds search index):
tools\site_build.bat

# Also force-increment CACHE_NAME in sw.js (e.g. denoffao-pwa-v7 -> denoffao-pwa-v8):
tools\site_build.bat --bump-sw

# Set a specific ?v= version string manually:
tools\site_build.bat --version 20261127

# Only update ?v= strings, sw.js, and sitemap.xml without running npm build:
tools\site_build.bat --no-npm
```

---

## 2. `asset_tool.bat` ([asset_tool.py](asset_tool.py))
**Purpose:** Converts and optimizes screenshots (`.jpg` / `.png` → `.webp` or `.png`), reads the exact output pixel dimensions (`width` × `height`), and updates `<img width="..." height="...">` and OpenGraph preview tags in your HTML pages.

### Options
- `-i`, `--input <path>` *(Required)*: Path to the source image file.
- `-o`, `--output <path>` *(Required)*: Destination path relative to the repo root (e.g. `assets/mods/my-banner.webp`).
- `-q`, `--quality <1-100>`: WebP/JPEG compression quality (default: `85`).
- `--max-width <px>`: Optional maximum width in pixels (resizes proportionally using Lanczos resampling if wider).
- `--html <file1.html> [file2.html ...]`: Target HTML file(s) where `<img>` `width` and `height` attributes should be synced.
- `--replace-src <old/path.png>`: Replaces an old image path with the new `--output` path inside the `--html` files before syncing `width`/`height`.
- `--update-og`: Also updates `<meta property="og:image">`, `<meta name="twitter:image">`, and JSON-LD `"image"` in the target `--html` files.

### Examples
```powershell
# 1. Convert a JPG screenshot into an optimized WebP in assets/mods/:
tools\asset_tool.bat -i "C:\Users\thefao\Desktop\shot.jpg" -o "assets/mods/kupo-engine-6.webp"

# 2. Resize a large 4K screenshot down to 1024px wide and save as WebP:
tools\asset_tool.bat -i "C:\Users\thefao\Desktop\raw-4k.png" -o "assets/mods/preview.webp" --max-width 1024 -q 85

# 3. Replace an existing image in two HTML pages and automatically update width="...", height="...", and og:image:
tools\asset_tool.bat -i "C:\Users\thefao\Desktop\new-banner.jpg" -o "assets/mods/kupo-engine-6.webp" --html project-kupo-engine-6.html projects.html --replace-src "assets/mods/ffvi-old-ver-showcase.webp" --update-og
```

---

## 3. `mod_sync.bat` ([mod_sync.py](mod_sync.py))
**Purpose:** Parses a saved Nexus Mods *"My Content"* HTML page (when you press `Ctrl+S` on your Nexus Mods files list in the browser) to extract your latest mod order, stats, and thumbnails, and generates short, clean Discord announcement posts.

### Options
- `--nexus-html <path>`: Path to the saved Nexus Mods *"My Content"* `.html` file.
- `--copy-thumbs`: Copies any new or updated mod thumbnails from the saved `*_files/` companion folder directly into `assets/mods/`.
- `--discord`: Outputs a clean, ready-to-paste Discord markdown post (plain URLs, no `<...>` brackets, no wall-of-text bloat).
- `--category`, `-c <cat>`: Filters mods by category (`suikoden`, `ffvi`, `ffix`, `ffpr`, `chrono`, `other`).
- `--ids <id1> [id2 ...]`: Specific Nexus Mod IDs to include in the Discord post, in the exact order listed.
- `--page-url <url>`: Announcement URL included at the top of the Discord post (default: `https://denoffao.me/recent-updates.html`).

### Examples
```powershell
# 1. List all mods, endorsements, and downloads from a saved Nexus "My Content" HTML file:
tools\mod_sync.bat --nexus-html "E:\Downloads\fgfMy Content at Suikoden I&II HD Remaster Nexus - Mods and community.html"

# 2. Parse the saved HTML and copy any new mod thumbnails into assets/mods/:
tools\mod_sync.bat --nexus-html "E:\Downloads\fgfMy Content at Suikoden I&II HD Remaster Nexus - Mods and community.html" --copy-thumbs

# 3. Generate a clean Discord post for Suikoden mods #14, #18, and #17:
tools\mod_sync.bat --discord --category suikoden --ids 14 18 17
```

---

## 4. `site_audit.bat` ([site_audit.py](site_audit.py))
**Purpose:** Fast (`<100ms`) sanity check across all active `.html` files, `components.js`, and `assets/blog/blog_data.js` to catch typos and regressions immediately.

### What It Checks
1. **Stray Text Before `<!DOCTYPE html>`:** Catches accidental characters typed at the top of an HTML file (like `dea<!DOCTYPE html>`).
2. **Forbidden & Legacy Assets:** Flags any reference to `logus.png` / `logus (Custom).png`, or `forup_291x.png` inside `og:image` / `twitter:image`.
3. **Invalid Nexus Slugs:** Flags `nexusmods.com/finalfantasyix/` (which must be `nexusmods.com/finalfantasy9/`).
4. **Missing Local Images:** Verifies that every local `<img src="...">` path actually exists on disk.
5. **Cache-Busting Consistency:** Verifies that every active page has `?v=...` on `obsidian.min.css` and `components.min.js` and that all pages are on the same version.
6. **Top-Bar Tag Clutter:** Checks that `.card-top-bar .card-top-tags` doesn't have redundant `<span class="tag">` badges crowding the `Share` button.

### Examples
```powershell
# Run the full audit check:
tools\site_audit.bat

# Automatically fix stray text before <!DOCTYPE html> and replace finalfantasyix -> finalfantasy9:
tools\site_audit.bat --fix
```

---

## Recommended Workflow When Making Site Updates

1. **If replacing or adding a screenshot:**
   ```powershell
   tools\asset_tool.bat -i "path\to\image.jpg" -o "assets/mods/name.webp" --html target-page.html --update-og
   ```
2. **After editing any HTML, CSS (`assets/obsidian.css`), or JS (`components.js` / `blog_data.js`):**
   ```powershell
   tools\site_build.bat
   ```
3. **Verify zero issues before committing or refreshing:**
   ```powershell
   tools\site_audit.bat
   ```
