"""Shared toolkit for the three edits: fonts, compositing, captions, SFX, encoding."""
import json
import math
import os
import subprocess
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1080, 1920, 30
SR = 48000
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
BASE = os.path.join(ROOT, "build", "base.mp4")
VOICE = os.path.join(ROOT, "build", "voice_clean.wav")

FONTS = {
    "black": os.path.join(FONT_DIR, "montserrat-latin-900-normal.ttf"),
    "xbold": os.path.join(FONT_DIR, "montserrat-latin-800-normal.ttf"),
    "anton": os.path.join(FONT_DIR, "anton-latin-400-normal.ttf"),
    "serif": os.path.join(FONT_DIR, "playfair-display-latin-400-normal.ttf"),
    "serif_b": os.path.join(FONT_DIR, "playfair-display-latin-700-normal.ttf"),
    "serif_i": os.path.join(FONT_DIR, "playfair-display-latin-400-italic.ttf"),
    "inter": "/usr/share/fonts/opentype/inter/Inter-Medium.otf",
    "inter_sb": "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf",
    "inter_b": "/usr/share/fonts/opentype/inter/Inter-Bold.otf",
    "inter_l": "/usr/share/fonts/opentype/inter/Inter-Light.otf",
    "mono": "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf",
}
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"


def load_words():
    return json.load(open(os.path.join(ROOT, "scripts", "words.json")))


# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def prog(t, t0, dur):
    return clamp((t - t0) / dur) if dur > 0 else float(t >= t0)


def ease_out(x):
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out_back(x, k=1.70158):
    x = clamp(x)
    return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2


def window(t, t0, t1, fin=0.25, fout=0.25):
    """0→1→0 visibility envelope with eased fades."""
    if t < t0 or t > t1:
        return 0.0
    a = ease_out(prog(t, t0, fin)) if fin > 0 else 1.0
    b = 1 - ease_in_out(prog(t, t1 - fout, fout)) if fout > 0 else 1.0
    return min(a, b)


# ---------------------------------------------------------------- images
def font(name, size):
    return _font(FONTS.get(name, name), int(size))


@lru_cache(maxsize=256)
def _font(path, size):
    return ImageFont.truetype(path, size)


def to_premul(img):
    a = np.asarray(img.convert("RGBA")).astype(np.float32)
    a[..., :3] *= a[..., 3:4] / 255.0
    return a


def text_pad(stroke, shadow):
    return stroke + (int(shadow[2] * 3 + abs(shadow[0]) + abs(shadow[1])) if shadow else 0) + 6


@lru_cache(maxsize=2048)
def text_img(text, fname, size, fill=(255, 255, 255), stroke=0, stroke_fill=(0, 0, 0),
             shadow=None, tracking=0):
    """Render text to a premultiplied RGBA float array. shadow=(dx, dy, blur, alpha)."""
    f = font(fname, size)
    pad = text_pad(stroke, shadow)
    if tracking:
        widths = [f.getlength(c) + tracking for c in text]
        tw = int(sum(widths) - tracking)
    else:
        tw = int(f.getlength(text))
    asc, desc = f.getmetrics()
    th = asc + desc
    img = Image.new("RGBA", (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0))

    def draw_into(d, col, scol):
        if tracking:
            x = pad
            for c, cw in zip(text, widths):
                d.text((x, pad), c, font=f, fill=col, stroke_width=stroke, stroke_fill=scol)
                x += cw
        else:
            d.text((pad, pad), text, font=f, fill=col, stroke_width=stroke, stroke_fill=scol)

    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw_into(ImageDraw.Draw(sh), (0, 0, 0, int(255 * shadow[3])), (0, 0, 0, int(255 * shadow[3])))
        sh = sh.filter(ImageFilter.GaussianBlur(shadow[2]))
        img.alpha_composite(sh, (int(shadow[0]), int(shadow[1])))
    draw_into(ImageDraw.Draw(img), tuple(fill) + (255,) if len(fill) == 3 else fill, stroke_fill)
    return to_premul(img)


