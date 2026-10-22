"""Afro / amapiano bed for the Sublime Booty ad, synthesised deterministically (no samples).
usage: python3 afro_beat.py out.wav [seconds]"""
import sys, numpy as np, wave

SR = 44100
BPM = 112.0
BEAT = 60.0 / BPM
STEP = BEAT / 4  # 16th
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 41.0
N = int(DUR * SR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def put(sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N: return
    if i < 0:
        sig = sig[-i:]; i = 0
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * np.sqrt(0.5 * (1 - pan)) * 1.414
    R[i:i + len(s)] += s * np.sqrt(0.5 * (1 + pan)) * 1.414

def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.exp(-t / d * curve / 4)
    ai = max(1, int(a * SR)); e[:ai] *= np.linspace(0, 1, ai)
    return e

def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) + 0.25 * np.sin(ph * 2) * np.exp(-t * 30)

def logdrum(freq, length=0.42):
    # amapiano log drum: woody pitched body with a fast downward bend and a hollow overtone
    n = int(length * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) + 0.35 * np.sin(2.01 * ph) * np.exp(-t * 18) + 0.15 * np.tanh(3 * np.sin(ph))
    return body * np.exp(-t * 5.5) * env(n, 0.003, 1, 0.1)

def noise_hit(length, hp=0.0, decay=30.0):
    n = int(length * SR); x = rng.standard_normal(n)
    if hp:  # crude high-pass: difference filter applied repeatedly
        for _ in range(int(hp)): x = np.diff(x, prepend=0)
        x /= np.max(np.abs(x)) + 1e-9
    return x * np.exp(-np.arange(n) / SR * decay)

def clap():
    n = int(0.25 * SR); out = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        h = noise_hit(0.15, hp=2, decay=60 if k < 2 else 28); i = int(off * SR); out[i:i + len(h)] += h[: n - i]
    return out * 0.6

def shaker(): return noise_hit(0.06, hp=3, decay=90) * 0.5

def rim(freq=1700):
    n = int(0.08 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) * 0.6 + noise_hit(0.08, hp=2, decay=120) * 0.4) * np.exp(-t * 70)

def conga(freq):
    n = int(0.3 * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.25 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)

def pluck(freq, length=0.5):
    # marimba-like pluck
    n = int(length * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t * 30)
    return s * np.exp(-t * 7)

def pad(freqs, length):
    n = int(length * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * (2 ** (det / 12))
            s += np.sin(2 * np.pi * ff * t) + 0.25 * np.sin(4 * np.pi * ff * t)
    a = int(0.05 * SR); r = int(0.25 * SR)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a); e[-r:] = np.linspace(1, 0, r)
    return s * e / (len(freqs) * 3)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# A minor: Am - F - C - G, one chord per bar
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]
LOG_PATTERN = [(0, 0), (3, 0), (6, 7), (10, 0), (11, 3), (14, 5)]  # (16th step, semitone offset)
MELODY = [(0, 76), (3, 74), (6, 72), (8, 69), (11, 72), (14, 74)]  # pentatonic bell answer

BAR = BEAT * 4
nbars = int(DUR / BAR) + 1
BREAK = (19.4, 21.3)   # "Commander, c'est très facile" — drums drop out, pad + log drum only
OFFSET = BAR - 1.65  # put a downbeat exactly on the logo reveal (1.65 s)
for b in range(nbars + 1):
    t0 = b * BAR - OFFSET
    ci = b % 4
    intro = False
    # pad on every bar
    put(pad([hz(m) for m in CHORDS[ci]], BAR + 0.2), t0, 0.16, 0)
    for s in range(16):
        t = t0 + s * STEP
        if t >= DUR: break
        if t < 0: continue
        in_break = BREAK[0] <= t < BREAK[1]
        swing = 0.012 if s % 2 else 0.0
        if not in_break and not intro:
            if s in (0, 7, 8, 12): put(kick(), t, 0.85 if s in (0, 8) else 0.55)
            if s in (4, 12): put(clap(), t + swing, 0.2, 0.1)
            put(shaker(), t + swing, 0.16 if s % 4 == 2 else 0.09, -0.35)
            if s in (3, 6, 10, 13): put(rim(), t + swing, 0.16, 0.45)
            if s in (2, 9, 14): put(conga(220 if s != 9 else 180), t + swing, 0.18, -0.25)
        for st, semi in LOG_PATTERN:
            if s == st and not intro:
                put(logdrum(hz(ROOTS[ci] - 12 + semi)), t, 0.55 if not in_break else 0.65)
        if b % 2 == 1 and not intro and not in_break:
            for st, m in MELODY:
                if s == st: put(pluck(hz(m - 12 * (b % 4 == 3) + (CHORDS[ci][0] - 57) * 0)), t, 0.07, 0.3)

# hook hit on frame 0
put(kick(), 0.0, 0.9)

mix = np.stack([L, R], 1)
# gentle bus: soft clip + normalise to -1 dBFS peak, 1.2 s fade-out
mix = np.tanh(mix * 0.9)
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", DUR, "s", BPM, "bpm")
