"""Pre-render the bokeh field into two transparent layers (far = big & soft, near = small & crisp),
so the composition carries 2 images instead of dozens of blurred gradient dots."""
import numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(20261019)
S = 2400
for name, count, rmin, rmax, blur, alpha in (("far", 22, 30, 80, 14, 0.45), ("near", 46, 5, 18, 2.5, 0.85)):
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    yy, xx = np.mgrid[0:S, 0:S]
    acc = np.zeros((S, S, 4), np.float32)
    for _ in range(count):
        r = rng.uniform(rmin, rmax); cx, cy = rng.uniform(0, S, 2)
        gold = rng.random() < 0.35
        col = (255, 240, 190) if gold else (255, 222, 240)
        x0, x1 = int(max(0, cx - r * 2)), int(min(S, cx + r * 2)); y0, y1 = int(max(0, cy - r * 2)), int(min(S, cy + r * 2))
        d = np.sqrt((xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2) / r
        a = np.clip(1.15 - d, 0, 1) ** 0.8 * alpha * rng.uniform(0.45, 1)
        for c in range(3):
            acc[y0:y1, x0:x1, c] = np.maximum(acc[y0:y1, x0:x1, c], col[c] * (a > 0))
        acc[y0:y1, x0:x1, 3] = np.maximum(acc[y0:y1, x0:x1, 3], a * 255)
    img = Image.fromarray(acc.astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(blur))
    img.save(f"assets/bokeh-{name}.png", optimize=True)
    print("bokeh", name)
