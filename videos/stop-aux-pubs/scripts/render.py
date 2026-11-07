"""Abdoul Network — TikTok edit renderer (frames via OpenCV/PIL -> ffmpeg)."""
import json, math, re, subprocess, sys, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
E = json.load(open('edl.json'))
SUBS, WORDS, SEGS = E['subs'], E['words'], {s['seg']: s for s in E['segs']}
VOICE_DUR = E['dur']
TAIL = 2.6
DUR = VOICE_DUR + TAIL
NF = int(round(DUR * FPS))
PREVIEW = '--preview' in sys.argv          # render only listed timestamps as PNG
FONT = {w: f'fonts/Montserrat-{w}.ttf' for w in (700, 800, 900)}
EMOJI_FONT = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
YEL, GRN, WHT = (255, 226, 26), (57, 255, 106), (255, 255, 255)
SFXDIR = '/home/user/AbdoulNetwork/videos/chief-chief-promo/assets/sfx/'

def ease(x):  # easeInOutCubic
    x = min(1, max(0, x)); return 4*x*x*x if x < .5 else 1 - (-2*x + 2)**3 / 2
def back(x):  # pop overshoot 0->1
    x = min(1, max(0, x)); c1 = 1.9; c3 = c1 + 1; return 1 + c3*(x-1)**3 + c1*(x-1)**2

# ------------------------------------------------------------------ timeline lookup
def sub_at(t):
    if t >= VOICE_DUR - 1e-6: return None
    best = SUBS[0]
    for s in SUBS:
        if s['t0'] <= t + 1e-4: best = s
    return best

# ------------------------------------------------------------------ frame readers
class Reader:
    def __init__(self, path):
        self.path = path; self.cap = cv2.VideoCapture(path); self.i = -1; self.f = None
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
    def get(self, idx):
        idx = max(0, min(self.n - 1, idx))
        if idx < self.i:
            self.cap.release(); self.cap = cv2.VideoCapture(self.path); self.i = -1
        while self.i < idx:
            if self.i < idx - 1: self.cap.grab(); self.i += 1; continue
            ok, f = self.cap.read(); self.i += 1
            if ok: self.f = f
        return self.f
FACE, SCR = Reader('face_g.mkv'), Reader('ecran_h.mkv')

# ------------------------------------------------------------------ facecam framing
fp = np.array(json.load(open('faces.json')))
def face_center_median(a0, a1):
    m = fp[(fp[:, 0] >= a0*FPS) & (fp[:, 0] < a1*FPS)]
    if len(m) < 3: m = fp
    return float(np.median(m[:, 1])), float(np.median(m[:, 2]))
# punch plan per facecam segment: list of (local_time_from_seg_start, zoom) ; step = instant change
def word_time(seg, txt):
    for w in WORDS:
        if w['seg'] == seg and txt.lower() in w['t'].lower(): return w['s']
    return None
PUNCH = {
 'F1': [(0, 1.08, 'ramp', 1.14)],
 'F2': [(0, 1.18, None, None)],
 'F3': [(0, 1.08, None, None)],
 'F4': [(0, 1.08, None, None), ('boum', 1.22, None, None)],
 'F5': [(0, 1.16, None, None)],
 'F6': [(0, 1.08, None, None), ('bloquer', 1.18, None, None)],
 'F8': [(0, 1.10, 'ramp', 1.20)],
}
def face_zoom(seg, t):
    st = SEGS[seg]; plan = PUNCH[seg]; z = 1.08
    for item in plan:
        at, zz, mode, z2 = item
        ts = st['t0'] + at if isinstance(at, (int, float)) else (word_time(seg, at) or st['t0'])
        if t >= ts:
            z = zz
            if mode == 'ramp': z = zz + (z2 - zz) * ease((t - ts) / max(.1, st['t1'] - ts))
    return z