@lru_cache(maxsize=128)
def emoji_img(ch, size):
    return to_premul(emoji_pil(ch, size))


@lru_cache(maxsize=256)
def rrect(w, h, r, fill, outline=None, width=0, shadow=0, shadow_alpha=0.45, ss=2):
    """Anti-aliased rounded rectangle (premultiplied), optional soft drop shadow."""
    return to_premul(rrect_pil(w, h, r, fill, outline, width, shadow, shadow_alpha, ss))


@lru_cache(maxsize=256)
def pill(text, fname, size, bg, fg=(255, 255, 255), padx=28, pady=14, radius=None, emoji=None,
         outline=None, shadow=0):
    """Rounded label with optional leading emoji (premultiplied)."""
    f = font(fname, size)
    tw = f.getlength(text)
    asc, desc = f.getmetrics()
    th = asc + desc
    es = int(size * 1.1) if emoji else 0
    gap = int(size * 0.4) if emoji else 0
    w, h = int(tw + es + gap + 2 * padx), int(th + 2 * pady)
    r = h // 2 if radius is None else radius
    img = rrect_pil(w, h, r, bg, outline, 2 if outline else 0, shadow).copy()
    pad = shadow * 2
    if emoji:
        e = emoji_pil(emoji, es)
        img.alpha_composite(e, (pad + padx, pad + (h - es) // 2))
    ImageDraw.Draw(img).text((pad + padx + es + gap, pad + h / 2), text, font=f, fill=fg, anchor="lm")
    return to_premul(img)


@lru_cache(maxsize=128)
def emoji_pil(ch, size):
    f = ImageFont.truetype(EMOJI_FONT, 109)
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((80, 80), ch, font=f, embedded_color=True, anchor="mm")
    return img.crop(img.getbbox()).resize((size, size), Image.LANCZOS)


@lru_cache(maxsize=256)
def rrect_pil(w, h, r, fill, outline=None, width=0, shadow=0, shadow_alpha=0.45, ss=2):
    pad = shadow * 2
    big = Image.new("RGBA", ((w + 2 * pad) * ss, (h + 2 * pad) * ss), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", big.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle(
            [pad * ss, (pad + shadow // 3) * ss, (pad + w) * ss, (pad + h + shadow // 3) * ss],
            r * ss, fill=(0, 0, 0, int(255 * shadow_alpha)))
        big = sh.filter(ImageFilter.GaussianBlur(shadow * ss * 0.6))
    d = ImageDraw.Draw(big)
    d.rounded_rectangle([pad * ss, pad * ss, (pad + w) * ss - 1, (pad + h) * ss - 1], r * ss,
                        fill=fill, outline=outline, width=width * ss)
    return big.resize((w + 2 * pad, h + 2 * pad), Image.LANCZOS)


def over(fr, arr, x, y, a=1.0, s=1.0, anchor="c"):
    """Composite premultiplied RGBA `arr` onto float frame `fr` (H×W×3).
    anchor: 'c' centre, 'tl' top-left, 'tc' top-centre, 'lc' left-centre."""
    if a <= 0.004 or s <= 0.01:
        return
    if s != 1.0:
        nw, nh = max(1, int(round(arr.shape[1] * s))), max(1, int(round(arr.shape[0] * s)))
        arr = cv2.resize(arr, (nw, nh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_LINEAR)
    h, w = arr.shape[:2]
    if anchor == "c":
        x0, y0 = x - w / 2, y - h / 2
    elif anchor == "tc":
        x0, y0 = x - w / 2, y
    elif anchor == "lc":
        x0, y0 = x, y - h / 2
    else:
        x0, y0 = x, y
    x0, y0 = int(round(x0)), int(round(y0))
    fh, fw = fr.shape[:2]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(fw, x0 + w), min(fh, y0 + h)
    if dx1 <= dx0 or dy1 <= dy0:
        return
    src = arr[sy0:sy0 + (dy1 - dy0), sx0:sx0 + (dx1 - dx0)]
    al = src[..., 3:4] * (a / 255.0)
    roi = fr[dy0:dy1, dx0:dx1]
    roi *= 1 - al
    roi += src[..., :3] * a


def rotate_img(arr, deg):
    """Rotate a premultiplied RGBA array, growing the canvas to fit."""
    if not deg:
        return arr
    h, w = arr.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), deg, 1.0)
    c, s = abs(M[0, 0]), abs(M[0, 1])
    nw, nh = int(h * s + w * c), int(h * c + w * s)
    M[0, 2] += nw / 2 - w / 2
    M[1, 2] += nh / 2 - h / 2
    return cv2.warpAffine(arr, M, (nw, nh), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))


def hstack_imgs(parts, gap=0):
    """Horizontally join premultiplied arrays, vertically centred."""
    hh = max(p.shape[0] for p in parts)
    ww = sum(p.shape[1] for p in parts) + gap * (len(parts) - 1)
    out = np.zeros((hh, ww, 4), np.float32)
    x = 0
    for p in parts:
        y = (hh - p.shape[0]) // 2
        out[y:y + p.shape[0], x:x + p.shape[1]] = p
        x += p.shape[1] + gap
    return out


def vignette(strength=0.45, power=2.2, cx=0.5, cy=0.45):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx / W - cx) / 0.75) ** 2 + ((yy / H - cy) / 0.75) ** 2)
    return (1 - strength * np.clip(d, 0, 1.4) ** power)[..., None].astype(np.float32)


