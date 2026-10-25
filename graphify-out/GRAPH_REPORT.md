# Graph Report - denoffao  (2026-10-25)

## Corpus Check
- 13 files · ~148,286 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .css 2, .map 1)

## Summary
- 166 nodes · 198 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c864c26`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Core Web Components & UI
- Minified Components Bundle
- Kupo FFIX Mod Framework & Tools
- Blog, Archives & Featured Projects
- Project Metadata & Configuration
- Project Rules & Legacy Policies
- FFVI Old Version Mods & Tools
- Traveler's Guestbook System
- Crawler & Robot Directives
- Mod Catalog Data Snippet
- Service Worker & Offline Cache

## God Nodes (most connected - your core abstractions)
1. `Special Projects & Flagship Suites Directory` - 10 edges
2. `Den of Mods Home Portal` - 10 edges
3. `The PROJECT KYARO Suite (PC Remaster)` - 9 edges
4. `Kupo-UI.PR Framework (FF1–FF6)` - 9 edges
5. `Project Kyaro (Suikoden II PSX)` - 7 edges
6. `FFVI Old Tile Tool (ffvi_tileConverter)` - 7 edges
7. `Faospark's FFVI Mods Legacy Page` - 7 edges
8. `SuiSaveEditor (Suikoden II HD)` - 6 edges
9. `Faospark's Chronicles Blog & Historical Archives Page` - 6 edges
10. `applyVaultLanguage()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `FFVI Mods Legacy Protection Rule` --references--> `Faospark's FFVI Mods Legacy Page`  [EXTRACTED]
  .agents/rules/legacy-pages.md → ffvi-mods.html
- `Legacy Pages Policy Document` --conceptually_related_to--> `Project Rules and Instructions`  [INFERRED]
  .agents/rules/legacy-pages.md → AGENTS.md
- `Repository README Overview` --conceptually_related_to--> `Den of Mods Home Portal`  [INFERRED]
  README.md → index.html
- `The PROJECT KYARO Suite (PC Remaster)` --conceptually_related_to--> `Project Kyaro (Suikoden II PSX)`  [INFERRED]
  project-kyaro-pc.html → project-kyaro.html
- `The PROJECT KYARO Suite (PC Remaster)` --conceptually_related_to--> `SuiSaveEditor (Suikoden II HD)`  [INFERRED]
  project-kyaro-pc.html → project-suisaveeditor.html

## Import Cycles
- None detected.

## Communities (13 total, 4 thin omitted)

### Community 0 - "Core Web Components & UI"
Cohesion: 0.08
Nodes (27): ALL_MODS_DATA, ApocalypseMods, applyVaultLanguage(), applyVaultTheme(), BackToTop, closeLightbox(), closeLightboxDirect(), CommunityBox (+19 more)

### Community 1 - "Minified Components Bundle"
Cohesion: 0.08
Nodes (27): ALL_MODS_DATA, ApocalypseMods, applyVaultLanguage(), applyVaultTheme(), BackToTop, closeLightbox(), closeLightboxDirect(), CommunityBox (+19 more)

### Community 2 - "Kupo FFIX Mod Framework & Tools"
Cohesion: 0.10
Nodes (21): Project Kyaro (Suikoden II PSX), Battle Mechanics & Reusable Runes Overhaul, The PROJECT KYARO Suite (PC Remaster), PKCore BepInEx 6 IL2CPP Engine, PC Remaster Dynamic Portraits Framework, DDS BC1/BC3/BC7 Texture Replacement & Byte Caching, Project Kyaro Sprites & Smoothing Configuration, Curated 80+ GameShark / Action Replay Cheats (+13 more)

### Community 3 - "Blog, Archives & Featured Projects"
Cohesion: 0.13
Nodes (19): Faospark's Chronicles Blog & Historical Archives Page, Full Article Reader Modal Dialog, Blog Search and Category Filter Controls, Blog Historical Archive Year Selector, In-Page Guestbook Submission Form, Google Sheets & Apps Script Integration, Traveler's Guestbook Page, Guestbook Search & Refresh Toolbar (+11 more)

### Community 4 - "Project Metadata & Configuration"
Cohesion: 0.18
Nodes (10): bugs, url, description, homepage, main, name, scripts, test (+2 more)

### Community 5 - "Project Rules & Legacy Policies"
Cohesion: 0.22
Nodes (10): Architectural Guidelines & Transparency, Forbidden Assets Policy, Legacy Files Policy, Project Rules and Instructions, FFVI Mods Legacy Protection Rule, Legacy Pages Policy Document, FFVI Artomnia Portraits Mod, Project Atma Weapon Custom Installer (+2 more)

### Community 6 - "FFVI Old Version Mods & Tools"
Cohesion: 0.20
Nodes (10): FFVI Old Ver 10-Mod Collection, Celes Recruitment Scene Restoration, FFVI Old Ver Mods Hub, Sane UI Overhaul (Horizontal ATB), Map BIN Batch Pipeline & Gzip Support, Dual Section Viewport & Transparency Preview, Mirrored Palette Sync & Detection, FFVI Old Tile Tool (ffvi_tileConverter) (+2 more)

### Community 8 - "Traveler's Guestbook System"
Cohesion: 0.17
Nodes (12): Kupo Modular Architecture (10 Sub-Modules), Memoria Mod Manager Integration, Kupo Mods Library (FFIX), Airship Plus (Retired Module), Dialogue Portrait Injection & Speaker Names, Font & Typography Injection Engine, Runtime GameObject & Layout Engine, Mod Conflict Scanner & Diagnostics (+4 more)

### Community 9 - "Crawler & Robot Directives"
Cohesion: 0.67
Nodes (3): AI Training & Scraper Blocking Directives, Search Engine Indexing Allowlist Policy, robots.txt Crawler Directives

## Knowledge Gaps
- **51 isolated node(s):** `SuikodenFix JSON Save Workflow`, `Battle Mechanics & Reusable Runes Overhaul`, `PKCore BepInEx 6 IL2CPP Engine`, `PC Remaster Dynamic Portraits Framework`, `DDS BC1/BC3/BC7 Texture Replacement & Byte Caching` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 90 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Special Projects & Flagship Suites Directory` connect `Kupo FFIX Mod Framework & Tools` to `Traveler's Guestbook System`, `FFVI Old Version Mods & Tools`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `The PROJECT KYARO Suite (PC Remaster)` (e.g. with `Project Kyaro (Suikoden II PSX)` and `SuiSaveEditor (Suikoden II HD)`) actually correct?**
  _`The PROJECT KYARO Suite (PC Remaster)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SuikodenFix JSON Save Workflow`, `Battle Mechanics & Reusable Runes Overhaul`, `PKCore BepInEx 6 IL2CPP Engine` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Web Components & UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08403361344537816 - nodes in this community are weakly interconnected._
- **Why does `Kupo-UI.PR Framework (FF1–FF6)` connect `Traveler's Guestbook System` to `Kupo FFIX Mod Framework & Tools`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Minified Components Bundle` be split into smaller, more focused modules?**
  _Cohesion score 0.08235294117647059 - nodes in this community are weakly interconnected._
- **Why does `Den of Mods Home Portal` connect `Blog, Archives & Featured Projects` to `Project Rules & Legacy Policies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._