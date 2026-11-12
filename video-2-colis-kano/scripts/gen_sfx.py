"""Bruitages synthétisés (déterministes, libres de droits) pour la vidéo colis."""
import numpy as np, wave, os
SR = 48000; rng = np.random.default_rng(7); OUT = 'assets/sfx'
def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    st = np.stack([x, x], 1); d = (st * 32767).astype(np.int16)
    with wave.open(f'{OUT}/{name}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
def t(d): return np.arange(int(SR * d)) / SR
def env(n, a, r):  # attack / release (s)
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** 2; return e
def lp(x, k):  # moyenne glissante = passe-bas simple
    return np.convolve(x, np.ones(k) / k, 'same')
# whoosh doux : bruit filtré avec balayage
n = t(0.9); nz = rng.standard_normal(len(n)); sweep = np.sin(np.pi * n / 0.9) ** 2
w = lp(nz, 40) * 0.6 + (nz - lp(nz, 6)) * 0.15 * sweep
save('whoosh', w * sweep, 0.55)
# pop
n = t(0.14); f = 900 * np.exp(-n * 30) + 300
save('pop', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-n * 38), 0.6)
# bip de validation (deux notes montantes)
def tone(fr, d, dec=10): n = t(d); return (np.sin(2*np.pi*fr*n) + 0.3*np.sin(4*np.pi*fr*n)) * np.exp(-n*dec) * env(len(n), 0.004, 0.03)
save('bip', np.concatenate([tone(1320, 0.09, 18), tone(1760, 0.22, 14)]), 0.45)
# notification message (marimba douce)
def mar(fr, d): n = t(d); return (np.sin(2*np.pi*fr*n) + 0.5*np.sin(2*np.pi*fr*4*n)*np.exp(-n*40)) * np.exp(-n*9) * env(len(n), 0.002, 0.05)
a = mar(1046.5, 0.18); b = mar(1568, 0.45)
save('notif', np.concatenate([a, b]), 0.5)
# ruban adhésif : craquements granuleux + bruit, durée 0.7 s
n = t(0.7); g = rng.standard_normal(len(n)) * (rng.random(len(n)) < 0.08)
crk = (g - lp(g, 4)) * 1.0 + (rng.standard_normal(len(n)) - lp(rng.standard_normal(len(n)), 3)) * 0.25
save('ruban', crk * env(len(n), 0.02, 0.15) * (0.6 + 0.4 * np.sin(np.pi * n / 0.7)), 0.5)
# impression facture : petits ticks réguliers
n = t(0.8); tk = np.zeros(len(n))
for k in range(0, len(n), int(SR * 0.045)): tk[k:k+200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 40)
save('impression', tk * env(len(n), 0.01, 0.2), 0.35)
# swish pour flip de carte
n = t(0.35); nz = rng.standard_normal(len(n)); s = np.sin(np.pi * n / 0.35) ** 3
save('flip', (lp(nz, 6) * 0.8 + (nz - lp(nz, 3)) * 0.4) * s, 0.6)
# impact doux final (sub + air)
n = t(1.2); save('impact', (np.sin(2*np.pi*55*n) * np.exp(-n*4) + lp(rng.standard_normal(len(n)), 30) * np.exp(-n*6) * 0.5), 0.7)
print(sorted(os.listdir(OUT)))