def zoom_crop(frame, z, cx=W / 2, cy=H / 2, dx=0.0, dy=0.0, rot=0.0):
    """Scale `frame` by z around (cx, cy) keeping output W×H; dx/dy shake offsets."""
    if z == 1.0 and not dx and not dy and not rot:
        return frame
    M = cv2.getRotationMatrix2D((cx, cy), rot, z)
    M[0, 2] += dx
    M[1, 2] += dy
    return cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


# ---------------------------------------------------------------- captions
def chunk_words(words, max_words=3, max_chars=20):
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        end = w["w"][-1] in ",.:?!"
        if end or len(cur) >= max_words or len(txt) >= max_chars:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    for i, c in enumerate(chunks):
        nxt = chunks[i + 1][0]["s"] if i + 1 < len(chunks) else c[-1]["e"] + 0.4
        c_end = min(nxt, c[-1]["e"] + 0.45)
        for w in c:
            w["chunk_end"] = c_end
    return chunks


def clean(w):
    return w.strip(",.:")


@lru_cache(maxsize=1024)
def caption_img(words, active, fname, size, col=(255, 255, 255), hi=(255, 138, 31), stroke=7,
                stroke_col=(10, 15, 31), upper=True, hi_box=None, max_w=940):
    """One caption chunk; word `active` is highlighted (text colour, or a box behind it when
    hi_box is a colour). Wraps onto two lines when wider than max_w."""
    imgs, pads = [], []
    for i, w in enumerate(words):
        txt = clean(w).upper() if upper else clean(w)
        on = i == active
        if hi_box and on:
            t = text_img(txt, fname, size, stroke_col, 0, stroke_col, None)
            box = rrect(t.shape[1] + 24, max(int(size * 1.15), t.shape[0]), int(size * 0.22), hi_box)
            b = box.copy()
            y = (b.shape[0] - t.shape[0]) // 2
            x = (b.shape[1] - t.shape[1]) // 2
            region = b[max(0, y):y + t.shape[0], max(0, x):x + t.shape[1]]
            tt = t[:region.shape[0], :region.shape[1]]
            region[:] = tt + region * (1 - tt[..., 3:4] / 255)
            imgs.append(b)
            pads.append(0)
        else:
            imgs.append(text_img(txt, fname, size, hi if on and not hi_box else col, stroke, stroke_col,
                                 (0, 6, 8, 0.55)))
            pads.append(text_pad(stroke, (0, 6, 8, 0.55)))
    gap = int(size * 0.26)

    def join(ims, pd):
        xs, x = [], 0
        for k, im in enumerate(ims):
            if k:
                x += ims[k - 1].shape[1] - pd[k - 1] - pd[k] + gap
            xs.append(x)
        hh = max(im.shape[0] for im in ims)
        out = np.zeros((hh, xs[-1] + ims[-1].shape[1], 4), np.float32)
        for im, x in zip(ims, xs):
            y = (hh - im.shape[0]) // 2
            r = out[y:y + im.shape[0], x:x + im.shape[1]]
            r[:] = im + r * (1 - im[..., 3:4] / 255)
        return out

    one = join(imgs, pads)
    if one.shape[1] <= max_w or len(imgs) == 1:
        return one
    best = min(range(1, len(imgs)), key=lambda k: abs(join(imgs[:k], pads[:k]).shape[1] - one.shape[1] / 2))
    l1, l2 = join(imgs[:best], pads[:best]), join(imgs[best:], pads[best:])
    ww = max(l1.shape[1], l2.shape[1])
    hh = max(l1.shape[0], l2.shape[0])
    step = int(size * (1.32 if hi_box else 1.12))
    out = np.zeros((hh + step, ww, 4), np.float32)
    for j, l in enumerate((l1, l2)):
        x = (ww - l.shape[1]) // 2
        y = (hh - l.shape[0]) // 2 + j * step
        r = out[y:y + l.shape[0], x:x + l.shape[1]]
        r[:] = l + r * (1 - l[..., 3:4] / 255)
    return out


