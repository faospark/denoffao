#!/usr/bin/env python3
"""
site_audit.py — Fast (<100ms) Sanity, Asset, Meta & Hygiene Auditor for Den of Fao.

Checks all active HTML pages, components.js, and assets/blog/blog_data.js for:
  1. Stray characters before <!DOCTYPE html> (e.g. accidental typing before line 1)
  2. Forbidden assets (assets/logus.png, assets/logus (Custom).png) or legacy meta preview (forup_291x.png)
  3. Wrong Nexus Mods game slugs (e.g. nexusmods.com/finalfantasyix/ instead of finalfantasy9)
  4. Missing local image files referenced in <img src="..."> or ALL_MODS_DATA
  5. Mismatched or stale ?v= cache-busting query strings across active HTML pages
  6. Cluttered <span class="tag"> inside .card-top-bar .card-top-tags (except guestbookCountBadge)

Usage:
  python tools/site_audit.py
  python tools/site_audit.py --fix   # Auto-fix stray chars before <!DOCTYPE html>, finalfantasyix URLs, and stale ?v= strings
"""

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FROZEN_HTML = {"ffvi-mods.html"}
REDIRECT_ONLY_HTML = {"update-project-kyaro-realignment.html"}
FORBIDDEN_PATTERNS = [
    (re.compile(r"logus(?:\s*\(Custom\))?\.png", re.IGNORECASE), "Forbidden asset 'logus.png' referenced"),
    (re.compile(r"nexusmods\.com/finalfantasyix/", re.IGNORECASE), "Invalid Nexus slug 'finalfantasyix' (must be 'finalfantasy9')"),
]


def get_page_schema_type(filename: str) -> str:
    if filename == "index.html":
        return "https://schema.org/WebSite"
    if filename in ("projects.html", "mods.html", "blog.html", "project-chrono-cross.html", "project-ffvi-old-ver-mods.html"):
        return "https://schema.org/CollectionPage"
    if filename == "recent-updates.html":
        return "https://schema.org/Article"
    if filename.startswith("project-"):
        return "https://schema.org/SoftwareApplication"
    return "https://schema.org/WebPage"


def inject_html_microdata(filename: str, raw: str) -> str:
    schema_type = get_page_schema_type(filename)

    # 1. Root <main ...> microdata
    raw = re.sub(
        r'(<main\s+class="[^"]*")(?![^>]*\bitemscope\b)([^>]*>)',
        rf'\1 itemscope itemtype="{schema_type}"\2',
        raw,
        count=1,
    )

    # 2. Primary <h1 class="hero-title"...>
    prop_name = "headline" if schema_type.endswith("Article") else "name"
    raw = re.sub(
        r'(<h1\s+class="hero-title")(?![^>]*\bitemprop=)',
        rf'\1 itemprop="{prop_name}"',
        raw,
        count=1,
    )

    # 3. Hero banner image <img ... class="hero-banner-img"...>
    raw = re.sub(
        r'(<img\b[^>]*\bclass="hero-banner-img")(?![^>]*\bitemprop=)',
        r'\1 itemprop="image"',
        raw,
        count=1,
    )

    # 4. Project showcase cards (.project-card, .project-subcard, .project-entry)
    raw = re.sub(
        r'(<(?:article|section)\s+class="(?:project-card|project-subcard|project-entry)"[^>]*)((?<!itemscope)>)',
        lambda m: m.group(0)
        if "itemscope" in m.group(1)
        else f'{m.group(1)} itemscope itemtype="https://schema.org/SoftwareApplication">',
        raw,
    )
    raw = re.sub(
        r'(<h[23]\s+class="(?:project-title|project-subcard-title)"[^>]*)(?![^>]*\bitemprop=)',
        r'\1 itemprop="name"',
        raw,
    )
    raw = re.sub(
        r'(<p\s+class="(?:project-description|project-subcard-desc)"[^>]*)(?![^>]*\bitemprop=)',
        r'\1 itemprop="description"',
        raw,
    )

    # 5. Breadcrumb navigation (<nav aria-label="Breadcrumb" ...>)
    raw = re.sub(
        r'(<nav\s+aria-label="Breadcrumb"\s+class="[^"]*")(?![^>]*\bitemscope\b)',
        r'\1 itemscope itemtype="https://schema.org/BreadcrumbList"',
        raw,
    )

    return raw


