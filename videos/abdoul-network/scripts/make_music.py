"""Compose la musique de fond (électro / tech énergique, 122 BPM, La mineur).

Synthèse 100 % procédurale (aucun sample externe) -> public/musique.mp3.
Les sections suivent le découpage de la voix off :
  0.0  impact (silence musical, la voix dit « Stop ! »)
  1.3  groove : kick + basse + pad
  13.5 services : arpèges 16e ajoutés
  25.2 résultats : montée, pad plus brillant
  31.3 appel à l'action : plein régime
  38.0 fin : accord tenu + queue de réverb
Usage : python3 scripts/make_music.py [durée_s]
"""
import os
import subprocess
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
BPM = 122
BEAT = 60 / BPM
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 39.2
N = int(SR * DUR)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
rng = np.random.default_rng(3)

GROOVE, ARP, LIFT, CTA, END = 1.33, 13.48, 25.19, 31.33, 38.0

# Am - F - C - G (une mesure chacun)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BASS = [45, 41, 48, 43]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune) if detune else (0,):
        ph = (t * freq * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / (3 if detune else 1)


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def env(n, a=0.005, r=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    if r:
        e *= np.exp(-t / r)
    return e


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * np.sin(ph) * np.exp(-t * 7.5))


def clap():
    n = int(0.25 * SR)
    x = rng.standard_normal(n)
    x = hp(lp(x, 4500), 900)
    e = np.zeros(n)
    # trois micro-attaques successives : la texture typique d'un clap
    for k in (0, 0.011, 0.022):
        off = int(k * SR)
        e[off:] += env(n - off, 0.001, 0.012 if k < 0.02 else 0.09)
    return x * e


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    x = hp(rng.standard_normal(n), 7500, 4)
    return x * env(n, 0.001, 0.06 if open_ else 0.012)


def pluck(m, dur):
    n = int(dur * SR)
    x = saw(hz(m), n, 0.004) * 0.6 + np.sign(np.sin(2 * np.pi * hz(m + 12) * np.arange(n) / SR)) * 0.25
    return lp(x, 3800) * env(n, 0.002, 0.09)


def main():
    L = np.zeros(N)
    R = np.zeros(N)
    drums = np.zeros(N)
    bass = np.zeros(N)
    pad = np.zeros(N)
    arp_l = np.zeros(N)
    arp_r = np.zeros(N)
    pump = np.ones(N)

    K, C, H, HO = kick(), clap(), hat(), hat(True)
    beats = np.arange(GROOVE, END, BEAT)
    for bi, b in enumerate(beats):
        bar_beat = bi % 4
        place(drums, K * 0.95, b)
        # pompe « sidechain » : le pad et la basse s'effacent sous le kick
        i = int(b * SR)
        n = int(BEAT * SR)
        seg = 1 - 0.75 * np.exp(-np.arange(n) / SR / 0.09)
        pump[i:i + n] = seg[: max(0, min(n, N - i))]
        if bar_beat in (1, 3):
            place(drums, C * 0.45, b)
        place(drums, (HO if b >= LIFT else H) * 0.22, b + BEAT / 2)
        if b >= ARP:
            place(drums, H * 0.1, b + BEAT / 4)
            place(drums, H * 0.1, b + 3 * BEAT / 4)

    bar = 4 * BEAT
    t0 = GROOVE
    k = 0
    while t0 < END + bar:
        ci = k % 4
        # Basse : croches en contretemps, filtre qui s'ouvre aux résultats
        for e in range(8):
            at = t0 + e * BEAT / 2
            if at >= END:
                break
            n = int(BEAT / 2 * SR * 0.9)
            m = BASS[ci] + (12 if e % 4 == 3 else 0)
            cut = 900 if at < LIFT else 1600
            note = lp(saw(hz(m), n, 0.003), cut) * env(n, 0.004, 0.16)
            place(bass, note * 0.55, at)
        # Pad : accord tenu, saw désaccordées filtrées
        n = int(bar * SR)
        chord = sum(saw(hz(m), n, 0.006) for m in CHORDS[ci])
        bright = 2600 if t0 >= LIFT else 1500
        chord = lp(chord, bright) * env(n, 0.08)
        if t0 < END:
            place(pad, chord * 0.22, t0)
        # Arpège 16e
        if t0 >= ARP - 0.01 and t0 < END:
            notes = CHORDS[ci] + [CHORDS[ci][0] + 12]
            for s in range(16):
                at = t0 + s * BEAT / 4
                if at >= END:
                    break
                m = notes[[0, 1, 2, 3, 2, 1, 3, 2][s % 8]] + 12
                p = pluck(m, BEAT / 4 * 1.6) * (0.16 if at < LIFT else 0.21)
                place(arp_l if s % 2 == 0 else arp_r, p, at)
                place(arp_r if s % 2 == 0 else arp_l, p * 0.35, at + BEAT * 0.75)  # écho ping-pong
        t0 += bar
        k += 1

    # Riser avant l'appel à l'action
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    riser = hp(rng.standard_normal(n), 1200) * (t / 2.0) ** 2 * 0.25
    place(pad, riser, CTA - 2.0)

    # Accord final tenu
    n = int((DUR - END) * SR)
    if n > 0:
        fin = sum(saw(hz(m), n, 0.006) for m in CHORDS[0] + [45]) * 0.25
        fin = lp(fin, 2200) * np.exp(-np.arange(n) / SR / 0.6)
        place(pad, fin, END)

    # Impact d'ouverture : nappe grave sous le « Stop ! »
    n = int(1.3 * SR)
    sub = np.sin(2 * np.pi * 55 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.5) * 0.5
    place(bass, sub, 0)

    pad *= pump
    bass[int(GROOVE * SR):] *= pump[int(GROOVE * SR):]
    pad_r = np.roll(pad, int(0.012 * SR))  # léger élargissement stéréo
    L = drums + bass + pad + arp_l
    R = drums + bass + pad_r + arp_r
    # Fondu de sortie
    fade = int(0.8 * SR)
    for ch in (L, R):
        ch[-fade:] *= np.linspace(1, 0, fade)
    st = np.stack([L, R], axis=1)
    st = np.tanh(st / np.max(np.abs(st)) * 1.4) * 0.89

    os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
    wav_path = os.path.join(ROOT, ".music.wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    out = os.path.join(ROOT, "public", "musique.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-b:a", "192k", out], check=True)
    os.remove(wav_path)
    print("musique ->", out)


if __name__ == "__main__":
    main()
