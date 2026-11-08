"""Génère les SFX et la musique de fond de façon procédurale (aucun asset externe).

    python3 scripts/audio_gen.py

-> public/audio/sfx/{whoosh,pop,tick,ding,foule,huees}.wav
-> public/audio/musique-cozy.wav  (boucle légère et aventureuse, ré majeur, 100 bpm)
-> public/audio/musique-tension.wav (même boucle en mineur, plus sombre, pour les conflits)
Seed fixe : le rendu est identique à chaque exécution.
"""
import os
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(2026)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
os.makedirs(os.path.join(OUT, 'sfx'), exist_ok=True)


def save(path, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(SR * a), int(SR * r)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def lowpass(x, cutoff):
    """filtre passe-bas 1 pôle (cutoff scalaire ou tableau)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


# ---------------------------------------------------------------- SFX
def whoosh():
    d = 0.7
    n = len(t(d))
    noise = rng.standard_normal(n)
    sweep = 300 + 5000 * np.sin(np.linspace(0, np.pi, n)) ** 2
    x = lowpass(noise, sweep) - lowpass(noise, sweep * 0.25)
    return x * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def pop():
    tt = t(0.14)
    f = 900 * np.exp(-tt * 28) + 380
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * np.exp(-tt * 30)


def tick():
    tt = t(0.05)
    x = np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 140) + 0.3 * rng.standard_normal(len(tt)) * np.exp(-tt * 300)
    return x


def ding():
    tt = t(1.4)
    x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * dcy) for f, a, dcy in [(1318.5, 1, 3), (2637, 0.35, 5), (3951, 0.15, 7), (1975.5, 0.3, 4)])
    return x * env(len(tt), 0.002, 0.1)


def foule(boo=False):
    d = 2.6
    n = len(t(d))
    x = np.zeros(n)
    for _ in range(40):
        f0 = rng.uniform(140, 320) * (0.8 if boo else 1)
        st = int(rng.uniform(0, 0.6) * SR)
        ln = int(rng.uniform(0.9, 1.8) * SR)
        tt = np.arange(ln) / SR
        vib = 1 + 0.04 * np.sin(2 * np.pi * rng.uniform(4, 7) * tt)
        glide = (1 - 0.25 * tt) if boo else (1 + 0.35 * np.minimum(tt, 0.4))
        ph = 2 * np.pi * np.cumsum(f0 * vib * glide) / SR
        v = sum(np.sin(k * ph) / k for k in range(1, 6)) * env(ln, 0.08, 0.5)
        e = min(n, st + ln)
        x[st:e] += v[: e - st]
    x += 0.5 * lowpass(rng.standard_normal(n), 1800)
    return lowpass(x, 2500 if not boo else 1200) * env(n, 0.15, 0.9)


save(os.path.join(OUT, 'sfx', 'whoosh.wav'), whoosh(), 0.7)
save(os.path.join(OUT, 'sfx', 'pop.wav'), pop(), 0.7)
save(os.path.join(OUT, 'sfx', 'tick.wav'), tick(), 0.5)
save(os.path.join(OUT, 'sfx', 'ding.wav'), ding(), 0.6)
save(os.path.join(OUT, 'sfx', 'foule.wav'), foule(False), 0.7)
save(os.path.join(OUT, 'sfx', 'huees.wav'), foule(True), 0.7)

# ---------------------------------------------------------------- Musique
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731


def pluck(freq, dur, bright=0.5):
    """Karplus-Strong (cordes pincées)."""
    n = int(SR * dur)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.994 + 0.004 * bright)
    return out


def marimba(freq, dur):
    tt = t(dur)
    return (np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * freq * 4 * tt) * np.exp(-tt * 18)) * np.exp(-tt * 5)


def pad(freqs, dur):
    tt = t(dur)
    x = sum(np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.3 * tt)) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tt) for f in freqs)
    return x * env(len(tt), 0.6, 0.8)


def song(minor=False):
    # ré majeur : I - V - vi - IV  |  version tension : i - VI - III - VII (ré mineur)
    if not minor:
        chords = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]
        scale = [74, 76, 78, 79, 81, 83, 85, 86]
    else:
        chords = [[62, 65, 69], [58, 62, 65], [53, 57, 60], [60, 64, 67]]
        scale = [74, 76, 77, 79, 81, 82, 84, 86]
    bars = 16
    total = bars * BAR + 2
    mix = np.zeros(int(SR * total))

    def add(x, at, gain):
        s = int(at * SR)
        e = min(len(mix), s + len(x))
        mix[s:e] += x[: e - s] * gain

    melody_rng = np.random.default_rng(7 if not minor else 9)
    for b in range(bars):
        ch = chords[b % 4]
        t0 = b * BAR
        add(pad([NOTE(m - 12) for m in ch], BAR + 0.6), t0, 0.10 if not minor else 0.14)
        add(pluck(NOTE(ch[0] - 24), BAR, 0.2), t0, 0.35)  # basse
        # arpège en croches
        for k in range(8):
            m = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12 * (k % 4 == 3)
            add(pluck(NOTE(m), BEAT * 1.5, 0.7), t0 + k * BEAT / 2, 0.16)
        # mélodie de marimba (une phrase par mesure, plus présente sur la 2e moitié)
        if b >= 4:
            steps = melody_rng.choice([0, 1, 2, 3], size=4, p=[0.3, 0.3, 0.25, 0.15])
            idx = [scale.index(min(scale, key=lambda s: abs(s - (ch[0] + 12))))]
            for st in steps[1:]:
                idx.append(int(np.clip(idx[-1] + melody_rng.choice([-1, 1]) * st, 0, len(scale) - 1)))
            for k, ii in enumerate(idx):
                add(marimba(NOTE(scale[ii]), BEAT * 1.2), t0 + k * BEAT, 0.22 if not minor else 0.16)
        # percussion douce : shaker sur les contretemps
        for k in range(4):
            sh = rng.standard_normal(int(0.06 * SR)) * np.exp(-np.arange(int(0.06 * SR)) / SR * 60)
            add(lowpass(sh, 6000) - lowpass(sh, 1500), t0 + k * BEAT + BEAT / 2, 0.08)
    # petite réverb (échos amortis) pour l'ambiance
    out = mix.copy()
    for dl, g in [(0.083, 0.25), (0.137, 0.18), (0.211, 0.12), (0.293, 0.08)]:
        s = int(dl * SR)
        out[s:] += mix[:-s] * g
    left = out
    right = np.concatenate([np.zeros(int(0.012 * SR)), out[: -int(0.012 * SR)]])
    st = np.stack([left, right], axis=1)
    loop = st[: int(bars * BAR * SR)]
    # deux boucles (> 76 s) avec fondu final
    full = np.concatenate([loop, loop])
    fade = int(2.5 * SR)
    full[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return full


save(os.path.join(OUT, 'musique-cozy.wav'), song(False), 0.8)
save(os.path.join(OUT, 'musique-tension.wav'), song(True), 0.8)
print('SFX + musiques générés dans public/audio/')