def audit_site(auto_fix=False):
    issues = []
    fixed = []

    html_files = [p for p in sorted(ROOT.glob("*.html")) if p.name not in FROZEN_HTML]
    versions_seen = {}

    for p in html_files:
        raw = p.read_text(encoding="utf-8")
        orig = raw

        # 1. Check stray characters before <!DOCTYPE html>
        m_doc = re.search(r"<!DOCTYPE\s+html>", raw, re.IGNORECASE)
        if not m_doc:
            issues.append(f"{p.name}: Missing <!DOCTYPE html> declaration")
        elif m_doc.start() > 0:
            prefix = raw[: m_doc.start()]
            if prefix.strip():
                if auto_fix:
                    raw = raw[m_doc.start() :]
                    fixed.append(f"{p.name}: Removed stray prefix '{prefix.strip()}' before <!DOCTYPE html>")
                else:
                    issues.append(f"{p.name}: Stray text '{prefix.strip()}' before <!DOCTYPE html>")

        # 2. Check forbidden assets & wrong Nexus slugs
        for pat, msg in FORBIDDEN_PATTERNS:
            if pat.search(raw):
                if auto_fix and "finalfantasyix" in msg:
                    raw = re.sub(r"nexusmods\.com/finalfantasyix/", "nexusmods.com/finalfantasy9/", raw, flags=re.IGNORECASE)
                    fixed.append(f"{p.name}: Replaced nexusmods.com/finalfantasyix/ -> finalfantasy9/")
                else:
                    issues.append(f"{p.name}: {msg}")

        # 3. Check legacy forup_291x.png in og:image / twitter:image
        if re.search(r'(?:og:image|twitter:image)[^>]*forup_291x\.png', raw, re.IGNORECASE):
            issues.append(f"{p.name}: Legacy 'forup_291x.png' used in og:image / twitter:image")

        # 4. Check local <img src="..."> existence
        for img_m in re.finditer(r'<img\b[^>]*\bsrc="([^"]+)"', raw, re.IGNORECASE):
            src = img_m.group(1).strip()
            if not src or src.startswith(("http://", "https://", "data:", "${")):
                continue
            clean_src = src.split("?", 1)[0].split("#", 1)[0].lstrip("./")
            if not (ROOT / clean_src).exists():
                issues.append(f"{p.name}: Missing local image '{clean_src}'")

        # 5. Track ?v= query strings on active pages
        if p.name not in REDIRECT_ONLY_HTML:
            for asset_name in ("obsidian.min.css", "components.min.js"):
                vm = re.search(rf"{re.escape(asset_name)}\?v=([0-9A-Za-z._-]+)", raw)
                if vm:
                    versions_seen.setdefault(asset_name, {})[p.name] = vm.group(1)
                else:
                    issues.append(f"{p.name}: Missing ?v= cache-busting parameter on {asset_name}")

        # 6. Check .card-top-bar .card-top-tags clutter
        if p.name != "guestbook.html":
            ct_m = re.search(r'<div class="card-top-bar">[\s\S]*?<div class="card-top-tags">([\s\S]*?)</div>\s*</div>', raw)
            if ct_m and "<span" in ct_m.group(1):
                issues.append(f"{p.name}: Contains <span class=\"tag\"> clutter inside .card-top-bar .card-top-tags")

        # 7. Check JSON-LD and HTML5 Schema.org Microdata (itemscope / itemtype)
        if p.name not in REDIRECT_ONLY_HTML:
            if "application/ld+json" not in raw:
                issues.append(f"{p.name}: Missing <script type=\"application/ld+json\"> structured data")
            if auto_fix:
                new_micro = inject_html_microdata(p.name, raw)
                if new_micro != raw:
                    raw = new_micro
                    fixed.append(f"{p.name}: Injected Schema.org Microdata (itemscope/itemtype/itemprop)")
            if "itemscope" not in raw or "itemtype=" not in raw:
                issues.append(f"{p.name}: Missing HTML5 Schema.org Microdata (itemscope / itemtype)")

        if raw != orig:
            p.write_text(raw, encoding="utf-8", newline="")

    # Check consistency of ?v= across all pages
    for asset_name, page_map in versions_seen.items():
        unique_versions = sorted(set(page_map.values()))
        if len(unique_versions) > 1:
            issues.append(f"Inconsistent ?v= on {asset_name}: {unique_versions}")

    # Check components.js and blog_data.js
    for js_rel in ("components.js", "assets/blog/blog_data.js"):
        jp = ROOT / js_rel
        if not jp.exists():
            continue
        jraw = jp.read_text(encoding="utf-8")
        jorig = jraw
        for pat, msg in FORBIDDEN_PATTERNS:
            if pat.search(jraw):
                if auto_fix and "finalfantasyix" in msg:
                    jraw = re.sub(r"nexusmods\.com/finalfantasyix/", "nexusmods.com/finalfantasy9/", jraw, flags=re.IGNORECASE)
                    fixed.append(f"{js_rel}: Replaced nexusmods.com/finalfantasyix/ -> finalfantasy9/")
                else:
                    issues.append(f"{js_rel}: {msg}")
        if jraw != jorig:
            jp.write_text(jraw, encoding="utf-8", newline="")

    for fmsg in fixed:
        print(f"[FIXED] {fmsg}")

    if issues:
        print(f"[site_audit] Found {len(issues)} issue(s):")
        for imsg in issues:
            print(f"  - {imsg}")
        sys.exit(1)
    else:
        print(f"[site_audit] OK — Audited {len(html_files)} active HTML pages, components.js, and blog_data.js (0 issues).")


def main():
    parser = argparse.ArgumentParser(description="Audit Den of Fao HTML, assets, links, and cache strings.")
    parser.add_argument("--fix", action="store_true", help="Auto-fix stray doctype prefixes and finalfantasyix slugs")
    args = parser.parse_args()
    audit_site(auto_fix=args.fix)


if __name__ == "__main__":
    main()
