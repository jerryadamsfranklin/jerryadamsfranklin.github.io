#!/usr/bin/env python3
"""Generate orange/black suite logo marks from brand sources (raster + SVG)."""
from __future__ import annotations

import io
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "logos" / "_src"
OUT = ROOT / "assets" / "logos"
SIZE = 256
ORANGE = (249, 115, 22, 255)
BLACK = (12, 12, 12, 255)
PAD = 0.14

OUT.mkdir(parents=True, exist_ok=True)


def open_any(path: Path) -> Image.Image:
    data = path.read_bytes()
    img = Image.open(io.BytesIO(data))
    img.load()
    if getattr(img, "n_frames", 1) > 1:
        best, best_area = None, -1
        for i in range(img.n_frames):
            img.seek(i)
            frame = img.copy().convert("RGBA")
            area = frame.size[0] * frame.size[1]
            if area > best_area:
                best, best_area = frame, area
        return best
    return img.convert("RGBA")


def blank_plate() -> Image.Image:
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    margin = 2
    draw.rounded_rectangle(
        [margin, margin, SIZE - 1 - margin, SIZE - 1 - margin],
        radius=int(SIZE * 0.22),
        fill=BLACK,
        outline=(249, 115, 22, 150),
        width=max(2, SIZE // 64),
    )
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    inset = int(SIZE * 0.1)
    gdraw.ellipse([inset, inset, SIZE - inset, SIZE - inset], fill=(249, 115, 22, 32))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(radius=SIZE // 9)))
    return canvas


def suite_svg_doc(inner_svg: str) -> str:
    """Wrap a simple-icons path SVG into a suite plate."""
    # Extract path(s)
    paths = re.findall(r"<path[^>]*d=\"([^\"]+)\"[^>]*/?>", inner_svg)
    if not paths:
        raise ValueError("No path in SVG")
    path_xml = "\n".join(f'<path fill="#f97316" d="{d}"/>' for d in paths)
    pad = 4.2  # viewBox 0..24 with padding
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 24 24">
  <rect x="0.4" y="0.4" width="23.2" height="23.2" rx="5.2" ry="5.2" fill="#0c0c0c" stroke="#f97316" stroke-opacity="0.55" stroke-width="0.45"/>
  <g transform="translate(0,0) scale(1)">
    <g transform="translate({pad/2},{pad/2}) scale({(24-pad)/24})">
      {path_xml}
    </g>
  </g>
</svg>"""


def render_svg_playwright(svg_text: str) -> Image.Image:
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        svg_file = td_path / "mark.svg"
        png_file = td_path / "mark.png"
        svg_file.write_text(svg_text, encoding="utf-8")
        script = td_path / "render.js"
        script.write_text(
            f"""
const {{ chromium }} = require('playwright');
const fs = require('fs');
(async () => {{
  const browser = await chromium.launch();
  const page = await browser.newPage({{
    viewport: {{ width: {SIZE}, height: {SIZE} }},
    deviceScaleFactor: 1
  }});
  const svg = fs.readFileSync({str(svg_file)!r}, 'utf8');
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">` +
    svg +
    `</body></html>`,
    {{ waitUntil: 'load' }}
  );
  await page.locator('svg').screenshot({{ path: {str(png_file)!r}, omitBackground: true }});
  await browser.close();
}})().catch(e => {{ console.error(e); process.exit(1); }});
""",
            encoding="utf-8",
        )
        # Ensure playwright is resolvable from a temp npm project in repo tooling cache
        node_dir = ROOT / ".tools" / "logo-render"
        node_dir.mkdir(parents=True, exist_ok=True)
        if not (node_dir / "node_modules" / "playwright").exists():
            subprocess.run(
                ["npm", "init", "-y"],
                cwd=node_dir,
                check=True,
                capture_output=True,
            )
            subprocess.run(
                ["npm", "install", "playwright@1.63.0"],
                cwd=node_dir,
                check=True,
                capture_output=True,
            )
        env = dict(**dict(**{k: v for k, v in __import__("os").environ.items()}))
        env["NODE_PATH"] = str(node_dir / "node_modules")
        subprocess.run(
            ["node", str(script)],
            cwd=node_dir,
            check=True,
            env=env,
        )
        return Image.open(png_file).convert("RGBA")


def suite_from_svg_file(svg_path: Path) -> Image.Image:
    raw = svg_path.read_text(encoding="utf-8", errors="ignore")
    doc = suite_svg_doc(raw)
    return render_svg_playwright(doc)


def suite_from_raster(img: Image.Image, pad: float | None = None) -> Image.Image:
    pad = PAD if pad is None else pad
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            # White / near-white plate -> transparent
            if lum > 220 and abs(r - g) < 28 and abs(g - b) < 28:
                px[x, y] = (0, 0, 0, 0)

    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        gray = ImageOps.grayscale(img.convert("RGB"))
        # Black ink on white: invert so dark becomes mask
        mask = gray.point(lambda v: 255 if v < 200 else 0)
        bbox = mask.getbbox()
        if not bbox:
            return blank_plate()
        cropped = img.crop(bbox)
        mask = mask.crop(bbox)
    else:
        cropped = img.crop(bbox)
        # Prefer luminance of remaining opaque pixels as glyph strength
        gray = ImageOps.grayscale(cropped.convert("RGB"))
        a = cropped.split()[-1]
        # Darker pixels = stronger glyph (works for black logos on transparent)
        ink = gray.point(lambda v: 255 - v)
        mask = Image.composite(ink, Image.new("L", cropped.size, 0), a)

    box = int(SIZE * (1 - 2 * pad))
    fitted = ImageOps.contain(cropped, (box, box), Image.Resampling.LANCZOS)
    mask = ImageOps.contain(mask, (box, box), Image.Resampling.LANCZOS)
    mask = mask.filter(ImageFilter.SHARPEN)

    orange = Image.new("RGBA", fitted.size, ORANGE)
    orange.putalpha(mask)

    canvas = blank_plate()
    ox = (SIZE - fitted.size[0]) // 2
    oy = (SIZE - fitted.size[1]) // 2
    canvas.alpha_composite(orange, (ox, oy))
    return canvas


def pick_first(*names: str) -> Path | None:
    for name in names:
        p = SRC / name
        if p.exists() and p.stat().st_size > 40:
            # skip HTML mistaken downloads
            head = p.read_bytes()[:20]
            if head.lstrip().startswith(b"<!DOCTYPE") or head.lstrip().startswith(b"<html"):
                continue
            return p
    return None


def build_one(out_name: str, sources: list[str], prefer_svg: bool = False, pad: float | None = None) -> Path:
    out = OUT / out_name
    img = None
    if prefer_svg:
        for s in sources:
            if s.endswith(".svg") and (SRC / s).exists():
                try:
                    img = suite_from_svg_file(SRC / s)
                    break
                except Exception as e:
                    print(f"  svg fail {s}: {e}")
    if img is None:
        src = pick_first(*sources)
        if src is None:
            raise FileNotFoundError(f"No source for {out_name}: {sources}")
        if src.suffix.lower() == ".svg":
            img = suite_from_svg_file(src)
        else:
            img = suite_from_raster(open_any(src), pad=pad)
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes)")
    return out


def main() -> None:
    # Events / orgs
    build_one("airisk-summit.png", ["securityweek.png", "securityweek-icon.png", "airisk.png", "airisk-icon.png"])
    build_one("nearcon.png", ["near-si.svg", "near.png", "near-icon.png", "nearcon.png"], prefer_svg=True)
    build_one("near.png", ["near-si.svg", "near.png", "near-icon.png"], prefer_svg=True)
    build_one("ethcc.png", ["ethcc.png", "ethcc-icon.png"])
    build_one("vitap.png", ["vitap.png", "vitap-icon.png"])
    build_one("dcg.png", ["dcg-official.png", "dcg.png"], pad=0.1)
    build_one("intel.png", ["intel-si.svg", "intel.png"], prefer_svg=True)
    build_one("nokia.png", ["nokia-si.svg", "nokia.png"], prefer_svg=True)
    build_one("foundry.png", ["foundry.png"])
    build_one("flock.png", ["flock.png"])
    build_one("onebill.png", ["onebill.png"])
    build_one("northeastern.png", ["northeastern.png"])
    build_one("dsu.png", ["dsu.png"])
    build_one("asu.png", ["asu-ddg.png", "asu.png"])
    build_one("berkeley.png", ["berkeley.png"])
    build_one("usaii.png", ["usaii.png"])
    build_one("opportunityhack.png", ["opportunityhack.png"])
    build_one("lablab.png", ["lablab.png"])
    build_one("brightdata.png", ["brightdata.png"])
    build_one("arxiv.png", ["arxiv-si.svg", "arxiv.png"], prefer_svg=True)
    build_one("hackernoon.png", ["hackernoon.png"])
    build_one("acm.png", ["acm.png"])
    build_one("springer.png", ["springer.png"])
    build_one("sciencetimes.png", ["sciencetimes.png"])
    build_one("peerj.png", ["peerj.png"])
    build_one("ieee.png", ["ieee-si.svg"], prefer_svg=True)
    print("done")


if __name__ == "__main__":
    main()