# ---------------------------------------------------------------- IO
class Reader:
    def __init__(self, path=BASE):
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo",
                                   "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.last = None

    def next(self):
        buf = self.p.stdout.read(W * H * 3)
        if len(buf) == W * H * 3:
            self.last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        return self.last


def frame_at(t, path=BASE):
    buf = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1",
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(buf, np.uint8).reshape(H, W, 3)


def preview(render_frame, times, out_png):
    """Render selected timestamps through `render_frame(f, t)` into one contact sheet."""
    tiles = []
    for t in times:
        fr = render_frame(frame_at(t).astype(np.float32), t)
        tiles.append(cv2.resize(np.clip(fr, 0, 255).astype(np.uint8), (W // 3, H // 3), interpolation=cv2.INTER_AREA))
    cols = min(4, len(tiles))
    rows = [np.hstack(tiles[i:i + cols] + [np.zeros_like(tiles[0])] * (cols - len(tiles[i:i + cols])))
            for i in range(0, len(tiles), cols)]
    Image.fromarray(np.vstack(rows)).save(out_png)


def n_frames(path=BASE):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0",
                                   "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", path])
    return int(out.strip())


class Writer:
    def __init__(self, out, audio, crf=16):
        self.p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
             "-r", str(FPS), "-i", "-", "-i", audio, "-map", "0:v", "-map", "1:a",
             "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-profile:v", "high",
             "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
             "-colorspace", "bt709", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
             "-movflags", "+faststart", "-shortest", out], stdin=subprocess.PIPE)

    def write(self, fr):
        self.p.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())

    def close(self):
        self.p.stdin.close()
        self.p.wait()


# ---------------------------------------------------------------- audio / SFX
_rng = np.random.default_rng(7)


def _env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def sfx_whoosh(dur=0.5, lo=300, hi=5000, up=True):
    n = int(dur * SR)
    noise = _rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        x = (b + 0.5) / blocks
        f = lo * (hi / lo) ** (x if up else 1 - x)
        sos = butter(2, [max(40, f * 0.6), min(SR / 2 - 100, f * 1.6)], "bandpass", fs=SR, output="sos")
        out[a:z] = sosfilt(sos, noise[max(0, a - 2000):z])[-(z - a):]
    env = np.sin(np.linspace(0, math.pi, n)) ** 1.6
    return out * env / (np.abs(out).max() + 1e-9)


