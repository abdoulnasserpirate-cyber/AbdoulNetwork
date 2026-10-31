"""Edit B — « Dynamique plein écran » (viral creator style).

Full-frame talking head with punch-in zooms per phrase, impact shakes and flashes,
big 1–2 word captions with a highlight box, keyword emoji pops, step cards in the
free wall space above the head, a count-up to 30 and a subscribe end card.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import (FPS, H, ROOT, W, Reader, Writer, build_audio, caption_img, chunk_words,  # noqa: E402
                    ease_in_out, ease_out, ease_out_back, emoji_img, load_words, n_frames, over, pill,
                    preview, prog, rotate_img, rrect, text_img, vignette, window, zoom_crop)

YEL = (255, 214, 10)
INK = (14, 14, 18)
WHITE = (255, 255, 255)
RED = (255, 48, 84)
GLASS = (10, 10, 14, 165)

words = load_words()
chunks = chunk_words([dict(w) for w in words], max_words=2, max_chars=13)
VIG = vignette(0.38, 2.0, 0.5, 0.5)

# (start, zoom, centre-y) — cut on phrase boundaries, alternating wide / tight
ZOOMS = [(0.0, 1.00, 1000), (1.86, 1.16, 1020), (3.70, 1.30, 1040), (6.00, 1.00, 1000), (8.06, 1.20, 1020),
         (9.38, 1.06, 1000), (11.96, 1.22, 1030), (13.06, 1.00, 1000), (14.48, 1.28, 1040), (17.10, 1.04, 1000),
         (19.48, 1.20, 1020), (21.60, 1.08, 1000), (24.92, 1.30, 1040), (27.18, 1.00, 1000), (28.12, 1.24, 1030),
         (30.62, 1.10, 1010), (32.56, 1.00, 1000)]
SHAKES = [5.12, 14.76, 25.80, 28.32]
FLASHES = [6.0, 17.10, 27.18]
EMOJI = {"poster,": "🤯", "maintenant.": "🔖", "TikTok": "📱", "recherche": "🔍", "domaine.": "🎯",
         "mode,": "👗", "cuisine,": "🍳", "business,": "💼", "suggestions": "💡", "exactement": "🎯",
         "Copie": "📋", "ChatGPT": "🤖", "choc": "⚡", "jours": "📅", "vraiment": "👀", "Like": "❤️",
         "abonne-toi": "🔔"}
EMOJI_EVENTS = [(w["s"], EMOJI[w["w"]]) for w in words if w["w"] in EMOJI]
PROMPT = "« Transforme ces recherches en 30 idées de vidéos courtes avec une accroche choc »"


def camera(t):
    """Current zoom / centre with a fast eased punch between levels and a slow drift."""
    idx = max(i for i, z in enumerate(ZOOMS) if z[0] <= t)
    t0, z1, c1 = ZOOMS[idx]
    z0, c0 = (ZOOMS[idx - 1][1], ZOOMS[idx - 1][2]) if idx else (z1, c1)
    k = ease_out_back(prog(t, t0, 0.16), 1.2)
    z = z0 + (z1 - z0) * k
    c = c0 + (c1 - c0) * min(1, k)
    nxt = ZOOMS[idx + 1][0] if idx + 1 < len(ZOOMS) else 35.4
    z *= 1 + 0.025 * prog(t, t0, nxt - t0)
    dx = dy = rot = 0.0
    for s in SHAKES:
        if 0 <= t - s < 0.4:
            d = np.exp(-(t - s) * 9)
            dx += 16 * d * np.sin((t - s) * 70)
            dy += 11 * d * np.cos((t - s) * 55)
            rot += 0.6 * d * np.sin((t - s) * 50)
    return z, c, dx, dy, rot


def grade(fr):
    x = fr / 255.0
    x = x + 0.10 * (x - 0.5) * (1 - np.abs(2 * x - 1))           # gentle S-curve
    lum = (x @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    x = lum + (x - lum) * 1.12
    return np.clip(x * 255 * VIG, 0, 255)


def glass_card(fr, text, emo, y, a, s=1.0, size=46, max_w=900):
    t = text_img(text, "xbold", size, WHITE)
    e = emoji_img(emo, int(size * 1.3)) if emo else None
    w = min(max_w, t.shape[1] + (e.shape[1] + 18 if e is not None else 0) + 56)
    h = max(t.shape[0], int(size * 1.6)) + 36
    over(fr, rrect(w, h, 30, GLASS, (255, 255, 255, 60), 2), W / 2, y, a, s)
    x0 = W / 2 - w * s / 2 + 28 * s
    if e is not None:
        over(fr, e, x0 + e.shape[1] * s / 2, y, a, s)
        x0 += (e.shape[1] + 18) * s
    over(fr, t, x0, y, a, s, anchor="lc")


def badge(fr, n, y, a, s):
    over(fr, pill(f"ÉTAPE {n}/3", "black", 42, YEL, INK, 28, 12), W / 2, y, a, s)


def top_graphics(fr, t):
    # hook
    a = window(t, 0.0, 3.75, 0.0, 0.25)
    if a:
        k1 = ease_out_back(prog(t, 0.0, 0.4), 2.0)
        l1 = text_img("TU NE SAIS PAS", "anton", 118, WHITE, 8, INK, (0, 8, 12, 0.5))
        over(fr, l1, W / 2, 250, a * min(1, 2 * k1), 1.4 - 0.4 * k1)
        k2 = ease_out_back(prog(t, 0.2, 0.4), 2.0)
        l2 = text_img("QUOI POSTER ?", "anton", 136, YEL, 9, INK, (0, 8, 12, 0.5))
        over(fr, l2, W / 2, 400, a * min(1, 2 * k2), 1.4 - 0.4 * k2)
    a = window(t, 3.8, 5.85, 0.2, 0.2)
    if a:
        k = ease_out_back(prog(t, 3.8, 0.35), 2.2)
        st = rotate_img(pill("ENREGISTRE CETTE VIDÉO", "black", 56, RED, WHITE, 36, 22, emoji="🔖", shadow=16), 4)
        over(fr, st, W / 2, 330, a, (1.5 - 0.5 * k) * (1 + 0.04 * np.sin(t * 12)))
    # step 1
    a = window(t, 6.05, 16.95, 0.25, 0.2)
    if a:
        badge(fr, 1, 190, a, ease_out_back(prog(t, 6.05, 0.3)))
        if t < 13.0:
            k = ease_out_back(prog(t, 6.2, 0.35))
            glass_card(fr, "Tape ton domaine sur TikTok", "🔍", 330, a * min(1, 2 * k), 0.8 + 0.2 * k)
            for j, (lab, emo, t0) in enumerate([("Mode", "👗", 9.82), ("Cuisine", "🍳", 10.6), ("Business", "💼", 11.4)]):
                kk = ease_out_back(prog(t, t0, 0.3), 2.0)
                if kk > 0:
                    over(fr, pill(lab, "black", 34, WHITE, INK, 20, 10, emoji=emo, shadow=8), 230 + j * 310, 470,
                         a * min(1, 2 * kk), 0.6 + 0.4 * kk)
        else:
            k = ease_out_back(prog(t, 13.06, 0.35))
            glass_card(fr, "Les suggestions = ce que", "💡", 330, a * min(1, 2 * k), 0.8 + 0.2 * k)
            k2 = ease_out_back(prog(t, 14.6, 0.35), 2.0)
            over(fr, pill("LES GENS CHERCHENT", "anton", 62, YEL, INK, 30, 10, radius=14, shadow=10), W / 2, 470,
                 a * min(1, 2 * k2), 1.3 - 0.3 * k2)
    # step 2
    a = window(t, 17.15, 27.05, 0.25, 0.2)
    if a:
        badge(fr, 2, 190, a, ease_out_back(prog(t, 17.15, 0.3)))
        if t < 19.45:
            k = ease_out_back(prog(t, 17.3, 0.35))
            glass_card(fr, "Copie 5 à 10 recherches", "📋", 330, a * min(1, 2 * k), 0.8 + 0.2 * k)
        elif t < 21.5:
            k = ease_out_back(prog(t, 19.5, 0.35))
            glass_card(fr, "Colle-les dans ChatGPT", "🤖", 330, a * min(1, 2 * k), 0.8 + 0.2 * k)
        else:
            k = ease_out_back(prog(t, 21.55, 0.35))
            over(fr, rrect(960, 300, 34, GLASS, (255, 214, 10, 150), 3), W / 2, 400, a * min(1, 2 * k), 0.85 + 0.15 * k)
            over(fr, text_img("TON PROMPT :", "black", 32, YEL), 90, 285, a, anchor="lc")
            n = int(len(PROMPT) * prog(t, 21.6, 5.0))
            txt = PROMPT[:n]
            lines, cur = [], ""
            for wd in txt.split(" "):
                if len(cur) + len(wd) > 30 and cur:
                    lines.append(cur)
                    cur = wd
                else:
                    cur = (cur + " " + wd).strip()
            lines.append(cur)
            for j, ln in enumerate(lines[:4]):
                over(fr, text_img(ln, "xbold", 42, WHITE), 90, 345 + j * 56, a, anchor="lc")
    # step 3
    a = window(t, 27.25, 32.4, 0.25, 0.25)
    if a:
        badge(fr, 3, 190, a, ease_out_back(prog(t, 27.25, 0.3)))
        n = int(round(30 * ease_out(prog(t, 28.2, 1.2))))
        pop = 1 + 0.18 * (1 - prog(t, 29.4, 0.3)) * (t >= 29.4)
        num = text_img(str(n), "anton", 210, YEL, 10, INK, (0, 10, 14, 0.5))
        over(fr, num, W / 2 - 150, 380, a, pop)
        over(fr, text_img("JOURS DE", "anton", 84, WHITE, 7, INK), W / 2 + 120, 330, a)
        over(fr, text_img("CONTENU", "anton", 84, WHITE, 7, INK), W / 2 + 120, 430, a)
    # end card
    a = window(t, 32.5, 35.6, 0.2, 0.0)
    if a:
        k1 = ease_out_back(prog(t, 32.56, 0.35), 2.0)
        tap = 1 - 0.12 * np.sin(np.pi * prog(t, 32.9, 0.16))
        over(fr, pill("LIKE", "black", 64, WHITE, INK, 44, 22, emoji="❤️", shadow=16), 300, 260,
             a * min(1, 2 * k1), (0.5 + 0.5 * k1) * tap)
        k2 = ease_out_back(prog(t, 33.0, 0.35), 2.0)
        sub = t >= 33.4
        tap2 = 1 - 0.12 * np.sin(np.pi * prog(t, 33.25, 0.16))
        over(fr, pill("ABONNÉ" if sub else "ABONNE-TOI", "black", 64, (70, 70, 80) if sub else RED, WHITE, 44, 22,
                      emoji="🔔", shadow=16), 720, 260, a * min(1, 2 * k2), (0.5 + 0.5 * k2) * tap2)
        k3 = ease_out(prog(t, 33.6, 0.35))
        over(fr, text_img("+ DE VIDÉOS COMME ÇA", "anton", 60, WHITE, 6, INK), W / 2, 380 + 30 * (1 - k3), k3)
        kh = ease_out_back(prog(t, 32.7, 0.4), 2.2)
        over(fr, text_img("@AbdoulNetwork", "anton", 100, YEL, 9, INK, (0, 8, 12, 0.5)), W / 2, 490,
             a * min(1, 2 * kh), 1.4 - 0.4 * kh)


def captions(fr, t):
    if t >= 32.5:
        return
    for c in chunks:
        if c[0]["s"] - 0.04 <= t < c[0]["chunk_end"]:
            act = max([i for i, w in enumerate(c) if w["s"] <= t + 0.03] or [0])
            img = caption_img(tuple(w["w"] for w in c), act, "black", 86, WHITE, YEL, 9, INK, True, YEL)
            k = ease_out_back(prog(t, c[0]["s"] - 0.04, 0.14), 2.2)
            over(fr, img, W / 2, 1500, min(1, k * 2), 0.75 + 0.25 * k)
            break
    for ts, emo in EMOJI_EVENTS:
        if ts <= t < ts + 0.75:
            k = ease_out_back(prog(t, ts, 0.3), 2.5)
            fade = 1 - prog(t, ts + 0.55, 0.2)
            e = rotate_img(emoji_img(emo, 120), 12 * np.sin((t - ts) * 8))
            over(fr, e, W / 2 + 330, 1330 - 40 * ease_out(prog(t, ts, 0.75)), fade * min(1, 2 * k), k)


def progress_bar(fr, t):
    p = t / 35.4
    fr[0:10, : int(W * p)] = np.array(YEL, np.float32)


def render(f, t):
    z, c, dx, dy, rot = camera(t)
    fr = zoom_crop(f, z, W / 2, c, dx, dy, rot)
    fr = grade(fr)
    for fl in FLASHES:
        if 0 <= t - fl < 0.22:
            k = 0.55 * (1 - (t - fl) / 0.22)
            fr = fr * (1 - k) + 255 * k
    top_graphics(fr, t)
    captions(fr, t)
    progress_bar(fr, t)
    return fr


def audio():
    ev = [(0.0, "impact", -15), (0.2, "pop_hi", -18), (3.8, "whoosh", -18), (3.9, "pop", -15)]
    ev += [(z[0] - 0.04, "whoosh", -27) for z in ZOOMS[1:] if z[0] not in FLASHES]
    ev += [(s, "impact", -17) for s in SHAKES]
    ev += [(f - 0.08, "whoosh", -17) for f in FLASHES]
    ev += [(t0, "pop", -18) for t0 in (9.82, 10.6, 11.4)]
    ev += [(ts + 0.02, "pop_hi", -24) for ts, _ in EMOJI_EVENTS]
    ev += [(21.6, "type", -28, 5.0), (14.6, "ding", -21)]
    ev += [(28.2 + 1.2 * (1 - (1 - i / 30) ** (1 / 3)), "tick", -24) for i in range(30)]
    ev += [(29.4, "shimmer", -20), (32.5, "whoosh", -18), (32.56, "pop", -14), (32.9, "pop_hi", -17),
           (33.0, "pop", -14), (33.25, "pop_hi", -17), (33.6, "shimmer", -22)]
    build_audio(ev, os.path.join(ROOT, "build", "audio_b.wav"))


def main(out):
    rd = Reader()
    wr = Writer(out, os.path.join(ROOT, "build", "audio_b.wav"))
    for i in range(n_frames()):
        wr.write(render(rd.next().astype(np.float32), i / FPS))
    wr.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        preview(render, [float(x) for x in sys.argv[1:]], os.path.join(ROOT, "snapshots", "B_preview.png"))
        sys.exit()
    audio()
    main(os.path.join(ROOT, "renders", "B_dynamique_viral_1080p.mp4"))
