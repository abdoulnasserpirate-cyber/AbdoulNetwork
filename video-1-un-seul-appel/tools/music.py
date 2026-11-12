"""Fond musical afro-house 122 BPM synthétisé pour « Un seul appel » (libre de droits : 100 % généré ici).
La grille est calée pour qu'un temps fort tombe pile sur « Allô » (t = 11.94 s dans le film).
Usage : python3 music.py sortie.wav [ring.wav]"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 37.5
BPM = 122.0
BEAT = 60.0 / BPM
DROP = 11.94                      # « Allô » (voix décalée de 0.9 s)
G0 = DROP - 24 * BEAT             # origine de la grille (temps n = 0)
rng = np.random.default_rng(7)    # déterministe

N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)

def bt(n):           # temps du temps n (jamais cumulé → pas de dérive)
    return G0 + n * BEAT

def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'hp', fs=SR, output='sos'), x)

def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'lp', fs=SR, output='sos'), x)

def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], 'bp', fs=SR, output='sos'), x)

def put(sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    j0 = max(0, -i); i = max(0, i)
    s = sig[j0:j0 + (N - i)]
    l = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:i + len(s)] += s * l; R[i:i + len(s)] += s * r

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

# ---------- instruments ----------
def kick(soft=False):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.22 if not soft else 0.16))
    click = hp(rng.standard_normal(n) * np.exp(-t / 0.004), 2000) * 0.25
    s = np.tanh((s + click) * 1.6) * 0.9
    return lp(s, 900) if soft else s

def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    e = sum(np.exp(-np.maximum(t - k * 0.011, 0) / 0.006) * (t >= k * 0.011) for k in range(3))
    e = e + 0.6 * np.exp(-t / 0.09)
    return bp(rng.standard_normal(n), 900, 5200) * e * 0.55

def shaker(acc=1.0):
    n = int(0.09 * SR); t = np.arange(n) / SR
    e = np.minimum(1, t / 0.012) * np.exp(-t / 0.03)
    return hp(rng.standard_normal(n), 6500) * e * 0.22 * acc

def openhat():
    n = int(0.22 * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t / 0.07) * 0.28

def conga(freq, slap=False):
    n = int(0.3 * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.25 * np.exp(-t / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.09 if slap else 0.16))
    if slap:
        s += bp(rng.standard_normal(n), 1500, 6000) * np.exp(-t / 0.01) * 0.4
    return s * 0.45

def logdrum(freq, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-t / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s += 0.35 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR) * np.exp(-t / 0.08)
    s = np.tanh(s * 2.2) * np.exp(-t / (dur * 0.5)) * np.minimum(1, t / 0.004)
    return lp(s, 1800) * 0.55

def chord(freqs, dur, bright=2600.0, attack=0.006, decay=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * 2 ** (det / 12)
            # dent de scie douce (somme d'harmoniques)
            s += sum(np.sin(2 * np.pi * ff * k * t + ph * k) / k for k in range(1, 7))
    s *= np.minimum(1, t / attack) * np.exp(-t / decay)
    return lp(s, bright) * 0.05

def pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.08, 0.07):
            s += np.sin(2 * np.pi * f * 2 ** (det / 12) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    e = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4).clip(0)
    return lp(s * e, 1400) * 0.03

def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out = np.zeros(n); seg = 2048
    for k in range(0, n, seg):              # balayage passe-haut montant
        fc = 300 + (t[k] / dur) ** 2 * 9000
        out[k:k + seg] = bp(x[k:k + seg], fc, min(fc * 2.5, 20000))
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / dur)) / SR) * 0.15
    return (out * 0.5 + tone) * (t / dur) ** 1.6 * 0.6

def impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    f = 38 + 60 * np.exp(-t / 0.06)
    s = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 2) * np.exp(-t / 0.5)
    s += lp(rng.standard_normal(n), 3000) * np.exp(-t / 0.25) * 0.35
    return s * 0.8

# La mineur : Am7 – Fmaj7 – Cmaj7 – G
A1, C2, D2, E2, F1, G1 = 55.0, 65.41, 73.42, 82.41, 43.65, 49.0
PROG = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 261.6, 329.6, 392], [196, 246.9, 293.7, 392]]
ROOTS = [A1, F1 * 2, C2, G1 * 2]

def section(n):
    if n < 4: return 'intro'
    if n < 22: return 'groove'
    if n < 24: return 'break'
    if n < 56: return 'drop'
    if n < 64: return 'cta'
    if n < 74: return 'final'
    return 'tail'

LOG_PAT = [0, 0.75, 1.5, 2.5, 3.25]                 # syncopes log drum (en temps)
CONGA_PAT = [(0.5, 'lo'), (1.25, 'hi'), (1.75, 'hi'), (2.5, 'lo'), (3.0, 'slap'), (3.5, 'hi')]

for n in range(-2, 80):
    t = bt(n)
    if t > DUR: break
    sec = section(n)
    bar, beat_in_bar = divmod(n, 4)
    chord_i = (bar // 1) % 4
    if sec in ('intro',):
        put(kick(soft=True), t, 0.5)
        for k in range(4): put(shaker(0.6 if k % 2 else 1.0), t + k * BEAT / 4, 0.7, 0.3)
    if sec in ('groove', 'drop', 'final'):
        put(kick(), t, 0.95)
        if beat_in_bar in (1, 3): put(clap(), t, 0.8, -0.1)
        put(openhat(), t + BEAT / 2, 0.8, 0.2)
        for k in range(4):
            sw = 0.03 * BEAT if k % 2 else 0
            put(shaker(1.0 if k == 0 else 0.55), t + k * BEAT / 4 + sw, 0.8, 0.35)
        if beat_in_bar == 0:
            for off, kind in CONGA_PAT:
                f = {'lo': 190, 'hi': 280, 'slap': 300}[kind]
                put(conga(f, kind == 'slap'), t + off * BEAT, 0.5, -0.45 if kind == 'lo' else 0.45)
    if sec == 'cta':                                   # le tempo « respire » : demi-temps
        if beat_in_bar in (0, 2): put(kick(soft=True), t, 0.7)
        for k in (0, 2): put(shaker(0.7), t + k * BEAT / 4, 0.6, 0.35)
        if beat_in_bar == 3: put(clap(), t, 0.4)
    if sec in ('drop', 'final') and beat_in_bar == 0:
        for off in LOG_PAT:
            put(logdrum(ROOTS[chord_i] * (2 if off == 2.5 else 1), 0.42), t + off * BEAT, 0.75)
    if sec == 'cta' and beat_in_bar == 0:
        put(logdrum(ROOTS[chord_i], 0.6), t, 0.5)
    # accords : stabs à contretemps (groove, drop), nappe (intro, break, cta, tail)
    if sec in ('groove', 'drop', 'final'):
        for off in (0.5, 1.5, 2.75, 3.5) if beat_in_bar == 0 else ():
            put(chord(PROG[chord_i], 0.35, 3200 if sec != 'groove' else 2200), t + off * BEAT, 1.0, 0.0)
    if beat_in_bar == 0 and sec in ('intro', 'break', 'cta', 'tail', 'drop', 'final', 'groove'):
        put(pad(PROG[chord_i], 4 * BEAT + 0.3), t, 1.4 if sec in ('intro', 'break', 'cta', 'tail') else 0.6)

# transitions de structure
put(riser(bt(24) - bt(21.5)), bt(21.5), 0.9)          # montée vers le drop
put(impact(), DROP, 0.9)                               # drop sur « Allô »
put(riser(bt(64) - bt(62)), bt(62), 0.55)             # petite relance après le numéro
put(impact(), bt(72), 0.75)                            # logo final

mix = np.stack([L, R], 1)
# fondu de sortie sur la fin
fade = np.ones(N); fs = int(1.6 * SR); fade[-fs:] = np.linspace(1, 0, fs) ** 1.5
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())

# sonnerie stylisée (deux trilles)
if len(sys.argv) > 2:
    n = int(0.95 * SR); t = np.arange(n) / SR
    trill = (np.sin(2 * np.pi * 20 * t) > 0).astype(float)
    tone = np.sin(2 * np.pi * 1320 * t) * trill + np.sin(2 * np.pi * 1650 * t) * (1 - trill)
    gate = ((t % 0.48) < 0.36).astype(float)
    gate = lp(gate, 60)
    s = tone * gate * np.minimum(1, (0.95 - t) / 0.08).clip(0)
    s = lp(hp(s, 300), 6000) * 0.7
    st = np.stack([s, s], 1)
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', round(G0, 3), 'beat', round(BEAT, 4))
