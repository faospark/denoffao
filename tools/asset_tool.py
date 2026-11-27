#!/usr/bin/env python3
"""
asset_tool.py — Image Optimizer, WebP Converter & HTML Dimension/Meta Sync for Den of Fao.

Usage:
  # Convert/optimize an image into assets/mods/ and print dimensions:
  python tools/asset_tool.py --input "C:/path/to/shot.jpg" --output "assets/mods/kupo-engine-6.webp"

  # Also replace old asset reference in HTML files and sync width="...", height="...", and og:image:
  python tools/asset_tool.py --input "C:/path/to/shot.jpg" --output "assets/mods/kupo-engine-6.webp" \
      --html project-kupo-engine-6.html projects.html --replace-src "assets/mods/ffvi-old-ver-showcase.webp" --update-og
"""

import argparse
import pathlib
import re
import sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
FROZEN_HTML = {"ffvi-mods.html"}


def optimize_image(src_path: pathlib.Path, dst_path: pathlib.Path, max_width: int = 0, quality: int = 85):
    with Image.open(src_path) as im:
        orig_w, orig_h = im.size
        if max_width and orig_w > max_width:
            new_h = round(orig_h * (max_width / orig_w))
            im = im.resize((max_width, new_h), Image.Resampling.LANCZOS)

        dst_path.parent.mkdir(parents=True, exist_ok=True)
        ext = dst_path.suffix.lower()

        if ext == ".webp":
            im.save(dst_path, "WEBP", quality=quality, method=6)
        elif ext == ".png":
            im.save(dst_path, "PNG", optimize=True)
        elif ext in (".jpg", ".jpeg"):
            if im.mode in ("RGBA", "P"):
                im = im.convert("RGB")
            im.save(dst_path, "JPEG", quality=quality, optimize=True)
        else:
            im.save(dst_path)

        final_w, final_h = im.size
    return final_w, final_h, dst_path.stat().st_size


def update_html_references(
    html_paths,
    rel_output: str,
    width: int,
    height: int,
    replace_src: str = None,
    update_og: bool = False,
):
    rel_output = rel_output.replace("\\", "/").lstrip("./")
    if replace_src:
        replace_src = replace_src.replace("\\", "/").lstrip("./")

    for hp in html_paths:
        p = (ROOT / hp).resolve() if not pathlib.Path(hp).is_absolute() else pathlib.Path(hp)
        if p.name in FROZEN_HTML:
            print(f"[asset_tool] Skipping frozen page: {p.name}")
            continue
        if not p.exists():
            print(f"[asset_tool] Warning: HTML file not found: {p}")
            continue

        orig = p.read_text(encoding="utf-8")
        text = orig

        if replace_src:
            text = text.replace(replace_src, rel_output)

        # Update width and height on any <img ... src="rel_output" ...>
        escaped_src = re.escape(rel_output)

        def patch_img_tag(match):
            tag = match.group(0)
            if re.search(r'\bwidth="\d+"', tag):
                tag = re.sub(r'\bwidth="\d+"', f'width="{width}"', tag)
            else:
                tag = tag[:-1] + f' width="{width}">'
            if re.search(r'\bheight="\d+"', tag):
                tag = re.sub(r'\bheight="\d+"', f'height="{height}"', tag)
            else:
                tag = tag[:-1] + f' height="{height}">'
            return tag

        text = re.sub(rf'<img\b[^>]*\bsrc="{escaped_src}"[^>]*>', patch_img_tag, text)

        if update_og:
            full_og = f"https://denoffao.me/{rel_output}"
            text = re.sub(
                r'(<meta\s+property="og:image"\s+content=")[^"]+(")',
                rf"\g<1>{full_og}\2",
                text,
            )
            text = re.sub(
                r'(<meta\s+name="twitter:image"\s+content=")[^"]+(")',
                rf"\g<1>{full_og}\2",
                text,
            )
            text = re.sub(
                r'("image"\s*:\s*")https://denoffao\.me/[^"]+(")',
                rf"\g<1>{full_og}\2",
                text,
            )

        if text != orig:
            p.write_text(text, encoding="utf-8", newline="")
            print(f"[asset_tool] Updated {p.name} -> {rel_output} ({width}x{height})")


def main():
    parser = argparse.ArgumentParser(description="Optimize image and sync HTML width/height & meta tags.")
    parser.add_argument("--input", "-i", required=True, help="Source image path")
    parser.add_argument("--output", "-o", required=True, help="Output path relative to repo root (e.g. assets/mods/foo.webp)")
    parser.add_argument("--max-width", type=int, default=0, help="Optional max width resize (preserves aspect ratio)")
    parser.add_argument("--quality", "-q", type=int, default=85, help="WebP/JPEG quality (default: 85)")
    parser.add_argument("--html", nargs="*", default=[], help="HTML files to update with new asset and dimensions")
    parser.add_argument("--replace-src", help="Old asset path to replace in target HTML files")
    parser.add_argument("--update-og", action="store_true", help="Also update og:image, twitter:image, and JSON-LD image in target HTML files")
    args = parser.parse_args()

    src = pathlib.Path(args.input).resolve()
    if not src.exists():
        print(f"[asset_tool] Error: Input file does not exist: {src}", file=sys.stderr)
        sys.exit(1)

    dst = pathlib.Path(args.output)
    if not dst.is_absolute():
        dst = (ROOT / dst).resolve()

    src_size = src.stat().st_size
    w, h, dst_size = optimize_image(src, dst, max_width=args.max_width, quality=args.quality)
    rel_out = str(dst.relative_to(ROOT)).replace("\\", "/")
    saving_pct = ((src_size - dst_size) / src_size * 100.0) if src_size else 0.0

    print(f"[asset_tool] Saved {rel_out} ({w}x{h}, {dst_size / 1024:.1f} KB, {saving_pct:+.1f}% vs source)")

    if args.html:
        update_html_references(
            args.html,
            rel_output=rel_out,
            width=w,
            height=h,
            replace_src=args.replace_src,
            update_og=args.update_og,
        )


if __name__ == "__main__":
    main()