def sfx_pop(f0=900, f1=260, dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    x = np.sin(2 * math.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.035)
    return x / np.abs(x).max()


def sfx_tick(f=4200):
    n = int(0.03 * SR)
    sos = butter(2, [f * 0.6, f * 1.4], "bandpass", fs=SR, output="sos")
    x = sosfilt(sos, _rng.standard_normal(n)) * _env(n, 0.0005, 0.006)
    return x / np.abs(x).max()


def sfx_ding(notes=(1318.5, 1975.5), dur=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * math.pi * f * t) * (0.6 ** i) for i, f in enumerate(notes))
    x += 0.3 * np.sin(2 * math.pi * notes[0] * 2 * t)
    x *= _env(n, 0.003, 0.28)
    return x / np.abs(x).max()


def sfx_impact(dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 45 + 90 * np.exp(-t * 25)
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * _env(n, 0.001, 0.16)
    sos = butter(2, 1800, "lowpass", fs=SR, output="sos")
    crack = sosfilt(sos, _rng.standard_normal(n)) * _env(n, 0.0005, 0.03)
    x = body + 0.35 * crack
    return x / np.abs(x).max()


def sfx_riser(dur=1.0):
    return sfx_whoosh(dur, 200, 7000, True) * np.linspace(0.2, 1, int(dur * SR)) ** 2


def sfx_shimmer(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate((1046.5, 1318.5, 1568.0, 2093.0)):
        d = int(i * 0.06 * SR)
        x[d:] += np.sin(2 * math.pi * f * t[: n - d]) * _env(n - d, 0.004, 0.35) * 0.8 ** i
    return x / np.abs(x).max()


def sfx_type(dur, rate=14):
    """Keyboard typing bed: random ticks at ~rate per second."""
    n = int(dur * SR)
    x = np.zeros(n)
    t = 0.0
    while t < dur - 0.03:
        k = sfx_tick(_rng.uniform(2500, 5200)) * _rng.uniform(0.5, 1.0)
        i = int(t * SR)
        x[i:i + len(k)] += k[: n - i]
        t += _rng.uniform(0.6, 1.4) / rate
    return x / (np.abs(x).max() + 1e-9)


SFX = {"whoosh": sfx_whoosh, "whoosh_down": lambda: sfx_whoosh(0.45, 300, 5000, False),
       "pop": sfx_pop, "pop_hi": lambda: sfx_pop(1500, 500, 0.1), "tick": sfx_tick,
       "ding": sfx_ding, "impact": sfx_impact, "riser": sfx_riser, "shimmer": sfx_shimmer}


def build_audio(events, out, voice=VOICE, target=-14.0):
    """events: list of (time_s, name, gain_db[, arg]). Mixes SFX under the cleaned voice,
    then two-pass loudness-normalises to `target` LUFS / -1.5 dBTP."""
    import wave
    with wave.open(voice) as wf:
        v = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
        ch = wf.getnchannels()
    v = v.reshape(-1, ch).mean(1)
    mix = np.zeros(len(v) + SR)
    mix[: len(v)] += v
    for ev in events:
        t, name, gdb = ev[:3]
        x = sfx_type(ev[3]) if name == "type" else SFX[name]()
        i = int(t * SR)
        seg = x[: max(0, len(mix) - i)] * 10 ** (gdb / 20)
        mix[i:i + len(seg)] += seg
    mix = mix[: len(v)]
    tmp = out + ".pre.wav"
    stereo = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16)
    with wave.open(tmp, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af",
                           f"loudnorm=I={target}:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    af = (f"loudnorm=I={target}:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), out], check=True)
    os.remove(tmp)
