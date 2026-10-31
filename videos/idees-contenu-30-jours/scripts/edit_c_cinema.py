"""Edit C — « Cinéma épuré » (premium, minimal).

Warm filmic grade with a matte black level, a slow continuous push-in, film grain,
light leaks on chapter changes, serif chapter titles in the wall space above the
head, clean sentence subtitles and a quiet end card with fade to black.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import (FPS, H, ROOT, W, Reader, Writer, build_audio, chunk_words, ease_in_out, ease_out,  # noqa: E402
                    font, load_words, n_frames, over, preview, prog, rrect, text_img, vignette, window,
                    zoom_crop)

CREAM = (246, 237, 222)
GOLD = (228, 186, 112)
DIM = (200, 192, 178)

words = load_words()
subs = chunk_words([dict(w) for w in words], max_words=7, max_chars=34)
VIG = vignette(0.55, 2.0, 0.5, 0.48)
rng = np.random.default_rng(3)
GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
SHADE = 1 - 0.45 * np.clip(1 - yy / 0.28, 0, 1) ** 2 - 0.5 * np.clip((yy - 0.72) / 0.28, 0, 1) ** 2

CHAPTERS = [(6.0, 17.05, 3.4, "01", "Cherche ton domaine", "Cherche"),
            (17.1, 27.12, 3.4, "02", "Demande à l'IA", "Demande"),
            (27.18, 32.4, 0.9, "03", "Publie chaque jour", "Publie")]
LEAKS = [0.0, 6.0, 17.1, 27.18]
PROMPT_WORDS = [w for w in words if 21.55 <= w["s"] < 27.2]


def grade(f):
    x = f / 255.0
    x = 0.035 + x * 0.93                                   # matte blacks, soft whites
    x = x + 0.08 * (x - 0.5) * (1 - np.abs(2 * x - 1))     # gentle S
    lum = (x @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    x = lum + (x - lum) * 0.95
    sh = np.clip(1 - lum * 2, 0, 1)
    hi = np.clip(lum * 2 - 1, 0, 1)
    x = x + sh * np.array([-0.008, 0.004, 0.012], np.float32) + hi * np.array([0.05, 0.02, -0.04], np.float32)
    x = x * np.array([1.05, 1.0, 0.9], np.float32)           # warm white balance
    return x * 255


def grain(fr, i):
    g = GRAIN[i % len(GRAIN)]
    g = np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
    lum = fr.mean(2, keepdims=True) / 255
    fr += g * 5.0 * (0.4 + 0.6 * (1 - np.abs(2 * lum - 1)))


def light_leak(fr, t):
    for t0 in LEAKS:
        p = prog(t, t0 - 0.15, 1.1)
        if 0 < p < 1:
            a = np.sin(np.pi * p) * 0.3
            cx = -200 + 1500 * ease_in_out(p)
            xs = np.arange(W, dtype=np.float32)[None, :]
            ys = np.arange(H, dtype=np.float32)[:, None]
            m = np.exp(-(((xs - cx) / 520) ** 2 + ((ys - 700) / 1100) ** 2))[..., None] * a
            col = np.array([255, 150, 70], np.float32)
            fr[:] = 255 - (255 - fr) * (1 - m * col / 255)    # screen blend


def serif_block(fr, t, lines, y, t0, t1, gap=10):
    """Stack of (text, fontname, size, colour, tracking) lines with a soft rise-in."""
    a = window(t, t0, t1, 0.6, 0.5)
    if not a:
        return
    cy = y
    for j, (txt, fn, sz, col, tr) in enumerate(lines):
        if j:
            cy += (lines[j - 1][2] + sz) / 2 * 1.15 + gap
        k = ease_out(prog(t, t0 + j * 0.18, 0.8))
        img = text_img(txt, fn, sz, col, 0, (0, 0, 0), (0, 4, 10, 0.55), tr)
        over(fr, img, W / 2, cy + 24 * (1 - k), a * k)


def hairline(fr, cx, y, w, a):
    if w > 2 and a > 0:
        over(fr, rrect(int(w), 2, 1, GOLD), cx, y, a)


def titles(fr, t):
    serif_block(fr, t, [("CRÉATEURS DE CONTENU", "inter", 30, GOLD, 9),
                        ("Tu ne sais jamais", "serif_i", 76, CREAM, 0),
                        ("quoi poster ?", "serif_b", 104, CREAM, 0)], 250, 0.1, 3.75)
    a = window(t, 3.85, 5.8, 0.5, 0.4)
    if a:
        serif_block(fr, t, [("Enregistre cette vidéo.", "serif_i", 72, CREAM, 0)], 380, 3.85, 5.8)
        hairline(fr, W / 2, 470, 520 * ease_in_out(prog(t, 4.1, 1.0)), a)
    for t0, t1, dur, num, title, short in CHAPTERS:
        serif_block(fr, t, [(num, "serif", 150, GOLD, 0), ("É T A P E", "inter", 28, DIM, 6),
                            (title, "serif_i", 70, CREAM, 0)], 210, t0 + 0.1, t0 + dur)
        a = window(t, t0 + dur + 0.1, t1, 0.6, 0.4)
        if a:
            tag = text_img(f"{num}  —  {short.upper()}", "inter_l", 26, GOLD, 0, (0, 0, 0), (0, 2, 6, 0.5), 6)
            over(fr, tag, W / 2, 170, a)
            hairline(fr, W / 2, 205, 90, a)
    # insight lines in the wall space
    serif_block(fr, t, [("Les suggestions,", "serif_i", 64, CREAM, 0),
                        ("c'est ce que les gens", "serif_i", 64, CREAM, 0),
                        ("recherchent.", "serif_b", 78, GOLD, 0)], 290, 13.1, 17.0)
    if 21.5 <= t < 27.15:
        a = window(t, 21.5, 27.15, 0.5, 0.4)
        over(fr, text_img("“", "serif_b", 160, GOLD), 120, 300, a)
        shown = [w["w"] for w in PROMPT_WORDS if w["s"] <= t + 0.05]
        f = font("serif_i", 52)
        lines, cur = [], ""
        for wd in shown:
            trial = (cur + " " + wd).strip()
            if f.getlength(trial) > 820 and cur:
                lines.append(cur)
                cur = wd
            else:
                cur = trial
        if cur:
            lines.append(cur)
        for j, ln in enumerate(lines[-4:]):
            over(fr, text_img(ln, "serif_i", 52, CREAM, 0, (0, 0, 0), (0, 4, 10, 0.55)), 130, 330 + j * 66, a,
                 anchor="lc")
    if 28.2 <= t < 32.45:
        a = window(t, 28.2, 32.45, 0.5, 0.45)
        k = ease_out(prog(t, 28.2, 1.0))
        over(fr, text_img("30", "serif", 260, GOLD, 0, (0, 0, 0), (0, 6, 14, 0.5)), W / 2, 330 + 30 * (1 - k), a * k)
        serif_block(fr, t, [("jours de contenu, prêts à poster.", "serif_i", 56, CREAM, 0)], 520, 28.8, 32.45)
    # end card
    a = window(t, 32.5, 36, 0.6, 0)
    if a:
        serif_block(fr, t, [("LIKE   ·   ABONNE-TOI", "inter_l", 40, CREAM, 8)], 230, 32.55, 36)
        hairline(fr, W / 2, 190, 380 * ease_in_out(prog(t, 32.7, 0.8)), a)
        hairline(fr, W / 2, 270, 380 * ease_in_out(prog(t, 32.7, 0.8)), a)
        serif_block(fr, t, [("pour plus de vidéos comme celle-ci", "serif_i", 50, GOLD, 0)], 330, 33.4, 36)
        serif_block(fr, t, [("@AbdoulNetwork", "serif_b", 66, CREAM, 0)], 425, 32.9, 36)


def subtitles(fr, t):
    if t >= 32.5:
        return
    for c in subs:
        if c[0]["s"] - 0.05 <= t < c[0]["chunk_end"]:
            a = min(prog(t, c[0]["s"] - 0.05, 0.15), 1 - prog(t, c[0]["chunk_end"] - 0.12, 0.12))
            txt = " ".join(w["w"] for w in c)
            img = text_img(txt, "inter", 46, CREAM, 0, (0, 0, 0), (0, 3, 6, 0.85))
            over(fr, img, W / 2, 1560, a)
            return


def render(f, t, i=None):
    i = int(round(t * FPS)) if i is None else i
    z = 1.0 + 0.12 * ease_in_out(prog(t, 0, 35.4))
    dx = 3 * np.sin(t * 0.7)
    dy = 2.5 * np.sin(t * 0.53 + 1)
    fr = zoom_crop(f, z, 500, 1000, dx, dy)
    fr = grade(fr) * VIG * SHADE
    light_leak(fr, t)
    titles(fr, t)
    subtitles(fr, t)
    grain(fr, i)
    fade = min(prog(t, 0, 0.25), 1 - prog(t, 34.95, 0.45))
    return fr * fade


def audio():
    ev = [(0.0, "impact", -20), (0.05, "shimmer", -27), (3.85, "whoosh", -27), (5.2, "riser", -28)]
    ev += [(c[0] - 0.1, "whoosh", -24) for c in CHAPTERS]
    ev += [(13.1, "shimmer", -28), (28.2, "shimmer", -23), (32.5, "whoosh_down", -26), (32.6, "ding", -27)]
    build_audio(ev, os.path.join(ROOT, "build", "audio_c.wav"))


def main(out):
    rd = Reader()
    # grain is costly to encode: cap the bitrate so the file stays social-media sized
    wr = Writer(out, os.path.join(ROOT, "build", "audio_c.wav"), 19,
                ("-tune", "grain", "-maxrate", "11M", "-bufsize", "22M"))
    for i in range(n_frames()):
        wr.write(render(rd.next().astype(np.float32), i / FPS, i))
    wr.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        preview(render, [float(x) for x in sys.argv[1:]], os.path.join(ROOT, "snapshots", "C_preview.png"))
        sys.exit()
    audio()
    main(os.path.join(ROOT, "renders", "C_cinema_epure_1080p.mp4"))
