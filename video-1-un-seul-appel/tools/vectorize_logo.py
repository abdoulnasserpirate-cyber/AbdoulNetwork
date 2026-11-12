"""Vectorise le logo officiel depuis l'affiche Lessive & Repassage (2 couleurs : marine + orange).
Usage : python3 vectorize_logo.py affiche.jpg sortie_dir"""
import sys, subprocess, re, os
import numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
box = (380, 0, 700, 190)  # zone du logo sur l'affiche 1080x1080
im = np.asarray(Image.open(src).convert('RGB').crop(box)).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
lum = 0.299*r + 0.587*g + 0.114*b
navy = np.clip((215 - lum) / 110, 0, 1) * np.clip((b - r + 10) / 40, 0, 1)
orange = np.clip((r - b - 70) / 90, 0, 1) * np.clip((r - g) / 50, 0, 1)
S = 8
def trace(mask, name, color):
    m = Image.fromarray((mask*255).astype(np.uint8)).resize((mask.shape[1]*S, mask.shape[0]*S), Image.BICUBIC)
    m = m.filter(ImageFilter.GaussianBlur(S*0.8))
    bw = m.point(lambda v: 0 if v > 128 else 255).convert('1')
    p = f'{out}/{name}.pbm'; bw.save(p)
    subprocess.run(['potrace', p, '-s', '-o', f'{out}/{name}.svg', '--turdsize', '40', '--alphamax', '1.1', '--opttolerance', '0.6', '-C', color], check=True)
    return open(f'{out}/{name}.svg').read()
sv_n = trace(navy, 'navy', '#0A3470')
sv_o = trace(orange, 'orange', '#F57C10')
def body(sv):
    return re.search(r'(<g transform.*</g>)', sv, re.S).group(1)
W, H = (box[2]-box[0])*S, (box[3]-box[1])*S
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
<g id="orange">{body(sv_o)}</g>
<g id="navy">{body(sv_n)}</g>
</svg>'''
open(f'{out}/logo-trace.svg', 'w').write(svg)
print(W, H)

# --- Découpage en calques animables (même tracé, viewBox recadrés) ---
from scipy import ndimage
def mask_hi(mask):
    m = Image.fromarray((mask*255).astype(np.uint8)).resize((mask.shape[1]*S, mask.shape[0]*S), Image.BICUBIC)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(S*0.8))) > 128
nh = mask_hi(navy)
lab, n = ndimage.label(nh)
objs = ndimage.find_objects(lab)
# le combiné : composante dont le centre est en haut à droite
best = None
for i, sl in enumerate(objs):
    ys, xs = sl
    cx, cy = (xs.start+xs.stop)/2/W, (ys.start+ys.stop)/2/H
    area = (xs.stop-xs.start)*(ys.stop-ys.start)
    if cx > 0.6 and cy < 0.5 and (best is None or area > best[1]): best = (i+1, area, sl)
hs = (lab == best[0])
xx = np.arange(W)[None, :]
hs = hs & (xx > int(0.655*W))  # le combiné touche le « ô » : on coupe à droite du bol
rest = nh & ~hs
def trace_bool(b, name, color):
    p = f'{out}/{name}.pbm'
    Image.fromarray(np.where(b, 0, 255).astype(np.uint8)).convert('1').save(p)
    subprocess.run(['potrace', p, '-s', '-o', f'{out}/{name}.svg', '--turdsize', '40', '--alphamax', '1.1', '--opttolerance', '0.6', '-C', color], check=True)
    return body(open(f'{out}/{name}.svg').read())
handset = trace_bool(hs, 'handset', '#0A3470')
navy_rest = trace_bool(rest, 'navyrest', '#0A3470')
oh = mask_hi(orange)
orange_b = trace_bool(oh, 'orangeall', '#F57C10')
def write(name, inner, y0, y1, x0=0, x1=None):
    x1 = x1 or W
    open(f'{out}/{name}.svg', 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" preserveAspectRatio="xMidYMid meet">{inner}</svg>')
# bandes (en px de la grille 2560x1520)
TOP, MS, MAR, TAG = (0, 790), (790, 1010), (1010, 1170), (1170, 1520)
write('logo-full', orange_b + navy_rest + handset, 0, H)
write('logo-swoosh', orange_b, *TOP)
write('logo-allo', navy_rest + handset, *TOP)
write('logo-multiservices', navy_rest, *MS)
write('logo-maradi', orange_b, *MAR)
write('logo-tagline', navy_rest, *TAG)
ys, xs = best[2]
for f in os.listdir(out):
    if f.endswith('.pbm') or f in ('navy.svg','orange.svg','navyrest.svg','orangeall.svg','handset.svg','logo-trace.svg'): os.remove(f'{out}/{f}')
print('handset bbox', ys, xs)
