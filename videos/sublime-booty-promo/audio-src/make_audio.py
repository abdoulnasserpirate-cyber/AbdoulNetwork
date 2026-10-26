"""Synthesise the background music bed (amapiano feel, 112 BPM, F minor) and the
sound effects for the Sublime Booty promo. Deterministic: same output every run.

    python3 audio-src/make_audio.py   (from the project root)
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
BPM = 112
BEAT = 60 / BPM
BAR = BEAT * 4
DUR = 60.0
rng = np.random.default_rng(7)


def t_(n):
    return np.arange(n) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, x, at, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


def env_ad(n, a, d):
    t = t_(n)
    e = np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-np.maximum(t - a, 0) / d)
    return e


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low')
    return signal.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high')
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)


# ---------- instruments ----------
def kick():
    n = int(0.32 * SR); t = t_(n)
    f = 48 + 70 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.13) * 0.9


def log_drum(m, length=0.42):
    n = int(length * SR); t = t_(n)
    f0 = midi(m)
    f = f0 * (1 + 0.35 * np.exp(-t / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.25 * np.sin(2 * ph)
    x = np.tanh(1.8 * x) * env_ad(n, 0.004, length * 0.45)
    return lp(x, 1400) * 0.26


def shaker(v=1.0):
    n = int(0.07 * SR)
    x = hp(rng.standard_normal(n), 7000) * env_ad(n, 0.003, 0.018)
    return x * 0.11 * v


def rim():
    n = int(0.12 * SR); t = t_(n)
    x = bp(rng.standard_normal(n), 1500, 4200) * np.exp(-t / 0.025) * 0.18
    x += np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.02) * 0.08
    return x


def rhodes(notes, length=1.1, vel=1.0):
    n = int(length * SR); t = t_(n)
    out = np.zeros(n)
    for m in notes:
        f = midi(m)
        tone = (np.sin(2 * np.pi * f * t) + 0.32 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.25)
                + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.12))
        out += tone
    out *= env_ad(n, 0.006, length * 0.38) * (1 + 0.05 * np.sin(2 * np.pi * 5.2 * t))
    return lp(out, 5000) * 0.2 * vel


def pad(notes, length):
    n = int(length * SR); t = t_(n)
    out = np.zeros(n)
    for m in notes:
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28))
    a = np.minimum(t / 0.6, 1) * np.minimum((length - t) / 0.6, 1)
    return lp(out * np.clip(a, 0, 1), 2600) * 0.03


def reverb(x, secs=1.8, mix=0.28):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5))
    ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    wet = signal.fftconvolve(x, ir)[:len(x)]
    return x * (1 - mix) + wet * mix


# ---------- arrangement ----------
# F minor: Fm9 | Dbmaj9 | Bbm9 | Eb6/9
CHORDS = [
    (53, [56, 60, 63, 67]),   # F  : Ab C Eb G
    (49, [53, 56, 60, 63]),   # Db : F Ab C Eb
    (46, [53, 56, 60, 61]),   # Bb : F Ab C Db
    (51, [55, 58, 60, 65]),   # Eb : G Bb C F
]
LOG_PATTERN = [0, 3, 6, 10, 11, 14]          # 16th positions
RHODES_HITS = [(0, 1.0), (6, 0.7), (10, 0.85), (14, 0.6)]

n_total = int(DUR * SR)
drums = np.zeros(n_total); bass = np.zeros(n_total); keys = np.zeros(n_total); pads = np.zeros(n_total)
S16 = BEAT / 4
bars = int(np.ceil(DUR / BAR))
OUTRO = 56.6   # last voice word ends ~56.6 s — drums thin out, pads ring to the end
for b in range(bars):
    t0 = b * BAR
    root, notes = CHORDS[b % 4]
    intro = b == 0
    pads_notes = [root + 12] + notes
    place(pads, pad(pads_notes, BAR + 0.6), t0)
    for pos, v in RHODES_HITS:
        place(keys, rhodes([m + 12 for m in notes], 1.0, v * 0.8), t0 + pos * S16)
    if intro or t0 >= OUTRO:
        continue
    for k in range(4):
        place(drums, kick(), t0 + k * BEAT, 0.32)
    for k in (1, 3):
        place(drums, rim(), t0 + k * BEAT + S16 * 0)
    for s in range(16):
        place(drums, shaker(1.0 if s % 2 else 0.55), t0 + s * S16)
    for i, pos in enumerate(LOG_PATTERN):
        m = root - 12 + (7 if i == 4 else 0) + (12 if (b % 2 and i == 5) else 0)
        place(bass, log_drum(m, 0.38 if i < 5 else 0.5), t0 + pos * S16)

music_mono_parts = {'drums': drums, 'bass': bass}
keys = reverb(keys, 1.9, 0.32)
pads = reverb(pads, 2.6, 0.4)

# stereo image
L = drums + bass + keys * 0.92 + pads * 1.1
R = drums + bass + np.roll(keys, int(0.011 * SR)) * 1.0 + np.roll(pads, int(0.017 * SR)) * 0.95
mix = np.stack([L, R], 1)
mix = lp(mix.T, 15000).T
mix = hp(mix.T, 38).T
# glue: soft saturation, fades
mix = np.tanh(mix * 1.1) / 1.1
fade_in = np.minimum(t_(n_total) / 1.2, 1)
fade_out = np.clip((DUR - t_(n_total)) / 3.0, 0, 1)
mix *= (fade_in * fade_out)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
wavfile.write('assets/bgm/bgm-amapiano-112.wav', SR, (mix * 0.89 * 32767).astype(np.int16))


# ---------- SFX ----------
def write(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wavfile.write(f'assets/sfx/{name}.wav', SR, (x * 32767).astype(np.int16))


# whoosh: band-passed noise sweeping up then down
n = int(0.6 * SR); t = t_(n)
noise = rng.standard_normal(n)
out = np.zeros(n)
for i in range(0, n, 512):
    seg = slice(max(i - 1024, 0), min(i + 1536, n))
    fc = 400 + 3600 * np.sin(np.pi * min(i / n, 1)) ** 2
    y = bp(noise[seg], fc * 0.6, min(fc * 1.6, 19000))
    out[i:i + 512] += y[(i - seg.start):(i - seg.start) + 512][:len(out[i:i + 512])]
whoosh = out * np.sin(np.pi * t / t[-1]) ** 2
write('whoosh', np.stack([whoosh, np.roll(whoosh, 300)], 1))

# pop: soft bubbly blip
n = int(0.16 * SR); t = t_(n)
f = 520 + 900 * np.exp(-t / 0.02)
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.002, 0.04)
write('pop', pop)

# shimmer: bell sparkle for logo reveals
n = int(1.6 * SR); t = t_(n)
sh = np.zeros(n)
for k, m in enumerate([84, 88, 91, 96, 100]):
    d = int(k * 0.06 * SR)
    tt = t[:n - d]
    sh[d:] += (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(2 * np.pi * midi(m) * 2.76 * tt)) * np.exp(-tt / 0.45)
write('shimmer', reverb(sh, 1.4, 0.35))

# tick: soft click for counter digits
n = int(0.05 * SR); t = t_(n)
write('tick', np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.006))

# impact: soft low boom for big title hits
n = int(1.0 * SR); t = t_(n)
f = 38 + 60 * np.exp(-t / 0.05)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.3) + lp(rng.standard_normal(n), 600) * np.exp(-t / 0.08) * 0.3
write('impact', boom)
print('ok')