def render_face(t, s):
    src_t = s['a0'] + (t - s['t0'])
    img = FACE.get(int(round(src_t * FPS)))
    seg = s['seg']; st = SEGS[seg]
    a0 = min(x['a0'] for x in SUBS if x['seg'] == seg); a1 = max(x['a1'] for x in SUBS if x['seg'] == seg)
    fx, fy = face_center_median(a0, a1)
    z = face_zoom(seg, t)
    # transition: last 0.15 s of F8 -> zoom-in whoosh
    if seg == 'F8' and t > st['t1'] - 0.17: z *= 1 + 0.35 * ease((t - (st['t1'] - 0.17)) / 0.17)
    vw, vh = W / z, H / z
    cx = min(max(fx, vw/2), W - vw/2)
    cy = min(max(fy + vh*0.12, vh/2), H - vh/2)       # face sits in upper-middle third
    M = np.float32([[z, 0, W/2 - z*cx], [0, z, H/2 - z*cy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)

# ------------------------------------------------------------------ screen camera (source coords 720x1624)
SW, SH = 720, 1624
CAM = {  # per segment keyframes: (src_time, cx, cy, zoom)
 'A': [(3.9, 360, 702, 1.0), (6.45, 360, 702, 1.05), (7.15, 520, 420, 1.4), (7.95, 520, 420, 1.4), (8.35, 360, 702, 1.0)],
 'B': [(12.2, 360, 760, 1.0), (13.6, 360, 1000, 1.1), (14.55, 360, 1050, 1.1), (14.95, 330, 860, 1.3), (16.1, 330, 860, 1.32)],
 'C': [(21.6, 360, 702, 1.0), (23.2, 360, 640, 1.12), (24.1, 360, 640, 1.12), (24.45, 360, 1150, 1.06)],
 'D': [(26.3, 360, 1150, 1.06), (27.3, 360, 1080, 1.12), (28.4, 360, 1080, 1.12)],
 'E': [(31.6, 360, 1080, 1.12), (33.0, 360, 1200, 1.12), (35.5, 360, 1200, 1.12), (35.8, 360, 760, 1.1)],
 'G': [(40.6, 360, 760, 1.1), (41.6, 350, 700, 1.22), (50.2, 350, 700, 1.22)],
 'H': [(51.2, 350, 700, 1.22), (52.6, 470, 860, 1.35), (53.35, 470, 860, 1.35), (53.8, 360, 702, 1.0)],
 'I': [(55.6, 360, 702, 1.0), (57.6, 360, 640, 1.12), (61.3, 360, 640, 1.14)],
 'J': [(57.3, 360, 640, 1.14), (61.5, 360, 702, 1.02)],
 'K': [(61.0, 360, 702, 1.0), (72.0, 360, 702, 1.0)],
}
def cam(seg, st):
    k = CAM[seg]
    if st <= k[0][0]: return k[0][1:]
    for (t0, *p0), (t1, *p1) in zip(k, k[1:]):
        if st < t1:
            u = ease((st - t0) / (t1 - t0)); return [a + (b - a) * u for a, b in zip(p0, p1)]
    return k[-1][1:]
TAPS = [  # (src_time, x, y, kind)  kind: tap -> click sfx ; hl -> highlight only
 (7.62, 629, 59, 'tap'), (15.52, 331, 789, 'tap'), (24.0, 200, 573, 'tap'),
 (27.75, 615, 932, 'hl'), (35.40, 615, 1142, 'tap'), (53.28, 505, 926, 'tap'), (58.6, 610, 573, 'hl'),
]
BLURS = [  # (t0, t1, x0, y0, x1, y1, [t_move_end, y_shift])
 (6.40, 8.20, 40, 130, 700, 300, None),
 (8.10, 16.70, 500, 893, 690, 947, (14.58, 14.90, -353)),
]
def blur_src(img, st):
    img = img.copy()
    for t0, t1, x0, y0, x1, y1, mv in BLURS:
        if not (t0 <= st <= t1): continue
        if mv:
            dy = mv[2] * ease((st - mv[0]) / (mv[1] - mv[0])); y0, y1 = int(y0 + dy), int(y1 + dy)
        roi = img[y0:y1, x0:x1]
        if roi.size: img[y0:y1, x0:x1] = cv2.GaussianBlur(cv2.resize(cv2.resize(roi, (max(1, roi.shape[1]//14), max(1, roi.shape[0]//14))), (roi.shape[1], roi.shape[0])), (0, 0), 6)
    return img

def screen_view(seg, st, extra_zoom=1.0):
    img = SCR.get(int(round(st * FPS)))
    img = blur_src(img, st)
    cx, cy, z = cam(seg, st); z *= extra_zoom
    vw, vh = SW / z, (SW / z) * H / W
    miny = 0 if 6.4 <= st <= 8.2 else 62          # hide recorder timer / status bar
    cx = min(max(cx, vw/2), SW - vw/2); cy = min(max(cy, miny + vh/2), SH - vh/2)
    s = W / vw
    M = np.float32([[s, 0, W/2 - s*cx], [0, s, H/2 - s*cy]])
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    return out, M

def draw_halo(frame, M, x, y, age, kind):
    if age < -0.05 or age > 0.6: return
    px, py = M @ np.array([x, y, 1.0])
    ov = frame.copy(); a = max(0.0, age)
    r_in = int(28 + 24 * ease(a / 0.25)); r_ring = int(34 + 90 * ease(a / 0.55))
    fade = 1 - ease(a / 0.6)
    cv2.circle(ov, (int(px), int(py)), r_in, (255, 255, 255), -1, cv2.LINE_AA)
    frame[:] = cv2.addWeighted(ov, 0.38 * fade, frame, 1 - 0.38 * fade, 0)
    ov = frame.copy()
    col = (26, 226, 255) if kind == 'tap' else (106, 255, 57)
    cv2.circle(ov, (int(px), int(py)), r_ring, col, 9, cv2.LINE_AA)
    frame[:] = cv2.addWeighted(ov, 0.9 * fade, frame, 1 - 0.9 * fade, 0)

# ------------------------------------------------------------------ text rendering helpers (PIL RGBA)
_emoji_cache = {}
def emoji_img(ch, size):
    key = (ch, size)
    if key not in _emoji_cache:
        f = ImageFont.truetype(EMOJI_FONT, 109)
        im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((80, 80), ch, font=f, embedded_color=True, anchor='mm')
        im = im.crop(im.getbbox()); r = size / max(im.size)
        _emoji_cache[key] = im.resize((max(1, int(im.width*r)), max(1, int(im.height*r))), Image.LANCZOS)
    return _emoji_cache[key]

def styled_text(parts, size, stroke=10, weight=800, shadow=True, maxw=860):
    """parts: list of (text, rgb). Returns RGBA PIL image of one line."""
    while True:
        font = ImageFont.truetype(FONT[weight], size)
        sp = font.getlength(' ')
        widths = [font.getlength(t) for t, _ in parts]
        tw = sum(widths) + sp * (len(parts) - 1)
        if tw <= maxw or size < 40: break
        size -= 4
    asc, desc = font.getmetrics(); pad = stroke + 24
    im = Image.new('RGBA', (int(tw + 2*pad), asc + desc + 2*pad), (0, 0, 0, 0))
    if shadow:
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh); x = pad
        for (t, c), w in zip(parts, widths):
            d.text((x + 4, pad + 7), t, font=font, fill=(0, 0, 0, 170), stroke_width=stroke, stroke_fill=(0, 0, 0, 170)); x += w + sp
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(im); x = pad
    for (t, c), w in zip(parts, widths):
        d.text((x, pad), t, font=font, fill=c + (255,), stroke_width=stroke, stroke_fill=(0, 0, 0, 255)); x += w + sp
    return im

def paste(frame, im, cx, cy, scale=1.0, alpha=1.0):
    """Alpha-composite PIL RGBA `im` centred at (cx,cy) onto BGR numpy frame."""
    if scale <= 0.01 or alpha <= 0.01: return
    if abs(scale - 1) > 1e-3:
        im = im.resize((max(1, int(im.width*scale)), max(1, int(im.height*scale))), Image.BILINEAR)
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]; x0, y0 = int(cx - w/2), int(cy - h/2)
    fx0, fy0, fx1, fy1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if fx1 <= fx0 or fy1 <= fy0: return
    a = a[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0]
    al = a[..., 3:4] / 255 * alpha
    roi = frame[fy0:fy1, fx0:fx1].astype(np.float32)
    frame[fy0:fy1, fx0:fx1] = (roi * (1 - al) + a[..., 2::-1] * al).astype(np.uint8)

# ------------------------------------------------------------------ caption groups
def build_groups():
    groups = []; cur = []
    def flush():
        if cur: groups.append(list(cur)); cur.clear()
    for i, w in enumerate(WORDS):
        if cur and (cur[-1]['seg'] != w['seg'] or (w['s'] - cur[-1]['e'] > 0.45 and len(cur) > 1)): flush()
        cur.append(w)
        nchar = sum(len(x['t']) for x in cur)
        nxt = WORDS[i+1] if i + 1 < len(WORDS) else None
        if nxt and nxt['seg'] != w['seg']: flush(); continue
        end_punct = re.search(r"[.!?:…]$", w['t']) or (w['t'].endswith(',') and (nchar >= 7 or len(cur) > 1))
        last_of_sentence = nxt is not None and re.search(r"[.!?]$", nxt['t']) and len(nxt['t']) <= 6
        if end_punct: flush(); continue
        if last_of_sentence and len(cur) < 4 and nchar + len(nxt['t']) <= 24: continue
        if len(cur) >= 4 or (len(cur) >= 3 and nchar > 13) or nchar > 17 or \
           (nxt and nchar + len(nxt['t']) > 19): flush()
    flush()
    out = []
    for gi, g in enumerate(groups):
        s = g[0]['s'] - 0.04
        nxt_s = groups[gi+1][0]['s'] - 0.04 if gi + 1 < len(groups) else 1e9
        e = min(g[-1]['e'] + 0.35, nxt_s)
        out.append({'words': g, 's': s, 'e': e, 'seg': g[0]['seg']})
    return out
GROUPS = build_groups()
_cap_cache = {}
def caption_img(gi, active):
    key = (gi, active)
    if key not in _cap_cache:
        g = GROUPS[gi]['words']; parts = []
        for i, w in enumerate(g):
            col = GRN if w['key'] else (YEL if i == active else WHT)
            if i == active and not w['key']: col = YEL
            parts.append((w['t'].upper(), col))
        _cap_cache[key] = styled_text(parts, 84, stroke=10, weight=900)
    return _cap_cache[key]

def draw_captions(frame, t, ycen):
    for gi, g in enumerate(GROUPS):
        if not (g['s'] <= t < g['e']): continue
        ws = g['words']; act = 0
        for i, w in enumerate(ws):
            if t >= w['s'] - 0.03: act = i
        im = caption_img(gi, act)
        age = t - g['s']
        sc = 0.72 + 0.28 * back(age / 0.16)
        # active keyword bounce
        paste(frame, im, 520, ycen, sc, min(1, age / 0.06 + 0.3))
        for w in ws:
            if w.get('emo') and t >= w['s'] - 0.05:
                ea = t - (w['s'] - 0.05); em = emoji_img(w['emo'], 104)
                ex = min(905, 520 + im.width * sc / 2 + 30)
                paste(frame, em, ex, ycen - 70, 0.4 + 0.6 * back(ea / 0.22), min(1, ea / 0.08))

# ------------------------------------------------------------------ titles / cards
STEPS = {'A': ('ÉTAPE 1', 'Ouvre les Paramètres'), 'B': ('ÉTAPE 2', 'Connexion multi-appareils'),
         'C': ('ÉTAPE 3', 'DNS privé'), 'D': ('ÉTAPE 3', 'DNS privé'),
         'E': ('ÉTAPE 4', "Nom d'hôte du fournisseur"), 'G': ('ÉTAPE 5', 'Tape dns.adguard.com'),
         'H': ('ÉTAPE 6', 'Enregistrer'), 'I': ('✅', "C'EST ACTIVÉ !"), 'J': ('✅', 'ZÉRO PUB')}
_title_cache = {}
def pill(text, fg=(0, 0, 0), bg=YEL, size=50, padx=30, pady=14, radius=None):
    f = ImageFont.truetype(FONT[900], size); tw = f.getlength(text); asc, desc = f.getmetrics()
    w, h = int(tw + 2*padx), asc + desc + 2*pady - 8
    im = Image.new('RGBA', (w + 30, h + 30), (0, 0, 0, 0))
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((15, 21, 15 + w, 21 + h), radius or h//2, fill=(0, 0, 0, 120))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(6)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((15, 15, 15 + w, 15 + h), radius or h//2, fill=bg + (255,))
    d.text((15 + w/2, 15 + h/2), text, font=f, fill=fg + (255,), anchor='mm')
    return im
def step_title(seg):
    if seg not in _title_cache:
        tag, txt = STEPS[seg]
        if tag == '✅':
            a = emoji_img('✅', 76); b = styled_text([(txt, GRN)], 72, stroke=0, weight=900, shadow=False)
            inner = Image.new('RGBA', (a.width + b.width + 6, max(a.height, b.height)), (0, 0, 0, 0))
            inner.alpha_composite(a, (12, (inner.height - a.height)//2)); inner.alpha_composite(b, (a.width + 6, (inner.height - b.height)//2))
        else:
            p = pill(tag, size=44); b = styled_text([(txt, WHT)], 56, stroke=0, weight=800, shadow=False, maxw=880)
            inner = Image.new('RGBA', (max(p.width, b.width), p.height + b.height - 40), (0, 0, 0, 0))
            inner.alpha_composite(p, ((inner.width - p.width)//2, 0)); inner.alpha_composite(b, ((inner.width - b.width)//2, p.height - 40))
        w, h = inner.width + 40, inner.height + 10
        card = Image.new('RGBA', (w + 30, h + 30), (0, 0, 0, 0))
        sh = Image.new('RGBA', card.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((15, 20, 15 + w, 20 + h), 44, fill=(0, 0, 0, 110))
        card = Image.alpha_composite(card, sh.filter(ImageFilter.GaussianBlur(8)))
        ImageDraw.Draw(card).rounded_rectangle((15, 15, 15 + w, 15 + h), 44, fill=(16, 16, 20, 215))
        card.alpha_composite(inner, (35, 20))
        _title_cache[seg] = card
    return _title_cache[seg]
def first_seg_with_title(seg):  # C and D share a title: animate only on C
    return {'D': 'C'}.get(seg, seg)

def draw_step(frame, t, seg):
    if seg not in STEPS: return
    st = SEGS[first_seg_with_title(seg)]; age = t - st['t0']
    paste(frame, step_title(seg), 520, 380, 0.55 + 0.45 * back(age / 0.22), min(1, age / 0.08))

_card = {}
def dns_card():
    if 'dns' not in _card:
        f = ImageFont.truetype(FONT[900], 70); t = 'dns.adguard.com'; tw = f.getlength(t)
        w, h = int(tw + 80), 130
        im = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0))
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((20, 28, 20 + w, 28 + h), 34, fill=(0, 0, 0, 140))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(8)))
        d = ImageDraw.Draw(im); d.rounded_rectangle((20, 20, 20 + w, 20 + h), 34, fill=(255, 255, 255, 255), outline=GRN + (255,), width=7)
        d.text((20 + w/2, 20 + h/2 + 2), t, font=f, fill=(15, 15, 15, 255), anchor='mm')
        _card['dns'] = im
    return _card['dns']

def hook_title():
    if 'hook' not in _card:
        a = styled_text([('STOP AUX PUBS', (255, 255, 255))], 92, stroke=11, weight=900, maxw=840)
        e = emoji_img('🚫', 96)
        im = Image.new('RGBA', (a.width + e.width + 10, max(a.height, e.height)), (0, 0, 0, 0))
        im.alpha_composite(a, (0, (im.height - a.height)//2)); im.alpha_composite(e, (a.width - 6, (im.height - e.height)//2 - 4))
        _card['hook'] = im
    return _card['hook']

def cta_card(subscribed):
    key = ('cta', subscribed)
    if key not in _card:
        w, h = 900, 470
        im = Image.new('RGBA', (w + 60, h + 60), (0, 0, 0, 0))
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((30, 42, 30 + w, 42 + h), 56, fill=(0, 0, 0, 160))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(14)))
        d = ImageDraw.Draw(im); d.rounded_rectangle((30, 30, 30 + w, 30 + h), 56, fill=(18, 18, 22, 240), outline=(255, 255, 255, 60), width=3)
        # monogram avatar
        d.ellipse((80, 70, 220, 210), fill=YEL + (255,))
        d.text((150, 142), 'AN', font=ImageFont.truetype(FONT[900], 64), fill=(0, 0, 0, 255), anchor='mm')
        d.text((250, 105), '@abdoulnetwork', font=ImageFont.truetype(FONT[900], 58), fill=(255, 255, 255, 255), anchor='lm')
        d.text((250, 170), 'Abdoul Network', font=ImageFont.truetype(FONT[700], 40), fill=(200, 200, 205, 255), anchor='lm')
        line = styled_text([('Abonne-toi pour plus', WHT)], 54, stroke=0, weight=800, shadow=False)
        im.alpha_composite(line, (30 + (w - line.width)//2, 228))
        l2 = styled_text([("d'astuces", YEL)], 54, stroke=0, weight=800, shadow=False)
        e = emoji_img('👉', 60)
        x2 = 30 + (w - l2.width - e.width - 10)//2
        im.alpha_composite(l2, (x2, 290)); im.alpha_composite(e, (x2 + l2.width - 30 + 36, 290 + (l2.height - e.height)//2))
        bx0, by0, bx1, by1 = 230, 395, 730, 475
        if subscribed:
            d.rounded_rectangle((bx0, by0, bx1, by1), 40, fill=(60, 60, 66, 255))
            d.text(((bx0 + bx1)/2, (by0 + by1)/2), 'Abonné  ✓'.replace('✓', ''), font=ImageFont.truetype(FONT[900], 46), fill=(255, 255, 255, 255), anchor='mm')
            ck = emoji_img('✅', 44); im.alpha_composite(ck, (int((bx0 + bx1)/2 + 120), int((by0 + by1)/2 - ck.height/2)))
        else:
            d.rounded_rectangle((bx0, by0, bx1, by1), 40, fill=(254, 44, 85, 255))
            d.text(((bx0 + bx1)/2, (by0 + by1)/2), "S'ABONNER", font=ImageFont.truetype(FONT[900], 46), fill=(255, 255, 255, 255), anchor='mm')
        _card[key] = im
    return _card[key]

# ------------------------------------------------------------------ CTA background (frozen result page, blurred)
_bg = {}
def cta_bg():
    if 'bg' not in _bg:
        img = SCR.get(int(58.0 * FPS)).copy()
        v, M = None, None
        s = W / SW; M = np.float32([[s, 0, W/2 - s*360], [0, s, H/2 - s*702]])
        out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
        out = cv2.GaussianBlur(out, (0, 0), 22)
        _bg['bg'] = (out.astype(np.float32) * 0.45).astype(np.uint8)
    return _bg['bg']

# ------------------------------------------------------------------ events (sfx)
EVENTS = []   # (time, name, gain_db)
def plan_events():
    EVENTS.append((0.0, 'pop', -17))                                   # hook title
    EVENTS.append((SEGS['A']['t0'] - 0.12, 'whoosh', -15))             # face -> screen
    for seg in ['A', 'B', 'C', 'E', 'G', 'H', 'I']:
        EVENTS.append((SEGS[seg]['t0'] + 0.02, 'pop', -19))
    EVENTS.append((SEGS['J']['t0'] + 0.05, 'ding', -24))
    for s in SUBS:                                                      # taps / highlights
        if s['src'] != 'ecran': continue
        for (tt, x, y, kind) in TAPS:
            st0 = s['a0'] + s['voff']; st1 = s['a1'] + s['voff']
            if st0 <= tt < st1 and s['seg'] in CAM:
                ot = s['t0'] + (tt - st0)
                EVENTS.append((ot, 'tick' if kind == 'tap' else 'pop', -14 if kind == 'tap' else -22))
    # camera whooshes on big zoom moves (A gear zoom, A zoom out, I zoom-in)
    for seg, stt in [('A', 6.55), ('A', 7.95), ('I', 55.9)]:
        s = next(x for x in SUBS if x['seg'] == seg)
        EVENTS.append((s['t0'] + (stt - (s['a0'] + s['voff'])), 'whoosh', -25))
    for w in WORDS:                                                     # punch-in whooshes on facecam
        if w['seg'] == 'F4' and 'boum' in w['t'].lower(): EVENTS.append((w['s'] - 0.03, 'whoosh', -26))
    cta_t = next(w['s'] for w in WORDS if w['seg'] == 'K' and 'abonner' in w['t'])
    EVENTS.append((cta_t - 0.35, 'whoosh', -20)); EVENTS.append((cta_t - 0.15, 'pop', -16))
    EVENTS.append((VOICE_DUR + 0.75, 'tick', -12)); EVENTS.append((VOICE_DUR + 0.8, 'pop', -16))
    return cta_t
CTA_T = plan_events()
SUBSCRIBE_T = VOICE_DUR + 0.75

# ------------------------------------------------------------------ frame compositor
def render_frame(n):
    t = n / FPS
    s = sub_at(t)
    if s is None:                       # tail: CTA hold
        seg = 'K'; frame = cta_bg().copy()
    else:
        seg = s['seg']
        if s['src'] == 'face':
            frame = render_face(t, s)
        elif SEGS[seg].get('cta'):
            frame = cta_bg().copy()
        else:
            st = s['a0'] + s['voff'] + (t - s['t0'])
            ez = 1.0
            if seg == 'A' and t - SEGS['A']['t0'] < 0.22:      # transition: screen lands from 1.18x
                ez = 1 + 0.18 * (1 - ease((t - SEGS['A']['t0']) / 0.22))
            frame, M = screen_view(seg, st, ez)
            for (tt, x, y, kind) in TAPS:
                draw_halo(frame, M, x, y, st - tt, kind)
            if seg == 'A' and t - SEGS['A']['t0'] < 0.12:      # flash blend
                a = 1 - (t - SEGS['A']['t0']) / 0.12
                frame = cv2.addWeighted(frame, 1 - 0.5*a, np.full_like(frame, 255), 0.5*a, 0)
    # overlays
    if seg in ('F1',) or (s and s['seg'] == 'F1'):
        age = t
        paste(frame, hook_title(), 520, 340, 0.5 + 0.5 * back(age / 0.25), min(1, age / 0.06))
    if s is not None and s['src'] == 'ecran':
        draw_step(frame, t, seg)
        g0 = next(w['s'] for w in WORDS if w['seg'] == 'G' and 'dns.adguard' in w['t'])
        if g0 - 0.1 <= t < SEGS['H']['t1'] or seg in ('I',) and t > next(w['s'] for w in WORDS if w['seg'] == 'I' and 'dns.adguard' in w['t']) - 0.1:
            t_in = g0 - 0.1 if seg in ('G', 'H') else next(w['s'] for w in WORDS if w['seg'] == 'I' and 'dns.adguard' in w['t']) - 0.1
            age = t - t_in
            paste(frame, dns_card(), 520, 560, 0.6 + 0.4 * back(age / 0.22), min(1, age / 0.08))
    ycap = 1310 if (s is not None and s['src'] == 'face') else 1420
    if seg == 'K' or s is None: ycap = 1450
    draw_captions(frame, t, ycap)
    if t >= CTA_T - 0.15:
        age = t - (CTA_T - 0.15)
        sub = t >= SUBSCRIBE_T
        card = cta_card(sub)
        sc = 0.55 + 0.45 * back(age / 0.3)
        if sub: sc *= 1 + 0.06 * math.sin(min(1, (t - SUBSCRIBE_T) / 0.25) * math.pi)
        else: sc *= 1 + 0.015 * math.sin(age * 6)
        yy = 800 + 120 * (1 - ease(age / 0.3))
        paste(frame, card, 520, yy, sc, min(1, age / 0.1))
    if s is None:   # fade last 0.25 s
        rem = DUR - t
        if rem < 0.25: frame = (frame.astype(np.float32) * (rem / 0.25)).astype(np.uint8)
    return frame

if __name__ == '__main__':
    if PREVIEW:
        os.makedirs('prev', exist_ok=True)
        ts = [float(x) for x in sys.argv[sys.argv.index('--preview') + 1:]]
        for tt in sorted(ts):
            cv2.imwrite(f'prev/p_{tt:06.2f}.jpg', render_frame(int(round(tt * FPS))), [cv2.IMWRITE_JPEG_QUALITY, 88])
        print('ok'); sys.exit()
    json.dump({'events': EVENTS, 'dur': DUR, 'groups': [{'s': g['s'], 'e': g['e'], 'text': ' '.join(w['t'] for w in g['words'])} for g in GROUPS]},
              open('plan.json', 'w'), ensure_ascii=False, indent=1)
    if '--plan' in sys.argv: print('plan written', DUR); sys.exit()
    out = sys.argv[1]
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', 'mix_final.wav', '-map', '0:v', '-map', '1:a',
                          '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
                          '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out], stdin=subprocess.PIPE)
    for n in range(NF):
        p.stdin.write(render_frame(n).tobytes())
        if n % 150 == 0: print(f'frame {n}/{NF}', flush=True)
    p.stdin.close(); p.wait(); print('done', out)
