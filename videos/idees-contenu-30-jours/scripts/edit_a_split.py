"""Edit A — « Split-screen tuto ».

Hook full screen → screen splits (speaker top, animated demo bottom) for the
three steps: search suggestions, AI prompt, 30-day calendar → full screen end card.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(__file__))
from common import (FPS, H, ROOT, W, Reader, Writer, build_audio, caption_img, chunk_words,  # noqa: E402
                    ease_in_out, ease_out, ease_out_back, emoji_img, load_words, n_frames, over, pill,
                    preview, prog, rrect, text_img, window, zoom_crop)

NAVY = (10, 15, 31)
CARD = (22, 31, 56)
CARD2 = (34, 45, 78)
ORANGE = (255, 138, 31)
BLUE = (61, 139, 255)
WHITE = (255, 255, 255)
GREY = (150, 162, 190)
GREEN = (46, 204, 113)

T_SPLIT, T_SPLIT_D = 5.62, 0.5
T_END, T_END_D = 32.38, 0.5
T_P2, T_P3 = 19.45, 27.18          # panel slide times
SLIDE = 0.45

words = load_words()
chunks = chunk_words([dict(w) for w in words], max_words=3, max_chars=18)


# ------------------------------------------------------------- static art
def panel_bg():
    h = H // 2
    y = np.linspace(0, 1, h)[:, None, None]
    top, bot = np.array(NAVY, np.float32), np.array((17, 26, 52), np.float32)
    bg = top * (1 - y) + bot * y
    bg = np.repeat(bg, W, 1)
    yy, xx = np.mgrid[0:h, 0:W].astype(np.float32)
    glow = np.exp(-(((xx - 540) / 520) ** 2 + ((yy - 420) / 380) ** 2))[..., None]
    bg = bg + glow * np.array((30, 45, 95), np.float32) * 0.6
    img = Image.new("L", (W, h), 0)
    d = ImageDraw.Draw(img)
    for gx in range(30, W, 44):
        for gy in range(30, h, 44):
            d.ellipse([gx - 1.5, gy - 1.5, gx + 1.5, gy + 1.5], fill=40)
    bg += np.asarray(img, np.float32)[..., None] * 0.35
    return bg


def seam_line():
    x = np.linspace(0, 1, W)[:, None]
    col = np.array(ORANGE, np.float32) * (1 - x) + np.array(BLUE, np.float32) * x
    line = np.zeros((6, W, 4), np.float32)
    line[..., :3] = col[None]
    line[..., 3] = 255
    return line


PBG = panel_bg()
SEAM = seam_line()

SEARCHES = ["cuisine facile et rapide", "cuisine africaine recette", "cuisine pas chère étudiant",
            "cuisine healthy pour maigrir", "cuisine en 5 minutes"]
CHIPS = [("Mode", "👗", 9.82), ("Cuisine", "🍳", 10.60), ("Business", "💼", 11.40), ("Tout", "✨", 12.0)]
PROMPT_WORDS = [w for w in words if 21.55 <= w["s"] < 27.2]


def step_header(fr, n, title, x, y, a):
    p = pill(f"ÉTAPE {n}", "black", 30, ORANGE, NAVY, 22, 10)
    over(fr, p, x, y, a, anchor="tl")
    t = text_img(title, "xbold", 40, WHITE)
    over(fr, t, x + p.shape[1] + 14, y + p.shape[0] / 2, a, anchor="lc")


def typed(text, t, t0, t1):
    n = int(round(len(text) * prog(t, t0, t1 - t0)))
    return text[:n]


def cursor_on(t):
    return (t * 2.2) % 1 < 0.55


# ------------------------------------------------------------- panel 1: search
def panel_search(fr, t, top, ox):
    cx = 90 + ox
    a = 1.0
    step_header(fr, 1, "Cherche ton domaine", cx, top + 70, a)
    card_y = top + 150
    over(fr, rrect(900, 600, 40, CARD, None, 0, 18), cx - 36, card_y - 36, a, anchor="tl")
    over(fr, text_img("TikTok  ·  Rechercher", "inter_sb", 26, GREY), cx + 32, card_y + 38, a, anchor="lc")
    # search bar
    by = card_y + 70
    over(fr, rrect(836, 92, 46, CARD2, (70, 85, 130), 2), cx + 32, by, a, anchor="tl")
    over(fr, emoji_img("🔍", 40), cx + 84, by + 46, a)
    if t < 11.9:
        txt = typed("ton domaine…", t, 7.4, 8.9)
        col = WHITE if txt else GREY
        if not txt:
            txt = "Rechercher"
    else:
        txt = typed("cuisine", t, 11.95, 12.6)
        col = WHITE
    if txt:
        ti = text_img(txt, "inter_sb", 38, col)
        over(fr, ti, cx + 116, by + 46, a, anchor="lc")
        tw = ti.shape[1] - 12
    else:
        tw = 0
    if 6.6 < t < 13.1 and cursor_on(t):
        over(fr, rrect(4, 44, 2, ORANGE), cx + 122 + tw, by + 46, a)
    # chips
    chx = cx + 32
    for name, emo, t0 in CHIPS:
        on = name == "Cuisine" and t >= 11.9
        p = pill(name, "inter_sb", 28, ORANGE if on else CARD2, NAVY if on else WHITE, 20, 10, emoji=emo)
        k = ease_out_back(prog(t, t0, 0.35))
        if k > 0:
            over(fr, p, chx + p.shape[1] / 2, by + 150, min(1, k * 2), 0.6 + 0.4 * k)
        chx += p.shape[1] + 14
    # suggestions dropdown
    ly = by + 205
    for i, s in enumerate(SEARCHES):
        t0 = 13.2 + i * 0.24
        k = ease_out(prog(t, t0, 0.3))
        if k <= 0:
            continue
        y = ly + i * 64
        hl = window(t, 14.76 + i * 0.08, 16.9, 0.25, 0.3)
        if hl:
            over(fr, rrect(836, 56, 16, (255, 138, 31, int(40 + 30 * hl))), cx + 32, y - 28, hl * k, anchor="tl")
        checked = t >= 17.45 + i * 0.22
        if checked:
            ck = ease_out_back(prog(t, 17.45 + i * 0.22, 0.25))
            over(fr, rrect(34, 34, 9, GREEN), cx + 70, y, k, ck)
            over(fr, text_img("✓", "inter_b", 26, WHITE), cx + 70, y, k, ck)
        else:
            over(fr, emoji_img("🔍", 26), cx + 70, y, k * 0.8)
        over(fr, text_img(s, "inter_sb", 32, WHITE), cx + 104 + (1 - k) * 40, y, k, anchor="lc")
        over(fr, text_img("↗", "inter_b", 30, GREY), cx + 836, y, k * 0.8)
    # badge
    kb = ease_out_back(prog(t, 15.0, 0.4))
    if kb > 0 and t < 17.3:
        b = pill("Ce que les gens recherchent", "black", 28, ORANGE, NAVY, 22, 12, emoji="🔥", shadow=10)
        over(fr, b, cx + 450, card_y + 600, min(1, kb * 2) * (1 - prog(t, 17.0, 0.3)), 0.7 + 0.3 * kb)
    kc = ease_out_back(prog(t, 18.85, 0.35))
    if kc > 0:
        b = pill("5 recherches copiées", "black", 28, GREEN, NAVY, 22, 12, emoji="📋", shadow=10)
        over(fr, b, cx + 450, card_y + 600, min(1, kc * 2), 0.7 + 0.3 * kc)


# ------------------------------------------------------------- panel 2: AI chat
def wrap_words(ws, fname, size, max_w):
    f_lines, cur = [], []
    from common import font
    f = font(fname, size)
    for w in ws:
        trial = " ".join(cur + [w])
        if cur and f.getlength(trial) > max_w:
            f_lines.append(cur)
            cur = [w]
        else:
            cur.append(w)
    if cur:
        f_lines.append(cur)
    return f_lines


PROMPT_LINES = wrap_words([w["w"] for w in PROMPT_WORDS], "inter_sb", 32, 600)


def panel_chat(fr, t, top, ox):
    cx = 90 + ox
    step_header(fr, 2, "Demande à l'IA", cx, top + 70, 1)
    card_y = top + 150
    over(fr, rrect(900, 600, 40, CARD, None, 0, 18), cx - 36, card_y - 36, 1, anchor="tl")
    over(fr, rrect(16, 16, 8, (16, 163, 127)), cx + 40, card_y + 38, 1)
    over(fr, text_img("ChatGPT", "inter_b", 30, WHITE), cx + 58, card_y + 38, 1, anchor="lc")
    over(fr, text_img("Nouvelle discussion", "inter", 24, GREY), cx + 836, card_y + 38, 1, anchor="c")
    # pasted searches bubble (right)
    k = ease_out_back(prog(t, 19.95, 0.4))
    if k > 0:
        lines = ["cuisine facile et rapide", "cuisine africaine recette", "cuisine pas chère étudiant", "+ 2 autres…"]
        bw, bh = 560, 40 + 42 * len(lines)
        bx, byy = cx + 868 - bw, card_y + 80
        over(fr, rrect(bw, bh, 28, (48, 62, 104)), bx + bw / 2, byy + bh / 2, min(1, 2 * k), 0.8 + 0.2 * k)
        if k > 0.6:
            for i, l in enumerate(lines):
                over(fr, text_img(l, "inter", 28, (215, 222, 240) if i < 3 else GREY), bx + 28, byy + 40 + i * 42,
                     1, anchor="lc")
    # spoken prompt bubble, revealed word-by-word with his voice
    shown = sum(1 for w in PROMPT_WORDS if w["s"] <= t + 0.05)
    if shown:
        bw = 660
        n_lines, cnt = [], 0
        for ln in PROMPT_LINES:
            take = min(len(ln), max(0, shown - cnt))
            cnt += len(ln)
            if take:
                n_lines.append(" ".join(ln[:take]))
        bh = 36 + 44 * len(n_lines)
        bx, byy = cx + 868 - bw, card_y + 80 + 228
        k2 = ease_out_back(prog(t, PROMPT_WORDS[0]["s"], 0.3))
        over(fr, rrect(bw, bh, 28, ORANGE), bx + bw / 2, byy + bh / 2, 1, 0.85 + 0.15 * k2)
        for i, l in enumerate(n_lines):
            over(fr, text_img(l, "inter_sb", 32, NAVY), bx + 26, byy + 38 + i * 44, 1, anchor="lc")
    # AI typing dots
    if t > 26.65:
        k3 = ease_out_back(prog(t, 26.65, 0.3))
        over(fr, rrect(130, 64, 32, (48, 62, 104)), cx + 100, card_y + 545, k3, k3)
        for i in range(3):
            ph = (t * 3 - i * 0.25) % 1
            over(fr, rrect(14, 14, 7, WHITE), cx + 64 + i * 36, card_y + 545 - 6 * np.sin(ph * np.pi) ** 2, k3)


# ------------------------------------------------------------- panel 3: calendar
def panel_cal(fr, t, top, ox):
    cx = 90 + ox
    step_header(fr, 3, "Poste chaque jour", cx, top + 70, 1)
    card_y = top + 150
    over(fr, rrect(900, 600, 40, CARD, None, 0, 18), cx - 36, card_y - 36, 1, anchor="tl")
    filled = int(np.clip((t - 28.3) / 2.6 * 30, 0, 30))
    over(fr, text_img("Ton mois de contenu", "inter_b", 32, WHITE), cx + 32, card_y + 30, 1, anchor="lc")
    cnt = text_img(f"{filled}/30", "black", 44, ORANGE if filled == 30 else WHITE)
    over(fr, cnt, cx + 860 - cnt.shape[1] / 2, card_y + 30, 1)
    cw, ch, g = 126, 84, 12
    for i in range(30):
        r, c = divmod(i, 6)
        x = cx + 32 + c * (cw + g) + cw / 2
        y = card_y + 80 + r * (ch + g) + ch / 2
        on = i < filled
        k = ease_out_back(prog(t, 28.3 + i * 2.6 / 30, 0.25)) if on else 0
        over(fr, rrect(cw, ch, 16, CARD2), x, y, 1)
        if on:
            over(fr, rrect(cw, ch, 16, ORANGE), x, y, min(1, k * 1.5), 0.6 + 0.4 * k)
            over(fr, text_img("✓", "inter_b", 34, NAVY), x + 30, y - 12, min(1, k * 1.5))
        over(fr, text_img(str(i + 1), "inter_sb", 26, NAVY if on else GREY), x - 36, y + 18, 1, anchor="c")
    ks = ease_out_back(prog(t, 31.2, 0.35), 2.2)
    if ks > 0:
        st = pill("PRÊT À POSTER", "black", 46, GREEN, NAVY, 34, 18, emoji="✅", shadow=16)
        over(fr, st, cx + 418, card_y + 280, min(1, ks * 2), 1.6 - 0.6 * ks)


# ------------------------------------------------------------- overlays
def hook(fr, t):
    a = window(t, 0.0, 3.85, 0.0, 0.3)
    if a:
        k = ease_out_back(prog(t, 0.0, 0.45))
        l1 = text_img("TU NE SAIS JAMAIS", "black", 78, WHITE, 8, NAVY, (0, 8, 12, 0.6))
        over(fr, l1, W / 2, 300, a, 0.7 + 0.3 * k)
        k2 = ease_out_back(prog(t, 0.25, 0.45))
        l2t = text_img("QUOI POSTER ?", "black", 92, NAVY)
        box = rrect(l2t.shape[1] + 40, 124, 24, ORANGE, None, 0, 14)
        over(fr, box, W / 2, 420, a * min(1, k2 * 2), 0.7 + 0.3 * k2)
        over(fr, l2t, W / 2, 420, a * min(1, k2 * 2), 0.7 + 0.3 * k2)
        over(fr, emoji_img("🤯", 96), W / 2 + l2t.shape[1] / 2 + 70, 420, a * min(1, k2 * 2), k2)
    a2 = window(t, 3.95, 5.75, 0.3, 0.25)
    if a2:
        k = ease_out_back(prog(t, 3.95, 0.45))
        bounce = 1 + 0.05 * np.sin((t - 4) * 9) * (1 - prog(t, 4, 1.2))
        p = pill("ENREGISTRE CETTE VIDÉO", "black", 54, WHITE, NAVY, 36, 22, emoji="🔖", shadow=18)
        over(fr, p, W / 2, 380, a2, (0.6 + 0.4 * k) * bounce)


def end_card(fr, t):
    if t < 32.4:
        return
    k1 = ease_out_back(prog(t, 32.56, 0.4))
    tap1 = 1 - 0.1 * np.sin(np.pi * prog(t, 32.85, 0.18))
    p1 = pill("Like", "black", 52, WHITE, NAVY, 40, 22, emoji="❤️", shadow=18)
    over(fr, p1, 300, 1380, min(1, 2 * k1), (0.6 + 0.4 * k1) * tap1)
    k2 = ease_out_back(prog(t, 33.0, 0.4))
    tap2 = 1 - 0.1 * np.sin(np.pi * prog(t, 33.3, 0.18))
    sub = t >= 33.35
    p2 = pill("Abonné" if sub else "Abonne-toi", "black", 52, (60, 66, 90) if sub else (254, 44, 85), WHITE,
              40, 22, emoji="🔔", shadow=18)
    over(fr, p2, 720, 1380, min(1, 2 * k2), (0.6 + 0.4 * k2) * tap2)
    k3 = ease_out(prog(t, 33.6, 0.4))
    over(fr, text_img("pour plus de vidéos comme celle-ci", "xbold", 40, WHITE, 5, NAVY, (0, 5, 8, 0.6)),
         W / 2, 1490 + 20 * (1 - k3), k3)
    # heart burst
    hb = prog(t, 32.85, 0.8)
    if 0 < hb < 1:
        for j in range(7):
            ang = -np.pi / 2 + (j - 3) * 0.32
            r = 40 + 200 * ease_out(hb)
            over(fr, emoji_img("❤️", 44), 300 + r * np.cos(ang), 1340 + r * np.sin(ang), 1 - hb, 0.6 + 0.6 * hb)


def captions(fr, t, cy):
    for c in chunks:
        if c[0]["s"] - 0.05 <= t < c[0]["chunk_end"]:
            act = max([i for i, w in enumerate(c) if w["s"] <= t + 0.03] or [0])
            img = caption_img(tuple(w["w"] for w in c), act, "black", 64)
            k = ease_out_back(prog(t, c[0]["s"] - 0.05, 0.16))
            over(fr, img, W / 2, cy, min(1, k * 2), 0.85 + 0.15 * k)
            return


# ------------------------------------------------------------- render
def main(out):
    rd = Reader()
    n = n_frames()
    wr = Writer(out, os.path.join(ROOT, "build", "audio_a.wav"))
    for i in range(n):
        wr.write(render(rd.next().astype(np.float32), i / FPS))
    wr.close()


def render(f, t):
    if t < T_SPLIT + T_SPLIT_D:
        hv = H - (H // 2) * ease_in_out(prog(t, T_SPLIT, T_SPLIT_D))
    else:
        hv = H // 2 + (H // 2) * ease_in_out(prog(t, T_END, T_END_D))
    hv = int(round(hv))
    z = 1.0 + 0.05 * prog(t, 0, 5.6) if t < T_SPLIT else 1.03 + 0.03 * prog(t, 6, 26)
    y0 = (H - hv) // 2
    fr = np.empty((H, W, 3), np.float32)
    src = zoom_crop(f, z, W / 2, 1000)
    fr[:hv] = src[y0:y0 + hv]
    if hv < H:
        top = hv
        fr[top:] = PBG[: H - top]
        # panel slides: search → chat → calendar
        s2 = ease_in_out(prog(t, T_P2, SLIDE))
        s3 = ease_in_out(prog(t, T_P3, SLIDE))
        if s2 < 1:
            panel_search(fr, t, top, -W * s2)
        if s2 > 0 and s3 < 1:
            panel_chat(fr, t, top, W * (1 - s2) - W * s3)
        if s3 > 0:
            panel_cal(fr, t, top, W * (1 - s3))
        over(fr, SEAM, 0, top - 3, 1, anchor="tl")
    hook(fr, t)
    end_card(fr, t)
    if hv < H * 0.75:
        captions(fr, t, hv - 90)
    elif not (32.4 <= t):
        captions(fr, t, 1520)
    return fr


def audio():
    ev = [(0.02, "pop", -16), (0.27, "pop_hi", -18), (3.95, "whoosh", -20), (4.05, "pop", -16),
          (5.55, "whoosh", -17), (7.4, "type", -27, 1.5), (11.95, "type", -27, 0.65), (15.0, "ding", -21),
          (18.85, "pop_hi", -17), (T_P2 - 0.05, "whoosh", -18), (19.95, "pop", -18), (26.65, "pop", -22),
          (T_P3 - 0.05, "whoosh", -18), (31.2, "impact", -15), (31.25, "shimmer", -22),
          (T_END - 0.05, "whoosh_down", -18), (32.56, "pop", -15), (32.85, "pop_hi", -18), (33.0, "pop", -15),
          (33.3, "pop_hi", -18)]
    ev += [(t0, "pop", -19) for _, _, t0 in CHIPS]
    ev += [(13.2 + i * 0.24, "tick", -22) for i in range(5)]
    ev += [(17.45 + i * 0.22, "tick", -20) for i in range(5)]
    ev += [(28.3 + i * 2.6 / 30, "tick", -25) for i in range(30)]
    build_audio(ev, os.path.join(ROOT, "build", "audio_a.wav"))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        preview(render, [float(x) for x in sys.argv[1:]], os.path.join(ROOT, "snapshots", "A_preview.png"))
        sys.exit()
    audio()
    main(os.path.join(ROOT, "renders", "A_split_screen_tuto_1080p.mp4"))
