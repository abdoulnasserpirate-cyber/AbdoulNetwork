"""Royalty-free trap-pop bed composed in code (105 BPM, A minor), deterministic."""
import numpy as np, wave, sys
SR = 44100; BPM = 105; BEAT = 60 / BPM; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 67.5
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); 
    if i >= N: return
    sig = sig[: N - i] * g
    L[i:i + len(sig)] += sig * (1 - max(0, pan)); R[i:i + len(sig)] += sig * (1 + min(0, pan))
def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.18) * 0.95 + rng.standard_normal(n) * env(n, 0.0005, 0.004) * 0.25
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def clap():
    n = int(0.3 * SR); nz = rng.standard_normal(n)
    hp = nz - lp(nz, 0.25)
    e = env(n, 0.001, 0.09)
    for k in (0.01, 0.02): e += np.roll(env(n, 0.001, 0.01), int(k * SR)) * 0.6
    return hp * e * 0.35
HAT = (lambda n: (lambda nz: (nz - lp(nz, 0.6)) * env(n, 0.0005, 0.025) * 0.18)(rng.standard_normal(n)))(int(0.08 * SR))
OHAT = (lambda n: (lambda nz: (nz - lp(nz, 0.55)) * env(n, 0.001, 0.12) * 0.1)(rng.standard_normal(n)))(int(0.3 * SR))
def note(f): return 440 * 2 ** ((f - 69) / 12)
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = note(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.tanh(3 * np.sin(2 * np.pi * f * t))
    return s * np.minimum(1, t / 0.005) * np.exp(-t / (dur * 0.9)) * 0.42
def pluck(m, dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR; f = note(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (6 + 4 * k)) for k in range(1, 7))
    return s * np.minimum(1, t / 0.002) * 0.16
def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08):
            ph = 2 * np.pi * note(m + det) * t; s += (2 * ((ph / (2 * np.pi)) % 1) - 1)
    s = lp(s, 0.06); a = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)
    return s * a * 0.022
# chords Am F C G  (roots / triads)
CH = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]
ARP = [[69, 72, 76, 72], [69, 72, 77, 72], [67, 72, 76, 72], [67, 71, 74, 71]]
bar = 4 * BEAT; nbars = int(DUR / bar) + 1
DROP = 42.65; END = DUR - 2.2
for b in range(nbars):
    t0 = b * bar
    if t0 > END: break
    root, tri = CH[b % 4]
    intro = t0 < 2 * bar
    breakdown = DROP - 2 * bar <= t0 < DROP  # tension before reveal
    add(pad(tri, bar), t0)
    for s in range(8):  # arp 8ths
        if intro and s % 2: continue
        add(pluck(ARP[b % 4][s % 4] + (12 if s >= 4 and b % 2 else 0)), t0 + s * BEAT / 2, pan=0.3 if s % 2 else -0.3)
    if intro: continue
    kp = [0, 1.5, 2.5] if b % 2 == 0 else [0, 1.75, 2.5, 3.25]
    if not breakdown:
        for k in kp: add(kick(), t0 + k * BEAT, g=0.9)
        add(bass(root - 12 + 24, BEAT * 1.5), t0); add(bass(root - 12 + 24, BEAT), t0 + 1.5 * BEAT)
        add(bass(root - 12 + 24, BEAT * 1.4), t0 + 2.5 * BEAT)
    for c in (1, 3): add(clap(), t0 + c * BEAT, g=0.8 if breakdown else 1.0)
    roll = b % 4 == 3
    for h in range(16 if not roll else 12):
        tt = t0 + h * BEAT / 4
        add(HAT, tt, pan=0.2, g=1.0 if h % 2 == 0 else 0.55)
    if roll:
        for h in range(8): add(HAT, t0 + 3 * BEAT + h * BEAT / 8, pan=-0.2, g=0.5 + h * 0.06)
    add(OHAT, t0 + 3.5 * BEAT, pan=-0.25)
# riser into the drop + impact
n = int(2.4 * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n)
add((nz - lp(nz, 0.15)) * (t / 2.4) ** 2 * 0.18, DROP - 2.4)
add(kick() * 1.2, DROP); add(kick(), 0.0, g=0.8)
mix = np.stack([L, R], 1)
# master fade-in/out
fi = np.minimum(1, np.arange(N) / (0.6 * SR)); fo = np.clip((DUR - 0.2 - np.arange(N) / SR) / 2.0, 0, 1)
mix *= (fi * fo)[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2) * 0.8
out = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("ok", DUR)
