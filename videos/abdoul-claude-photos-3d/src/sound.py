"""Synthesize the music bed + sound effects and mix them with the voice.

Writes assets/audio/music.wav, sfx.wav, mix.wav (voice + music + sfx) and mix-sans-voix.wav.
Timings mirror src/scene.js. Deterministic (seeded noise).
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000
DUR = 56.0
N = int(SR * DUR)
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(42)


def tt(d):
    return np.arange(int(SR * d)) / SR


def adsr(n, a=0.005, d=0.05, s=0.6, r=0.1):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd)
    if nr < n: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, cutoff):
    # one-pole low-pass, cutoff may be array
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def lp_fast(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    from scipy.signal import lfilter  # noqa
    return lfilter([1 - a], [1, -a], x)


try:
    from scipy.signal import lfilter, butter, sosfilt
    def bp(x, lo, hi, order=2):
        return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
    def hp(x, f, order=2):
        return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)
    def lpf(x, f, order=2):
        return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)
except ImportError:  # pragma: no cover
    raise SystemExit("scipy required")


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf): return
    s = sig[: len(buf) - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(s), 0] += s * l * 1.414
    buf[i:i + len(s), 1] += s * r * 1.414


# ------------------------------------------------------------------ sfx library
def s_beep(f=1800, d=0.12):
    x = tt(d); return np.sin(2 * np.pi * (f - 500 * x / d) * x) * adsr(len(x), 0.002, 0.03, 0.5, 0.06) * 0.5

def s_scan(d=1.2, up=False):
    x = tt(d); f = np.linspace(500, 2400, len(x)) if not up else np.linspace(2400, 700, len(x))
    ph = 2 * np.pi * np.cumsum(f) / SR
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 18 * x)
    return np.sin(ph) * am * adsr(len(x), 0.05, 0.1, 0.8, 0.3) * 0.18

def s_click(d=0.05):
    x = tt(d); n = rng.standard_normal(len(x))
    return hp(n, 2500) * np.exp(-x * 140) * 0.7 + np.sin(2 * np.pi * 2200 * x) * np.exp(-x * 200) * 0.3

def s_lock():
    return s_click(0.08) * 1.2 + np.pad(s_click(0.06), (int(0.035 * SR), 0))[: int(0.08 * SR)] * 0.8

def s_mouse():
    a = s_click(0.04) * 0.8
    b = np.zeros(int(0.09 * SR)); b[: len(a)] += a; b[int(0.05 * SR): int(0.05 * SR) + len(a)] += a * 0.6
    return b

def s_key():
    x = tt(0.035); n = rng.standard_normal(len(x))
    f = rng.uniform(1800, 3600)
    return bp(n, f * 0.6, f * 1.4) * np.exp(-x * 220) * 0.9

def s_whoosh(d=0.55, lo=300, hi=3500, amp=0.5):
    x = tt(d); n = rng.standard_normal(len(x))
    env = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2
    out = np.zeros_like(n)
    # sweep band in 8 chunks
    k = 8
    for j in range(k):
        a, b = j * len(n) // k, (j + 1) * len(n) // k
        c = lo * (hi / lo) ** (j / (k - 1))
        out[a:b] = bp(n, c * 0.7, min(c * 1.4, SR / 2 - 100))[a:b]
    return out * env * amp

def s_tick():
    x = tt(0.03); return np.sin(2 * np.pi * 3200 * x) * np.exp(-x * 260) * 0.5 + s_click(0.03) * 0.25

def s_pop():
    x = tt(0.09); f = 900 * np.exp(-x * 30) + 250
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 45) * 0.5

def s_ding(f=1320, d=1.2):
    x = tt(d)
    return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 4) + 0.25 * np.sin(2 * np.pi * 3.01 * f * x) * np.exp(-x * 7)) * np.exp(-x * 4.5) * 0.28

def s_boom(d=1.4, f0=90):
    x = tt(d); f = f0 * np.exp(-x * 3) + 32
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.8)
    return np.tanh(s * 2.2) * 0.8

def s_glitch():
    d = 0.5; x = tt(d); n = rng.standard_normal(len(x))
    crunch = np.sign(np.sin(2 * np.pi * 70 * x)) * 0.3 + n * 0.5
    gate = (np.floor(x * 38) % 3 != 1).astype(float)
    crunch = np.round(crunch * 6) / 6 * gate * np.exp(-x * 5)
    return hp(crunch, 200) * 0.45 + s_boom(1.0, 120)[: len(x)] * 0.9

def s_riser(d=1.0):
    x = tt(d); n = rng.standard_normal(len(x))
    out = np.zeros_like(n); k = 10
    for j in range(k):
        a, b = j * len(n) // k, (j + 1) * len(n) // k
        c = 400 * (8000 / 400) ** (j / (k - 1))
        out[a:b] = bp(n, c * 0.7, min(c * 1.3, 20000))[a:b]
    return out * (x / d) ** 2.2 * 0.35

def s_swoosh_send():
    return s_whoosh(0.35, 800, 7000, 0.4)


# ------------------------------------------------------------------ sfx timeline (mirrors scene.js)
sfx = np.zeros((N, 2))
place(sfx, s_scan(1.2), 0.35, 0.9); place(sfx, s_scan(1.1, True), 1.55, 0.8)
place(sfx, s_beep(1800), 0.32, 0.6); place(sfx, s_beep(2100), 1.52, 0.5); place(sfx, s_beep(1600), 2.62, 0.5)
place(sfx, s_lock(), 2.98, 0.9)
for t in [3.6, 6.65, 13.5, 32.35, 45.7, 49.3]: place(sfx, s_whoosh(0.6), t, 0.55)
for t in [18.5, 23.95]: place(sfx, s_whoosh(0.7, 200, 2500), t, 0.7)
place(sfx, s_whoosh(0.9, 150, 5000, 0.7), 36.8, 1.0)
place(sfx, s_whoosh(0.8, 150, 4000, 0.6), 49.8, 0.8)
place(sfx, s_whoosh(0.7, 200, 3000), 39.75, 0.6)
CARD_T = [4.15 + i * 0.19 for i in range(9)]
ENV_T = [47.6 + i * 0.16 for i in range(9)]
for i, t in enumerate(CARD_T): place(sfx, s_tick(), t, 0.9, pan=(i % 3 - 1) * 0.4)
for i, t in enumerate(ENV_T): place(sfx, s_pop(), t, 0.8, pan=(i % 3 - 1) * 0.4); place(sfx, s_tick(), t + 0.02, 0.5)
for t in [9.25, 10.85, 12.4, 26.45, 28.45, 31.6]: place(sfx, s_pop(), t, 0.9)
for i in range(4): place(sfx, s_pop(), 33.2 + i * 0.08, 0.35)
for i in range(4): place(sfx, s_whoosh(0.45, 600, 4000, 0.35), 33.35 + i * 0.42, 0.6, pan=-0.3 + i * 0.2)
for t in [8.89, 13.45, 20.55, 21.0, 22.3, 32.0, 45.5, 53.2]: place(sfx, s_mouse(), t, 0.9)
DESC_T = [14.25, 14.85, 15.6, 16.3, 16.68, 16.98, 17.3]
for t in DESC_T: place(sfx, s_tick(), t, 0.25)

def typing(t0, t1, n_chars, gain=0.55):
    k = max(1, int(n_chars / 2.2))
    for j in range(k):
        t = t0 + (t1 - t0) * (j + rng.uniform(-0.3, 0.3)) / k
        place(sfx, s_key(), max(t0, t), gain * rng.uniform(0.6, 1.0), pan=rng.uniform(-0.2, 0.2))

typing(9.9, 12.95, 136); typing(21.55, 21.95, 6); typing(25.1, 31.75, 220); typing(40.55, 45.25, 150); typing(50.65, 51.75, 14)
for t in [34.0, 34.8, 35.7, 36.45]: place(sfx, s_ding(1568, 0.8), t, 0.55)
place(sfx, s_ding(1320), 22.95, 0.7)
place(sfx, s_ding(1046, 2.0), 53.3, 0.8); place(sfx, s_ding(1568, 2.0), 53.32, 0.4)
place(sfx, s_riser(1.0), 17.42, 0.8); place(sfx, s_riser(0.9), 38.6, 0.5)
place(sfx, s_glitch(), 18.42, 1.0); place(sfx, s_glitch(), 39.5, 1.0)
place(sfx, s_boom(1.6, 70), 38.74, 1.0); place(sfx, s_boom(1.2, 110), 37.2, 0.7)
place(sfx, s_swoosh_send(), 48.95, 0.9)
place(sfx, s_beep(2400, 0.08), 21.0, 0.3)

# ------------------------------------------------------------------ music: dark tense pulse, 100 BPM, A minor
BPM = 100; beat = 60 / BPM
x = np.arange(N) / SR
mus = np.zeros((N, 2))
note = lambda m: 440 * 2 ** ((m - 69) / 12)
# chords per 2 bars (8 beats = 4.8 s): Am, Am, F, E
prog = [[45, 52, 57, 60, 64], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [40, 47, 52, 56, 59]]
bar2 = 8 * beat
pad = np.zeros(N)
for ci in range(int(DUR / bar2) + 1):
    ch = prog[ci % 4]
    a, b = int(ci * bar2 * SR), min(N, int((ci + 1) * bar2 * SR) + int(0.4 * SR))
    if a >= N: break
    xs = np.arange(b - a) / SR
    seg = np.zeros(b - a)
    for m in ch[1:]:
        for det in (-0.12, 0.0, 0.11):
            f = note(m) * 2 ** (det / 12)
            seg += 2 * ((xs * f + rng.uniform()) % 1) - 1
    e = np.minimum(1, xs / 0.6) * np.minimum(1, (b - a - np.arange(b - a)) / SR / 0.4)
    pad[a:b] += seg * e * 0.05
pad = lpf(pad, 900, 2)
# sub + pulsing bass on 8ths
sub = np.zeros(N); bass = np.zeros(N)
for ci in range(int(DUR / bar2) + 1):
    root = prog[ci % 4][0] - 12
    for k in range(16):
        t0 = ci * bar2 + k * beat / 2
        if t0 >= DUR: break
        i0 = int(t0 * SR); ln = int(beat / 2 * SR * 0.9)
        xs = np.arange(min(ln, N - i0)) / SR
        f = note(root + 12)
        bass[i0:i0 + len(xs)] += (2 * ((xs * f) % 1) - 1) * np.exp(-xs * 9) * 0.3
    i0 = int(ci * bar2 * SR); i1 = min(N, int((ci + 1) * bar2 * SR))
    xs = np.arange(i1 - i0) / SR
    sub[i0:i1] += np.sin(2 * np.pi * note(root) * xs) * 0.35
bass = lpf(bass, 700, 2)
pump = 0.55 + 0.45 * np.clip(((x % beat) / beat) * 3, 0, 1)
# hats on 16ths after 4 s, kick on beats
hats = np.zeros(N); kick = np.zeros(N)
hn = hp(rng.standard_normal(int(0.04 * SR)), 7000)
kk = s_boom(0.35, 120) * 0.8
for k in range(int(DUR / (beat / 4))):
    t0 = k * beat / 4
    i0 = int(t0 * SR)
    if t0 > 4.0 and i0 + len(hn) < N:
        hats[i0:i0 + len(hn)] += hn * np.exp(-np.arange(len(hn)) / SR * 90) * (0.16 if k % 2 else 0.08)
    if k % 4 == 0 and t0 > 6.6 and i0 + len(kk) < N:
        kick[i0:i0 + len(kk)] += kk
mono = (pad + bass * pump + sub * pump) * 1.0 + kick * 0.5
# drop on « peur »: music cut 38.74 → 39.5, back after
gate = np.ones(N)
gate[int(38.74 * SR):int(39.55 * SR)] = 0.0
ramp = int(0.03 * SR)
gate[int(38.74 * SR) - ramp:int(38.74 * SR)] = np.linspace(1, 0, ramp)
# intro: only pad + sub; ending: fade
intro = np.clip(x / 0.8, 0, 1)
outro = np.clip((DUR - x) / 3.0, 0, 1)
mono = mono * gate * intro * outro
hats = hats * gate * outro
mus[:, 0] = mono + hats * 0.8; mus[:, 1] = mono + hats * 1.2
# light stereo width on the pad
mus[:, 0] += np.roll(pad, int(0.012 * SR)) * 0.4 * gate * outro
mus[:, 1] -= np.roll(pad, int(0.012 * SR)) * 0.4 * gate * outro


def write(path, buf):
    b = np.clip(buf, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((b * 32767).astype("<i2").tobytes())


def lufs(path):
    out = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    for line in out.splitlines()[::-1]:
        if line.strip().startswith("I:"):
            return float(line.split()[1])


def load_voice():
    p = ROOT / "assets/voice/voix-abdul-clean.wav"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    v = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(float)
    out = np.zeros((N, 2)); out[: min(N, len(v))] = v[:N]
    return out


A = ROOT / "assets/audio"
A.mkdir(parents=True, exist_ok=True)
tmp = A / "_tmp.wav"


def gain_to(buf, target):
    m = np.max(np.abs(buf)) or 1
    buf = buf / m * 0.5
    write(tmp, buf)
    l = lufs(tmp)
    return buf * 10 ** ((target - l) / 20)


voice = load_voice()
music = gain_to(mus, -38.0)   # ≈ 24 dB under the voice (-14 LUFS)
fx = gain_to(sfx, -27.0)
write(A / "music.wav", music)
write(A / "sfx.wav", fx)
mix = voice + music + fx
peak = np.max(np.abs(mix))
if peak > 0.97: mix *= 0.97 / peak
write(A / "mix.wav", mix)
nv = gain_to(music * 2.2 + fx, -16.0)
peak = np.max(np.abs(nv))
if peak > 0.97: nv *= 0.97 / peak
write(A / "mix-sans-voix.wav", nv)
tmp.unlink()
print(json.dumps({k: lufs(A / f"{k}.wav") for k in ["music", "sfx", "mix", "mix-sans-voix"]}))
