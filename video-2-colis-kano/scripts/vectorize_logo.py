"""Vectorise le logo Allô Multi-Services Maradi depuis l'affiche (tracé fidèle, 2 couleurs)."""
import sys, numpy as np, cv2, potrace
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
BOX = (40, 18, 322, 170)   # zone du logo sur l'affiche 1080x1080 (sans le slogan)
S = 6
im = Image.open(SRC).convert('RGB').crop(BOX)
im = im.resize((im.width*S, im.height*S), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)
a = cv2.bilateralFilter(a, 9, 40, 9)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.3*r + 0.59*g + 0.11*b
navy = (b > r + 40) & (lum < 150)
yellow = (r > 170) & (g > 130) & (b < 120) & (r > b + 90)
def clean(m):
    m = (m*255).astype(np.uint8)
    m = cv2.GaussianBlur(m, (0, 0), 2.2)
    return m > 127
def trace(mask, color):
    bm = potrace.Bitmap(~mask)
    path = bm.trace(turdsize=60, alphamax=1.0, opticurve=True, opttolerance=0.3)
    d = []
    for curve in path:
        sp = curve.start_point
        d.append(f"M{sp.x:.1f},{sp.y:.1f}")
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}")
            else:
                d.append(f"C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}")
        d.append("Z")
    return f'<path fill="{color}" fill-rule="evenodd" d="{"".join(d)}"/>'
W, H = im.width, im.height
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
       + trace(clean(yellow), "#FDCB05") + trace(clean(navy), "#06347E") + '</svg>')
open(OUT, 'w').write(svg)
print(W, H, len(svg))
