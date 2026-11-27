#!/usr/bin/env python3
"""
mod_sync.py — Nexus Mods "My Content" HTML Parser & Clean Discord Announcement Generator.

Usage:
  # List all mods & stats from a saved Nexus "My Content" HTML page:
  python tools/mod_sync.py --nexus-html "E:/Downloads/fgfMy Content at Suikoden I&II HD Remaster Nexus - Mods and community.html"

  # Copy any new thumbnails from the saved Nexus "_files" folder into assets/mods/:
  python tools/mod_sync.py --nexus-html "E:/Downloads/fgfMy Content...html" --copy-thumbs

  # Generate a clean, short Discord announcement template for specific mod IDs:
  python tools/mod_sync.py --discord --ids 14 18 17
"""

import argparse
import html
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

GAME_SLUGS = {
    "7402": ("suikoden1and2hdremaster", "Suikoden I&II HD Remaster"),
    "4420": ("chronocrosstheradicaldreamersedition", "Chrono Cross: The Radical Dreamers Edition"),
    "1948": ("finalfantasy9", "Final Fantasy IX"),
    "3187": ("finalfantasy6", "Final Fantasy VI (Old Ver.)"),
    "4335": ("finalfantasy6pixelremaster", "Final Fantasy VI Pixel Remaster"),
    "4137": ("finalfantasy5pixelremaster", "Final Fantasy V Pixel Remaster"),
    "4022": ("finalfantasyivpixelremaster", "Final Fantasy IV Pixel Remaster"),
    "3942": ("finalfantasy3pixelremaster", "Final Fantasy III Pixel Remaster"),
    "3958": ("finalfantasy2pixelremaster", "Final Fantasy II Pixel Remaster"),
    "3934": ("finalfantasypixelremaster", "Final Fantasy Pixel Remaster"),
}


def parse_nexus_html(html_path: pathlib.Path):
    raw = html_path.read_text(encoding="utf-8", errors="ignore")
    tile_pat = re.compile(
        r'<li class="mod-tile" id="editable-mod-(\d+)-(\d+)">([\s\S]*?)</li>\s*(?=<li class="mod-tile"|</ul>)',
        re.IGNORECASE,
    )
    entries = []
    for m in tile_pat.finditer(raw):
        game_id, mod_id, body = m.group(1), int(m.group(2)), m.group(3)
        img_m = re.search(r'<img\s+src="([^"]+)"', body)
        title_m = re.search(r'<h3><a\s+href="([^"]+)">([\s\S]*?)</a></h3>', body)
        end_m = re.search(r'class="endorsecount[^"]*"[\s\S]*?<span class="flex-label">([^<]+)</span>', body)
        dl_m = re.search(r'class="duel_downloadcount[^"]*"[\s\S]*?<span class="flex-label">([^<]+)</span>', body)

        img_src = html.unescape(img_m.group(1)) if img_m else ""
        img_name = pathlib.Path(img_src).name if img_src else ""
        url = title_m.group(1).strip() if title_m else ""
        title = html.unescape(title_m.group(2)).strip() if title_m else f"Mod #{mod_id}"
        endorsements = end_m.group(1).strip() if end_m else "0"
        downloads = dl_m.group(1).strip() if dl_m else "0/0"

        entries.append(
            {
                "game_id": game_id,
                "id": mod_id,
                "title": title,
                "url": url,
                "img_src": img_src,
                "img_name": img_name,
                "endorsements": endorsements,
                "downloads": downloads,
            }
        )
    return entries


def copy_thumbnails(html_path: pathlib.Path, entries):
    copied = 0
    dest_dir = ROOT / "assets" / "mods"
    dest_dir.mkdir(parents=True, exist_ok=True)
    for e in entries:
        if not e["img_src"]:
            continue
        src_file = (html_path.parent / e["img_src"]).resolve()
        if src_file.exists():
            dst_file = dest_dir / src_file.name
            if not dst_file.exists() or src_file.stat().st_size != dst_file.stat().st_size:
                shutil.copy2(src_file, dst_file)
                copied += 1
                print(f"[mod_sync] Copied thumbnail: assets/mods/{src_file.name}")
    return copied


