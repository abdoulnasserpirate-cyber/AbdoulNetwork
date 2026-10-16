"""Original score + sound design + final mix (all synthesised here: no third-party audio, no rights issues).

Score: cinematic pads, an oud-like plucked line in D Hijaz (nod to Algeria / the Mediterranean),
a soft bendir pulse in the story, a warmer D-minor / D-major arc for "why this story matters".
SFX: whoosh / hit / boom / tick / brush / page / click / shimmer / swell, cued from timeline.SHOTS.
Mix: music ducked under the voice (sidechain), voice ~22 dB above the bed, loudnorm 2-pass -14 LUFS / -1 dBTP.

Usage: python3 scripts/make_audio.py   ->  assets/audio/mix.wav (+ work/audio/music.wav, sfx.wav)
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from timeline import DURATION, SHOTS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
N = int(DURATION * SR)
rng = np.random.default_rng(1947)
t_all = np.arange(N) / SR


def hz(note):
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7,
             "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l, x * r], 1)
    buf[i:i + len(x)] += x * gain


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    # one-pole via cumulative trick per block (vectorised IIR approximation through FFT)
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** 4)  # 2nd-order-ish magnitude response, zero phase
    y = np.fft.irfft(X * (H[:, None] if x.ndim == 2 else H), n=len(x), axis=0)
    return y


def bandpass_noise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, n)


# ---------------- instruments ----------------
def pad(freqs, dur, att=1.6, rel=1.8, bright=1.0):
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, f in enumerate(freqs):
        for d, pan in ((-4, -0.6), (0, 0.0), (4, 0.6)):  # cents detune, spread
            ff = f * 2 ** (d / 1200)
            w = np.zeros(n)
            for h in range(1, 7):
                w += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h ** (1.9 - 0.4 * bright)
            lfo = 1 + 0.08 * np.sin(2 * np.pi * (0.11 + 0.03 * k) * t + k)
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            out[:, 0] += w * lfo * l
            out[:, 1] += w * lfo * r
    env = np.minimum(1, t / att) * np.clip((dur + rel - t) / rel, 0, 1)
    return out * env[:, None] / (len(freqs) * 6)


def pluck(f, dur=1.6, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for h in range(1, 14):
        inh = h * (1 + 0.0007 * h * h)  # slight string inharmonicity
        a = (1 / h ** 1.1) * (1 + 0.6 * np.sin(h * 1.3))  # pick position colour
        x += a * np.sin(2 * np.pi * f * inh * t) * np.exp(-t * (2.2 + 0.9 * h / bright))
    x += bandpass_noise(n, 1500, 6000) * np.exp(-t * 90) * 0.15  # pick transient
    body = np.exp(-t * 6) * np.sin(2 * np.pi * 110 * t) * 0.05     # wooden body knock
    return (x + body) * 0.22


def bendir(kind):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    if kind == "doum":
        f = 55 + 25 * np.exp(-t * 18)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
        x += bandpass_noise(n, 250, 1400) * np.exp(-t * 14) * 0.25  # snare buzz of the bendir
        return x * 0.6
    x = bandpass_noise(n, 1800, 7000) * np.exp(-t * 45)
    return x * 0.35


def reverb(x, seconds=2.6, mix=0.32):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-t * 6.9 / seconds)[:, None]
    ir = lowpass(ir, 5500)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0))
    m = len(x) + n
    nfft = 1 << (m - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, nfft, axis=0) * np.fft.rfft(ir, nfft, axis=0), nfft, axis=0)[: len(x)]
    return x * (1 - mix) + wet * mix * 1.6


# ---------------- score ----------------
def score():
    mus = np.zeros((N, 2))
    bar = 60 / 84 * 4  # 84 BPM
    # Title: drone + shimmer
    place(mus, pad([hz("D2"), hz("A2"), hz("D3")], 3.2, att=1.2, rel=1.5), 0.0, 1.3)
    # Intro (EN): D - Cm - D - Gm (Hijaz colours), slow
    prog_a = [["D3", "F#3", "A3"], ["C3", "Eb3", "G3"], ["D3", "F#3", "A3"], ["G2", "Bb2", "D3"]]
    t = 2.5
    i = 0
    while t < 18.9:
        place(mus, pad([hz(n) for n in prog_a[i % 4]] + [hz("D2")], bar * 1.5), t, 0.9)
        t += bar * 1.5
        i += 1
    # Story: D Eb D Cm D Gm Eb D ; bendir from 21.45 ; break at 1947
    prog_b = [["D3", "F#3", "A3"], ["Eb3", "G3", "Bb3"], ["D3", "F#3", "A3"], ["C3", "Eb3", "G3"],
              ["D3", "F#3", "A3"], ["G2", "Bb2", "D3"], ["Eb3", "G3", "Bb3"], ["D3", "F#3", "A3"]]
    t = 18.95
    i = 0
    while t < 48.6:
        if 40.5 <= t < 44.4:
            t = 44.45
            continue
        place(mus, pad([hz(n) for n in prog_b[i % 8]] + [hz("D2")], bar, bright=1.2), t, 1.0)
        t += bar
        i += 1
    # 1947: big sustained chord
    place(mus, pad([hz("D2"), hz("A2"), hz("D3"), hz("F#3"), hz("A3"), hz("D4")], 3.9, att=0.4, rel=2.0, bright=1.4), 40.6, 1.5)
    # bendir pattern
    beat = 60 / 84
    t = 21.45
    while t < 48.4:
        if not (40.5 <= t < 44.4):
            place(mus, bendir("doum"), t, 0.55, -0.1)
            place(mus, bendir("tek"), t + beat * 1.5, 0.35, 0.3)
            place(mus, bendir("tek"), t + beat * 2, 0.3, 0.3)
            place(mus, bendir("doum"), t + beat * 2.5, 0.4, -0.1)
            place(mus, bendir("tek"), t + beat * 3.5, 0.25, 0.3)
        t += bar
    # oud line in D Hijaz (sparse phrases)
    phrases = [["D4", "Eb4", "F#4", "G4", "F#4", "Eb4", "D4"], ["A3", "Bb3", "A3", "G3", "F#3", "G3", "A3"],
               ["G4", "F#4", "Eb4", "F#4", "D4"], ["D4", "C4", "Bb3", "A3", "Bb3", "A3"]]
    t, k = 3.2, 0
    while t < 48.0:
        if 40.4 <= t < 44.6:
            t = 44.6
        ph = phrases[k % len(phrases)]
        for j, n in enumerate(ph):
            dt = 0.32 if j < len(ph) - 1 else 0.6
            place(mus, pluck(hz(n), 1.8), t, 0.75 if t > 18.9 else 0.55, 0.25 * np.sin(j))
            t += dt * (1.2 if t < 18.9 else 1.0)
        t += 2.4 if t < 18.9 else 1.6
        k += 1
    # Chapter riser handled as SFX; Why section: Dm Bb F C, harp-like arpeggios
    prog_c = [["D3", "F3", "A3"], ["Bb2", "D3", "F3"], ["F3", "A3", "C4"], ["C3", "E3", "G3"]]
    t, i = 50.0, 0
    while t < 83.4:
        ch = prog_c[i % 4]
        place(mus, pad([hz(n) for n in ch] + [hz(ch[0][:-1] + "2")], bar * 1.25, bright=0.8), t, 0.85)
        for j in range(8):  # arpeggio
            n = ch[j % 3][:-1] + str(int(ch[j % 3][-1]) + 1 + (j // 3) % 2)
            place(mus, pluck(hz(n), 1.4, bright=1.6), t + j * bar * 1.25 / 8, 0.32, 0.5 * np.sin(j))
        t += bar * 1.25
        i += 1
    # soft pulse from "L'amour c'est aussi" (64) to 83
    t = 64.0
    while t < 83.2:
        place(mus, bendir("doum"), t, 0.28, 0)
        t += beat * 2
    # Heritage swell 83.5 -> resolution D major at 87 -> outro
    place(mus, pad([hz("Bb2"), hz("D3"), hz("F3"), hz("Bb3")], 1.8, att=0.8, rel=0.9, bright=1.3), 83.5, 1.4)
    place(mus, pad([hz("C3"), hz("E3"), hz("G3"), hz("C4")], 1.9, att=0.6, rel=1.0, bright=1.3), 85.3, 1.4)
    place(mus, pad([hz("D2"), hz("A2"), hz("D3"), hz("F#3"), hz("A3"), hz("D4")], 3.6, att=0.5, rel=2.2, bright=1.2), 87.0, 1.5)
    for j, n in enumerate(["D4", "F#4", "A4", "D5"]):
        place(mus, pluck(hz(n), 2.5, bright=1.4), 87.1 + j * 0.28, 0.5, -0.3 + 0.2 * j)
    mus = reverb(mus, 2.8, 0.38)
    # master envelope: fade in 0-0.8 s, fade out to black at the end
    env = np.minimum(1, t_all / 0.8) * np.clip((DURATION - 0.25 - t_all) / 2.6, 0, 1)
    return mus * env[:, None]


# ---------------- sound design ----------------
def sfx_bank(name):
    if name == "whoosh":
        n = int(0.7 * SR)
        t = np.arange(n) / SR
        x = rng.standard_normal(n)
        out = np.zeros(n)
        for c0 in (400, 900, 1800, 3200):  # moving band = sweep
            X = np.fft.rfft(x)
            f = np.fft.rfftfreq(n, 1 / SR)
            X *= np.exp(-((np.log(f + 1) - np.log(c0)) ** 2) / 0.5)
            out += np.fft.irfft(X, n) * np.exp(-((t - 0.12 * np.log2(c0 / 400) * 1.1 - 0.15) ** 2) / 0.02)
        out *= np.sin(np.pi * t / 0.7) ** 2
        return out / np.max(np.abs(out)) * 0.5, 0.35  # (signal, peak offset)
    if name in ("hit", "boom"):
        n = int((2.4 if name == "boom" else 1.4) * SR)
        t = np.arange(n) / SR
        f0 = 42 if name == "boom" else 58
        f = f0 + 40 * np.exp(-t * 12)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.6 if name == "boom" else 3.2))
        x += bandpass_noise(n, 80, 2500) * np.exp(-t * 22) * 0.35
        return x / np.max(np.abs(x)) * 0.8, 0.0
    if name == "tick":
        n = int(0.09 * SR)
        t = np.arange(n) / SR
        x = bandpass_noise(n, 1800, 6500) * np.exp(-t * 70)
        x += np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 60) * 0.3
        return x / np.max(np.abs(x)) * 0.25, 0.0
    if name == "brush":
        n = int(0.55 * SR)
        t = np.arange(n) / SR
        x = bandpass_noise(n, 2200, 7500) * (np.sin(np.pi * t / 0.55) ** 1.5)
        x *= 1 + 0.5 * np.sin(2 * np.pi * 23 * t)  # bristle grain
        return x / np.max(np.abs(x)) * 0.22, 0.1
    if name == "page":
        n = int(0.32 * SR)
        t = np.arange(n) / SR
        x = bandpass_noise(n, 900, 8000) * np.exp(-((t - 0.12) ** 2) / 0.004) * (1 + np.sign(np.sin(2 * np.pi * 37 * t)) * 0.4)
        return x / np.max(np.abs(x)) * 0.25, 0.1
    if name == "click":
        n = int(0.16 * SR)
        t = np.arange(n) / SR
        x = bandpass_noise(n, 1500, 9000) * (np.exp(-t * 160) + 0.7 * np.exp(-np.abs(t - 0.07) * 200))
        return x / np.max(np.abs(x)) * 0.3, 0.0
    if name == "shimmer":
        n = int(2.4 * SR)
        t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * hz(m) * t + i) for i, m in enumerate(["D6", "F#6", "A6", "D7", "E6"]))
        x *= np.minimum(1, t / 0.6) * np.exp(-t * 1.2) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t))
        return x / np.max(np.abs(x)) * 0.12, 0.2
    if name == "swell":
        n = int(1.6 * SR)
        t = np.arange(n) / SR
        x = bandpass_noise(n, 2000, 12000) * (t / 1.6) ** 3
        return x / np.max(np.abs(x)) * 0.25, 1.55
    raise KeyError(name)


def sound_design():
    sfx = np.zeros((N, 2))
    for i, s in enumerate(SHOTS):
        for name in s.get("sfx", []):
            x, peak = sfx_bank(name)
            at = s["start"] - peak
            pan = (-0.4 if i % 2 else 0.4) if name in ("whoosh", "tick") else 0.0
            place(sfx, x, max(0.0, at), 1.0, pan)
    # tie the 1947 counter end and the "16 ans" beat
    x, _ = sfx_bank("hit")
    place(sfx, x * 0.6, 43.75)
    return reverb(sfx, 1.6, 0.22)


def envelope(v, attack=0.03, release=0.45):
    a = np.abs(v).mean(1) if v.ndim == 2 else np.abs(v)
    hop = 480
    rms = np.sqrt(np.convolve(a[: len(a) // hop * hop].reshape(-1, hop).mean(1) ** 2, np.ones(3) / 3, "same"))
    out = np.zeros_like(rms)
    ca, cr = np.exp(-hop / SR / attack), np.exp(-hop / SR / release)
    for i, x in enumerate(rms):
        prev = out[i - 1] if i else 0
        out[i] = ca * prev + (1 - ca) * x if x > prev else cr * prev + (1 - cr) * x
    return np.interp(np.arange(len(a)), np.arange(len(out)) * hop, out)


def main():
    out = ROOT / "work/audio"
    voice, sr = sf.read(out / "voice.wav")
    assert sr == SR
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
    music = score()
    sfx = sound_design()
    sf.write(out / "music_raw.wav", music / np.max(np.abs(music)) * 0.8, SR)
    # levels: voice stem is -16 LUFS. Bed sits ~22 dB under the voice while she speaks,
    # and rises ~15 dB when she doesn't (title, chapter card, outro).
    m_rms = np.sqrt(np.mean(music ** 2))
    v_rms = np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2))
    base = v_rms / m_rms * 10 ** (-7 / 20)
    env = envelope(voice, attack=0.05, release=1.3)
    act = np.clip(env / (np.percentile(env[env > 1e-4], 60) * 0.5), 0, 1)
    # explicit lift on the voiceless windows (title, chapter card, outro), 0.25 s ramps
    lift = np.zeros(N)
    for a, b in ((0.0, 2.6), (48.62, 50.15), (88.5, DURATION)):
        lift = np.maximum(lift, np.clip(np.minimum(t_all - a, b - t_all) / 0.25 + 1, 0, 1))
    act = act * (1 - lift)
    duck_db = -15.0 * act
    gain = base * 10 ** (duck_db / 20)
    mus = music * gain[:, None]
    fx = sfx * (v_rms / np.sqrt(np.mean(sfx[np.abs(sfx).max(1) > 1e-3] ** 2)) * 10 ** (-17 / 20))
    mix = np.stack([voice, voice], 1) + mus + fx
    sf.write(out / "music.wav", mus, SR)
    sf.write(out / "sfx.wav", fx, SR)
    sf.write(out / "mix_pre.wav", mix / max(1, np.max(np.abs(mix))) * 0.95, SR)
    # loudnorm 2-pass: -14 LUFS integrated, -1 dBTP
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out / "mix_pre.wav"), "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):])
    flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
           f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
           f"alimiter=limit=0.89:level=false")
    (ROOT / "assets/audio").mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out / "mix_pre.wav"), "-af", flt, "-ar", "48000",
                    "-c:a", "pcm_s16le", str(ROOT / "assets/audio/mix.wav")], check=True)
    print("mix ok")


if __name__ == "__main__":
    main()
