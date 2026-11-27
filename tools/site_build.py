#!/usr/bin/env python3
"""
site_build.py — One-Step Build, Cache-Buster, Service Worker & Sitemap Sync for Den of Fao.

Usage:
  python tools/site_build.py                  # Auto-bump ?v=YYYYMMDD (or increment), sync sw.js & sitemap.xml, and run npm build
  python tools/site_build.py --version 20261127
  python tools/site_build.py --bump-sw        # Also increment CACHE_NAME version in sw.js (e.g. denoffao-pwa-v7 -> v8)
  python tools/site_build.py --no-npm         # Only sync HTML query strings, sw.js, and sitemap.xml
"""

import argparse
import datetime
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FROZEN_HTML = {"ffvi-mods.html"}
REDIRECT_ONLY_HTML = {"update-project-kyaro-realignment.html"}


def get_active_html_files():
    files = []
    for p in sorted(ROOT.glob("*.html")):
        if p.name in FROZEN_HTML:
            continue
        files.append(p)
    return files


def compute_next_version(explicit_version=None):
    if explicit_version:
        return explicit_version
    today = datetime.date.today().strftime("%Y%m%d")
    index_path = ROOT / "index.html"
    if index_path.exists():
        text = index_path.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r"obsidian\.min\.css\?v=([0-9A-Za-z._-]+)", text)
        if m:
            cur = m.group(1)
            if cur == today:
                return f"{today}-2"
            if cur.startswith(f"{today}-"):
                try:
                    rev = int(cur.split("-", 1)[1]) + 1
                    return f"{today}-{rev}"
                except ValueError:
                    pass
    return today


def update_html_cache_versions(html_files, version_str):
    updated_count = 0
    css_pat = re.compile(r"(obsidian\.min\.css\?v=)[0-9A-Za-z._-]+")
    js_pat = re.compile(r"(components\.min\.js\?v=)[0-9A-Za-z._-]+")

    for p in html_files:
        if p.name in REDIRECT_ONLY_HTML:
            continue
        orig = p.read_text(encoding="utf-8")
        new_text = css_pat.sub(rf"\g<1>{version_str}", orig)
        new_text = js_pat.sub(rf"\g<1>{version_str}", new_text)
        if new_text != orig:
            p.write_text(new_text, encoding="utf-8", newline="")
            updated_count += 1
    return updated_count


def sync_service_worker(html_files, bump_sw=False):
    sw_path = ROOT / "sw.js"
    if not sw_path.exists():
        return None
    orig = sw_path.read_text(encoding="utf-8")
    new_text = orig

    # Ensure all active non-redirect HTML pages are listed in CORE_ASSETS
    for p in html_files:
        if p.name in REDIRECT_ONLY_HTML:
            continue
        rel = f"'./{p.name}'"
        if rel not in new_text:
            new_text = new_text.replace(
                "  './index.html',\n",
                f"  './index.html',\n  {rel},\n",
                1,
            )

    current_cache = None
    m = re.search(r"const\s+CACHE_NAME\s*=\s*'denoffao-pwa-v(\d+)';", new_text)
    if m:
        ver_num = int(m.group(1))
        if bump_sw or new_text != orig:
            ver_num += 1
            new_text = re.sub(
                r"const\s+CACHE_NAME\s*=\s*'denoffao-pwa-v\d+';",
                f"const CACHE_NAME = 'denoffao-pwa-v{ver_num}';",
                new_text,
                count=1,
            )
        current_cache = f"denoffao-pwa-v{ver_num}"

    if new_text != orig:
        sw_path.write_text(new_text, encoding="utf-8", newline="")
    return current_cache


def sync_sitemap(html_files):
    sitemap_path = ROOT / "sitemap.xml"
    if not sitemap_path.exists():
        return 0
    orig = sitemap_path.read_text(encoding="utf-8")
    new_text = orig
    today_iso = datetime.date.today().strftime("%Y-%m-%d")
    added = 0

    for p in html_files:
        if p.name in REDIRECT_ONLY_HTML or p.name == "index.html":
            continue
        loc = f"https://denoffao.me/{p.name}"
        if loc not in new_text:
            entry = (
                f"  <url>\n"
                f"    <loc>{loc}</loc>\n"
                f"    <lastmod>{today_iso}</lastmod>\n"
                f"    <changefreq>monthly</changefreq>\n"
                f"    <priority>0.8</priority>\n"
                f"  </url>\n"
            )
            new_text = new_text.replace("</urlset>", f"{entry}</urlset>", 1)
            added += 1

    if new_text != orig:
        sitemap_path.write_text(new_text, encoding="utf-8", newline="")
    return added


def run_npm_build():
    npm_cmd = "npm.cmd" if sys.platform.startswith("win") else "npm"
    res = subprocess.run([npm_cmd, "run", "build"], cwd=str(ROOT))
    return res.returncode


def main():
    parser = argparse.ArgumentParser(description="One-step build, cache-buster, and PWA/sitemap sync.")
    parser.add_argument("--version", "-v", help="Explicit cache-busting query string (default: YYYYMMDD or YYYYMMDD-N)")
    parser.add_argument("--bump-sw", action="store_true", help="Increment CACHE_NAME in sw.js")
    parser.add_argument("--no-npm", action="store_true", help="Skip running npm run build")
    args = parser.parse_args()

    html_files = get_active_html_files()
    version_str = compute_next_version(args.version)

    updated_html = update_html_cache_versions(html_files, version_str)
    sw_cache = sync_service_worker(html_files, bump_sw=args.bump_sw)
    added_sitemap = sync_sitemap(html_files)

    print(f"[site_build] Cache query string: ?v={version_str} ({updated_html} HTML files updated)")
    if sw_cache:
        print(f"[site_build] Service Worker cache: {sw_cache}")
    if added_sitemap:
        print(f"[site_build] Added {added_sitemap} new page(s) to sitemap.xml")

    if not args.no_npm:
        code = run_npm_build()
        if code != 0:
            sys.exit(code)


if __name__ == "__main__":
    main()