def load_components_mods():
    comp_path = ROOT / "components.js"
    text = comp_path.read_text(encoding="utf-8")
    m = re.search(r"const\s+ALL_MODS_DATA\s*=\s*\[([\s\S]*?)\n\];", text)
    if not m:
        return []
    block = m.group(1)
    obj_pat = re.compile(
        r'\{\s*"id"\s*:\s*([0-9"]+[A-Za-z0-9_-]*"?)\s*,\s*"title"\s*:\s*"([^"]+)"\s*,\s*"url"\s*:\s*"([^"]+)"[\s\S]*?"category"\s*:\s*"([^"]+)"[\s\S]*?"desc"\s*:\s*"([^"]*)"',
        re.MULTILINE,
    )
    mods = []
    for om in obj_pat.finditer(block):
        raw_id = om.group(1).strip('"')
        mods.append(
            {
                "id": int(raw_id) if raw_id.isdigit() else raw_id,
                "title": om.group(2),
                "url": om.group(3),
                "category": om.group(4),
                "desc": om.group(5),
            }
        )
    return mods


def generate_discord_post(ids=None, category=None, page_url="https://denoffao.me/recent-updates.html"):
    mods = load_components_mods()
    if category:
        mods = [m for m in mods if m["category"].lower() == category.lower()]
    if ids:
        id_list = [int(x) if str(x).isdigit() else x for x in ids]
        selected = []
        for target_id in id_list:
            match = next((m for m in mods if m["id"] == target_id), None)
            if match:
                selected.append(match)
    else:
        selected = mods[:3]

    lines = [
        "# 🛡️ Recent Mod Updates",
        "",
        f"Full announcement page: {page_url}",
        "",
    ]
    for m in selected:
        lines.append(f"* **{m['title']}** — {m['desc']}")
        lines.append(f"  {m['url']}")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Parse Nexus Mods HTML exports and generate clean Discord posts.")
    parser.add_argument("--nexus-html", help="Path to saved Nexus Mods 'My Content' HTML file")
    parser.add_argument("--copy-thumbs", action="store_true", help="Copy mod thumbnails from saved Nexus _files folder into assets/mods/")
    parser.add_argument("--discord", action="store_true", help="Print a clean, ready-to-paste Discord post for selected mod IDs")
    parser.add_argument("--ids", nargs="*", help="Mod IDs to include in Discord post (default: top 3 in ALL_MODS_DATA)")
    parser.add_argument("--category", "-c", help="Optional category filter (e.g. suikoden, ffvi, ffix, ffpr, chrono)")
    parser.add_argument("--page-url", default="https://denoffao.me/recent-updates.html", help="Announcement page URL for Discord post")
    args = parser.parse_args()

    if args.nexus_html:
        hp = pathlib.Path(args.nexus_html)
        if not hp.exists():
            print(f"[mod_sync] Error: File not found: {hp}", file=sys.stderr)
            sys.exit(1)
        entries = parse_nexus_html(hp)
        print(f"[mod_sync] Parsed {len(entries)} mods from {hp.name} (ordered as on page):")
        for idx, e in enumerate(entries, 1):
            print(
                f"  {idx:2d}. [#{e['id']}] {e['title']} | ★ {e['endorsements']} | DL {e['downloads']} | {e['img_name']}"
            )
        if args.copy_thumbs:
            copied = copy_thumbnails(hp, entries)
            print(f"[mod_sync] Copied {copied} new/updated thumbnail(s) to assets/mods/")

    if args.discord:
        print("\n" + generate_discord_post(ids=args.ids, category=args.category, page_url=args.page_url))


if __name__ == "__main__":
    main()
