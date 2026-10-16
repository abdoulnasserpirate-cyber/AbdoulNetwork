"""Derived image assets: blurred ambient backgrounds (one per photo), film-grain tile, photo sizes.
Usage: python3 scripts/prep_derived.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
(ROOT / "assets/photos/blur").mkdir(parents=True, exist_ok=True)
sizes = {}
for p in sorted((ROOT / "assets/photos").glob("*.jpg")):
    im = Image.open(p).convert("RGB")
    sizes[p.stem] = im.size
    b = im.copy()
    b.thumbnail((640, 640))
    w, h = b.size
    # cover-crop to 16:9 then blur and darken
    tw, th = (w, int(w * 9 / 16)) if w / h < 16 / 9 else (int(h * 16 / 9), h)
    b = b.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th)).resize((960, 540), Image.LANCZOS)
    b = b.filter(ImageFilter.GaussianBlur(26))
    b = ImageEnhance.Brightness(b).enhance(0.55)
    b = ImageEnhance.Color(b).enhance(1.15)
    b.save(ROOT / "assets/photos/blur" / p.name, quality=88)
json.dump(sizes, open(ROOT / "assets/photos/sizes.json", "w"), indent=0)
rng = np.random.default_rng(7)
g = (128 + rng.normal(0, 38, (720, 720))).clip(0, 255).astype(np.uint8)
Image.fromarray(g, "L").save(ROOT / "assets/grain.png")
print(len(sizes), "photos")
